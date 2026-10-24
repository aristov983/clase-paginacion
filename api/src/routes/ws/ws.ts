import {
  Type,
  type FastifyPluginAsyncTypebox,
} from "@fastify/type-provider-typebox";
import type { Usuario } from "../../schemas/usuarios.ts";
import type { socketUsuario } from "../../plugins/ws.ts";

const wsRoute: FastifyPluginAsyncTypebox = async (
  fastify,
  opts,
): Promise<void> => {
  fastify.get(
    "",
    {
      websocket: true,
      schema: {
        //Ejemplo: Queremos que cuando un usuario se conecte se notifique a todos los usuarios o al que se especifique
        querystring: Type.Object({ token: Type.Optional(Type.String()) }),
      },
    },
    async function (socket: socketUsuario, request) {
      const { token } = request.query;
      try {
        if (token == undefined) {
          socket.send(JSON.stringify({ msg: "Conectado" }));
          return;
        }

        const user = fastify.jwt.verify<Usuario>(token);
        socket as socketUsuario;
        socket.id_usuario = user.id_usuario;
      } catch {
        return;
      }
    },
  );
};

export default wsRoute;
