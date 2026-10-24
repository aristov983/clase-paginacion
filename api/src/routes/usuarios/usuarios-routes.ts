import {
  Type,
  type FastifyPluginAsyncTypebox,
} from "@fastify/type-provider-typebox";
import {
  UsuarioSchema,
  CrearUsuarioSchema,
  ActualizarUsuarioSchema,
  UsuariosPaginados,
} from "../../schemas/usuarios.ts";
import { usuariosRepo } from "../../repositories/usuarios-repository.ts";
import { request } from "node:http";
import { PaginationSchema } from "../../schemas/pagination.ts";

const usuarioRoutes: FastifyPluginAsyncTypebox = async (
  fastify,
  _opts,
): Promise<void> => {
  fastify.get("/", {
    schema: {
      tags: ["usuarios"],
      summary: "Obtener páginas de usuarios",
      description: "Devuelve las páginas solicitadas de usuarios registrados",
      querystring: PaginationSchema,
      response: {
        200: UsuariosPaginados,
      },
    },
    handler: async function (request, reply) {
      const { page, limit } = request.query;
      const total = await usuariosRepo.obtenerTotal();
      const usuarios = await usuariosRepo.obtenerPagina(page, limit);
      const res: UsuariosPaginados = {
        data: usuarios,
        meta: {
          total,
          page,
          limit,
          last_page: Math.ceil(total / limit),
        },
      };
      return res;
    },
  });

  fastify.post("/", {
    schema: {
      tags: ["usuarios"],
      summary: "Crear un nuevo usuario",
      description:
        "Registra un usuario en la base de datos junto con sus credenciales",
      body: CrearUsuarioSchema,
      response: {
        201: UsuarioSchema,
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    handler: async function (request, reply) {
      reply.status(201);
      const user = await usuariosRepo.crear(request.body);

      fastify.notificar({ msg: "Nuevo usuario creado" });

      return user;
    },
  });

  fastify.get("/:id_usuario", {
    schema: {
      tags: ["usuarios"],
      summary: "Obtener un usuario",
      description: "Devuelve el usuario correspondiente al ID especificado",
      params: Type.Object({
        id_usuario: UsuarioSchema.properties.id_usuario,
      }),
      response: {
        200: UsuarioSchema,
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    handler: async function (request, _reply) {
      return await usuariosRepo.obtenerPorId(request.params.id_usuario);
    },
  });

  fastify.put("/:id_usuario", {
    schema: {
      tags: ["usuarios"],
      summary: "Actualizar un usuario",
      description: "Actualiza los datos parciales o totales de un usuario",
      params: Type.Object({
        id_usuario: Type.Integer(),
      }),
      body: ActualizarUsuarioSchema,
      response: {
        200: UsuarioSchema,
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    handler: async function (request, _reply) {
      return usuariosRepo.actualizar(request.params.id_usuario, request.body);
    },
  });

  fastify.delete("/:id_usuario", {
    schema: {
      tags: ["usuarios"],
      summary: "Eliminar un usuario",
      description:
        "Elimina de forma permanente un usuario y sus credenciales asociadas",
      params: Type.Object({
        id_usuario: Type.Integer(),
      }),
      response: {
        204: Type.Null(),
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    handler: async function (request, reply) {
      await usuariosRepo.eliminar(request.params.id_usuario);
      reply.status(204);
      return null;
    },
  });
};

export default usuarioRoutes;
