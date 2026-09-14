"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  AnnotationDraft,
  Entry,
  EntryType,
  TYPE_LABEL,
  TrackDraft,
} from "@/lib/types";
import LyricsAnnotator from "./LyricsAnnotator";
import TrackList from "./TrackList";

interface SearchResult {
  appleMusicId: string;
  artist: string;
  title: string;
  year: string;
  cover: string;
}

const TYPES: EntryType[] = ["album", "ep", "single", "song"];

export default function EntryForm({
  initial,
  initialAnnotations = [],
  initialTracks = [],
}: {
  initial?: Entry;
  initialAnnotations?: AnnotationDraft[];
  initialTracks?: TrackDraft[];
}) {
  const router = useRouter();

  const [type, setType] = useState<EntryType>(initial?.type ?? "album");
  const [artist, setArtist] = useState(initial?.artist ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [year, setYear] = useState(initial?.year ?? "");
  const [cover, setCover] = useState(initial?.cover_url ?? "");
  const [appleMusicId, setAppleMusicId] = useState(
    initial?.apple_music_id ?? ""
  );
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [review, setReview] = useState(initial?.review ?? "");
  // 하위호환: 줄 단위 해석 이전에 쓰던 자유 텍스트 해석. 예전 글에 값이 있으면
  // 계속 편집할 수 있게 남겨두고, 없는 글에는 아예 보여주지 않는다.
  const [interpretation, setInterpretation] = useState(
    initial?.interpretation ?? ""
  );

  // "곡" 타입 전용: 항목 자체가 노래 한 곡이므로 가사를 entries에 바로 붙인다.
  const [lyrics, setLyrics] = useState(initial?.lyrics ?? "");
  const [annotations, setAnnotations] =
    useState<AnnotationDraft[]>(initialAnnotations);
  const [fetchingLyrics, setFetchingLyrics] = useState(false);
  const [lyricsError, setLyricsError] = useState("");

  // 앨범/EP/싱글 전용: 제목이 앨범명이라 곡별로 트랙을 따로 두고 각각 가사를 가져온다.
  const [tracks, setTracks] = useState<TrackDraft[]>(initialTracks);

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // 검색어나 분류(앨범↔곡)가 바뀔 때마다 iTunes Search API를 다시 호출한다 (디바운스 350ms).
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

  // 가사를 (새로 가져오거나 직접 입력해서) 바꾸면, 이미 달아둔 해석들의
  // 문자 위치(offset)가 더 이상 맞지 않게 되므로 확인 후 함께 초기화한다.
  function confirmClearAnnotationsIfNeeded() {
    if (annotations.length === 0) return true;
    return confirm(
      "가사를 바꾸면 지금까지 추가한 구절별 해석이 모두 사라져요. 계속할까요?"
    );
  }

  function handleLyricsChange(value: string) {
    if (value === lyrics) return;
    if (!confirmClearAnnotationsIfNeeded()) return;
    setAnnotations([]);
    setLyrics(value);
  }

  async function fetchLyrics() {
    if (!artist.trim() || !title.trim()) return;
    if (!confirmClearAnnotationsIfNeeded()) return;

    setFetchingLyrics(true);
    setLyricsError("");
    try {
      const res = await fetch(
        `/api/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`
      );
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.lyrics) {
        setLyricsError((data && data.error) || "가사를 찾지 못했어요.");
        return;
      }
      setAnnotations([]);
      setLyrics(data.lyrics);
    } catch {
      setLyricsError("가사 조회에 실패했어요. 네트워크 상태를 확인해주세요.");
    } finally {
      setFetchingLyrics(false);
    }
  }

  function handleAddAnnotation(draft: {
    start_offset: number;
    end_offset: number;
    quote: string;
    note: string;
  }) {
    setAnnotations((prev) => [
      ...prev,
      { id: crypto.randomUUID(), ...draft },
    ]);
  }

  function handleDeleteAnnotation(id: string) {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  }

  // 매번 전체를 지우고 다시 넣는 단순한 전략. 개인 프로젝트 규모에서는
  // 어떤 해석이 새로 생기고 지워졌는지 서버와 diff를 맞추는 것보다 훨씬 간단하고,
  // 저장 버튼을 누른 시점의 화면 상태를 그대로 진실로 삼을 수 있다.
  async function saveAnnotations(entryId: string) {
    const { error: delErr } = await supabase
      .from("annotations")
      .delete()
      .eq("entry_id", entryId);
    if (delErr) throw delErr;

    if (annotations.length === 0) return;

    const rows = annotations.map((a) => ({
      entry_id: entryId,
      start_offset: a.start_offset,
      end_offset: a.end_offset,
      quote: a.quote,
      note: a.note,
    }));
    const { error: insErr } = await supabase.from("annotations").insert(rows);
    if (insErr) throw insErr;
  }

  // 트랙(곡) 목록도 같은 "전체 삭제 후 다시 삽입" 전략을 쓴다.
  // 새로 넣은 트랙들의 id를 받아와서, 그 순서 그대로 각 트랙의 해석들을 매칭해 넣는다.
  async function saveTracks(entryId: string) {
    const { error: delErr } = await supabase
      .from("tracks")
      .delete()
      .eq("entry_id", entryId);
    if (delErr) throw delErr;

    if (tracks.length === 0) return;

    const rows = tracks.map((t) => ({
      entry_id: entryId,
      title: t.title.trim(),
      lyrics: t.lyrics.trim() || null,
    }));
    const { data: inserted, error: insErr } = await supabase
      .from("tracks")
      .insert(rows)
      .select();
    if (insErr) throw insErr;
    if (!inserted) return;

    const annotationRows = inserted.flatMap((row: { id: string }, i: number) =>
      tracks[i].annotations.map((a) => ({
        track_id: row.id,
        start_offset: a.start_offset,
        end_offset: a.end_offset,
        quote: a.quote,
        note: a.note,
      }))
    );

    if (annotationRows.length > 0) {
      const { error: annErr } = await supabase
        .from("track_annotations")
        .insert(annotationRows);
      if (annErr) throw annErr;
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
      interpretation: interpretation.trim() || null,
      lyrics: lyrics.trim() || null,
    };

    try {
      if (initial) {
        const { error: dbError } = await supabase
          .from("entries")
          .update(payload)
          .eq("id", initial.id);
        if (dbError) throw dbError;

        await saveAnnotations(initial.id);
        await saveTracks(initial.id);
        router.push(`/entry/${initial.id}`);
        router.refresh();
        return;
      }

      const { data, error: dbError } = await supabase
        .from("entries")
        .insert(payload)
        .select()
        .single();
      if (dbError) throw dbError;

      if (data) {
        await saveAnnotations(data.id);
        await saveTracks(data.id);
      }
      router.push(data ? `/entry/${data.id}` : "/browse");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError("저장에 실패했어요: " + message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="entry-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="text-caption-strong">분류</label>
        <div className="chip-row">
          {TYPES.map((t) => (
            <button
              type="button"
              key={t}
              className={`configurator-chip ${
                type === t ? "configurator-chip--selected" : ""
              }`}
              onClick={() => setType(t)}
            >
              {TYPE_LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group search-wrap">
        <label className="text-caption-strong" htmlFor="search">
          Apple Music에서 검색{" "}
          <span className="text-fine-print">
            (아티스트·제목·커버를 자동으로 채워줘요)
          </span>
        </label>
        <input
          id="search"
          className="search-input"
          type="search"
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
        {showResults && searchTerm.trim() && (
          <ul className="search-results">
            {searching && (
              <li className="text-caption search-results-status">
                검색 중…
              </li>
            )}
            {!searching && searchError && (
              <li className="text-caption search-results-status search-results-error">
                {searchError}
              </li>
            )}
            {!searching && !searchError && results.length === 0 && (
              <li className="text-caption search-results-status">
                검색 결과가 없어요. 아래 입력칸에 직접 적어도 괜찮아요.
              </li>
            )}
            {!searching &&
              !searchError &&
              results.map((r) => (
                <li key={r.appleMusicId}>
                  <button
                    type="button"
                    className="search-result"
                    onClick={() => pickResult(r)}
                  >
                    {r.cover ? (
                      <img src={r.cover} alt="" />
                    ) : (
                      <span className="search-result-fallback">♪</span>
                    )}
                    <span className="search-result-text">
                      <span className="text-body-strong">{r.title}</span>
                      <span className="text-caption">
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
        <div className="cover-preview">
          <img src={cover} alt="선택된 커버" />
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label className="text-caption-strong" htmlFor="artist">
            아티스트
          </label>
          <input
            id="artist"
            className="text-input"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="text-caption-strong" htmlFor="title">
            제목
          </label>
          <input
            id="title"
            className="text-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="text-caption-strong" htmlFor="year">
            발매연도
          </label>
          <input
            id="year"
            className="text-input"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="예: 2023"
          />
        </div>
        <div className="form-group">
          <label className="text-caption-strong">별점</label>
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                className={`star ${n <= rating ? "star--filled" : ""}`}
                onClick={() => setRating(n === rating ? 0 : n)}
                aria-label={`${n}점`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="text-caption-strong" htmlFor="review">
          감상평
        </label>
        <textarea
          id="review"
          className="textarea"
          rows={3}
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="짧은 한줄평이나 전체적인 느낌을 적어보세요"
        />
      </div>

      {initial?.interpretation && (
        <div className="form-group">
          <label className="text-caption-strong" htmlFor="interpretation">
            이전 해석{" "}
            <span className="text-fine-print">
              (구절별 해석 기능이 생기기 전에 쓴 글이에요. 계속 두거나, 아래
              가사에 구절별로 다시 옮겨 적어도 좋아요)
            </span>
          </label>
          <textarea
            id="interpretation"
            className="textarea"
            rows={4}
            value={interpretation}
            onChange={(e) => setInterpretation(e.target.value)}
          />
        </div>
      )}

      {type === "song" ? (
        <>
          <div className="form-group">
            <label className="text-caption-strong" htmlFor="lyrics">
              가사
            </label>
            <div className="lyrics-fetch-row">
              <button
                type="button"
                className="btn-secondary-pill"
                onClick={fetchLyrics}
                disabled={fetchingLyrics || !artist.trim() || !title.trim()}
              >
                {fetchingLyrics ? "가져오는 중…" : "가사 자동으로 가져오기"}
              </button>
              {lyricsError && (
                <span className="text-caption form-error">{lyricsError}</span>
              )}
            </div>
            <textarea
              id="lyrics"
              className="textarea"
              rows={8}
              value={lyrics}
              onChange={(e) => handleLyricsChange(e.target.value)}
              placeholder="가사를 붙여넣거나, 위 버튼으로 자동으로 가져와보세요"
            />
          </div>

          {lyrics.trim() && (
            <div className="form-group">
              <label className="text-caption-strong">구절별 해석</label>
              <LyricsAnnotator
                lyrics={lyrics}
                annotations={annotations}
                editable
                onAdd={handleAddAnnotation}
                onDelete={handleDeleteAnnotation}
              />
            </div>
          )}
        </>
      ) : (
        <div className="form-group">
          <label className="text-caption-strong">
            트랙(곡)별 가사 & 해석{" "}
            <span className="text-fine-print">
              (앨범/EP/싱글은 곡이 여러 개라 트랙마다 따로 가사를 가져와요)
            </span>
          </label>
          <TrackList
            artist={artist}
            appleMusicId={appleMusicId}
            tracks={tracks}
            onChange={setTracks}
          />
        </div>
      )}

      {error && <p className="text-caption form-error">{error}</p>}

      <div className="form-actions">
        <button type="button" className="link" onClick={() => router.back()}>
          취소
        </button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "저장 중…" : "저장"}
        </button>
      </div>
    </form>
  );
}
