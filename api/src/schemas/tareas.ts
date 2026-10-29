import Type, { type Static } from "typebox";
import { GrupoSchema } from "./usuarios.ts";
import { MetadataSchema, PaginationSchema } from "./pagination.ts";

export const PrioridadSchema = Type.Union(
  [Type.Literal("0:baja"), Type.Literal("1:media"), Type.Literal("2:alta")],
  { default: "1:media" },
);
export const TareaSchema = Type.Object(
  {
    id_tarea: Type.Integer(),
    id_creador: Type.Integer(),
    grupo: GrupoSchema,
    titulo: Type.String({ minLength: 1, maxLength: 100 }),
    descripcion: Type.Union([Type.String(), Type.Null()]),
    prioridad: Type.Union([
      Type.Literal("0:baja"),
      Type.Literal("1:media"),
      Type.Literal("2:alta"),
    ]),
    creada: Type.String({ format: "date-time" }),
    terminada: Type.Optional(Type.String({ format: "date-time" })),
    estado: Type.Union([Type.Literal("Abierta"), Type.Literal("Cerrada")]),
  },
  { $id: "Tarea" },
);

export const TareasQuerySchema = Type.Object({
  ...PaginationSchema.properties,
  ordenarPor: Type.Union(
    [
      Type.Literal("id_tarea"),
      Type.Literal("titulo"),
      Type.Literal("prioridad"),
      Type.Literal("creada"),
    ],
    { default: "id_tarea", description: "Se ordenan por id" },
  ),
  titulo: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 100,
      description:
        "Filtro opcional para buscar tareas por título",
    }),
  ),
  estado: Type.Optional(TareaSchema.properties.estado),
});

export const CrearTareaSchema = Type.Object({
  grupo: GrupoSchema,
  titulo: Type.String({ minLength: 1, maxLength: 100 }),
  descripcion: Type.String(),
  prioridad: PrioridadSchema,
});

export const TareasPaginadas = Type.Object({
  data: Type.Array(TareaSchema),
  meta: MetadataSchema,
});

export type Tarea = Static<typeof TareaSchema>;
export type TareasQuery = Static<typeof TareasQuerySchema>;
export type CrearTareaType = Static<typeof CrearTareaSchema>;
export type TareasPaginadas = Static<typeof TareasPaginadas>;

export const ActualizarTareaSchema = Type.Partial(CrearTareaSchema);
export type ActualizarTareaType = Static<typeof ActualizarTareaSchema>;
