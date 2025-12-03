export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { days = 30 } = query

    // Get user from Supabase session
    const supabaseServerClient = await serverSupabaseClient(event)
    const { data: { user } } = await supabaseServerClient.auth.getUser()

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(days))

    const { data, error } = await supabaseServerClient
      .from('task_analytics')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) {
      console.error('Analytics query error:', error)
      throw createError({
        statusCode: 500,
        message: error.message
      })
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Analytics error:', error)
    return { success: false, error: error.message, data: [] }
  }
})