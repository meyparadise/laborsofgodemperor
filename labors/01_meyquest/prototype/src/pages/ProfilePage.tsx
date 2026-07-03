import { useNavigate } from 'react-router-dom'
import { Shield, Clock, CheckCircle, XCircle, Package, Sparkles, Eye, Flame, Target, Scale, Timer, User, ChevronDown, ChevronUp, Search } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { FACTION_INFO, HEROES, BADGE_CHAINS } from '@/data/mock'
import { Card, RarityBadge, Button } from '@/components/ui/ui'
import { VirtueBar, getVirtueTier, VIRTUE_META } from '@/components/ui/virtues'
import { ChipGroup, DropdownFilter } from '@/components/ui/filters'
import { TierBadge } from '@/components/ui/badges'
import { clsx } from 'clsx'
import type { VirtueName, SlotType, Badge, PredictionResult, Category, BadgeCategory, VirtueTierLevel } from '@/types'

const TIER_NAMES: Record<VirtueTierLevel, string> = { 0: 'Novice', 1: 'Initiate', 2: 'Adept', 3: 'Master' }


// ── Profile Page ──

const RESULT_COLORS: Record<PredictionResult, string> = { WON: 'text-green-400 bg-green-500/10', LOST: 'text-red-400 bg-red-500/10', PENDING: 'text-surface-50/40 bg-surface-300/20' }

function Tooltip({ children, content }: { children: React.ReactNode; content: React.ReactNode }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute z-30 bottom-full left-0 mb-1 w-56 glass rounded-lg p-2 border border-crimson-600/40 shadow-lg text-xs">
          {content}
        </div>
      )}
    </div>
  )
}

