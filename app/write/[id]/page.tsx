import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import EntryForm from "@/components/EntryForm";
import { Annotation, AnnotationDraft, Entry } from "@/lib/types";

export const revalidate = 0;

export default async function EditEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: entry } = await supabase
    .from("entries")
    .select("*")
    .eq("id", id)
    .single();

  if (!entry) notFound();

  const { data: annotations } = await supabase
    .from("annotations")
    .select("*")
    .eq("entry_id", id)
    .order("start_offset", { ascending: true });

  const initialAnnotations: AnnotationDraft[] = (
    (annotations ?? []) as Annotation[]
  ).map((a) => ({
    id: a.id,
    start_offset: a.start_offset,
    end_offset: a.end_offset,
    quote: a.quote,
    note: a.note,
  }));

  return (
    <section className="page-form">
      <h1 className="text-display-md">글 수정하기</h1>
      <EntryForm initial={entry as Entry} initialAnnotations={initialAnnotations} />
    </section>
  );
}
