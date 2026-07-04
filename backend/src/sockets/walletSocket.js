// sockets/walletSocket.js

export const registerWalletSocket = (io) => {
    io.on("connection", (socket) => {
        // Retrieve userId from the connection query
        const userId = socket.handshake.query.userId;

        if (userId) {
            // Join the user to their private financial "room"
            socket.join(`wallet_${userId}`);
            console.log(`✅ User ${userId} joined wallet room: wallet_${userId}`);
        }

        // Handle Disconnection
        socket.on("disconnect", () => {
            if (userId) {
                console.log(`❌ User ${userId} left wallet room`);
            }
        });

        // Optional: Allow the client to explicitly join/leave
        socket.on("joinWalletRoom", (uid) => {
            socket.join(`wallet_${uid}`);
        });
    });
};