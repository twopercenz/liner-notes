"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import LyricsAnnotator from "@/components/LyricsAnnotator";
import TrackList from "@/components/TrackList";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import { TrackDraft, Work, WorkType, WORK_TYPE_LABEL } from "@/lib/types";

interface SearchResult {
  appleMusicId: string;
  artist: string;
  title: string;
  year: string;
  cover: string;
}

const TYPES: WorkType[] = ["album", "ep", "single", "song"];

function newSongTrack(title: string, existing?: TrackDraft): TrackDraft {
  return existing
    ? { ...existing, title }
    : { id: crypto.randomUUID(), title, lyrics: "", posts: [] };
}

export default function WorkForm({
  initial,
  initialTracks = [],
}: {
  initial?: Work;
  initialTracks?: TrackDraft[];
}) {
  const router = useRouter();

  const [type, setType] = useState<WorkType>(initial?.type ?? "album");
  const [artist, setArtist] = useState(initial?.artist ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [year, setYear] = useState(initial?.year ?? "");
  const [cover, setCover] = useState(initial?.cover_url ?? "");
  const [appleMusicId, setAppleMusicId] = useState(initial?.apple_music_id ?? "");
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [review, setReview] = useState(initial?.review ?? "");

  const [tracks, setTracks] = useState<TrackDraft[]>(
    initialTracks.length > 0
      ? initialTracks
      : type === "song"
        ? [newSongTrack(title)]
        : []
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // "곡" 타입은 트랙이 정확히 1개, 제목은 항상 work 제목과 같다.
  useEffect(() => {
    if (type !== "song") return;
    setTracks((prev) =>
      prev.length === 1 ? [newSongTrack(title, prev[0])] : [newSongTrack(title)]
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, title]);

  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setResults([]);
      setSearching(false);
      setSearchError("");
      return;
    }
    setSearching(true);
    setSearchError("");
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const entityType = type === "song" ? "song" : "album";
        const res = await fetch(
          `/api/search?term=${encodeURIComponent(trimmed)}&type=${entityType}`
        );
        const data = await res.json().catch(() => null);
        if (!res.ok || !data) {
          setResults([]);
          setSearchError(
            (data && data.error) ||
              `검색에 실패했어요 (오류 코드 ${res.status}). 잠시 후 다시 시도해주세요.`
          );
          return;
        }
        setResults(data.results ?? []);
      } catch {
        setResults([]);
        setSearchError("검색에 실패했어요. 네트워크 상태를 확인해주세요.");
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm, type]);

  function pickResult(r: SearchResult) {
    setArtist(r.artist);
    setTitle(r.title);
    setYear(r.year);
    setCover(r.cover);
    setAppleMusicId(r.appleMusicId);
    setShowResults(false);
    setSearchTerm("");
    setResults([]);
  }

  // work + tracks + posts를 한 번에 저장한다.
  // 수정일 때는 기존 트랙/포스트를 전부 지우고 지금 화면 상태 그대로 다시 넣는다
  // (개인 프로젝트 규모에서는 diff를 맞추는 것보다 훨씬 간단하고 안전하다).
  async function saveWork(workId: string) {
    const { error: delErr } = await supabase.from("tracks").delete().eq("work_id", workId);
    if (delErr) throw delErr;

    if (tracks.length === 0) return;

    const trackRows = tracks.map((t) => ({
      work_id: workId,
      title: t.title.trim() || title.trim(),
      lyrics: t.lyrics.trim() || null,
    }));
    const { data: insertedTracks, error: trackErr } = await supabase
      .from("tracks")
      .insert(trackRows)
      .select();
    if (trackErr) throw trackErr;
    if (!insertedTracks) return;

    const postRows = insertedTracks.flatMap((row: { id: string }, i: number) =>
      tracks[i].posts.map((p) => ({
        track_id: row.id,
        start_offset: p.start_offset,
        end_offset: p.end_offset,
        quote: p.quote,
        note: p.note,
      }))
    );

    if (postRows.length === 0) return;

    const { data: insertedPosts, error: postErr } = await supabase
      .from("posts")
      .insert(postRows)
      .select();
    if (postErr) throw postErr;
    if (!insertedPosts) return;

    // 태그: 이름 -> id를 upsert로 확보하고 post_tags로 연결한다.
    const allTagNames = Array.from(
      new Set(tracks.flatMap((t) => t.posts.flatMap((p) => p.tags)))
    ).filter(Boolean);

    if (allTagNames.length === 0) return;

    const tagRows = allTagNames.map((name) => ({
      name,
      slug: slugify(name),
    }));
    const { data: upsertedTags, error: tagErr } = await supabase
      .from("tags")
      .upsert(tagRows, { onConflict: "name" })
      .select();
    if (tagErr) throw tagErr;

    const tagIdByName = new Map((upsertedTags ?? []).map((t) => [t.name, t.id]));

    let postIndex = 0;
    const postTagRows: { post_id: string; tag_id: string }[] = [];
    tracks.forEach((t) => {
      t.posts.forEach((p) => {
        const insertedPost = insertedPosts[postIndex];
        postIndex += 1;
        p.tags.forEach((tagName) => {
          const tagId = tagIdByName.get(tagName);
          if (tagId && insertedPost) {
            postTagRows.push({ post_id: insertedPost.id, tag_id: tagId });
          }
        });
      });
    });

    if (postTagRows.length > 0) {
      const { error: linkErr } = await supabase.from("post_tags").insert(postTagRows);
      if (linkErr) throw linkErr;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!artist.trim() || !title.trim()) {
      setError("아티스트와 제목을 입력해주세요.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      type,
      artist: artist.trim(),
      title: title.trim(),
      year: year.trim() || null,
      cover_url: cover.trim() || null,
      apple_music_id: appleMusicId || null,
      rating,
      review: review.trim() || null,
    };

    try {
      if (initial) {
        const { error: dbError } = await supabase
          .from("works")
          .update(payload)
          .eq("id", initial.id);
        if (dbError) throw dbError;

        await saveWork(initial.id);
        toast.success("수정했어요.");
        router.push(`/entry/${initial.id}`);
        router.refresh();
        return;
      }

      const { data, error: dbError } = await supabase
        .from("works")
        .insert(payload)
        .select()
        .single();
      if (dbError) throw dbError;

      if (data) await saveWork(data.id);
      toast.success("저장했어요.");
      router.push(data ? `/entry/${data.id}` : "/explore");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError("저장에 실패했어요: " + message);
      toast.error("저장에 실패했어요.");
    } finally {
      setSaving(false);
    }
  }

  const songTrack = type === "song" ? tracks[0] : undefined;

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label>분류</Label>
        <ToggleGroup
          type="single"
          variant="outline"
          value={type}
          onValueChange={(v) => v && setType(v as WorkType)}
        >
          {TYPES.map((t) => (
            <ToggleGroupItem key={t} value={t}>
              {WORK_TYPE_LABEL[t]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="relative space-y-2">
        <Label htmlFor="search">
          Apple Music에서 검색{" "}
          <span className="font-normal text-muted-foreground">
            (아티스트·제목·커버를 자동으로 채워줘요)
          </span>
        </Label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            type="search"
            className="pl-9"
            placeholder={
              type === "song"
                ? "곡 제목을 검색해보세요"
                : "앨범 / EP / 싱글 제목을 검색해보세요"
            }
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
          />
        </div>
        {showResults && searchTerm.trim() && (
          <ul className="absolute top-full right-0 left-0 z-30 mt-1 max-h-80 overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
            {searching && (
              <li className="p-2 text-sm text-muted-foreground">검색 중…</li>
            )}
            {!searching && searchError && (
              <li className="p-2 text-sm text-destructive">{searchError}</li>
            )}
            {!searching && !searchError && results.length === 0 && (
              <li className="p-2 text-sm text-muted-foreground">
                검색 결과가 없어요. 아래 입력칸에 직접 적어도 괜찮아요.
              </li>
            )}
            {!searching &&
              !searchError &&
              results.map((r) => (
                <li key={r.appleMusicId}>
                  <button
                    type="button"
                    onClick={() => pickResult(r)}
                    className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-accent"
                  >
                    {r.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.cover} alt="" className="size-11 shrink-0 rounded object-cover" />
                    ) : (
                      <span className="flex size-11 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                        ♪
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{r.title}</span>
                      <span className="block truncate text-sm text-muted-foreground">
                        {r.artist}
                        {r.year ? ` · ${r.year}` : ""}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>

      {cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt="선택된 커버" className="size-28 rounded-lg border object-cover" />
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="artist">아티스트</Label>
          <Input id="artist" value={artist} onChange={(e) => setArtist(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">제목</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">발매연도</Label>
          <Input
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="예: 2023"
          />
        </div>
        <div className="space-y-2">
          <Label>별점</Label>
          <div className="flex gap-1 pt-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setRating(n === rating ? 0 : n)}
                aria-label={`${n}점`}
              >
                <Star
                  className={cn(
                    "size-6 text-muted-foreground/40",
                    n <= rating && "fill-primary text-primary"
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="review">감상평</Label>
        <Textarea
          id="review"
          rows={3}
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="짧은 한줄평이나 전체적인 느낌을 적어보세요"
        />
      </div>

      <div className="space-y-2">
        <Label>
          {type === "song" ? "가사 & 구절별 해석" : "트랙(곡)별 가사 & 해석"}
        </Label>
        {type === "song" && songTrack ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <SongLyricsFetchButton
                artist={artist}
                title={title}
                onFetched={(lyrics) =>
                  setTracks([{ ...songTrack, lyrics, posts: [] }])
                }
                hasExistingPosts={songTrack.posts.length > 0}
              />
            </div>
            <Textarea
              rows={8}
              value={songTrack.lyrics}
              onChange={(e) => {
                if (
                  songTrack.posts.length > 0 &&
                  e.target.value !== songTrack.lyrics &&
                  !confirm("가사를 바꾸면 지금까지 추가한 해석이 모두 사라져요. 계속할까요?")
                ) {
                  return;
                }
                setTracks([{ ...songTrack, lyrics: e.target.value, posts: [] }]);
              }}
              placeholder="가사를 붙여넣거나, 위 버튼으로 자동으로 가져와보세요"
            />
            {songTrack.lyrics.trim() && (
              <LyricsAnnotator
                lyrics={songTrack.lyrics}
                annotations={songTrack.posts.map((p) => ({
                  ...p,
                  tags: p.tags.map((name) => ({ name })),
                }))}
                editable
                onAdd={(draft) =>
                  setTracks([
                    {
                      ...songTrack,
                      posts: [
                        ...songTrack.posts,
                        {
                          id: crypto.randomUUID(),
                          start_offset: draft.start_offset,
                          end_offset: draft.end_offset,
                          quote: draft.quote,
                          note: draft.note,
                          tags: draft.tags,
                        },
                      ],
                    },
                  ])
                }
                onDelete={(id) =>
                  setTracks([
                    { ...songTrack, posts: songTrack.posts.filter((p) => p.id !== id) },
                  ])
                }
              />
            )}
          </>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              앨범/EP/싱글은 곡이 여러 개라 트랙마다 따로 가사를 가져와요.
            </p>
            <TrackList
              artist={artist}
              appleMusicId={appleMusicId}
              tracks={tracks}
              onChange={setTracks}
            />
          </>
        )}
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          취소
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "저장 중…" : "저장"}
        </Button>
      </div>
    </form>
  );
}

function SongLyricsFetchButton({
  artist,
  title,
  onFetched,
  hasExistingPosts,
}: {
  artist: string;
  title: string;
  onFetched: (lyrics: string) => void;
  hasExistingPosts: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchLyrics() {
    if (!artist.trim() || !title.trim()) return;
    if (
      hasExistingPosts &&
      !confirm("가사를 새로 가져오면 지금까지 추가한 해석이 모두 사라져요. 계속할까요?")
    ) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`
      );
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.lyrics) {
        setError((data && data.error) || "가사를 찾지 못했어요.");
        return;
      }
      onFetched(data.lyrics);
    } catch {
      setError("가사 조회에 실패했어요. 네트워크 상태를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={fetchLyrics}
        disabled={loading || !artist.trim() || !title.trim()}
      >
        {loading ? "가져오는 중…" : "가사 자동으로 가져오기"}
      </Button>
      {error && <span className="text-sm text-destructive">{error}</span>}
    </>
  );
}

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "");
}
