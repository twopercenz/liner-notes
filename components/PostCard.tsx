import Link from "next/link";
import { MessageCircle, Music2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LikeButton from "@/components/LikeButton";
import { PostWithContext } from "@/lib/types";

export default function PostCard({ post }: { post: PostWithContext }) {
  const { work } = post.track;

  return (
    <Card className="gap-4 py-5 transition-colors hover:border-primary/40">
      <CardHeader className="flex-row items-center gap-3 px-5">
        <Link
          href={`/entry/${work.id}`}
          className="flex min-w-0 items-center gap-3"
        >
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
            {work.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={work.cover_url}
                alt=""
                className="size-full object-cover"
              />
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
      </CardHeader>

      <CardContent className="px-5">
        <Link href={`/post/${post.id}`} className="block space-y-3">
          <p className="text-balance whitespace-pre-wrap text-lg leading-snug font-bold">
            “{post.quote}”
          </p>
          <p className="line-clamp-3 text-sm whitespace-pre-wrap text-muted-foreground">
            {post.note}
          </p>
        </Link>

        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Badge asChild key={tag.id} variant="secondary">
                <Link href={`/explore?tag=${tag.slug}`}>#{tag.name}</Link>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-1 px-5">
        <LikeButton postId={post.id} initialCount={post.like_count} />
        <Link
          href={`/post/${post.id}#comments`}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <MessageCircle className="size-4" />
          {post.comment_count > 0 ? post.comment_count : ""}
        </Link>
      </CardFooter>
    </Card>
  );
}
