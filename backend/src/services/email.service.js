import axios from "axios";

export const sendWelcomeEmail = async ({ toEmail, fullName }) => {
  console.log("Attempting to send welcome email to:", toEmail);

  // 1. Safety Check: Ensure API Key exists
  if (!process.env.BREVO_API_KEY) {
    console.error("FATAL ERROR: BREVO_API_KEY is missing in Environment Variables!");
    return null;
  }

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          // TIP: Using English here helps land in the Inbox rather than Spam
          name: process.env.BREVO_SENDER_NAME || "HaHu Market", 
          email: process.env.BREVO_SENDER_EMAIL
        },
        to: [
          {
            email: toEmail,
            name: fullName
          }
        ],
        subject: "Welcome to ሀሁ Market 🎉",
        htmlContent: `
          <div style="margin:0;padding:24px;background:#f4f7fb;font-family:Arial,sans-serif;color:#111827;">
            <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;">
              
              <div style="background:linear-gradient(135deg,#16a34a 0%, #0ea5e9 100%);padding:40px 24px;text-align:center;color:#ffffff;">
                <div style="font-size:46px;font-weight:800;letter-spacing:3px;">ሀሁ</div>
                <div style="font-size:18px;margin-top:10px;font-weight:600;">HaHu Market</div>
              </div>

              <div style="padding:36px 28px;">
                <h2 style="margin:0 0 16px;font-size:26px;">Hello ${fullName} 👋</h2>
                <p style="font-size:15px;line-height:1.8;">Welcome to <strong>ሀሁ Market</strong>. Your account has been created successfully.</p>
                <p style="font-size:15px;line-height:1.8;">We’re building a safer marketplace for <strong>Bahir Dar</strong>.</p>
                
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:18px;margin-top:20px;">
                  <strong style="color:#166534;">Next Steps:</strong>
                  <ul style="color:#14532d; padding-left:20px; margin-top:10px;">
                    <li>Complete your profile</li>
                    <li>Submit National ID for verification</li>
                    <li>Get your green badge 💚</li>
                  </ul>
                </div>
              </div>

              <div style="padding:18px 24px;background:#f9fafb;text-align:center;font-size:12px;color:#6b7280;">
                HaHu Market • Bahir Dar, Ethiopia
              </div>
            </div>
          </div>
        `
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Brevo Success:", response.data);
    return response.data;

  } catch (error) {
    if (error.response) {
      console.error("❌ BREVO REJECTION:", error.response.data);
    } else {
      console.error("❌ NETWORK ERROR:", error.message);
    }
    // Return null so the registration still finishes even if email fails
    return null; 
  }
};