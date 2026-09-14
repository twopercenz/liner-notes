import Link from "next/link";
import { siteName } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-1">
          <p className="text-lg font-extrabold tracking-tight">{siteName}</p>
          <p className="text-sm text-muted-foreground">
            인디 밴드의 가사를 읽고, 해석하고, 나누는 공간
          </p>
        </div>
        <nav className="flex gap-5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            홈
          </Link>
          <Link href="/explore" className="hover:text-foreground">
            둘러보기
          </Link>
          <Link href="/write" className="hover:text-foreground">
            글쓰기
          </Link>
        </nav>
      </div>
      <div className="border-t px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} {siteName}
      </div>
    </footer>
  );
}
