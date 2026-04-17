type Params = Promise<{ orgSlug: string }>;

// Tenant-scoped shell. The real implementation will verify the current user
// is a member of `orgSlug` and render the navigation chrome.
export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { orgSlug } = await params;

  return (
    <div className="min-h-dvh">
      <header className="border-b px-4 py-3 text-sm text-muted-foreground">{orgSlug}</header>
      {children}
    </div>
  );
}
