"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import LyricsAnnotator from "./LyricsAnnotator";
import { TrackDraft } from "@/lib/types";

interface TrackListProps {
  artist: string;
  appleMusicId: string;
  tracks: TrackDraft[];
  onChange: (tracks: TrackDraft[]) => void;
}

// 앨범/EP/싱글은 제목이 앨범명이라, 트랙(곡)을 여러 개 추가하고 트랙마다
// (아티스트 + 그 곡 제목)으로 따로 가사를 가져오고 구절별 해석도 각자 단다.
export default function TrackList({
  artist,
  appleMusicId,
  tracks,
  onChange,
}: TrackListProps) {
  const [newTitle, setNewTitle] = useState("");
  const [fetchingList, setFetchingList] = useState(false);
  const [listError, setListError] = useState("");
  const [openTrackId, setOpenTrackId] = useState<string | null>(null);
  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null);
  const [trackErrors, setTrackErrors] = useState<Record<string, string>>({});

  function addTrack(title: string) {
    if (!title.trim()) return;
    const draft: TrackDraft = {
      id: crypto.randomUUID(),
      title: title.trim(),
      lyrics: "",
      posts: [],
    };
    onChange([...tracks, draft]);
    setOpenTrackId(draft.id);
    setNewTitle("");
  }

  function updateTrack(id: string, patch: Partial<TrackDraft>) {
    onChange(tracks.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function removeTrack(id: string) {
    onChange(tracks.filter((t) => t.id !== id));
    if (openTrackId === id) setOpenTrackId(null);
  }

  async function fetchTracklist() {
    if (!appleMusicId) return;
    setFetchingList(true);
    setListError("");
    try {
      const res = await fetch(
        `/api/tracklist?collectionId=${encodeURIComponent(appleMusicId)}`
      );
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.tracks?.length) {
        setListError((data && data.error) || "트랙 목록을 가져오지 못했어요.");
        return;
      }
      const fetched: TrackDraft[] = data.tracks.map((t: { title: string }) => ({
        id: crypto.randomUUID(),
        title: t.title,
        lyrics: "",
        posts: [],
      }));
      onChange([...tracks, ...fetched]);
    } catch {
      setListError("트랙 목록 조회에 실패했어요. 네트워크 상태를 확인해주세요.");
    } finally {
      setFetchingList(false);
    }
  }

  async function fetchTrackLyrics(track: TrackDraft) {
    if (!artist.trim() || !track.title.trim()) return;
    if (
      track.posts.length > 0 &&
      !confirm("가사를 새로 가져오면 이 곡에 추가한 해석이 모두 사라져요. 계속할까요?")
    ) {
      return;
    }

    setLoadingTrackId(track.id);
    setTrackErrors((prev) => ({ ...prev, [track.id]: "" }));
    try {
      const res = await fetch(
        `/api/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(track.title)}`
      );
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.lyrics) {
        setTrackErrors((prev) => ({
          ...prev,
          [track.id]: (data && data.error) || "가사를 찾지 못했어요.",
        }));
        return;
      }
      updateTrack(track.id, { lyrics: data.lyrics, posts: [] });
    } catch {
      setTrackErrors((prev) => ({
        ...prev,
        [track.id]: "가사 조회에 실패했어요. 네트워크 상태를 확인해주세요.",
      }));
    } finally {
      setLoadingTrackId(null);
    }
  }

  function handleTrackLyricsEdit(track: TrackDraft, value: string) {
    if (value === track.lyrics) return;
    if (
      track.posts.length > 0 &&
      !confirm("가사를 바꾸면 이 곡에 추가한 해석이 모두 사라져요. 계속할까요?")
    ) {
      return;
    }
    updateTrack(track.id, { lyrics: value, posts: [] });
  }

  return (
    <div className="space-y-3">
      {appleMusicId && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchTracklist}
            disabled={fetchingList}
          >
            {fetchingList ? "가져오는 중…" : "트랙 목록 자동으로 가져오기"}
          </Button>
          {listError && (
            <span className="text-sm text-destructive">{listError}</span>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="트랙(곡) 제목을 입력하고 추가"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTrack(newTitle);
            }
          }}
        />
        <Button type="button" variant="outline" onClick={() => addTrack(newTitle)}>
          + 트랙 추가
        </Button>
      </div>

      {tracks.length === 0 && (
        <p className="text-sm text-muted-foreground">아직 추가한 트랙이 없어요.</p>
      )}

      <ul className="space-y-2">
        {tracks.map((track) => {
          const isOpen = openTrackId === track.id;
          return (
            <li key={track.id} className="overflow-hidden rounded-lg border">
              <div
                className="flex cursor-pointer items-center gap-2 px-3 py-2"
                onClick={() => setOpenTrackId(isOpen ? null : track.id)}
              >
                {isOpen ? (
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                )}
                <Input
                  value={track.title}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => updateTrack(track.id, { title: e.target.value })}
                  className="h-8 flex-1 border-transparent bg-transparent shadow-none focus-visible:border-input"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTrack(track.id);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              {isOpen && (
                <div className="space-y-3 border-t bg-muted/30 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fetchTrackLyrics(track)}
                      disabled={
                        loadingTrackId === track.id ||
                        !artist.trim() ||
                        !track.title.trim()
                      }
                    >
                      {loadingTrackId === track.id
                        ? "가져오는 중…"
                        : "가사 자동으로 가져오기"}
                    </Button>
                    {trackErrors[track.id] && (
                      <span className="text-sm text-destructive">
                        {trackErrors[track.id]}
                      </span>
                    )}
                  </div>
                  <Textarea
                    rows={6}
                    value={track.lyrics}
                    onChange={(e) => handleTrackLyricsEdit(track, e.target.value)}
                    placeholder="가사를 붙여넣거나 위 버튼으로 가져와보세요"
                  />
                  {track.lyrics.trim() && (
                    <LyricsAnnotator
                      lyrics={track.lyrics}
                      annotations={track.posts.map((p) => ({
                        ...p,
                        tags: p.tags.map((name) => ({ name })),
                      }))}
                      editable
                      onAdd={(draft) =>
                        updateTrack(track.id, {
                          posts: [
                            ...track.posts,
                            {
                              id: crypto.randomUUID(),
                              start_offset: draft.start_offset,
                              end_offset: draft.end_offset,
                              quote: draft.quote,
                              note: draft.note,
                              tags: draft.tags,
                            },
                          ],
                        })
                      }
                      onDelete={(id) =>
                        updateTrack(track.id, {
                          posts: track.posts.filter((p) => p.id !== id),
                        })
                      }
                    />
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
