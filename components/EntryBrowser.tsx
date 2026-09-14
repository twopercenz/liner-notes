"use client";

import { useMemo, useState } from "react";
import { Entry, EntryType, TYPE_LABEL } from "@/lib/types";
import EntryCard from "./EntryCard";

const FILTERS: { key: "all" | EntryType; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "album", label: TYPE_LABEL.album },
  { key: "ep", label: TYPE_LABEL.ep },
  { key: "single", label: TYPE_LABEL.single },
  { key: "song", label: TYPE_LABEL.song },
];

export default function EntryBrowser({ entries }: { entries: Entry[] }) {
  const [filter, setFilter] = useState<"all" | EntryType>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      if (filter !== "all" && entry.type !== filter) return false;
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return (
        entry.artist.toLowerCase().includes(q) ||
        entry.title.toLowerCase().includes(q)
      );
    });
  }, [entries, filter, query]);

  return (
    <section>
      <div className="sub-nav-frosted">
        <div className="chip-row">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`configurator-chip ${
                filter === f.key ? "configurator-chip--selected" : ""
              }`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          className="search-input"
          type="search"
          placeholder="아티스트, 제목으로 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="empty-state text-body">
          {entries.length === 0
            ? "아직 기록이 없어요. 첫 리뷰를 남겨보세요."
            : "검색 결과가 없어요."}
        </p>
      ) : (
        <div className="entry-grid">
          {filtered.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </section>
  );
}
