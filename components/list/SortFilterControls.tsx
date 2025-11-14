"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
  const ref = useRef<HTMLDivElement | null>(null);

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
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

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
    // router.push(`${location.pathname}?${params.toString()}`);
    setFilterState((prev) => {
      const next: Record<string, string> = {};
      (filters ?? []).forEach((f) => (next[f.key] = ""));
      return next;
    });
    setOpen(true);
  };

  const toggle = () => setOpen((v) => !v);

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-classYellow cursor-pointer"
          aria-label="Open sort & filter"
        >
          <img src="/icons/filter.png" alt="filter" width={14} height={14} />
        </button>

        {/* <button
          type="button"
          onClick={toggle}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-classYellow"
          aria-label="Open sort controls"
        >
          <img src="/icons/sort.png" alt="sort" width={14} height={14} />
        </button> */}
      </div>

      {open && (
        <div
          className="absolute right-0 mt-2 bg-white border rounded shadow-lg z-50 p-3"
          style={{ width }}
        >
          <div className="flex flex-col gap-3">
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
        </div>
      )}
    </div>
  );
}
