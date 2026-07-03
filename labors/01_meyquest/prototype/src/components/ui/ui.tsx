import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-surface-50/60">{label}</span>
        <span className="text-surface-50/80 font-mono">{value}</span>
      </div>
      <div className="w-full bg-surface-800 rounded-full h-2">
        <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

const RARITY_COLORS: Record<string, string> = {
  common: 'bg-surface-300 text-surface-50/60 border-surface-300',
  uncommon: 'bg-green-900/40 text-green-400 border-green-700/40',
  rare: 'bg-blue-900/40 text-blue-400 border-blue-700/40',
  mythic: 'bg-gold-500/20 text-gold-400 border-gold-500/40',
}

export function RarityBadge({ rarity }: { rarity: string }) {
  return (
    <span className={clsx('text-[10px] font-bold uppercase px-2 py-0.5 rounded border tracking-widest', RARITY_COLORS[rarity] ?? RARITY_COLORS.common)}>
      {rarity}
    </span>
  )
}

export function Card({ children, className, glow = false, onClick }: { children: ReactNode; className?: string; glow?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'glass rounded-xl p-4 transition-all duration-300',
        glow && 'glow-crimson',
        onClick && 'cursor-pointer hover:border-crimson-500/50 hover:glow-crimson',
        className
      )}
    >
      {children}
    </div>
  )
}

export function Button({ children, variant = 'crimson', size = 'md', className, onClick, disabled }: {
  children: ReactNode; variant?: 'crimson' | 'gold' | 'ghost' | 'danger'; size?: 'xs' | 'sm' | 'md' | 'lg'; className?: string; onClick?: () => void; disabled?: boolean
}) {
  const variants = {
    crimson: 'bg-crimson-700 hover:bg-crimson-600 text-white border-crimson-600/50',
    gold: 'bg-gold-500/20 hover:bg-gold-500/30 text-gold-400 border-gold-500/40',
    ghost: 'bg-transparent hover:bg-surface-200/50 text-surface-50/70 border-surface-300/20',
    danger: 'bg-red-900/30 hover:bg-red-900/50 text-red-400 border-red-700/40',
  }
  const sizes = {
    xs: 'px-2 py-1 text-[10px]',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  return (
    <button onClick={onClick} disabled={disabled} className={clsx('rounded-lg border font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed', variants[variant], sizes[size], className)}>
      {children}
    </button>
  )
}

export function TabBar<T extends string>({ tabs, active, onChange }: { tabs: { id: T; label: string; icon?: string }[]; active: T; onChange: (id: T) => void }) {
  return (
    <div className="flex items-center gap-1 bg-surface-800/60 rounded-lg p-1">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={clsx(
            'px-4 py-1.5 rounded-md text-xs font-medium transition-all',
            active === t.id
              ? 'bg-crimson-900/60 text-crimson-300 border border-crimson-700/40'
              : 'text-surface-50/40 hover:text-surface-50/70'
          )}
        >
          {t.icon && <span className="mr-1">{t.icon}</span>}{t.label}
        </button>
      ))}
    </div>
  )
}
