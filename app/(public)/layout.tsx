// Public read-only share-link shell. No auth, minimal chrome.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh">{children}</div>;
}
