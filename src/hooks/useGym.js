import { useState, useEffect } from 'react'
import { useGymStore } from '@/store/gymStore'
import { detectGymContext } from '@/lib/gym-context'

export function useGym() {
  const { gym, setGym, clearGym } = useGymStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadGym() {
      try {
        setLoading(true)
        const detectedGym = await detectGymContext()
        
        if (detectedGym) {
          setGym(detectedGym)
        } else {
          clearGym()
        }
      } catch (err) {
        console.error('Error loading gym context:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    loadGym()
  }, [setGym, clearGym])

  return {
    gym,
    loading,
    error,
    isGymContext: !!gym,
  }
}

