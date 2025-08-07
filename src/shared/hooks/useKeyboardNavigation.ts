import { useEffect, useCallback } from 'react'

interface KeyboardNavigationOptions {
  onEscape?: () => void
  onEnter?: () => void
  onSpace?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onTab?: () => void
  enabled?: boolean
}

export const useKeyboardNavigation = ({
  onEscape,
  onEnter,
  onSpace,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onTab,
  enabled = true
}: KeyboardNavigationOptions) => {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    switch (event.key) {
      case 'Escape':
        onEscape?.()
        break
      case 'Enter':
        onEnter?.()
        break
      case ' ': // Space
        if (onSpace) {
          event.preventDefault() // Prevenir scroll
          onSpace()
        }
        break
      case 'ArrowUp':
        if (onArrowUp) {
          event.preventDefault()
          onArrowUp()
        }
        break
      case 'ArrowDown':
        if (onArrowDown) {
          event.preventDefault()
          onArrowDown()
        }
        break
      case 'ArrowLeft':
        if (onArrowLeft) {
          event.preventDefault()
          onArrowLeft()
        }
        break
      case 'ArrowRight':
        if (onArrowRight) {
          event.preventDefault()
          onArrowRight()
        }
        break
      case 'Tab':
        onTab?.()
        break
    }
  }, [enabled, onEscape, onEnter, onSpace, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onTab])

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, enabled])

  return { handleKeyDown }
}

// Hook específico para navegación en listas/menús
export const useListNavigation = (
  items: any[], 
  onSelect: (index: number) => void,
  initialIndex = -1
) => {
  const [focusedIndex, setFocusedIndex] = useState(initialIndex)

  const handleArrowDown = useCallback(() => {
    setFocusedIndex(prev => prev < items.length - 1 ? prev + 1 : 0)
  }, [items.length])

  const handleArrowUp = useCallback(() => {
    setFocusedIndex(prev => prev > 0 ? prev - 1 : items.length - 1)
  }, [items.length])

  const handleEnter = useCallback(() => {
    if (focusedIndex >= 0 && focusedIndex < items.length) {
      onSelect(focusedIndex)
    }
  }, [focusedIndex, items.length, onSelect])

  useKeyboardNavigation({
    onArrowDown: handleArrowDown,
    onArrowUp: handleArrowUp,
    onEnter: handleEnter
  })

  return {
    focusedIndex,
    setFocusedIndex
  }
}

// Hook para navegación de tabs
export const useTabNavigation = (
  tabCount: number,
  onTabChange: (index: number) => void,
  currentIndex = 0
) => {
  const handleArrowRight = useCallback(() => {
    const nextIndex = currentIndex < tabCount - 1 ? currentIndex + 1 : 0
    onTabChange(nextIndex)
  }, [currentIndex, tabCount, onTabChange])

  const handleArrowLeft = useCallback(() => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabCount - 1
    onTabChange(prevIndex)
  }, [currentIndex, tabCount, onTabChange])

  useKeyboardNavigation({
    onArrowRight: handleArrowRight,
    onArrowLeft: handleArrowLeft
  })

  return {
    handleArrowRight,
    handleArrowLeft
  }
}

import { useState } from 'react'