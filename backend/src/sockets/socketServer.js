import { Server } from "socket.io";

import { registerChatSocket } from "./chatSocket.js";
import { registerNotificationSocket } from "./notificationSocket.js";
import { registerWalletSocket } from "./walletSocket.js";

export let io;

export const setupSocketServer = (server) => {

    io = new Server(server,{
        cors:{
            origin:"*",
            methods:["GET","POST"]
        }
    });

    registerChatSocket(io);

    registerNotificationSocket(io);

    registerWalletSocket(io);

    console.log("✅ Socket.IO Started");

    return io;
};