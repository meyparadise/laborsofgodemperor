import { faker } from '@faker-js/faker'
import type { Hero, Quest, Player, SkillEffect, Badge, Faction, Item, DeckCard, QuestEffect, BadgeChain, SlotType, VirtueName, StoreItem, MarketListing, TierVote, TierVoteOption, QuestPlayer, QuestComment, QuestActivity, Virtues, HeroPost, HeroLeaderboardPlayer, ExchangeOrder, ExchangeTick } from '@/types'

faker.seed(20260701)

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

// ══════════════════════════════════════════════
//  ITEMS — dual-type (itemClass + slotType)
// ══════════════════════════════════════════════

export const ALL_ITEMS: Item[] = [
  // MYTHIC items
  { id: 'item-visor', name: 'Tech Visor', description: 'A holographic visor that overlays market data streams. Neural link compatible.', icon: 'Glasses', flavorText: 'The future renders in real-time.', itemClass: 'equipment', slotType: 'vision', rarity: 'mythic', statBonuses: { wisdom: 5, skill: 2 }, passiveCost: 12, uniqueEffect: { id: 'ef-techprophet', name: 'Tech Prophet', description: '+20% payout on all Tech quests.', mechanic: 'bonus_payout_category', mechanicValue: 1.20, mechanicTarget: 'TECH' }, source: 'quest_loot' },
  { id: 'item-crown', name: 'Crown of Conviction', description: 'A gilded crown radiating absolute certainty. Weighs heavy on the brow.', icon: 'Crown', flavorText: 'To wear it is to become the market.', itemClass: 'equipment', slotType: 'narrative', rarity: 'mythic', statBonuses: { courage: 6, justice: 2 }, passiveCost: 15, requiredVirtue: 'courage', requiredValue: 12, uniqueEffect: { id: 'ef-dealmaker', name: 'Deal Maker', description: '15% chance to flip quest outcome in your favor.', mechanic: 'flip_outcome', mechanicValue: 0.15 }, source: 'quest_loot' },
  { id: 'item-chip', name: 'Neural Chip', description: 'A crystalline chip whispering probability distributions directly to your cortex.', icon: 'Cpu', flavorText: 'Probability is just information you haven\'t processed yet.', itemClass: 'equipment', slotType: 'algorithm', rarity: 'mythic', statBonuses: { wisdom: 5, skill: 3 }, passiveCost: 10, uniqueEffect: { id: 'ef-aioracle', name: 'AI Oracle', description: 'Reveal one hidden quest effect before betting.', mechanic: 'reveal_effect', mechanicValue: 1.0 }, source: 'quest_loot' },
  { id: 'item-mic', name: 'Golden Microphone', description: 'A diamond-studded mic. Every word spoken through it moves markets.', icon: 'Mic', flavorText: 'One word. One billion in volume.', itemClass: 'weapon', slotType: 'resonance', rarity: 'mythic', statBonuses: { skill: 4, temperance: 2 }, passiveCost: 8, uniqueEffect: { id: 'ef-popsovereign', name: 'Pop Sovereign', description: '+15% payout on CULTURE quests.', mechanic: 'bonus_payout_category', mechanicValue: 1.15, mechanicTarget: 'CULTURE' }, source: 'quest_loot' },
  { id: 'item-mask', name: 'Phantom Mask', description: 'A featureless white mask. Identity unknown, influence undeniable.', icon: 'EyeOff', flavorText: 'A trillion dollars, a million guesses.', itemClass: 'equipment', slotType: 'data', rarity: 'mythic', statBonuses: { wisdom: 4, skill: 4 }, passiveCost: 10, uniqueEffect: { id: 'ef-anoneffect', name: 'Anon Effect', description: 'Random 1.0x-3.0x bonus on CRYPTO quests.', mechanic: 'random_multiplier', mechanicValue: 2.0, mechanicTarget: 'CRYPTO' }, source: 'quest_loot' },

  // RARE items
  { id: 'item-badge', name: 'Rebel Badge', description: 'A hand-painted badge worn by those who strike for the future.', icon: 'Shield', flavorText: 'Disruption is a form of care.', itemClass: 'equipment', slotType: 'anomaly', rarity: 'rare', statBonuses: { justice: 4, courage: 1 }, passiveCost: 4, uniqueEffect: { id: 'ef-climatestrike', name: 'Climate Strike', description: '+25% payout on quests linked to high-Wisdom heroes.', mechanic: 'bonus_payout_stat', mechanicValue: 1.25, mechanicTarget: 'wisdom' }, source: 'quest_loot' },
  { id: 'item-gauntlet', name: 'Iron Gauntlet', description: 'A cold metal gauntlet. Crushes opposition with sheer political leverage.', icon: 'Swords', flavorText: 'Power doesn\'t negotiate.', itemClass: 'equipment', slotType: 'conduit', rarity: 'rare', statBonuses: { courage: 4, prudence: 1 }, passiveCost: 5, uniqueEffect: { id: 'ef-strongarm', name: 'Strong Arm', description: '+15% payout on POLITICS quests.', mechanic: 'bonus_payout_category', mechanicValue: 1.15, mechanicTarget: 'POLITICS' }, source: 'quest_loot' },
  { id: 'item-ledger', name: 'Oracle Ledger', description: 'An ancient leather-bound ledger. Time is always on its side.', icon: 'Book', flavorText: 'In the short run the market is a voting machine, in the long run...', itemClass: 'equipment', slotType: 'capital', rarity: 'rare', statBonuses: { prudence: 5, temperance: 2 }, passiveCost: 3, uniqueEffect: { id: 'ef-valueinvest', name: 'Value Investor', description: '+30% if you hold prediction >48h.', mechanic: 'bonus_hold_time', mechanicValue: 1.30 }, source: 'quest_loot' },
  { id: 'item-visor2', name: 'Metaverse Visor', description: 'Sleek AR visor bridging realities. Doubles quest modifiers.', icon: 'Glasses', flavorText: 'One reality at a time was never enough.', itemClass: 'equipment', slotType: 'cascade', rarity: 'rare', statBonuses: { wisdom: 3, skill: 2 }, passiveCost: 5, uniqueEffect: { id: 'ef-metarchitect', name: 'Metarchitect', description: 'Double the effect of one random quest modifier.', mechanic: 'double_modifier', mechanicValue: 2.0 }, source: 'quest_loot' },
  { id: 'item-pendant', name: 'Harmony Pendant', description: 'A radiant pendant that hums when volume spikes.', icon: 'Gem', flavorText: 'When the crowd moves, it sings.', itemClass: 'equipment', slotType: 'resonance', rarity: 'rare', statBonuses: { temperance: 3, justice: 2 }, passiveCost: 3, uniqueEffect: { id: 'ef-queenbuzz', name: 'Queen Buzz', description: '+10% on quests with >100K volume.', mechanic: 'bonus_high_volume', mechanicValue: 1.10 }, source: 'quest_loot' },
  { id: 'item-compass', name: 'Contrarian Compass', description: 'A compass that points opposite the crowd. Unnervingly accurate.', icon: 'Compass', flavorText: 'The herd is usually wrong. Usually.', itemClass: 'equipment', slotType: 'anomaly', rarity: 'rare', statBonuses: { justice: 4, wisdom: 1 }, passiveCost: 4, uniqueEffect: { id: 'ef-contrarian', name: 'Contrarian', description: '+30% against 70%+ consensus.', mechanic: 'bonus_contrarian', mechanicValue: 1.30 }, source: 'quest_loot' },
  { id: 'item-harpoon', name: 'Whale Harpoon', description: 'A heavy harpoon calibrated for the biggest bets.', icon: 'Anchor', flavorText: 'Go big or go home. Preferably big.', itemClass: 'weapon', slotType: 'capital', rarity: 'rare', statBonuses: { courage: 4 }, passiveCost: 5, uniqueEffect: { id: 'ef-whalehunter', name: 'Whale Hunter', description: '+25% on bets over 300 IP.', mechanic: 'bonus_large_bet', mechanicValue: 1.25 }, source: 'quest_loot' },
  { id: 'item-fist', name: 'Diamond Fists', description: 'Ceremonial diamond-knuckled gloves. The ultimate HODL statement.', icon: 'Gem', flavorText: 'Diamond is forged under pressure. So is conviction.', itemClass: 'equipment', slotType: 'capital', rarity: 'rare', statBonuses: { temperance: 3, courage: 2 }, passiveCost: 3, uniqueEffect: { id: 'ef-diamondhands', name: 'Diamond Hands', description: '+20% payout if held to resolution.', mechanic: 'bonus_hold_resolution', mechanicValue: 1.20 }, source: 'quest_loot' },

  // UNCOMMON items
  { id: 'item-watch', name: 'Dawn Watch', description: 'A timepiece set to market open. Early entries rewarded.', icon: 'Clock', flavorText: 'The early oracle gets the edge.', itemClass: 'equipment', slotType: 'network', rarity: 'uncommon', statBonuses: { skill: 3 }, passiveCost: 1, source: 'quest_loot' },
  { id: 'item-scroll', name: 'Scholar Scroll', description: 'An ancient scroll of market wisdom passed through generations.', icon: 'Scroll', flavorText: 'Those who do not study history...', itemClass: 'equipment', slotType: 'data', rarity: 'uncommon', statBonuses: { wisdom: 2, prudence: 1 }, passiveCost: 2, source: 'quest_loot' },
  { id: 'item-charm', name: 'Lucky Charm', description: 'A four-leaf clover pressed in resin. Probability bends around it.', icon: 'Clover', flavorText: 'Luck is just unrecognized pattern recognition.', itemClass: 'equipment', slotType: 'data', rarity: 'uncommon', statBonuses: { skill: 2 }, passiveCost: 1, source: 'quest_loot' },
]

function item(id: string): Item {
  return ALL_ITEMS.find(i => i.id === id)!
}

// ══════════════════════════════════════════════
//  HEROES — with virtues, slotType, virtue focus
// ══════════════════════════════════════════════

