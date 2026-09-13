"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Entry, EntryType, TYPE_LABEL } from "@/lib/types";

interface SearchResult {
  appleMusicId: string;
  artist: string;
  title: string;
  year: string;
  cover: string;
}

const TYPES: EntryType[] = ["album", "ep", "single", "song"];

export default function EntryForm({ initial }: { initial?: Entry }) {
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
  const [interpretation, setInterpretation] = useState(
    initial?.interpretation ?? ""
  );

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
    };

    if (initial) {
      const { error: dbError } = await supabase
        .from("entries")
        .update(payload)
        .eq("id", initial.id);
      setSaving(false);
      if (dbError) {
        setError("저장에 실패했어요: " + dbError.message);
        return;
      }
      router.push(`/entry/${initial.id}`);
      router.refresh();
      return;
    }

    const { data, error: dbError } = await supabase
      .from("entries")
      .insert(payload)
      .select()
      .single();
    setSaving(false);

    if (dbError) {
      setError("저장에 실패했어요: " + dbError.message);
      return;
    }

    router.push(data ? `/entry/${data.id}` : "/");
    router.refresh();
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

      <div className="form-group">
        <label className="text-caption-strong" htmlFor="interpretation">
          해석
        </label>
        <textarea
          id="interpretation"
          className="textarea"
          rows={5}
          value={interpretation}
          onChange={(e) => setInterpretation(e.target.value)}
          placeholder="가사, 컨셉, 사운드가 표현하는 것 등을 해석해보세요"
        />
      </div>

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
