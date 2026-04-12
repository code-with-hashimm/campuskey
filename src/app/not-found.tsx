import Link from "next/link";
import NotFoundIllustration from "@/components/illustrations/404-illustration";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 py-12 text-center">
      <div className="mb-8 animate-float">
        <NotFoundIllustration className="w-full max-w-[320px] drop-shadow-xl" />
      </div>
      
      <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">
        Page Not Found
      </h1>
      
      <p className="text-lg text-slate-600 max-w-md mb-10 leading-relaxed font-medium">
        The page you are looking for doesn&apos;t exist or you don&apos;t have permission to view it.
      </p>

      <Button size="lg" className="px-8 rounded-full shadow-lg" asChild>
        <Link href="/">
          Return to CampusKey
        </Link>
      </Button>
    </div>
  );
}
