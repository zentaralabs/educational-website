"use client";

import { useState } from "react";
import type { AuthorListRow } from "@/lib/queries/authors";
import { setAuthorRole } from "@/lib/queries/authors";
import {
  addApplicationPlatform,
  addCountry,
  addDeadlineType,
  addDegreeLevel,
  deleteApplicationPlatform,
  deleteCountry,
  deleteDeadlineType,
  deleteDegreeLevel,
  type ApplicationPlatformRow,
} from "@/lib/queries/vocab";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Country = Database["public"]["Tables"]["countries"]["Row"];
type DegreeLevel = Database["public"]["Tables"]["degree_levels"]["Row"];
type DeadlineType = Database["public"]["Tables"]["deadline_types"]["Row"];

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-ink/15 p-4">
      <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ErrorLine({ error }: { error: string | null }) {
  if (!error) return null;
  return <p className="mt-2 font-body text-xs text-status-closed">{error}</p>;
}

function RolesPanel({
  authors,
  currentUserId,
}: {
  authors: AuthorListRow[];
  currentUserId: string;
}) {
  const [rows, setRows] = useState(authors);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggle(id: string, nextIsAdmin: boolean) {
    setBusyId(id);
    setError(null);
    try {
      const supabase = createClient();
      await setAuthorRole(supabase, id, nextIsAdmin);
      setRows((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_admin: nextIsAdmin } : a)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update role");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Panel title="Roles">
      <ul className="flex flex-col gap-2">
        {rows.map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-ink">{a.name}</span>
            <div className="flex items-center gap-2">
              <span className="font-body text-xs text-slate">
                {a.is_admin ? "Admin" : "Editor"}
              </span>
              <button
                type="button"
                disabled={busyId === a.id || a.id === currentUserId}
                title={
                  a.id === currentUserId
                    ? "You can't change your own role"
                    : undefined
                }
                onClick={() => toggle(a.id, !a.is_admin)}
                className="rounded-md border border-ink/20 px-2 py-1 font-body text-xs text-ink transition-colors duration-150 hover:border-status-open disabled:opacity-40"
              >
                {a.is_admin ? "Make editor" : "Make admin"}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <ErrorLine error={error} />
    </Panel>
  );
}

function NameOnlyVocabPanel({
  title,
  placeholder,
  items,
  onAdd,
  onDelete,
}: {
  title: string;
  placeholder: string;
  items: { id: number; name: string }[];
  onAdd: (name: string) => Promise<{ id: number; name: string }>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [rows, setRows] = useState(items);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const created = await onAdd(value.trim());
      setRows((prev) => [...prev, created]);
      setValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number) {
    setBusyId(id);
    setError(null);
    try {
      await onDelete(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not delete — it may still be in use",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Panel title={title}>
      <ul className="mb-3 flex flex-col gap-1.5">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
            <span className="text-ink">{r.name}</span>
            <button
              type="button"
              disabled={busyId === r.id}
              onClick={() => handleDelete(r.id)}
              className="font-body text-xs text-slate transition-colors duration-150 hover:text-status-closed disabled:opacity-40"
            >
              Remove
            </button>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="font-body text-sm text-slate">None yet.</li>
        )}
      </ul>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-md border border-ink/20 bg-paper px-2 py-1 font-body text-sm text-ink placeholder:text-slate/60 focus-visible:border-status-open"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-md border border-ink px-2 py-1 font-body text-xs text-ink transition-colors duration-150 hover:bg-ink hover:text-paper disabled:opacity-50"
        >
          Add
        </button>
      </form>
      <ErrorLine error={error} />
    </Panel>
  );
}

function CountriesPanel({ countries }: { countries: Country[] }) {
  const [rows, setRows] = useState(countries);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const created = await addCountry(supabase, code.trim().toUpperCase(), name.trim());
      setRows((prev) => [...prev, created]);
      setCode("");
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number) {
    setBusyId(id);
    setError(null);
    try {
      const supabase = createClient();
      await deleteCountry(supabase, id);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not delete — it may still be in use",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Panel title="Countries">
      <ul className="mb-3 flex flex-col gap-1.5">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
            <span className="text-ink">
              {r.code} — {r.name}
            </span>
            <button
              type="button"
              disabled={busyId === r.id}
              onClick={() => handleDelete(r.id)}
              className="font-body text-xs text-slate transition-colors duration-150 hover:text-status-closed disabled:opacity-40"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Code (US)"
          className="w-20 rounded-md border border-ink/20 bg-paper px-2 py-1 font-body text-sm text-ink placeholder:text-slate/60 focus-visible:border-status-open"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="min-w-0 flex-1 rounded-md border border-ink/20 bg-paper px-2 py-1 font-body text-sm text-ink placeholder:text-slate/60 focus-visible:border-status-open"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-md border border-ink px-2 py-1 font-body text-xs text-ink transition-colors duration-150 hover:bg-ink hover:text-paper disabled:opacity-50"
        >
          Add
        </button>
      </form>
      <ErrorLine error={error} />
    </Panel>
  );
}

function PlatformsPanel({
  platforms,
  countries,
}: {
  platforms: ApplicationPlatformRow[];
  countries: Country[];
}) {
  const [rows, setRows] = useState(platforms);
  const [name, setName] = useState("");
  const [countryId, setCountryId] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const cid = countryId ? Number(countryId) : null;
      const created = await addApplicationPlatform(supabase, name.trim(), cid);
      const country = countries.find((c) => c.id === cid) ?? null;
      setRows((prev) => [
        ...prev,
        {
          ...created,
          country: country ? { code: country.code, name: country.name } : null,
        },
      ]);
      setName("");
      setCountryId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number) {
    setBusyId(id);
    setError(null);
    try {
      const supabase = createClient();
      await deleteApplicationPlatform(supabase, id);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not delete — it may still be in use",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Panel title="Application platforms">
      <ul className="mb-3 flex flex-col gap-1.5">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
            <span className="text-ink">
              {r.name}
              {r.country && (
                <span className="text-slate"> — {r.country.name}</span>
              )}
            </span>
            <button
              type="button"
              disabled={busyId === r.id}
              onClick={() => handleDelete(r.id)}
              className="font-body text-xs text-slate transition-colors duration-150 hover:text-status-closed disabled:opacity-40"
            >
              Remove
            </button>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="font-body text-sm text-slate">None yet.</li>
        )}
      </ul>
      <form onSubmit={handleAdd} className="flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (Common App)"
          className="min-w-0 flex-1 rounded-md border border-ink/20 bg-paper px-2 py-1 font-body text-sm text-ink placeholder:text-slate/60 focus-visible:border-status-open"
        />
        <select
          value={countryId}
          onChange={(e) => setCountryId(e.target.value)}
          className="rounded-md border border-ink/20 bg-paper px-2 py-1 font-body text-sm text-ink"
        >
          <option value="">No country</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={busy}
          className="rounded-md border border-ink px-2 py-1 font-body text-xs text-ink transition-colors duration-150 hover:bg-ink hover:text-paper disabled:opacity-50"
        >
          Add
        </button>
      </form>
      <ErrorLine error={error} />
    </Panel>
  );
}

