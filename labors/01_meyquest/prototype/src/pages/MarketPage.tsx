import { useState, useMemo, useRef, useEffect } from 'react'
import { Tag, TrendingUp, TrendingDown, X, Plus, Search, BarChart3, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react'
import { createChart, AreaSeries } from 'lightweight-charts'
import { useGameStore } from '@/stores/gameStore'
import { MARKET_LISTINGS, FACTION_INFO, EXCHANGE_ORDERS, PRICE_HISTORY, EXCHANGE_TRADES, ALL_ITEMS, DECK_CARDS } from '@/data/mock'
import { RarityBadge, Button } from '@/components/ui/ui'
import { clsx } from 'clsx'
import type { MarketTab, MarketListingType, VirtueName } from '@/types'

const VIRTUE_ABBR: Record<VirtueName, string> = { wisdom: 'WIS', courage: 'COU', prudence: 'PRU', skill: 'SKL', temperance: 'TEM', justice: 'JUS' }

export function MarketPage() {
  const player = useGameStore(s => s.player)
  const createListing = useGameStore(s => s.createListing)
  const cancelListing = useGameStore(s => s.cancelListing)
  const buyListing = useGameStore(s => s.buyListing)
  const placeExchangeOrder = useGameStore(s => s.placeExchangeOrder)
  const cancelExchangeOrder = useGameStore(s => s.cancelExchangeOrder)
  const exchangeOrders = useGameStore(s => s.exchangeOrders)

  const [tab, setTab] = useState<MarketTab>('items')

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-crimson-300" style={{ fontFamily: 'Cinzel, serif' }}>Market</h2>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gold-400 font-mono">{player.glyph ?? 0} 🪙 Glyph</span>
          <span className="text-crimson-400 font-mono">{player.fate ?? 0} 💎 Fate</span>
        </div>
      </div>

      <div className="flex gap-2 border-b border-surface-300/10 pb-3">
        <button onClick={() => setTab('items')} className={clsx('px-4 py-2 rounded-t-lg text-sm font-medium transition-all flex items-center gap-1.5', tab === 'items' ? 'bg-crimson-900/20 border-b-2 border-crimson-500 text-crimson-300' : 'text-surface-50/50 hover:text-surface-50/80')}><Tag size={14} /> Items</button>
        <button onClick={() => setTab('exchange')} className={clsx('px-4 py-2 rounded-t-lg text-sm font-medium transition-all flex items-center gap-1.5', tab === 'exchange' ? 'bg-crimson-900/20 border-b-2 border-crimson-500 text-crimson-300' : 'text-surface-50/50 hover:text-surface-50/80')}><BarChart3 size={14} /> Exchange</button>
        <button onClick={() => setTab('my-listings')} className={clsx('px-4 py-2 rounded-t-lg text-sm font-medium transition-all flex items-center gap-1.5', tab === 'my-listings' ? 'bg-crimson-900/20 border-b-2 border-crimson-500 text-crimson-300' : 'text-surface-50/50 hover:text-surface-50/80')}><Layers size={14} /> My Listings</button>
      </div>

      {tab === 'items' && <ItemsTab />}
      {tab === 'exchange' && <ExchangeTab />}
      {tab === 'my-listings' && <MyListingsTab />}
    </div>
  )
}

