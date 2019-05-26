import express from "express";


const server: express.Express = express();

server.get("/", (_, res) => {
  res.send("Hello ts-node!");
});

export default server;