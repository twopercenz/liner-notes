import Link from "next/link";
import { Music2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Work, WORK_TYPE_LABEL } from "@/lib/types";

export default function WorkCard({ work }: { work: Work }) {
  return (
    <Link
      href={`/entry/${work.id}`}
      className="group overflow-hidden rounded-lg border transition-colors hover:border-primary/40"
    >
      <div className="flex aspect-square items-center justify-center overflow-hidden bg-muted">
        {work.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={work.cover_url}
            alt=""
            className="size-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <Music2 className="size-8 text-muted-foreground" />
        )}
      </div>
      <div className="space-y-1 p-3">
        <Badge variant="secondary" className="text-[10px]">
          {WORK_TYPE_LABEL[work.type]}
        </Badge>
        <p className="truncate text-sm font-semibold">{work.title}</p>
        <p className="truncate text-xs text-muted-foreground">{work.artist}</p>
      </div>
    </Link>
  );
}
