import { io } from "socket.io-client";

// Ensure this matches your test user ID in the database
const userId = "6a2dae5968804ce2f1ab28bf"; 

// If you have a JWT token from a login response, put it here:
const myAuthToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMmRhZTU5Njg4MDRjZTJmMWFiMjhiZiIsImVtYWlsIjoibWlueWFtaXJrZWxlbXUyQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzgyMTIxODcwLCJleHAiOjE3ODI3MjY2NzB9.b9h1BxDfJOqn9KxkmdTkI1w01VehKuMaYQRcUqKG7eQ"; 

console.log("Attempting to connect to server...");

const socket = io("http://localhost:5000", {
    query: { userId: userId },
    auth: {
        token: myAuthToken // Sending the token to satisfy your io.use middleware
    },
    transports: ['websocket']
});

socket.on("connect", () => {
    console.log("SUCCESS: Connected to server! Socket ID:", socket.id);
});

socket.on("connect_error", (err) => {
    console.log("CONNECTION ERROR:", err.message);
    console.log("HINT: Check if your token is expired or invalid.");
});

socket.on("newNotification", (data) => {
    console.log("RECEIVED NOTIFICATION:", data);
});