function ItemsTab() {
  const player = useGameStore(s => s.player)
  const createListing = useGameStore(s => s.createListing)
  const cancelListing = useGameStore(s => s.cancelListing)
  const buyListing = useGameStore(s => s.buyListing)

  const [listingType, setListingType] = useState<MarketListingType | 'ALL'>('ALL')
  const [filterType, setFilterType] = useState('ALL')
  const [filterCurrency, setFilterCurrency] = useState('ALL')
  const [filterSlot, setFilterSlot] = useState('ALL')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [createId, setCreateId] = useState('')
  const [createIsItem, setCreateIsItem] = useState(true)
  const [createPrice, setCreatePrice] = useState(100)
  const [createCurrency, setCreateCurrency] = useState<'glyph' | 'fate'>('glyph')

  const allListings = useMemo(() => [...MARKET_LISTINGS, ...(player.marketListings ?? [])], [player.marketListings])

  const filteredListings = useMemo(() => {
    return allListings.filter(l => {
      if (listingType !== 'ALL' && l.listingType !== listingType) return false
      if (filterType !== 'ALL' && l.itemType !== filterType) return false
      if (filterCurrency !== 'ALL' && l.currency !== filterCurrency) return false
      if (filterSlot !== 'ALL' && l.slotType !== filterSlot) return false
      if (search && !l.itemName.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [allListings, listingType, filterType, filterCurrency, filterSlot, search])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setListingType('ALL')} className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-all border', listingType === 'ALL' ? 'bg-crimson-900/40 border-crimson-600/40 text-crimson-300' : 'border-surface-300/20 text-surface-50/50 hover:text-surface-50/80')}>All</button>
        <button onClick={() => setListingType('WTS')} className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-1', listingType === 'WTS' ? 'bg-crimson-900/40 border-crimson-600/40 text-crimson-300' : 'border-surface-300/20 text-surface-50/50 hover:text-surface-50/80')}><TrendingUp size={12} /> Want to Sell</button>
        <button onClick={() => setListingType('WTB')} className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-1', listingType === 'WTB' ? 'bg-crimson-900/40 border-crimson-600/40 text-crimson-300' : 'border-surface-300/20 text-surface-50/50 hover:text-surface-50/80')}><TrendingDown size={12} /> Want to Buy</button>
        <div className="flex-1" />
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-50/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." className="bg-surface-700 border border-surface-500/30 rounded-lg pl-8 pr-3 py-1.5 text-xs text-surface-50 w-44 focus:outline-none focus:border-crimson-500/40" />
        </div>
        <Button size="sm" variant="gold" onClick={() => setShowCreate(!showCreate)}><Plus size={14} className="mr-1" />Create Listing</Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap text-xs">
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1 text-surface-50">
          <option value="ALL">All Types</option><option value="item">Gear Items</option><option value="card">Cards</option>
        </select>
        <select value={filterCurrency} onChange={e => setFilterCurrency(e.target.value)} className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1 text-surface-50">
          <option value="ALL">All Currency</option><option value="glyph">🪙 Glyph</option><option value="fate">💎 Fate</option>
        </select>
        <select value={filterSlot} onChange={e => setFilterSlot(e.target.value)} className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1 text-surface-50">
          <option value="ALL">All Slots</option>
          {['vision','algorithm','network','conduit','capital','data','narrative','resonance','cascade','anomaly'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-surface-50/30 ml-auto">{filteredListings.length} listings</span>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-40 flex items-center justify-center" onClick={() => setShowCreate(false)}>
          <div className="fixed inset-0 bg-black/60" />
          <div className="relative glass rounded-2xl border border-crimson-600/40 p-6 max-w-sm w-full mx-4 z-50" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowCreate(false)} className="absolute top-3 right-3 text-surface-50/40 hover:text-crimson-400"><X size={18} /></button>
            <h3 className="text-lg font-bold mb-4">Create Listing</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-surface-50/40">Type</label>
                <select value={createIsItem ? 'item' : 'card'} onChange={e => setCreateIsItem(e.target.value === 'item')} className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1 text-sm w-full text-surface-50">
                  <option value="item">Gear Item</option><option value="card">Deck Card</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-surface-50/40">{createIsItem ? 'Item ID' : 'Card ID'}</label>
                <input value={createId} onChange={e => setCreateId(e.target.value)} className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1 text-sm w-full text-surface-50" placeholder={createIsItem ? 'item-scroll' : 'card-wis1'} />
              </div>
              <div>
                <label className="text-xs text-surface-50/40">Price</label>
                <input type="number" value={createPrice} onChange={e => setCreatePrice(Number(e.target.value))} className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1 text-sm w-32 text-surface-50" />
              </div>
              <div>
                <label className="text-xs text-surface-50/40">Currency</label>
                <select value={createCurrency} onChange={e => setCreateCurrency(e.target.value as 'glyph' | 'fate')} className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1 text-sm w-full text-surface-50">
                  <option value="glyph">🪙 Glyph</option><option value="fate">💎 Fate</option>
                </select>
              </div>
              <Button variant="gold" size="md" className="w-full" onClick={() => { createListing(createId, createIsItem, createPrice, createCurrency); setShowCreate(false) }}>List for Sale</Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredListings.map(listing => {
          const factionInfo = FACTION_INFO[listing.sellerFaction]
          const isOwn = listing.sellerId === player.id
          return (
            <div key={listing.id} className={clsx('rounded-xl border border-surface-300/20 bg-surface-800/40 p-3', isOwn && 'border-crimson-500/40')}>
              <div className="flex items-start gap-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-crimson-900/30">
                  <Tag size={16} className={listing.listingType === 'WTS' ? 'text-emerald-400' : 'text-amber-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold truncate">{listing.itemName}</p>
                    <RarityBadge rarity={listing.itemRarity} />
                    <span className="text-[10px] text-surface-50/30">{listing.listingType}</span>
                  </div>
                  <p className="text-[10px] text-surface-50/40 mt-0.5">{listing.itemType}{listing.slotType ? ` · ${listing.slotType}` : ''}{listing.virtue ? ` · ${listing.virtue}` : ''}</p>
                  {listing.itemType === 'item' && (() => {
                    const item = ALL_ITEMS.find(i => i.id === listing.itemId)
                    if (!item) return null
                    return (
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {Object.entries(item.statBonuses).map(([k, v]) => (
                          <span key={k} className="text-[10px] text-surface-50/60 font-mono">+{v} {VIRTUE_ABBR[k as VirtueName] ?? k}</span>
                        ))}
                        {item.uniqueEffect && <span className="text-[10px] text-amber-400/70 bg-amber-400/5 px-1 rounded">{item.uniqueEffect.name}</span>}
                      </div>
                    )
                  })()}
                  {listing.itemType === 'card' && (() => {
                    const card = DECK_CARDS.find(c => c.id === listing.itemId)
                    if (!card) return null
                    return (
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[10px] text-surface-50/60">{card.cardType}</span>
                        <span className="text-[10px] text-amber-400/70">T{card.tier}</span>
                        {card.powerCost > 0 && <span className="text-[10px] text-crimson-400/60 font-mono">Cost:{card.powerCost}</span>}
                        {card.powerGrant > 0 && <span className="text-[10px] text-emerald-400/60 font-mono">+{card.powerGrant}MP</span>}
                      </div>
                    )
                  })()}
                  <div className="flex items-center gap-2 mt-1">
                    <span className={clsx('text-xs font-mono font-bold', listing.currency === 'fate' ? 'text-crimson-400' : 'text-gold-400')}>{listing.price} {listing.currency === 'fate' ? '💎' : '🪙'}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-surface-50/30">
                    <span style={{ color: factionInfo?.color }}>{listing.sellerName}</span>
                    <span>{new Date(listing.listedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {isOwn ? (
                      <Button size="xs" variant="danger" onClick={() => cancelListing(listing.id)}>Cancel</Button>
                    ) : (
                      <Button size="xs" variant="gold" onClick={() => buyListing(listing.id)} disabled={(listing.currency === 'glyph' && (player.glyph ?? 0) < listing.price) || (listing.currency === 'fate' && (player.fate ?? 0) < listing.price)}>
                        {listing.listingType === 'WTS' ? 'Buy Now' : 'Sell Now'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {filteredListings.length === 0 && <div className="col-span-3 text-center py-8"><p className="text-surface-50/40">No listings found.</p></div>}
      </div>
    </div>
  )
}

function ExchangeTab() {
  const player = useGameStore(s => s.player)
  const exchangeOrders = useGameStore(s => s.exchangeOrders)
  const placeExchangeOrder = useGameStore(s => s.placeExchangeOrder)
  const cancelExchangeOrder = useGameStore(s => s.cancelExchangeOrder)
  const chartRef = useRef<HTMLDivElement>(null)

  const [side, setSide] = useState<'BUY_GLYPH' | 'SELL_GLYPH'>('BUY_GLYPH')
  const [rate, setRate] = useState('1.05')
  const [amount, setAmount] = useState('100')

  const baseRate = 1.05
  const bids = EXCHANGE_ORDERS.filter(o => o.side === 'BUY_GLYPH').sort((a, b) => b.rate - a.rate)
  const asks = EXCHANGE_ORDERS.filter(o => o.side === 'SELL_GLYPH').sort((a, b) => a.rate - b.rate)
  const maxAsk = asks.length > 0 ? Math.max(...asks.map(o => o.rate)) : baseRate
  const myOrders = exchangeOrders.filter(o => o.status === 'OPEN' || o.status === 'FILLED')
  const totalGlyph = (player.glyph ?? 0) + myOrders.filter(o => o.side === 'SELL_GLYPH').reduce((s, o) => s + o.amount, 0)
  const totalFate = (player.fate ?? 0) + myOrders.filter(o => o.side === 'BUY_GLYPH').reduce((s, o) => s + o.total, 0)

  useEffect(() => {
    if (!chartRef.current) return
    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 200,
      layout: { background: { color: '#0f1117' }, textColor: '#94a3b8' },
      grid: { vertLines: { color: '#1e293b' }, horzLines: { color: '#1e293b' } },
      timeScale: { timeVisible: true },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: '#334155' },
    })
    const series = chart.addSeries(AreaSeries, {
      lineColor: '#10b981',
      topColor: 'rgba(16,185,129,0.4)',
      bottomColor: 'rgba(16,185,129,0.02)',
      lineWidth: 2,
    })
    series.setData(PRICE_HISTORY)
    chart.timeScale().fitContent()

    const handleResize = () => {
      if (chartRef.current) chart.applyOptions({ width: chartRef.current.clientWidth })
    }
    window.addEventListener('resize', handleResize)
    return () => { chart.remove(); window.removeEventListener('resize', handleResize) }
  }, [])

  const handlePlace = () => {
    const r = parseFloat(rate)
    const a = parseInt(amount)
    if (isNaN(r) || isNaN(a) || r <= 0 || a <= 0) return
    if (side === 'BUY_GLYPH' && (player.fate ?? 0) < a * r) return
    if (side === 'SELL_GLYPH' && (player.glyph ?? 0) < a) return
    placeExchangeOrder(side, r, a)
  }

  const totalFateCost = parseFloat(rate) * parseInt(amount) || 0

  return (
    <div className="space-y-6">
      {/* Rate summary */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg border border-surface-300/20 bg-surface-800/40 p-3">
          <p className="text-xs text-surface-50/40">Rate</p>
          <p className="text-lg font-mono text-emerald-400">{baseRate} Fate/Glyph</p>
        </div>
        <div className="rounded-lg border border-surface-300/20 bg-surface-800/40 p-3">
          <p className="text-xs text-surface-50/40">24h Change</p>
          <p className="text-lg font-mono text-emerald-400">+2.4%</p>
        </div>
        <div className="rounded-lg border border-surface-300/20 bg-surface-800/40 p-3">
          <p className="text-xs text-surface-50/40">24h Volume</p>
          <p className="text-lg font-mono text-surface-50">{(EXCHANGE_TRADES.reduce((s, t) => s + t.amount, 0)).toLocaleString()} Glyph</p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-surface-300/20 bg-surface-800/40 overflow-hidden">
        <div ref={chartRef} />
      </div>

      {/* Order Book + Trade Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Order Book */}
        <div className="rounded-xl border border-surface-300/20 bg-surface-800/40 p-3">
          <h3 className="text-xs font-bold text-surface-50/60 mb-2 uppercase tracking-wider">Order Book</h3>
          <div className="space-y-0.5">
            <div className="flex text-[10px] text-surface-50/30 px-1 py-1 border-b border-surface-300/10 mb-1">
              <span className="w-16">Rate</span><span className="flex-1 text-right">Amount</span><span className="w-20 text-right">Total</span>
            </div>
            {asks.slice(0, 5).map(o => (
              <div key={o.id} className="flex text-xs px-1 py-0.5 rounded-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-red-500/5 left-[30%]" />
                <span className="w-16 text-red-400 font-mono">{o.rate.toFixed(4)}</span>
                <span className="flex-1 text-right text-surface-50/70">{o.amount}</span>
                <span className="w-20 text-right text-surface-50/40 font-mono">{o.total.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-1 py-1 border-y border-surface-300/10">
              <span className="text-xs font-bold text-emerald-400 font-mono">{baseRate}</span>
              <span className="text-[10px] text-surface-50/30">Spread: {((maxAsk - bids[0]?.rate) || 0.01).toFixed(4)}</span>
            </div>
            {bids.slice(0, 5).map(o => (
              <div key={o.id} className="flex text-xs px-1 py-0.5 rounded-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/5 left-[30%]" />
                <span className="w-16 text-emerald-400 font-mono">{o.rate.toFixed(4)}</span>
                <span className="flex-1 text-right text-surface-50/70">{o.amount}</span>
                <span className="w-20 text-right text-surface-50/40 font-mono">{o.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trade Form */}
        <div className="rounded-xl border border-surface-300/20 bg-surface-800/40 p-3">
          <h3 className="text-xs font-bold text-surface-50/60 mb-3 uppercase tracking-wider">Trade Glyph</h3>
          <div className="flex gap-1 mb-3">
            <button onClick={() => setSide('BUY_GLYPH')} className={clsx('flex-1 py-1.5 rounded text-xs font-medium transition-all', side === 'BUY_GLYPH' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-surface-700/50 text-surface-50/40 border border-surface-300/10')}>Buy GLYPH</button>
            <button onClick={() => setSide('SELL_GLYPH')} className={clsx('flex-1 py-1.5 rounded text-xs font-medium transition-all', side === 'SELL_GLYPH' ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'bg-surface-700/50 text-surface-50/40 border border-surface-300/10')}>Sell GLYPH</button>
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-[10px] text-surface-50/40">Rate (Fate per 1 Glyph)</label>
              <input value={rate} onChange={e => setRate(e.target.value)} className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1.5 text-sm w-full text-surface-50 font-mono" />
            </div>
            <div>
              <label className="text-[10px] text-surface-50/40">Amount (Glyph)</label>
              <input value={amount} onChange={e => setAmount(e.target.value)} className="bg-surface-700 border border-surface-500/30 rounded px-2 py-1.5 text-sm w-full text-surface-50 font-mono" />
            </div>
            <div className="flex justify-between text-xs text-surface-50/50 py-1">
              <span>Total</span>
              <span className={clsx('font-mono', side === 'BUY_GLYPH' ? 'text-crimson-400' : 'text-gold-400')}>
                {totalFateCost.toFixed(2)} {side === 'BUY_GLYPH' ? '💎 Fate' : '🪙 Glyph'}
              </span>
            </div>
            <Button variant={side === 'BUY_GLYPH' ? 'gold' : 'gold'} size="md" className="w-full" onClick={handlePlace}>
              {side === 'BUY_GLYPH' ? `Buy ${amount || '0'} Glyph` : `Sell ${amount || '0'} Glyph`}
            </Button>
          </div>
          <div className="mt-3 pt-3 border-t border-surface-300/10 text-[10px] text-surface-50/40 space-y-0.5">
            <p>Balance: {(player.glyph ?? 0).toLocaleString()} 🪙 | {(player.fate ?? 0).toLocaleString()} 💎</p>
          </div>
        </div>

        {/* Recent Trades */}
        <div className="rounded-xl border border-surface-300/20 bg-surface-800/40 p-3">
          <h3 className="text-xs font-bold text-surface-50/60 mb-2 uppercase tracking-wider">Recent Trades</h3>
          <div className="space-y-1">
            {EXCHANGE_TRADES.slice(0, 12).map(trade => (
              <div key={trade.id} className="flex items-center text-xs py-0.5">
                <span className={clsx('w-4', trade.side === 'BUY' ? 'text-emerald-400' : 'text-red-400')}>
                  {trade.side === 'BUY' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                </span>
                <span className="font-mono flex-1">{trade.rate}</span>
                <span className="text-surface-50/40 mx-2">{trade.amount}</span>
                <span className="text-surface-50/30 text-[10px]">{new Date(trade.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Your Exchange Orders */}
      {myOrders.length > 0 && (
        <div className="rounded-xl border border-surface-300/20 bg-surface-800/40 p-3">
          <h3 className="text-xs font-bold text-surface-50/60 mb-2 uppercase tracking-wider">Your Orders</h3>
          <div className="space-y-1">
            {myOrders.slice(0, 6).map(o => (
              <div key={o.id} className="flex items-center text-xs py-1">
                <span className={clsx('w-20 font-mono', o.side === 'BUY_GLYPH' ? 'text-emerald-400' : 'text-red-400')}>{o.side === 'BUY_GLYPH' ? 'BUY GLYPH' : 'SELL GLYPH'}</span>
                <span className="font-mono flex-1">{o.amount} @ {o.rate}</span>
                <span className="text-surface-50/40 mx-2">{o.total.toFixed(2)} {o.side === 'BUY_GLYPH' ? '💎' : '🪙'}</span>
                <span className={clsx('text-[10px] px-1.5 py-0.5 rounded', o.status === 'FILLED' ? 'text-emerald-400 bg-emerald-400/10' : 'text-surface-50/40 bg-surface-700/50')}>{o.status}</span>
                {o.status === 'OPEN' && <Button size="xs" variant="danger" className="ml-2" onClick={() => cancelExchangeOrder(o.id)}>X</Button>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MyListingsTab() {
  const player = useGameStore(s => s.player)
  const exchangeOrders = useGameStore(s => s.exchangeOrders)
  const cancelListing = useGameStore(s => s.cancelListing)
  const cancelExchangeOrder = useGameStore(s => s.cancelExchangeOrder)

  const activeItems = (player.marketListings ?? []).filter(l => l.listingType === 'WTS' || l.listingType === 'WTB')
  const activeExchange = exchangeOrders.filter(o => o.status === 'OPEN')
  const filledExchange = exchangeOrders.filter(o => o.status === 'FILLED')

  if (activeItems.length === 0 && activeExchange.length === 0 && filledExchange.length === 0) {
    return <div className="text-center py-12 text-surface-50/40">No listings or orders yet. Create a listing or place an exchange order!</div>
  }

  return (
    <div className="space-y-6">
      {activeItems.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-surface-50/70 mb-3">Active Item Listings ({activeItems.length})</h3>
          <div className="space-y-2">
            {activeItems.map(listing => {
              const factionInfo = FACTION_INFO[listing.sellerFaction]
              return (
                <div key={listing.id} className="rounded-lg border border-surface-300/20 bg-surface-800/40 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-crimson-900/30 flex items-center justify-center"><Tag size={14} className="text-gold-400" /></div>
                    <div>
                      <p className="text-sm font-medium">{listing.itemName}</p>
                      <p className="text-[10px] text-surface-50/40">{listing.listingType} · {listing.itemType} · {listing.price} {listing.currency}</p>
                    </div>
                  </div>
                  <Button size="xs" variant="danger" onClick={() => cancelListing(listing.id)}>Cancel</Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeExchange.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-surface-50/70 mb-3">Active Exchange Orders ({activeExchange.length})</h3>
          <div className="space-y-2">
            {activeExchange.map(o => (
              <div key={o.id} className="rounded-lg border border-surface-300/20 bg-surface-800/40 p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={clsx('w-8 h-8 rounded flex items-center justify-center', o.side === 'BUY_GLYPH' ? 'bg-emerald-500/10' : 'bg-red-500/10')}>
                    {o.side === 'BUY_GLYPH' ? <ArrowUpRight size={14} className="text-emerald-400" /> : <ArrowDownRight size={14} className="text-red-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{o.side === 'BUY_GLYPH' ? 'Buy' : 'Sell'} {o.amount} Glyph @ {o.rate}</p>
                    <p className="text-[10px] text-surface-50/40">Total: {o.total.toFixed(2)} {o.side === 'BUY_GLYPH' ? 'Fate' : 'Glyph'} · {new Date(o.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <Button size="xs" variant="danger" onClick={() => cancelExchangeOrder(o.id)}>Cancel</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {filledExchange.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-surface-50/70 mb-3">Completed Exchange ({filledExchange.length})</h3>
          <div className="space-y-1">
            {filledExchange.map(o => (
              <div key={o.id} className="rounded-lg border border-surface-300/10 bg-surface-800/20 px-3 py-2 flex items-center justify-between opacity-60">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400"><TrendingUp size={12} /></span>
                  <span className="text-xs">{o.side === 'BUY_GLYPH' ? 'Bought' : 'Sold'} {o.amount} Glyph @ {o.rate}</span>
                </div>
                <span className="text-[10px] text-surface-50/30">{new Date(o.filledAt ?? o.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
