import { Map, User, Wrench, ShoppingBag, Tag, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { useGameStore } from '@/stores/gameStore'

const navItems = [
  { to: '/', label: 'Atlas', icon: Map },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/build', label: 'Build', icon: Wrench },
  { to: '/store', label: 'Store', icon: ShoppingBag },
  { to: '/market', label: 'Market', icon: Tag },
  { to: '/admin', label: 'Admin', icon: Settings },
]

export function Sidebar() {
  const player = useGameStore(s => s.player)

  return (
    <aside className="w-64 h-screen glass border-r border-crimson-700/30 flex flex-col shrink-0">
      <div className="p-6 border-b border-crimson-700/20">
        <h1 className="text-2xl font-bold text-crimson-400 tracking-wider" style={{ fontFamily: 'Cinzel, serif' }}>
          MEYQUEST
        </h1>
        <p className="text-crimson-600/60 text-xs mt-1 tracking-widest uppercase">Oracular Market</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-crimson-900/40 text-crimson-300 border border-crimson-700/40 glow-crimson'
                : 'text-surface-50/60 hover:text-surface-50/90 hover:bg-surface-200/60'
            )}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-crimson-700/20">
        <div className="glass rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-crimson-900/60 border border-crimson-600/40 flex items-center justify-center text-crimson-300 font-bold">
              {player.username[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{player.username}</p>
              <p className="text-xs text-crimson-500/80">Lv.{player.level} · {player.insightPoints} MP</p>
            </div>
          </div>
          <div className="w-full bg-surface-800 rounded-full h-1.5">
            <div className="bg-crimson-600 h-1.5 rounded-full" style={{ width: `${(player.xp % 100)}%` }} />
          </div>
        </div>
      </div>
    </aside>
  )
}
