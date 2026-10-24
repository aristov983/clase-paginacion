//Esto es un archivo que hizo mati solo para probar si anda lo de socket en routes y plugins

const ws = new WebSocket("ws://localhost:3000/ws");

//Lo ejecuta con node onlyLocaj.js

//Ejecuta la api también y aparece un mensaje en la terminal (npm run dev)

ws.addEventListener("message", (event) => {
  //Todo esto es para ver los mensajes de la route de ws que hicimos en la api ??? no se no explicaron nada
  const data = event.data;
  console.log({ data });
});

// for (const i in ws) {
//   console.log(i, ws[i]);
// }
