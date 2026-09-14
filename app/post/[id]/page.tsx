import Link from "next/link";
import { notFound } from "next/navigation";
import { Music2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";
import LikeButton from "@/components/LikeButton";
import DeleteButton from "@/components/DeleteButton";
import CommentSection from "@/components/CommentSection";
import { fetchPostById } from "@/lib/posts";
import { Comment } from "@/lib/types";

export const revalidate = 0;

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await fetchPostById(id);
  if (!post) notFound();

  const { data: commentRows } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  const { work } = post.track;

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-8 sm:px-6">
      <Link
        href={`/entry/${work.id}`}
        className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/50"
      >
        <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
          {work.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={work.cover_url} alt="" className="size-full object-cover" />
          ) : (
            <Music2 className="size-4 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{post.track.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {work.artist}
            {work.year ? ` · ${work.year}` : ""}
          </p>
        </div>
      </Link>

      <div className="space-y-4 rounded-xl border p-6">
        <p className="text-balance whitespace-pre-wrap text-2xl leading-snug font-extrabold">
          “{post.quote}”
        </p>
        <p className="whitespace-pre-wrap text-base text-muted-foreground">
          {post.note}
        </p>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Badge asChild key={tag.id} variant="secondary">
                <Link href={`/explore?tag=${tag.slug}`}>#{tag.name}</Link>
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t pt-3">
          <LikeButton postId={post.id} initialCount={post.like_count} />
          <DeleteButton table="posts" id={post.id} redirectTo={`/entry/${work.id}`} />
        </div>
      </div>

      <CommentSection postId={post.id} comments={(commentRows ?? []) as Comment[]} />
    </div>
  );
}
