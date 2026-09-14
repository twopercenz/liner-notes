"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { getDeviceId } from "@/lib/device";
import { cn } from "@/lib/utils";

export default function LikeButton({
  postId,
  initialCount,
}: {
  postId: string;
  initialCount: number;
}) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const deviceId = getDeviceId();
    if (!deviceId) return;
    supabase
      .from("likes")
      .select("id")
      .eq("post_id", postId)
      .eq("device_id", deviceId)
      .maybeSingle()
      .then(({ data }) => setLiked(Boolean(data)));
  }, [postId]);

  async function toggleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const deviceId = getDeviceId();
    if (!deviceId || pending) return;

    setPending(true);
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));

    const query = nextLiked
      ? supabase.from("likes").insert({ post_id: postId, device_id: deviceId })
      : supabase.from("likes").delete().eq("post_id", postId).eq("device_id", deviceId);

    const { error } = await query;
    if (error) {
      // 실패하면 낙관적 업데이트를 되돌린다.
      setLiked(!nextLiked);
      setCount((c) => c + (nextLiked ? -1 : 1));
    }
    setPending(false);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={toggleLike}
      className={cn(
        "gap-1.5 px-2 text-muted-foreground hover:text-foreground",
        liked && "text-primary hover:text-primary"
      )}
    >
      <Heart className={cn("size-4", liked && "fill-current")} />
      {count > 0 ? count : ""}
    </Button>
  );
}
