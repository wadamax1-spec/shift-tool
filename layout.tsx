export const metadata = {
  title: 'シフト管理ツール',
  description: '自分専用のシフト管理',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