export function ProfilePage() {
  const player = useGameStore(s => s.player)
  const equipItem = useGameStore(s => s.equipItem)
  const unequipItem = useGameStore(s => s.unequipItem)
  const navigate = useNavigate()

  const faction = FACTION_INFO[player.faction]
  const wonCount = player.correctPredictions
  const lostCount = player.predictions.filter(p => p.result === 'LOST').length
  const pendingCount = player.predictions.filter(p => p.result === 'PENDING').length
  const winRate = (wonCount + lostCount) > 0 ? Math.round((wonCount / (wonCount + lostCount)) * 100) : 0
  const netPL = player.predictions.reduce((sum, p) => sum + p.netProfit, 0)
  const equippedIds = Object.values(player.equippedItems).filter(Boolean) as string[]
  const followedHeroes = HEROES.filter(h => player.followedHeroes.includes(h.id))
  const activeTax = Object.values(player.equippedItems).reduce((sum, id) => { const item = player.inventory.find(i => i.id === id); return sum + (item?.passiveCost ?? 0) }, 0)

  // Inventory state
  const [invSearch, setInvSearch] = useState('')
  const [invState, setInvState] = useState('ALL')
  const [invSlot, setInvSlot] = useState('ALL')
  const [invClass, setInvClass] = useState('ALL')
  const filteredInventory = useMemo(() => {
    return player.inventory.filter(item => {
      if (invSearch && !item.name.toLowerCase().includes(invSearch.toLowerCase())) return false
      if (invState === 'EQUMPPED' && !equippedIds.includes(item.id)) return false
      if (invState === 'UNEQUMPPED' && equippedIds.includes(item.id)) return false
      if (invSlot !== 'ALL' && item.slotType !== invSlot) return false
      if (invClass !== 'ALL' && item.itemClass !== invClass) return false
      return true
    })
  }, [player.inventory, invSearch, invState, invSlot, invClass, equippedIds])

  // History state
  const [histResult, setHistResult] = useState('ALL')
  const [histCategory, setHistCategory] = useState('ALL')
  const [histDate, setHistDate] = useState('ALL')
  const [expandedPred, setExpandedPred] = useState<string | null>(null)
  const filteredPredictions = useMemo(() => {
    let preds = [...player.predictions].reverse()
    if (histResult !== 'ALL') preds = preds.filter(p => p.result === histResult)
    if (histCategory !== 'ALL') preds = preds.filter(p => p.questCategory === histCategory)
    if (histDate === 'WEEK') {
      const weekAgo = new Date(Date.now() - 7 * 86400000)
      preds = preds.filter(p => new Date(p.placedAt) > weekAgo)
    } else if (histDate === 'MONTH') {
      const monthAgo = new Date(Date.now() - 30 * 86400000)
      preds = preds.filter(p => new Date(p.placedAt) > monthAgo)
    }
    return preds
  }, [player.predictions, histResult, histCategory, histDate])

  // Badge state
  const [badgeCat, setBadgeCat] = useState<BadgeCategory | 'ALL'>('ALL')
  const visibleChains = badgeCat === 'ALL' ? BADGE_CHAINS : BADGE_CHAINS.filter(c => c.category === badgeCat)

  // Tooltip state for inventory
  const [tooltipItem, setTooltipItem] = useState<string | null>(null)

  return (
    <div className="max-w-5xl space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-crimson-300" style={{ fontFamily: 'Cinzel, serif' }}>Profile</h2>
          <p className="text-surface-50/50 mt-1">Your oracular character sheet</p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/build')}>
          <Sparkles size={14} className="mr-1" /> Skill Tree ({player.skillPoints} pts)
        </Button>
      </div>

      {/* Identity Bar */}
      <Card glow className="flex items-center gap-6 p-6">
        <div className="w-20 h-20 rounded-full bg-crimson-900/60 border-2 border-crimson-600/40 flex items-center justify-center text-3xl font-bold text-crimson-300" style={{ fontFamily: 'Cinzel, serif' }}>
          {player.username[0]}
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold">{player.username}</h3>
          <div className="flex items-center gap-4 mt-1 flex-wrap">
            <span className="text-surface-50/50 text-sm">Lv.{player.level}</span>
            <span className="text-gold-400 font-mono text-sm">{player.insightPoints} MP</span>
            <Tooltip content={<><p className="font-medium" style={{ color: faction.color }}>{faction.name}</p><p className="text-surface-50/50">{faction.description}</p><p className="text-surface-50/30 mt-1 capitalize">Linked virtue: {faction.linkedVirtue}</p></>}>
              <span className="text-sm flex items-center gap-1 cursor-help" style={{ color: faction.color }}><Shield size={14} /> {faction.name}</span>
            </Tooltip>
            <span className="text-sm text-surface-50/50">{player.skillPoints} skill pts</span>
            <span className="text-sm text-surface-50/50">{player.followedHeroes.length}/10 Heroes</span>
          </div>
          <div className="w-full bg-surface-800 rounded-full h-2 mt-3">
            <div className="bg-crimson-600 h-2 rounded-full" style={{ width: `${player.xp % 100}%` }} />
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-surface-50/40">Win Rate</p>
          <p className="text-2xl font-bold text-green-400">{winRate}%</p>
          <p className="text-xs text-surface-50/30">{wonCount}W · {lostCount}L &middot; {pendingCount}P</p>
          <p className={clsx('text-xs font-mono mt-1', netPL >= 0 ? 'text-green-400' : 'text-red-400')}>{netPL >= 0 ? '+' : ''}{netPL} MP net</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Virtues */}
        <Card>
          <h3 className="text-lg font-bold mb-4 text-surface-50/80">Virtues</h3>
          <div className="space-y-4">
            {(Object.keys(player.virtues) as VirtueName[]).map(v => (
              <VirtueBar key={v} virtue={v} value={player.virtues[v]} />
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-surface-700/50 flex items-center justify-between">
            <span className="text-xs text-surface-50/40">Total Virtue Power</span>
            <span className="font-mono text-sm text-gold-400">{Object.values(player.virtues).reduce((a, b) => a + b, 0)} / 120</span>
          </div>
        </Card>

        {/* Equipped Items */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-bold mb-4">Equipped Items</h3>
            {followedHeroes.length === 0 ? (
              <p className="text-sm text-surface-50/40">Follow heroes to unlock equipment slots. Visit the Atlas to find heroes.</p>
            ) : (
              <div className="space-y-2">
                {followedHeroes.map(hero => {
                  const slot = hero.slotType
                  const itemId = player.equippedItems[slot]
                  const equipped = itemId ? player.inventory.find(i => i.id === itemId) : null
                  return (
                    <div key={slot} className="glass rounded-lg p-3 flex items-center gap-3">
                      <span className="text-sm font-medium text-surface-50/70 capitalize w-24 shrink-0">{slot}</span>
                      <div className="flex-1 min-w-0">
                        {equipped ? (
                          <Tooltip content={<><div className="flex items-center gap-1"><p className="font-bold">{equipped.name}</p><RarityBadge rarity={equipped.rarity} /></div><p className="text-surface-50/50 italic">&ldquo;{equipped.flavorText}&rdquo;</p>{Object.entries(equipped.statBonuses).map(([k, v]) => <p key={k} className="text-surface-50/60 capitalize">+{v} {k}</p>)}{equipped.uniqueEffect && <p className="text-gold-400 mt-1">{equipped.uniqueEffect.name}: {equipped.uniqueEffect.description}</p>}{equipped.passiveCost > 0 && <p className="text-surface-50/30">Passive cost: {equipped.passiveCost}%</p>}</>}>
                            <div className="flex items-center gap-2 cursor-help">
                              <p className="text-sm font-medium text-gold-400">{equipped.name}</p>
                              <RarityBadge rarity={equipped.rarity} />
                              {equipped.passiveCost > 0 && <span className="text-[10px] text-surface-50/30">{equipped.passiveCost}% tax</span>}
                            </div>
                          </Tooltip>
                        ) : (
                          <p className="text-xs text-surface-50/30">Empty</p>
                        )}
                      </div>
                      {equipped && (
                        <button onClick={() => unequipItem(slot)} className="text-[10px] text-red-400 hover:underline shrink-0">Unequip</button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            {activeTax > 0 && (
              <p className="text-xs text-surface-50/40 mt-3 pt-2 border-t border-surface-700/50">
                Active Tax: <span className={clsx(activeTax <= 3 ? 'text-green-400' : activeTax <= 8 ? 'text-yellow-400' : 'text-red-400')}>{activeTax}%</span> of winnings
              </p>
            )}
          </Card>

          {/* Hero Followers */}
          <Card>
            <h3 className="text-lg font-bold mb-4">Heroes Followed</h3>
            {followedHeroes.length === 0 ? (
              <p className="text-sm text-surface-50/40">No heroes followed yet. Following heroes unlocks equipment slots and grants virtue bonuses.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {followedHeroes.map(hero => (
                  <Tooltip key={hero.id} content={<><p className="font-medium">{hero.name} — {hero.title}</p><p className="text-surface-50/50 capitalize">Unlocks: {hero.slotType} equipment slot</p><p className="text-surface-50/30 mt-1">{hero.bio}</p></>}>
                    <div className="glass rounded-lg p-3 flex items-center gap-2 cursor-help">
                      <div className="w-8 h-8 rounded-full bg-crimson-900/40 flex items-center justify-center font-bold text-xs">{hero.name[0]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">{hero.name}</p>
                        <p className="text-[9px] text-surface-50/40 capitalize">{hero.slotType} slot</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); useGameStore.getState().unfollowHero(hero.id) }} className="text-[10px] text-red-400 hover:underline shrink-0">Unfollow</button>
                    </div>
                  </Tooltip>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Inventory */}
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Package size={16} className="text-crimson-400" />
            <h3 className="text-lg font-bold">Inventory</h3>
            <span className="text-xs text-surface-50/30 ml-auto">{player.inventory.length} items</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <div className="flex items-center gap-1 bg-surface-700 rounded px-2 py-1 flex-1 min-w-[120px]">
              <Search size={12} className="text-surface-50/30" />
              <input placeholder="Search..." value={invSearch} onChange={e => setInvSearch(e.target.value)} className="bg-transparent text-xs outline-none flex-1" />
            </div>
            <DropdownFilter label="Slot" options={[{ label: 'All', value: 'ALL' }, { label: 'Vision', value: 'vision' }, { label: 'Algorithm', value: 'algorithm' }, { label: 'Network', value: 'network' }, { label: 'Conduit', value: 'conduit' }, { label: 'Capital', value: 'capital' }, { label: 'Data', value: 'data' }, { label: 'Narrative', value: 'narrative' }, { label: 'Resonance', value: 'resonance' }, { label: 'Cascade', value: 'cascade' }, { label: 'Anomaly', value: 'anomaly' }]} value={invSlot} onChange={setInvSlot} />
            <DropdownFilter label="Class" options={[{ label: 'All', value: 'ALL' }, { label: 'Equipment', value: 'equipment' }, { label: 'Weapon', value: 'weapon' }, { label: 'Active', value: 'active' }]} value={invClass} onChange={setInvClass} />
            <ChipGroup options={[{ label: 'All', value: 'ALL' }, { label: 'Equipped', value: 'EQUMPPED' }, { label: 'Unequipped', value: 'UNEQUMPPED' }]} selected={invState} onChange={setInvState} />
          </div>
          {filteredInventory.length === 0 ? (
            <p className="text-sm text-surface-50/40 py-4 text-center">No items match. Complete quests to earn loot!</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {filteredInventory.map(item => {
                const isEquipped = equippedIds.includes(item.id)
                const hasSlot = followedHeroes.some(h => h.slotType === item.slotType)
                return (
                  <div key={item.id} className="relative" onMouseEnter={() => setTooltipItem(item.id)} onMouseLeave={() => setTooltipItem(null)}>
                    <div className={clsx('glass rounded-lg p-3 transition-all', isEquipped ? 'border-crimson-500/40' : hasSlot ? 'hover:border-crimson-500/40' : 'opacity-60')}>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium truncate">{item.name}</p>
                        <RarityBadge rarity={item.rarity} />
                      </div>
                      <p className="text-[9px] text-surface-50/40 mt-1 capitalize">{item.slotType} &middot; {item.itemClass}</p>
                      {Object.entries(item.statBonuses).length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {Object.entries(item.statBonuses).map(([k, v]) => (
                            <span key={k} className="text-[9px] text-surface-50/60">+{v} {k}</span>
                          ))}
                        </div>
                      )}
                      {item.passiveCost > 0 && <span className="text-[9px] text-surface-50/30 block mt-1">{item.passiveCost}% tax</span>}
                      {isEquipped && <span className="text-[9px] text-crimson-400 block mt-1">Equipped</span>}
                      <div className="flex gap-1 mt-1">
                        {!isEquipped && hasSlot && (
                          <button onClick={() => equipItem(item.id, item.slotType)} className="text-[10px] text-gold-400 hover:underline">Equip</button>
                        )}
                        {!isEquipped && !hasSlot && (
                          <span className="text-[9px] text-surface-50/20">Need {item.slotType} hero</span>
                        )}
                      </div>
                    </div>
                    {tooltipItem === item.id && (
                      <div className="absolute z-30 bottom-full left-0 mb-2 w-56 glass rounded-lg p-3 border border-crimson-600/40 shadow-lg">
                        <p className="text-sm font-bold">{item.name}</p>
                        <RarityBadge rarity={item.rarity} />
                        <p className="text-[10px] text-surface-50/50 italic mt-1">&ldquo;{item.flavorText}&rdquo;</p>
                        <p className="text-[10px] text-surface-50/60 mt-1">{item.description}</p>
                        {Object.entries(item.statBonuses).length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {Object.entries(item.statBonuses).map(([k, v]) => <span key={k} className="text-[10px] text-surface-50/60 capitalize">+{v} {k}</span>)}
                          </div>
                        )}
                        {item.passiveCost > 0 && <p className="text-[10px] text-surface-50/40 mt-1">Passive cost: {item.passiveCost}% of winnings</p>}
                        {item.uniqueEffect && <p className="text-[10px] text-gold-400 mt-1">{item.uniqueEffect.name}: {item.uniqueEffect.description}</p>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Badges — current tier only */}
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-bold mb-4">Badges</h3>
          <div className="flex gap-2 mb-4 flex-wrap">
            {(['ALL', 'VIRTUE', 'LOYALTY', 'COLLECTION', 'MARKET'] as const).map(cat => (
              <button key={cat} onClick={() => setBadgeCat(cat)} className={clsx('px-3 py-1 rounded-full text-xs font-medium transition-all border', badgeCat === cat ? 'bg-crimson-900/40 border-crimson-600/40 text-crimson-300' : 'border-surface-300/20 text-surface-50/40 hover:text-surface-50/70')}>
                {cat === 'ALL' ? 'All' : cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {visibleChains.map(chain => {
              // Find current tier: highest unlocked, or first locked with progress
              let currentTier = chain.tiers[0]
              for (let i = chain.tiers.length - 1; i >= 0; i--) {
                if (chain.tiers[i].unlocked) { currentTier = chain.tiers[i]; break }
                if (chain.tiers[i].progress !== undefined) { currentTier = chain.tiers[i]; break }
              }
              const isMaxed = chain.tiers[3].unlocked
              const tierDot = (i: number) => i <= (isMaxed ? 3 : currentTier.tierIndex - (currentTier.unlocked ? 1 : 0)) ? '⬡' : '◇'

              return (
                <Tooltip key={chain.id} content={<div className="space-y-1"><p className="font-medium">{chain.name} — {chain.description}</p><p className="text-surface-50/50">{currentTier.name}</p><p className="text-surface-50/30">{currentTier.triggerDescription}</p>{!isMaxed && currentTier.progress !== undefined && <p className="text-surface-50/50">Progress: {currentTier.progress}/{currentTier.progressMax}</p>}</div>}>
                  <div className={clsx('glass rounded-lg p-4 text-center cursor-help transition-all', currentTier.unlocked ? 'border-crimson-600/30' : '')}>
                    <div className="text-2xl mb-1">{currentTier.unlocked ? '🏆' : isMaxed ? '👑' : '🔒'}</div>
                    <p className="text-xs font-bold">{chain.name}</p>
                    <TierBadge tier={currentTier.tier} />
                    <p className="text-[10px] text-surface-50/50 mt-1">{currentTier.name.split(': ')[1] ?? currentTier.name}</p>
                    <div className="flex justify-center gap-0.5 mt-2 text-[10px]">
                      {[0, 1, 2, 3].map(i => (
                        <span key={i} className={clsx(i <= (isMaxed ? 3 : currentTier.tierIndex - (currentTier.unlocked && !isMaxed && currentTier.tierIndex > 0 ? 0 : currentTier.unlocked ? 0 : 1)) ? 'text-gold-400' : 'text-surface-50/20')}>
                          {i <= currentTier.tierIndex - (currentTier.unlocked ? 0 : 0) - (isMaxed ? 0 : 0) ? '⬡' : '⬡'}
                        </span>
                      ))}
                    </div>
                    {currentTier.progress !== undefined && !currentTier.unlocked && (
                      <div className="w-full bg-surface-800 rounded-full h-1.5 mt-2">
                        <div className="bg-crimson-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, ((currentTier.progress!) / (currentTier.progressMax!)) * 100)}%` }} />
                      </div>
                    )}
                  </div>
                </Tooltip>
              )
            })}
          </div>
        </Card>

        {/* Prediction History */}
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-bold mb-4">Prediction History</h3>
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <ChipGroup options={[{ label: 'All', value: 'ALL' }, { label: 'Won', value: 'WON' }, { label: 'Lost', value: 'LOST' }, { label: 'Pending', value: 'PENDING' }]} selected={histResult} onChange={setHistResult} />
            <DropdownFilter label="Cat" options={[{ label: 'All', value: 'ALL' }, { label: 'Politics', value: 'POLITICS' }, { label: 'Tech', value: 'TECH' }, { label: 'Crypto', value: 'CRYPTO' }, { label: 'Sports', value: 'SPORTS' }, { label: 'Culture', value: 'CULTURE' }, { label: 'World', value: 'WORLD' }, { label: 'Finance', value: 'FINANCE' }, { label: 'Science', value: 'SCIENCE' }, { label: 'AI', value: 'AI' }, { label: 'Gaming', value: 'GAMING' }, { label: 'Entertainment', value: 'ENTERTAINMENT' }]} value={histCategory} onChange={setHistCategory} />
            <ChipGroup options={[{ label: 'All Time', value: 'ALL' }, { label: 'Month', value: 'MONTH' }, { label: 'Week', value: 'WEEK' }]} selected={histDate} onChange={setHistDate} />
            {(histResult !== 'ALL' || histCategory !== 'ALL' || histDate !== 'ALL') && (
              <button onClick={() => { setHistResult('ALL'); setHistCategory('ALL'); setHistDate('ALL') }} className="text-[10px] text-crimson-400 hover:underline">Clear</button>
            )}
          </div>

          {/* Summary */}
          <div className="flex gap-2 flex-wrap mb-3">
            {[
              { label: 'Bets', value: filteredPredictions.length.toString() },
              { label: 'Win Rate', value: filteredPredictions.filter(p => p.result !== 'PENDING').length > 0 ? `${Math.round((filteredPredictions.filter(p => p.result === 'WON').length / filteredPredictions.filter(p => p.result !== 'PENDING').length) * 100)}%` : '──' },
              { label: 'Net P/L', value: `${filteredPredictions.reduce((s, p) => s + p.netProfit, 0) >= 0 ? '+' : ''}${filteredPredictions.reduce((s, p) => s + p.netProfit, 0)} MP` },
            ].map(stat => (
              <div key={stat.label} className="glass rounded-lg px-3 py-1.5 text-center">
                <p className="text-[9px] text-surface-50/40">{stat.label}</p>
                <p className="text-xs font-mono font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {filteredPredictions.length === 0 ? (
              <p className="text-sm text-surface-50/40 py-4 text-center">No predictions found. Place your first bet on the Atlas!</p>
            ) : (
              filteredPredictions.map(p => {
                const isExpanded = expandedPred === p.id
                return (
                  <div key={p.id}>
                    <Tooltip content={<><p className="font-medium">{p.outcome} &middot; {p.amount} MP @{p.entryProbability}%</p>{p.heroFollowedName && <p className="text-surface-50/50">Hero: {p.heroFollowedName}</p>}<p className={clsx(p.result === 'WON' ? 'text-green-400' : p.result === 'LOST' ? 'text-red-400' : 'text-surface-50/40', 'mt-1')}>{p.result === 'WON' ? `Won +${p.netProfit} MP` : p.result === 'LOST' ? `Lost -${Math.abs(p.netProfit)} MP` : 'Pending'}</p></>}>
                      <div onClick={() => setExpandedPred(isExpanded ? null : p.id)} className="flex items-center gap-3 p-3 glass rounded-lg cursor-pointer hover:border-crimson-500/40 transition-all">
                        <div className={clsx('p-1.5 rounded', RESULT_COLORS[p.result])}>
                          {p.result === 'WON' ? <CheckCircle size={16} /> : p.result === 'LOST' ? <XCircle size={16} /> : <Clock size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p.questQuestion}</p>
                          <div className="flex items-center gap-3 text-xs text-surface-50/40">
                            <span className={p.outcome === 'YES' ? 'text-green-400' : 'text-red-400'}>{p.outcome}</span>
                            <span>{p.amount} MP</span>
                            <span>@{p.entryProbability}%</span>
                            <span>{new Date(p.placedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {p.result === 'WON' && <span className="text-green-400 font-mono text-sm font-bold">+{p.payout}</span>}
                          {p.result === 'LOST' && <span className="text-red-400 font-mono text-sm">-{p.amount}</span>}
                          {p.result === 'PENDING' && <span className="text-surface-50/30 font-mono text-sm">──</span>}
                        </div>
                        {isExpanded ? <ChevronUp size={14} className="text-surface-50/30 shrink-0" /> : <ChevronDown size={14} className="text-surface-50/30 shrink-0" />}
                      </div>
                    </Tooltip>
                    {isExpanded && (
                      <div className="glass rounded-lg p-4 ml-3 border-t border-surface-700/50 space-y-2">
                        {p.heroFollowedId && (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-crimson-900/40 flex items-center justify-center text-[10px] font-bold">{p.heroFollowedName?.[0]}</div>
                            <span className="text-xs text-surface-50/60">{p.heroFollowedName} — {p.heroFollowedTitle}</span>
                          </div>
                        )}
                        {p.equippedItems.length > 0 && (
                          <div>
                            <span className="text-[10px] text-surface-50/30 uppercase tracking-wider">Items Equipped</span>
                            {p.equippedItems.map(ei => (
                              <div key={ei.itemId} className="text-xs text-surface-50/50 ml-2">↳ {ei.itemName} ({ei.rarity}): {ei.effectDescription}</div>
                            ))}
                          </div>
                        )}
                        {p.virtueBonuses.length > 0 && (
                          <div>
                            <span className="text-[10px] text-surface-50/30 uppercase tracking-wider">Virtue Bonuses</span>
                            {p.virtueBonuses.map((vb, i) => (
                              <div key={i} className="text-xs text-surface-50/50 ml-2 capitalize">↳ {vb.virtue} {vb.virtueValue}: {vb.bonusDescription}</div>
                            ))}
                          </div>
                        )}
                        <div className="text-xs text-surface-50/30">
                          Placed: {new Date(p.placedAt).toLocaleString()}
                          {p.resolvedAt && <span> &middot; Resolved: {new Date(p.resolvedAt).toLocaleString()}</span>}
                        </div>
                        {p.result === 'WON' && (
                          <div className="text-xs text-surface-50/40">
                            Payout: {p.amount} × (100/{p.entryProbability}) = {p.payout} MP &middot; Net: +{p.netProfit} MP
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </Card>
      </div>


    </div>
  )
}
