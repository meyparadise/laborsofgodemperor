import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Eye, Flame, Shield, Target, Timer, Scale } from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import { FACTION_INFO, HEROES, DECK_CARDS } from '@/data/mock'
import { Card, RarityBadge, Button } from '@/components/ui/ui'
import { VIRTUE_META } from '@/components/ui/virtues'
import { clsx } from 'clsx'
import type { Faction, VirtueName, SlotType, Item, DeckCard } from '@/types'

type Tab = 'gear' | 'heroes' | 'deck'

const VIRTUE_COLORS: Record<VirtueName, string> = { wisdom: '#06b6d4', courage: '#ef4444', prudence: '#f59e0b', skill: '#10b981', temperance: '#8b5cf6', justice: '#cbd5e1' }

function ItemCard({ item, compact }: { item: Item; compact?: boolean }) {
  return (
    <div className={clsx('text-[11px]', compact && 'text-[10px]')}>
      <div className="flex items-center gap-1.5">
        <span className="font-bold text-surface-50">{item.name}</span>
        <RarityBadge rarity={item.rarity} />
        {item.passiveCost > 0 && <span className="text-surface-50/30">{item.passiveCost}% tax</span>}
      </div>
      {!compact && <p className="text-surface-50/50 italic mt-0.5">&ldquo;{item.flavorText}&rdquo;</p>}
      <p className="text-surface-50/40 capitalize mt-0.5">{item.slotType} &middot; {item.itemClass}</p>
      {Object.entries(item.statBonuses).length > 0 && (
        <div className="flex gap-1 mt-0.5 flex-wrap">
          {Object.entries(item.statBonuses).map(([k, v]) => (
            <span key={k} className="text-surface-50/50 capitalize">+{v} {k}</span>
          ))}
        </div>
      )}
      {item.uniqueEffect && !compact && (
        <p className="text-gold-400 mt-0.5">{item.uniqueEffect.name}: {item.uniqueEffect.description}</p>
      )}
      {item.requiredVirtue && (
        <p className="text-[10px] text-surface-50/30 capitalize mt-0.5">Requires {item.requiredVirtue} {item.requiredValue}</p>
      )}
    </div>
  )
}

function CardTooltip({ card }: { card: DeckCard }) {
  return (
    <div className="text-[10px] space-y-0.5">
      <p className="font-bold text-sm" style={{ color: VIRTUE_COLORS[card.virtue] }}>{card.name}</p>
      <p className="text-surface-50/60 capitalize">{card.virtue} &middot; Tier {card.tier}</p>
      <p className="text-surface-50/50">{card.description}</p>
      <div className="flex gap-2 flex-wrap mt-1">
        {card.cardType === 'support' && <span className="text-green-400">+{card.powerGrant} Power</span>}
        {card.powerCost > 0 && <span className="text-yellow-400/80">Cost: {card.powerCost}</span>}
        {card.sustainCost > 0 && <span className="text-red-400/80">Sustain: {card.sustainCost} MP</span>}
        <span className="text-surface-50/30">Unlock: {card.unlockCost}pt</span>
      </div>
      {card.prerequisites.length > 0 && (
        <p className="text-surface-50/30">Prereq: {card.prerequisites.join(', ')}</p>
      )}
    </div>
  )
}

