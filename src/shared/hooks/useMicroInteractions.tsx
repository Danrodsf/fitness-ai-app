import React, { useState, useCallback, useRef } from 'react'

interface MicroInteractionOptions {
  withRipple?: boolean
  withHaptic?: boolean
  withSound?: boolean
  withScale?: boolean
  withFloat?: boolean
  withGlow?: boolean
}

interface RippleEffect {
  id: number
  x: number
  y: number
}

export const useMicroInteractions = (options: MicroInteractionOptions = {}) => {
  const {
    withRipple = false,
    withHaptic = false,
    withSound = false,
    withScale = false,
    withFloat = false,
    withGlow = false
  } = options

  const [ripples, setRipples] = useState<RippleEffect[]>([])
  const [isPressed, setIsPressed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const soundRef = useRef<AudioContext | null>(null)

  // Haptic feedback
  const triggerHaptic = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!withHaptic) return
    
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 50
      }
      navigator.vibrate(patterns[intensity])
    }
  }, [withHaptic])

  // Sound feedback
  const triggerSound = useCallback((frequency = 800, duration = 0.1) => {
    if (!withSound) return
    
    try {
      if (!soundRef.current) {
        soundRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      const audioContext = soundRef.current
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration)
    } catch {
      // Silenciar errores de audio
    }
  }, [withSound])

  // Ripple effect
  const triggerRipple = useCallback((event: React.MouseEvent) => {
    if (!withRipple) return
    
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const newRipple = { id: Date.now(), x, y }
    
    setRipples(prev => [...prev, newRipple])
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
    }, 600)
  }, [withRipple])

  // Combined interaction handler
  const handleInteraction = useCallback((
    event: React.MouseEvent,
    type: 'click' | 'hover' | 'focus' = 'click'
  ) => {
    switch (type) {
      case 'click':
        triggerRipple(event)
        triggerHaptic('medium')
        triggerSound(800, 0.1)
        setIsActive(true)
        setTimeout(() => setIsActive(false), 150)
        break
      case 'hover':
        setIsHovered(true)
        triggerHaptic('light')
        triggerSound(1000, 0.05)
        break
      case 'focus':
        triggerHaptic('light')
        break
    }
  }, [triggerRipple, triggerHaptic, triggerSound])

  // Event handlers
  const handlers = {
    onClick: (event: React.MouseEvent) => handleInteraction(event, 'click'),
    onMouseEnter: (event: React.MouseEvent) => {
      setIsHovered(true)
      if (withFloat || withGlow) {
        handleInteraction(event, 'hover')
      }
    },
    onMouseLeave: () => {
      setIsHovered(false)
      setIsPressed(false)
    },
    onMouseDown: () => setIsPressed(true),
    onMouseUp: () => setIsPressed(false),
    onFocus: () => handleInteraction({} as React.MouseEvent, 'focus'),
    onBlur: () => setIsActive(false)
  }

  // CSS classes for effects
  const getInteractionClasses = useCallback(() => {
    const classes = []
    
    if (withScale) {
      classes.push(
        'transform transition-transform duration-150',
        isHovered ? 'scale-105' : 'scale-100',
        isPressed ? 'scale-95' : ''
      )
    }
    
    if (withFloat) {
      classes.push(
        'transition-transform duration-300',
        isHovered ? '-translate-y-1' : 'translate-y-0'
      )
    }
    
    if (withGlow) {
      classes.push(
        'transition-shadow duration-300',
        isHovered ? 'shadow-glow' : ''
      )
    }
    
    return classes.filter(Boolean).join(' ')
  }, [withScale, withFloat, withGlow, isHovered, isPressed])

  // Ripple render component
  const RippleEffects = () => (
    <>
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none animate-ping rounded-full bg-white/30"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
      {isPressed && (
        <span className="absolute inset-0 bg-black/5 dark:bg-white/5 transition-opacity duration-75" />
      )}
    </>
  )

  return {
    // State
    isPressed,
    isHovered,
    isActive,
    ripples,
    
    // Functions
    triggerHaptic,
    triggerSound,
    triggerRipple,
    handleInteraction,
    
    // Props
    handlers,
    getInteractionClasses,
    
    // Components
    RippleEffects
  }
}

// Hook específico para botones
export const useButtonInteractions = () => {
  return useMicroInteractions({
    withRipple: true,
    withHaptic: true,
    withScale: true
  })
}

// Hook específico para cards
export const useCardInteractions = () => {
  return useMicroInteractions({
    withFloat: true,
    withGlow: true,
    withHaptic: false
  })
}

// Hook específico para elementos de navegación
export const useNavigationInteractions = () => {
  return useMicroInteractions({
    withRipple: true,
    withHaptic: true,
    withScale: false
  })
}