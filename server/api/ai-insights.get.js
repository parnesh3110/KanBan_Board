import { serverSupabaseClient } from '#supabase/server'
import { generateInsights, suggestNextActions } from '../utils/taskAnalytics'

export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'Not authenticated' }
    }

    // Fetch all user tasks
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Generate insights
    const insights = generateInsights(tasks || [])
    const suggestions = suggestNextActions(tasks || [])

    return {
      success: true,
      insights,
      suggestions,
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('AI Insights Error:', error)
    return {
      success: false,
      message: error.message
    }
  }
})
