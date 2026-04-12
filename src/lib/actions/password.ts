"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export async function requestPasswordReset(email: string) {
  console.log("[RESET REQUESTED]:", email);
  try {
    // 1. Check if user exists
    const { data: user, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("id, first_name")
      .eq("email", email)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching user for password reset:", fetchError);
      return { error: "An unexpected error occurred. Please try again later." };
    }

    // Generic success message to prevent enumeration (even if user doesn't exist)
    const genericSuccess = { success: true, message: "If an account with that email exists, we have sent a password reset link. Please check your inbox and spam folder." };

    if (!user) {
      return genericSuccess;
    }

    // 2. Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    // 3. Update user row
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        reset_token: token,
        reset_token_expires_at: expiresAt
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating reset token:", updateError);
      return { error: "Failed to process request. Please try again later." };
    }

    // 4. Send email via Resend
    const resetLink = `${APP_URL}/reset-password?token=${token}`;

    try {
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: "CampusKey <onboarding@resend.dev>",
        to: [email],
        subject: "Reset your CampusKey password",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #0f172a; margin-bottom: 16px;">Password Reset Request</h2>
            <p style="color: #475569; line-height: 1.5;">Hi ${user.first_name || "there"},</p>
            <p style="color: #475569; line-height: 1.5;">We received a request to reset your CampusKey password. Click the button below to choose a new one. This link will expire in 15 minutes.</p>
            <div style="margin: 32px 0;">
              <a href="${resetLink}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #64748b; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} CampusKey. All rights reserved.</p>
          </div>
        `,
      });

      if (emailError) {
        console.error("[RESEND ERROR]:", emailError);
      } else {
        console.log("[RESEND SUCCESS]: Email sent, ID:", emailData?.id);
      }
    } catch (resendErr) {
      // Log full exception for debugging — never expose to frontend
      console.error("[RESEND ERROR]: Unexpected exception during email send:", resendErr);
    }

    return genericSuccess;
  } catch (err) {
    console.error("requestPasswordReset catch:", err);
    return { error: "Internal server error." };
  }
}

export async function updatePassword(token: string, newPassword: string) {
  try {
    if (!token || !newPassword) {
      return { error: "Invalid request data." };
    }

    // 1. Find user with valid token
    const { data: user, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("id, reset_token_expires_at")
      .eq("reset_token", token)
      .maybeSingle();

    if (fetchError || !user) {
      return { error: "Invalid or expired reset token." };
    }

    // 2. Check expiration
    const expiresAt = new Date(user.reset_token_expires_at).getTime();
    if (Date.now() > expiresAt) {
      return { error: "This reset link has expired. Please request a new one." };
    }

    // 3. Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // 4. Update user and clear token
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expires_at: null
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating user password:", updateError);
      return { error: "Failed to update password. Please try again later." };
    }

    return { success: true, message: "Your password has been updated successfully." };
  } catch (err) {
    console.error("updatePassword catch:", err);
    return { error: "Internal server error." };
  }
}
