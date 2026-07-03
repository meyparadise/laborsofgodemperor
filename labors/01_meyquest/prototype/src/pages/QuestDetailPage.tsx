import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, Users, Gift, Zap, Flame, CheckCheck, Lock, Vote, Diamond, ThumbsUp, ThumbsDown, MessageCircle, Search } from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import { HEROES, FACTION_INFO } from '@/data/mock'
import { Card, Button, RarityBadge, TabBar } from '@/components/ui/ui'
import { clsx } from 'clsx'
import type { Faction } from '@/types'

type QuestTab = 'overview' | 'voting' | 'discussion' | 'leaderboard' | 'activity'

const TIER_LABELS: Record<string, string> = { shifting: 'Shifting', refined: 'Refined', uncommon: 'Uncommon', rare: 'Rare', mythic: 'Mythic' }
const TIER_COLORS: Record<string, string> = { shifting: '#22c55e', refined: '#3b82f6', uncommon: '#8b5cf6', rare: '#f0c040', mythic: '#ef4444' }
const FACTION_LIST: Faction[] = ['architects', 'wardens', 'legion', 'operatives', 'tribunal', 'monastics']

const GLYPH_ICON = '🪙'
const FATE_ICON = '💎'

function rarityLabel(d: number): string {
  if (d >= 85) return 'Mythic'
  if (d >= 60) return 'Rare'
  if (d >= 40) return 'Uncommon'
  if (d >= 25) return 'Refined'
  if (d >= 15) return 'Shifting'
  return 'Common'
}
function rarityColorHex(d: number): string {
  if (d >= 85) return '#ef4444'
  if (d >= 60) return '#f0c040'
  if (d >= 40) return '#8b5cf6'
  if (d >= 25) return '#3b82f6'
  if (d >= 15) return '#22c55e'
  return '#9ca3af'
}
function formatVol(v: number): string {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`
  return `${v}`
}
function formatDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function QuestDetailPage() {
  const { questId } = useParams<{ questId: string }>()
  const navigate = useNavigate()
  const player = useGameStore(s => s.player)
  const quests = useGameStore(s => s.quests)
  const placePrediction = useGameStore(s => s.placePrediction)
  const castTierVote = useGameStore(s => s.castTierVote)

  const quest = quests.find(q => q.id === questId)
  if (!quest) return <div className="text-crimson-400 p-8">Quest not found</div>

  const [outcome, setOutcome] = useState<'YES' | 'NO'>('YES')
  const [amount, setAmount] = useState(50)
  const [submitted, setSubmitted] = useState(false)
  const [tab, setTab] = useState<QuestTab>('overview')

  const [lbSearch, setLbSearch] = useState('')
  const [lbFaction, setLbFaction] = useState<Faction | 'ALL'>('ALL')
  const [lbDirection, setLbDirection] = useState<'ALL' | 'YES' | 'NO'>('ALL')
  const [lbSort, setLbSort] = useState<'volume' | 'newest' | 'oldest'>('volume')

  const [discussionSort, setDiscussionSort] = useState<'newest' | 'upvotes' | 'replies'>('newest')

  const handlePlace = () => {
    const prob = outcome === 'YES' ? quest.yesProbability : quest.noProbability
    const success = placePrediction(quest.id, outcome, amount, prob)
    if (success) setSubmitted(true)
  }

  const questHeroes = HEROES.filter(h => quest.heroes.includes(h.id))
  const pricePoints = quest.priceHistory
  const maxPrice = Math.max(...pricePoints.map(p => p.yesPrice), 60)
  const rColor = rarityColorHex(quest.rarityDensity)
  const rLabel = rarityLabel(quest.rarityDensity)

  const hasWager = player.predictions.some(p => p.questId === quest.id && p.result === 'PENDING')
  const activeVote = quest.tierVotes.find(tv => tv.status === 'active')
  const otherVotes = quest.tierVotes.filter(tv => tv.status !== 'active')

  const leaderboardFiltered = useMemo(() => {
    let result = [...quest.questPlayers]
    if (lbSearch.trim()) {
      const term = lbSearch.toLowerCase()
      result = result.filter(p => p.username.toLowerCase().includes(term))
    }
    if (lbFaction !== 'ALL') result = result.filter(p => p.faction === lbFaction)
    if (lbDirection !== 'ALL') result = result.filter(p => p.wagerOutcome === lbDirection)
    if (lbSort === 'volume') result.sort((a, b) => b.wagerAmount - a.wagerAmount)
    else if (lbSort === 'newest') result.sort((a, b) => new Date(b.wageredAt).getTime() - new Date(a.wageredAt).getTime())
    else result.sort((a, b) => new Date(a.wageredAt).getTime() - new Date(b.wageredAt).getTime())
    return result
  }, [quest.questPlayers, lbSearch, lbFaction, lbDirection, lbSort])

  const sortedComments = useMemo(() => {
    const sorted = [...quest.comments]
    if (discussionSort === 'newest') sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    else if (discussionSort === 'upvotes') sorted.sort((a, b) => b.upvotes - a.upvotes)
    else sorted.sort((a, b) => (b.replies?.length ?? 0) - (a.replies?.length ?? 0))
    return sorted
  }, [quest.comments, discussionSort])

  return (
    <div className="max-w-4xl space-y-4">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-surface-50/50 hover:text-crimson-400 transition-colors">
        <ArrowLeft size={16} />
        <span className="text-sm">Back to Atlas</span>
      </button>

      <TabBar<QuestTab>
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'overview', label: 'Overview', icon: '📋' },
          { id: 'voting', label: 'Voting', icon: '⚒' },
          { id: 'discussion', label: 'Discussion', icon: '💬' },
          { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
          { id: 'activity', label: 'Activity', icon: '⚡' },
        ]}
      />

      {/* ════════ OVERVIEW ════════ */}
      {tab === 'overview' && (
        <div className="space-y-4">
          {/* Row 1: Quest Header + Place Your Wager */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card glow>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: rColor + '20', color: rColor }}>{quest.category}</span>
                <span className="text-[10px] text-surface-50/40">Closes {quest.closesIn}</span>
                <span className="text-[10px] text-surface-50/30">Eng {quest.engagement}%</span>
                <span className="text-[10px] ml-auto text-surface-50/40 font-mono">{formatVol(quest.fateVolume)} {FATE_ICON} Fate · {formatVol(quest.glyphVolume)} {GLYPH_ICON} Glyph</span>
              </div>
              <h1 className="text-xl font-bold mb-2">{quest.question}</h1>
              <p className="text-sm text-surface-50/50 mb-3">{quest.description}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-surface-50/40">Rarity Density</span>
                  <span className="font-bold" style={{ color: rColor }}>{rLabel} — R{quest.rarityDensity}</span>
                </div>
                <div className="w-full bg-surface-800 rounded-full h-2.5 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${quest.rarityDensity}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} className="h-2.5 rounded-full" style={{ background: `linear-gradient(90deg, #9ca3af, #22c55e, #3b82f6, #8b5cf6, ${rColor})` }} />
                </div>
                <div className="flex justify-between text-[9px] text-surface-50/30"><span>Common</span><span>Shifting</span><span>Refined</span><span>Uncommon</span><span>Rare</span><span>Mythic</span></div>
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[10px] text-surface-50/40"><span>YES price history</span><span className="text-green-400">{quest.yesProbability}%</span></div>
                <div className="h-24 relative">
                  <svg viewBox="0 0 200 80" className="w-full h-full">
                    <defs>
                      <linearGradient id="yesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={`M ${pricePoints.map((p, i) => `${(i / (pricePoints.length - 1)) * 200},${80 - (p.yesPrice / maxPrice) * 60}`).join(' L ')}`} fill="none" stroke="#22c55e" strokeWidth="2" />
                    <path d={`M ${pricePoints.map((p, i) => `${(i / (pricePoints.length - 1)) * 200},${80 - (p.yesPrice / maxPrice) * 60}`).join(' L ')} L 200,80 L 0,80 Z`} fill="url(#yesGrad)" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card glow>
              <h3 className="text-base font-bold text-crimson-300 mb-3">Place Your Wager</h3>
              {submitted ? (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-3">
                  <p className="text-green-400 text-base font-bold">Fate Forged!</p>
                  <p className="text-surface-50/50 text-sm mt-1">{amount} MP on {outcome}</p>
                </motion.div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <button onClick={() => setOutcome('YES')} className={clsx('flex-1 py-3 rounded-lg border-2 font-bold text-sm transition-all', outcome === 'YES' ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-surface-300/20 bg-surface-300/10 text-surface-50/40')}>YES · {quest.yesProbability}%</button>
                    <button onClick={() => setOutcome('NO')} className={clsx('flex-1 py-3 rounded-lg border-2 font-bold text-sm transition-all', outcome === 'NO' ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-surface-300/20 bg-surface-300/10 text-surface-50/40')}>NO · {quest.noProbability}%</button>
                  </div>
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-xs"><span className="text-surface-50/50">Wager (MP)</span><span className="text-crimson-400 font-mono">{amount} MP</span></div>
                    <input type="range" min={10} max={Math.min(player.insightPoints, 500)} step={10} value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full accent-crimson-600" />
                  </div>
                  <div className="mt-2 p-2 bg-surface-900/50 rounded-lg flex justify-between text-xs">
                    <span className="text-surface-50/50">Potential payout</span>
                    <span className="text-gold-400 font-bold font-mono">~{Math.round(amount * (100 / (outcome === 'YES' ? quest.yesProbability : quest.noProbability)))} MP</span>
                  </div>
                  <Button variant="gold" size="lg" className="w-full mt-3" onClick={handlePlace} disabled={amount > player.insightPoints}>
                    <Flame size={14} className="mr-1" /> Forge Your Fate
                  </Button>
                </>
              )}
            </Card>
          </div>

          {/* Row 2: Market Stats + Heroes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <div className="flex items-center gap-2 mb-2"><TrendingUp size={14} className="text-crimson-400" /><span className="text-xs font-medium">Market Stats</span></div>
              <div className="space-y-2">
                <div><p className="text-[10px] text-surface-50/40">Volume</p><p className="text-sm font-mono font-bold">{formatVol(quest.fateVolume)} {FATE_ICON} Fate · {formatVol(quest.glyphVolume)} {GLYPH_ICON} Glyph</p></div>
                <div><p className="text-[10px] text-surface-50/40">YES Price</p><p className="text-sm font-mono font-bold text-green-400">{quest.yesProbability}%</p></div>
                <div><p className="text-[10px] text-surface-50/40">NO Price</p><p className="text-sm font-mono font-bold text-red-400">{quest.noProbability}%</p></div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-2 mb-2"><Users size={14} className="text-crimson-400" /><span className="text-xs font-medium">Heroes</span></div>
              <div className="grid grid-cols-2 gap-1.5">
                {questHeroes.map(hero => (
                  <button key={hero.id} onClick={() => navigate(`/hero/${hero.handle}`)} className="glass rounded-lg p-2 text-left hover:border-crimson-500/40 transition-all">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-surface-800 border border-crimson-700/30 flex items-center justify-center text-[8px] font-bold text-crimson-300">{hero.name[0]}</div>
                      <div><p className="text-[10px] font-medium">{hero.name.split(' ')[0]}</p><p className="text-[8px] text-surface-50/40">{hero.title}</p></div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Row 3: Effects + Loot + Rarity Rewards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <div className="flex items-center gap-2 mb-3"><Zap size={16} className="text-gold-400" /><h3 className="text-sm font-bold">Active Effects</h3></div>
              <div className="space-y-1.5">
                {quest.effects.map(e => (
                  <div key={e.id} className={clsx('glass rounded-lg p-2.5 flex items-start gap-2', e.source === 'hero-item' ? 'border-l-2' : '')} style={e.source === 'hero-item' ? { borderLeftColor: rColor } : {}}>
                    <span className="text-sm">{e.source === 'quest-condition' ? '⚡' : '👑'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-medium">{e.name}</p>
                        <RarityBadge rarity={e.rarity} />
                        {e.source === 'hero-item' && e.heroId && <button onClick={() => navigate(`/hero/${HEROES.find(h => h.id === e.heroId)?.handle || e.heroId}`)} className="text-[9px] text-crimson-400 hover:underline">{HEROES.find(h => h.id === e.heroId)?.name}</button>}
                      </div>
                      <p className="text-[10px] text-surface-50/50">{e.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-2 mb-3"><Gift size={16} className="text-gold-400" /><span className="text-sm font-medium">Loot Table</span></div>
              <div className="space-y-1.5">
                {quest.lootTable.map(lt => (
                  <div key={lt.item.id} className="flex items-center justify-between p-2 glass rounded-lg">
                    <div><p className="text-xs font-medium">{lt.item.name}</p><p className="text-[9px] text-surface-50/40">{lt.item.description.slice(0, 50)}...</p></div>
                    <div className="text-right"><RarityBadge rarity={lt.item.rarity} /><p className="text-[9px] text-gold-400 mt-0.5">{(lt.chance * 100).toFixed(0)}%</p></div>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-2 mb-3"><Diamond size={16} className="text-gold-400" /><h3 className="text-sm font-bold">Rarity Tier Rewards</h3></div>
              <div className="space-y-2">
                {quest.tierVotes.map(tv => {
                  const winning = tv.winningOption ? tv.options.find(o => o.id === tv.winningOption) : undefined
                  return (
                    <div key={tv.tier} className={clsx('glass rounded-lg p-2.5', tv.status === 'locked' && 'opacity-40')} style={{ borderLeft: `3px solid ${TIER_COLORS[tv.tier] ?? '#6b7280'}` }}>
                      <div className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold" style={{ color: TIER_COLORS[tv.tier] }}>{TIER_LABELS[tv.tier]}</span>
                          {tv.status === 'resolved' && <CheckCheck size={12} className="text-green-400" />}
                          {tv.status === 'active' && <Vote size={12} className="text-gold-400" />}
                          {tv.status === 'locked' && <Lock size={12} className="text-surface-50/30" />}
                        </div>
                      </div>
                      {tv.status === 'resolved' && winning && <p className="text-[10px] text-surface-50/60 mt-1">Resolved: <span className="text-surface-50/80 font-medium">{winning.label}</span></p>}
                      {tv.status === 'active' && <p className="text-[10px] text-surface-50/60 mt-1">{tv.options.length} options · Vote in Voting tab</p>}
                      {tv.status === 'locked' && <p className="text-[10px] text-surface-50/50 mt-1">Requires higher rarity density</p>}
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ════════ VOTING ════════ */}
      {tab === 'voting' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {activeVote && (
            <Card glow className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Vote size={18} className="text-gold-400" />
                <span className="text-base font-bold" style={{ color: TIER_COLORS[activeVote.tier] }}>⚒ {TIER_LABELS[activeVote.tier]} Reward</span>
                <span className="text-[11px] text-gold-400 font-medium ml-auto">{activeVote.totalVotes} votes cast</span>
              </div>
              <p className="text-xs text-surface-50/60 mb-4">Cast your vote to decide the {activeVote.tier} tier reward. Your build amplifies your voting power.</p>

              {!hasWager && (
                <div className="mb-4 p-3 bg-amber-900/20 border border-amber-700/30 rounded-lg flex items-center gap-2">
                  <Lock size={14} className="text-amber-400 shrink-0" />
                  <p className="text-[11px] text-amber-400/80">Place a wager on this quest first to unlock voting.</p>
                </div>
              )}

              <div className="space-y-3">
                {activeVote.options.map(opt => {
                  const pct = activeVote.totalVotes > 0 ? Math.round((opt.voteCount / activeVote.totalVotes) * 100) : 0
                  const playerVote = (player.mythicVotes ?? []).find(v => v.questId === quest.id && v.tier === activeVote!.tier)
                  const isVoted = playerVote?.optionId === opt.id
                  return (
                    <div key={opt.id} className={clsx('glass rounded-lg p-3 transition-all', isVoted && 'border border-crimson-500/40')}>
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => { if (hasWager) castTierVote(quest.id, activeVote!.tier, opt.id) }}
                          disabled={!hasWager}
                          className={clsx('w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all', isVoted ? 'border-crimson-400 bg-crimson-400/40' : hasWager ? 'border-surface-500/40 hover:border-gold-400/60 cursor-pointer' : 'border-surface-500/20 cursor-not-allowed')}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={clsx('text-sm font-bold', isVoted && 'text-crimson-300')}>{opt.label}</p>
                            {isVoted && <span className="text-[9px] text-crimson-400/70">Your vote</span>}
                          </div>
                          <p className="text-[10px] text-surface-50/50">{opt.description}</p>
                          {opt.statBonuses && (
                            <div className="flex gap-1 mt-0.5">
                              {Object.keys(opt.statBonuses).map(k => <span key={k} className="text-[8px] text-surface-50/40 capitalize">+{opt.statBonuses![k as keyof typeof opt.statBonuses]} {k}</span>)}
                            </div>
                          )}
                          {opt.uniqueEffect && <p className="text-[10px] text-crimson-400/80 mt-0.5">&rarr; {opt.uniqueEffect}</p>}
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-2 rounded-full bg-surface-800 overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: isVoted ? '#ef4444' : TIER_COLORS[activeVote!.tier] }} />
                            </div>
                            <span className="text-[10px] text-surface-50/50 font-mono w-9 text-right">{pct}%</span>
                          </div>
                        </div>
                        {hasWager && !isVoted && (
                          <Button size="xs" variant="gold" onClick={() => castTierVote(quest.id, activeVote!.tier, opt.id)}>Vote</Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              {(() => {
                const pv = (player.mythicVotes ?? []).find(v => v.questId === quest.id && v.tier === activeVote!.tier)
                return pv ? (
                  <div className="mt-4 p-3 bg-surface-900/50 rounded-lg text-[10px]">
                    <span className="text-surface-50/50">Your vote weight: </span>
                    <span className="text-gold-400 font-bold font-mono">{pv.weight.toFixed(1)}x</span>
                    <span className="text-surface-50/50 ml-2">(Wisdom +{player.virtues.wisdom})</span>
                  </div>
                ) : null
              })()}
            </Card>
          )}

          {otherVotes.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-surface-50/60">All Tiers</h3>
              {otherVotes.map(tv => {
                const winning = tv.winningOption ? tv.options.find(o => o.id === tv.winningOption) : undefined
                return (
                  <div key={tv.tier} className={clsx('glass rounded-lg p-3 flex items-center gap-3', tv.status === 'locked' && 'opacity-40')}>
                    <span className="text-sm font-bold" style={{ color: TIER_COLORS[tv.tier] }}>{TIER_LABELS[tv.tier]}</span>
                    <div className="flex items-center gap-1.5">
                      {tv.status === 'resolved' && <CheckCheck size={14} className="text-green-400" />}
                      {tv.status === 'locked' && <Lock size={14} className="text-surface-50/30" />}
                    </div>
                    <div className="flex-1" />
                    <span className="text-[10px] text-surface-50/40">{tv.totalVotes} votes</span>
                    {tv.status === 'resolved' && winning && <span className="text-[10px] text-green-400/80">— {winning.label}</span>}
                    {tv.status === 'resolved' && tv.resolvedAt && <span className="text-[9px] text-surface-50/30">{formatDate(tv.resolvedAt)}</span>}
                  </div>
                )
              })}
            </div>
          )}

          {!activeVote && otherVotes.length === 0 && (
            <p className="text-center text-surface-50/30 py-8">No voting data available.</p>
          )}
        </div>
      )}

      {/* ════════ DISCUSSION ════════ */}
      {tab === 'discussion' && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-surface-50/40">Sort:</span>
            {(['newest', 'upvotes', 'replies'] as const).map(s => (
              <button key={s} onClick={() => setDiscussionSort(s)} className={clsx('text-[10px] px-2 py-0.5 rounded border transition-all', discussionSort === s ? 'border-crimson-500/40 text-crimson-300 bg-crimson-900/30' : 'border-surface-300/20 text-surface-50/40 hover:text-surface-50/70')}>{s === 'newest' ? 'Newest' : s === 'upvotes' ? 'Most Upvoted' : 'Most Replies'}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-surface-800 border border-crimson-700/30 flex items-center justify-center text-[10px] font-bold text-crimson-300 shrink-0">{player.username[0]}</div>
            <div className="flex-1 bg-surface-800/60 border border-surface-500/20 rounded-lg px-3 py-2 text-xs text-surface-50/50">Add a comment...</div>
          </div>
          <div className="space-y-1">
            {sortedComments.map(c => (
              <div key={c.id} className="glass rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-surface-800 border flex items-center justify-center text-[8px] font-bold shrink-0" style={{ borderColor: (FACTION_INFO[c.authorFaction]?.color ?? '#6b7280') + '60', color: FACTION_INFO[c.authorFaction]?.color }}>{c.authorName[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium" style={{ color: FACTION_INFO[c.authorFaction]?.color }}>{c.authorName}</span>
                      <span className="text-[7px] px-1 py-0.5 rounded border" style={{ color: FACTION_INFO[c.authorFaction]?.color + '80', borderColor: FACTION_INFO[c.authorFaction]?.color + '20', backgroundColor: FACTION_INFO[c.authorFaction]?.color + '08' }}>{FACTION_INFO[c.authorFaction]?.name.split(' ')[1]}</span>
                      <span className="text-[8px] text-surface-50/30">{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-[11px] mt-1">{c.text}</p>
                    <div className="flex items-center gap-3 mt-2 text-[9px]">
                      <button className="flex items-center gap-0.5 text-surface-50/40 hover:text-green-400"><ThumbsUp size={10} /> {c.upvotes}</button>
                      <button className="flex items-center gap-0.5 text-surface-50/40 hover:text-red-400"><ThumbsDown size={10} /> {c.downvotes}</button>
                      {c.replies.length > 0 && <span className="flex items-center gap-0.5 text-surface-50/30"><MessageCircle size={10} /> {c.replies.length} replies</span>}
                    </div>
                    {c.replies.length > 0 && (
                      <div className="mt-2 pl-4 border-l border-surface-500/20 space-y-1">
                        {c.replies.map(r => (
                          <div key={r.id} className="py-1">
                            <div className="flex items-start gap-1.5">
                              <div className="w-4 h-4 rounded-full bg-surface-800 border flex items-center justify-center text-[7px] font-bold shrink-0" style={{ borderColor: (FACTION_INFO[r.authorFaction]?.color ?? '#6b7280') + '40', color: FACTION_INFO[r.authorFaction]?.color }}>{r.authorName[0]}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1"><span className="text-[9px] font-medium" style={{ color: FACTION_INFO[r.authorFaction]?.color }}>{r.authorName}</span><span className="text-[7px] text-surface-50/30">{timeAgo(r.createdAt)}</span></div>
                                <p className="text-[10px] mt-0.5">{r.text}</p>
                                <div className="flex items-center gap-2 mt-1 text-[8px]">
                                  <button className="flex items-center gap-0.5 text-surface-50/40 hover:text-green-400"><ThumbsUp size={8} /> {r.upvotes}</button>
                                  <button className="flex items-center gap-0.5 text-surface-50/40 hover:text-red-400"><ThumbsDown size={8} /> {r.downvotes}</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════ LEADERBOARD ════════ */}
      {tab === 'leaderboard' && (
        <div className="space-y-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-surface-50/30" />
              <input value={lbSearch} onChange={e => setLbSearch(e.target.value)} placeholder="Search players..." className="bg-surface-800/60 border border-surface-500/20 rounded-md pl-7 pr-2 py-1 text-[10px] text-surface-50 w-40 focus:outline-none focus:border-crimson-500/40" />
            </div>
            <select value={lbFaction} onChange={e => setLbFaction(e.target.value as Faction | 'ALL')} className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1 text-[10px] text-surface-50">
              <option value="ALL">All Factions</option>
              {FACTION_LIST.map(f => <option key={f} value={f}>{FACTION_INFO[f].name}</option>)}
            </select>
            <select value={lbDirection} onChange={e => setLbDirection(e.target.value as 'ALL' | 'YES' | 'NO')} className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1 text-[10px] text-surface-50">
              <option value="ALL">All Directions</option><option value="YES">YES</option><option value="NO">NO</option>
            </select>
            <select value={lbSort} onChange={e => setLbSort(e.target.value as 'volume' | 'newest' | 'oldest')} className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1 text-[10px] text-surface-50">
              <option value="volume">Volume</option><option value="newest">Newest</option><option value="oldest">Oldest</option>
            </select>
            <span className="text-[9px] text-surface-50/30 ml-auto">{leaderboardFiltered.length} players</span>
          </div>
          <div className="space-y-1">
            {leaderboardFiltered.map((qp, i) => {
              const factionColor = FACTION_INFO[qp.faction]?.color ?? '#6b7280'
              return (
                <div key={qp.id} className={clsx('glass rounded-lg p-3 transition-all', qp.username === player.username && 'border border-crimson-500/40')}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-surface-50/30 w-6 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{ color: factionColor }}>{qp.username}</span>
                        <span className="text-[8px] px-1.5 py-0.5 rounded border" style={{ color: factionColor, borderColor: factionColor + '30', backgroundColor: factionColor + '10' }}>{FACTION_INFO[qp.faction]?.name.split(' ')[1]}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[9px] text-surface-50/40">
                        <span className="text-surface-50/60 font-mono">{qp.wagerAmount.toLocaleString()} MP</span>
                        <span className={clsx(qp.wagerOutcome === 'YES' ? 'text-green-400' : 'text-red-400')}>{qp.wagerOutcome}</span>
                        <span>{timeAgo(qp.wageredAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            {leaderboardFiltered.length === 0 && <p className="text-center text-surface-50/30 py-8">No players match your filters.</p>}
          </div>
        </div>
      )}

      {/* ════════ ACTIVITY ════════ */}
      {tab === 'activity' && (
        <div className="space-y-1.5 max-w-2xl mx-auto">
          {quest.activities.map(a => (
            <div key={a.id} className="glass rounded-lg p-3 flex items-start gap-3">
              <span className="text-sm mt-0.5">{a.type === 'wager' ? '💰' : a.type === 'price_move' ? '📈' : a.type === 'hero_action' ? '👑' : a.type === 'effect_trigger' ? '⚡' : '✓'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs">
                  {a.username && <span className="font-medium" style={{ color: FACTION_INFO[a.faction!]?.color }}>{a.username}</span>}
                  {a.username && ' '}{a.text}
                </p>
                <p className="text-[9px] text-surface-50/30 mt-0.5">{timeAgo(a.createdAt)}</p>
              </div>
              {a.amount && <span className="text-[10px] text-surface-50/40 font-mono">{a.amount} MP</span>}
            </div>
          ))}
          {quest.activities.length === 0 && <p className="text-center text-surface-50/30 py-8">No activity yet.</p>}
        </div>
      )}
    </div>
  )
}
