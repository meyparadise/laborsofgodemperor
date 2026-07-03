import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Player, Quest, Prediction, Item, SlotType, VirtueName, Virtues, VirtueTierLabel, HeroPost, CosmeticType, ExchangeOrder, Hero, DeckCard, StoreItem, MarketListing, ExchangeTick, Badge, Faction } from '@/types'
import { PLAYER, QUESTS, HEROES, ALL_ITEMS, STORE_ITEMS, DECK_CARDS, MARKET_LISTINGS, HERO_POSTS, EXCHANGE_ORDERS, PRICE_HISTORY, EXCHANGE_TRADES, FACTION_INFO, HERO_LEADERBOARDS, FAKE_PLAYERS } from '@/data/mock'

interface GameState {
  player: Player
  quests: Quest[]
  heroPosts: Record<string, HeroPost[]>
  exchangeOrders: ExchangeOrder[]
  heroes: Hero[]
  items: Item[]
  cards: DeckCard[]
  storeItems: StoreItem[]
  marketListings: MarketListing[]
  exchangeTrades: ExchangeTick[]
  priceHistory: { time: number; value: number }[]
  players: Player[]

  placePrediction: (questId: string, outcome: 'YES' | 'NO', amount: number, entryProbability: number) => boolean
  equipItem: (itemId: string, slotType: SlotType) => void
  unequipItem: (slotType: SlotType) => void
  unlockCard: (cardId: string) => boolean
  slotCard: (cardId: string, slotIndex: number) => void
  unslotCard: (slotIndex: number) => void
  getQuest: (id: string) => Quest | undefined
  getHeroName: (id: string) => string
  getHeroTitle: (id: string) => string
  getItemById: (id: string) => Item | undefined

