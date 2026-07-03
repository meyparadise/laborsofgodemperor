import { useState, useMemo } from 'react'
import { Users, ScrollText, Wrench, Swords, UserCog, Store, BarChart3, Settings, Search, Plus, Trash2, ArrowLeft } from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import { FACTION_INFO, PRICE_HISTORY, EXCHANGE_TRADES } from '@/data/mock'
import { Button, RarityBadge } from '@/components/ui/ui'
import { clsx } from 'clsx'
import type { AdminTab, Faction, VirtueName, SlotType, Rarity, Player } from '@/types'

const TABS: { id: AdminTab; label: string; icon: typeof Users }[] = [
  { id: 'heroes', label: 'Heroes', icon: Users },
  { id: 'quests', label: 'Quests', icon: ScrollText },
  { id: 'items', label: 'Items', icon: Wrench },
  { id: 'cards', label: 'Cards', icon: Swords },
  { id: 'players', label: 'Players', icon: UserCog },
  { id: 'store', label: 'Store', icon: Store },
  { id: 'economy', label: 'Economy', icon: BarChart3 },
  { id: 'system', label: 'System', icon: Settings },
]

const FACTIONS: Faction[] = ['architects', 'wardens', 'legion', 'operatives', 'tribunal', 'monastics']
const VIRTUES: VirtueName[] = ['wisdom', 'courage', 'prudence', 'skill', 'temperance', 'justice']
const SLOTS: SlotType[] = ['vision', 'algorithm', 'network', 'conduit', 'capital', 'data', 'narrative', 'resonance', 'cascade', 'anomaly']
const RARITIES: Rarity[] = ['common', 'uncommon', 'rare', 'mythic']

export function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('heroes')
  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-crimson-300" style={{ fontFamily: 'Cinzel, serif' }}>Admin Panel</h2>
      <div className="flex gap-1 flex-wrap border-b border-surface-300/10 pb-2">
        {TABS.map(t => { const Icon = t.icon; return <button key={t.id} onClick={() => setTab(t.id)} className={clsx('px-3 py-1.5 rounded-t-lg text-xs font-medium transition-all flex items-center gap-1.5', tab === t.id ? 'bg-crimson-900/20 border-b-2 border-crimson-500 text-crimson-300' : 'text-surface-50/50 hover:text-surface-50/80')}><Icon size={13} />{t.label}</button> })}
      </div>
      {tab === 'heroes' && <HeroesTab />}
      {tab === 'quests' && <QuestsTab />}
      {tab === 'items' && <ItemsTab />}
      {tab === 'cards' && <CardsTab />}
      {tab === 'players' && <PlayersTab />}
      {tab === 'store' && <StoreTab />}
      {tab === 'economy' && <EconomyTab />}
      {tab === 'system' && <SystemTab />}
    </div>
  )
}

// ═══ Shared UI ═══

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative flex-1">
      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-50/30" />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="bg-surface-700 border border-surface-500/30 rounded-lg pl-8 pr-3 py-1.5 text-xs w-full text-surface-50" />
    </div>
  )
}

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <div className={clsx(textarea && 'col-span-2')}>
      <label className="text-[10px] text-surface-50/40 block mb-0.5">{label}</label>
      {textarea
        ? <textarea value={value} onChange={e => onChange(e.target.value)} className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1.5 text-xs w-full text-surface-50 h-20" />
        : <input value={value} onChange={e => onChange(e.target.value)} className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1.5 text-xs w-full text-surface-50" />
      }
    </div>
  )
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] text-surface-50/40 block mb-0.5">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1.5 text-xs w-full text-surface-50">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

// ═══ Heroes Tab ═══

