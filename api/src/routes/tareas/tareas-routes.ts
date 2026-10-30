import Type from "typebox";
import {
  ActualizarTareaSchema,
  CrearTareaSchema,
  TareaSchema,
  TareasPaginadas,
  TareasQuerySchema,
} from "../../schemas/tareas.ts";
import { tareasRepo } from "../../repositories/tareas-repository.ts";
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

const tareasRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    "/",
    {
      schema: {
        tags: ["tareas"],
        summary: "Obtener páginas de tareas",
        description:
          "Devuelve la página solicitada de tareas, con filtros y orden opcionales",
        querystring: TareasQuerySchema,
        response: {
          200: TareasPaginadas,
        },
      },
    },
    async (request, reply) => {
      const { page, limit } = request.query;
      const total = await tareasRepo.obtenerTotal(request.query);
      const tareas = await tareasRepo.obtenerPagina(request.query);
      const res: TareasPaginadas = {
        data: tareas,
        meta: {
          total,
          page,
          limit,
          last_page: Math.ceil(total / limit) || 1,
        },
      };
      return reply.code(200).send(res);
    },
  );

  fastify.post(
    "/",
    {
      schema: {
        tags: ["tareas"],
        summary: "",
        description: "",
        body: CrearTareaSchema,
        response: {
          201: TareaSchema,
        },
      },
    },
    async (request, reply) => {
      reply.code(201);
      return tareasRepo.crear(request.user?.id_usuario || 1, request.body);
    },
  );

  fastify.get("/:id_tarea", {
    schema: {
      tags: ["tareas"],
      summary: "",
      description: "",
      params: Type.Object({ id_tarea: TareaSchema.properties.id_tarea }),
      response: {
        200: TareaSchema,
      },
    },
    handler: async (request, reply) => {
      return tareasRepo.obtenerPorId(request.params.id_tarea);
    },
  });

  fastify.put(
    "/:id_tarea",
    {
      schema: {
        tags: ["tareas"],
        summary: "",
        description: "",
        params: Type.Object({ id_tarea: TareaSchema.properties.id_tarea }),
        body: ActualizarTareaSchema,
        response: {
          200: TareaSchema,
        },
      },
    },
    async (request, reply) => {
      return tareasRepo.actualizar(request.params.id_tarea, request.body);
    },
  );

  fastify.patch(
    "/:id_tarea",
    {
      schema: {
        tags: ["tareas"],
        summary: "",
        description: "",
        params: Type.Object({ id_tarea: TareaSchema.properties.id_tarea }),
        body: Type.Object({
          terminada: TareaSchema.properties.terminada,
        }),
        response: {
          200: TareaSchema,
        },
      },
    },
    async (request, reply) => {
      return await tareasRepo.finalizar(
        request.params.id_tarea,
        request.body.terminada,
      );
    },
  );

  fastify.delete(
    "/:id_tarea",
    {
      schema: {
        tags: ["tareas"],
        summary: "",
        description: "",
        params: Type.Object({ id_tarea: TareaSchema.properties.id_tarea }),
        response: {
          204: Type.Null(),
        },
      },
    },
    async (request, reply) => {
      reply.code(204);
      await tareasRepo.eliminar(request.params.id_tarea);
    },
  );
};

export default tareasRoutes;
