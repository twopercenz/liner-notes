import Link from "next/link";
import { Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-muted">
        <Music2 className="size-8 text-muted-foreground" />
      </div>
      <h1 className="text-xl font-extrabold tracking-tight">이 페이지는 없어요</h1>
      <p className="text-sm text-muted-foreground">
        찾으시는 글이 삭제됐거나, 주소가 잘못됐을 수 있어요.
      </p>
      <div className="flex gap-2">
        <Button asChild>
          <Link href="/">홈으로</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/explore">둘러보기</Link>
        </Button>
      </div>
    </div>
  );
}
