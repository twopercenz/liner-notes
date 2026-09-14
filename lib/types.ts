export type EntryType = "album" | "ep" | "single" | "song";

export interface Entry {
  id: string;
  type: EntryType;
  artist: string;
  title: string;
  year: string | null;
  cover_url: string | null;
  apple_music_id: string | null;
  rating: number;
  review: string | null;
  /** @deprecated 줄/구절 단위 해석(annotations) 이전에 쓰던 자유 텍스트 해석. 하위호환용. */
  interpretation: string | null;
  lyrics: string | null;
  created_at: string;
}

/** DB에 저장된 해석(annotation). entries.lyrics 문자열 기준 [start_offset, end_offset) 구간. */
export interface Annotation {
  id: string;
  entry_id: string;
  start_offset: number;
  end_offset: number;
  quote: string;
  note: string;
  created_at: string;
}

/** 아직 저장하지 않은, 폼에서 작성 중인 해석. */
export interface AnnotationDraft {
  id: string;
  start_offset: number;
  end_offset: number;
  quote: string;
  note: string;
}

export const TYPE_LABEL: Record<EntryType, string> = {
  album: "앨범",
  ep: "EP",
  single: "싱글",
  song: "곡",
};
