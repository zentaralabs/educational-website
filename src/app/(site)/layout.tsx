import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { StudentTypeProvider } from "@/lib/student-type";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudentTypeProvider>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter />
      </div>
    </StudentTypeProvider>
  );
}
