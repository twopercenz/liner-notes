import Link from "next/link";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/PostCard";
import { fetchFeed } from "@/lib/posts";

export const revalidate = 0;

// 메인 피드: 가사 구절 + 해석이 최신순으로 흐르는 타임라인.
// 이 사이트의 핵심 화면 — 앨범/아티스트 정보는 각 카드의 보조 컨텍스트일 뿐이다.
export default async function HomePage() {
  const posts = await fetchFeed();

  return (
    <div className="mx-auto max-w-xl px-4 py-6 sm:px-6">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight">가사 피드</h1>
        <p className="text-sm text-muted-foreground">
          인디 밴드 가사의 한 구절과 그 해석이 모이는 곳
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            아직 올라온 가사 해석이 없어요. 첫 글을 남겨보세요.
          </p>
          <Button asChild>
            <Link href="/write">첫 글쓰기</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
