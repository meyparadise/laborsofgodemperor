import { useState } from 'react'
import { Gem, Star, Frame, Palette, Package, DollarSign, Gift, Grid3X3, Zap, Crown, Activity } from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import { STORE_ITEMS } from '@/data/mock'
import { RarityBadge, Button } from '@/components/ui/ui'
import { clsx } from 'clsx'
import type { StoreCategory, CosmeticType } from '@/types'

const COSMETIC_ICONS: Record<CosmeticType, typeof Star> = {
  title: Star, frame: Frame, nameColor: Palette,
  profileBackground: Grid3X3, predictionFlair: Zap,
  avatarDecoration: Crown, badgeEffect: Activity,
}

const COSMETIC_LABELS: Record<CosmeticType, string> = {
  title: 'Titles', frame: 'Frames', nameColor: 'Name Colors',
  profileBackground: 'Profile Backgrounds', predictionFlair: 'Prediction Flairs',
  avatarDecoration: 'Avatar Decorations', badgeEffect: 'Badge Effects',
}

const COSMETIC_PREFIX: Record<CosmeticType, string> = {
  title: 'Title', frame: 'Frame', nameColor: 'Name Color',
  profileBackground: 'Background', predictionFlair: 'Flair',
  avatarDecoration: 'Decoration', badgeEffect: 'Effect',
}

