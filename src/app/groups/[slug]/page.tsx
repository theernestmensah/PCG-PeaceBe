import { PagePlaceholder } from "@/components/ui/page-placeholder";

// TODO(step 5-6): load by slug, call notFound() when missing, add generateMetadata.
export default async function GroupPage({ params }: PageProps<"/groups/[slug]">) {
  const { slug } = await params;
  return <PagePlaceholder title="Group" intro={`Details for "${slug}" are being prepared.`} />;
}
