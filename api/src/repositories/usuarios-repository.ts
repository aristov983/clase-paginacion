import { myPool } from "../db/database.ts";
import {
  NotAuthorizedError,
  NotFoundError,
} from "../errors/response.errors.ts";
import type {
  ActualizarUsuarioType,
  CrearUsuarioType,
  Usuario,
} from "../schemas/usuarios.ts";

class UsuariosRepository {
  private readonly baseQuery = `
    SELECT * FROM usuarios U
  `;

  async obtenerTodos(): Promise<Usuario[]> {
    const query = `
      ${this.baseQuery}
      ORDER BY id_usuario ASC;
    `;
    const result = await myPool.query(query);
    return result.rows;
  }

  async obtenerPaginados(pagina: number, limite: number): Promise<Usuario[]> {
    const offset = (pagina - 1) * limite;

    const query = `SELECT * FROM usuarios LIMIT $1 OFFSET $2`;

    const res = await myPool.query(query, [limite, offset]);

    return res.rows;
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
