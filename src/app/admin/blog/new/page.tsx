import { NewBlogPostForm } from "./NewBlogPostForm";

export default function NewBlogPostPage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">
        New blog post
      </h1>
      <NewBlogPostForm />
    </div>
  );
}