export const HEROES: Hero[] = [
  { id: 'elon', handle: '@elonmusk', name: 'Elon Musk', title: 'The Technoking', alignment: 'CN', virtues: { wisdom: 18, courage: 14, prudence: 8, skill: 16, temperance: 6, justice: 10 }, bio: 'CEO of Tesla and SpaceX. X owner. Crypto influencer. Mars colonist aspirant.', faction: 'legion', equippedItems: [item('item-visor'), item('item-charm')], slotType: 'vision', avatarUrl: '', primaryVirtue: 'wisdom', secondaryVirtue: 'courage' },
  { id: 'trump', handle: '@realdonaldtrump', name: 'Donald Trump', title: 'The Deal Maker', alignment: 'LE', virtues: { wisdom: 10, courage: 18, prudence: 8, skill: 10, temperance: 4, justice: 6 }, bio: '45th & 47th US President. Real estate mogul. Master of the deal.', faction: 'legion', equippedItems: [item('item-crown'), item('item-gauntlet')], slotType: 'narrative', avatarUrl: '', primaryVirtue: 'courage', secondaryVirtue: 'justice' },
  { id: 'greta', handle: '@gretathunberg', name: 'Greta Thunberg', title: 'Climate Crusader', alignment: 'NG', virtues: { wisdom: 14, courage: 12, prudence: 10, skill: 12, temperance: 18, justice: 16 }, bio: 'Environmental activist. Fridays for Future founder. UN speech icon.', faction: 'wardens', equippedItems: [item('item-badge'), item('item-compass')], slotType: 'anomaly', avatarUrl: '', primaryVirtue: 'justice', secondaryVirtue: 'temperance' },
  { id: 'altman', handle: '@sama', name: 'Sam Altman', title: 'The AI Oracle', alignment: 'LN', virtues: { wisdom: 20, courage: 8, prudence: 14, skill: 14, temperance: 10, justice: 10 }, bio: 'OpenAI CEO. ChatGPT creator. AGI prophet. Nuclear fusion investor.', faction: 'architects', equippedItems: [item('item-chip'), item('item-scroll')], slotType: 'algorithm', avatarUrl: '', primaryVirtue: 'wisdom', secondaryVirtue: 'skill' },
  { id: 'putin', handle: '@putin', name: 'Vladimir Putin', title: 'The Strongman', alignment: 'LE', virtues: { wisdom: 16, courage: 18, prudence: 14, skill: 10, temperance: 12, justice: 4 }, bio: 'Russian President. Ex-KGB. Judo black belt. Geopolitical chessmaster.', faction: 'tribunal', equippedItems: [item('item-gauntlet'), item('item-fist')], slotType: 'conduit', avatarUrl: '', primaryVirtue: 'courage', secondaryVirtue: 'prudence' },
  { id: 'swift', handle: '@taylorswift13', name: 'Taylor Swift', title: 'The Pop Sovereign', alignment: 'CG', virtues: { wisdom: 14, courage: 10, prudence: 12, skill: 18, temperance: 14, justice: 16 }, bio: '14x Grammy winner. Eras Tour billionaire. Economy-mover.', faction: 'operatives', equippedItems: [item('item-mic'), item('item-watch')], slotType: 'network', avatarUrl: '', primaryVirtue: 'skill', secondaryVirtue: 'justice' },
  { id: 'buffett', handle: '@warrenbuffett', name: 'Warren Buffett', title: 'The Oracle of Omaha', alignment: 'LG', virtues: { wisdom: 18, courage: 6, prudence: 20, skill: 8, temperance: 16, justice: 12 }, bio: 'Berkshire Hathaway CEO. Value investing legend. $147B net worth.', faction: 'architects', equippedItems: [item('item-ledger'), item('item-fist')], slotType: 'capital', avatarUrl: '', primaryVirtue: 'prudence', secondaryVirtue: 'wisdom' },
  { id: 'satoshi', handle: '@satoshi', name: 'Satoshi Nakamoto', title: 'The Phantom', alignment: 'TN', virtues: { wisdom: 20, courage: 4, prudence: 10, skill: 18, temperance: 18, justice: 8 }, bio: 'Bitcoin creator. Unknown identity. ~1M BTC untouched.', faction: 'operatives', equippedItems: [item('item-mask'), item('item-scroll')], slotType: 'data', avatarUrl: '', primaryVirtue: 'wisdom', secondaryVirtue: 'skill' },
  { id: 'zuck', handle: '@zuck', name: 'Mark Zuckerberg', title: 'The Metarchitect', alignment: 'LN', virtues: { wisdom: 18, courage: 10, prudence: 10, skill: 14, temperance: 8, justice: 8 }, bio: 'Meta CEO. Facebook founder. Metaverse builder. Threads launcher.', faction: 'architects', equippedItems: [item('item-visor2'), item('item-chip')], slotType: 'cascade', avatarUrl: '', primaryVirtue: 'wisdom', secondaryVirtue: 'temperance' },
  { id: 'beyonce', handle: '@beyonce', name: 'Beyoncé', title: 'Queen Bey', alignment: 'NG', virtues: { wisdom: 14, courage: 12, prudence: 14, skill: 16, temperance: 16, justice: 18 }, bio: '32x Grammy winner. Renaissance architect. Cultural icon.', faction: 'monastics', equippedItems: [item('item-pendant'), item('item-mic')], slotType: 'resonance', avatarUrl: '', primaryVirtue: 'justice', secondaryVirtue: 'skill' },
]

// ══════════════════════════════════════════════
//  QUEST CONDITION EFFECTS
// ══════════════════════════════════════════════

const effectLib: Record<string, SkillEffect> = {
  highVol: { id: 'ef-highvol', name: 'High Volatility', description: 'Payout 2x, odds shift 3x faster.', modifierType: 'multiplier', modifierValue: 2.0 },
  slowBurn: { id: 'ef-slowburn', name: 'Slow Burn', description: '1.5x payout, resolves in 2x time.', modifierType: 'multiplier', modifierValue: 1.5 },
  mirrorRealm: { id: 'ef-mirrorrealm', name: 'Mirror Realm', description: 'YES/NO swapped on resolution.', modifierType: 'chance', modifierValue: 0.0 },
  doubleDown: { id: 'ef-doubledown', name: 'Double Down', description: 'Payout squared, risk doubled.', modifierType: 'multiplier', modifierValue: 1.0 },
  trending: { id: 'ef-trending', name: 'Trending', description: '+30% volume, faster odds.', modifierType: 'multiplier', modifierValue: 1.3 },
  underdog: { id: 'ef-underdog', name: 'Underdog', description: '3x on <30% side.', modifierType: 'multiplier', modifierValue: 3.0 },
}

const questConditionEffects: { name: string; desc: string; icon: string; rarity: typeof ALL_ITEMS[0]['rarity']; effect: SkillEffect }[] = [
  { name: 'High Stakes', desc: 'Quest volume exceeds 300K. Payouts amplified.', icon: 'Flame', rarity: 'rare', effect: effectLib.highVol! },
  { name: 'Slow Burner', desc: 'Long resolution horizon. Patience rewarded.', icon: 'Clock', rarity: 'uncommon', effect: effectLib.slowBurn! },
  { name: 'Mirror Realm', desc: 'This quest may invert on resolution.', icon: 'GitFork', rarity: 'mythic', effect: effectLib.mirrorRealm! },
  { name: 'Double Down', desc: 'Squared payouts, doubled risk.', icon: 'Dices', rarity: 'mythic', effect: effectLib.doubleDown! },
  { name: 'Trending', desc: 'High engagement. Odds shift rapidly.', icon: 'TrendingUp', rarity: 'common', effect: effectLib.trending! },
  { name: 'Underdog', desc: 'Massive payout on the long-shot side.', icon: 'Trophy', rarity: 'rare', effect: effectLib.underdog! },
]

function buildQuestEffects(quest: Omit<Quest, 'effects' | 'rarityDensity'>): QuestEffect[] {
  const effects: QuestEffect[] = []
  let condIdx: number
  if (quest.volume > 400000) condIdx = 0
  else if (quest.closesIn.includes('2029')) condIdx = 1
  else if (quest.engagement > 80) condIdx = 4
  else if (Math.abs(quest.yesProbability - 50) > 40) condIdx = 5
  else condIdx = faker.number.int({ min: 0, max: 5 })
  const cond = questConditionEffects[condIdx]!
  effects.push({ id: `qef-${quest.id}-cond`, name: cond.name, description: cond.desc, icon: cond.icon, rarity: cond.rarity, effect: cond.effect, source: 'quest-condition' })

  const linkedHeroes = HEROES.filter(h => quest.heroes.includes(h.id))
  for (const hero of linkedHeroes) {
    const heroItem = hero.equippedItems[0]
    if (!heroItem) continue
    const ue = heroItem.uniqueEffect
    if (!ue) continue
    effects.push({
      id: `qef-${quest.id}-${hero.id}`,
      name: heroItem.name,
      description: `From ${hero.name}: ${ue.description}`,
      icon: heroItem.icon,
      rarity: heroItem.rarity,
      effect: { id: ue.id, name: ue.name, description: ue.description, modifierType: 'multiplier', modifierValue: ue.mechanicValue },
      source: 'hero-item',
      heroId: hero.id,
    })
  }
  return effects
}

function calcRarityDensity(effects: QuestEffect[]): number {
  const weights: Record<string, number> = { common: 8, uncommon: 15, rare: 25, mythic: 60 }
  let total = 0
  for (const e of effects) total += weights[e.rarity] ?? 8
  return clamp(Math.round(total / effects.length), 5, 95)
}

// ══════════════════════════════════════════════
//  QUESTS
// ══════════════════════════════════════════════

function generatePriceHistory(initialYes: number, points: number): { time: string; yesPrice: number }[] {
  let price = initialYes / 100
  const history: { time: string; yesPrice: number }[] = []
  const now = new Date()
  for (let i = points; i >= 0; i--) {
    const dr = (0.5 - price) * 0.03 + (faker.number.float({ min: -0.04, max: 0.04, fractionDigits: 3 }))
    price = clamp(price + dr, 0.01, 0.99)
    const d = new Date(now.getTime() - i * 3600000)
    history.push({ time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), yesPrice: Math.round(price * 100) })
  }
  return history
}

