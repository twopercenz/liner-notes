"use client";

import { useState } from "react";
import { TrackDraft } from "@/lib/types";
import LyricsAnnotator from "./LyricsAnnotator";

interface TrackListProps {
  artist: string;
  appleMusicId: string;
  tracks: TrackDraft[];
  onChange: (tracks: TrackDraft[]) => void;
}

// 앨범/EP/싱글은 제목이 앨범명이라, entries.lyrics 하나로는 "어느 곡" 가사인지
// 알 수 없다. 그래서 트랙(곡)을 여러 개 추가하고, 트랙마다 (아티스트 + 그 곡
// 제목)으로 따로 가사를 가져오고 구절별 해석도 각자 달 수 있게 한다.
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
      annotations: [],
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
        annotations: [],
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
      track.annotations.length > 0 &&
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
      updateTrack(track.id, { lyrics: data.lyrics, annotations: [] });
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
      track.annotations.length > 0 &&
      !confirm("가사를 바꾸면 이 곡에 추가한 해석이 모두 사라져요. 계속할까요?")
    ) {
      return;
    }
    updateTrack(track.id, { lyrics: value, annotations: [] });
  }

  return (
    <div className="track-list">
      {appleMusicId && (
        <div className="lyrics-fetch-row">
          <button
            type="button"
            className="btn-secondary-pill"
            onClick={fetchTracklist}
            disabled={fetchingList}
          >
            {fetchingList ? "가져오는 중…" : "트랙 목록 자동으로 가져오기"}
          </button>
          {listError && <span className="text-caption form-error">{listError}</span>}
        </div>
      )}

      <div className="track-add-row">
        <input
          className="text-input"
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
        <button
          type="button"
          className="btn-secondary-pill"
          onClick={() => addTrack(newTitle)}
        >
          + 트랙 추가
        </button>
      </div>

      {tracks.length === 0 && (
        <p className="text-caption">아직 추가한 트랙이 없어요.</p>
      )}

      <ul className="track-items">
        {tracks.map((track) => (
          <li key={track.id} className="track-item">
            <div
              className="track-item-header"
              onClick={() =>
                setOpenTrackId(openTrackId === track.id ? null : track.id)
              }
            >
              <input
                className="text-input track-title-input"
                value={track.title}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => updateTrack(track.id, { title: e.target.value })}
              />
              <button
                type="button"
                className="link-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTrack(track.id);
                }}
              >
                삭제
              </button>
            </div>

            {openTrackId === track.id && (
              <div className="track-item-body">
                <div className="lyrics-fetch-row">
                  <button
                    type="button"
                    className="btn-secondary-pill"
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
                  </button>
                  {trackErrors[track.id] && (
                    <span className="text-caption form-error">
                      {trackErrors[track.id]}
                    </span>
                  )}
                </div>
                <textarea
                  className="textarea"
                  rows={6}
                  value={track.lyrics}
                  onChange={(e) => handleTrackLyricsEdit(track, e.target.value)}
                  placeholder="가사를 붙여넣거나 위 버튼으로 가져와보세요"
                />
                {track.lyrics.trim() && (
                  <LyricsAnnotator
                    lyrics={track.lyrics}
                    annotations={track.annotations}
                    editable
                    onAdd={(draft) =>
                      updateTrack(track.id, {
                        annotations: [
                          ...track.annotations,
                          { id: crypto.randomUUID(), ...draft },
                        ],
                      })
                    }
                    onDelete={(id) =>
                      updateTrack(track.id, {
                        annotations: track.annotations.filter(
                          (a) => a.id !== id
                        ),
                      })
                    }
                  />
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
