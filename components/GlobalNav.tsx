import Link from "next/link";
import { Search, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteName } from "@/lib/site";

export default function GlobalNav() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0 text-lg font-extrabold tracking-tight">
          {siteName}
        </Link>

        <form action="/explore" className="hidden flex-1 sm:block">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              type="search"
              placeholder="가사, 해석 검색"
              className="pl-9"
            />
          </div>
        </form>

        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/explore">둘러보기</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/write">
              <PenSquare />
              글쓰기
            </Link>
          </Button>
        </nav>
      </div>

      <form action="/explore" className="border-t px-4 py-2 sm:hidden">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" type="search" placeholder="가사, 해석 검색" className="pl-9" />
        </div>
      </form>
    </header>
  );
}
