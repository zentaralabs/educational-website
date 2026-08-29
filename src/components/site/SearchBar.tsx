"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedPlaceholder } from "./AnimatedPlaceholder";

export function SearchBar({
  defaultValue = "",
  className = "mt-6",
}: {
  defaultValue?: string;
  className?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
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
    if (value.trim())
      router.push(`/search?q=${encodeURIComponent(value.trim())}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`mx-auto flex w-full items-center gap-3 rounded-lg border-[1.5px] border-ink px-5 py-4 text-left text-slate transition-colors duration-200 focus-within:border-status-open ${className}`}
    >
      <div className="relative flex flex-1 items-center">
        {!value && !focused && (
          <div className="pointer-events-none absolute inset-0 flex items-center">
            <AnimatedPlaceholder />
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-label="Search universities and guides"
          className="flex-1 bg-transparent font-body text-lg text-ink outline-hidden!"
        />
      </div>
      <button
        type="submit"
        disabled={!value.trim()}
        aria-label="Search"
        className="hidden shrink-0 rounded border border-status-open bg-status-open px-2.5 py-1 font-utility text-sm font-medium text-white transition-colors duration-150 hover:bg-status-open/90 disabled:cursor-not-allowed disabled:border-slate/40 disabled:bg-transparent disabled:font-normal disabled:text-slate/60 disabled:hover:bg-transparent sm:inline-block"
      >
        Enter
      </button>
    </form>
  );
}
