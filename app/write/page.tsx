import EntryForm from "@/components/EntryForm";

export default function NewEntryPage() {
  return (
    <section className="page-form">
      <h1 className="text-display-md">새 글쓰기</h1>
      <EntryForm />
    </section>
  );
}
