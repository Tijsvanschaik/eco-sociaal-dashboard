import { redirect } from "next/navigation";

type Params = Promise<{ orgSlug: string }>;

// Bare tenant URL (e.g. `/lev-groep`) has no content of its own — we send the
// user straight to the dashboard. The parent layout already enforces auth and
// membership (or superadmin access), so invalid slugs still 404 via the layout.
export default async function OrgIndexPage({ params }: { params: Params }) {
  const { orgSlug } = await params;
  redirect(`/${orgSlug}/dashboard`);
}
