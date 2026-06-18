// src/test_chat.js
import { io } from "socket.io-client";

// This token looks valid, keep it!
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMmRhZTU5Njg4MDRjZTJmMWFiMjhiZiIsImVtYWlsIjoibWlueWFtaXJrZWxlbXUyQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzgxNDUwMjU5LCJleHAiOjE3ODIwNTUwNTl9._-LYWA8Dajf_ATW1z8zB_KFPn8nRnH9oFrz3tCGbMmI"; 

const socket = io("http://localhost:5000", {
  auth: { token: TOKEN },
  transports: ["websocket"]
});

socket.on("connect", () => {
  console.log("✅ Connected! Socket ID:", socket.id);

  // CRITICAL: Replace these with REAL IDs from your database
  socket.emit("sendMessage", {
    targetUserId: "6a2dae5968804ce2f1ab28bf", // Example real ID
    listingId: "665f8c1234567890abcdef12",   // Example real ID
    text: "Hello! Is this item still available?" 
  });
});

socket.on("messageReceived", (msg) => {
  console.log("📩 Success! Message saved and broadcasted:", msg);
});

socket.on("error", (err) => {
  console.error("❌ Socket Error from server:", err.message);
});