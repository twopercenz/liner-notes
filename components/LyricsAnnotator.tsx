"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { buildSegments, getSelectionOffsets } from "@/lib/textOffset";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import TagPicker from "@/components/TagPicker";
import { cn } from "@/lib/utils";

export interface AnnotatorTag {
  id?: string;
  name: string;
  slug?: string;
}

export interface AnnotationLike {
  id: string;
  start_offset: number;
  end_offset: number;
  quote: string;
  note: string;
  tags?: AnnotatorTag[];
}

interface LyricsAnnotatorProps<A extends AnnotationLike> {
  lyrics: string;
  annotations: A[];
  /** true면 구절 선택 → 해석 추가 / 기존 해석 삭제가 가능한 편집 모드 */
  editable?: boolean;
  onAdd?: (draft: {
    start_offset: number;
    end_offset: number;
    quote: string;
    note: string;
    tags: string[];
  }) => void;
  onDelete?: (id: string) => void;
  /** 읽기 전용 모드에서, 하이라이트를 클릭했을 때 상세 페이지로 보낼 링크를 만든다. */
  linkForAnnotation?: (annotation: A) => string | undefined;
}

interface PendingSelection {
  start: number;
  end: number;
  text: string;
}

export default function LyricsAnnotator<A extends AnnotationLike>({
  lyrics,
  annotations,
  editable = false,
  onAdd,
  onDelete,
  linkForAnnotation,
}: LyricsAnnotatorProps<A>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingSelection | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [tagDraft, setTagDraft] = useState<string[]>([]);
  const [selectionError, setSelectionError] = useState("");

  const segments = buildSegments(lyrics, annotations);

  function overlapsExisting(start: number, end: number) {
    return annotations.some(
      (a) => start < a.end_offset && end > a.start_offset
    );
  }

  function handleMouseUp() {
    if (!editable || !containerRef.current) return;
    const sel = getSelectionOffsets(containerRef.current);
    if (!sel) return;

    if (overlapsExisting(sel.start, sel.end)) {
      setSelectionError("이미 해석이 달린 구절과 겹쳐서 선택할 수 없어요.");
      setPending(null);
      window.getSelection()?.removeAllRanges();
      return;
    }

    setSelectionError("");
    setPending({ start: sel.start, end: sel.end, text: sel.text });
    setNoteDraft("");
    setTagDraft([]);
  }

  function confirmAdd() {
    if (!pending || !noteDraft.trim() || !onAdd) return;
    onAdd({
      start_offset: pending.start,
      end_offset: pending.end,
      quote: pending.text,
      note: noteDraft.trim(),
      tags: tagDraft,
    });
    setPending(null);
    setNoteDraft("");
    setTagDraft([]);
    window.getSelection()?.removeAllRanges();
  }

  function cancelAdd() {
    setPending(null);
    setNoteDraft("");
    setTagDraft([]);
    window.getSelection()?.removeAllRanges();
  }

  return (
    <div className="space-y-3">
      {editable && (
        <p className="text-xs text-muted-foreground">
          해석을 달고 싶은 구절을 마우스로 드래그해서 선택해보세요.
        </p>
      )}

      <div
        ref={containerRef}
        onMouseUp={handleMouseUp}
        className="rounded-lg border bg-muted/40 p-4 text-[15px] leading-loose whitespace-pre-wrap select-text"
      >
        {segments.map((seg, i) => {
          if (!seg.annotation) return <span key={i}>{seg.text}</span>;

          const ann = seg.annotation;
          const isOpen = openId === ann.id;
          const href = linkForAnnotation?.(ann);
          const HighlightTag = href ? Link : "span";

          return (
            <span key={ann.id}>
              <HighlightTag
                href={href as string}
                className={cn(
                  "cursor-pointer rounded bg-primary/15 px-0.5 underline decoration-primary decoration-2 underline-offset-2 transition-colors hover:bg-primary/25",
                  isOpen && "bg-primary text-primary-foreground"
                )}
                onClick={(e: React.MouseEvent) => {
                  if (href) return; // 읽기 전용에서는 상세 페이지로 이동
                  e.preventDefault();
                  setOpenId(isOpen ? null : ann.id);
                }}
              >
                {seg.text}
              </HighlightTag>
              {isOpen && !href && (
                <span className="mt-1 mb-2 block rounded-md border-l-4 border-primary bg-background px-3 py-2 text-sm shadow-sm">
                  <span className="block whitespace-pre-wrap">{ann.note}</span>
                  {ann.tags && ann.tags.length > 0 && (
                    <span className="mt-1.5 flex flex-wrap gap-1">
                      {ann.tags.map((t) => (
                        <Badge key={t.name} variant="outline" className="text-[11px]">
                          #{t.name}
                        </Badge>
                      ))}
                    </span>
                  )}
                  {editable && onDelete && (
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="mt-1 h-auto p-0 text-destructive"
                      onClick={() => {
                        onDelete(ann.id);
                        setOpenId(null);
                      }}
                    >
                      이 해석 삭제
                    </Button>
                  )}
                </span>
              )}
            </span>
          );
        })}
      </div>

      {editable && selectionError && (
        <p className="text-sm font-medium text-destructive">{selectionError}</p>
      )}

      {editable && pending && (
        <div className="space-y-3 rounded-lg border p-4">
          <p className="text-sm">
            선택한 구절:{" "}
            <span className="rounded bg-accent px-1.5 py-0.5 font-semibold text-accent-foreground">
              “{pending.text}”
            </span>
          </p>
          <Textarea
            rows={3}
            autoFocus
            placeholder="이 구절에 대한 해석을 적어보세요"
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
          />
          <TagPicker value={tagDraft} onChange={setTagDraft} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={cancelAdd}>
              취소
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!noteDraft.trim()}
              onClick={confirmAdd}
            >
              해석 추가
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
