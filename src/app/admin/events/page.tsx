import EventsClient from "./client";
import { supabaseAdmin } from "@/lib/supabase";

export const metadata = {
  title: "Events Management | Admin | CampusKey",
};

export default async function AdminEventsPage() {
  const { data: events } = await supabaseAdmin
    .from("events")
    .select("id, title, description, poster_url, external_link, event_date, created_at")
    .order("event_date", { ascending: false });

  return (
    <div className="w-full">
      <EventsClient initialEvents={events || []} />
    </div>
  );
}
