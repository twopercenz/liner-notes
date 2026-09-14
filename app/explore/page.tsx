import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PostCard from "@/components/PostCard";
import WorkCard from "@/components/WorkCard";
import { fetchAllTags, fetchPostsByTagSlug, searchPosts } from "@/lib/posts";
import { supabase } from "@/lib/supabaseClient";
import { Work } from "@/lib/types";

export const revalidate = 0;
export const metadata = { title: "둘러보기" };

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const { q, tag } = await searchParams;

  if (q) {
    const posts = await searchPosts(q);
    return (
      <ExploreShell activeQuery={q}>
        <p className="mb-4 text-sm text-muted-foreground">
          “{q}” 검색 결과 {posts.length}건
        </p>
        {posts.length === 0 ? (
          <EmptyState text="일치하는 가사/해석을 찾지 못했어요." />
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </ExploreShell>
    );
  }

  if (tag) {
    const posts = await fetchPostsByTagSlug(tag);
    return (
      <ExploreShell activeTag={tag}>
        <p className="mb-4 text-sm text-muted-foreground">
          #{posts[0]?.tags.find((t) => t.slug === tag)?.name ?? tag} 태그 {posts.length}건
        </p>
        {posts.length === 0 ? (
          <EmptyState text="이 태그가 달린 해석이 아직 없어요." />
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </ExploreShell>
    );
  }

  const [tags, { data: works }] = await Promise.all([
    fetchAllTags(),
    supabase.from("works").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <ExploreShell>
      {tags.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            무드로 찾기
          </h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <Badge asChild key={t.id} variant="outline" className="text-sm">
                <Link href={`/explore?tag=${t.slug}`}>#{t.name}</Link>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        전체 작품
      </h2>
      {!works || works.length === 0 ? (
        <EmptyState text="아직 등록된 작품이 없어요." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {(works as Work[]).map((w) => (
            <WorkCard key={w.id} work={w} />
          ))}
        </div>
      )}
    </ExploreShell>
  );
}

function ExploreShell({
  children,
  activeQuery,
  activeTag,
}: {
  children: React.ReactNode;
  activeQuery?: string;
  activeTag?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <div className="mb-6 space-y-3">
        <h1 className="text-2xl font-extrabold tracking-tight">둘러보기</h1>
        <form action="/explore" className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            type="search"
            defaultValue={activeQuery}
            placeholder="가사, 해석 검색"
            className="pl-9"
          />
        </form>
        {(activeQuery || activeTag) && (
          <Link href="/explore" className="text-sm text-primary hover:underline">
            ← 전체 둘러보기로 돌아가기
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
