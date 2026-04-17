// No-chrome layout for TV and embed routes. No navigation, no auth.
export default function KioskLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-background text-foreground">{children}</div>;
}
