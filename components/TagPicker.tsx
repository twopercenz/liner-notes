"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";

const SUGGESTED_MOODS = [
  "우울함",
  "청춘",
  "이별",
  "그리움",
  "위로",
  "설렘",
  "새벽감성",
  "자기 성찰",
];

export default function TagPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const [existingTags, setExistingTags] = useState<string[]>([]);

  useEffect(() => {
    supabase
      .from("tags")
      .select("name")
      .order("name")
      .then(({ data }) => setExistingTags((data ?? []).map((t) => t.name)));
  }, []);

  function addTag(raw: string) {
    const name = raw.trim().replace(/^#/, "");
    if (!name || value.includes(name)) return;
    onChange([...value, name]);
    setInput("");
  }

  function removeTag(name: string) {
    onChange(value.filter((t) => t !== name));
  }

  const suggestions = Array.from(new Set([...SUGGESTED_MOODS, ...existingTags]))
    .filter((t) => !value.includes(t))
    .slice(0, 8);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="rounded-full p-0.5 hover:bg-foreground/10"
              aria-label={`${tag} 태그 삭제`}
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag(input);
            }
          }}
          placeholder="무드/태그 추가 (예: 이별)"
          className="h-8 w-40 flex-1 min-w-[120px]"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => addTag(tag)}
              className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              + {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
