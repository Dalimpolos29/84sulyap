export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Authentication is now handled at the root level
  // This layout just passes through the children
  return <>{children}</>
}