export function SettingsView({
  currentUserId,
  authors,
  countries,
  degreeLevels,
  deadlineTypes,
  applicationPlatforms,
}: {
  currentUserId: string;
  authors: AuthorListRow[];
  countries: Country[];
  degreeLevels: DegreeLevel[];
  deadlineTypes: DeadlineType[];
  applicationPlatforms: ApplicationPlatformRow[];
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <RolesPanel authors={authors} currentUserId={currentUserId} />
      <CountriesPanel countries={countries} />
      <NameOnlyVocabPanel
        title="Degree levels"
        placeholder="e.g. Foundation/Pathway"
        items={degreeLevels}
        onAdd={async (name) => {
          const supabase = createClient();
          return addDegreeLevel(supabase, name);
        }}
        onDelete={async (id) => {
          const supabase = createClient();
          await deleteDegreeLevel(supabase, id);
        }}
      />
      <NameOnlyVocabPanel
        title="Deadline types"
        placeholder="e.g. Priority"
        items={deadlineTypes}
        onAdd={async (name) => {
          const supabase = createClient();
          return addDeadlineType(supabase, name);
        }}
        onDelete={async (id) => {
          const supabase = createClient();
          await deleteDeadlineType(supabase, id);
        }}
      />
      <PlatformsPanel platforms={applicationPlatforms} countries={countries} />
    </div>
  );
}
