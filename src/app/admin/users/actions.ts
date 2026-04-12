"use server";

import { verifyAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, newRole: string) {
  try {
    await verifyAdmin();

    const { error } = await supabaseAdmin
      .from("users")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      console.error("Supabase role update error:", error);
      return { error: "Failed to update role." };
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to update user role." };
  }
}

export async function createUser(formData: FormData) {
  try {
    await verifyAdmin();
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateUser(userId: string, formData: FormData) {
  try {
    await verifyAdmin();
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function toggleUserStatus(userId: string, status: string) {
  try {
    await verifyAdmin();
    const newStatus = status === "active" ? "suspended" : "active";
    const { error } = await supabaseAdmin.from("users").update({ status: newStatus }).eq("id", userId);
    if (error) throw error;
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteUser(userId: string) {
  try {
    await verifyAdmin();
    const { error } = await supabaseAdmin.from("users").delete().eq("id", userId);
    if (error) throw error;
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

