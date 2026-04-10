import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

function redirect(request: NextRequest, to: string) {
  return NextResponse.redirect(new URL(to, request.url));
}

const STUDENT_PREFIXES = ["/dashboard", "/notes", "/events", "/chatbot"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isStudentRoute = STUDENT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isAdminRoute && !isStudentRoute) {
    return NextResponse.next();
  }

  const { supabase, response } = createClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect(request, "/");
  }

  if (isAdminRoute) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || profile?.role !== "admin") {
      return redirect(request, "/dashboard");
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/notes/:path*", "/events/:path*", "/chatbot/:path*"],
};

