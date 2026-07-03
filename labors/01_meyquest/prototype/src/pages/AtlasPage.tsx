import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGameStore } from '@/stores/gameStore'
import { FACTION_INFO } from '@/data/mock'
import { Card, RarityBadge } from '@/components/ui/ui'
import { Search, TrendingUp, Clock, Flame, BarChart2, Diamond } from 'lucide-react'
import { clsx } from 'clsx'
import type { Category } from '@/types'

const CATEGORY_COLORS: Record<Category, string> = {
  POLITICS: '#3b82f6', TECH: '#8b5cf6', CRYPTO: '#f59e0b', SPORTS: '#22c55e', CULTURE: '#ec4899',
  WORLD: '#dc2626', FINANCE: '#06b6d4', SCIENCE: '#6366f1', AI: '#d946ef', GAMING: '#84cc16', ENTERTAINMENT: '#f97316',
}

const CATEGORY_LABELS: Record<Category, string> = {
  POLITICS: 'Politics', TECH: 'Tech', CRYPTO: 'Crypto', SPORTS: 'Sports', CULTURE: 'Culture',
  WORLD: 'World', FINANCE: 'Finance', SCIENCE: 'Science', AI: 'AI', GAMING: 'Gaming', ENTERTAINMENT: 'Entertainment',
}

type SortTab = 'all' | 'trending' | 'popular' | 'ending-soon' | 'my-bets'

const SORT_LABELS: Record<SortTab, { label: string; icon: typeof Flame }> = {
  all: { label: 'All', icon: Flame },
  trending: { label: 'Trending', icon: TrendingUp },
  popular: { label: 'Popular', icon: BarChart2 },
  'ending-soon': { label: 'Ending Soon', icon: Clock },
  'my-bets': { label: 'My Bets', icon: Diamond },
}

interface RarityTier { label: string; color: string }

function rarityTier(d: number): RarityTier {
  if (d >= 85) return { label: 'Mythic', color: '#ef4444' }
  if (d >= 60) return { label: 'Rare', color: '#f0c040' }
  if (d >= 40) return { label: 'Uncommon', color: '#8b5cf6' }
  if (d >= 25) return { label: 'Refined', color: '#3b82f6' }
  if (d >= 15) return { label: 'Shifting', color: '#22c55e' }
  return { label: 'Common', color: '#9ca3af' }
}