export function StorePage() {
  const player = useGameStore(s => s.player)
  const buyStoreItem = useGameStore(s => s.buyStoreItem)
  const [tab, setTab] = useState<StoreCategory>('currency')

  const currencyTiers = STORE_ITEMS.filter(i => i.category === 'currency' && !i.starterPack)
  const starterPack = STORE_ITEMS.find(i => i.starterPack)

  const glyphBundles = STORE_ITEMS.filter(i => i.pack && i.priceGlyph > 0)
  const fateBundles = STORE_ITEMS.filter(i => i.pack && i.priceFate > 0)

  const glyphSolo = STORE_ITEMS.filter(i => i.category === 'cosmetic' && !i.pack && i.priceGlyph > 0)
  const fateSolo = STORE_ITEMS.filter(i => i.category === 'cosmetic' && !i.pack && i.priceFate > 0)

  const groupedByType = (items: typeof STORE_ITEMS): Record<CosmeticType, typeof STORE_ITEMS> => {
    const groups: Record<string, typeof STORE_ITEMS> = {}
    for (const item of items) {
      const ct = item.cosmeticType ?? 'title'
      if (!groups[ct]) groups[ct] = []
      groups[ct].push(item)
    }
    return groups as Record<CosmeticType, typeof STORE_ITEMS>
  }

  const isOwned = (item: (typeof STORE_ITEMS)[number]): boolean => {
    if (item.pack && item.packContents) {
      for (const [type, value] of Object.entries(item.packContents)) {
        const ct = type as CosmeticType
        if (getPlayerCosmetic(ct) !== value) return false
      }
      return true
    }
    if (!item.cosmeticType) return false
    return getPlayerCosmetic(item.cosmeticType) === extractValue(item)
  }

  const getPlayerCosmetic = (ct: CosmeticType): string | undefined => {
    switch (ct) {
      case 'title': return player.title
      case 'frame': return player.frame
      case 'nameColor': return player.nameColor
      case 'profileBackground': return player.profileBackground
      case 'predictionFlair': return player.predictionFlair
      case 'avatarDecoration': return player.avatarDecoration
      case 'badgeEffect': return player.badgeEffect
    }
  }

  const extractValue = (item: (typeof STORE_ITEMS)[number]): string => {
    if (!item.cosmeticType) return ''
    const prefix = COSMETIC_PREFIX[item.cosmeticType]
    return item.name.replace(new RegExp(`^${prefix}:\\s*`), '').trim()
  }

  const handleBuy = (id: string) => { buyStoreItem(id) }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-crimson-300" style={{ fontFamily: 'Cinzel, serif' }}>Store</h2>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={() => setTab('currency')} className={clsx('px-4 py-2 rounded-lg text-sm font-medium transition-all border flex items-center gap-1.5', tab === 'currency' ? 'bg-crimson-900/40 border-crimson-600/40 text-crimson-300' : 'border-surface-300/20 text-surface-50/50 hover:text-surface-50/80')}><DollarSign size={14} /> Currency</button>
          <button onClick={() => setTab('cosmetic')} className={clsx('px-4 py-2 rounded-lg text-sm font-medium transition-all border flex items-center gap-1.5', tab === 'cosmetic' ? 'bg-crimson-900/40 border-crimson-600/40 text-crimson-300' : 'border-surface-300/20 text-surface-50/50 hover:text-surface-50/80')}><Star size={14} /> Cosmetics</button>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gold-400 font-mono">{player.glyph ?? 0} 🪙 Glyph</span>
          <span className="text-crimson-400 font-mono">{player.fate ?? 0} 💎 Fate</span>
        </div>
      </div>

      {tab === 'currency' && (
        <div className="space-y-6">
          {starterPack && !player.starterPackPurchased && (
            <div className="p-4 rounded-xl border-2 border-gold-400/40 bg-gold-400/5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gold-400/20">
                  <Gift size={24} className="text-gold-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gold-300">Starter Pack</h3>
                    <span className="text-xs text-gold-400/60 border border-gold-400/30 px-2 py-0.5 rounded">One-Time</span>
                  </div>
                  <p className="text-sm text-surface-50/70 mt-1">{starterPack.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-gold-400 text-lg font-mono">$5.00</span>
                    <Button variant="gold" onClick={() => handleBuy(starterPack.id)}>Claim</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-surface-50/40">Purchase Glyph — the free-to-play currency. Earn bonus Fate with every pack for sweepstakes entry.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {currencyTiers.map(item => {
              const dollarCost = (item.glyphAmount ?? 0) / 100
              return (
                <div key={item.id} className="rounded-xl border border-surface-300/20 bg-surface-800/40 p-4 text-center flex flex-col items-center gap-3 hover:border-crimson-600/30 transition-colors">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-crimson-900/30">
                    <Gem size={28} className="text-gold-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gold-300">{item.glyphAmount?.toLocaleString()}</p>
                    <p className="text-xs text-surface-50/50">Glyph</p>
                  </div>
                  {item.bonusPercent && (
                    <span className="text-xs text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded">+{item.bonusPercent}% bonus</span>
                  )}
                  <p className="text-xs text-surface-50/60">{item.description}</p>
                  <div className="flex items-center gap-1 text-surface-50/80 font-mono text-lg">
                    <DollarSign size={16} className="text-gold-400" />{dollarCost.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-crimson-400">
                    <Gem size={12} />+{item.fateAmount} Fate
                  </div>
                  <RarityBadge rarity={item.rarity} />
                  <Button variant="gold" size="md" onClick={() => handleBuy(item.id)} className="w-full">Purchase</Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'cosmetic' && (
        <div className="space-y-10">
          {/* Bundles */}
          {(glyphBundles.length > 0 || fateBundles.length > 0) && (
            <div>
              <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Cinzel, serif' }}>Bundles</h3>
              {fateBundles.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-crimson-400/60 mb-3">💎 Premium Bundles — save Fate vs buying separately</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fateBundles.map(item => (
                      <BundleCard key={item.id} item={item} owned={isOwned(item)} player={player} onBuy={handleBuy} />
                    ))}
                  </div>
                </div>
              )}
              {glyphBundles.length > 0 && (
                <div>
                  <p className="text-xs text-gold-400/60 mb-3">🪙 Glyph Bundles — F2P savings</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {glyphBundles.map(item => (
                      <BundleCard key={item.id} item={item} owned={isOwned(item)} player={player} onBuy={handleBuy} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Glyph Cosmetics */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Cinzel, serif' }}>
              <span className="text-gold-400">🪙</span> Glyph Cosmetics
            </h3>
            {Object.entries(groupedByType(glyphSolo)).map(([type, items]) => (
              <CosmeticGroup key={type} type={type as CosmeticType} items={items} currency="glyph" isOwned={isOwned} player={player} onBuy={handleBuy} />
            ))}
          </div>

          {/* Fate Cosmetics */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Cinzel, serif' }}>
              <span className="text-crimson-400">💎</span> Fate Cosmetics
            </h3>
            {Object.entries(groupedByType(fateSolo)).map(([type, items]) => (
              <CosmeticGroup key={type} type={type as CosmeticType} items={items} currency="fate" isOwned={isOwned} player={player} onBuy={handleBuy} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CosmeticGroup({ type, items, currency, isOwned, player, onBuy }: {
  type: CosmeticType
  items: typeof STORE_ITEMS
  currency: 'glyph' | 'fate'
  isOwned: (item: (typeof STORE_ITEMS)[number]) => boolean
  player: ReturnType<typeof useGameStore.getState>['player']
  onBuy: (id: string) => void
}) {
  const Icon = COSMETIC_ICONS[type]
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} className="text-surface-50/40" />
        <h4 className="text-sm font-semibold text-surface-50/70">{COSMETIC_LABELS[type]}</h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map(item => {
          const owned = isOwned(item)
          const price = currency === 'glyph' ? item.priceGlyph : item.priceFate
          const canAfford = currency === 'glyph' ? (player.glyph ?? 0) >= item.priceGlyph : (player.fate ?? 0) >= item.priceFate
          return (
            <div key={item.id} className={clsx('rounded-lg border border-surface-300/20 bg-surface-800/40 px-3 py-2.5 flex items-center gap-3', owned && 'opacity-50')}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-crimson-900/30">
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{item.name}</p>
                <p className="text-[10px] text-surface-50/50">{item.description}</p>
              </div>
              {owned
                ? <span className="text-[10px] text-green-400 font-medium bg-green-400/10 px-1.5 py-0.5 rounded shrink-0">Equipped</span>
                : (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono text-gold-400">{price} {currency === 'glyph' ? '🪙' : '💎'}</span>
                    <Button size="xs" variant="ghost" onClick={() => onBuy(item.id)} disabled={!canAfford}>Buy</Button>
                  </div>
                )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BundleCard({ item, owned, player, onBuy }: {
  item: (typeof STORE_ITEMS)[number]
  owned: boolean
  player: ReturnType<typeof useGameStore.getState>['player']
  onBuy: (id: string) => void
}) {
  const currency = item.priceFate > 0 ? 'fate' : 'glyph'
  const price = currency === 'fate' ? item.priceFate : item.priceGlyph
  const canAfford = currency === 'fate' ? (player.fate ?? 0) >= item.priceFate : (player.glyph ?? 0) >= item.priceGlyph
  const contents = item.packContents ?? {}

  return (
    <div className={clsx('rounded-xl border border-surface-300/20 bg-surface-800/40 p-4', owned && 'opacity-50', item.rarity === 'mythic' && 'border-crimson-600/20')}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-crimson-900/30">
          <Package size={20} className={currency === 'fate' ? 'text-crimson-400' : 'text-gold-400'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold">{item.name}</p>
            <RarityBadge rarity={item.rarity} />
          </div>
          <p className="text-xs text-surface-50/50 mt-1">{item.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(contents).map(([type, value]) => (
              <span key={type} className="text-[10px] bg-surface-700/50 text-surface-50/70 px-1.5 py-0.5 rounded">{value}</span>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className={clsx('text-sm font-mono', currency === 'fate' ? 'text-crimson-400' : 'text-gold-400')}>{price} {currency === 'fate' ? '💎' : '🪙'}</span>
            {owned
              ? <span className="text-xs text-green-400 font-medium bg-green-400/10 px-2 py-1 rounded">Owned</span>
              : <Button size="xs" variant="gold" onClick={() => onBuy(item.id)} disabled={!canAfford}>Buy</Button>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
