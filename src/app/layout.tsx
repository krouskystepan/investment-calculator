import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Investiční kalkulačka',
  description: 'Jednoduché investiční výpočty',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <body
        className={cn(inter.className, 'min-h-screen bg-muted text-foreground')}
      >
        <main className="container mx-auto py-10 px-4">{children}</main>
      </body>
    </html>
  )
}