  // Cheat / dev actions
  setLevel: (level: number) => void
  setXP: (xp: number) => void
  addXP: (amount: number) => void
  setStat: (virtue: VirtueName, value: number) => void
  setAllStats: (value: number) => void
  setSkillPoints: (points: number) => void
  maxAll: () => void
  setInsightPoints: (amount: number) => void
  addInsightPoints: (amount: number) => void
  addItemToInventory: (itemId: string) => boolean
  removeItemFromInventory: (itemId: string) => void
  clearInventory: () => void
  unequipAll: () => void
  followHero: (heroId: string) => void
  unfollowHero: (heroId: string) => void
  followAllHeroes: () => void
  unfollowAllHeroes: () => void
  resolveQuest: (questId: string, outcome: 'YES' | 'NO') => void
  reopenQuest: (questId: string) => void
  resolveAllRandom: () => void
  resetPlayer: () => void
  clearPredictions: () => void
  resetCards: () => void
  buyStoreItem: (itemId: string) => boolean
  addGlyph: (amount: number) => void
  addFate: (amount: number) => void
  createListing: (itemId: string, isItem: boolean, price: number, currency: 'glyph' | 'fate') => void
  cancelListing: (listingId: string) => void
  buyListing: (listingId: string) => boolean
  castTierVote: (questId: string, tier: VirtueTierLabel, optionId: string) => void
  postHeroMessage: (heroId: string, text: string) => void
  placeExchangeOrder: (side: 'BUY_GLYPH' | 'SELL_GLYPH', rate: number, amount: number) => void
  cancelExchangeOrder: (orderId: string) => void
  updateHero: (id: string, partial: Partial<Hero>) => void
  addHero: (hero: Hero) => void
  updateQuest: (id: string, partial: Partial<Quest>) => void
  addQuest: (quest: Quest) => void
  updateItem: (id: string, partial: Partial<Item>) => void
  addItem: (item: Item) => void
  updateCard: (id: string, partial: Partial<DeckCard>) => void
  addCard: (card: DeckCard) => void
  updateStoreItem: (id: string, partial: Partial<StoreItem>) => void
  addStoreItem: (item: StoreItem) => void
  deleteHero: (id: string) => void
  deleteQuest: (id: string) => void
  deleteItem: (id: string) => void
  deleteCard: (id: string) => void
  deleteStoreItem: (id: string) => void
  deleteMarketListing: (id: string) => void
  deleteHeroPost: (heroId: string, postId: string) => void
  deleteExchangeOrder: (orderId: string) => void
  updatePlayerField: <K extends keyof Player>(field: K, value: Player[K]) => void
  updatePlayerById: (id: string, partial: Partial<Player>) => void
  deletePlayer: (id: string) => void
  banPlayer: (id: string, banned: boolean) => void
  updateFactionInfo: (key: Faction, partial: Partial<{ name: string; description: string; bonus: string; color: string; linkedVirtue: VirtueName; heroIds: string[] }>) => void
  reseedAllData: () => void
  importState: (state: Partial<GameState>) => void
  exportState: () => GameState
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

function migrateStatsToVirtues(stats: Record<string, number> | undefined): Virtues {
  const defaults: Virtues = { wisdom: 8, courage: 8, prudence: 8, skill: 8, temperance: 8, justice: 8 }
  if (!stats) return defaults
  const map: Record<string, VirtueName> = { str: 'courage', dex: 'skill', con: 'temperance', int: 'wisdom', wis: 'prudence', cha: 'justice' }
  const virtues: Partial<Virtues> = {}
  for (const [key, value] of Object.entries(stats)) {
    const mapped = map[key]
    if (mapped) virtues[mapped] = value
  }
  return { ...defaults, ...virtues }
}

function oldFactionToNew(f: string | undefined): Player['faction'] {
  const map: Record<string, Player['faction']> = {
    BULLS: 'legion', BEARS: 'wardens', OWLS: 'architects', FOXES: 'operatives', HAWKS: 'tribunal', DOVES: 'monastics',
  }
  return map[f ?? ''] ?? 'legion'
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      player: PLAYER,
      quests: QUESTS,
      heroPosts: HERO_POSTS,
      exchangeOrders: [],
      heroes: HEROES,
      items: ALL_ITEMS,
      cards: DECK_CARDS,
      storeItems: STORE_ITEMS,
      marketListings: MARKET_LISTINGS,
      exchangeTrades: EXCHANGE_TRADES,
      priceHistory: PRICE_HISTORY,
      players: [PLAYER, ...FAKE_PLAYERS],

      placePrediction: (questId, outcome, amount, entryProbability) => {
        const state = get()
        if (state.player.insightPoints < amount) return false

        const quest = state.quests.find(q => q.id === questId)
        if (!quest) return false

        const hero = state.player.followedHeroes[0]
        const followedHero = hero ? HEROES.find(h => h.id === hero) : undefined

        const prediction: Prediction = {
          id: `p${Date.now()}`,
          questId,
          questQuestion: quest.question,
          questCategory: quest.category,
          outcome,
          amount,
          entryProbability,
          yesProbabilityAtEntry: quest.yesProbability,
          noProbabilityAtEntry: quest.noProbability,
          placedAt: new Date().toISOString(),
          result: 'PENDING',
          payout: 0,
          netProfit: 0,
          heroFollowedId: followedHero?.id,
          heroFollowedName: followedHero?.name,
          heroFollowedAvatarUrl: followedHero?.avatarUrl,
          heroFollowedTitle: followedHero?.title,
          heroFollowedFaction: followedHero?.faction,
          equippedItems: [],
          virtueBonuses: [],
        }

        set({
          player: {
            ...state.player,
            insightPoints: state.player.insightPoints - amount,
            predictions: [...state.player.predictions, prediction],
            totalPredictions: state.player.totalPredictions + 1,
            xp: state.player.xp + 10,
          },
        })
        return true
      },

      equipItem: (itemId, slotType) => {
        const state = get()
        const item = ALL_ITEMS.find(i => i.id === itemId)
        if (!item || item.slotType !== slotType) return
        if (item.requiredVirtue && item.requiredValue && (state.player.virtues[item.requiredVirtue] ?? 0) < item.requiredValue) return
        set({
          player: {
            ...state.player,
            equippedItems: { ...state.player.equippedItems, [slotType]: itemId },
          },
        })
      },

      unequipItem: (slotType) => {
        set({
          player: {
            ...get().player,
            equippedItems: { ...get().player.equippedItems, [slotType]: '' },
          },
        })
      },

      unlockCard: (cardId) => {
        const state = get()
        if (state.player.unlockedCards.includes(cardId)) return false
        if (state.player.skillPoints < 1) return false
        set({
          player: {
            ...state.player,
            skillPoints: state.player.skillPoints - 1,
            unlockedCards: [...state.player.unlockedCards, cardId],
          },
        })
        return true
      },

      slotCard: (cardId, slotIndex) => {
        const state = get()
        if (!state.player.unlockedCards.includes(cardId)) return
        const newSlots = [...state.player.deckSlots]
        newSlots[slotIndex] = cardId
        set({ player: { ...state.player, deckSlots: newSlots } })
      },

      unslotCard: (slotIndex) => {
        const state = get()
        const newSlots = [...state.player.deckSlots]
        newSlots[slotIndex] = null
        set({ player: { ...state.player, deckSlots: newSlots } })
      },

      getQuest: (id) => get().quests.find(q => q.id === id),
      getHeroName: (id) => HEROES.find(h => h.id === id)?.name ?? 'Unknown',
      getHeroTitle: (id) => HEROES.find(h => h.id === id)?.title ?? '',
      getHeroHandle: (id) => HEROES.find(h => h.id === id)?.handle ?? '',
      getItemById: (id) => ALL_ITEMS.find(i => i.id === id),

      setLevel: (level) => set(s => ({ player: { ...s.player, level: clamp(level, 1, 100) } })),
      setXP: (xp) => set(s => ({ player: { ...s.player, xp: clamp(xp, 0, 999999) } })),
      addXP: (amount) => set(s => ({ player: { ...s.player, xp: clamp(s.player.xp + amount, 0, 999999) } })),
      setStat: (virtue, value) => set(s => ({
        player: { ...s.player, virtues: { ...s.player.virtues, [virtue]: clamp(value, 1, 20) } },
      })),
      setAllStats: (value) => {
        const v = clamp(value, 1, 20)
        set(s => ({
          player: { ...s.player, virtues: { wisdom: v, courage: v, prudence: v, skill: v, temperance: v, justice: v } },
        }))
      },
      setSkillPoints: (points) => set(s => ({ player: { ...s.player, skillPoints: clamp(points, 0, 99) } })),
      maxAll: () => set(s => ({
        player: {
          ...s.player,
          level: 100,
          xp: 0,
          virtues: { wisdom: 20, courage: 20, prudence: 20, skill: 20, temperance: 20, justice: 20 },
          skillPoints: 99,
        },
      })),
      setInsightPoints: (amount) => set(s => ({ player: { ...s.player, insightPoints: clamp(amount, 0, 9999999) } })),
      addInsightPoints: (amount) => set(s => ({
        player: { ...s.player, insightPoints: clamp(s.player.insightPoints + amount, 0, 9999999) },
      })),
      addItemToInventory: (itemId) => {
        const state = get()
        if (state.player.inventory.some(i => i.id === itemId)) return false
        const item = ALL_ITEMS.find(i => i.id === itemId)
        if (!item) return false
        set({ player: { ...state.player, inventory: [...state.player.inventory, { ...item, source: 'dev_spawn' }] } })
        return true
      },
      removeItemFromInventory: (itemId) => {
        const state = get()
        set({
          player: {
            ...state.player,
            inventory: state.player.inventory.filter(i => i.id !== itemId),
            equippedItems: Object.fromEntries(
              Object.entries(state.player.equippedItems).filter(([, id]) => id !== itemId)
            ),
          },
        })
      },
      clearInventory: () => set(s => ({ player: { ...s.player, inventory: [], equippedItems: {} } })),
      unequipAll: () => set(s => ({ player: { ...s.player, equippedItems: {} } })),
      followHero: (heroId) => set(s => ({
        player: { ...s.player, followedHeroes: s.player.followedHeroes.includes(heroId) ? s.player.followedHeroes : [...s.player.followedHeroes, heroId] },
      })),
      unfollowHero: (heroId) => set(s => ({
        player: { ...s.player, followedHeroes: s.player.followedHeroes.filter(h => h !== heroId) },
      })),
      followAllHeroes: () => set(s => ({ player: { ...s.player, followedHeroes: HEROES.map(h => h.id) } })),
      unfollowAllHeroes: () => set(s => ({ player: { ...s.player, followedHeroes: [] } })),
      resolveQuest: (questId, outcome) => {
        const state = get()
        const quest = state.quests.find(q => q.id === questId)
        if (!quest) return
        const newStatus = outcome === 'YES' ? 'RESOLVED_YES' as const : 'RESOLVED_NO' as const
        const newQuests = state.quests.map(q => q.id === questId ? { ...q, status: newStatus } : q)
        let correctCount = state.player.correctPredictions
        const newPredictions = state.player.predictions.map(p => {
          if (p.questId !== questId || p.result !== 'PENDING') return p
          if (p.outcome === outcome) {
            correctCount++
            const payout = Math.round(p.amount * (100 / p.entryProbability))
            return { ...p, result: 'WON' as const, payout, netProfit: payout - p.amount, resolvedAt: new Date().toISOString() }
          }
          return { ...p, result: 'LOST' as const, payout: 0, netProfit: -p.amount, resolvedAt: new Date().toISOString() }
        })
        set({ quests: newQuests, player: { ...state.player, predictions: newPredictions, correctPredictions: correctCount } })
      },
      reopenQuest: (questId) => {
        const state = get()
        const newQuests = state.quests.map(q => q.id === questId ? { ...q, status: 'OPEN' as const } : q)
        let correctCount = state.player.correctPredictions
        const newPredictions = state.player.predictions.map(p => {
          if (p.questId !== questId) return p
          if (p.result === 'WON') correctCount--
          return { ...p, result: 'PENDING' as const, payout: 0, netProfit: 0, resolvedAt: undefined }
        })
        set({ quests: newQuests, player: { ...state.player, predictions: newPredictions, correctPredictions: correctCount } })
      },
      resolveAllRandom: () => {
        const state = get()
        let correctCount = state.player.correctPredictions
        const newQuests = state.quests.map(q => {
          if (q.status !== 'OPEN') return q
          const outcome = Math.random() < 0.5 ? 'YES' as const : 'NO' as const
          return { ...q, status: outcome === 'YES' ? 'RESOLVED_YES' as const : 'RESOLVED_NO' as const }
        })
        const newPredictions = state.player.predictions.map(p => {
          if (p.result !== 'PENDING') return p
          const quest = newQuests.find(q => q.id === p.questId)
          if (!quest || quest.status === 'OPEN') return p
          const outcome = quest.status === 'RESOLVED_YES' ? 'YES' as const : 'NO' as const
          if (p.outcome === outcome) {
            correctCount++
            const payout = Math.round(p.amount * (100 / p.entryProbability))
            return { ...p, result: 'WON' as const, payout, netProfit: payout - p.amount, resolvedAt: new Date().toISOString() }
          }
          return { ...p, result: 'LOST' as const, payout: 0, netProfit: -p.amount, resolvedAt: new Date().toISOString() }
        })
        set({ quests: newQuests, player: { ...state.player, predictions: newPredictions, correctPredictions: correctCount } })
      },
      resetPlayer: () => set({ player: { ...PLAYER, virtues: { ...PLAYER.virtues }, virtueXP: { wisdom: 0, courage: 0, prudence: 0, skill: 0, temperance: 0, justice: 0 }, predictions: [...PLAYER.predictions], inventory: [...PLAYER.inventory], badges: [...PLAYER.badges], equippedItems: { ...PLAYER.equippedItems }, followedHeroes: [...PLAYER.followedHeroes], unlockedCards: [...PLAYER.unlockedCards], deckSlots: [...PLAYER.deckSlots], title: undefined, frame: undefined, nameColor: undefined, profileBackground: undefined, predictionFlair: undefined, avatarDecoration: undefined, badgeEffect: undefined, starterPackPurchased: false } }),
      clearPredictions: () => set(s => ({ player: { ...s.player, predictions: [], totalPredictions: 0, correctPredictions: 0 } })),
      resetCards: () => set(s => ({ player: { ...s.player, unlockedCards: [], deckSlots: PLAYER.deckSlots.map(() => null), skillPoints: PLAYER.skillPoints } })),
      buyStoreItem: (itemId) => {
        const state = get()
        const item = STORE_ITEMS.find(i => i.id === itemId)
        if (!item || item.stock <= 0) return false
        if (item.starterPack && state.player.starterPackPurchased) return false
        if (item.priceGlyph > 0 && state.player.glyph < item.priceGlyph) return false
        if (item.priceFate > 0 && state.player.fate < item.priceFate) return false

        const COSMETIC_LABELS: Record<CosmeticType, string> = {
          title: 'Title', frame: 'Frame', nameColor: 'Name Color',
          profileBackground: 'Background', predictionFlair: 'Flair',
          avatarDecoration: 'Decoration', badgeEffect: 'Effect',
        }

        const updates: Partial<Player> = {
          glyph: state.player.glyph - item.priceGlyph,
          fate: state.player.fate - item.priceFate,
        }

        // Currency purchase — add Glyph + Fate (sweepstakes bonus)
        if (item.category === 'currency' && (item.glyphAmount || item.fateAmount)) {
          if (item.glyphAmount) updates.glyph = (state.player.glyph ?? 0) - item.priceGlyph + item.glyphAmount
          if (item.fateAmount) updates.fate = (state.player.fate ?? 0) - item.priceFate + item.fateAmount
          if (item.starterPack) updates.starterPackPurchased = true
        }

        // Apply cosmetic from pack or solo item
        if (item.pack && item.packContents) {
          for (const [type, value] of Object.entries(item.packContents)) {
            const ct = type as CosmeticType
            switch (ct) {
              case 'title': updates.title = value; break
              case 'frame': updates.frame = value; break
              case 'nameColor': updates.nameColor = value; break
              case 'profileBackground': updates.profileBackground = value; break
              case 'predictionFlair': updates.predictionFlair = value; break
              case 'avatarDecoration': updates.avatarDecoration = value; break
              case 'badgeEffect': updates.badgeEffect = value; break
            }
          }
          if (item.starterPack) updates.starterPackPurchased = true
        } else if (item.category === 'cosmetic' && item.cosmeticType) {
          const label = COSMETIC_LABELS[item.cosmeticType]
          const cosmeticValue = item.name.replace(new RegExp(`^${label}:\\s*`), '')
          switch (item.cosmeticType) {
            case 'title': updates.title = cosmeticValue; break
            case 'frame': updates.frame = cosmeticValue; break
            case 'nameColor': updates.nameColor = cosmeticValue; break
            case 'profileBackground': updates.profileBackground = cosmeticValue; break
            case 'predictionFlair': updates.predictionFlair = cosmeticValue; break
            case 'avatarDecoration': updates.avatarDecoration = cosmeticValue; break
            case 'badgeEffect': updates.badgeEffect = cosmeticValue; break
          }
        }

        set({ player: { ...state.player, ...updates } })
        return true
      },
      addGlyph: (amount) => set(s => ({ player: { ...s.player, glyph: clamp((s.player.glyph ?? 0) + amount, 0, 999999) } })),
      addFate: (amount) => set(s => ({ player: { ...s.player, fate: clamp((s.player.fate ?? 0) + amount, 0, 999999) } })),
      createListing: (itemId, isItem, price, currency) => {
        const state = get()
        const listing: MarketListing = {
          id: `ml-player-${Date.now()}`,
          sellerId: state.player.id,
          sellerName: state.player.username,
          sellerFaction: state.player.faction,
          itemId,
          itemName: isItem ? (ALL_ITEMS.find(i => i.id === itemId)?.name ?? itemId) : (DECK_CARDS.find(c => c.id === itemId)?.name ?? itemId),
          itemRarity: isItem ? (ALL_ITEMS.find(i => i.id === itemId)?.rarity ?? 'common') : 'rare',
          itemType: isItem ? 'item' : 'card',
          slotType: isItem ? ALL_ITEMS.find(i => i.id === itemId)?.slotType : undefined,
          virtue: isItem ? undefined : DECK_CARDS.find(c => c.id === itemId)?.virtue,
          listingType: 'WTS',
          price,
          currency,
          listedAt: new Date().toISOString(),
        }
        set({
          player: {
            ...state.player,
            marketListings: [...(state.player.marketListings ?? []), listing],
            inventory: isItem ? state.player.inventory.filter(i => i.id !== itemId) : state.player.inventory,
          },
        })
      },
      cancelListing: (listingId) => {
        const state = get()
        const listing = (state.player.marketListings ?? []).find(l => l.id === listingId)
        if (!listing) return
        const item = ALL_ITEMS.find(i => i.id === listing.itemId)
        set({
          player: {
            ...state.player,
            marketListings: (state.player.marketListings ?? []).filter(l => l.id !== listingId),
            inventory: listing.itemType === 'item' && item ? [...state.player.inventory, item] : state.player.inventory,
          },
        })
      },
      buyListing: (listingId) => {
        const state = get()
        const listing = MARKET_LISTINGS.find(l => l.id === listingId)
        if (!listing) return false
        if (listing.currency === 'glyph' && state.player.glyph < listing.price) return false
        if (listing.currency === 'fate' && state.player.fate < listing.price) return false
        const item = ALL_ITEMS.find(i => i.id === listing.itemId)
        set({
          player: {
            ...state.player,
            glyph: listing.currency === 'glyph' ? state.player.glyph - listing.price : state.player.glyph,
            fate: listing.currency === 'fate' ? state.player.fate - listing.price : state.player.fate,
            inventory: listing.itemType === 'item' && item ? [...state.player.inventory.filter(i => i.id !== item.id), item] : state.player.inventory,
          },
        })
        return true
      },
      placeExchangeOrder: (side, rate, amount) => {
        const state = get()
        const player = state.player
        const total = +(amount * rate).toFixed(2)

        if (side === 'BUY_GLYPH') {
          if ((player.fate ?? 0) < total) return
          set({
            player: { ...player, fate: (player.fate ?? 0) - total, glyph: (player.glyph ?? 0) + amount },
          })
        } else {
          if ((player.glyph ?? 0) < amount) return
          set({
            player: { ...player, glyph: (player.glyph ?? 0) - amount, fate: (player.fate ?? 0) + total },
          })
        }

        const order: ExchangeOrder = {
          id: `ex-player-${Date.now()}`,
          userId: player.id,
          userName: player.username,
          userFaction: player.faction,
          side, rate, amount, total,
          filled: amount,
          status: 'FILLED',
          createdAt: new Date().toISOString(),
          filledAt: new Date().toISOString(),
        }
        set({ exchangeOrders: [...state.exchangeOrders, order] })
      },
      cancelExchangeOrder: (orderId) => {
        set(s => ({
          exchangeOrders: s.exchangeOrders.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' as const } : o),
        }))
      },

      // Admin CRUD actions
      updateHero: (id, partial) => set(s => ({ heroes: s.heroes.map(h => h.id === id ? { ...h, ...partial } : h) })),
      addHero: (hero) => set(s => ({ heroes: [...s.heroes, hero] })),
      updateQuest: (id, partial) => set(s => ({ quests: s.quests.map(q => q.id === id ? { ...q, ...partial } : q) })),
      addQuest: (quest) => set(s => ({ quests: [...s.quests, quest] })),
      updateItem: (id, partial) => set(s => ({ items: s.items.map(i => i.id === id ? { ...i, ...partial } : i) })),
      addItem: (item) => set(s => ({ items: [...s.items, item] })),
      updateCard: (id, partial) => set(s => ({ cards: s.cards.map(c => c.id === id ? { ...c, ...partial } : c) })),
      addCard: (card) => set(s => ({ cards: [...s.cards, card] })),
      updateStoreItem: (id, partial) => set(s => ({ storeItems: s.storeItems.map(si => si.id === id ? { ...si, ...partial } : si) })),
      addStoreItem: (item) => set(s => ({ storeItems: [...s.storeItems, item] })),
      deleteHero: (id) => set(s => ({ heroes: s.heroes.filter(h => h.id !== id) })),
      deleteQuest: (id) => set(s => ({ quests: s.quests.filter(q => q.id !== id) })),
      deleteItem: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),
      deleteCard: (id) => set(s => ({ cards: s.cards.filter(c => c.id !== id) })),
      deleteStoreItem: (id) => set(s => ({ storeItems: s.storeItems.filter(si => si.id !== id) })),
      deleteMarketListing: (id) => set(s => ({ marketListings: s.marketListings.filter(ml => ml.id !== id) })),
      deleteHeroPost: (heroId, postId) => set(s => ({
        heroPosts: { ...s.heroPosts, [heroId]: (s.heroPosts[heroId] ?? []).filter(p => p.id !== postId) },
      })),
      deleteExchangeOrder: (orderId) => set(s => ({
        exchangeOrders: s.exchangeOrders.filter(o => o.id !== orderId),
      })),
      updatePlayerField: (field, value) => set(s => ({ player: { ...s.player, [field]: value } })),
      updatePlayerById: (id, partial) => set(s => {
        if (s.player.id === id) return { player: { ...s.player, ...partial } }
        return { players: s.players.map(p => p.id === id ? { ...p, ...partial } : p) }
      }),
      deletePlayer: (id) => set(s => ({ players: s.players.filter(p => p.id !== id && p.id !== s.player.id) })),
      banPlayer: (id, banned) => set(s => {
        if (s.player.id === id) return { player: { ...s.player, status: banned ? 'banned' : 'active' } }
        return { players: s.players.map(p => p.id === id ? { ...p, status: banned ? 'banned' : 'active' } : p) }
      }),
      updateFactionInfo: (key, partial) => {},  // FACTION_INFO is static — no-op for now
      reseedAllData: () => set({
        quests: QUESTS,
        heroPosts: HERO_POSTS,
        exchangeOrders: [],
        heroes: HEROES,
        items: ALL_ITEMS,
        cards: DECK_CARDS,
        storeItems: STORE_ITEMS,
        marketListings: MARKET_LISTINGS,
        exchangeTrades: EXCHANGE_TRADES,
        priceHistory: PRICE_HISTORY,
      }),