const _questDefs: Omit<Quest, 'effects' | 'rarityDensity'>[] = [
  { id: 'q1', question: 'Will Bitcoin exceed $150,000 by December 31, 2026?', description: 'BTC hit ATH in 2024. With ETF inflows, halving effects, and institutional adoption — can it reach $150K?', category: 'CRYPTO', yesProbability: 42, noProbability: 58, volume: 245000, engagement: 72, closesIn: 'Dec 31, 2026', status: 'OPEN', heroes: ['elon', 'satoshi'], lootTable: [{ item: item('item-charm'), chance: 0.15 }, { item: item('item-scroll'), chance: 0.35 }], priceHistory: generatePriceHistory(42, 8) },
  { id: 'q2', question: 'Will Donald Trump serve a full term as 47th President?', description: 'Will the 47th President complete the full 4-year term without impeachment, resignation, or removal?', category: 'POLITICS', yesProbability: 68, noProbability: 32, volume: 890000, engagement: 94, closesIn: 'Jan 20, 2029', status: 'OPEN', heroes: ['trump', 'putin'], lootTable: [{ item: item('item-gauntlet'), chance: 0.10 }, { item: item('item-fist'), chance: 0.25 }], priceHistory: generatePriceHistory(68, 8) },
  { id: 'q3', question: 'Will OpenAI release GPT-6 by end of 2026?', description: 'GPT-5 shipped mid-2025. OpenAI is on an aggressive release cadence. Can they ship the next generation?', category: 'TECH', yesProbability: 35, noProbability: 65, volume: 178000, engagement: 68, closesIn: 'Dec 31, 2026', status: 'OPEN', heroes: ['altman', 'zuck'], lootTable: [{ item: item('item-chip'), chance: 0.08 }, { item: item('item-scroll'), chance: 0.30 }], priceHistory: generatePriceHistory(35, 8) },
  { id: 'q4', question: 'Will the Kansas City Chiefs win Super Bowl LXI?', description: 'Mahomes chasing Brady\'s ring count. Chiefs dynasty or new contender emerges?', category: 'SPORTS', yesProbability: 22, noProbability: 78, volume: 420000, engagement: 85, closesIn: 'Feb 14, 2027', status: 'OPEN', heroes: ['swift'], lootTable: [{ item: item('item-watch'), chance: 0.20 }, { item: item('item-charm'), chance: 0.15 }], priceHistory: generatePriceHistory(22, 8) },
  { id: 'q5', question: 'Will Taylor Swift release a new album in 2026?', description: 'Taylor has released 5 albums since 2020. Can she keep up the pace?', category: 'CULTURE', yesProbability: 72, noProbability: 28, volume: 560000, engagement: 91, closesIn: 'Dec 31, 2026', status: 'OPEN', heroes: ['swift', 'beyonce'], lootTable: [{ item: item('item-pendant'), chance: 0.12 }, { item: item('item-mic'), chance: 0.06 }], priceHistory: generatePriceHistory(72, 8) },
  { id: 'q6', question: 'Will the Fed cut interest rates below 3% by end of 2026?', description: 'After aggressive hiking, the Fed has been gradually cutting. Will they reach sub-3%?', category: 'CRYPTO', yesProbability: 48, noProbability: 52, volume: 310000, engagement: 76, closesIn: 'Dec 31, 2026', status: 'OPEN', heroes: ['buffett', 'altman'], lootTable: [{ item: item('item-ledger'), chance: 0.10 }, { item: item('item-compass'), chance: 0.20 }], priceHistory: generatePriceHistory(48, 8) },
  { id: 'q7', question: 'Will Tesla stock reach $500 per share by end of 2026?', description: 'Tesla has been volatile. Robotaxis, Optimus bots, Cybertruck ramp.', category: 'TECH', yesProbability: 28, noProbability: 72, volume: 195000, engagement: 63, closesIn: 'Dec 31, 2026', status: 'OPEN', heroes: ['elon'], lootTable: [{ item: item('item-visor'), chance: 0.05 }, { item: item('item-harpoon'), chance: 0.18 }], priceHistory: generatePriceHistory(28, 8) },
  { id: 'q8', question: 'Will Russia and Ukraine sign a ceasefire agreement in 2026?', description: 'The war continues into its 4th year. International pressure mounts.', category: 'POLITICS', yesProbability: 38, noProbability: 62, volume: 670000, engagement: 88, closesIn: 'Dec 31, 2026', status: 'OPEN', heroes: ['putin', 'trump'], lootTable: [{ item: item('item-crown'), chance: 0.08 }, { item: item('item-compass'), chance: 0.22 }], priceHistory: generatePriceHistory(38, 8) },
  { id: 'q9', question: 'Will Beyonce win Album of the Year at the 2027 Grammys?', description: 'Beyonce finally won AOTY in 2025. Can she go back-to-back?', category: 'CULTURE', yesProbability: 55, noProbability: 45, volume: 89000, engagement: 55, closesIn: 'Feb 2027', status: 'OPEN', heroes: ['beyonce', 'swift'], lootTable: [{ item: item('item-mic'), chance: 0.07 }, { item: item('item-pendant'), chance: 0.14 }], priceHistory: generatePriceHistory(55, 8) },
  { id: 'q10', question: 'Will SpaceX successfully land humans on the Moon by end of 2026?', description: 'Artemis III is scheduled. SpaceX Starship is the lander. Can they stick the schedule?', category: 'TECH', yesProbability: 15, noProbability: 85, volume: 520000, engagement: 82, closesIn: 'Dec 31, 2026', status: 'OPEN', heroes: ['elon'], lootTable: [{ item: item('item-visor'), chance: 0.06 }, { item: item('item-harpoon'), chance: 0.16 }], priceHistory: generatePriceHistory(15, 8) },
  // New categories
  { id: 'q11', question: 'Will China and Taiwan reach a unification agreement by 2030?', description: 'Cross-strait tensions continue to escalate. Beijing has increased military pressure while Washington reaffirms support for Taiwan.', category: 'WORLD', yesProbability: 18, noProbability: 82, volume: 720000, engagement: 87, closesIn: 'Jan 1, 2030', status: 'OPEN', heroes: ['putin', 'trump'], lootTable: [{ item: item('item-crown'), chance: 0.10 }, { item: item('item-compass'), chance: 0.18 }], priceHistory: generatePriceHistory(18, 8) },
  { id: 'q12', question: 'Will the UN Security Council be reformed by end of 2027?', description: 'Calls for Security Council expansion intensify as Brazil, India, Japan, and Germany push for permanent seats.', category: 'WORLD', yesProbability: 22, noProbability: 78, volume: 98000, engagement: 45, closesIn: 'Dec 31, 2027', status: 'OPEN', heroes: ['greta', 'buffett'], lootTable: [{ item: item('item-scroll'), chance: 0.30 }, { item: item('item-compass'), chance: 0.12 }], priceHistory: generatePriceHistory(22, 8) },
  { id: 'q13', question: 'Will the S&P 500 close above 7,000 by end of 2026?', description: 'The S&P has rallied on AI optimism and rate cut hopes. Can it break through 7,000 by year end?', category: 'FINANCE', yesProbability: 58, noProbability: 42, volume: 480000, engagement: 79, closesIn: 'Dec 31, 2026', status: 'OPEN', heroes: ['buffett', 'altman'], lootTable: [{ item: item('item-ledger'), chance: 0.12 }, { item: item('item-fist'), chance: 0.20 }], priceHistory: generatePriceHistory(58, 8) },
  { id: 'q14', question: 'Will US national debt exceed $40 trillion in 2026?', description: 'US debt surpassed $35T in 2024. With rising interest payments and deficit spending, how fast does it climb?', category: 'FINANCE', yesProbability: 64, noProbability: 36, volume: 185000, engagement: 66, closesIn: 'Dec 31, 2026', status: 'OPEN', heroes: ['buffett', 'trump'], lootTable: [{ item: item('item-ledger'), chance: 0.15 }, { item: item('item-scroll'), chance: 0.25 }], priceHistory: generatePriceHistory(64, 8) },
  { id: 'q15', question: 'Will a private company achieve orbital human spaceflight in 2026?', description: 'Beyond SpaceX and Blue Origin — will a third private company put humans in orbit independently?', category: 'SCIENCE', yesProbability: 12, noProbability: 88, volume: 76000, engagement: 52, closesIn: 'Dec 31, 2026', status: 'OPEN', heroes: ['elon', 'altman'], lootTable: [{ item: item('item-visor'), chance: 0.08 }, { item: item('item-watch'), chance: 0.22 }], priceHistory: generatePriceHistory(12, 8) },
  { id: 'q16', question: 'Will CRISPR gene therapy receive FDA approval for a major disease by end of 2026?', description: 'CRISPR therapies are advancing rapidly. Sickle cell already approved — could cancer or heart disease be next?', category: 'SCIENCE', yesProbability: 45, noProbability: 55, volume: 132000, engagement: 58, closesIn: 'Dec 31, 2026', status: 'OPEN', heroes: ['greta', 'satoshi'], lootTable: [{ item: item('item-chip'), chance: 0.06 }, { item: item('item-scroll'), chance: 0.28 }], priceHistory: generatePriceHistory(45, 8) },
  { id: 'q17', question: 'Will any AI model pass the ARC-AGI benchmark by end of 2026?', description: 'The ARC-AGI benchmark tests abstract reasoning. No AI has cracked it yet. Will 2026 be the year?', category: 'AI', yesProbability: 31, noProbability: 69, volume: 290000, engagement: 81, closesIn: 'Dec 31, 2026', status: 'OPEN', heroes: ['altman', 'zuck'], lootTable: [{ item: item('item-chip'), chance: 0.10 }, { item: item('item-visor'), chance: 0.08 }], priceHistory: generatePriceHistory(31, 8) },
  { id: 'q18', question: 'Will the EU impose a $1B+ fine on a major AI company in 2026?', description: 'EU AI Act enforcement begins. Will regulators hit a tech giant with a billion-dollar penalty?', category: 'AI', yesProbability: 52, noProbability: 48, volume: 215000, engagement: 70, closesIn: 'Dec 31, 2026', status: 'OPEN', heroes: ['greta', 'altman'], lootTable: [{ item: item('item-gauntlet'), chance: 0.09 }, { item: item('item-compass'), chance: 0.16 }], priceHistory: generatePriceHistory(52, 8) },
  { id: 'q19', question: 'Will GTA VI sell 50 million copies in its first quarter?', description: 'Rockstar\'s GTA VI is the most anticipated game in history. Can it hit 50M units in Q1 after release?', category: 'GAMING', yesProbability: 38, noProbability: 62, volume: 350000, engagement: 83, closesIn: 'Mar 31, 2027', status: 'OPEN', heroes: ['swift', 'zuck'], lootTable: [{ item: item('item-mic'), chance: 0.07 }, { item: item('item-pendant'), chance: 0.14 }], priceHistory: generatePriceHistory(38, 8) },
  { id: 'q20', question: 'Will Nintendo Switch 2 launch before March 2027?', description: 'The Switch 2 has been teased for years. Nintendo confirmed it\'s coming — but when exactly?', category: 'GAMING', yesProbability: 82, noProbability: 18, volume: 280000, engagement: 75, closesIn: 'Feb 28, 2027', status: 'OPEN', heroes: ['zuck'], lootTable: [{ item: item('item-watch'), chance: 0.18 }, { item: item('item-charm'), chance: 0.12 }], priceHistory: generatePriceHistory(82, 8) },
  { id: 'q21', question: 'Will \'Avatar 4\' gross over $2 billion worldwide?', description: 'James Cameron\'s Avatar franchise has broken box office records twice. Can the 4th installment do it again?', category: 'ENTERTAINMENT', yesProbability: 41, noProbability: 59, volume: 165000, engagement: 64, closesIn: 'Dec 31, 2029', status: 'OPEN', heroes: ['beyonce', 'swift'], lootTable: [{ item: item('item-mic'), chance: 0.08 }, { item: item('item-pendant'), chance: 0.15 }], priceHistory: generatePriceHistory(41, 8) },
  { id: 'q22', question: 'Will Kendrick Lamar win a Grammy for Album of the Year in 2027?', description: 'Following the Drake beef and cultural dominance, can Kendrick secure the top Grammy prize?', category: 'ENTERTAINMENT', yesProbability: 66, noProbability: 34, volume: 142000, engagement: 71, closesIn: 'Feb 2027', status: 'OPEN', heroes: ['beyonce', 'swift'], lootTable: [{ item: item('item-pendant'), chance: 0.11 }, { item: item('item-charm'), chance: 0.19 }], priceHistory: generatePriceHistory(66, 8) },
]

// ══════════════════════════════════════════════
//  TIER VOTES, LEADERBOARD, COMMENTS, ACTIVITIES
// ══════════════════════════════════════════════

const VIRTUE_NAMES: VirtueName[] = ['wisdom', 'courage', 'prudence', 'skill', 'temperance', 'justice']
const FACTIONS: Faction[] = ['architects', 'wardens', 'legion', 'operatives', 'tribunal', 'monastics']
const FAKE_NAMES = [
  'OraKing', 'FateMaster', 'ShadowMind', 'ChronSeer', 'GlyphLord', 'StarWeaver',
  'AetherWolf', 'VoidHawk', 'NovaSage', 'RuneKnight', 'CypherFox', 'ZenithBlade',
  'PhantomEdge', 'StormWatcher', 'IronOracle', 'VoidWalker', 'CrystalSeer', 'FlameWarden',
  'SilverProphet', 'AstralHunter',
]
const YES_NO = ['YES' as const, 'NO' as const, 'YES' as const, 'NO' as const, 'YES' as const]
const CARD_IDS = ['card-wis1','card-wis2','card-wis3','card-cou1','card-cou2','card-cou3','card-pru1','card-pru2','card-pru3','card-skl1','card-skl2','card-skl3','card-tem1','card-tem2','card-tem3','card-jus1','card-jus2','card-jus3','card-sup1','card-sup2','card-sup3']
const ITEM_IDS = ['item-visor','item-crown','item-chip','item-mic','item-mask','item-badge','item-gauntlet','item-ledger','item-visor2','item-pendant','item-compass','item-harpoon','item-fist','item-watch','item-scroll','item-charm']

function randVirtues(seed: number): Virtues {
  const r = () => faker.number.int({ min: 3, max: 20 })
  return { wisdom: r(), courage: r(), prudence: r(), skill: r(), temperance: r(), justice: r() }
}

