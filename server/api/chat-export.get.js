import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const format = query.format || 'json' // json or markdown
    
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
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    if (format === 'markdown') {
      // Export as Markdown
      let markdown = '# AI Chat Conversation History\n\n'
      markdown += `**User:** ${user.email}\n`
      markdown += `**Exported:** ${new Date().toLocaleString()}\n`
      markdown += `**Total Messages:** ${conversations?.length || 0}\n\n`
      markdown += '---\n\n'

      conversations?.forEach((msg, index) => {
        const timestamp = new Date(msg.created_at).toLocaleString()
        const role = msg.role === 'user' ? '👤 You' : '🤖 AI Assistant'
        
        markdown += `### ${role} - ${timestamp}\n\n`
        markdown += `${msg.content}\n\n`
        
        if (msg.action) {
          markdown += `*Action: ${msg.action}*\n\n`
        }
        
        markdown += '---\n\n'
      })

      return markdown
    }

    // Export as JSON
    return {
      success: true,
      user: user.email,
      exported_at: new Date().toISOString(),
      total_messages: conversations?.length || 0,
      conversations: conversations || []
    }

  } catch (error) {
    // Silently skip if database table doesn't exist yet
    return {
      success: false,
      message: error.message
    }
  }
})
