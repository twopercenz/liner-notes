import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import DeleteButton from "@/components/DeleteButton";
import { Entry, TYPE_LABEL } from "@/lib/types";

export const revalidate = 0;

export default async function EntryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data } = await supabase
    .from("entries")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();
  const entry = data as Entry;

  return (
    <section className="product-tile product-tile--light entry-detail">
      {entry.cover_url && (
        <img
          className="detail-cover"
          src={entry.cover_url}
          alt={`${entry.artist} - ${entry.title}`}
        />
      )}
      <span className="btn-pearl-capsule">{TYPE_LABEL[entry.type]}</span>
      <h1 className="text-display-lg">{entry.title}</h1>
      <p className="text-lead">
        {entry.artist}
        {entry.year ? ` · ${entry.year}` : ""}
      </p>
      <p className="entry-stars-lg" aria-label={`별점 ${entry.rating}점`}>
        {"★".repeat(entry.rating)}
        {"☆".repeat(5 - entry.rating)}
      </p>

      {entry.review && (
        <div className="detail-section">
          <h2 className="text-caption-strong">감상평</h2>
          <p className="text-body">{entry.review}</p>
        </div>
      )}

      {entry.interpretation && (
        <div className="detail-section">
          <h2 className="text-caption-strong">해석</h2>
          <p className="text-body">{entry.interpretation}</p>
        </div>
      )}

      {!entry.review && !entry.interpretation && (
        <p className="text-caption">
          아직 작성된 감상평/해석이 없어요.
        </p>
      )}

      <div className="detail-actions">
        <Link href={`/write/${entry.id}`} className="btn-secondary-pill">
          수정하기
        </Link>
        <DeleteButton id={entry.id} />
      </div>
    </section>
  );
}
