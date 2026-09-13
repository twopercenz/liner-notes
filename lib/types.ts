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
  interpretation: string | null;
  created_at: string;
}

export const TYPE_LABEL: Record<EntryType, string> = {
  album: "앨범",
  ep: "EP",
  single: "싱글",
  song: "곡",
};
