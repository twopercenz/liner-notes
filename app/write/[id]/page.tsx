import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import WorkForm from "@/components/WorkForm";
import { PostDraft, TrackDraft, Work } from "@/lib/types";

export const revalidate = 0;
export const metadata = { title: "글 수정하기" };

export default async function EditWorkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: work } = await supabase
    .from("works")
    .select("*")
    .eq("id", id)
    .single();

  if (!work) notFound();

  const { data: trackRows } = await supabase
    .from("tracks")
    .select("*")
    .eq("work_id", id)
    .order("created_at", { ascending: true });

  const tracks = trackRows ?? [];
  let initialTracks: TrackDraft[] = tracks.map((t) => ({
    id: t.id,
    title: t.title,
    lyrics: t.lyrics ?? "",
    posts: [],
  }));

  if (tracks.length > 0) {
    const trackIds = tracks.map((t) => t.id);
    const { data: postRows } = await supabase
      .from("posts")
      .select("*, post_tags(tag:tags(name))")
      .in("track_id", trackIds)
      .order("start_offset", { ascending: true });

    const byTrackId = new Map<string, PostDraft[]>();
    for (const p of postRows ?? []) {
      const list = byTrackId.get(p.track_id) ?? [];
      list.push({
        id: p.id,
        start_offset: p.start_offset,
        end_offset: p.end_offset,
        quote: p.quote,
        note: p.note,
        tags: (p.post_tags ?? []).map((pt: { tag: { name: string } }) => pt.tag.name),
      });
      byTrackId.set(p.track_id, list);
    }

    initialTracks = initialTracks.map((t) => ({
      ...t,
      posts: byTrackId.get(t.id) ?? [],
    }));
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight">글 수정하기</h1>
      <WorkForm initial={work as Work} initialTracks={initialTracks} />
    </div>
  );
}
