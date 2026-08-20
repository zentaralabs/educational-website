"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) router.push(`/search?q=${encodeURIComponent(value.trim())}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-6 flex w-full items-center gap-3 rounded-lg border-[1.5px] border-ink px-5 py-4 text-left text-slate transition-colors duration-200 focus-within:border-status-open"
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search universities and guides…"
        className="flex-1 bg-transparent font-body text-lg text-ink placeholder:text-slate outline-hidden!"
      />
      <kbd className="hidden rounded border border-slate/40 px-2 py-1 font-utility text-sm text-slate sm:inline-block">
        ⌘K
      </kbd>
    </form>
  );
}
