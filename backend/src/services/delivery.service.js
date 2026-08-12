import Delivery from "../models/Delivery.model.js";

// 1. አዲስ Delivery መፍጠር
export const createDelivery = async (orderData) => {
    return await Delivery.create(orderData);
};

// 2. ሾፌር መመደብ (Admin ወይም System የሚጠቀምበት)
export const assignDriver = async (deliveryId, driverId) => {
    return await Delivery.findByIdAndUpdate(
        deliveryId,
        { driverId, status: "assigned" },
        { new: true }
    );
};

// 3. ሾፌሩ Delivery ሲቀበል
export const acceptDelivery = async (deliveryId, driverId) => {
    return await Delivery.findOneAndUpdate(
        { _id: deliveryId, driverId }, // ሾፌሩ መሆኑን ማረጋገጥ
        { status: "accepted" },
        { new: true }
    );
};

// 4. የ Delivery ሁኔታን ማዘመን (picked_up, on_the_way, delivered)
export const updateDeliveryStatus = async (deliveryId, status) => {
    return await Delivery.findByIdAndUpdate(
        deliveryId,
        { status },
        { new: true }
    );
};

// 5. ቦታን (GPS) ማዘመን
export const updateLocation = async (deliveryId, lat, lng) => {
    return await Delivery.findByIdAndUpdate(
        deliveryId,
        { currentLocation: { lat, lng } },
        { new: true }
    );
};