import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import EntryForm from "@/components/EntryForm";
import {
  Annotation,
  AnnotationDraft,
  Entry,
  Track,
  TrackAnnotation,
  TrackDraft,
} from "@/lib/types";

export const revalidate = 0;

export default async function EditEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: entry } = await supabase
    .from("entries")
    .select("*")
    .eq("id", id)
    .single();

  if (!entry) notFound();

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

  const initialAnnotations: AnnotationDraft[] = (
    (annotations ?? []) as Annotation[]
  ).map((a) => ({
    id: a.id,
    start_offset: a.start_offset,
    end_offset: a.end_offset,
    quote: a.quote,
    note: a.note,
  }));

  const trackRows = (tracks ?? []) as Track[];
  let initialTracks: TrackDraft[] = trackRows.map((t) => ({
    id: t.id,
    title: t.title,
    lyrics: t.lyrics ?? "",
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

    const byTrackId = new Map<string, AnnotationDraft[]>();
    for (const a of (trackAnnotations ?? []) as TrackAnnotation[]) {
      const list = byTrackId.get(a.track_id) ?? [];
      list.push({
        id: a.id,
        start_offset: a.start_offset,
        end_offset: a.end_offset,
        quote: a.quote,
        note: a.note,
      });
      byTrackId.set(a.track_id, list);
    }

    initialTracks = initialTracks.map((t) => ({
      ...t,
      annotations: byTrackId.get(t.id) ?? [],
    }));
  }

  return (
    <section className="page-form">
      <h1 className="text-display-md">글 수정하기</h1>
      <EntryForm
        initial={entry as Entry}
        initialAnnotations={initialAnnotations}
        initialTracks={initialTracks}
      />
    </section>
  );
}
