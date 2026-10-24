import fp from "fastify-plugin";
import webSocket from "@fastify/websocket";
import { WebSocket } from "ws";

export interface socketUsuario extends WebSocket {
  id_usuario?: number;
}

export default fp(async (fastify) => {
  fastify.register(webSocket);

  fastify.decorate("notificar", async function (data: any, id_usuario: number) {
    fastify.websocketServer.clients.forEach((c: socketUsuario) => {
      if (c.readyState != c.OPEN) {
        return;
      }

      if (id_usuario == undefined || c.id_usuario == id_usuario) {
        c.send(JSON.stringify(data));
      }
    });
  });
});

declare module "fastify" {
  interface FastifyInstance {
    notificar(data: any, id_usurio?: number): void;
  }
}
