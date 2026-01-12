import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const limit = parseInt(query.limit) || 50
    
    const supabase = await serverSupabaseClient(event)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'Not authenticated' }
    }

    // Fetch conversation history
    const { data: conversations, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    // Reverse to get chronological order
    const messages = (conversations || []).reverse()

    return {
      success: true,
      messages,
      total: messages.length
    }

  } catch (error) {
    // Silently skip if database table doesn't exist yet (using localStorage instead)
    return {
      success: false,
      message: error.message,
      messages: []
    }
  }
})
