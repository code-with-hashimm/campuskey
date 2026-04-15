"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAdmin } from "@/lib/auth";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_POSTER_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function sanitizeExternalLink(rawValue: string | null) {
  if (!rawValue) {
    return null;
  }

  const trimmedValue = rawValue.trim();
  if (!trimmedValue) {
    return null;
  }

  try {
    const parsedUrl = new URL(trimmedValue);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return null;
    }

    return parsedUrl.toString();
  } catch {
    return null;
  }
}

export async function createEvent(formData: FormData) {
  try {
    const admin = await verifyAdmin();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const event_date_raw = formData.get("event_date") as string;
    const external_link_raw = formData.get("external_link") as string | null;
    const file = formData.get("poster") as File | null;

    if (!title || !description || !event_date_raw) {
      console.error("[CREATE EVENT ERROR]: Missing required fields", { title, description, event_date_raw });
      return { error: "Missing required fields: Title, Description, and Event Date are required." };
    }

    const external_link = sanitizeExternalLink(external_link_raw);
    if (external_link_raw?.trim() && !external_link) {
      return { error: "External link must use http or https." };
    }

    // 1. Date Parsing to ISO
    const event_date = new Date(event_date_raw).toISOString();

    let poster_url = "";

    // 2. Poster Handling
    if (file && file.size > 0) {
      if (file.size > MAX_UPLOAD_BYTES || !ALLOWED_POSTER_TYPES.has(file.type)) {
        return { error: "Only JPEG, PNG, or WebP files up to 10MB are allowed." };
      }

      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

      const { error: uploadError } = await supabaseAdmin.storage.from("event-posters").upload(fileName, file);
      if (uploadError) {
        console.error("[STORAGE ERROR]:", uploadError);
        throw new Error("Image upload failed: " + uploadError.message);
      }

      const { data: urlData } = supabaseAdmin.storage.from("event-posters").getPublicUrl(fileName);
      poster_url = urlData.publicUrl;
    }

    const payload = {
      title,
      description,
      event_date,
      external_link,
      poster_url,
      created_by: admin.id
    };

    const { error } = await supabaseAdmin.from("events").insert([payload]);

    if (error) {
      console.error("[SUPABASE ERROR]:", error);
      throw error;
    }

    revalidatePath("/admin/events");
    revalidatePath("/events");
    return { success: true };
  } catch (e: any) {
    console.error("[CRITICAL EVENT CREATION ERROR]:", e);
    return { error: e.message || "Failed to create event" };
  }
}

export async function updateEvent(eventId: string, formData: FormData) {
  try {
    await verifyAdmin();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const event_date_raw = formData.get("event_date") as string;
    const external_link_raw = formData.get("external_link") as string | null;
    const file = formData.get("poster") as File | null;

    if (!title || !description || !event_date_raw) {
      return { error: "Missing required fields" };
    }

    const external_link = sanitizeExternalLink(external_link_raw);
    if (external_link_raw?.trim() && !external_link) {
      return { error: "External link must use http or https." };
    }

    const event_date = new Date(event_date_raw).toISOString();

    const updatePayload: any = {
      title,
      description,
      event_date,
      external_link,
    };

    if (file && file.size > 0) {
      if (file.size > MAX_UPLOAD_BYTES || !ALLOWED_POSTER_TYPES.has(file.type)) {
        return { error: "Only JPEG, PNG, or WebP files up to 10MB are allowed." };
      }

      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      
      const { error: uploadError } = await supabaseAdmin.storage.from("event-posters").upload(fileName, file);
      if (uploadError) throw new Error("Image upload failed: " + uploadError.message);

      const { data: urlData } = supabaseAdmin.storage.from("event-posters").getPublicUrl(fileName);
      updatePayload.poster_url = urlData.publicUrl;
    }

    const { error } = await supabaseAdmin.from("events").update(updatePayload).eq("id", eventId);

    if (error) throw error;
    revalidatePath("/admin/events");
    revalidatePath("/events");
    return { success: true };
  } catch (e: any) {
    console.error("[UPDATE EVENT ERROR]:", e);
    return { error: e.message || "Failed to update event" };
  }
}


export async function deleteEvent(id: string) {
  try {
    await verifyAdmin();
    const { data: event } = await supabaseAdmin.from("events").select("poster_url").eq("id", id).single();

    if (event?.poster_url) {
      const filename = event.poster_url.split('/').pop();
      if (filename) await supabaseAdmin.storage.from("event-posters").remove([filename]);
    }

    const { error } = await supabaseAdmin.from("events").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/events");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Failed to delete event" };
  }
}
