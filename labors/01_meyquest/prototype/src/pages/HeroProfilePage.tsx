import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Shield, Sword, Target, Search, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import { HEROES, FACTION_INFO, QUESTS, HERO_LEADERBOARDS } from '@/data/mock'
import { Card, RarityBadge, TabBar } from '@/components/ui/ui'
import { VirtueBar, VIRTUE_META } from '@/components/ui/virtues'
import { clsx } from 'clsx'
import type { Faction, VirtueName, HeroTab, CommunitySubtab, QuestActivityType, HeroPost } from '@/types'

const ALIGN_LABELS: Record<string, string> = {
  LG: 'Lawful Good', NG: 'Neutral Good', CG: 'Chaotic Good',
  LN: 'Lawful Neutral', TN: 'True Neutral', CN: 'Chaotic Neutral',
  LE: 'Lawful Evil', NE: 'Neutral Evil', CE: 'Chaotic Evil',
}

const FACTION_LIST: Faction[] = ['architects', 'wardens', 'legion', 'operatives', 'tribunal', 'monastics']

const ACTIVITY_ICONS: Record<string, string> = {
  wager: '💰', price_move: '📈', hero_action: '👑',
  effect_trigger: '⚡', resolution: '✓', follow: '➕', hero_post: '💬',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return v.toString()
}

const QUEST_TAB_OPTIONS: { id: HeroTab; label: string; icon?: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'quests', label: 'Quests' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'community', label: 'Community' },
  { id: 'activity', label: 'Activity' },
]

const COMMUNITY_SUBTAB_OPTIONS: { id: CommunitySubtab; label: string; icon?: string }[] = [
  { id: 'discussion', label: 'Discussion' },
  { id: 'feed', label: 'Feed' },
]