function HeroesTab() {
  const heroes = useGameStore(s => s.heroes)
  const updateHero = useGameStore(s => s.updateHero)
  const addHero = useGameStore(s => s.addHero)
  const deleteHero = useGameStore(s => s.deleteHero)
  const deleteHeroPost = useGameStore(s => s.deleteHeroPost)
  const heroPosts = useGameStore(s => s.heroPosts)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [viewPosts, setViewPosts] = useState<string | null>(null)

  const filtered = useMemo(() => heroes.filter(h => !search || h.name.toLowerCase().includes(search.toLowerCase()) || h.handle.toLowerCase().includes(search.toLowerCase())), [heroes, search])
  const selected = heroes.find(h => h.id === selectedId)
  const postsFor = viewPosts ? (heroPosts[viewPosts] ?? []) : []

  const useUpdate = (field: string) => (v: string) => { if (selected) (updateHero as any)(selected.id, { [field]: v }) }
  const useUpdateNum = (field: string) => (v: string) => { if (selected) (updateHero as any)(selected.id, { [field]: parseInt(v) || 0 }) }

  const createNew = () => {
    const id = 'hero-new-' + Date.now()
    addHero({ id, name: 'New Hero', handle: '@new', title: '', alignment: 'TN', bio: '', faction: 'architects', slotType: 'vision', primaryVirtue: 'wisdom', secondaryVirtue: 'courage', virtues: { wisdom: 5, courage: 5, prudence: 5, skill: 5, temperance: 5, justice: 5 }, equippedItems: [], avatarUrl: '' } as any)
    setSelectedId(id)
  }

  return (
    <div className="space-y-3">
      {selected ? (
        <div className="space-y-4">
          <button onClick={() => setSelectedId(null)} className="flex items-center gap-1 text-xs text-surface-50/50 hover:text-crimson-300"><ArrowLeft size={14} />Back to list</button>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name" value={selected.name} onChange={useUpdate('name')} />
            <Field label="Handle" value={selected.handle} onChange={useUpdate('handle')} />
            <Field label="Title" value={selected.title} onChange={useUpdate('title')} />
            <SelectField label="Alignment" value={selected.alignment} options={['LG','NG','CG','LN','TN','CN','LE','NE','CE']} onChange={useUpdate('alignment')} />
            <SelectField label="Faction" value={selected.faction} options={FACTIONS} onChange={useUpdate('faction')} />
            <SelectField label="Slot Type" value={selected.slotType} options={SLOTS as any} onChange={useUpdate('slotType')} />
            <SelectField label="Primary Virtue" value={selected.primaryVirtue} options={VIRTUES as any} onChange={useUpdate('primaryVirtue')} />
            <SelectField label="Secondary Virtue" value={selected.secondaryVirtue} options={VIRTUES as any} onChange={useUpdate('secondaryVirtue')} />
          </div>
          <Field label="Bio" value={selected.bio} onChange={useUpdate('bio')} textarea />
          <div>
            <label className="text-[10px] text-surface-50/40 block mb-1">Virtues</label>
            <div className="grid grid-cols-3 gap-2">
              {VIRTUES.map(v => (
                <div key={v} className="flex items-center gap-2 text-xs">
                  <span className="w-20 text-surface-50/40">{v}</span>
                  <input type="range" min={1} max={20} value={selected.virtues[v]} onChange={e => updateHero(selected.id, { virtues: { ...selected.virtues, [v]: parseInt(e.target.value) } })} className="flex-1 h-1" />
                  <span className="font-mono w-5">{selected.virtues[v]}</span>
                </div>
              ))}
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={() => { deleteHero(selected.id); setSelectedId(null) }}>Delete Hero</Button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <SearchInput value={search} onChange={setSearch} placeholder="Search heroes..." />
            <Button size="sm" onClick={createNew}><Plus size={14} className="mr-1" />Create</Button>
          </div>
          {viewPosts && (
            <div className="rounded-xl border border-surface-300/20 bg-surface-800/40 p-3 space-y-1 max-h-60 overflow-y-auto">
              <div className="flex items-center justify-between text-xs"><span className="text-surface-50/40">{postsFor.length} posts</span><button onClick={() => setViewPosts(null)} className="text-surface-50/30 hover:text-crimson-400">Close</button></div>
              {postsFor.slice(0, 20).map(p => (
                <div key={p.id} className="flex items-start gap-2 text-xs border-t border-surface-300/10 pt-1">
                  <span className="w-16 text-surface-50/30 shrink-0">{p.authorName}</span>
                  <span className="flex-1 text-surface-50/70">{p.text}</span>
                  <button onClick={() => deleteHeroPost(viewPosts!, p.id)} className="text-red-400/50 hover:text-red-400"><Trash2 size={11} /></button>
                </div>
              ))}
            </div>
          )}
          <div className="text-xs text-surface-50/30">{filtered.length} heroes</div>
          <div className="space-y-1">
            {filtered.map(h => (
              <div key={h.id} className="rounded-lg border border-surface-300/20 bg-surface-800/40 px-3 py-2 flex items-center gap-3 hover:border-crimson-500/30 cursor-pointer">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: FACTION_INFO[h.faction]?.color + '20', color: FACTION_INFO[h.faction]?.color }}>{h.name[0]}</span>
                <div className="flex-1 min-w-0" onClick={() => setSelectedId(h.id)}>
                  <p className="text-sm font-medium">{h.name} <span className="text-surface-50/30 text-xs">{h.handle}</span></p>
                  <p className="text-[10px] text-surface-50/40">{h.title} · {h.faction} · {h.slotType}</p>
                </div>
                <button onClick={() => setViewPosts(h.id)} className="text-[10px] text-surface-50/30 hover:text-crimson-400">Posts</button>
                <button onClick={e => { e.stopPropagation(); deleteHero(h.id) }} className="text-red-400/50 hover:text-red-400"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ═══ Quests Tab ═══

function QuestsTab() {
  const quests = useGameStore(s => s.quests)
  const updateQuest = useGameStore(s => s.updateQuest)
  const addQuest = useGameStore(s => s.addQuest)
  const deleteQuest = useGameStore(s => s.deleteQuest)
  const resolveQuest = useGameStore(s => s.resolveQuest)
  const reopenQuest = useGameStore(s => s.reopenQuest)
  const resolveAllRandom = useGameStore(s => s.resolveAllRandom)
  const placePrediction = useGameStore(s => s.placePrediction)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showCheat, setShowCheat] = useState(false)
  const [betQuest, setBetQuest] = useState('')
  const [betOutcome, setBetOutcome] = useState<'YES' | 'NO'>('YES')
  const [betAmount, setBetAmount] = useState(100)

  const filtered = useMemo(() => quests.filter(q => !search || q.question.toLowerCase().includes(search.toLowerCase())), [quests, search])
  const selected = quests.find(q => q.id === selectedId)

  const useUpdate = (field: string) => (v: string) => { if (selected) (updateQuest as any)(selected.id, { [field]: field === 'volume' || field === 'engagement' ? (parseInt(v) || 0) : v }) }

  return (
    <div className="space-y-3">
      {selected ? (
        <div className="space-y-4">
          <button onClick={() => setSelectedId(null)} className="flex items-center gap-1 text-xs text-surface-50/50 hover:text-crimson-300"><ArrowLeft size={14} />Back to list</button>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Question" value={selected.question} onChange={useUpdate('question')} />
            <SelectField label="Category" value={selected.category} options={['POLITICS','TECH','CRYPTO','SPORTS','CULTURE','WORLD','FINANCE','SCIENCE','AI','GAMING','ENTERTAINMENT']} onChange={useUpdate('category')} />
            <SelectField label="Status" value={selected.status} options={['OPEN','RESOLVED_YES','RESOLVED_NO']} onChange={useUpdate('status')} />
            <Field label="Volume" value={selected.volume.toString()} onChange={useUpdate('volume')} />
            <Field label="Engagement" value={selected.engagement.toString()} onChange={useUpdate('engagement')} />
            <Field label="Closes In" value={selected.closesIn} onChange={useUpdate('closesIn')} />
          </div>
          <Field label="Description" value={selected.description} onChange={useUpdate('description')} textarea />
          <Button variant="danger" size="sm" onClick={() => { deleteQuest(selected.id); setSelectedId(null) }}>Delete Quest</Button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <SearchInput value={search} onChange={setSearch} placeholder="Search quests..." />
            <Button size="sm" variant="ghost" onClick={() => setShowCheat(!showCheat)}>Cheat</Button>
            <Button size="sm" onClick={() => { const id = 'q-new-' + Date.now(); (addQuest as any)({ id, question: 'New Quest', description: '', category: 'TECH', status: 'OPEN', volume: 0, engagement: 0, closesIn: '', yesProbability: 50, noProbability: 50, heroes: [], rarityDensity: 0, lootTable: [], effects: [], priceHistory: [], fateVolume: 0, glyphVolume: 0, tierVotes: [], questPlayers: [], comments: [], activities: [] }); setSelectedId(id) }}><Plus size={14} className="mr-1" />Create</Button>
          </div>
          {showCheat && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 space-y-2 text-xs">
              <div className="flex gap-2 flex-wrap">
                <Button size="xs" onClick={() => resolveAllRandom()}>Resolve All Random</Button>
                <Button size="xs" variant="danger" onClick={() => { quests.filter(q => q.status !== 'OPEN').forEach(q => reopenQuest(q.id)) }}>Reopen All</Button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <select value={betQuest} onChange={e => setBetQuest(e.target.value)} className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1 text-surface-50 text-xs">
                  <option value="">Select quest</option>{quests.filter(q => q.status === 'OPEN').map(q => <option key={q.id} value={q.id}>{q.question.slice(0, 40)}</option>)}
                </select>
                <select value={betOutcome} onChange={e => setBetOutcome(e.target.value as 'YES' | 'NO')} className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1 text-surface-50 text-xs"><option value="YES">YES</option><option value="NO">NO</option></select>
                <input type="number" value={betAmount} onChange={e => setBetAmount(parseInt(e.target.value) || 0)} className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1 w-20 text-xs text-surface-50" />
                <Button size="xs" onClick={() => { if (betQuest) placePrediction(betQuest, betOutcome, betAmount, 50) }}>Bet</Button>
              </div>
            </div>
          )}
          <div className="text-xs text-surface-50/30">{filtered.length} quests</div>
          <div className="space-y-1 max-h-[60vh] overflow-y-auto">
            {filtered.map(q => (
              <div key={q.id} className="rounded-lg border border-surface-300/20 bg-surface-800/40 px-3 py-2 flex items-center gap-2 text-xs">
                <span className={clsx('w-2 h-2 rounded-full shrink-0', q.status === 'OPEN' ? 'bg-emerald-400' : q.status === 'RESOLVED_YES' ? 'bg-green-400' : 'bg-red-400')} />
                <button onClick={() => setSelectedId(q.id)} className="flex-1 text-left truncate text-surface-50 hover:text-crimson-300">{q.question}</button>
                <span className="text-surface-50/30 shrink-0">{q.category}</span>
                <button onClick={() => resolveQuest(q.id, 'YES')} className="text-emerald-400/50 hover:text-emerald-400 shrink-0">✓</button>
                <button onClick={() => resolveQuest(q.id, 'NO')} className="text-red-400/50 hover:text-red-400 shrink-0">✗</button>
                <button onClick={() => reopenQuest(q.id)} className="text-amber-400/50 hover:text-amber-400 shrink-0">↻</button>
                <button onClick={() => deleteQuest(q.id)} className="text-red-400/50 hover:text-red-400"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ═══ Items Tab ═══

function ItemsTab() {
  const items = useGameStore(s => s.items)
  const updateItem = useGameStore(s => s.updateItem)
  const addItem = useGameStore(s => s.addItem)
  const deleteItem = useGameStore(s => s.deleteItem)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => items.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase())), [items, search])
  const selected = items.find(i => i.id === selectedId)

  const useUpdate = (field: string) => (v: string) => { if (selected) (updateItem as any)(selected.id, { [field]: field === 'passiveCost' || field === 'requiredValue' ? (parseInt(v) || 0) : field === 'requiredVirtue' && !v ? undefined : v }) }
  const useUpdateNum = (field: string) => (v: string) => { if (selected) (updateItem as any)(selected.id, { statBonuses: { ...selected.statBonuses, [field]: parseInt(v) || 0 } }) }

  return (
    <div className="space-y-3">
      {selected ? (
        <div className="space-y-4">
          <button onClick={() => setSelectedId(null)} className="flex items-center gap-1 text-xs text-surface-50/50 hover:text-crimson-300"><ArrowLeft size={14} />Back to list</button>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name" value={selected.name} onChange={useUpdate('name')} />
            <Field label="Icon" value={selected.icon} onChange={useUpdate('icon')} />
            <SelectField label="Class" value={selected.itemClass} options={['equipment','weapon','active','consumable','support']} onChange={useUpdate('itemClass')} />
            <SelectField label="Slot" value={selected.slotType} options={SLOTS as any} onChange={useUpdate('slotType')} />
            <SelectField label="Rarity" value={selected.rarity} options={RARITIES as any} onChange={useUpdate('rarity')} />
            <Field label="Passive Cost %" value={selected.passiveCost.toString()} onChange={useUpdate('passiveCost')} />
            <SelectField label="Req Virtue" value={selected.requiredVirtue ?? ''} options={['', ...VIRTUES] as any} onChange={v => useUpdate('requiredVirtue')(v || '')} />
            <Field label="Req Value" value={(selected.requiredValue ?? '').toString()} onChange={useUpdate('requiredValue')} />
          </div>
          <Field label="Description" value={selected.description} onChange={useUpdate('description')} textarea />
          <Field label="Flavor Text" value={selected.flavorText} onChange={useUpdate('flavorText')} />
          <div>
            <label className="text-[10px] text-surface-50/40 block mb-1">Stat Bonuses</label>
            <div className="grid grid-cols-3 gap-2">
              {VIRTUES.map(v => (
                <div key={v} className="flex items-center gap-1 text-xs">
                  <span className="w-20 text-surface-50/40">{v}</span>
                  <input type="number" min={0} max={20} value={selected.statBonuses[v] ?? 0} onChange={e => useUpdateNum(v)(e.target.value)} className="bg-surface-700 border border-surface-500/30 rounded px-1.5 py-0.5 text-xs w-14 text-surface-50" />
                </div>
              ))}
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={() => { deleteItem(selected.id); setSelectedId(null) }}>Delete Item</Button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <SearchInput value={search} onChange={setSearch} placeholder="Search items..." />
            <Button size="sm" onClick={() => { const id = 'item-new-' + Date.now(); (addItem as any)({ id, name: 'New Item', description: '', icon: 'Package', flavorText: '', itemClass: 'equipment', slotType: 'vision', rarity: 'common', statBonuses: {}, passiveCost: 0, source: 'admin' }); setSelectedId(id) }}><Plus size={14} className="mr-1" />Create</Button>
          </div>
          <div className="text-xs text-surface-50/30">{filtered.length} items</div>
          <div className="space-y-1">
            {filtered.map(i => (
              <div key={i.id} className="rounded-lg border border-surface-300/20 bg-surface-800/40 px-3 py-2 flex items-center gap-3 cursor-pointer" onClick={() => setSelectedId(i.id)}>
                <RarityBadge rarity={i.rarity} />
                <div className="flex-1"><p className="text-sm font-medium">{i.name}</p><p className="text-[10px] text-surface-50/40">{i.itemClass} · {i.slotType}</p></div>
                <button onClick={e => { e.stopPropagation(); deleteItem(i.id) }} className="text-red-400/50 hover:text-red-400"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ═══ Cards Tab ═══

function CardsTab() {
  const cards = useGameStore(s => s.cards)
  const updateCard = useGameStore(s => s.updateCard)
  const addCard = useGameStore(s => s.addCard)
  const deleteCard = useGameStore(s => s.deleteCard)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [virtueFilter, setVirtueFilter] = useState<string>('ALL')

  const filtered = useMemo(() => cards.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    if (virtueFilter !== 'ALL' && c.virtue !== virtueFilter) return false
    return true
  }), [cards, search, virtueFilter])
  const selected = cards.find(c => c.id === selectedId)

  const useUpdate = (field: string) => (v: string) => { if (selected) (updateCard as any)(selected.id, { [field]: ['powerCost','powerGrant','sustainCost','unlockCost','tier'].includes(field) ? (parseInt(v) || 0) : v }) }

  return (
    <div className="space-y-3">
      {selected ? (
        <div className="space-y-4">
          <button onClick={() => setSelectedId(null)} className="flex items-center gap-1 text-xs text-surface-50/50 hover:text-crimson-300"><ArrowLeft size={14} />Back to list</button>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name" value={selected.name} onChange={useUpdate('name')} />
            <SelectField label="Virtue" value={selected.virtue} options={VIRTUES as any} onChange={useUpdate('virtue')} />
            <SelectField label="Tier" value={selected.tier.toString()} options={['1','2','3']} onChange={useUpdate('tier')} />
            <SelectField label="Type" value={selected.cardType} options={['power','support','sustained']} onChange={useUpdate('cardType')} />
            <Field label="Power Cost" value={selected.powerCost.toString()} onChange={useUpdate('powerCost')} />
            <Field label="Power Grant" value={selected.powerGrant.toString()} onChange={useUpdate('powerGrant')} />
            <Field label="Sustain Cost" value={selected.sustainCost.toString()} onChange={useUpdate('sustainCost')} />
            <Field label="Unlock Cost" value={selected.unlockCost.toString()} onChange={useUpdate('unlockCost')} />
          </div>
          <Field label="Description" value={selected.description} onChange={useUpdate('description')} textarea />
          <Button variant="danger" size="sm" onClick={() => { deleteCard(selected.id); setSelectedId(null) }}>Delete Card</Button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <SearchInput value={search} onChange={setSearch} placeholder="Search cards..." />
            <select value={virtueFilter} onChange={e => setVirtueFilter(e.target.value)} className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1.5 text-xs text-surface-50">
              <option value="ALL">All Virtues</option>{VIRTUES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <Button size="sm" onClick={() => { const id = 'card-new-' + Date.now(); (addCard as any)({ id, name: 'New Card', description: '', virtue: 'wisdom', tier: 1, cardType: 'power', powerCost: 0, powerGrant: 0, sustainCost: 0, unlockCost: 1, prerequisites: [] }); setSelectedId(id) }}><Plus size={14} className="mr-1" />Create</Button>
          </div>
          <div className="text-xs text-surface-50/30">{filtered.length} cards</div>
          <div className="space-y-1">
            {filtered.map(c => (
              <div key={c.id} className="rounded-lg border border-surface-300/20 bg-surface-800/40 px-3 py-2 flex items-center gap-3 cursor-pointer" onClick={() => setSelectedId(c.id)}>
                <span className="text-xs font-mono text-amber-400/70">T{c.tier}</span>
                <div className="flex-1"><p className="text-sm font-medium">{c.name}</p><p className="text-[10px] text-surface-50/40">{c.cardType} · {c.virtue} · cost:{c.powerCost}</p></div>
                <button onClick={e => { e.stopPropagation(); deleteCard(c.id) }} className="text-red-400/50 hover:text-red-400"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ═══ Players Tab ═══

function PlayersTab() {
  const players = useGameStore(s => s.players)
  const p = useGameStore(s => s.player)
  const updatePlayerById = useGameStore(s => s.updatePlayerById)
  const deletePlayer = useGameStore(s => s.deletePlayer)
  const banPlayer = useGameStore(s => s.banPlayer)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const allPlayers = useMemo(() => {
    const list = [...players]
    if (!list.find(pl => pl.id === p.id)) list.unshift(p)
    return list
  }, [players, p])

  const filtered = useMemo(() => allPlayers.filter(pl => !search || pl.username.toLowerCase().includes(search.toLowerCase())), [allPlayers, search])
  const selected = allPlayers.find(pl => pl.id === selectedId)
  const isCurrent = selectedId === p.id

  const useUpdate = (field: string) => (v: string) => { if (selected) (updatePlayerById as any)(selected.id, { [field]: ['level','glyph','fate','insightPoints','xp'].includes(field) ? (parseInt(v) || 0) : v }) }

  return (
    <div className="space-y-3">
      {selected ? (
        <div className="space-y-4">
          <button onClick={() => setSelectedId(null)} className="flex items-center gap-1 text-xs text-surface-50/50 hover:text-crimson-300"><ArrowLeft size={14} />Back to list</button>
          <div className="flex items-center gap-2">
            <span className={clsx('text-xs px-2 py-0.5 rounded', selected.status === 'banned' ? 'text-red-400 bg-red-400/10' : 'text-emerald-400 bg-emerald-400/10')}>{selected.status === 'banned' ? 'BANNED' : 'Active'}</span>
            {isCurrent && <span className="text-xs text-crimson-400 bg-crimson-400/10 px-2 py-0.5 rounded">Current</span>}
            {selected.status === 'banned'
              ? <Button size="xs" onClick={() => banPlayer(selected.id, false)}>Unban</Button>
              : <Button size="xs" variant="danger" onClick={() => banPlayer(selected.id, true)}>Ban</Button>
            }
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Username" value={selected.username} onChange={useUpdate('username')} />
            <SelectField label="Faction" value={selected.faction} options={FACTIONS as any} onChange={useUpdate('faction')} />
            <Field label="Level" value={selected.level.toString()} onChange={useUpdate('level')} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Glyph" value={(selected.glyph ?? 0).toString()} onChange={useUpdate('glyph')} />
            <Field label="Fate" value={(selected.fate ?? 0).toString()} onChange={useUpdate('fate')} />
            <Field label="Insight Points" value={selected.insightPoints.toString()} onChange={useUpdate('insightPoints')} />
          </div>
          <div>
            <label className="text-[10px] text-surface-50/40 block mb-1">Virtues</label>
            <div className="grid grid-cols-3 gap-2">
              {VIRTUES.map(v => (
                <div key={v} className="flex items-center gap-2 text-xs">
                  <span className="w-20 text-surface-50/40">{v}</span>
                  <input type="range" min={1} max={20} value={selected.virtues[v]} onChange={e => (updatePlayerById as any)(selected.id, { virtues: { ...selected.virtues, [v]: parseInt(e.target.value) } })} className="flex-1 h-1" />
                  <span className="font-mono w-5">{selected.virtues[v]}</span>
                </div>
              ))}
            </div>
          </div>
          {!isCurrent && <Button variant="danger" size="sm" onClick={() => { deletePlayer(selected.id); setSelectedId(null) }}>Delete Player</Button>}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <SearchInput value={search} onChange={setSearch} placeholder="Search players..." />
            <Button size="sm" onClick={() => { const id = 'player-new-' + Date.now(); (updatePlayerById as any)(id, { id, username: 'NewPlayer', faction: 'architects', level: 1, xp: 0, insightPoints: 100, glyph: 0, fate: 0, virtues: { wisdom: 5, courage: 5, prudence: 5, skill: 5, temperance: 5, justice: 5 }, status: 'active' }); setSelectedId(id) }}><Plus size={14} className="mr-1" />Create</Button>
          </div>
          <div className="text-xs text-surface-50/30">{filtered.length} players</div>
          <div className="space-y-1">
            {filtered.map(pl => (
              <div key={pl.id} className="rounded-lg border border-surface-300/20 bg-surface-800/40 px-3 py-2 flex items-center gap-3 cursor-pointer hover:border-crimson-500/30" onClick={() => setSelectedId(pl.id)}>
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: FACTION_INFO[pl.faction]?.color + '20', color: FACTION_INFO[pl.faction]?.color }}>{pl.username[0]}</span>
                <div className="flex-1"><p className="text-sm font-medium">{pl.username}</p><p className="text-[10px] text-surface-50/40">Lv.{pl.level} · {pl.faction} · {pl.glyph ?? 0}🪙 · {pl.fate ?? 0}💎</p></div>
                <span className={clsx('text-[10px] px-1.5 py-0.5 rounded', pl.status === 'banned' ? 'text-red-400 bg-red-400/10' : 'text-emerald-400 bg-emerald-400/10')}>{pl.status === 'banned' ? 'BANNED' : 'Active'}</span>
                {pl.id !== p.id && <button onClick={e => { e.stopPropagation(); deletePlayer(pl.id) }} className="text-red-400/50 hover:text-red-400"><Trash2 size={13} /></button>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ═══ Store Tab ═══

function StoreTab() {
  const storeItems = useGameStore(s => s.storeItems)
  const updateStoreItem = useGameStore(s => s.updateStoreItem)
  const addStoreItem = useGameStore(s => s.addStoreItem)
  const deleteStoreItem = useGameStore(s => s.deleteStoreItem)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'ALL' | 'currency' | 'glyph-cos' | 'fate-cos' | 'bundle'>('ALL')

  const filtered = useMemo(() => storeItems.filter(si => {
    if (search && !si.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filter === 'currency') return si.category === 'currency'
    if (filter === 'bundle') return si.pack === true
    if (filter === 'glyph-cos') return si.category === 'cosmetic' && si.priceGlyph > 0
    if (filter === 'fate-cos') return si.category === 'cosmetic' && si.priceFate > 0
    return true
  }), [storeItems, search, filter])
  const selected = storeItems.find(si => si.id === selectedId)

  const useUpdate = (field: string) => (v: string) => { if (selected) (updateStoreItem as any)(selected.id, { [field]: ['priceGlyph','priceFate','glyphAmount','fateAmount','bonusPercent','stock'].includes(field) ? (parseInt(v) || 0) : v }) }

  return (
    <div className="space-y-3">
      {selected ? (
        <div className="space-y-4">
          <button onClick={() => setSelectedId(null)} className="flex items-center gap-1 text-xs text-surface-50/50 hover:text-crimson-300"><ArrowLeft size={14} />Back to list</button>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name" value={selected.name} onChange={useUpdate('name')} />
            <SelectField label="Rarity" value={selected.rarity} options={RARITIES as any} onChange={useUpdate('rarity')} />
            <Field label="Price Glyph" value={selected.priceGlyph.toString()} onChange={useUpdate('priceGlyph')} />
            <Field label="Price Fate" value={selected.priceFate.toString()} onChange={useUpdate('priceFate')} />
            <Field label="Glyph Amount" value={(selected.glyphAmount ?? '').toString()} onChange={useUpdate('glyphAmount')} />
            <Field label="Fate Amount" value={(selected.fateAmount ?? '').toString()} onChange={useUpdate('fateAmount')} />
            <Field label="Bonus %" value={(selected.bonusPercent ?? '').toString()} onChange={useUpdate('bonusPercent')} />
            <Field label="Stock" value={selected.stock.toString()} onChange={useUpdate('stock')} />
          </div>
          <Field label="Description" value={selected.description} onChange={useUpdate('description')} />
          <Button variant="danger" size="sm" onClick={() => { deleteStoreItem(selected.id); setSelectedId(null) }}>Delete</Button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <SearchInput value={search} onChange={setSearch} placeholder="Search store items..." />
            <select value={filter} onChange={e => setFilter(e.target.value as typeof filter)} className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1.5 text-xs text-surface-50">
              <option value="ALL">All</option><option value="currency">Currency</option><option value="glyph-cos">Glyph Cos</option><option value="fate-cos">Fate Cos</option><option value="bundle">Bundles</option>
            </select>
            <Button size="sm" onClick={() => { const id = 'store-new-' + Date.now(); (addStoreItem as any)({ id, name: 'New Item', description: '', category: 'cosmetic', icon: 'Star', rarity: 'common', priceGlyph: 0, priceFate: 0, stock: 1 }); setSelectedId(id) }}><Plus size={14} className="mr-1" />Create</Button>
          </div>
          <div className="text-xs text-surface-50/30">{filtered.length} items</div>
          <div className="space-y-1">
            {filtered.map(si => (
              <div key={si.id} className="rounded-lg border border-surface-300/20 bg-surface-800/40 px-3 py-2 flex items-center gap-3 cursor-pointer" onClick={() => setSelectedId(si.id)}>
                {si.pack ? <span className="text-xs text-amber-400">PACK</span> : <RarityBadge rarity={si.rarity} />}
                <div className="flex-1"><p className="text-sm font-medium">{si.name}</p><p className="text-[10px] text-surface-50/40">{si.category}</p></div>
                <span className="text-xs font-mono text-gold-400">{si.priceGlyph > 0 ? `${si.priceGlyph}🪙` : ''}</span>
                <span className="text-xs font-mono text-crimson-400">{si.priceFate > 0 ? `${si.priceFate}💎` : ''}</span>
                <button onClick={e => { e.stopPropagation(); deleteStoreItem(si.id) }} className="text-red-400/50 hover:text-red-400"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ═══ Economy Tab ═══

function EconomyTab() {
  const marketListings = useGameStore(s => s.marketListings)
  const exchangeOrders = useGameStore(s => s.exchangeOrders)
  const deleteMarketListing = useGameStore(s => s.deleteMarketListing)
  const deleteExchangeOrder = useGameStore(s => s.deleteExchangeOrder)
  const [subtab, setSubtab] = useState<'market' | 'exchange'>('market')

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button onClick={() => setSubtab('market')} className={clsx('px-3 py-1.5 rounded text-xs font-medium', subtab === 'market' ? 'bg-crimson-900/40 text-crimson-300' : 'text-surface-50/50')}>Market ({marketListings.length})</button>
        <button onClick={() => setSubtab('exchange')} className={clsx('px-3 py-1.5 rounded text-xs font-medium', subtab === 'exchange' ? 'bg-crimson-900/40 text-crimson-300' : 'text-surface-50/50')}>Exchange ({exchangeOrders.length})</button>
      </div>
      <div className="text-xs text-surface-50/40 mb-2">Base Rate: 1.05 | Price Points: {PRICE_HISTORY.length} | Trades: {EXCHANGE_TRADES.length}</div>
      {subtab === 'market' && (
        <div className="space-y-1 max-h-[60vh] overflow-y-auto">
          {marketListings.map(ml => (
            <div key={ml.id} className="rounded-lg border border-surface-300/20 bg-surface-800/40 px-3 py-2 flex items-center gap-2 text-xs">
              <span className={clsx('font-bold w-8', ml.listingType === 'WTS' ? 'text-emerald-400' : 'text-amber-400')}>{ml.listingType}</span>
              <span className="flex-1 truncate">{ml.itemName}</span>
              <RarityBadge rarity={ml.itemRarity} />
              <span className={clsx('font-mono', ml.currency === 'fate' ? 'text-crimson-400' : 'text-gold-400')}>{ml.price}</span>
              <span style={{ color: FACTION_INFO[ml.sellerFaction]?.color }} className="w-16 truncate text-right">{ml.sellerName}</span>
              <button onClick={() => deleteMarketListing(ml.id)} className="text-red-400/50 hover:text-red-400"><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
      )}
      {subtab === 'exchange' && (
        <div className="space-y-1 max-h-[60vh] overflow-y-auto">
          {exchangeOrders.map(o => (
            <div key={o.id} className="rounded-lg border border-surface-300/20 bg-surface-800/40 px-3 py-2 flex items-center gap-2 text-xs">
              <span className={clsx('font-bold w-20', o.side === 'BUY_GLYPH' ? 'text-emerald-400' : 'text-red-400')}>{o.side}</span>
              <span className="flex-1">{o.amount} Glyph @ {o.rate}</span>
              <span className="text-surface-50/40">{o.total.toFixed(2)}</span>
              <span className={clsx('text-[10px] px-1 rounded', o.status === 'FILLED' ? 'text-emerald-400' : 'text-surface-50/50')}>{o.status}</span>
              <button onClick={() => deleteExchangeOrder(o.id)} className="text-red-400/50 hover:text-red-400"><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══ System Tab ═══

function SystemTab() {
  const reseedAllData = useGameStore(s => s.reseedAllData)
  const resetPlayer = useGameStore(s => s.resetPlayer)
  const clearPredictions = useGameStore(s => s.clearPredictions)
  const resetCards = useGameStore(s => s.resetCards)
  const exportState = useGameStore(s => s.exportState)
  const importState = useGameStore(s => s.importState)
  const [importText, setImportText] = useState('')
  const [confirmed, setConfirmed] = useState('')

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-surface-300/20 bg-surface-800/40 p-3">
        <h3 className="text-xs font-bold text-surface-50/60 mb-3 uppercase tracking-wider">Reset Actions</h3>
        <div className="flex flex-wrap gap-2"><Button size="sm" onClick={() => reseedAllData()}>Re-seed Mock Data</Button><Button size="sm" onClick={() => resetPlayer()}>Reset Player</Button><Button size="sm" onClick={() => clearPredictions()}>Clear Predictions</Button><Button size="sm" onClick={() => resetCards()}>Clear Cards</Button></div>
      </div>
      <div className="rounded-xl border border-surface-300/20 bg-surface-800/40 p-3">
        <h3 className="text-xs font-bold text-surface-50/60 mb-3 uppercase tracking-wider">Import / Export</h3>
        <Button size="sm" onClick={() => { navigator.clipboard.writeText(JSON.stringify(exportState(), null, 2)) }}>Export to Clipboard</Button>
        <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder="Paste JSON state here..." className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1.5 text-xs w-full text-surface-50 h-24 font-mono mt-3" />
        <Button size="sm" className="mt-2" onClick={() => { try { importState(JSON.parse(importText)); setImportText('') } catch { alert('Invalid JSON') } }}>Import</Button>
      </div>
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
        <h3 className="text-xs font-bold text-red-400 mb-3 uppercase tracking-wider">Danger Zone</h3>
        {confirmed === 'wipe' ? (
          <div className="flex items-center gap-2"><span className="text-xs text-red-400">Are you sure?</span><Button size="xs" variant="danger" onClick={() => { localStorage.clear(); window.location.reload() }}>Yes, Wipe Everything</Button><Button size="xs" onClick={() => setConfirmed('')}>Cancel</Button></div>
        ) : (
          <Button size="sm" variant="danger" onClick={() => setConfirmed('wipe')}>Wipe Everything (localStorage + reload)</Button>
        )}
      </div>
    </div>
  )
}
