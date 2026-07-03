import { TrendingUp, TrendingDown, Brain, Zap, Sword, Feather } from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import { FACTION_INFO, HEROES } from '@/data/mock'
import { Card } from '@/components/ui/ui'
import type { Faction } from '@/types'

const ICONS: Record<Faction, typeof TrendingUp> = {
  BULLS: TrendingUp, BEARS: TrendingDown, OWLS: Brain, FOXES: Zap, HAWKS: Sword, DOVES: Feather,
}

export function FactionHubPage() {
  const player = useGameStore(s => s.player)
  const currentFaction = FACTION_INFO[player.faction]

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-crimson-300" style={{ fontFamily: 'Cinzel, serif' }}>Faction Hub</h2>
        <p className="text-surface-50/50 mt-1">Choose your allegiance. Each faction grants unique bonuses.</p>
      </div>

      {/* Current Faction */}
      <Card glow className="p-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl" style={{ backgroundColor: `${currentFaction.color}15`, border: `2px solid ${currentFaction.color}40` }}>
            {(() => { const Icon = ICONS[player.faction]; return <Icon size={36} style={{ color: currentFaction.color }} /> })()}
          </div>
          <div>
            <p className="text-xs text-surface-50/40 uppercase tracking-widest">Your Faction</p>
            <h3 className="text-2xl font-bold" style={{ color: currentFaction.color }}>{currentFaction.name}</h3>
            <p className="text-sm text-surface-50/60 mt-1">{currentFaction.description}</p>
            <p className="text-xs text-gold-400/80 mt-2 font-medium">Bonus: {currentFaction.bonus}</p>
          </div>
        </div>
      </Card>

      {/* All Factions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(Object.keys(FACTION_INFO) as Faction[]).map(fkey => {
          const f = FACTION_INFO[fkey]
          const Icon = ICONS[fkey]
          const isCurrent = player.faction === fkey
          const factionHeroes = HEROES.filter(h => h.faction === fkey)

          return (
            <Card key={fkey} glow={isCurrent} className={isCurrent ? '' : 'opacity-70 hover:opacity-100'}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${f.color}15`, border: `1px solid ${f.color}40` }}>
                  <Icon size={22} style={{ color: f.color }} />
                </div>
                <div>
                  <h4 className="font-bold" style={{ color: f.color }}>{f.name}</h4>
                  <p className="text-xs text-surface-50/40">{f.description}</p>
                </div>
              </div>
              <p className="text-xs text-surface-50/50 mb-3">{f.bonus}</p>

              <div className="border-t border-crimson-700/20 pt-3">
                <p className="text-[10px] text-surface-50/30 uppercase tracking-wider mb-2">Allied Figures</p>
                <div className="flex flex-wrap gap-1.5">
                  {factionHeroes.map(h => (
                    <span key={h.id} className="text-[10px] bg-surface-300/20 text-surface-50/60 px-2 py-1 rounded-md border border-surface-300/10">
                      {h.name}
                    </span>
                  ))}
                </div>
              </div>

              {isCurrent && (
                <div className="mt-3 pt-3 border-t border-crimson-700/20">
                  <span className="text-xs text-crimson-400 font-bold">◆ Active</span>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Faction Heroes */}
      <Card>
        <h3 className="text-lg font-bold mb-4">All Faction Heroes</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {HEROES.map(hero => {
            const f = FACTION_INFO[hero.faction]
            return (
              <div key={hero.id} className="glass rounded-lg p-3 text-center">
                <div className="w-12 h-12 rounded-full mx-auto mb-2 bg-surface-800 border flex items-center justify-center text-lg font-bold" style={{ borderColor: `${f.color}40`, color: f.color }}>
                  {hero.name[0]}
                </div>
                <p className="text-xs font-medium truncate">{hero.name}</p>
                <p className="text-[10px] text-surface-50/40">{hero.title}</p>
                <span className="text-[10px] mt-1 inline-block px-2 py-0.5 rounded" style={{ backgroundColor: `${f.color}15`, color: f.color }}>
                  {f.name}
                </span>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
