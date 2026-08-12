import Chat from '../models/Chat.model.js';
import Message from '../models/Message.model.js';
import Listing from '../models/Listing.model.js'; // 🟢 የ Listing ሞዴልን ማስገባት ያስፈልጋል

export const createOrGetChat = async (listingId, senderId, targetUserId) => {
    // 1. መጀመሪያ እቃውን እንፈልጋለን
    const listing = await Listing.findById(listingId);
    if (!listing) {
        throw new Error('Listing not found');
    }

    // 2. የባለቤቱን (Seller) አይዲ እናረጋግጣለን
    const ownerId = listing.seller ? listing.seller.toString() : null;
    if (!ownerId) {
        throw new Error('Listing owner not found');
    }

    const senderStr = senderId.toString();
    const targetStr = targetUserId.toString();

    // 3. 🟢 በጣም ወሳኝ ቼክ: ከሁለቱ ተሳታፊዎች (sender ወይም target) ቢያንስ አንደኛው 
    // የግድ የዕቃው ባለቤት (ownerId) መሆን አለበት! (ገዢዎች እርስ በእርሳቸው ማውራት አይችሉም)
    if (senderStr !== ownerId && targetStr !== ownerId) {
        throw new Error('Chats can only be created between a buyer and the product owner');
    }

    // 4. የባለቤቱን (ownerId) የራሱን Self-Chat እንከለክላለን
    if (senderStr === ownerId && targetStr === ownerId) {
        throw new Error('You cannot start a chat with yourself on your own listing');
    }

    // 5. የሁለቱን ተጠቃሚዎች IDዎች በአንድ ወጥ ቅደም ተከተል (Alphabetical Sort) እንይዛለን
    const sortedParticipants = [senderStr, targetStr].sort();

    // 6. ቻቱ አስቀድሞ መኖሩን እንፈትሻለን
    let chat = await Chat.findOne({
        listing: listingId,
        participants: sortedParticipants
    });

    if (chat) {
        return chat;
    }

    // 7. ሻጩ ራሱ አዲስ ቻት initiator ሆኖ መጀመር ከፈለገ እናግደዋለን (ሻጭ መጀመር የለበትም፣ ገዢ ነው መጀመር ያለበት)
    if (senderStr === ownerId) {
        throw new Error('Sellers cannot initiate a new chat, only buyers can start a chat');
    }

    // 8. ቻቱ ከሌለ አዲስ እንፈጥራለን
    try {
        chat = await Chat.create({
            listing: listingId,
            participants: sortedParticipants
        });

        return chat;
    } catch (error) {
        // 9. ፋንክሽኑ ሲደጋገም ሊፈጠር የሚችለውን ውድድር እንይዛለን
        if (error.code === 11000) {
            chat = await Chat.findOne({
                listing: listingId,
                participants: sortedParticipants
            });

            if (chat) {
                return chat;
            }
        }

        throw error;
    }
};

export const getUserChatRooms = async (userId) => {
    return await Chat.find({ participants: userId })
        .populate('participants', 'fullName email isVerified')
        .populate('listing', 'title price images location')
        .populate('lastMessage')
        .sort({ updatedAt: -1 });
};

export const getRoomMessages = async (chatId) => {
    return await Message.find({ chatId })
        .populate('sender', 'fullName isVerified')
        .sort({ createdAt: 1 });
};

export const saveNewMessage = async ({ chatId, senderId, text, isFlagged, flaggedReason }) => {
    const message = await Message.create({
        chatId,
        sender: senderId,
        text,
        isFlagged,
        flaggedReason
    });

    await Chat.findByIdAndUpdate(chatId, { 
        lastMessage: message._id 
    });

    return message;
};