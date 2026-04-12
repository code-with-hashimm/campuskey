import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, CalendarDays, Clock, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { verifyAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const metadata = {
  title: "Admin Dashboard | CampusKey",
};

async function DashboardStats() {
  const { count: totalNotes } = await supabaseAdmin.from("notes").select("*", { count: "exact", head: true });
  const { count: totalUsers } = await supabaseAdmin.from("users").select("*", { count: "exact", head: true });
  const { count: totalEvents } = await supabaseAdmin.from("events").select("*", { count: "exact", head: true });

  const stats = [
    {
      title: "Total Users",
      value: totalUsers || 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Total Notes",
      value: totalNotes || 0,
      icon: FileText,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
    {
      title: "Total Events",
      value: totalEvents || 0,
      icon: CalendarDays,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
  ];

  return (
    <div className="grid gap-3 grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`rounded-full p-2 ${stat.bg}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


function WelcomeSection() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Welcome to the admin console. Here's what's happening today.
        </p>
      </div>
      <div className="flex gap-2">
        <Button asChild variant="outline" className="gap-2">
          <Link href="/admin/notes">
            Review Notes <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Link href="/admin/events">
            Create Event <CalendarDays className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  await verifyAdmin();

  return (
    <div className="space-y-6 flex flex-col pb-12">
      <WelcomeSection />

      <Suspense fallback={
        <div className="grid gap-3 grid-cols-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      }>
        <DashboardStats />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Link href="/admin/users" className="group">
          <Card className="h-full border-2 border-transparent group-hover:border-indigo-500 transition-all duration-300 shadow-md hover:shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users size={80} />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="text-indigo-600" /> User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Oversee platform members, modify account roles, and manage system access levels.
              </p>
              <div className="mt-6 flex items-center text-indigo-600 font-semibold gap-2 group-hover:translate-x-1 transition-transform">
                Go to Users <ArrowRight size={18} />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/notes" className="group">
          <Card className="h-full border-2 border-transparent group-hover:border-indigo-500 transition-all duration-300 shadow-md hover:shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileText size={80} />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="text-indigo-600" /> Notes Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Manage study materials, browse uploaded resources, and handle file repository cleanups.
              </p>
              <div className="mt-6 flex items-center text-indigo-600 font-semibold gap-2 group-hover:translate-x-1 transition-transform">
                Go to Notes <ArrowRight size={18} />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
