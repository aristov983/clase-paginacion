import { Type, type Static } from "@fastify/type-provider-typebox";
import { MetadataSchema, PaginationSchema } from "./pagination.ts";

export const GrupoSchema = Type.Union([
  Type.Literal("user"),
  Type.Literal("admin"),
  Type.Literal("superadmin"),
]);

export const UsuarioSchema = Type.Object({
  id_usuario: Type.Integer(),
  username: Type.String({ minLength: 3, maxLength: 30 }),
  nombres: Type.String(),
  apellidos: Type.String(),
  fecha_nacimiento: Type.String({ format: "date" }),
  nombre_completo: Type.String(),
  grupos: Type.Array(Type.String(), { minItems: 1 }),
  activo: Type.Boolean(),
});

export const UsuariosOrdenarPorSchema = Type.Union(
  [
    Type.Literal("id_usuario"),
    Type.Literal("username"),
    Type.Literal("nombres"),
    Type.Literal("apellidos"),
    Type.Literal("fecha_nacimiento"),
  ],
  {
    default: "id_usuario",
    description: "Campo por el cual se ordenan los resultados",
  },
);

export const UsuariosQuerySchema = Type.Object({
  ...PaginationSchema.properties,
  ordenar_por: Type.Optional(UsuariosOrdenarPorSchema),
  nombre: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 50,
      description:
        "Filtro opcional para buscar usuarios por nombres o apellidos",
    }),
  ),
  grupo: Type.Optional(GrupoSchema),
  activo: Type.Optional(
    Type.Boolean({ description: "Filtrar por usuarios activos o inactivos" }),
  ),
});

export const CrearUsuarioSchema = Type.Object({
  username: Type.String({ minLength: 3, maxLength: 30 }),
  nombres: Type.String({ minLength: 1 }),
  apellidos: Type.String({ minLength: 1 }),
  fecha_nacimiento: Type.String({ format: "date" }),
  grupos: Type.Array(GrupoSchema, { minItems: 1 }),
  password: Type.String({ minLength: 6 }),
});

export const ActualizarUsuarioSchema = Type.Partial(
  Type.Object({
    nombres: Type.String({ minLength: 1 }),
    apellidos: Type.String({ minLength: 1 }),
    fecha_nacimiento: Type.String({ format: "date" }),
    grupos: Type.Array(GrupoSchema, { minItems: 1 }),
    activo: Type.Boolean(),
  }),
);

export const LoginSchema = Type.Object(
  {
    username: Type.String(),
    password: Type.String(),
  },
  {
    examples: [
      {
        username: "admin",
        password: "Contraseña1",
      },
      {
        username: "user",
        password: "Contraseña1",
      },
      {
        username: "superadmin",
        password: "Contraseña1",
      },
    ],
  },
);

/**
 * Esquema para usar en el payload al generar el token y también en request.user
 */
export const PayloadSchema = Type.Object({
  id_usuario: UsuarioSchema.properties.id_usuario,
  username: UsuarioSchema.properties.username,
  grupos: UsuarioSchema.properties.grupos,
});

export const UsuariosPaginados = Type.Object({
  data: Type.Array(UsuarioSchema),
  meta: MetadataSchema,
});

export type Usuario = Static<typeof UsuarioSchema>;
export type UsuariosPaginados = Static<typeof UsuariosPaginados>;
export type UsuariosQuery = Static<typeof UsuariosQuerySchema>;
export type UsuariosOrdenarPor = Static<typeof UsuariosOrdenarPorSchema>;
export type CrearUsuarioType = Static<typeof CrearUsuarioSchema>;
export type ActualizarUsuarioType = Static<typeof ActualizarUsuarioSchema>;
export type LoginType = Static<typeof LoginSchema>;
export type PayloadType = Static<typeof PayloadSchema>;