function generateTierVotes(questId: string, rd: number): TierVote[] {
  const tiers: { tier: TierVote['tier']; lockThreshold: number; options: [string, string, string, string] }[] = [
    { tier: 'shifting', lockThreshold: 15, options: ['Random Uncommon', 'A surprise uncommon item.', 'Base Loot Box', '1 common item + 50 MP.'] },
    { tier: 'refined', lockThreshold: 25, options: ['Guaranteed Uncommon + Card', '1 uncommon item + 1 common card.', 'Rare Loot Box', 'Chance at a rare item or card.'] },
    { tier: 'uncommon', lockThreshold: 40, options: ['Guaranteed Rare + Card', '1 rare item + 1 uncommon card.', '2 Loot Boxes + 100 MP', 'Quantity over quality.'] },
    { tier: 'rare', lockThreshold: 60, options: ['Guaranteed Epic + Card', '1 epic item + 1 exclusive rare card.', 'Mythic Loot Box + 200 MP', 'Low% chance at mythic.'] },
    { tier: 'mythic', lockThreshold: 85, options: ['Fateweaver\'s Lens', '+8 Wisdom, reveals 1 hidden effect.', 'Chronoclast Gauntlet', '+6 Skill, +15% on 24h predictions.'] },
  ]
  const thresholds = tiers.map(t => t.lockThreshold)

  return tiers.map((t, i) => {
    const nextThreshold = thresholds[i + 1] ?? Infinity
    const status: TierVote['status'] = rd < t.lockThreshold ? 'locked' : rd < nextThreshold ? 'active' : 'resolved'
    const isMythic = t.tier === 'mythic'
    const totalVotes = faker.number.int({ min: 200, max: 3000 })
    const a = faker.number.int({ min: 100, max: totalVotes - 50 })
    const b = totalVotes - a
    const opts: TierVoteOption[] = isMythic
      ? [
        { id: `${questId}-${t.tier}-a`, label: t.options[0], description: t.options[1], voteCount: a, statBonuses: { wisdom: 8 }, uniqueEffect: 'Reveals 1 hidden effect per quest.' },
        { id: `${questId}-${t.tier}-b`, label: t.options[2], description: t.options[3], voteCount: b, statBonuses: { skill: 6 }, uniqueEffect: '+15% payout on quests resolved within 24h.' },
        { id: `${questId}-${t.tier}-c`, label: 'Paradox Mantle', description: '+4 Courage, +4 Justice. Immune to outcome flips.', voteCount: faker.number.int({ min: 40, max: 200 }), statBonuses: { courage: 4, justice: 4 }, uniqueEffect: 'Immune to Mirror Realm and flip effects.' },
      ]
      : [
        { id: `${questId}-${t.tier}-a`, label: t.options[0], description: t.options[1], voteCount: a },
        { id: `${questId}-${t.tier}-b`, label: t.options[2], description: t.options[3], voteCount: b },
      ]
    const winning = opts[0]!.voteCount > opts[1]!.voteCount ? opts[0]!.id : opts[1]!.id
    return {
      tier: t.tier,
      status,
      options: opts,
      winningOption: status === 'resolved' ? winning : undefined,
      totalVotes,
      resolvedAt: status === 'resolved' ? faker.date.recent({ days: 3 }).toISOString() : undefined,
    }
  })
}

function generateQuestPlayers(questId: string): QuestPlayer[] {
  return Array.from({ length: 20 }, (_, i) => {
    const faction = FACTIONS[faker.number.int({ min: 0, max: 5 })]!
    return {
      id: `qp-${questId}-${i}`,
      username: FAKE_NAMES[i] ?? `Seeker${i}`,
      faction,
      wagerAmount: faker.number.int({ min: 50, max: 15000 }),
      wagerOutcome: YES_NO[faker.number.int({ min: 0, max: 4 })]!,
      virtues: randVirtues(i),
      equippedItems: faker.helpers.arrayElements(ITEM_IDS, faker.number.int({ min: 0, max: 3 })),
      deckSlots: Array.from({ length: 4 }, () => faker.datatype.boolean(0.5) ? faker.helpers.arrayElement(CARD_IDS) : null),
      wageredAt: faker.date.recent({ days: 5 }).toISOString(),
    }
  }).sort((a, b) => b.wagerAmount - a.wagerAmount)
}