      castTierVote: (questId, tier, optionId) => {
        const state = get()
        const player = state.player
        const weight = 1.0 + (player.virtues.wisdom ?? 0) * 0.05 + (((player.faction === 'architects' || player.faction === 'operatives') ? 0.2 : 0))
        const updatedQuest = state.quests.map(q => {
          if (q.id !== questId) return q
          return {
            ...q,
            tierVotes: q.tierVotes.map(tv => {
              if (tv.tier !== tier || tv.status !== 'active') return tv
              return {
                ...tv,
                options: tv.options.map(o => ({
                  ...o,
                  voteCount: o.id === optionId ? o.voteCount + 1 : o.voteCount,
                })),
                totalVotes: tv.totalVotes + 1,
              }
            }),
          }
        })
        set({
          quests: updatedQuest,
          player: {
            ...player,
            mythicVotes: [
              ...(player.mythicVotes ?? []).filter(v => !(v.questId === questId && v.tier === tier)),
              { questId, tier, optionId, weight },
            ],
          },
        })
      },
      postHeroMessage: (heroId, text) => {
        set(state => {
          const post: HeroPost = {
            id: `hp-${heroId}-${Date.now()}`,
            heroId,
            authorName: state.player.username,
            authorFaction: state.player.faction,
            text,
            upvotes: 0,
            downvotes: 0,
            createdAt: new Date().toISOString(),
          }
          return {
            heroPosts: {
              ...state.heroPosts,
              [heroId]: [post, ...(state.heroPosts[heroId] ?? [])],
            },
          }
        })
      },
      importState: (partial) => {
        const state = get()
        set({ ...state, ...partial, player: partial.player ?? state.player })
      },
      exportState: () => get(),
    }),
    {
      name: 'meyquest-game-state',
      partialize: (state) => ({ player: state.player }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error || !state) return
          // @ts-expect-error old stats field
          if (state.player.stats && !state.player.virtues) {
            // @ts-expect-error migration
            state.player.virtues = migrateStatsToVirtues(state.player.stats)
            state.player.virtueXP = { wisdom: 0, courage: 0, prudence: 0, skill: 0, temperance: 0, justice: 0 }
            // @ts-expect-error old stats
            delete state.player.stats
          }
          if (!state.player.followedHeroes) {
            state.player.followedHeroes = []
          }
          if (!state.player.virtueXP) {
            state.player.virtueXP = { wisdom: 0, courage: 0, prudence: 0, skill: 0, temperance: 0, justice: 0 }
          }
          if (!state.player.unlockedCards) {
            state.player.unlockedCards = []
          }
          if (!state.player.deckSlots) {
            state.player.deckSlots = [null, null, null, null]
          }
          if (!state.player.maxDeckSlots) {
            state.player.maxDeckSlots = 4
          }
          if (!state.player.mythicVotes) {
            state.player.mythicVotes = []
          }
          // @ts-expect-error migrate old faction
          if (state.player.faction && ['BULLS', 'BEARS', 'OWLS', 'FOXES', 'HAWKS', 'DOVES'].includes(state.player.faction)) {
            // @ts-expect-error migration
            state.player.faction = oldFactionToNew(state.player.faction)
          }
        }
      },
    }
  )
)
