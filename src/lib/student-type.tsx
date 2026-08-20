"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

export type StudentType = "domestic" | "international";

const STORAGE_KEY = "student-type";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): StudentType | null {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "domestic" || stored === "international" ? stored : null;
}

function getServerSnapshot(): StudentType | null {
  return null;
}

type StudentTypeContextValue = {
  studentType: StudentType | null;
  setStudentType: (value: StudentType) => void;
};

const StudentTypeContext = createContext<StudentTypeContextValue | null>(null);

export function StudentTypeProvider({ children }: { children: React.ReactNode }) {
  const studentType = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function setStudentType(value: StudentType) {
    window.localStorage.setItem(STORAGE_KEY, value);
    // localStorage writes don't fire "storage" in the same tab, so notify manually.
    window.dispatchEvent(new StorageEvent("storage"));
  }

  return (
    <StudentTypeContext.Provider value={{ studentType, setStudentType }}>
      {children}
    </StudentTypeContext.Provider>
  );
}

/** Defaults to "international" (this site's primary audience) until a visitor picks. */
export function useStudentType(): StudentTypeContextValue & { resolved: StudentType } {
  const ctx = useContext(StudentTypeContext);
  if (!ctx) {
    throw new Error("useStudentType must be used within a StudentTypeProvider");
  }
  return { ...ctx, resolved: ctx.studentType ?? "international" };
}
