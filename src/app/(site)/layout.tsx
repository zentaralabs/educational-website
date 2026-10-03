import { HouseAdRails } from "@/components/site/HouseAdRails";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { StudentTypeProvider } from "@/lib/student-type";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudentTypeProvider>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="relative flex flex-1 flex-col">
          {children}
          <HouseAdRails />
        </div>
        <SiteFooter />
      </div>
    </StudentTypeProvider>
  );
}
