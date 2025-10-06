import { supabase } from './supabase'

/**
 * Detect and load gym context based on domain or subpath
 */
export async function detectGymContext() {
  const hostname = window.location.hostname
  const pathname = window.location.pathname
  
  // Try custom domain first
  if (hostname !== 'localhost' && !hostname.includes('vercel.app')) {
    const { data: gym, error } = await supabase
      .from('gyms')
      .select('*')
      .eq('custom_domain', hostname)
      .eq('is_active', true)
      .single()
    
    if (gym && !error) {
      return gym
    }
  }
  
  // Try subpath routing (e.g., /gym-slug/...)
  const pathParts = pathname.split('/').filter(Boolean)
  if (pathParts.length > 0) {
    const potentialSlug = pathParts[0]
    
    // Exclude known routes that aren't gym slugs
    const excludedRoutes = ['register', 'login', 'about', 'pricing', 'contact']
    if (!excludedRoutes.includes(potentialSlug)) {
      const { data: gym, error } = await supabase
        .from('gyms')
        .select('*')
        .eq('slug', potentialSlug)
        .eq('is_active', true)
        .single()
      
      if (gym && !error) {
        return gym
      }
    }
  }
  
  return null
}

/**
 * Get gym by slug
 */
export async function getGymBySlug(slug) {
  const { data: gym, error } = await supabase
    .from('gyms')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  
  if (error) {
    console.error('Error fetching gym:', error)
    return null
  }
  
  return gym
}

/**
 * Check if slug is available
 */
export async function isSlugAvailable(slug) {
  const { data, error } = await supabase
    .from('gyms')
    .select('id')
    .eq('slug', slug)
    .single()
  
  return !data && error?.code === 'PGRST116' // Not found error
}

