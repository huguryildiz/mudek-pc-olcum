import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MÜDEK – Program Çıktıları Ölçme Sistemi',
  description: 'MÜDEK akreditasyonu için program çıktıları ölçme ve değerlendirme sistemi',
  icons: { icon: '/logo.svg' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="min-h-screen bg-canvas">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64 p-8 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
