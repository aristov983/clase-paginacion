import { myPool } from "../db/database.ts";
import {
	NotAuthorizedError,
	NotFoundError,
} from "../errors/response.errors.ts";

import type {
	ActualizarUsuarioType,
	CrearUsuarioType,
	Usuario,
	UsuariosOrdenarPor,
	UsuariosQuery,
} from "../schemas/usuarios.ts";

class UsuariosRepository {
	private readonly baseQuery = `
    SELECT * FROM usuarios U
  `;

	/**
	 * Columnas por las que se permite ordenar. Se usa un mapa fijo (y no el valor
	 * que llega por query) para que nunca se concatene texto del cliente en el SQL.
	 */
	private readonly columnasOrden: Record<UsuariosOrdenarPor, string> = {
		id_usuario: "U.id_usuario",
		username: "U.username",
		nombres: "U.nombres",
		apellidos: "U.apellidos",
		fecha_nacimiento: "U.fecha_nacimiento",
	};

	/**
	 * Arma el WHERE (con placeholders $1, $2...) y sus valores a partir de los
	 * filtros opcionales. Lo comparten el COUNT y la consulta de la página.
	 */
	private construirFiltros(filtros: UsuariosQuery) {
		const condiciones: string[] = [];
		const values: any[] = [];

		if (filtros.nombre) {
			values.push(`%${filtros.nombre}%`);
			condiciones.push(
				`(U.nombres || ' ' || U.apellidos) ILIKE $${values.length}`,
			);
		}
		if (filtros.grupo) {
			values.push(filtros.grupo);
			condiciones.push(`$${values.length} = ANY(U.grupos)`);
		}
		if (filtros.activo !== undefined) {
			values.push(filtros.activo);
			condiciones.push(`U.activo = $${values.length}`);
		}

		const where = condiciones.length ? ` WHERE ${condiciones.join(" AND ")}` : "";
		return { where, values };
	}

	async obtenerTotal(filtros: UsuariosQuery) {
		const { where, values } = this.construirFiltros(filtros);
		const query = `
      SELECT COUNT(*)::int as total FROM usuarios U
      ${where};
    `;
		const result = await myPool.query(query, values);
		return result.rows[0].total;
	}

	async obtenerTodos(): Promise<Usuario[]> {
		const query = `
      ${this.baseQuery}
      ORDER BY id_usuario ASC;
    `;
		const result = await myPool.query(query);
		return result.rows;
	}

	async obtenerPagina(query: UsuariosQuery): Promise<Usuario[]> {
		const { page, limit, orden, ordenar_por } = query;
		const offset = (page - 1) * limit;
		const { where, values } = this.construirFiltros(query);

		const columna = this.columnasOrden[ordenar_por ?? "id_usuario"];
		const direccion = orden === "desc" ? "DESC" : "ASC";

		// El id_usuario como desempate mantiene estable el orden entre páginas
		// cuando se ordena por un campo que puede repetirse (grupo, apellidos...)
		const sql = `
      ${this.baseQuery}
      ${where}
      ORDER BY ${columna} ${direccion}, U.id_usuario ASC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2};
    `;
		values.push(limit, offset);

		console.log({ query: sql, values });
		const result = await myPool.query(sql, values);
		return result.rows;
	}

	async obtenerPorId(idUsuario: number): Promise<Usuario> {
		const query = `
      ${this.baseQuery}
      WHERE id_usuario = $1;
    `;
		const result = await myPool.query(query, [idUsuario]);
		if (result.rowCount !== 1)
			throw new NotFoundError("Usuario no encontrado.");
		return result.rows[0];
	}

	async obtenerPorUsername(username: string): Promise<Usuario> {
		const query = `
      ${this.baseQuery}
      WHERE username = $1;
    `;
		const result = await myPool.query(query, [username]);
		if (result.rowCount !== 1)
			throw new NotFoundError("Usuario no encontrado.");
		return result.rows[0];
	}

	async crear(dto: CrearUsuarioType): Promise<Usuario> {
		await myPool.query("BEGIN");

		try {
			const queryUsuario = `
        INSERT INTO usuarios (username, nombres, apellidos, fecha_nacimiento, grupos)
        VALUES ($1, $2, $3, $4, COALESCE($5, ARRAY['user']::TEXT[]))
        RETURNING id_usuario;
      `;

			const queryCredenciales = `
        INSERT INTO credenciales (id_usuario, password_hash)
        VALUES ($1, crypt($2, gen_salt('bf')));
      `;

			const resultUsuario = await myPool.query(queryUsuario, [
				dto.username,
				dto.nombres,
				dto.apellidos,
				dto.fecha_nacimiento,
				dto.grupos,
			]);
			await myPool.query(queryCredenciales, [
				resultUsuario.rows[0].id_usuario,
				dto.password,
			]);
			await myPool.query("COMMIT");

			return this.obtenerPorId(resultUsuario.rows[0].id_usuario);
		} catch (error) {
			await myPool.query("ROLLBACK");
			throw error;
		}
	}

	async actualizar(
		idUsuario: number,
		dto: ActualizarUsuarioType,
	): Promise<Usuario> {
		const campos: string[] = [];
		const valores: any[] = [];
		let idx = 1;

		if (dto.nombres !== undefined) {
			campos.push(`nombres = $${idx++}`);
			valores.push(dto.nombres);
		}
		if (dto.apellidos !== undefined) {
			campos.push(`apellidos = $${idx++}`);
			valores.push(dto.apellidos);
		}
		if (dto.fecha_nacimiento !== undefined) {
			campos.push(`fecha_nacimiento = $${idx++}`);
			valores.push(dto.fecha_nacimiento);
		}
		if (dto.grupos !== undefined) {
			campos.push(`grupos = $${idx++}`);
			valores.push(dto.grupos);
		}
		if (dto.activo !== undefined) {
			campos.push(`activo = $${idx++}`);
			valores.push(dto.activo);
		}

		if (campos.length === 0) {
			return this.obtenerPorId(idUsuario);
		}

		valores.push(idUsuario);
		const query = `
      UPDATE usuarios
      SET ${campos.join(", ")}
      WHERE id_usuario = $${idx};
    `;

		await myPool.query(query, valores);
		return this.obtenerPorId(idUsuario);
	}

	async eliminar(idUsuario: number): Promise<boolean> {
		const query = `
      DELETE FROM usuarios
      WHERE id_usuario = $1;
    `;
		const result = await myPool.query(query, [idUsuario]);

		return (result.rowCount ?? 0) > 0;
	}

	async verificarCredenciales(
		username: string,
		passwordPlana: string,
	): Promise<Usuario> {
		const query = `
      ${this.baseQuery}
      JOIN credenciales c ON u.id_usuario = c.id_usuario
      WHERE u.username = $1  AND u.activo = TRUE AND c.password_hash = crypt($2, c.password_hash);
    `;
		const result = await myPool.query(query, [username, passwordPlana]);
		if (result.rowCount !== 1)
			throw new NotAuthorizedError("Usuario no encontrado.");
		return result.rows[0];
	}
}
export const usuariosRepo = new UsuariosRepository();
