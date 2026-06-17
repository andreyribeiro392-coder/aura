import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Marketplace Futurista',
  description: 'A experiência de compra do futuro com design inovador e produtos incríveis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
