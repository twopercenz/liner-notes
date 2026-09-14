"use client";

import { useRef, useState } from "react";
import { buildSegments, getSelectionOffsets } from "@/lib/textOffset";

export interface AnnotationLike {
  id: string;
  start_offset: number;
  end_offset: number;
  quote: string;
  note: string;
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
  }) => void;
  onDelete?: (id: string) => void;
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
}: LyricsAnnotatorProps<A>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingSelection | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
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
  }

  function confirmAdd() {
    if (!pending || !noteDraft.trim() || !onAdd) return;
    onAdd({
      start_offset: pending.start,
      end_offset: pending.end,
      quote: pending.text,
      note: noteDraft.trim(),
    });
    setPending(null);
    setNoteDraft("");
    window.getSelection()?.removeAllRanges();
  }

  function cancelAdd() {
    setPending(null);
    setNoteDraft("");
    window.getSelection()?.removeAllRanges();
  }

  return (
    <div className="lyrics-annotator">
      {editable && (
        <p className="text-fine-print lyrics-hint">
          가사에서 해석을 달고 싶은 구절을 마우스로 드래그해서 선택해보세요.
        </p>
      )}

      <div className="lyrics-text" ref={containerRef} onMouseUp={handleMouseUp}>
        {segments.map((seg, i) =>
          seg.annotation ? (
            <span key={seg.annotation.id}>
              <span
                className={`lyric-highlight ${
                  openId === seg.annotation.id ? "lyric-highlight--open" : ""
                }`}
                onClick={() =>
                  setOpenId(openId === seg.annotation!.id ? null : seg.annotation!.id)
                }
              >
                {seg.text}
              </span>
              {openId === seg.annotation.id && (
                <span className="lyric-note">
                  <span className="text-body">{seg.annotation.note}</span>
                  {editable && onDelete && (
                    <button
                      type="button"
                      className="link-danger lyric-note-delete"
                      onClick={() => {
                        onDelete(seg.annotation!.id);
                        setOpenId(null);
                      }}
                    >
                      이 해석 삭제
                    </button>
                  )}
                </span>
              )}
            </span>
          ) : (
            <span key={i}>{seg.text}</span>
          )
        )}
      </div>

      {editable && selectionError && (
        <p className="text-caption form-error">{selectionError}</p>
      )}

      {editable && pending && (
        <div className="annotation-editor">
          <p className="text-caption">
            선택한 구절: <span className="annotation-editor-quote">“{pending.text}”</span>
          </p>
          <textarea
            className="textarea"
            rows={3}
            autoFocus
            placeholder="이 구절에 대한 해석을 적어보세요"
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
          />
          <div className="annotation-editor-actions">
            <button type="button" className="link" onClick={cancelAdd}>
              취소
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={!noteDraft.trim()}
              onClick={confirmAdd}
            >
              해석 추가
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
