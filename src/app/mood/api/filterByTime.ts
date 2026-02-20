import { supabase } from "@/lib/supabase"

export const filterByTime = async (
  userId: string,
  time: 'week' | 'month' | 'three-months'
) => {
  // Map time ranges to number of days
  const timeRanges = {
    week: 7,
    month: 30,
    'three-months': 90,
  }

  // Calculate cutoff timestamp (now minus the number of days for the selected range)
  const cutoffTime = new Date(Date.now() - timeRanges[time] * 24 * 60 * 60 * 1000).toISOString()

  // Fetch emotions from database that are on or after the cutoff time
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