import { supabase } from "@/lib/supabase"

export const filterByTime = async (
  userId: string,
  time: 'week' | 'month' | 'three-months'
) => {
  const timeRanges = {
    week: 7,
    month: 30,
    'three-months': 90,
  }

  const cutoffTime = new Date(Date.now() - timeRanges[time] * 24 * 60 * 60 * 1000).toISOString()

  const { error, data } = await supabase
    .from('Emotions')
    .select()
    .eq('userId', userId)
    .gte('timestamp', cutoffTime)

  if (error) {
    console.error(`Error fetching emotions for ${time}:`, error)
    return []
  }
  
  return data
}