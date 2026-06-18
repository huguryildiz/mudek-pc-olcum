'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  Upload,
  Archive,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/',        label: 'Genel Bakış',   icon: LayoutDashboard },
  { href: '/dersler', label: 'Dersler',        icon: BookOpen },
  { href: '/kanitlar',label: 'Kanıtlar',       icon: Upload },
  { href: '/bbo',     label: 'BBO İndir',      icon: Archive },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-surface border-r border-border flex flex-col shadow-card z-10">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-ink">MÜDEK PÇ</p>
          <p className="text-xs text-muted-foreground">Ölçüm Sistemi</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-ink',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Elektrik-Elektronik Müh.
        </p>
      </div>
    </aside>
  )
}