export function HeroProfilePage() {
  const { heroId } = useParams<{ heroId: string }>()
  const navigate = useNavigate()
  const hero = HEROES.find(h => h.handle === heroId)
  const heroPosts = useGameStore(s => s.heroPosts)
  const postHeroMessage = useGameStore(s => s.postHeroMessage)
  const player = useGameStore(s => s.player)

  const [tab, setTab] = useState<HeroTab>('overview')
  const [questFilter, setQuestFilter] = useState<'active' | 'all'>('active')
  const [questSearch, setQuestSearch] = useState('')
  const [questSort, setQuestSort] = useState<'trending' | 'newest' | 'ending-soon'>('newest')
  const [lbSearch, setLbSearch] = useState('')
  const [lbFaction, setLbFaction] = useState<Faction | 'ALL'>('ALL')
  const [lbSort, setLbSort] = useState<'volume' | 'winRate' | 'newest'>('volume')
  const [communitySubtab, setCommunitySubtab] = useState<CommunitySubtab>('discussion')
  const [expandedQid, setExpandedQid] = useState<string | null>(null)
  const [feedText, setFeedText] = useState('')
  const [activityFilter, setActivityFilter] = useState<QuestActivityType | 'all'>('all')
  const [activityPage, setActivityPage] = useState(1)

  if (!hero) {
    return (
      <div className="text-crimson-400 p-8 text-center space-y-4">
        <p className="text-xl">Hero "{heroId}" not found</p>
        <button onClick={() => navigate('/')} className="text-sm text-surface-50/40 hover:text-crimson-400 transition-colors">
          ← Back to Atlas
        </button>
      </div>
    )
  }

  const faction = FACTION_INFO[hero.faction]
  const primaryMeta = VIRTUE_META[hero.primaryVirtue]
  const virtueOrder: VirtueName[] = ['wisdom', 'courage', 'prudence', 'skill', 'temperance', 'justice']

  const linkedQuests = useMemo(() => QUESTS.filter(q => q.heroes.includes(hero.id)), [hero.id])
  const activeQuests = useMemo(() => linkedQuests.filter(q => q.status === 'OPEN'), [linkedQuests])

  // ══════════ QUESTS TAB ══════════
  const filteredQuests = useMemo(() => {
    let result = questFilter === 'active' ? activeQuests : [...linkedQuests]
    if (questSearch.trim()) {
      const term = questSearch.toLowerCase()
      result = result.filter(q => q.question.toLowerCase().includes(term) || q.category.toLowerCase().includes(term))
    }
    if (questSort === 'trending') result.sort((a, b) => b.engagement - a.engagement)
    else if (questSort === 'newest') result.sort((a, b) => new Date(b.closesIn).getTime() - new Date(a.closesIn).getTime())
    else result.sort((a, b) => new Date(a.closesIn).getTime() - new Date(b.closesIn).getTime())
    return result
  }, [linkedQuests, activeQuests, questFilter, questSearch, questSort])

  // ══════════ LEADERBOARD TAB ══════════
  const heroLeaderboard = HERO_LEADERBOARDS[hero.id] ?? []

  const isFollowing = player.followedHeroes.includes(hero.id)

  const playerWagered = useMemo(() => {
    if (!isFollowing) return 0
    return player.predictions
      .filter(p => linkedQuests.some(q => q.id === p.questId))
      .reduce((sum, p) => sum + p.amount, 0)
  }, [isFollowing, player.predictions, linkedQuests])

  const playerWinRate = useMemo(() => {
    if (!isFollowing) return 0
    const resolved = player.predictions.filter(p => p.result === 'WON' || p.result === 'LOST')
    const won = resolved.filter(p => p.result === 'WON').length
    return resolved.length > 0 ? Math.round((won / resolved.length) * 100) : 0
  }, [isFollowing, player.predictions])

  const leaderboardFiltered = useMemo(() => {
    let result = [...heroLeaderboard]
    if (lbSearch.trim()) {
      const term = lbSearch.toLowerCase()
      result = result.filter(p => p.username.toLowerCase().includes(term))
    }
    if (lbFaction !== 'ALL') result = result.filter(p => p.faction === lbFaction)
    if (lbSort === 'volume') result.sort((a, b) => b.totalWagered - a.totalWagered)
    else if (lbSort === 'winRate') result.sort((a, b) => b.winRate - a.winRate)
    else result.sort((a, b) => new Date(b.followedAt).getTime() - new Date(a.followedAt).getTime())
    return result
  }, [heroLeaderboard, lbSearch, lbFaction, lbSort])

  // ══════════ COMMUNITY TAB ══════════
  const posts = heroPosts[hero.id] ?? []

  const questCommentGroups = useMemo(() => {
    const groups = linkedQuests
      .filter(q => q.comments.length > 0)
      .map(q => ({
        questId: q.id,
        questQuestion: q.question,
        category: q.category,
        status: q.status,
        comments: q.comments.slice(0, 3),
        totalComments: q.comments.length,
      }))
    return groups.sort((a, b) => {
      if (a.status === 'OPEN' && b.status !== 'OPEN') return -1
      if (b.status === 'OPEN' && a.status !== 'OPEN') return 1
      const aNewest = Math.max(0, ...a.comments.map(c => new Date(c.createdAt).getTime()))
      const bNewest = Math.max(0, ...b.comments.map(c => new Date(b.createdAt).getTime()))
      return bNewest - aNewest
    })
  }, [linkedQuests])

  // ══════════ ACTIVITY TAB ══════════
  const heroActivities = useMemo(() => {
    const base = linkedQuests
      .flatMap(q => q.activities.map(a => ({
        ...a,
        questQuestion: q.question,
        questCategory: q.category,
      })))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Interleave hero posts as activity
    const postActivities = posts.map((p: HeroPost) => ({
      id: p.id + '-activity',
      questId: '',
      type: 'hero_post' as const,
      text: `${p.authorName} posted on @${hero.name.split(' ')[0]}'s feed: "${p.text.slice(0, 80)}${p.text.length > 80 ? '...' : ''}"`,
      username: p.authorName,
      faction: p.authorFaction,
      amount: undefined,
      createdAt: p.createdAt,
      questQuestion: p.linkedQuestId ? QUESTS.find(q => q.id === p.linkedQuestId)?.question : undefined,
      questCategory: undefined,
    }))

    return [...base, ...postActivities]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [linkedQuests, posts, hero.name])

  const filteredActivities = useMemo(() => {
    let result = heroActivities
    if (activityFilter !== 'all') result = result.filter(a => a.type === activityFilter)
    return result.slice(0, activityPage * 20)
  }, [heroActivities, activityFilter, activityPage])

  const handlePost = () => {
    if (!feedText.trim() || feedText.length > 280) return
    postHeroMessage(hero.id, feedText.trim())
    setFeedText('')
  }

  return (
    <div className="max-w-4xl space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-surface-50/50 hover:text-crimson-400 transition-colors">
        <ArrowLeft size={16} /><span className="text-sm">Back</span>
      </button>

      <TabBar tabs={QUEST_TAB_OPTIONS} active={tab} onChange={setTab} />

      {/* ═══════════════ OVERVIEW ═══════════════ */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <Card glow className="p-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold shrink-0" style={{ backgroundColor: `${primaryMeta.color}12`, border: `3px solid ${primaryMeta.color}40`, color: primaryMeta.color, fontFamily: 'Cinzel, serif' }}>
                {hero.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-3xl font-bold" style={{ fontFamily: 'Cinzel, serif' }}>{hero.name}</h2>
                  <span className="text-lg text-surface-50/50 font-mono">{hero.handle}</span>
                  <span className="text-xs text-surface-50/50 bg-surface-300/20 px-2 py-0.5 rounded">{ALIGN_LABELS[hero.alignment]}</span>
                </div>
                <p className="text-lg text-crimson-400 mt-1">{hero.title}</p>
                <p className="text-sm text-surface-50/50 mt-3 leading-relaxed">{hero.bio}</p>
                <div className="flex items-center gap-4 mt-4 flex-wrap">
                  <span className="text-sm flex items-center gap-1.5" style={{ color: faction.color }}>
                    <Shield size={14} /> {faction.name}
                  </span>
                  <span className="text-sm flex items-center gap-1.5 text-surface-50/60">
                    <Sword size={14} /> <span className="capitalize">{hero.slotType}</span> slot
                  </span>
                  <span className="text-sm flex items-center gap-1.5" style={{ color: primaryMeta.color }}>
                    <Target size={14} /> <primaryMeta.icon size={12} /> {primaryMeta.label} / {VIRTUE_META[hero.secondaryVirtue].label}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-3">
            <div className="glass rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-gold-400">{activeQuests.length}</p>
              <p className="text-[10px] text-surface-50/40">Active Quests</p>
            </div>
            <div className="glass rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-crimson-400">
                {linkedQuests.flatMap(q => q.effects.filter(e => e.source === 'hero-item' && e.heroId === hero.id)).length}
              </p>
              <p className="text-[10px] text-surface-50/40">Hero Effects</p>
            </div>
            <div className="glass rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-surface-50/80">{heroLeaderboard.length.toLocaleString()}</p>
              <p className="text-[10px] text-surface-50/40">Followers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-bold mb-4 text-surface-50/80">Virtues</h3>
              <div className="space-y-4">
                {virtueOrder.map(v => (
                  <VirtueBar key={v} virtue={v} value={hero.virtues[v]} />
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-surface-700/50 flex items-center justify-between">
                <span className="text-xs text-surface-50/40">Total Virtue Power</span>
                <span className="font-mono text-sm text-gold-400">{Object.values(hero.virtues).reduce((a, b) => a + b, 0)} / 120</span>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-bold mb-4 text-surface-50/80">Equipped Items</h3>
              <div className="space-y-3">
                {hero.equippedItems.map(item => (
                  <div key={item.id} className="glass rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{item.slot === 'weapon' ? '⚔️' : item.slot === 'armor' ? '🛡️' : item.slot === 'accessory' ? '💍' : '📦'}</span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold">{item.name}</p>
                          <RarityBadge rarity={item.rarity} />
                          <span className="text-[10px] text-surface-50/30 uppercase">{item.slot}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-surface-50/60 mb-2">{item.description}</p>
                    {Object.entries(item.statBonuses).map(([k, v]) => (
                      <div key={k} className="flex items-center gap-2 text-xs">
                        <span className="text-gold-400">→</span>
                        <span className="text-surface-50/70 capitalize">+{v} {k}</span>
                      </div>
                    ))}
                    {item.uniqueEffect && (
                      <div className="flex items-center gap-2 text-xs mt-1">
                        <span className="text-gold-400">★</span>
                        <span className="text-gold-400">{item.uniqueEffect.name}:</span>
                        <span className="text-surface-50/70">{item.uniqueEffect.description}</span>
                      </div>
                    )}
                    {item.passiveCost > 0 && (
                      <p className="text-[11px] text-surface-50/30 mt-2">Passive cost: {item.passiveCost}%</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ═══════════════ QUESTS ═══════════════ */}
      {tab === 'quests' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {(['active', 'all'] as const).map(f => (
              <button key={f} onClick={() => setQuestFilter(f)} className={clsx('px-3 py-1 rounded-full text-xs font-medium transition-all border', questFilter === f ? 'bg-crimson-900/40 border-crimson-600/40 text-crimson-300' : 'border-surface-300/20 text-surface-50/40 hover:text-surface-50/70')}>
                {f === 'active' ? 'Active' : 'All'}
              </button>
            ))}
            <div className="relative ml-auto">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-surface-50/30" />
              <input value={questSearch} onChange={e => setQuestSearch(e.target.value)} placeholder="Search quests..." className="bg-surface-800/60 border border-surface-500/20 rounded-md pl-7 pr-2 py-1 text-[10px] text-surface-50 w-36 focus:outline-none focus:border-crimson-500/40" />
            </div>
            <select value={questSort} onChange={e => setQuestSort(e.target.value as typeof questSort)} className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1 text-[10px] text-surface-50">
              <option value="newest">Newest</option>
              <option value="trending">Trending</option>
              <option value="ending-soon">Ending Soon</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredQuests.map(q => {
              const isResolved = q.status !== 'OPEN'
              const heroEffects = q.effects.filter(e => e.source === 'hero-item' && e.heroId === hero.id)
              return (
                <button
                  key={q.id}
                  onClick={() => navigate(`/quest/${q.id}`)}
                  className={clsx('glass rounded-lg p-3 text-left hover:border-crimson-500/40 transition-all relative', isResolved && 'opacity-40 pointer-events-none')}
                >
                  {isResolved && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <span className="text-4xl font-bold text-green-400">{q.status === 'RESOLVED_YES' ? '✓' : '✗'}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded border text-surface-50/60 border-surface-500/30 uppercase">{q.category}</span>
                    <span className="text-[9px] text-surface-50/30 ml-auto">{q.closesIn}</span>
                  </div>
                  <p className="text-xs font-medium leading-snug line-clamp-2 mb-2">{q.question}</p>
                  <div className="flex items-center gap-3 text-[10px] text-surface-50/40">
                    <span className="text-green-400">YES {q.yesProbability}%</span>
                    <span className="text-red-400">NO {q.noProbability}%</span>
                    <span>{formatVolume(q.volume)} vol</span>
                  </div>
                  {heroEffects.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {heroEffects.map(e => (
                        <span key={e.id} className="text-[8px] bg-crimson-950/50 text-crimson-400/80 px-1.5 py-0.5 rounded border border-crimson-800/30">⚡ {e.name}</span>
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          {filteredQuests.length === 0 && (
            <p className="text-center text-surface-50/30 py-8">No quests found for this hero.</p>
          )}
        </div>
      )}

      {/* ═══════════════ LEADERBOARD ═══════════════ */}
      {tab === 'leaderboard' && (
        <div className="space-y-3 max-w-2xl mx-auto">
          {isFollowing && (
            <Card className="!border-crimson-500/40">
              <div className="flex items-center gap-3 p-2">
                <div className="w-8 h-8 rounded-full bg-crimson-900/40 flex items-center justify-center text-xs font-bold text-crimson-300">{player.username[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-crimson-300">{player.username}</p>
                  <p className="text-[10px] text-surface-50/40">{playerWagered.toLocaleString()} MP wagered · {playerWinRate}% WR</p>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded border text-crimson-300 border-crimson-500/30 bg-crimson-900/20">You</span>
              </div>
            </Card>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-surface-50/30" />
              <input value={lbSearch} onChange={e => setLbSearch(e.target.value)} placeholder="Search players..." className="bg-surface-800/60 border border-surface-500/20 rounded-md pl-7 pr-2 py-1 text-[10px] text-surface-50 w-36 focus:outline-none focus:border-crimson-500/40" />
            </div>
            <select value={lbFaction} onChange={e => setLbFaction(e.target.value as Faction | 'ALL')} className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1 text-[10px] text-surface-50">
              <option value="ALL">All Factions</option>
              {FACTION_LIST.map(f => <option key={f} value={f}>{FACTION_INFO[f].name}</option>)}
            </select>
            <select value={lbSort} onChange={e => setLbSort(e.target.value as typeof lbSort)} className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1 text-[10px] text-surface-50">
              <option value="volume">Volume</option>
              <option value="winRate">Win Rate</option>
              <option value="newest">Newest</option>
            </select>
            <span className="text-[9px] text-surface-50/30 ml-auto">{leaderboardFiltered.length} players</span>
          </div>

          <div className="space-y-1">
            {leaderboardFiltered.map((p, i) => {
              const fColor = FACTION_INFO[p.faction]?.color ?? '#6b7280'
              return (
                <div key={p.id} className="glass rounded-lg p-3 flex items-center gap-3">
                  <span className="text-xs font-mono text-surface-50/30 w-6 text-right">{i + 1}</span>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ backgroundColor: `${fColor}15`, border: `1px solid ${fColor}40`, color: fColor }}>{p.username[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold" style={{ color: fColor }}>{p.username}</span>
                      <span className="text-[7px] px-1 py-0.5 rounded border" style={{ color: fColor, borderColor: fColor + '30', backgroundColor: fColor + '10' }}>{FACTION_INFO[p.faction]?.name.split(' ')[1]}</span>
                      {p.heroEquipped && <span className="text-[8px] px-1 py-0.5 rounded border border-crimson-500/30 text-crimson-400 bg-crimson-900/20">Equipped</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[9px] text-surface-50/40">
                      <span className="text-surface-50/60 font-mono">{p.totalWagered.toLocaleString()} MP</span>
                      <span className="text-gold-400">{p.winRate}% WR</span>
                      <span>{timeAgo(p.followedAt)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {leaderboardFiltered.length === 0 && <p className="text-center text-surface-50/30 py-8">No players match your filters.</p>}
        </div>
      )}

      {/* ═══════════════ COMMUNITY ═══════════════ */}
      {tab === 'community' && (
        <div className="space-y-4">
          <TabBar tabs={COMMUNITY_SUBTAB_OPTIONS} active={communitySubtab} onChange={setCommunitySubtab} />

          {/* Discussion subtab */}
          {communitySubtab === 'discussion' && (
            <div className="space-y-3 max-w-2xl mx-auto">
              {questCommentGroups.length === 0 && (
                <p className="text-center text-surface-50/30 py-8">No discussions yet.</p>
              )}
              {questCommentGroups.map(group => {
                const isExpanded = expandedQid === group.questId
                const allComments = QUESTS.find(q => q.id === group.questId)?.comments ?? []
                return (
                  <div key={group.questId} className="glass rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={clsx('w-2 h-2 rounded-full', group.status === 'OPEN' ? 'bg-green-400' : 'bg-surface-50/30')} />
                      <button onClick={() => navigate(`/quest/${group.questId}`)} className="text-xs font-medium text-surface-50/80 hover:text-crimson-400 transition-colors text-left line-clamp-1">
                        {group.questQuestion}
                      </button>
                      <span className="text-[8px] px-1 py-0.5 rounded border border-surface-500/30 text-surface-50/40 uppercase">{group.category}</span>
                      <span className="text-[9px] text-surface-50/30 ml-auto">{group.totalComments} comments</span>
                    </div>
                    <div className="space-y-1.5">
                      {(isExpanded ? allComments : group.comments).map(c => (
                        <div key={c.id} className="bg-surface-800/40 rounded-md p-2">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="w-4 h-4 rounded-full bg-surface-800 border flex items-center justify-center text-[7px]" style={{ borderColor: (FACTION_INFO[c.authorFaction]?.color ?? '#6b7280') + '60', color: FACTION_INFO[c.authorFaction]?.color }}>{c.authorName[0]}</div>
                            <span className="text-[9px] font-medium" style={{ color: FACTION_INFO[c.authorFaction]?.color }}>{c.authorName}</span>
                            <span className="text-[7px] text-surface-50/30">{timeAgo(c.createdAt)}</span>
                          </div>
                          <p className="text-[10px] text-surface-50/70">{c.text}</p>
                          <div className="flex items-center gap-2 mt-1 text-[8px]">
                            <span className="flex items-center gap-0.5 text-surface-50/30"><ThumbsUp size={8} /> {c.upvotes}</span>
                            <span className="flex items-center gap-0.5 text-surface-50/30"><ThumbsDown size={8} /> {c.downvotes}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {group.totalComments > 3 && (
                      <button onClick={() => setExpandedQid(isExpanded ? null : group.questId)} className="text-[9px] text-crimson-400 hover:underline mt-2 flex items-center gap-1">
                        {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                        {isExpanded ? 'Collapse' : `View all ${group.totalComments} comments`}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Feed subtab */}
          {communitySubtab === 'feed' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-crimson-900/40 border border-crimson-600/30 flex items-center justify-center text-xs font-bold text-crimson-300 shrink-0">{player.username[0]}</div>
                <div className="flex-1 space-y-1">
                  <textarea
                    value={feedText}
                    onChange={e => setFeedText(e.target.value)}
                    placeholder={`Post about ${hero.handle}...`}
                    maxLength={280}
                    className="w-full bg-surface-800/60 border border-surface-500/20 rounded-lg px-3 py-2 text-xs text-surface-50 resize-none focus:outline-none focus:border-crimson-500/40 h-16"
                  />
                  <div className="flex items-center justify-between">
                    <span className={clsx('text-[10px]', feedText.length > 260 ? 'text-red-400' : feedText.length > 200 ? 'text-yellow-400' : 'text-surface-50/30')}>
                      {feedText.length}/280
                    </span>
                    <button
                      onClick={handlePost}
                      disabled={!feedText.trim() || feedText.length > 280}
                      className="text-[10px] px-3 py-1 rounded-full bg-crimson-900/40 border border-crimson-600/40 text-crimson-300 hover:bg-crimson-900/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {posts.map(p => {
                  const fColor = FACTION_INFO[p.authorFaction]?.color ?? '#6b7280'
                  const linkedQuest = p.linkedQuestId ? QUESTS.find(q => q.id === p.linkedQuestId) : null
                  return (
                    <div key={p.id} className="glass rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ backgroundColor: `${fColor}15`, border: `1px solid ${fColor}40`, color: fColor }}>{p.authorName[0]}</div>
                        <span className="text-xs font-medium" style={{ color: fColor }}>{p.authorName}</span>
                        <span className="text-[7px] px-1 py-0.5 rounded border" style={{ color: fColor, borderColor: fColor + '30', backgroundColor: fColor + '10' }}>{FACTION_INFO[p.authorFaction]?.name.split(' ')[1]}</span>
                        {linkedQuest && (
                          <button onClick={() => navigate(`/quest/${linkedQuest.id}`)} className="text-[8px] px-1 py-0.5 rounded border border-surface-500/30 text-surface-50/40 hover:border-crimson-500/40 transition-colors line-clamp-1">{linkedQuest.question.slice(0, 30)}...</button>
                        )}
                        <span className="text-[8px] text-surface-50/30 ml-auto">{timeAgo(p.createdAt)}</span>
                      </div>
                      <p className="text-xs mt-2 text-surface-50/80">{p.text}</p>
                      <div className="flex items-center gap-3 mt-2 text-[9px]">
                        <span className="flex items-center gap-0.5 text-surface-50/30"><ThumbsUp size={10} /> {p.upvotes}</span>
                        <span className="flex items-center gap-0.5 text-surface-50/30"><ThumbsDown size={10} /> {p.downvotes}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ ACTIVITY ═══════════════ */}
      {tab === 'activity' && (
        <div className="space-y-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['all', 'wager', 'hero_action', 'price_move', 'resolution'] as const).map(f => (
              <button key={f} onClick={() => setActivityFilter(f)} className={clsx('text-[10px] px-2 py-0.5 rounded-full border transition-all', activityFilter === f ? 'bg-crimson-900/40 border-crimson-600/40 text-crimson-300' : 'border-surface-300/20 text-surface-50/40 hover:text-surface-50/70')}>
                {f === 'all' ? 'All' : f === 'wager' ? '💰 Wager' : f === 'hero_action' ? '👑 Hero' : f === 'price_move' ? '📈 Price' : '✓ Resolution'}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            {filteredActivities.map(a => {
              const fColor = a.faction ? FACTION_INFO[a.faction]?.color : undefined
              return (
                <div key={a.id} className="glass rounded-lg p-3 flex items-start gap-3">
                  <span className="text-sm mt-0.5">{ACTIVITY_ICONS[a.type] ?? '●'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs">
                      {a.username && <span className="font-medium" style={{ color: fColor }}>{a.username}</span>}
                      {a.username && ' '}{a.text}
                    </p>
                    {a.questQuestion && (
                      <p className="text-[9px] text-surface-50/30 mt-0.5 line-clamp-1">{a.questQuestion}</p>
                    )}
                    <p className="text-[8px] text-surface-50/30 mt-0.5">{timeAgo(a.createdAt)}</p>
                  </div>
                  {a.amount && <span className="text-[10px] text-surface-50/40 font-mono shrink-0">{a.amount} MP</span>}
                </div>
              )
            })}
          </div>

          {filteredActivities.length < heroActivities.filter(a => activityFilter === 'all' || a.type === activityFilter).length && (
            <button onClick={() => setActivityPage(p => p + 1)} className="w-full text-[10px] text-surface-50/40 hover:text-crimson-400 transition-colors py-2 flex items-center justify-center gap-1">
              <ChevronDown size={12} /> Show more
            </button>
          )}

          {filteredActivities.length === 0 && (
            <p className="text-center text-surface-50/30 py-8">No activity to display.</p>
          )}
        </div>
      )}
    </div>
  )
}
