import { useNavigate } from 'react-router-dom'
import { Lock, Check, ArrowLeft } from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import { SKILL_TREE, FACTION_INFO } from '@/data/mock'
import { Card } from '@/components/ui/ui'
import type { Faction } from '@/types'

const STYLES: Record<Faction, { glow: string; bg: string; border: string }> = {
  BULLS: { glow: 'rgba(34,197,94,0.3)', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.4)' },
  BEARS: { glow: 'rgba(239,68,68,0.3)', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.4)' },
  OWLS: { glow: 'rgba(59,130,246,0.3)', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.4)' },
  FOXES: { glow: 'rgba(245,158,11,0.3)', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.4)' },
  HAWKS: { glow: 'rgba(139,92,246,0.3)', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.4)' },
  DOVES: { glow: 'rgba(6,182,212,0.3)', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.4)' },
}

export function SkillTreePage() {
  const player = useGameStore(s => s.player)
  const unlockSkill = useGameStore(s => s.unlockSkill)
  const navigate = useNavigate()
  const factionInfo = FACTION_INFO[player.faction]
  const style = STYLES[player.faction]

  const factionSkills = SKILL_TREE.filter(s => s.faction === player.faction)
  const unlocked = new Set(player.unlockedSkills)

  // Draw connection lines between prerequisite nodes
  const connectionLines = factionSkills
    .filter(s => s.prerequisites.length > 0)
    .flatMap(s => s.prerequisites.map(p => {
      const parent = SKILL_TREE.find(n => n.id === p)
      if (!parent) return null
      return {
        key: `${parent.id}-${s.id}`,
        x1: parent.position.x, y1: parent.position.y + 24,
        x2: s.position.x, y2: s.position.y - 24,
      }
    }))
    .filter(Boolean)

  const minX = Math.min(...factionSkills.map(s => s.position.x)) - 30
  const minY = Math.min(...factionSkills.map(s => s.position.y)) - 20
  const maxX = Math.max(...factionSkills.map(s => s.position.x)) + 30
  const maxY = Math.max(...factionSkills.map(s => s.position.y)) + 30
  const viewW = maxX - minX
  const viewH = maxY - minY

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-surface-50/50 hover:text-crimson-400 transition-colors">
            <ArrowLeft size={16} /><span className="text-sm">Back to Profile</span>
          </button>
          <h2 className="text-3xl font-bold text-crimson-300 mt-2" style={{ fontFamily: 'Cinzel, serif' }}>Skill Tree</h2>
          <p className="text-surface-50/50 mt-1">{factionInfo.name} faction — {player.skillPoints} skill points available</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-surface-50/40">{player.unlockedSkills.length} / {factionSkills.length} unlocked</p>
        </div>
      </div>

      <Card>
        <div className="relative" style={{ width: viewW, height: viewH, margin: '0 auto' }}>
          {/* Connections */}
          <svg className="absolute inset-0 pointer-events-none" style={{ width: viewW, height: viewH }}>
            {connectionLines.map(line => {
              if (!line) return null
              const bothUnlocked = unlocked.has(line.key!.split('-')[0]!) && unlocked.has(line.key!.split('-')[1]!)
              return (
                <line
                  key={line.key}
                  x1={line.x1! - minX} y1={line.y1! - minY}
                  x2={line.x2! - minX} y2={line.y2! - minY}
                  stroke={bothUnlocked ? style.glow.split('(')[1]?.split(',')[0] ?? '#fff' : '#333'}
                  strokeWidth={bothUnlocked ? 2 : 1}
                  opacity={bothUnlocked ? 0.6 : 0.2}
                  strokeDasharray={bothUnlocked ? '' : '4 4'}
                />
              )
            })}
          </svg>

          {/* Nodes */}
          {factionSkills.map(skill => {
            const isUnlocked = unlocked.has(skill.id)
            const canUnlock = !isUnlocked
              && player.skillPoints >= skill.cost
              && skill.prerequisites.every(p => unlocked.has(p))
              && skill.faction === player.faction
            return (
              <div
                key={skill.id}
                className="absolute transition-all duration-300"
                style={{
                  left: skill.position.x - minX - 60,
                  top: skill.position.y - minY - 30,
                  width: 120,
                }}
              >
                <div
                  className={`rounded-xl p-3 text-center border transition-all cursor-pointer ${
                    isUnlocked ? '' : canUnlock ? 'hover:scale-105' : 'opacity-30 cursor-not-allowed'
                  }`}
                  style={{
                    backgroundColor: isUnlocked ? style.bg : 'transparent',
                    borderColor: isUnlocked ? style.border : 'rgba(100,100,100,0.2)',
                    boxShadow: isUnlocked ? `0 0 15px ${style.glow}` : 'none',
                  }}
                  onClick={() => canUnlock && unlockSkill(skill.id)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-surface-50/30">Tier {skill.tier}</span>
                    {isUnlocked ? (
                      <Check size={14} className="text-green-400" />
                    ) : canUnlock ? (
                      <span className="text-[10px] text-gold-400">{skill.cost} pt</span>
                    ) : (
                      <Lock size={12} className="text-surface-50/20" />
                    )}
                  </div>
                  <p className="text-xs font-bold mb-1">{skill.name}</p>
                  <p className="text-[9px] text-surface-50/40 leading-tight">{skill.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
