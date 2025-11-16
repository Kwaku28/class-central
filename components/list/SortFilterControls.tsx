"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export type SortOption = { label: string; value: string };
export type FilterOption = {
  key: string;
  label: string;
  type: "select" | "date" | "text";
  options?: { value: string | number; label: string }[]; // for select
};

export default function SortFilterControls({
  sortOptions,
  filters,
  defaultSort,
  width = 200,
}: {
  sortOptions: SortOption[];
  filters?: FilterOption[];
  defaultSort?: { sortBy?: string; sortDir?: "asc" | "desc" };
  width?: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const initial = {
    sortBy: sp.get("sortBy") ?? defaultSort?.sortBy ?? "",
    sortDir:
      (sp.get("sortDir") as "asc" | "desc" | null) ??
      defaultSort?.sortDir ??
      "",
  };

  const [open, setOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>(initial.sortBy);
  const [sortDir, setSortDir] = useState<string>(initial.sortDir);
  const [filterState, setFilterState] = useState<Record<string, string>>(() => {
    const obj: Record<string, string> = {};
    (filters ?? []).forEach((f) => {
      const v = sp.get(f.key) ?? "";
      obj[f.key] = v;
    });
    return obj;
  });

  useEffect(() => {
    // keep local state in sync when search params change externally
    setSortBy(sp.get("sortBy") ?? defaultSort?.sortBy ?? "");
    setSortDir((sp.get("sortDir") as "asc" | "desc" | null) ?? defaultSort?.sortDir ?? "");
    setFilterState((prev) => {
      const next: Record<string, string> = {};
      (filters ?? []).forEach((f) => {
        next[f.key] = sp.get(f.key) ?? "";
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp?.toString()]);

  const apply = () => {
    const params = new URLSearchParams(Array.from(sp.entries()));
    if (sortBy) params.set("sortBy", sortBy);
    else params.delete("sortBy");
    if (sortDir) params.set("sortDir", sortDir);
    else params.delete("sortDir");

    (Object.entries(filterState) ?? []).forEach(([k, v]) => {
      if (v && v !== "") params.set(k, v);
      else params.delete(k);
    });

    params.delete("page");
    router.push(`${location.pathname}?${params.toString()}`);
    setOpen(false);
  };

  const clear = () => {
    setSortBy("");
    setSortDir("");
    const params = new URLSearchParams(Array.from(sp.entries()));
    params.delete("sortBy");
    params.delete("sortDir");
    (filters ?? []).forEach((f) => params.delete(f.key));
    params.delete("page");
    setFilterState((_) => {
      const next: Record<string, string> = {};
      (filters ?? []).forEach((f) => (next[f.key] = ""));
      return next;
    });
    setOpen(true);
  };

  return (
    <Popover open={open} onOpenChange={(v) => setOpen(v)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-classYellow cursor-pointer"
          aria-label="Open sort & filter"
        >
          <img src="/icons/filter.png" alt="filter" width={14} height={14} />
        </button>
      </PopoverTrigger>

      <PopoverContent className="p-0" style={{ width }}>
        <div className="p-3 flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-500">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border rounded px-2 py-1 mt-1"
            >
              <option value="">-- none --</option>
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500">Direction</label>
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value)}
              className="w-full border rounded px-2 py-1 mt-1"
            >
              <option value="">-- none --</option>
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>

          {(filters ?? []).map((f) => (
            <div key={f.key}>
              <label className="text-xs text-gray-500">{f.label}</label>
              {f.type === "select" && (
                <select
                  value={filterState[f.key] ?? ""}
                  onChange={(e) =>
                    setFilterState((s) => ({ ...s, [f.key]: e.target.value }))
                  }
                  className="w-full border rounded px-2 py-1 mt-1"
                >
                  <option value="">All</option>
                  {(f.options ?? []).map((opt) => (
                    <option key={String(opt.value)} value={String(opt.value)}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
              {f.type === "date" && (
                <input
                  type="date"
                  value={filterState[f.key] ?? ""}
                  onChange={(e) =>
                    setFilterState((s) => ({ ...s, [f.key]: e.target.value }))
                  }
                  className="w-full border rounded px-2 py-1 mt-1"
                />
              )}
              {f.type === "text" && (
                <input
                  type="text"
                  value={filterState[f.key] ?? ""}
                  onChange={(e) =>
                    setFilterState((s) => ({ ...s, [f.key]: e.target.value }))
                  }
                  className="w-full border rounded px-2 py-1 mt-1"
                  placeholder={`Filter ${f.label}`}
                />
              )}
            </div>
          ))}

          <div className="flex justify-between items-center pt-2 border-t">
            <button
              type="button"
              onClick={clear}
              className="text-sm text-gray-600 px-3 py-1 rounded hover:bg-gray-100 cursor-pointer"
            >
              Clear
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-gray-600 px-3 py-1 rounded hover:bg-gray-100 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={apply}
                className="bg-classYellow text-sm px-3 py-1 rounded cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
