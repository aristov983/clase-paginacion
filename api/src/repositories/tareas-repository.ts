import { myPool } from "../db/database.ts";
import { NotFoundError } from "../errors/response.errors.ts";
import type {
  ActualizarTareaType,
  CrearTareaType,
  Tarea,
  TareasOrdenarPor,
  TareasQuery,
} from "../schemas/tareas.ts";

class TareasRepository {
  private readonly baseQuery = `
    SELECT * FROM tareas T
  `;

  /**
   * Columnas por las que se permite ordenar. Se usa un mapa fijo (y no el valor
   * que llega por query) para que nunca se concatene texto del cliente en el SQL.
   */
  private readonly columnasOrden: Record<TareasOrdenarPor, string> = {
    id_tarea: "T.id_tarea",
    titulo: "T.titulo",
    prioridad: "T.prioridad",
    creada: "T.creada",
    estado: "T.estado",
  };

  /**
   * Arma el WHERE (con placeholders $1, $2...) y sus valores a partir de los
   * filtros opcionales. Lo comparten el COUNT y la consulta de la página.
   */
  private construirFiltros(filtros: TareasQuery) {
    const condiciones: string[] = [];
    const values: any[] = [];

    if (filtros.titulo) {
      values.push(`%${filtros.titulo}%`);
      condiciones.push(`T.titulo ILIKE $${values.length}`);
    }
    if (filtros.estado) {
      values.push(filtros.estado);
      condiciones.push(`T.estado = $${values.length}`);
    }
    if (filtros.prioridad) {
      values.push(filtros.prioridad);
      condiciones.push(`T.prioridad = $${values.length}`);
    }
    if (filtros.grupo) {
      values.push(filtros.grupo);
      condiciones.push(`T.grupo = $${values.length}`);
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";
    return { where, values };
  }

  async obtenerTotal(filtros: TareasQuery): Promise<number> {
    const { where, values } = this.construirFiltros(filtros);
    const query = `
      SELECT COUNT(*)::int AS total FROM tareas T
      ${where};
    `;
    const result = await myPool.query(query, values);
    return result.rows[0].total;
  }

  async obtenerPagina(query: TareasQuery): Promise<Tarea[]> {
    const { page, limit, orden, ordenar_por } = query;
    const offset = (page - 1) * limit;
    const { where, values } = this.construirFiltros(query);

    const columna = this.columnasOrden[ordenar_por ?? "creada"];
    const direccion = orden === "desc" ? "DESC" : "ASC";

    // El id_tarea como desempate mantiene estable el orden entre páginas
    // cuando se ordena por un campo que puede repetirse (prioridad, estado...)
    const sql = `
      ${this.baseQuery}
      ${where}
      ORDER BY ${columna} ${direccion}, T.id_tarea ASC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2};
    `;
    values.push(limit, offset);

    const result = await myPool.query(sql, values);
    return result.rows;
  }

  async obtenerTodas(): Promise<Tarea[]> {
    const query = `
      ${this.baseQuery}
      ORDER BY creada DESC;
    `;
    const result = await myPool.query(query);
    return result.rows;
  }

  async obtenerPorId(idTarea: number): Promise<Tarea> {
    const query = `
      ${this.baseQuery}
      WHERE id_tarea = $1;
    `;
    const result = await myPool.query(query, [idTarea]);
    if (result.rowCount !== 1) {
      throw new NotFoundError("Tarea no encontrada.");
    }
    return result.rows[0];
  }

  async crear(idCreador: number, dto: CrearTareaType): Promise<Tarea> {
    const query = `
      INSERT INTO tareas (id_creador, grupo, titulo, descripcion, prioridad)
      VALUES ($1, $2, $3, $4, COALESCE($5, '1:media'))
      RETURNING id_tarea;
    `;
    const result = await myPool.query(query, [
      idCreador,
      dto.grupo,
      dto.titulo,
      dto.descripcion ?? null,
      dto.prioridad,
    ]);

    return this.obtenerPorId(result.rows[0].id_tarea);
  }

  async actualizar(idTarea: number, dto: ActualizarTareaType): Promise<Tarea> {
    const campos: string[] = [];
    const valores: any[] = [];
    let idx = 1;

    if (dto.titulo !== undefined) {
      campos.push(`titulo = $${idx++}`);
      valores.push(dto.titulo);
    }
    if (dto.descripcion !== undefined) {
      campos.push(`descripcion = $${idx++}`);
      valores.push(dto.descripcion);
    }
    if (dto.grupo !== undefined) {
      campos.push(`grupo = $${idx++}`);
      valores.push(dto.grupo);
    }
    if (dto.prioridad !== undefined) {
      campos.push(`prioridad = $${idx++}`);
      valores.push(dto.prioridad);
    }

    if (campos.length === 0) {
      return this.obtenerPorId(idTarea);
    }

    valores.push(idTarea);
    const query = `
      UPDATE tareas
      SET ${campos.join(", ")}
      WHERE id_tarea = $${idx};
    `;

    await myPool.query(query, valores);
    return this.obtenerPorId(idTarea);
  }

  async finalizar(idTarea: number, fecha?: string): Promise<Tarea> {
    let terminadaValor = "CURRENT_TIMESTAMP";
    const params = [idTarea];
    if (fecha) {
      params.push();
      terminadaValor = "$2";
    }
    const query = `
      UPDATE tareas
      SET terminada = ${terminadaValor}
      WHERE id_tarea = $1 AND terminada IS NULL;
    `;

    await myPool.query(query, [idTarea, fecha]);
    return this.obtenerPorId(idTarea);
  }

  async eliminar(idTarea: number): Promise<void> {
    await this.obtenerPorId(idTarea);
    const query = `
      DELETE FROM tareas
      WHERE id_tarea = $1;
    `;
    await myPool.query(query, [idTarea]);
  }
}

export const tareasRepo = new TareasRepository();
