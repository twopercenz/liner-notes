"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

export default function DeleteButton({
  table,
  id,
  redirectTo,
  label = "삭제",
}: {
  table: "works" | "posts" | "comments";
  id: string;
  redirectTo: string;
  label?: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("삭제할까요? 되돌릴 수 없어요.")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) {
      toast.error("삭제에 실패했어요: " + error.message);
      return;
    }
    toast.success("삭제했어요.");
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      <Trash2 className="size-4" />
      {label}
    </Button>
  );
}
