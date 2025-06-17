'use client'

import { useEffect, useState } from 'react'
import styles from './ProgressLoader.module.css'

interface ProgressLoaderProps {
  duration?: number // Duration in milliseconds
  className?: string
}

export default function ProgressLoader({ duration = 2000, className = '' }: ProgressLoaderProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / duration) * 100, 95) // Cap at 95% until actual loading completes
      
      setProgress(newProgress)
      
      if (newProgress >= 95) {
        clearInterval(interval)
      }
    }, 16) // ~60fps updates

    return () => clearInterval(interval)
  }, [duration])

  return (
    <div className={`${styles.container} ${className}`}>
      <div 
        className={`${styles.progressTrack} ${styles.progressBar}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}