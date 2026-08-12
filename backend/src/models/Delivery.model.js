import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // ገና ያልተመደበ ከሆነ null ይሆናል
    status: { 
        type: String, 
        enum: ["created", "assigned", "accepted", "picked_up", "on_the_way", "delivered", "confirmed", "cancelled"],
        default: "created"
    },
    currentLocation: { 
        lat: { type: Number, default: 0 }, 
        lng: { type: Number, default: 0 } 
    }
}, { timestamps: true });

export default mongoose.model("Delivery", deliverySchema);