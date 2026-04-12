"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { verifyAdmin } from "@/lib/auth";

export async function createEvent(formData: FormData) {
  try {
    const admin = await verifyAdmin();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const event_date = formData.get("date") as string;
    const external_link = formData.get("link") as string;
    const file = formData.get("image") as File | null;

    if (!title || !description || !event_date) {
      return { error: "Missing required fields" };
    }

    let poster_url = null;
    let poster_name = null;

    if (file && file.size > 0) {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      
      const { error: uploadError } = await supabase.storage.from("event-posters").upload(fileName, file);
      if (uploadError) throw new Error("Image upload failed: " + uploadError.message);

      const { data: urlData } = supabase.storage.from("event-posters").getPublicUrl(fileName);
      poster_url = urlData.publicUrl;
      poster_name = file.name;
    }

    const { error } = await supabase.from("events").insert([{
      title,
      description,
      event_date,
      external_link: external_link || null,
      poster_url,
      poster_name,
      created_by: admin.id,
      status: "upcoming" // Assume default status
    }]);

    if (error) throw error;
    revalidatePath("/admin/events");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Failed to create event" };
  }
}

export async function updateEvent(eventId: string, formData: FormData) {
  try {
    await verifyAdmin();
    // Implementation needed based on what can be updated, let's keep it simple or return not impl
    return { error: "Update event not fully implemented." };
  } catch (e: any) {
    return { error: e.message || "Failed to update event" };
  }
}

export async function toggleEventStatus(id: string, currentStatus: boolean) {
  try {
    await verifyAdmin();
    const { error } = await supabase.from("events").update({ status: currentStatus ? "past" : "upcoming" }).eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/events");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Failed to toggle status" };
  }
}

export async function deleteEvent(id: string) {
  try {
    await verifyAdmin();
    const { data: event } = await supabase.from("events").select("poster_url").eq("id", id).single();
    
    if (event?.poster_url) {
      const filename = event.poster_url.split('/').pop();
      if (filename) await supabase.storage.from("event-posters").remove([filename]);
    }

    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) throw error;
    
    revalidatePath("/admin/events");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Failed to delete event" };
  }
}
