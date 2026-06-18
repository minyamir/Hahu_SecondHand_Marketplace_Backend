import { Server } from "socket.io";
import { registerChatSocket } from "./chatSocket.js";

export let io;

// src/sockets/socketServer.js
export const setupSocketServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Enable debugging to see handshake details in the terminal
  io.engine.on("initial_headers", (headers, req) => {
    console.log("DEBUG: Handshake request received from:", req.headers.origin);
  });
  
  io.engine.on("connection_error", (err) => {
    console.log("DEBUG: Handshake connection error:", err.message);
  });

  registerChatSocket(io);
  return io;
};