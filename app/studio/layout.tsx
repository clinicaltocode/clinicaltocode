export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Sanity Studio has its own chrome — suppress site nav and footer.
  // This layout replaces the root layout's nav/footer wrapper for /studio routes.
  return children
}
