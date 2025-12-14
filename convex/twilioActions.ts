"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import Twilio from "twilio";

// Send OTP via Twilio WhatsApp (action - has access to external APIs)
export const sendOtpWhatsApp = action({
    args: {
        weddingId: v.id("weddings"),
        phone: v.string(),
    },
    handler: async (
        ctx,
        { weddingId, phone }
    ): Promise<{ success: boolean; message: string }> => {
        // Create OTP record first
        const { otp, guestName } = await ctx.runMutation(
            internal.guestAuth.createOtpRecord,
            {
                weddingId,
                phone,
            }
        );

        // Get Twilio credentials from environment
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

        if (!accountSid || !authToken || !fromNumber) {
            console.error("Twilio credentials not configured");
            // In development, just log the OTP
            console.log(`[DEV] OTP for ${phone}: ${otp}`);
            return { success: true, message: "OTP sent (dev mode)" };
        }

        try {
            const client = Twilio(accountSid, authToken);

            // Format phone number for WhatsApp
            const toWhatsApp = phone.startsWith("whatsapp:")
                ? phone
                : `whatsapp:${phone}`;
            const fromWhatsApp = fromNumber.startsWith("whatsapp:")
                ? fromNumber
                : `whatsapp:${fromNumber}`;

            // Send message
            const message = await client.messages.create({
                body: `Hi ${guestName}! Your verification code is: ${otp}\n\nThis code expires in 10 minutes.`,
                from: fromWhatsApp,
                to: toWhatsApp,
            });

            // Log the message
            await ctx.runMutation(internal.guestAuth.logMessage, {
                weddingId,
                toPhone: phone,
                messageType: "otp",
                messageBody: `Verification code sent`,
                twilioMessageSid: message.sid,
                status: "sent",
            });

            return { success: true, message: "OTP sent via WhatsApp" };
        } catch (error) {
            console.error("Failed to send WhatsApp message:", error);

            // Log the failure
            await ctx.runMutation(internal.guestAuth.logMessage, {
                weddingId,
                toPhone: phone,
                messageType: "otp",
                messageBody: `Verification code (failed)`,
                status: "failed",
                errorMessage:
                    error instanceof Error ? error.message : "Unknown error",
            });

            throw new Error(
                "Failed to send verification code. Please try again."
            );
        }
    },
});
