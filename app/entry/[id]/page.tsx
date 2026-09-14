import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import DeleteButton from "@/components/DeleteButton";
import LyricsAnnotator from "@/components/LyricsAnnotator";
import TrackListView, {
  TrackWithAnnotations,
} from "@/components/TrackListView";
import { Annotation, Entry, TYPE_LABEL, Track, TrackAnnotation } from "@/lib/types";

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

  const [{ data: annotations }, { data: tracks }] = await Promise.all([
    supabase
      .from("annotations")
      .select("*")
      .eq("entry_id", id)
      .order("start_offset", { ascending: true }),
    supabase
      .from("tracks")
      .select("*")
      .eq("entry_id", id)
      .order("created_at", { ascending: true }),
  ]);

  const trackRows = (tracks ?? []) as Track[];
  let tracksWithAnnotations: TrackWithAnnotations[] = trackRows.map((t) => ({
    ...t,
    annotations: [],
  }));

  if (trackRows.length > 0) {
    const { data: trackAnnotations } = await supabase
      .from("track_annotations")
      .select("*")
      .in(
        "track_id",
        trackRows.map((t) => t.id)
      )
      .order("start_offset", { ascending: true });

    const byTrackId = new Map<string, TrackAnnotation[]>();
    for (const a of (trackAnnotations ?? []) as TrackAnnotation[]) {
      const list = byTrackId.get(a.track_id) ?? [];
      list.push(a);
      byTrackId.set(a.track_id, list);
    }

    tracksWithAnnotations = tracksWithAnnotations.map((t) => ({
      ...t,
      annotations: byTrackId.get(t.id) ?? [],
    }));
  }

  const hasNotes = Boolean(
    entry.review ||
      entry.interpretation ||
      entry.lyrics ||
      tracksWithAnnotations.length > 0
  );

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

      {entry.lyrics && (
        <div className="detail-section">
          <h2 className="text-caption-strong">
            가사{" "}
            <span className="text-fine-print">
              (밑줄 친 구절을 눌러보세요)
            </span>
          </h2>
          <LyricsAnnotator
            lyrics={entry.lyrics}
            annotations={(annotations ?? []) as Annotation[]}
          />
        </div>
      )}

      {tracksWithAnnotations.length > 0 && (
        <div className="detail-section">
          <h2 className="text-caption-strong">
            트랙{" "}
            <span className="text-fine-print">
              (제목을 누르면 가사와 해석이 펼쳐져요)
            </span>
          </h2>
          <TrackListView tracks={tracksWithAnnotations} />
        </div>
      )}

      {!hasNotes && (
        <p className="text-caption">아직 작성된 감상평/해석이 없어요.</p>
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
