import EventsClient from "./client";

export const metadata = {
  title: "Events Management | Admin | CampusKey",
};

export default async function AdminEventsPage() {
  return (
    <div className="w-full">
      <EventsClient initialEvents={[]} />
    </div>
  );
}
