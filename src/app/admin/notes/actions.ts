"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAdmin } from "@/lib/auth";

export async function deleteNote(noteId: string) {
  try {
    await verifyAdmin();
    const { data: note } = await supabaseAdmin.from("notes").select("attachment_url").eq("id", noteId).single();
    
    if (note?.attachment_url) {
      const filename = note.attachment_url.split('/').pop();
      if (filename) await supabaseAdmin.storage.from("notes").remove([filename]);
    }

    const { error } = await supabaseAdmin.from("notes").delete().eq("id", noteId);
    if (error) throw error;
    
    revalidatePath("/admin/notes");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Failed to delete note" };
  }
}

export async function createNote(formData: FormData) {
  try {
    const user = await verifyAdmin();

    const title = formData.get("title") as string;
    const subject = formData.get("subject") as string;
    const semester = formData.get("semester") as string;
    const file = formData.get("file") as File | null;

    if (!title || !subject || !semester) {
      return { error: "Missing required fields" };
    }

    let attachment_url = null;
    let attachment_name = null;
    let file_size = null;

    if (file && file.size > 0) {
      const ext = file.name.split('.').pop() || 'pdf';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      
      const { error: uploadError } = await supabaseAdmin.storage.from("notes").upload(fileName, file);
      if (uploadError) throw new Error("File upload failed: " + uploadError.message);

      const { data: urlData } = supabaseAdmin.storage.from("notes").getPublicUrl(fileName);
      attachment_url = urlData.publicUrl;
      attachment_name = file.name;
      file_size = file.size;
    }

    const { error } = await supabaseAdmin.from("notes").insert([{
      title,
      subject,
      semester,
      attachment_url,
      attachment_name,
      file_size,
      uploaded_by: user.id
    }]);

    if (error) throw error;
    revalidatePath("/admin/notes");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Failed to create note" };
  }
}