function formatVolume(v: number): string {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`
  return `${v}`
}

function formatDeadline(closesIn: string): { text: string; urgent: boolean } {
  const d = new Date(closesIn)
  if (isNaN(d.getTime())) return { text: closesIn, urgent: false }
  const diff = d.getTime() - Date.now()
  if (diff < 0) return { text: 'Closed', urgent: true }
  const hours = Math.floor(diff / 3600000)
  if (hours < 48) return { text: `Ends in ${hours}h ${Math.floor((diff % 3600000) / 60000)}m`, urgent: true }
  if (hours < 168) return { text: `Ends in ${Math.floor(hours / 24)}d`, urgent: false }
  return { text: `Closes ${closesIn}`, urgent: false }
}

export function AtlasPage() {
  const quests = useGameStore(s => s.quests)
  const player = useGameStore(s => s.player)
  const getHeroName = useGameStore(s => s.getHeroName)
  const getHeroHandle = useGameStore(s => s.getHeroHandle)
  const navigate = useNavigate()

  const [sortTab, setSortTab] = useState<SortTab>('all')
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(new Set())
  const [search, setSearch] = useState('')

  const toggleCategory = (cat: Category) => {
    setActiveCategories(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }
  const clearCategories = () => setActiveCategories(new Set())

  const sortedQuests = useMemo(() => {
    let result = [...quests]

    // Filter by status for non-my-bets tabs
    if (sortTab !== 'my-bets') {
      result = result.filter(q => q.status === 'OPEN')
    }

    // My Bets
    if (sortTab === 'my-bets') {
      result = result.filter(q =>
        player.predictions.some(p => p.questId === q.id && p.result === 'PENDING')
      )
    }

    // Category filter
    if (activeCategories.size > 0) {
      result = result.filter(q => activeCategories.has(q.category))
    }

    // Search
    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter(q => q.question.toLowerCase().includes(term) || q.description.toLowerCase().includes(term))
    }

    // Sort
    switch (sortTab) {
      case 'trending':
        result.sort((a, b) => b.engagement - a.engagement)
        break
      case 'popular':
        result.sort((a, b) => b.volume - a.volume)
        break
      case 'ending-soon':
        result.sort((a, b) => new Date(a.closesIn).getTime() - new Date(b.closesIn).getTime())
        break
      case 'my-bets':
        result.sort((a, b) => new Date(b.closesIn).getTime() - new Date(a.closesIn).getTime())
        break
      default:
        break
    }

    return result
  }, [quests, sortTab, activeCategories, search, player.predictions])

  const activeCount = player.predictions.filter(p => p.result === 'PENDING').length

  // Unique hero IDs per quest (for tag display)
  const getHeroFactionColor = (heroId: string): string => {
    // Look up hero in HEROES via store — we don't have direct access, so check via FACTION_INFO
    for (const [faction, info] of Object.entries(FACTION_INFO)) {
      if (info.heroIds.includes(heroId)) return info.color
    }
    return '#6b7280'
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-crimson-300" style={{ fontFamily: 'Cinzel, serif' }}>The Atlas</h2>
          <p className="text-surface-50/50 mt-1">A celestial map of quests — each node a fate to be wagered</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-50/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search quests..."
              className="bg-surface-800/60 border border-surface-500/20 rounded-lg pl-8 pr-3 py-1.5 text-xs text-surface-50 w-48 focus:outline-none focus:border-crimson-500/40"
            />
          </div>
          <div className="text-center">
            <p className="text-surface-50/40 text-[10px]">Active</p>
            <p className="text-crimson-400 font-bold">{activeCount}</p>
          </div>
          <div className="text-center">
            <p className="text-surface-50/40 text-[10px]">MP</p>
            <p className="text-gold-400 font-bold">{player.insightPoints}</p>
          </div>
          <div className="text-center">
            <p className="text-surface-50/40 text-[10px]">Level</p>
            <p className="text-surface-50 font-bold">{player.level}</p>
          </div>
        </div>
      </div>

      {/* Sort Tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {(Object.keys(SORT_LABELS) as SortTab[]).map(tab => {
          const { label, icon: Icon } = SORT_LABELS[tab]
          return (
            <button
              key={tab}
              onClick={() => setSortTab(tab)}
              className={clsx(
                'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-1.5',
                sortTab === tab
                  ? 'bg-crimson-900/40 border-crimson-600/40 text-crimson-300'
                  : 'border-surface-300/20 text-surface-50/50 hover:text-surface-50/80'
              )}
            >
              <Icon size={12} /> {label}
            </button>
          )
        })}
        <div className="w-px h-5 bg-surface-500/20 mx-1" />
        {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => {
          const active = activeCategories.has(cat)
          const color = CATEGORY_COLORS[cat]
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all border',
                active
                  ? 'text-white'
                  : 'border-surface-300/20 text-surface-50/40 hover:text-surface-50/70'
              )}
              style={active ? { backgroundColor: color + '26', borderColor: color + '66', color } : undefined}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          )
        })}
        {activeCategories.size > 0 && (
          <button onClick={clearCategories} className="text-[10px] text-surface-50/30 hover:text-crimson-400 ml-1">Clear</button>
        )}
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedQuests.map((quest, i) => {
          const catColor = CATEGORY_COLORS[quest.category]
          const hasBet = player.predictions.some(p => p.questId === quest.id && p.result === 'PENDING')
          const deadline = formatDeadline(quest.closesIn)
          const isResolved = quest.status !== 'OPEN'
          const heroIds = quest.heroes.slice(0, 4)
          const moreHeroes = quest.heroes.length - 4
          const topLoot = [...quest.lootTable].sort((a, b) => b.chance - a.chance).slice(0, 2)
          const moreLoot = quest.lootTable.length - 2

          return (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <Card
                className={clsx(
                  'cursor-pointer hover:scale-[1.02] transition-all duration-200 relative',
                  hasBet && !isResolved && 'border-crimson-500/60',
                  isResolved && 'opacity-50'
                )}
                onClick={() => navigate(`/quest/${quest.id}`)}
              >
                {/* Active bet indicator */}
                {hasBet && !isResolved && (
                  <div
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-crimson-500 rounded-full animate-pulse z-10"
                    style={{ boxShadow: '0 0 6px #ef444480' }}
                  />
                )}

                {/* Resolved overlay */}
                {isResolved && (
                  <div className="absolute inset-0 bg-surface-900/40 rounded-2xl z-10 flex items-center justify-center">
                    <span className={clsx(
                      'text-lg font-bold px-4 py-1.5 rounded-lg',
                      quest.status === 'RESOLVED_YES' ? 'text-green-400 bg-green-400/10 border border-green-400/30' : 'text-red-400 bg-red-400/10 border border-red-400/30'
                    )}>
                      {quest.status === 'RESOLVED_YES' ? '✓ YES' : '✗ NO'}
                    </span>
                  </div>
                )}

                {/* Row 1 — Identity bar */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                      style={{ backgroundColor: catColor + '20', color: catColor }}
                    >
                      {CATEGORY_LABELS[quest.category]}
                    </span>
                    {(() => { const rt = rarityTier(quest.rarityDensity); return (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-md border"
                        style={{ color: rt.color, borderColor: rt.color + '40', backgroundColor: rt.color + '12' }}
                      >
                        {rt.label}
                      </span>
                    ) })()}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {deadline.urgent && !isResolved ? (
                      <span className="text-[10px] text-amber-400 font-medium">{deadline.text}</span>
                    ) : (
                      <span className="text-[10px] text-surface-50/40">{deadline.text}</span>
                    )}
                    {sortTab === 'trending' && quest.engagement > 80 && (
                      <span className="text-[10px]">🔥</span>
                    )}
                  </div>
                </div>

                {/* Row 2 — Question */}
                <p className="text-sm font-bold leading-snug line-clamp-2 mb-3">
                  {quest.question}
                </p>

                {/* Row 3 — Probability bars */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-green-400 w-7 shrink-0">YES</span>
                    <div className="flex-1 h-2 rounded-full bg-green-500/10">
                      <div className="h-full rounded-full bg-green-500/60 transition-all" style={{ width: `${quest.yesProbability}%` }} />
                    </div>
                    <span className="text-[10px] text-green-400 font-mono w-8 text-right">{quest.yesProbability}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-red-400 w-7 shrink-0">NO</span>
                    <div className="flex-1 h-2 rounded-full bg-red-500/10">
                      <div className="h-full rounded-full bg-red-500/60 transition-all" style={{ width: `${quest.noProbability}%` }} />
                    </div>
                    <span className="text-[10px] text-red-400 font-mono w-8 text-right">{quest.noProbability}%</span>
                  </div>
                </div>

                {/* Row 4 — Stats */}
                <div className="flex items-center gap-3 text-[10px] mb-2">
                  <span className="text-surface-50/50 flex items-center gap-1">
                    <BarChart2 size={10} /> {formatVolume(quest.volume)} vol
                  </span>
                </div>

                {/* Row 5 — Hero tags */}
                <div className="flex items-center gap-1 mb-2 flex-wrap">
                  {heroIds.map(heroId => (
                    <button
                      key={heroId}
                      onClick={(e) => { e.stopPropagation(); navigate(`/hero/${getHeroHandle(heroId) || heroId}`) }}
                      className="text-[9px] px-1.5 py-0.5 rounded border font-medium cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        color: getHeroFactionColor(heroId),
                        borderColor: getHeroFactionColor(heroId) + '40',
                        backgroundColor: getHeroFactionColor(heroId) + '12',
                      }}
                    >
                      {getHeroName(heroId)}
                    </button>
                  ))}
                  {moreHeroes > 0 && (
                    <span className="text-[9px] text-surface-50/30">+{moreHeroes}</span>
                  )}
                </div>

                {/* Row 6 — Loot preview */}
                {topLoot.length > 0 && (
                  <div className="text-[10px] text-surface-50/40 flex items-center gap-1">
                    <span className="text-surface-50/30">🎲</span>
                    {topLoot.map((lt, idx) => (
                      <span key={lt.item.id}>
                        {lt.item.name} ({Math.round(lt.chance * 100)}%)
                        {idx < topLoot.length - 1 && ', '}
                      </span>
                    ))}
                    {moreLoot > 0 && <span className="text-surface-50/20">+{moreLoot} more</span>}
                  </div>
                )}
              </Card>
            </motion.div>
          )
        })}

        {/* Empty state */}
        {sortedQuests.length === 0 && (
          <div className="col-span-3 flex flex-col items-center justify-center py-16 text-center">
            <p className="text-surface-50/30 text-lg">No quests match your filters.</p>
            <button
              onClick={() => { setSortTab('all'); clearCategories(); setSearch('') }}
              className="mt-2 text-xs text-crimson-400 hover:text-crimson-300 underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