export function BuildPage() {
  const player = useGameStore(s => s.player)
  const unlockCard = useGameStore(s => s.unlockCard)
  const slotCard = useGameStore(s => s.slotCard)
  const unslotCard = useGameStore(s => s.unslotCard)
  const equipItem = useGameStore(s => s.equipItem)
  const unequipItem = useGameStore(s => s.unequipItem)
  const navigate = useNavigate()

  const [tab, setTab] = useState<Tab>('gear')
  const factionInfo = FACTION_INFO[player.faction]
  const followedHeroes = HEROES.filter(h => player.followedHeroes.includes(h.id))
  const equippedIds = Object.values(player.equippedItems).filter(Boolean) as string[]
  const activeTax = Object.values(player.equippedItems).reduce((sum, id) => { const item = player.inventory.find(i => i.id === id); return sum + (item?.passiveCost ?? 0) }, 0)
  const unlockedCards = new Set(player.unlockedCards)

  // Hero filter state
  const [heroFilter, setHeroFilter] = useState<Faction | 'ALL'>('ALL')
  const [heroSearch, setHeroSearch] = useState('')
  const [heroSlotFilter, setHeroSlotFilter] = useState<string>('ALL')
  const filteredHeroes = HEROES.filter(hero => {
    if (heroFilter !== 'ALL' && hero.faction !== heroFilter) return false
    if (heroSlotFilter !== 'ALL' && hero.slotType !== heroSlotFilter) return false
    if (heroSearch && !hero.name.toLowerCase().includes(heroSearch.toLowerCase()) && !hero.title.toLowerCase().includes(heroSearch.toLowerCase())) return false
    return true
  })

  // Inventory search
  const [gearSearch, setGearSearch] = useState('')
  const [gearSlot, setGearSlot] = useState('ALL')
  const [gearClass, setGearClass] = useState('ALL')
  const [gearRarity, setGearRarity] = useState('ALL')
  const [gearState, setGearState] = useState('ALL')
  const gearInventory = player.inventory.filter(item => {
    if (gearSearch && !item.name.toLowerCase().includes(gearSearch.toLowerCase())) return false
    if (gearSlot !== 'ALL' && item.slotType !== gearSlot) return false
    if (gearClass !== 'ALL' && item.itemClass !== gearClass) return false
    if (gearRarity !== 'ALL' && item.rarity !== gearRarity) return false
    if (gearState === 'EQUIPPED' && !equippedIds.includes(item.id)) return false
    if (gearState === 'UNEQUIPPED' && equippedIds.includes(item.id)) return false
    return true
  })

  // Deck state
  const [cardFilter, setCardFilter] = useState<VirtueName | 'ALL'>('ALL')
  const [cardSearch, setCardSearch] = useState('')
  const filteredCards = DECK_CARDS.filter(c => {
    if (cardFilter !== 'ALL' && c.virtue !== cardFilter) return false
    if (cardSearch && !c.name.toLowerCase().includes(cardSearch.toLowerCase())) return false
    return true
  })

  // Per-virtue power budget
  const virtuePower = (Object.keys(player.virtues) as VirtueName[]).map(v => {
    const base = player.virtues[v]
    const support = player.deckSlots.reduce((sum, id) => {
      if (!id) return sum
      const card = DECK_CARDS.find(c => c.id === id)
      return sum + (card?.virtue === v ? (card?.powerGrant ?? 0) : 0)
    }, 0)
    const used = player.deckSlots.reduce((sum, id) => {
      if (!id) return sum
      const card = DECK_CARDS.find(c => c.id === id)
      return sum + (card?.virtue === v ? (card?.powerCost ?? 0) : 0)
    }, 0)
    const total = base + support
    return { virtue: v, base, support, used, total, ok: used <= total }
  })

  // Drag handlers for gear
  const handleDragStart = useCallback((e: React.DragEvent, itemId: string, fromSlot?: SlotType) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', itemId)
  }, [])

  const handleSlotDrop = useCallback((e: React.DragEvent, slotType: SlotType) => {
    e.preventDefault()
    const itemId = e.dataTransfer.getData('text/plain')
    if (itemId) {
      const item = player.inventory.find(i => i.id === itemId)
      if (item && item.slotType === slotType) equipItem(itemId, slotType)
    }
  }, [player.inventory, equipItem])

  const handleSlotDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleUnequipDrop = useCallback((e: React.DragEvent, slotType: SlotType) => {
    e.preventDefault()
    unequipItem(slotType)
  }, [unequipItem])

  // Deck drag handlers
  const handleDeckSlotDrop = useCallback((e: React.DragEvent, slotIndex: number) => {
    e.preventDefault()
    const cardId = e.dataTransfer.getData('text/plain')
    if (cardId && player.unlockedCards.includes(cardId)) {
      slotCard(cardId, slotIndex)
    }
  }, [player.unlockedCards, slotCard])

  const heroSlots = followedHeroes.map(h => h.slotType)

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'gear', label: 'Gear', icon: '⚙' },
    { id: 'heroes', label: 'Heroes', icon: '👥' },
    { id: 'deck', label: 'Deck', icon: '🂠' },
  ]

  return (
    <div className="h-full flex flex-col max-w-full">
      {/* HUD Header */}
      <div className="flex items-center justify-between px-6 py-3 glass border-b border-crimson-700/30 shrink-0">
        <h2 className="text-xl font-bold text-crimson-300" style={{ fontFamily: 'Cinzel, serif' }}>BUILD</h2>
        <div className="flex items-center gap-1 bg-surface-800/60 rounded-lg p-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={clsx('px-4 py-1.5 rounded-md text-xs font-medium transition-all', tab === t.id ? 'bg-crimson-900/60 text-crimson-300 border border-crimson-700/40' : 'text-surface-50/40 hover:text-surface-50/70')}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <span className="text-sm text-gold-400 font-mono">{player.skillPoints} skill pts</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto scrollbar-thin p-6">
        {/* ═══════════════ GEAR TAB ═══════════════ */}
        {tab === 'gear' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 glass rounded-xl p-4">
              <div className="w-14 h-14 rounded-full bg-crimson-900/60 border-2 border-crimson-600/40 flex items-center justify-center text-2xl font-bold text-crimson-300" style={{ fontFamily: 'Cinzel, serif' }}>{player.username[0]}</div>
              <div>
                <p className="font-bold">{player.username}</p>
                <p className="text-xs text-surface-50/50">Lv.{player.level} &middot; <span style={{ color: factionInfo.color }}>{factionInfo.name}</span></p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm text-gold-400 font-mono">{player.insightPoints} MP</p>
                {activeTax > 0 && (
                  <p className={clsx('text-xs', activeTax <= 3 ? 'text-green-400' : activeTax <= 8 ? 'text-yellow-400' : 'text-red-400')}>{activeTax}% tax</p>
                )}
              </div>
            </div>

            {/* 4 Slot Gallery */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map(i => {
                const slot = heroSlots[i]
                const itemId = slot ? player.equippedItems[slot] : undefined
                const equipped = (itemId && slot) ? player.inventory.find(i => i.id === itemId) : null
                return (
                  <div
                    key={i}
                    onDragOver={slot ? handleSlotDragOver : undefined}
                    onDrop={slot ? (e => equipped ? handleUnequipDrop(e, slot) : handleSlotDrop(e, slot)) : undefined}
                    className={clsx(
                      'rounded-xl border-2 p-3 text-center transition-all min-h-[120px] flex flex-col items-center justify-center',
                      slot ? (equipped ? 'border-crimson-600/40 bg-crimson-900/10 border-solid' : 'border-dashed border-gold-400/60 bg-gold-400/5') : 'border-dashed border-surface-700/20 bg-surface-800/30 opacity-50'
                    )}
                  >
                    {slot ? (
                      <>
                        <p className="text-xs font-bold text-surface-50/60 capitalize mb-1">{slot}</p>
                        {equipped ? (
                          <div className="space-y-1" draggable onDragStart={e => handleDragStart(e, equipped.id, slot)}>
                            <ItemCard item={equipped} compact />
                            <button onClick={() => unequipItem(slot)} className="text-[10px] text-red-400 hover:underline">Remove</button>
                          </div>
                        ) : (
                          <p className="text-[10px] text-surface-50/20">Drop item here</p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-surface-50/30 font-bold mb-1">Locked</p>
                        <p className="text-[10px] text-surface-50/20">Follow a hero</p>
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Inventory */}
            <Card>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <h3 className="text-lg font-bold">Inventory</h3>
                <span className="text-xs text-surface-50/30">{player.inventory.length} items</span>
                <div className="flex items-center gap-1 bg-surface-700 rounded px-2 py-1 flex-1 min-w-[120px]">
                  <Search size={12} className="text-surface-50/30" />
                  <input placeholder="Search..." value={gearSearch} onChange={e => setGearSearch(e.target.value)} className="bg-transparent text-xs outline-none flex-1" />
                </div>
                <select value={gearSlot} onChange={e => setGearSlot(e.target.value)} className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1 text-xs text-surface-50">
                  <option value="ALL">All Slots</option><option value="vision">Vision</option><option value="algorithm">Algorithm</option><option value="network">Network</option><option value="conduit">Conduit</option><option value="capital">Capital</option><option value="data">Data</option><option value="narrative">Narrative</option><option value="resonance">Resonance</option><option value="cascade">Cascade</option><option value="anomaly">Anomaly</option>
                </select>
                <select value={gearClass} onChange={e => setGearClass(e.target.value)} className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1 text-xs text-surface-50">
                  <option value="ALL">All Classes</option><option value="equipment">Equipment</option><option value="weapon">Weapon</option><option value="active">Active</option>
                </select>
                <select value={gearRarity} onChange={e => setGearRarity(e.target.value)} className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1 text-xs text-surface-50">
                  <option value="ALL">All Rarities</option><option value="mythic">Mythic</option><option value="rare">Rare</option><option value="uncommon">Uncommon</option>
                </select>
                <div className="flex gap-1">
                  {(['ALL', 'EQUIPPED', 'UNEQUIPPED'] as const).map(s =>
                    <button key={s} onClick={() => setGearState(s)} className={clsx('px-2 py-1 rounded-full text-[10px] font-medium transition-all border', gearState === s ? 'bg-crimson-900/40 border-crimson-600/40 text-crimson-300' : 'border-surface-300/20 text-surface-50/40 hover:text-surface-50/70')}>{s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}</button>
                  )}
                </div>
              </div>
              {gearInventory.length === 0 ? (
                <p className="text-xs text-surface-50/40 py-4 text-center">No items. Complete quests to earn loot.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {gearInventory.map(item => {
                    const isEquipped = equippedIds.includes(item.id)
                    const isCompatible = heroSlots.includes(item.slotType)
                    const fulfillsReq = !item.requiredVirtue || !item.requiredValue || (player.virtues[item.requiredVirtue] ?? 0) >= item.requiredValue
                    return (
                      <div key={item.id} draggable onDragStart={e => handleDragStart(e, item.id)}
                        className={clsx('glass rounded-lg p-2 cursor-grab active:cursor-grabbing transition-all',
                          isEquipped ? 'border-crimson-500/40 opacity-70' : isCompatible && fulfillsReq ? 'hover:border-gold-400/40' : 'opacity-50')}>
                        <ItemCard item={item} compact />
                        <div className="flex gap-1 mt-1">
                          {!isEquipped && isCompatible && fulfillsReq && (
                            <button onClick={() => equipItem(item.id, item.slotType)} className="text-[10px] text-gold-400 hover:underline">Equip</button>
                          )}
                          {!isEquipped && isCompatible && !fulfillsReq && (
                            <span className="text-[9px] text-red-400/60">Need {item.requiredVirtue} {item.requiredValue}</span>
                          )}
                          {!isEquipped && !isCompatible && (
                            <span className="text-[9px] text-surface-50/20">Need {item.slotType} hero</span>
                          )}
                          {isEquipped && <span className="text-[9px] text-crimson-400">Equipped</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
            <p className="text-[10px] text-surface-50/20 text-center">Drag items to slots above, drag equipped items out to unequip</p>
          </div>
        )}

        {/* ═══════════════ HEROES TAB ═══════════════ */}
        {tab === 'heroes' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map(i => {
                const heroId = player.followedHeroes[i]
                const hero = heroId ? HEROES.find(h => h.id === heroId) : null
                return (
                  <div key={i} onDragOver={handleSlotDragOver} onDrop={e => {
                    const draggedId = e.dataTransfer.getData('text/plain')
                    if (draggedId && !player.followedHeroes.includes(draggedId)) useGameStore.getState().followHero(draggedId)
                  }}
                    className={clsx('rounded-xl border-2 p-3 text-center transition-all min-h-[130px] flex flex-col items-center justify-center',
                      hero ? 'border-crimson-600/40 bg-crimson-900/10 border-solid' : 'border-dashed border-surface-600/20 bg-surface-800/30')}>
                    {hero ? (
                      <div className="space-y-1 cursor-grab active:cursor-grabbing" draggable onDragStart={e => { e.dataTransfer.setData('text/plain', hero.id); e.dataTransfer.effectAllowed = 'move' }}>
                        <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-lg font-bold" style={{ backgroundColor: `${VIRTUE_COLORS[hero.primaryVirtue]}15`, border: `2px solid ${VIRTUE_COLORS[hero.primaryVirtue]}40`, color: VIRTUE_COLORS[hero.primaryVirtue], fontFamily: 'Cinzel, serif' }}>{hero.name[0]}</div>
                        <p className="text-xs font-bold">{hero.name}</p>
                        <p className="text-[9px] text-surface-50/40 capitalize">{hero.slotType} slot</p>
                        <button onClick={() => useGameStore.getState().unfollowHero(hero.id)} className="text-[10px] text-red-400 hover:underline">Remove</button>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-surface-50/40 font-bold mb-1">Empty</p>
                        <p className="text-[10px] text-surface-50/20">Drag a hero here</p>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
            <div onDragOver={e => { e.preventDefault() }} onDrop={e => {
              const heroId = e.dataTransfer.getData('text/plain')
              if (heroId && player.followedHeroes.includes(heroId)) useGameStore.getState().unfollowHero(heroId)
            }} className="text-center py-2 border border-dashed border-surface-600/20 rounded-lg opacity-50 hover:opacity-80 transition-all">
              <p className="text-[10px] text-surface-50/30">Drop heroes here to unfollow</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-surface-700 rounded px-2 py-1 w-40">
                <Search size={12} className="text-surface-50/30" />
                <input placeholder="Search..." value={heroSearch} onChange={e => setHeroSearch(e.target.value)} className="bg-transparent text-xs outline-none flex-1" />
              </div>
              {(['ALL', 'architects', 'legion', 'wardens', 'operatives', 'tribunal', 'monastics'] as const).map(f => (
                <button key={f} onClick={() => setHeroFilter(f)} className={clsx('px-3 py-1 rounded-full text-xs font-medium transition-all border', heroFilter === f ? 'bg-crimson-900/40 border-crimson-600/40 text-crimson-300' : 'border-surface-300/20 text-surface-50/40 hover:text-surface-50/70')}>{f === 'ALL' ? 'All' : FACTION_INFO[f].name}</button>
              ))}
              <select value={heroSlotFilter} onChange={e => setHeroSlotFilter(e.target.value)} className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1 text-xs text-surface-50 ml-auto">
                <option value="ALL">All Slots</option><option value="vision">Vision</option><option value="algorithm">Algorithm</option><option value="network">Network</option><option value="conduit">Conduit</option><option value="capital">Capital</option><option value="data">Data</option><option value="narrative">Narrative</option><option value="resonance">Resonance</option><option value="cascade">Cascade</option><option value="anomaly">Anomaly</option>
              </select>
              <span className="text-xs text-surface-50/30">{player.followedHeroes.length}/4 followed</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {filteredHeroes.map(hero => {
                const isFollowing = player.followedHeroes.includes(hero.id)
                const factionColor = FACTION_INFO[hero.faction].color
                const virtColor = VIRTUE_COLORS[hero.primaryVirtue]
                return (
                  <Card key={hero.id} glow={isFollowing} onClick={() => navigate(`/hero/${hero.handle}`)}
                    draggable={!isFollowing} onDragStart={!isFollowing ? e => { e.dataTransfer.setData('text/plain', hero.id) } : undefined}
                    className={clsx('text-center p-4 transition-all', isFollowing ? 'opacity-50 cursor-default' : 'cursor-grab active:cursor-grabbing hover:border-crimson-500/40')}>
                    <div className="w-14 h-14 rounded-full mx-auto mb-2 flex items-center justify-center text-xl font-bold" style={{ backgroundColor: `${virtColor}15`, border: `2px solid ${virtColor}40`, color: virtColor, fontFamily: 'Cinzel, serif' }}>{hero.name[0]}</div>
                    <p className="text-sm font-bold">{hero.name}</p>
                    <p className="text-[10px] text-surface-50/40">{hero.title}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${factionColor}15`, color: factionColor }}>{FACTION_INFO[hero.faction].name}</span>
                    <p className="text-[9px] text-surface-50/50 mt-1 capitalize">{hero.slotType} slot</p>
                    {isFollowing && <p className="text-[9px] text-crimson-400 mt-1">Already followed</p>}
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* ═══════════════ DECK TAB ═══════════════ */}
        {tab === 'deck' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Per-Virtue Power Bars + Stat Allocation */}
            <div className="glass rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Power Budget</span>
                <span className="text-xs text-gold-400 font-mono">{player.skillPoints} attribute pts available</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {virtuePower.map(vp => {
                const meta = VIRTUE_META[vp.virtue] ?? { icon: Eye, label: vp.virtue, color: VIRTUE_COLORS[vp.virtue] }
                const VirtueIcon = meta.icon
                const pct = Math.min(100, (vp.used / Math.max(1, vp.total)) * 100)
                const canInc = player.skillPoints > 0 && player.virtues[vp.virtue] < 20
                const canDec = player.virtues[vp.virtue] > 1
                return (
                  <div key={vp.virtue} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <VirtueIcon size={12} style={{ color: meta.color }} />
                        <span className="text-xs font-medium capitalize">{vp.virtue}</span>
                        <div className="flex items-center gap-0.5 ml-1">
                          <button onClick={() => { useGameStore.getState().setStat(vp.virtue, player.virtues[vp.virtue] + 1); useGameStore.getState().setSkillPoints(player.skillPoints - 1) }} disabled={!canInc} className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-surface-700 hover:bg-surface-600 disabled:opacity-20 disabled:cursor-not-allowed text-surface-50 leading-none">+</button>
                          <button onClick={() => { useGameStore.getState().setStat(vp.virtue, player.virtues[vp.virtue] - 1); useGameStore.getState().setSkillPoints(player.skillPoints + 1) }} disabled={!canDec} className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-surface-700 hover:bg-surface-600 disabled:opacity-20 disabled:cursor-not-allowed text-surface-50 leading-none">-</button>
                        </div>
                      </div>
                      <span className={clsx('text-xs font-mono', vp.ok ? 'text-green-400' : 'text-red-400')}>{vp.used} / {vp.total}</span>
                    </div>
                    <div className="w-full bg-surface-800 rounded-full h-2 overflow-hidden">
                      <div className={clsx('h-2 rounded-full transition-all', vp.ok ? '' : 'bg-red-600/60')} style={{ width: `${pct}%`, backgroundColor: vp.ok ? meta.color : undefined, opacity: vp.ok ? 0.7 : 1 }} />
                    </div>
                    <div className="text-[9px] text-surface-50/30 flex gap-2">
                      <span>Stat: {vp.base}</span>
                      {vp.support > 0 && <span className="text-green-400/60">+{vp.support} support</span>}
                    </div>
                  </div>
                )
              })}
              </div>
            </div>

            {/* Deck Slots */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {player.deckSlots.map((cardId, i) => {
                const card = cardId ? DECK_CARDS.find(c => c.id === cardId) : null
                return (
                  <div key={i} onDragOver={handleSlotDragOver} onDrop={e => handleDeckSlotDrop(e, i)}
                    className={clsx('rounded-xl border-2 p-3 text-center transition-all min-h-[100px] flex flex-col items-center justify-center',
                      card ? 'border-crimson-600/40 bg-crimson-900/10 border-solid' : 'border-dashed border-gold-400/40 bg-gold-400/5')}>
                    {card ? (
                      <div className="space-y-1" draggable onDragStart={e => { e.dataTransfer.setData('text/plain', card.id) }}>
                        <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${VIRTUE_COLORS[card.virtue]}20`, border: `2px solid ${VIRTUE_COLORS[card.virtue]}50`, color: VIRTUE_COLORS[card.virtue] }}>{card.tier === 1 ? '●' : '⬡'}</div>
                        <p className="text-xs font-bold text-surface-50">{card.name}</p>
                        <p className="text-[9px] text-surface-50/40">{card.powerCost > 0 ? `${card.powerCost} power` : `+${card.powerGrant} power`}{card.sustainCost > 0 ? ` · ${card.sustainCost} MP` : ''}</p>
                        <button onClick={() => unslotCard(i)} className="text-[10px] text-red-400 hover:underline">Remove</button>
                      </div>
                    ) : (
                      <p className="text-[10px] text-surface-50/20">Drop card here</p>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Card Collection */}
            <Card>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <h3 className="text-lg font-bold">Collection</h3>
                <span className="text-xs text-surface-50/30">{player.unlockedCards.length}/{DECK_CARDS.length} unlocked</span>
                <div className="flex items-center gap-1 bg-surface-700 rounded px-2 py-1 flex-1 min-w-[120px]">
                  <Search size={12} className="text-surface-50/30" />
                  <input placeholder="Search cards..." value={cardSearch} onChange={e => setCardSearch(e.target.value)} className="bg-transparent text-xs outline-none flex-1" />
                </div>
                <div className="flex gap-1">
                  {(['ALL', 'wisdom', 'courage', 'prudence', 'skill', 'temperance', 'justice'] as const).map(v => (
                    <button key={v} onClick={() => setCardFilter(v)} className={clsx('px-2 py-1 rounded-full text-[10px] font-medium transition-all border', cardFilter === v ? 'bg-crimson-900/40 border-crimson-600/40 text-crimson-300' : 'border-surface-300/20 text-surface-50/40 hover:text-surface-50/70')}>{v === 'ALL' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {filteredCards.map(card => {
                  const unlocked = player.unlockedCards.includes(card.id)
                  const slotted = player.deckSlots.includes(card.id)
                  return (
                    <div key={card.id} draggable={unlocked} onDragStart={unlocked ? e => { e.dataTransfer.setData('text/plain', card.id) } : undefined}
                      className={clsx('glass rounded-lg p-3 transition-all', unlocked ? 'cursor-grab active:cursor-grabbing hover:border-gold-400/40' : 'opacity-50', slotted && 'border-crimson-500/40')}
                      title={card.description}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: unlocked ? `${VIRTUE_COLORS[card.virtue]}20` : 'transparent', border: unlocked ? `2px solid ${VIRTUE_COLORS[card.virtue]}50` : '2px solid #333', color: unlocked ? VIRTUE_COLORS[card.virtue] : '#555' }}>
                          {card.tier === 1 ? '●' : '⬡'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{card.name}</p>
                          <p className="text-[9px] text-surface-50/40 capitalize">{card.virtue} {card.cardType}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 mt-1 flex-wrap text-[9px]">
                        {card.cardType === 'support' && <span className="text-green-400/80">+{card.powerGrant}</span>}
                        {card.powerCost > 0 && <span className="text-yellow-400/80">-{card.powerCost}</span>}
                        {card.sustainCost > 0 && <span className="text-red-400/80">{card.sustainCost} MP/tick</span>}
                      </div>
                      <div className="mt-1">
                        {!unlocked ? (
                          <button onClick={() => unlockCard(card.id)} className="text-[10px] text-gold-400 hover:underline" disabled={player.skillPoints < 1 || card.prerequisites.some(p => !player.unlockedCards.includes(p))}>
                            Unlock ({card.unlockCost}pt)
                          </button>
                        ) : slotted ? (
                          <span className="text-[9px] text-crimson-400">Slotted</span>
                        ) : (
                          <span className="text-[9px] text-surface-50/30">Unlocked &middot; drag to slot</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
            <p className="text-[10px] text-surface-50/20 text-center">Unlock cards with skill points, then drag them into your deck slots above. Support cards add power — power cards consume it.</p>
          </div>
        )}

      </div>
    </div>
  )
}
