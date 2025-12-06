import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { taskId, limit = 50 } = query

    const supabase = await serverSupabaseClient(event)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized', data: [] }
    }

    let queryBuilder = supabase
      .from('task_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit))

    if (taskId) {
      queryBuilder = queryBuilder.eq('task_id', taskId)
    }

    const { data, error } = await queryBuilder

    if (error) {
      console.error('Task history query error:', error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Task history error:', error)
    return { success: false, error: error.message, data: [] }
  }
})