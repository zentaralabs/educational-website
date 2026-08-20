import Link from "next/link";
import { SearchBar } from "@/components/site/SearchBar";
import { StudentTypePrompt } from "@/components/site/StudentTypePrompt";
import { listPublicCountries } from "@/lib/queries/public-countries";
import { getHomepageStats } from "@/lib/queries/public-stats";

export default async function Home() {
  const [stats, countries] = await Promise.all([
    getHomepageStats(),
    listPublicCountries(),
  ]);

  return (
    <main className="flex flex-1 items-center px-6 py-16">
      <div
        className="animate-fade-up mx-auto w-full max-w-3xl text-center"
        style={{ animationDelay: "0ms" }}
      >
        <p className="mb-3 font-utility text-xs font-semibold tracking-widest text-status-open uppercase">
          {stats.universityCount.toLocaleString()} universities ·{" "}
          {stats.deadlineCount.toLocaleString()} deadlines tracked
        </p>

        <h1 className="font-display text-4xl font-semibold text-ink text-balance">
          Where are you applying?
        </h1>

        <SearchBar />

        <StudentTypePrompt />

        <p className="mt-3 text-base text-slate">
          Or browse by country:{" "}
          {countries.map((c, i) => (
            <span key={c.code}>
              <Link
                href={`/deadlines?country=${c.code}`}
                className="underline decoration-status-pending/0 decoration-2 underline-offset-4 transition-colors duration-200 hover:decoration-status-pending"
              >
                {c.name}
              </Link>
              {i < countries.length - 1 && " · "}
            </span>
          ))}
        </p>

        <p className="mt-2 text-base text-slate">
          <Link
            href="/quiz"
            className="underline decoration-status-pending/0 decoration-2 underline-offset-4 transition-colors duration-200 hover:decoration-status-pending"
          >
            Find the right university for me.{" "}
          </Link>
        </p>
      </div>
    </main>
  );
}
