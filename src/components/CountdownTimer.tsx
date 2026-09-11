import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

// Specific dates for Saturday Sept 12 and Sunday Sept 13, 2026
const START_TIME = new Date('2026-09-12T10:00:00').getTime()
const END_TIME = new Date('2026-09-13T23:59:00').getTime()

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [status, setStatus] = useState<'upcoming' | 'ongoing' | 'ended'>('upcoming')

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      
      if (now < START_TIME) {
        setStatus('upcoming')
        setTimeLeft(START_TIME - now)
      } else if (now < END_TIME) {
        setStatus('ongoing')
        setTimeLeft(END_TIME - now)
      } else {
        setStatus('ended')
        setTimeLeft(0)
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const days = Math.floor(totalSeconds / (3600 * 24))
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    const parts = []
    if (days > 0) parts.push(`${days}d`)
    parts.push(`${hours.toString().padStart(2, '0')}h`)
    parts.push(`${minutes.toString().padStart(2, '0')}m`)
    parts.push(`${seconds.toString().padStart(2, '0')}s`)

    return parts.join(' : ')
  }

  if (status === 'ended') return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: status === 'upcoming' 
          ? 'linear-gradient(135deg, #004526 0%, #00301b 100%)' 
          : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        color: 'white',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: 1000,
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <Clock size={24} strokeWidth={2.5} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span style={{ 
          fontSize: '0.8rem', 
          fontWeight: 700, 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em',
          opacity: 0.9,
          lineHeight: 1
        }}>
          {status === 'upcoming' 
            ? 'Voting starts 10:00 on Saturday' 
            : 'Voting ends 23:59 on Sunday'}
        </span>
        <span style={{ 
          fontFamily: 'var(--font-mono)', 
          fontSize: '1.5rem', 
          fontWeight: 800,
          letterSpacing: '0.05em',
          marginTop: '2px'
        }}>
          {formatTime(timeLeft)}
        </span>
      </div>
    </motion.div>
  )
}