function generateQuestComments(questId: string): QuestComment[] {
  const rootComments = Array.from({ length: 8 }, (_, i) => ({
    id: `qc-${questId}-${i}`,
    authorId: `u-${i}`,
    authorName: FAKE_NAMES[faker.number.int({ min: 0, max: 19 })]!,
    authorFaction: FACTIONS[faker.number.int({ min: 0, max: 5 })]!,
    text: faker.helpers.arrayElement([
      'This quest is way underpriced on YES. The fundamentals are strong.',
      'NO is the play here. Everyone is piling into YES blindly.',
      'Interesting odds movement. Watching for the breakout.',
      'My deck build gives me +15% on TECH quests. Easy pick.',
      'Followed Buffett on this one. The Oracle never misses.',
      'Too volatile for me. Waiting for more data.',
      'The rarity density is climbing — could unlock mythic tier soon.',
      'Put my entire stash on this. No risk, no reward.',
    ]),
    upvotes: faker.number.int({ min: 0, max: 80 }),
    downvotes: faker.number.int({ min: 0, max: 15 }),
    replies: [] as QuestComment[],
    createdAt: faker.date.recent({ days: 4 }).toISOString(),
  }))

  // Add replies to some
  for (let i = 0; i < rootComments.length; i++) {
    if (faker.datatype.boolean(0.5)) continue
    const rc = rootComments[i]!
    rc.replies = Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, (_, j) => ({
      id: `qc-${questId}-${i}-${j}`,
      authorId: `u-r${i}${j}`,
      authorName: FAKE_NAMES[faker.number.int({ min: 0, max: 19 })]!,
      authorFaction: FACTIONS[faker.number.int({ min: 0, max: 5 })]!,
      text: faker.helpers.arrayElement([
        'Agreed. The volume says everything.',
        'Disagree. You\'re ignoring the counter-signals.',
        'What cards are you running for this?',
        'Already in at 42%. Riding it to resolution.',
      ]),
      upvotes: faker.number.int({ min: 0, max: 30 }),
      downvotes: faker.number.int({ min: 0, max: 5 }),
      replies: [],
      createdAt: faker.date.recent({ days: 3 }).toISOString(),
    }))
  }

  return rootComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function generateQuestActivities(questId: string): QuestActivity[] {
  const activityTypes: QuestActivity['type'][] = ['wager', 'price_move', 'hero_action', 'effect_trigger', 'resolution']
  return Array.from({ length: 16 }, (_, i) => {
    const type = activityTypes[faker.number.int({ min: 0, max: 4 })]!
    const username = FAKE_NAMES[faker.number.int({ min: 0, max: 19 })]!
    const faction = FACTIONS[faker.number.int({ min: 0, max: 5 })]!
    const texts: Record<QuestActivity['type'], string[]> = {
      wager: [`${username} wagered ${faker.number.int({ min: 100, max: 5000 })} MP on YES at ${faker.number.int({ min: 25, max: 75 })}% odds.`, `${username} doubled down — another ${faker.number.int({ min: 200, max: 3000 })} MP on NO.`],
      price_move: ['YES surged from 35% → 42% in the last hour.', 'NO jumped 8 points after breaking news.', 'Volatility spike — both sides moving rapidly.'],
      hero_action: ['Elon Musk\'s Tech Visor activated — +20% bonus applied to all TECH wagers.', 'Warren Buffett\'s Oracle Ledger triggered — hold bonus active.'],
      effect_trigger: ['High Stakes condition triggered — payouts amplified.', 'Mirror Realm detected — odds may invert on resolution.'],
      resolution: ['Quest resolved YES — 847 wagerers won.', 'Quest resolved NO — majority took the L.'],
    }
    return {
      id: `qa-${questId}-${i}`,
      questId,
      type,
      text: faker.helpers.arrayElement(texts[type])!,
      username: type === 'wager' ? username : undefined,
      faction: type === 'wager' ? faction : undefined,
      amount: type === 'wager' ? faker.number.int({ min: 100, max: 5000 }) : undefined,
      createdAt: faker.date.recent({ days: 5 }).toISOString(),
    }
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export const QUESTS: Quest[] = _questDefs.map(q => {
  const effects = buildQuestEffects(q)
  const rd = calcRarityDensity(effects)
  const fateV = Math.round(q.volume * 0.6)
  const glyphV = Math.round(q.volume * 1.08)
  return {
    ...q,
    effects,
    rarityDensity: rd,
    fateVolume: fateV,
    glyphVolume: glyphV,
    tierVotes: generateTierVotes(q.id, rd),
    questPlayers: generateQuestPlayers(q.id),
    comments: generateQuestComments(q.id),
    activities: generateQuestActivities(q.id),
  }
})

// ══════════════════════════════════════════════
//  HERO POSTS — community feed
// ══════════════════════════════════════════════

function generateHeroPosts(heroId: string): HeroPost[] {
  const hero = HEROES.find(h => h.id === heroId)
  const heroName = hero?.name ?? 'This hero'
  return Array.from({ length: 12 }, (_, i) => {
    const linkedQuest = faker.datatype.boolean(0.4) ? QUESTS.find(q => q.heroes.includes(heroId))?.id : undefined
    const questQuestion = linkedQuest ? QUESTS.find(q => q.id === linkedQuest)?.question : undefined
    return {
      id: `hp-${heroId}-${i}`,
      heroId,
      authorName: FAKE_NAMES[faker.number.int({ min: 0, max: 19 })]!,
      authorFaction: FACTIONS[faker.number.int({ min: 0, max: 5 })]!,
      text: faker.helpers.arrayElement([
        `${heroName}'s market sense is unmatched. Been following since day one.`,
        `The synergy between ${heroName}'s virtues and my deck is insane. +25% on all TECH quests.`,
        `${heroName} just triggered another effect. This hero is a cheat code.`,
        `Swapped ${heroName} into my slot last week. Win rate went from 52% to 71%.`,
        `Anyone else stacking ${heroName} with Wisdom cards? The multiplier is broken.`,
        `${heroName}'s passive is slept on. People don't understand the math.`,
        `Just hit Master tier on Wisdom thanks to ${heroName}'s item bonus.`,
        `${heroName} + Prudence build is the safest bet in meyquest right now.`,
        `The hero effect triggered 3 times in one quest for me. RNG blessed.`,
        `${heroName} needs a nerf. Too dominant in the meta right now.`,
        `Finally unlocked ${heroName}'s slot type. Game changer for my setup.`,
        `Hot take: ${heroName} is still underrated despite being in so many quests.`,
      ]),
      upvotes: faker.number.int({ min: 0, max: 120 }),
      downvotes: faker.number.int({ min: 0, max: 15 }),
      createdAt: faker.date.recent({ days: 7 }).toISOString(),
      linkedQuestId: linkedQuest,
    }
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export const HERO_POSTS: Record<string, HeroPost[]> = Object.fromEntries(
  HEROES.map(h => [h.id, generateHeroPosts(h.id)])
)

// ══════════════════════════════════════════════
//  HERO LEADERBOARD — users following this hero
// ══════════════════════════════════════════════

function generateHeroLeaderboard(heroId: string): HeroLeaderboardPlayer[] {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `hlb-${heroId}-${i}`,
    username: FAKE_NAMES[faker.number.int({ min: 0, max: 19 })]!,
    faction: FACTIONS[faker.number.int({ min: 0, max: 5 })]!,
    totalWagered: faker.number.int({ min: 200, max: 25000 }),
    winRate: faker.number.int({ min: 35, max: 92 }),
    heroEquipped: faker.datatype.boolean(0.3),
    followedAt: faker.date.recent({ days: 30 }).toISOString(),
  })).sort((a, b) => b.totalWagered - a.totalWagered)
}

export const HERO_LEADERBOARDS: Record<string, HeroLeaderboardPlayer[]> = Object.fromEntries(
  HEROES.map(h => [h.id, generateHeroLeaderboard(h.id)])
)

// ══════════════════════════════════════════════
//  FACTION INFO — new superhero names
// ══════════════════════════════════════════════

export const FACTION_INFO: Record<Faction, { name: string; description: string; icon: string; color: string; heroIds: string[]; bonus: string; linkedVirtue: VirtueName }> = {
  architects: { name: 'The Architects', description: 'Masters of foresight and data. They see the future and build it.', icon: 'Eye', color: '#06b6d4', heroIds: ['altman', 'buffett', 'zuck'], bonus: '+10% payout on quests held >48h', linkedVirtue: 'wisdom' },
  wardens: { name: 'The Wardens', description: 'Guardians against chaos. Slow, steady, unbreakable.', icon: 'Shield', color: '#f59e0b', heroIds: ['greta'], bonus: '-10% loss on failed predictions', linkedVirtue: 'prudence' },
  legion: { name: 'The Legion', description: 'Relentless force of conviction. Go big or go home.', icon: 'Flame', color: '#ef4444', heroIds: ['elon', 'trump'], bonus: '+25% on bets >300 IP, -10% on bets <100 IP', linkedVirtue: 'courage' },
  operatives: { name: 'The Operatives', description: 'Precision specialists. Speed, timing, adaptability.', icon: 'Zap', color: '#10b981', heroIds: ['swift', 'satoshi'], bonus: '+5 IP per quest completed regardless of outcome', linkedVirtue: 'skill' },
  tribunal: { name: 'The Tribunal', description: 'Arbiters of fate. High stakes, absolute conviction.', icon: 'Scale', color: '#cbd5e1', heroIds: ['putin'], bonus: '+15% payout when betting against 70%+ consensus', linkedVirtue: 'justice' },
  monastics: { name: 'The Monastics', description: 'Disciplined observers. Patience is their weapon.', icon: 'Timer', color: '#8b5cf6', heroIds: ['beyonce'], bonus: '+15% payout on quests in your most-consistent category', linkedVirtue: 'temperance' },
}

// ══════════════════════════════════════════════
//  SKILL TREE — virtue-based
// ══════════════════════════════════════════════

export const DECK_CARDS: DeckCard[] = [
  // Wisdom cards
  { id: 'card-wis1', name: 'Deep Research', description: '+15% payout on quests with high rarity density.', virtue: 'wisdom', tier: 1, cardType: 'power', powerCost: 2, powerGrant: 0, sustainCost: 0, unlockCost: 2, prerequisites: [] },
  { id: 'card-wis2', name: 'Oracle Sight', description: 'Reveal trend direction before betting.', virtue: 'wisdom', tier: 1, cardType: 'power', powerCost: 2, powerGrant: 0, sustainCost: 0, unlockCost: 2, prerequisites: [] },
  { id: 'card-wis3', name: 'Signal Clarity', description: 'See quest rarity density before betting.', virtue: 'wisdom', tier: 2, cardType: 'sustained', powerCost: 4, powerGrant: 0, sustainCost: 1, unlockCost: 3, prerequisites: ['card-wis2'] },
  // Courage cards
  { id: 'card-cou1', name: 'Momentum Surge', description: 'Each consecutive correct prediction adds +5% payout.', virtue: 'courage', tier: 1, cardType: 'power', powerCost: 2, powerGrant: 0, sustainCost: 0, unlockCost: 2, prerequisites: [] },
  { id: 'card-cou2', name: 'Conviction Charge', description: '+20% payout on quests with rising YES probability.', virtue: 'courage', tier: 1, cardType: 'power', powerCost: 2, powerGrant: 0, sustainCost: 0, unlockCost: 2, prerequisites: [] },
  { id: 'card-cou3', name: 'Diamond Horns', description: '+35% payout on bets held over 72 hours.', virtue: 'courage', tier: 2, cardType: 'sustained', powerCost: 5, powerGrant: 0, sustainCost: 2, unlockCost: 3, prerequisites: ['card-cou1'] },
  // Prudence cards
  { id: 'card-pru1', name: 'Safety Net', description: 'Losing bets only cost 75% of stake.', virtue: 'prudence', tier: 1, cardType: 'power', powerCost: 2, powerGrant: 0, sustainCost: 0, unlockCost: 2, prerequisites: [] },
  { id: 'card-pru2', name: 'Bear Trap', description: '+20% payout when betting against 80%+ consensus.', virtue: 'prudence', tier: 1, cardType: 'power', powerCost: 2, powerGrant: 0, sustainCost: 0, unlockCost: 2, prerequisites: [] },
  { id: 'card-pru3', name: 'Hibernation', description: 'After 3 consecutive losses, next win pays 3x.', virtue: 'prudence', tier: 2, cardType: 'sustained', powerCost: 4, powerGrant: 0, sustainCost: 1, unlockCost: 3, prerequisites: ['card-pru1'] },
  // Skill cards
  { id: 'card-skl1', name: 'Quick Flip', description: '+15% payout on quests resolved within 24h.', virtue: 'skill', tier: 1, cardType: 'power', powerCost: 2, powerGrant: 0, sustainCost: 0, unlockCost: 2, prerequisites: [] },
  { id: 'card-skl2', name: 'Sly Maneuver', description: '10% chance to refund stake on a loss.', virtue: 'skill', tier: 1, cardType: 'power', powerCost: 2, powerGrant: 0, sustainCost: 0, unlockCost: 2, prerequisites: [] },
  { id: 'card-skl3', name: 'Frenzy', description: '+5% per active quest (stacks up to 5x).', virtue: 'skill', tier: 2, cardType: 'power', powerCost: 3, powerGrant: 0, sustainCost: 0, unlockCost: 3, prerequisites: ['card-skl1'] },
  // Temperance cards
  { id: 'card-tem1', name: 'Steady Flow', description: '+10% payout when placing same-size bets.', virtue: 'temperance', tier: 1, cardType: 'power', powerCost: 2, powerGrant: 0, sustainCost: 0, unlockCost: 2, prerequisites: [] },
  { id: 'card-tem2', name: 'Nest Egg', description: '+10 MP bonus on every completed quest.', virtue: 'temperance', tier: 1, cardType: 'support', powerCost: 0, powerGrant: 2, sustainCost: 0, unlockCost: 2, prerequisites: [] },
  { id: 'card-tem3', name: 'Peace Dividend', description: '+25% payout on quests in your lowest-risk category.', virtue: 'temperance', tier: 2, cardType: 'power', powerCost: 3, powerGrant: 0, sustainCost: 0, unlockCost: 3, prerequisites: ['card-tem1'] },
  // Justice cards
  { id: 'card-jus1', name: 'Balanced Portfolio', description: '+5% per unique category bet in last 7 days.', virtue: 'justice', tier: 1, cardType: 'power', powerCost: 2, powerGrant: 0, sustainCost: 0, unlockCost: 2, prerequisites: [] },
  { id: 'card-jus2', name: 'Nemesis', description: '+50% when correcting a past category loss.', virtue: 'justice', tier: 1, cardType: 'power', powerCost: 3, powerGrant: 0, sustainCost: 0, unlockCost: 2, prerequisites: [] },
  { id: 'card-jus3', name: 'Contrarian Edge', description: '+25% payout against 75%+ consensus.', virtue: 'justice', tier: 2, cardType: 'sustained', powerCost: 4, powerGrant: 0, sustainCost: 1, unlockCost: 3, prerequisites: ['card-jus1'] },
  // Bridge support cards
  { id: 'card-sup1', name: 'Wisdom Amplifier', description: '+3 to power budget. Linked to Wisdom.', virtue: 'wisdom', tier: 1, cardType: 'support', powerCost: 0, powerGrant: 3, sustainCost: 0, unlockCost: 2, prerequisites: [] },
  { id: 'card-sup2', name: 'Courage Catalyst', description: '+3 to power budget. Linked to Courage.', virtue: 'courage', tier: 1, cardType: 'support', powerCost: 0, powerGrant: 3, sustainCost: 0, unlockCost: 2, prerequisites: [] },
  { id: 'card-sup3', name: 'Flow State', description: '+4 to power budget. Universal support.', virtue: 'skill', tier: 1, cardType: 'support', powerCost: 0, powerGrant: 4, sustainCost: 1, unlockCost: 3, prerequisites: [] },
]

// ══════════════════════════════════════════════
//  BADGES — tiered chains (8 chains, 32 badges)
// ══════════════════════════════════════════════

function makeChain(id: string, name: string, category: Badge['category'], icon: string, tiers: [string, string, string, string], triggers: [string, string, string, string], triggerDescs: [string, string, string, string], initialProgress?: { val: number; max: number }, unlockTier?: number): Badge[] {
  const tierKeys: Badge['tier'][] = ['bronze', 'silver', 'gold', 'platinum']
  const badges: Badge[] = []
  for (let i = 0; i < 4; i++) {
    const tierId = `${id}-${tierKeys[i]}`
    const isUnlocked = unlockTier !== undefined && i <= unlockTier
    const isActive = unlockTier !== undefined && i === unlockTier + 1
    badges.push({
      id: tierId, chainId: id, name: `${name} ${['I', 'II', 'III', 'IV'][i]}: ${tiers[i]}`, description: triggers[i],
      icon, tier: tierKeys[i], tierIndex: i, category, unlocked: !!isUnlocked,
      progress: isActive ? initialProgress?.val : undefined, progressMax: isActive ? initialProgress?.max : undefined,
      triggerDescription: triggerDescs[i],
    })
  }
  return badges
}

export const ALL_BADGES: Badge[] = [
  ...makeChain('seer', 'Seer', 'VIRTUE', 'Eye', ['Initiate', 'Diviner', 'Clairvoyant', 'Omniscient'], ['Reach Wisdom 5', 'Reach Wisdom 10', 'Reach Wisdom 15', 'Reach Wisdom 20'], ['Reach Wisdom 5', 'Reach Wisdom 10', 'Reach Wisdom 15', 'Reach Wisdom 20'], { val: 11, max: 15 }, 1),
  ...makeChain('vanguard', 'Vanguard', 'VIRTUE', 'Swords', ['Recruit', 'Soldier', 'Champion', 'Warlord'], ['Reach Courage 5', 'Reach Courage 10', 'Reach Courage 15', 'Reach Courage 20'], ['Reach Courage 5', 'Reach Courage 10', 'Reach Courage 15', 'Reach Courage 20'], { val: 14, max: 15 }, 1),
  ...makeChain('sage', 'Sage', 'VIRTUE', 'Brain', ['Student', 'Scholar', 'Master', 'Grandmaster'], ['Reach Wisdom 5', 'Reach Wisdom 10', 'Reach Wisdom 15', 'Reach Wisdom 20'], ['Reach Wisdom 5', 'Reach Wisdom 10', 'Reach Wisdom 15', 'Reach Wisdom 20'], { val: 11, max: 15 }, 1),
  ...makeChain('disciple', 'Disciple', 'LOYALTY', 'Heart', ['Acolyte', 'Devotee', 'Zealot', 'Avatar'], ['10 bets with one hero', '25 bets with one hero', '50 bets with one hero', '100 bets with one hero'], ['Follow one hero for 10 bets', '25 bets', '50 bets', '100 bets'], { val: 1, max: 10 }, 0),
  ...makeChain('oracle', 'Oracle', 'MARKET', 'Flame', ['Lucky', 'Prescient', 'Prophet', 'Fateweaver'], ['Win 3 in a row', 'Win 5 in a row', 'Win 10 in a row', 'Win 20 in a row'], ['3-streak', '5-streak', '10-streak', '20-streak'], { val: 2, max: 3 }, 0),
  ...makeChain('collector', 'Collector', 'COLLECTION', 'Archive', ['Hoarder', 'Curator', 'Archivist', 'Grand Collector'], ['Own 5 items', 'Own 15 items', 'Own 30 items', 'Own 50 items'], ['5 unique items', '15 items', '30 items', '50 items'], { val: 2, max: 5 }, 0),
  ...makeChain('whale', 'Whale', 'MARKET', 'Wallet', ['Minnow', 'Shark', 'Leviathan', 'Kraken'], ['Earn 500 IP', 'Earn 2,000 IP', 'Earn 5,000 IP', 'Earn 20,000 IP'], ['500 IP earned', '2k IP', '5k IP', '20k IP'], { val: 461, max: 500 }, 0),
  ...makeChain('polymath', 'Polymath', 'MARKET', 'Compass', ['Dabbler', 'Explorer', 'Virtuoso', 'Renaissance'], ['5 categories in 30 days', '5 categories in 7 days', '5 categories in 24h', '5 categories in 5 bets'], ['5 cats in 30d', '5 cats in 7d', '5 cats in 24h', '5 consecutive'], undefined, 0),
]

export const BADGE_CHAINS: BadgeChain[] = [
  { id: 'seer', name: 'Seer', category: 'VIRTUE', description: 'Wisdom milestones — seeing beyond the surface.', icon: 'Eye', tiers: ALL_BADGES.filter(b => b.chainId === 'seer') as [Badge, Badge, Badge, Badge] },
  { id: 'vanguard', name: 'Vanguard', category: 'VIRTUE', description: 'Courage milestones — leading the charge.', icon: 'Swords', tiers: ALL_BADGES.filter(b => b.chainId === 'vanguard') as [Badge, Badge, Badge, Badge] },
  { id: 'sage', name: 'Sage', category: 'VIRTUE', description: 'Intelligence milestones — deeper understanding.', icon: 'Brain', tiers: ALL_BADGES.filter(b => b.chainId === 'sage') as [Badge, Badge, Badge, Badge] },
  { id: 'disciple', name: 'Disciple', category: 'LOYALTY', description: 'Follow one hero through many predictions.', icon: 'Heart', tiers: ALL_BADGES.filter(b => b.chainId === 'disciple') as [Badge, Badge, Badge, Badge] },
  { id: 'oracle', name: 'Oracle', category: 'MARKET', description: 'Consecutive prediction wins.', icon: 'Flame', tiers: ALL_BADGES.filter(b => b.chainId === 'oracle') as [Badge, Badge, Badge, Badge] },
  { id: 'collector', name: 'Collector', category: 'COLLECTION', description: 'Build an arsenal of items.', icon: 'Archive', tiers: ALL_BADGES.filter(b => b.chainId === 'collector') as [Badge, Badge, Badge, Badge] },
  { id: 'whale', name: 'Whale', category: 'MARKET', description: 'Lifetime Insight Points accumulated.', icon: 'Wallet', tiers: ALL_BADGES.filter(b => b.chainId === 'whale') as [Badge, Badge, Badge, Badge] },
  { id: 'polymath', name: 'Polymath', category: 'MARKET', description: 'Master every prediction category.', icon: 'Compass', tiers: ALL_BADGES.filter(b => b.chainId === 'polymath') as [Badge, Badge, Badge, Badge] },
]

// ══════════════════════════════════════════════
//  PLAYER
// ══════════════════════════════════════════════

const playerPredictions = [
  { id: 'p1', questId: 'q3', questQuestion: 'Will OpenAI release GPT-6 by end of 2026?', questCategory: 'TECH' as const, outcome: 'NO' as const, amount: 150, entryProbability: 62, yesProbabilityAtEntry: 35, noProbabilityAtEntry: 65, placedAt: '2026-06-28T14:30:00Z', result: 'PENDING' as const, payout: 0, netProfit: 0, equippedItems: [], virtueBonuses: [] },
  { id: 'p2', questId: 'q1', questQuestion: 'Will Bitcoin exceed $150,000 by December 31, 2026?', questCategory: 'CRYPTO' as const, outcome: 'YES' as const, amount: 100, entryProbability: 40, yesProbabilityAtEntry: 42, noProbabilityAtEntry: 58, placedAt: '2026-06-29T09:15:00Z', result: 'PENDING' as const, payout: 0, netProfit: 0, equippedItems: [], virtueBonuses: [] },
  { id: 'p3', questId: 'q5', questQuestion: 'Will Taylor Swift release a new album in 2026?', questCategory: 'CULTURE' as const, outcome: 'YES' as const, amount: 200, entryProbability: 68, yesProbabilityAtEntry: 72, noProbabilityAtEntry: 28, placedAt: '2026-06-30T11:00:00Z', resolvedAt: '2026-07-01T08:00:00Z', result: 'WON' as const, payout: 294, netProfit: 94, equippedItems: [{ slot: 'data' as SlotType, itemId: 'item-scroll', itemName: 'Scholar Scroll', itemIcon: 'Scroll', rarity: 'uncommon' as const, effectDescription: '+2 Wisdom, +1 Prudence' }], virtueBonuses: [{ virtue: 'wisdom' as VirtueName, virtueValue: 11, bonusDescription: '+11% payout (Wisdom Adept)', modifierType: 'multiplier' as const, modifierValue: 1.11 }] },
  { id: 'p4', questId: 'q8', questQuestion: 'Will Russia and Ukraine sign a ceasefire agreement in 2026?', questCategory: 'POLITICS' as const, outcome: 'NO' as const, amount: 80, entryProbability: 44, yesProbabilityAtEntry: 38, noProbabilityAtEntry: 62, placedAt: '2026-06-30T16:45:00Z', resolvedAt: '2026-07-01T12:00:00Z', result: 'LOST' as const, payout: 0, netProfit: -80, equippedItems: [], virtueBonuses: [] },
  { id: 'p5', questId: 'q4', questQuestion: 'Will the Kansas City Chiefs win Super Bowl LXI?', questCategory: 'SPORTS' as const, outcome: 'NO' as const, amount: 250, entryProbability: 78, yesProbabilityAtEntry: 22, noProbabilityAtEntry: 78, placedAt: '2026-07-01T08:00:00Z', result: 'PENDING' as const, payout: 0, netProfit: 0, equippedItems: [], virtueBonuses: [] },
  { id: 'p6', questId: 'q7', questQuestion: 'Will Tesla stock reach $500 per share by end of 2026?', questCategory: 'TECH' as const, outcome: 'NO' as const, amount: 120, entryProbability: 70, yesProbabilityAtEntry: 28, noProbabilityAtEntry: 72, placedAt: '2026-06-27T20:00:00Z', resolvedAt: '2026-06-29T18:00:00Z', result: 'WON' as const, payout: 171, netProfit: 51, heroFollowedId: 'elon', heroFollowedName: 'Elon Musk', heroFollowedAvatarUrl: '', heroFollowedTitle: 'The Technoking', heroFollowedFaction: 'legion' as Faction, equippedItems: [{ slot: 'vision' as SlotType, itemId: 'item-charm', itemName: 'Lucky Charm', itemIcon: 'Clover', rarity: 'uncommon' as const, effectDescription: '+2 Skill' }], virtueBonuses: [{ virtue: 'skill' as VirtueName, virtueValue: 15, bonusDescription: '+15% payout (Skill Master)', modifierType: 'multiplier' as const, modifierValue: 1.15 }] },
  { id: 'p7', questId: 'q6', questQuestion: 'Will the Fed cut interest rates below 3% by end of 2026?', questCategory: 'CRYPTO' as const, outcome: 'YES' as const, amount: 90, entryProbability: 46, yesProbabilityAtEntry: 48, noProbabilityAtEntry: 52, placedAt: '2026-06-25T13:20:00Z', resolvedAt: '2026-06-27T09:00:00Z', result: 'WON' as const, payout: 196, netProfit: 106, heroFollowedId: 'buffett', heroFollowedName: 'Warren Buffett', heroFollowedAvatarUrl: '', heroFollowedTitle: 'The Oracle of Omaha', heroFollowedFaction: 'architects' as Faction, equippedItems: [{ slot: 'capital' as SlotType, itemId: 'item-ledger', itemName: 'Oracle Ledger', itemIcon: 'Book', rarity: 'rare' as const, effectDescription: '+30% if held >48h' }], virtueBonuses: [{ virtue: 'prudence' as VirtueName, virtueValue: 9, bonusDescription: '+9% payout (Prudence Initiate)', modifierType: 'multiplier' as const, modifierValue: 1.09 }] },
  { id: 'p8', questId: 'q2', questQuestion: 'Will Donald Trump serve a full term as 47th President?', questCategory: 'POLITICS' as const, outcome: 'YES' as const, amount: 300, entryProbability: 65, yesProbabilityAtEntry: 68, noProbabilityAtEntry: 32, placedAt: '2026-06-28T07:30:00Z', result: 'PENDING' as const, payout: 0, netProfit: 0, equippedItems: [], virtueBonuses: [] },
]

export const PLAYER: Player = {
  id: 'player-1',
  username: 'GodEmperor',
  avatarUrl: '',
  level: 8,
  xp: 780,
  insightPoints: 1240,
  faction: 'operatives',
  virtues: { wisdom: 11, courage: 14, prudence: 9, skill: 15, temperance: 8, justice: 10 },
  virtueXP: { wisdom: 0, courage: 0, prudence: 0, skill: 0, temperance: 0, justice: 0 },
  badges: ALL_BADGES,
  inventory: [item('item-scroll'), item('item-charm'), item('item-visor')],
  equippedItems: { data: 'item-scroll', vision: 'item-charm' },
  followedHeroes: ['elon', 'buffett'],
  skillPoints: 3,
  unlockedCards: ['card-wis1', 'card-cou1', 'card-pru1', 'card-skl1'],
  deckSlots: ['card-wis1', 'card-cou1', null, null],
  maxDeckSlots: 4,
  predictions: playerPredictions,
  totalPredictions: playerPredictions.length,
  correctPredictions: playerPredictions.filter(p => p.result === 'WON').length,
  joinedAt: '2026-06-20T00:00:00Z',
  glyph: 1240,
  fate: 50,
  marketListings: [],
  mythicVotes: [],
  title: undefined,
  frame: undefined,
  nameColor: undefined,
  profileBackground: undefined,
  predictionFlair: undefined,
  avatarDecoration: undefined,
  badgeEffect: undefined,
  starterPackPurchased: false,
  status: 'active',
}

export const FAKE_PLAYERS: Player[] = Array.from({ length: 14 }, (_, i) => {
  const faction = ['architects','wardens','legion','operatives','tribunal','monastics'][i % 6] as Faction
  return {
    id: `fake-${i + 1}`,
    username: faker.person.firstName() + faker.person.lastName(),
    avatarUrl: '',
    level: faker.number.int({ min: 1, max: 20 }),
    xp: faker.number.int({ min: 100, max: 2000 }),
    insightPoints: faker.number.int({ min: 0, max: 5000 }),
    faction,
    virtues: { wisdom: faker.number.int({ min: 1, max: 20 }), courage: faker.number.int({ min: 1, max: 20 }), prudence: faker.number.int({ min: 1, max: 20 }), skill: faker.number.int({ min: 1, max: 20 }), temperance: faker.number.int({ min: 1, max: 20 }), justice: faker.number.int({ min: 1, max: 20 }) },
    virtueXP: { wisdom: 0, courage: 0, prudence: 0, skill: 0, temperance: 0, justice: 0 },
    badges: [],
    inventory: [],
    equippedItems: {},
    followedHeroes: [],
    skillPoints: faker.number.int({ min: 0, max: 10 }),
    unlockedCards: [],
    deckSlots: [null, null, null, null],
    maxDeckSlots: 4,
    predictions: [],
    totalPredictions: 0,
    correctPredictions: 0,
    joinedAt: faker.date.recent({ days: 30 }).toISOString(),
    glyph: faker.number.int({ min: 0, max: 10000 }),
    fate: faker.number.int({ min: 0, max: 500 }),
    marketListings: [],
    mythicVotes: [],
    status: Math.random() > 0.2 ? 'active' : 'banned',
  }
})

// ══════════════════════════════════════════════
//  STORE ITEMS
// ══════════════════════════════════════════════

export const STORE_ITEMS: StoreItem[] = [
  // Currency — Glyph packs (buy with $, get Glyph + bonus Fate)
  { id: 'currency-500', name: '500 Glyph', description: '500 Glyph. The foundation of every oracle.', category: 'currency', icon: 'Gem', rarity: 'uncommon', priceGlyph: 0, priceFate: 0, stock: 99, glyphAmount: 500, fateAmount: 5 },
  { id: 'currency-1100', name: '1,100 Glyph', description: '1,100 Glyph with a 10% bonus.', category: 'currency', icon: 'Gem', rarity: 'uncommon', priceGlyph: 0, priceFate: 0, stock: 99, glyphAmount: 1100, fateAmount: 10, bonusPercent: 10 },
  { id: 'currency-2500', name: '2,500 Glyph', description: '2,500 Glyph with a 25% bonus. The oracle\'s choice.', category: 'currency', icon: 'Gem', rarity: 'rare', priceGlyph: 0, priceFate: 0, stock: 99, glyphAmount: 2500, fateAmount: 20, bonusPercent: 25 },
  { id: 'currency-6500', name: '6,500 Glyph', description: '6,500 Glyph with a 30% bonus. The seer\'s reserve.', category: 'currency', icon: 'Gem', rarity: 'rare', priceGlyph: 0, priceFate: 0, stock: 99, glyphAmount: 6500, fateAmount: 50, bonusPercent: 30 },
  { id: 'currency-15000', name: '15,000 Glyph', description: '15,000 Glyph with a 50% bonus. For those who shape the market.', category: 'currency', icon: 'Gem', rarity: 'mythic', priceGlyph: 0, priceFate: 0, stock: 99, glyphAmount: 15000, fateAmount: 100, bonusPercent: 50 },

  // Starter Pack (one-time)
  { id: 'starter-pack', name: 'Starter Pack', description: '250 Glyph + exclusive "First Oracle" title. One-time purchase.', category: 'currency', icon: 'Gift', rarity: 'rare', priceGlyph: 0, priceFate: 0, stock: 1, glyphAmount: 250, fateAmount: 5, starterPack: true, packContents: { title: 'First Oracle' } },

  // ═══ Glyph Cosmetics (F2P) ═══

  // Titles
  { id: 'cos-title-initiate', name: 'Title: Oracle Initiate', description: 'Equip the "Oracle Initiate" title.', category: 'cosmetic', cosmeticType: 'title', icon: 'Star', rarity: 'uncommon', priceGlyph: 200, priceFate: 0, stock: 1 },
  { id: 'cos-title-seeker', name: 'Title: Seeker of Truth', description: 'Equip the "Seeker of Truth" title.', category: 'cosmetic', cosmeticType: 'title', icon: 'Star', rarity: 'uncommon', priceGlyph: 500, priceFate: 0, stock: 1 },
  { id: 'cos-title-glyphwalker', name: 'Title: Glyphwalker', description: 'Equip the "Glyphwalker" title.', category: 'cosmetic', cosmeticType: 'title', icon: 'Star', rarity: 'rare', priceGlyph: 1000, priceFate: 0, stock: 1 },

  // Frames
  { id: 'cos-frame-bronze', name: 'Frame: Bronze Ring', description: 'A bronze ring around your avatar.', category: 'cosmetic', cosmeticType: 'frame', icon: 'Frame', rarity: 'uncommon', priceGlyph: 300, priceFate: 0, stock: 1 },
  { id: 'cos-frame-silver', name: 'Frame: Silver Edge', description: 'A sleek silver border.', category: 'cosmetic', cosmeticType: 'frame', icon: 'Frame', rarity: 'rare', priceGlyph: 800, priceFate: 0, stock: 1 },

  // Name Colors
  { id: 'cos-color-sage', name: 'Name Color: Sage Green', description: 'Your username in tranquil sage green.', category: 'cosmetic', cosmeticType: 'nameColor', icon: 'Palette', rarity: 'uncommon', priceGlyph: 400, priceFate: 0, stock: 1 },
  { id: 'cos-color-arcane', name: 'Name Color: Arcane Blue', description: 'Your username in arcane blue.', category: 'cosmetic', cosmeticType: 'nameColor', icon: 'Palette', rarity: 'rare', priceGlyph: 600, priceFate: 0, stock: 1 },

  // Profile Backgrounds
  { id: 'cos-bg-nexus', name: 'Background: Nexus Grid', description: 'A glowing hexagonal grid backdrop.', category: 'cosmetic', cosmeticType: 'profileBackground', icon: 'Grid3X3', rarity: 'uncommon', priceGlyph: 300, priceFate: 0, stock: 1 },
  { id: 'cos-bg-astral', name: 'Background: Astral Void', description: 'A deep cosmic void with scattered stars.', category: 'cosmetic', cosmeticType: 'profileBackground', icon: 'Sparkles', rarity: 'rare', priceGlyph: 600, priceFate: 0, stock: 1 },

  // Prediction Flairs
  { id: 'cos-flair-spark', name: 'Flair: Spark Trail', description: 'A trail of golden sparks on every prediction.', category: 'cosmetic', cosmeticType: 'predictionFlair', icon: 'Zap', rarity: 'uncommon', priceGlyph: 200, priceFate: 0, stock: 1 },
  { id: 'cos-flair-sigil', name: 'Flair: Sigil Flash', description: 'A sigil burns into view when you place a bet.', category: 'cosmetic', cosmeticType: 'predictionFlair', icon: 'Flame', rarity: 'rare', priceGlyph: 500, priceFate: 0, stock: 1 },

  // Avatar Decorations
  { id: 'cos-avatar-circlet', name: 'Decoration: Iron Circlet', description: 'A forged iron circlet crowns your avatar.', category: 'cosmetic', cosmeticType: 'avatarDecoration', icon: 'Crown', rarity: 'uncommon', priceGlyph: 250, priceFate: 0, stock: 1 },
  { id: 'cos-avatar-halo', name: 'Decoration: Glyph Halo', description: 'A golden glyph halo orbits your avatar.', category: 'cosmetic', cosmeticType: 'avatarDecoration', icon: 'Circle', rarity: 'rare', priceGlyph: 500, priceFate: 0, stock: 1 },

  // Badge Effects
  { id: 'cos-badge-pulse', name: 'Effect: Bronze Pulse', description: 'Your badges pulse with a warm bronze glow.', category: 'cosmetic', cosmeticType: 'badgeEffect', icon: 'Activity', rarity: 'uncommon', priceGlyph: 300, priceFate: 0, stock: 1 },
  { id: 'cos-badge-sheen', name: 'Effect: Silver Sheen', description: 'A liquid silver sheen ripples across your badges.', category: 'cosmetic', cosmeticType: 'badgeEffect', icon: 'Waves', rarity: 'rare', priceGlyph: 600, priceFate: 0, stock: 1 },

  // ═══ Fate Cosmetics (Premium) ═══

  // Titles
  { id: 'cos-title-prime', name: 'Title: Oracle Prime', description: 'Equip the "Oracle Prime" title. Premium exclusive.', category: 'cosmetic', cosmeticType: 'title', icon: 'Star', rarity: 'rare', priceGlyph: 0, priceFate: 200, stock: 1 },
  { id: 'cos-title-fateweaver', name: 'Title: Fateweaver', description: 'Equip the "Fateweaver" title. Premium exclusive.', category: 'cosmetic', cosmeticType: 'title', icon: 'Star', rarity: 'mythic', priceGlyph: 0, priceFate: 350, stock: 1 },
  { id: 'cos-title-harbinger', name: 'Title: Harbinger', description: 'Equip the "Harbinger" title. Premium exclusive.', category: 'cosmetic', cosmeticType: 'title', icon: 'Star', rarity: 'mythic', priceGlyph: 0, priceFate: 500, stock: 1 },

  // Frames
  { id: 'cos-frame-gold', name: 'Frame: Gold', description: 'A radiant golden border. Premium exclusive.', category: 'cosmetic', cosmeticType: 'frame', icon: 'Frame', rarity: 'rare', priceGlyph: 0, priceFate: 150, stock: 1 },
  { id: 'cos-frame-crimson', name: 'Frame: Crimson Halo', description: 'A glowing crimson halo. Premium exclusive.', category: 'cosmetic', cosmeticType: 'frame', icon: 'Frame', rarity: 'mythic', priceGlyph: 0, priceFate: 300, stock: 1 },

  // Name Colors
  { id: 'cos-color-crimson', name: 'Name Color: Crimson Glow', description: 'Your username glows crimson. Premium exclusive.', category: 'cosmetic', cosmeticType: 'nameColor', icon: 'Palette', rarity: 'rare', priceGlyph: 0, priceFate: 200, stock: 1 },
  { id: 'cos-color-solar', name: 'Name Color: Solar Gold', description: 'Your username burns solar gold. Premium exclusive.', category: 'cosmetic', cosmeticType: 'nameColor', icon: 'Palette', rarity: 'mythic', priceGlyph: 0, priceFate: 400, stock: 1 },

  // Profile Backgrounds
  { id: 'cos-bg-throne', name: 'Background: Crimson Throne', description: 'A throne chamber bathed in crimson light.', category: 'cosmetic', cosmeticType: 'profileBackground', icon: 'Crown', rarity: 'rare', priceGlyph: 0, priceFate: 200, stock: 1 },
  { id: 'cos-bg-sanctum', name: 'Background: Oracle Sanctum', description: 'A sacred chamber of prophecy and fate.', category: 'cosmetic', cosmeticType: 'profileBackground', icon: 'Temple', rarity: 'mythic', priceGlyph: 0, priceFate: 400, stock: 1 },

  // Prediction Flairs
  { id: 'cos-flair-phoenix', name: 'Flair: Phoenix Flame', description: 'A phoenix erupts in flame on every prediction.', category: 'cosmetic', cosmeticType: 'predictionFlair', icon: 'Flame', rarity: 'rare', priceGlyph: 0, priceFate: 250, stock: 1 },
  { id: 'cos-flair-shadow', name: 'Flair: Shadow Tendril', description: 'Dark tendrils coil around your prediction.', category: 'cosmetic', cosmeticType: 'predictionFlair', icon: 'Waves', rarity: 'mythic', priceGlyph: 0, priceFate: 400, stock: 1 },

  // Avatar Decorations
  { id: 'cos-avatar-crown', name: 'Decoration: Crown of Fate', description: 'A crown of woven fate-threads adorns your avatar.', category: 'cosmetic', cosmeticType: 'avatarDecoration', icon: 'Crown', rarity: 'rare', priceGlyph: 0, priceFate: 200, stock: 1 },
  { id: 'cos-avatar-corona', name: 'Decoration: Crimson Corona', description: 'A burning crimson corona surrounds your avatar.', category: 'cosmetic', cosmeticType: 'avatarDecoration', icon: 'Sun', rarity: 'mythic', priceGlyph: 0, priceFate: 350, stock: 1 },

  // Badge Effects
  { id: 'cos-badge-radiance', name: 'Effect: Gold Radiance', description: 'Your badges emit a warm golden radiance.', category: 'cosmetic', cosmeticType: 'badgeEffect', icon: 'Sun', rarity: 'rare', priceGlyph: 0, priceFate: 250, stock: 1 },
  { id: 'cos-badge-aurora', name: 'Effect: Mythic Aurora', description: 'A shifting aurora dances across your badges.', category: 'cosmetic', cosmeticType: 'badgeEffect', icon: 'Waves', rarity: 'mythic', priceGlyph: 0, priceFate: 400, stock: 1 },

  // ═══ Fate Cosmetic Bundles ═══

  { id: 'pack-regalia', name: 'Oracle\'s Regalia', description: 'Oracle Prime title + Gold frame + Crimson Glow name color. Save 50 Fate.', category: 'cosmetic', icon: 'Package', rarity: 'rare', priceGlyph: 0, priceFate: 500, stock: 1, pack: true, packContents: { title: 'Oracle Prime', frame: 'Gold', nameColor: 'Crimson Glow' } },
  { id: 'pack-ensemble', name: 'Fateweaver\'s Ensemble', description: 'Fateweaver title + Crimson Halo frame + Solar Gold name color. Save 150 Fate.', category: 'cosmetic', icon: 'Package', rarity: 'mythic', priceGlyph: 0, priceFate: 900, stock: 1, pack: true, packContents: { title: 'Fateweaver', frame: 'Crimson Halo', nameColor: 'Solar Gold' } },
  { id: 'pack-shadow', name: 'Shadow Council Pack', description: 'Harbinger title + Crimson Halo frame + Crimson Glow name color. Save 200 Fate.', category: 'cosmetic', icon: 'Package', rarity: 'mythic', priceGlyph: 0, priceFate: 800, stock: 1, pack: true, packContents: { title: 'Harbinger', frame: 'Crimson Halo', nameColor: 'Crimson Glow' } },

  // ═══ Glyph Cosmetic Bundles ═══

  { id: 'pack-initiate', name: 'Initiate\'s Bundle', description: 'Oracle Initiate title + Bronze Ring frame. Save 100 Glyph.', category: 'cosmetic', icon: 'Package', rarity: 'uncommon', priceGlyph: 400, priceFate: 0, stock: 1, pack: true, packContents: { title: 'Oracle Initiate', frame: 'Bronze Ring' } },
  { id: 'pack-seeker', name: 'Seeker\'s Kit', description: 'Seeker of Truth title + Silver Edge frame + Sage Green name color. Save 700 Glyph.', category: 'cosmetic', icon: 'Package', rarity: 'rare', priceGlyph: 1200, priceFate: 0, stock: 1, pack: true, packContents: { title: 'Seeker of Truth', frame: 'Silver Edge', nameColor: 'Sage Green' } },
  { id: 'pack-glyphwalker', name: 'Glyphwalker\'s Regalia', description: 'Glyphwalker title + Silver Edge frame + Arcane Blue name color. Save 600 Glyph.', category: 'cosmetic', icon: 'Package', rarity: 'rare', priceGlyph: 1800, priceFate: 0, stock: 1, pack: true, packContents: { title: 'Glyphwalker', frame: 'Silver Edge', nameColor: 'Arcane Blue' } },
]

// ══════════════════════════════════════════════
//  MARKET LISTINGS (fake sellers)
// ══════════════════════════════════════════════

const FAKE_SELLERS = [
  { id: 's1', name: 'OraKing', faction: 'architects' as Faction },
  { id: 's2', name: 'FateMaster', faction: 'tribunal' as Faction },
  { id: 's3', name: 'ShadowMind', faction: 'operatives' as Faction },
  { id: 's4', name: 'ChronSeer', faction: 'wardens' as Faction },
  { id: 's5', name: 'GlyphLord', faction: 'legion' as Faction },
  { id: 's6', name: 'StarWeaver', faction: 'monastics' as Faction },
]

export const MARKET_LISTINGS: MarketListing[] = [
  { id: 'ml1', sellerId: 's1', sellerName: 'OraKing', sellerFaction: 'architects', itemId: 'item-visor', itemName: 'Tech Visor', itemRarity: 'mythic', itemType: 'item', slotType: 'vision', listingType: 'WTS', price: 850, currency: 'glyph', listedAt: '2026-07-01T08:00:00Z' },
  { id: 'ml2', sellerId: 's2', sellerName: 'FateMaster', sellerFaction: 'tribunal', itemId: 'item-crown', itemName: 'Crown of Conviction', itemRarity: 'mythic', itemType: 'item', slotType: 'narrative', listingType: 'WTS', price: 1200, currency: 'glyph', listedAt: '2026-07-01T10:00:00Z' },
  { id: 'ml3', sellerId: 's3', sellerName: 'ShadowMind', sellerFaction: 'operatives', itemId: 'item-mask', itemName: 'Phantom Mask', itemRarity: 'mythic', itemType: 'item', slotType: 'data', listingType: 'WTS', price: 500, currency: 'fate', listedAt: '2026-07-01T12:00:00Z' },
  { id: 'ml4', sellerId: 's4', sellerName: 'ChronSeer', sellerFaction: 'wardens', itemId: 'item-badge', itemName: 'Rebel Badge', itemRarity: 'rare', itemType: 'item', slotType: 'anomaly', listingType: 'WTS', price: 300, currency: 'glyph', listedAt: '2026-07-01T14:00:00Z' },
  { id: 'ml5', sellerId: 's5', sellerName: 'GlyphLord', sellerFaction: 'legion', itemId: 'item-ledger', itemName: 'Oracle Ledger', itemRarity: 'rare', itemType: 'item', slotType: 'capital', listingType: 'WTS', price: 400, currency: 'glyph', listedAt: '2026-07-01T16:00:00Z' },
  { id: 'ml6', sellerId: 's1', sellerName: 'OraKing', sellerFaction: 'architects', itemId: 'item-chip', itemName: 'Neural Chip', itemRarity: 'mythic', itemType: 'item', slotType: 'algorithm', listingType: 'WTS', price: 750, currency: 'glyph', listedAt: '2026-07-02T08:00:00Z' },
  { id: 'ml7', sellerId: 's6', sellerName: 'StarWeaver', sellerFaction: 'monastics', itemId: 'item-pendant', itemName: 'Harmony Pendant', itemRarity: 'rare', itemType: 'item', slotType: 'resonance', listingType: 'WTS', price: 250, currency: 'glyph', listedAt: '2026-07-02T09:00:00Z' },
  { id: 'ml8', sellerId: 's2', sellerName: 'FateMaster', sellerFaction: 'tribunal', itemId: 'item-mic', itemName: 'Golden Microphone', itemRarity: 'mythic', itemType: 'item', slotType: 'resonance', listingType: 'WTS', price: 900, currency: 'glyph', listedAt: '2026-07-02T10:00:00Z' },
  // Card listings
  { id: 'ml9', sellerId: 's3', sellerName: 'ShadowMind', sellerFaction: 'operatives', itemId: 'card-wis3', itemName: 'Signal Clarity', itemRarity: 'rare', itemType: 'card', virtue: 'wisdom', listingType: 'WTS', price: 200, currency: 'glyph', listedAt: '2026-07-02T11:00:00Z' },
  { id: 'ml10', sellerId: 's4', sellerName: 'ChronSeer', sellerFaction: 'wardens', itemId: 'card-cou3', itemName: 'Diamond Horns', itemRarity: 'rare', itemType: 'card', virtue: 'courage', listingType: 'WTS', price: 250, currency: 'glyph', listedAt: '2026-07-02T12:00:00Z' },
  { id: 'ml11', sellerId: 's5', sellerName: 'GlyphLord', sellerFaction: 'legion', itemId: 'card-sup2', itemName: 'Courage Catalyst', itemRarity: 'rare', itemType: 'card', virtue: 'courage', listingType: 'WTS', price: 180, currency: 'fate', listedAt: '2026-07-02T13:00:00Z' },
  { id: 'ml12', sellerId: 's1', sellerName: 'OraKing', sellerFaction: 'architects', itemId: 'card-jus3', itemName: 'Contrarian Edge', itemRarity: 'rare', itemType: 'card', virtue: 'justice', listingType: 'WTS', price: 300, currency: 'glyph', listedAt: '2026-07-02T14:00:00Z' },
  // WTB listings
  { id: 'mlb1', sellerId: 's6', sellerName: 'StarWeaver', sellerFaction: 'monastics', itemId: 'item-compass', itemName: 'Contrarian Compass', itemRarity: 'rare', itemType: 'item', slotType: 'anomaly', listingType: 'WTB', price: 200, currency: 'glyph', listedAt: '2026-07-02T08:00:00Z' },
  { id: 'mlb2', sellerId: 's2', sellerName: 'FateMaster', sellerFaction: 'tribunal', itemId: 'card-sup3', itemName: 'Flow State', itemRarity: 'rare', itemType: 'card', virtue: 'skill', listingType: 'WTB', price: 100, currency: 'fate', listedAt: '2026-07-02T09:00:00Z' },
  { id: 'mlb3', sellerId: 's5', sellerName: 'GlyphLord', sellerFaction: 'legion', itemId: 'item-harpoon', itemName: 'Whale Harpoon', itemRarity: 'rare', itemType: 'item', slotType: 'capital', listingType: 'WTB', price: 300, currency: 'glyph', listedAt: '2026-07-02T15:00:00Z' },
]

// ══════════════════════════════════════════════
//  EXCHANGE — Glyph <-> Fate order book
// ══════════════════════════════════════════════

const BASE_RATE = 1.05

export const EXCHANGE_ORDERS: ExchangeOrder[] = [
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `ex-bid-${i}`, userId: 'system', userName: faker.person.firstName(), userFaction: ['architects','wardens','legion','operatives','tribunal','monastics'][i % 6] as Faction,
    side: 'BUY_GLYPH' as const, rate: +(BASE_RATE - (0.01 + i * 0.005)).toFixed(4), amount: faker.number.int({ min: 50, max: 500 }),
    total: 0, filled: 0, status: 'OPEN' as const, createdAt: faker.date.recent({ days: 1 }).toISOString(),
  })).map(o => ({ ...o, total: +(o.amount * o.rate).toFixed(2) })),
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `ex-ask-${i}`, userId: 'system', userName: faker.person.firstName(), userFaction: ['architects','wardens','legion','operatives','tribunal','monastics'][(i + 3) % 6] as Faction,
    side: 'SELL_GLYPH' as const, rate: +(BASE_RATE + (0.01 + i * 0.005)).toFixed(4), amount: faker.number.int({ min: 50, max: 500 }),
    total: 0, filled: 0, status: 'OPEN' as const, createdAt: faker.date.recent({ days: 1 }).toISOString(),
  })).map(o => ({ ...o, total: +(o.amount * o.rate).toFixed(2) })),
].sort((a, b) => b.rate - a.rate)

export const PRICE_HISTORY: { time: number; value: number }[] = Array.from({ length: 96 }, (_, i) => {
  const now = Math.floor(Date.now() / 1000)
  const t = now - (95 - i) * 900
  const randomWalk = (i > 0 ? 0 : BASE_RATE) + (Math.sin(i * 0.1) * 0.03) + (Math.random() - 0.5) * 0.01
  return { time: t - t % 900, value: +(BASE_RATE + Math.sin(i * 0.08) * 0.04 + randomWalk * 0.01).toFixed(4) }
})

export const EXCHANGE_TRADES: ExchangeTick[] = Array.from({ length: 20 }, (_, i) => ({
  id: `trade-${i}`,
  rate: +(BASE_RATE + (Math.random() - 0.5) * 0.04).toFixed(4),
  amount: faker.number.int({ min: 10, max: 300 }),
  side: Math.random() > 0.5 ? 'BUY' as const : 'SELL' as const,
  timestamp: faker.date.recent({ days: 1 }).toISOString(),
})).sort((a, b) => b.timestamp.localeCompare(a.timestamp))
