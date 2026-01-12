export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  // Wait for Supabase to restore session from localStorage
  if (!user.value) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return navigateTo('/login')
    }
  }
})