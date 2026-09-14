import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Music2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DeleteButton from "@/components/DeleteButton";
import WorkTracks, { TrackWithPosts } from "@/components/WorkTracks";
import { Work, WORK_TYPE_LABEL } from "@/lib/types";
import { cn } from "@/lib/utils";

export const revalidate = 0;

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data } = await supabase.from("works").select("*").eq("id", id).single();
  if (!data) notFound();
  const work = data as Work;

  const { data: trackRows } = await supabase
    .from("tracks")
    .select("*")
    .eq("work_id", id)
    .order("created_at", { ascending: true });

  const tracks = trackRows ?? [];
  let tracksWithPosts: TrackWithPosts[] = tracks.map((t) => ({
    id: t.id,
    title: t.title,
    lyrics: t.lyrics,
    posts: [],
  }));

  if (tracks.length > 0) {
    const { data: postRows } = await supabase
      .from("posts")
      .select("*, post_tags(tag:tags(id,name,slug))")
      .in(
        "track_id",
        tracks.map((t) => t.id)
      )
      .order("start_offset", { ascending: true });

    const byTrackId = new Map<string, TrackWithPosts["posts"]>();
    for (const p of postRows ?? []) {
      const list = byTrackId.get(p.track_id) ?? [];
      list.push({
        id: p.id,
        start_offset: p.start_offset,
        end_offset: p.end_offset,
        quote: p.quote,
        note: p.note,
        tags: (p.post_tags ?? []).map(
          (pt: { tag: { id: string; name: string; slug: string } }) => pt.tag
        ),
      });
      byTrackId.set(p.track_id, list);
    }

    tracksWithPosts = tracksWithPosts.map((t) => ({
      ...t,
      posts: byTrackId.get(t.id) ?? [],
    }));
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
          {work.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={work.cover_url} alt="" className="size-full object-cover" />
          ) : (
            <Music2 className="size-8 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 space-y-1.5">
          <Badge variant="secondary">{WORK_TYPE_LABEL[work.type]}</Badge>
          <h1 className="text-2xl font-extrabold tracking-tight">{work.title}</h1>
          <p className="text-muted-foreground">
            {work.artist}
            {work.year ? ` · ${work.year}` : ""}
          </p>
          <div className="flex gap-0.5 pt-1" aria-label={`별점 ${work.rating}점`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={cn(
                  "size-4 text-muted-foreground/40",
                  n <= work.rating && "fill-primary text-primary"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {work.review && (
        <div className="rounded-lg bg-muted/40 p-4">
          <h2 className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            감상평
          </h2>
          <p className="text-sm whitespace-pre-wrap">{work.review}</p>
        </div>
      )}

      {tracksWithPosts.length > 0 && (
        <div>
          <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            트랙 <span className="normal-case">(제목을 누르면 가사와 해석이 펼쳐져요)</span>
          </h2>
          <WorkTracks tracks={tracksWithPosts} />
        </div>
      )}

      <div className="flex gap-2 border-t pt-4">
        <Button asChild variant="outline" size="sm">
          <Link href={`/write/${work.id}`}>수정하기</Link>
        </Button>
        <DeleteButton table="works" id={work.id} redirectTo="/explore" />
      </div>
    </div>
  );
}
