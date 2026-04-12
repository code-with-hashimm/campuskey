import StudentEventsClient from "./client";

export const metadata = {
  title: "Events & Webinars | CampusKey",
};

export default async function StudentEventsPage() {
  return <StudentEventsClient events={[]} />;
}
