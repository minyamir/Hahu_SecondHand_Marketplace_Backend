import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { setupSocketServer } from "./sockets/socketServer.js";

const startServer = async () => {
  await connectDatabase();

  const server = http.createServer(app);
  setupSocketServer(server);

  server.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
};

startServer();