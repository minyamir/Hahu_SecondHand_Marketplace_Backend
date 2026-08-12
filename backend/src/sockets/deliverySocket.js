import { updateLocation, updateDeliveryStatus } from "../services/delivery.service.js";
import { releasePayment } from "../services/escrow.service.js"; // Escrow ን ለማገናኘት

export const setupDeliverySocket = (io) => {
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        // 1. ገዢው ወይም ሻጩ የተወሰነ Delivery እንዲከታተሉ room ውስጥ መግባት
        socket.on("join_delivery", (deliveryId) => {
            socket.join(`delivery_${deliveryId}`);
            console.log(`Socket joined room: delivery_${deliveryId}`);
        });

        // 2. ሾፌሩ የ GPS ቦታውን ሲልክ
        socket.on("update_location", async (data) => {
            const { deliveryId, lat, lng } = data;
            
            // በዳታቤዝ ውስጥ ቦታውን ማዘመን (ለታሪክ እንዲጠቅም)
            await updateLocation(deliveryId, lat, lng);
            
            // መረጃውን ለዚያ Delivery room ለተመዘገቡት ሁሉ መላክ
            io.to(`delivery_${deliveryId}`).emit("location_changed", { lat, lng });
        });

        // 3. ሾፌሩ ወይም አድሚን የ Delivery ስታተስ ሲቀይሩ
        socket.on("status_update", async (data) => {
            const { deliveryId, status, sellerId, amount } = data;

            // የDelivery ስታተስ በዳታቤዝ ማዘመን
            await updateDeliveryStatus(deliveryId, status);

            // ለገዢው ማሳወቂያ መላክ
            io.to(`delivery_${deliveryId}`).emit("status_changed", { status });

            // 4. ልዩ ሁኔታ: ገዢው "confirmed" ሲያደርግ ገንዘቡን መልቀቅ
            if (status === "confirmed") {
                try {
                    await releasePayment(deliveryId, sellerId, amount);
                    io.to(`delivery_${deliveryId}`).emit("payment_released", { 
                        message: "Payment successfully released to seller!" 
                    });
                } catch (error) {
                    console.error("Escrow Release Error:", error);
                }
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });
};