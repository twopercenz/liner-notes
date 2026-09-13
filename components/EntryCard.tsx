import Link from "next/link";
import { Entry, TYPE_LABEL } from "@/lib/types";

export default function EntryCard({ entry }: { entry: Entry }) {
  return (
    <Link href={`/entry/${entry.id}`} className="store-utility-card">
      <div className="entry-cover">
        {entry.cover_url ? (
          <img src={entry.cover_url} alt={`${entry.artist} - ${entry.title}`} />
        ) : (
          <span className="entry-cover-fallback">♪</span>
        )}
      </div>
      <span className="btn-pearl-capsule entry-type-badge">
        {TYPE_LABEL[entry.type]}
      </span>
      <p className="text-caption entry-meta">
        {entry.artist}
        {entry.year ? ` · ${entry.year}` : ""}
      </p>
      <p className="text-body-strong entry-title">{entry.title}</p>
      <p className="entry-stars" aria-label={`별점 ${entry.rating}점`}>
        {"★".repeat(entry.rating)}
        {"☆".repeat(5 - entry.rating)}
      </p>
      {entry.review && (
        <p className="text-caption entry-snippet">{entry.review}</p>
      )}
    </Link>
  );
}
