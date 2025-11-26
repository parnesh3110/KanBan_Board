<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 px-4">
    <div class="max-w-md w-full">
      <!-- Decorative Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-2xl mb-6">
          <span class="text-4xl">🔐</span>
        </div>
        <h2 class="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
          Welcome Back
        </h2>
        <p class="text-gray-600 dark:text-gray-400">Sign in to continue to TaskMaster</p>
      </div>

      <!-- Login Form -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-3 pr-12 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span v-if="showPassword">👁️</span>
                <span v-else>👁️‍🗨️</span>
              </button>
            </div>
          </div>

          <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
            <p class="text-red-700 dark:text-red-300 text-sm font-medium flex items-center gap-2">
              <span>⚠️</span>
              {{ error }}
            </p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full px-6 py-4 text-white font-bold bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
            <span v-else>Sign In</span>
          </button>
        </form>

        <div class="mt-8 text-center">
          <p class="text-gray-600 dark:text-gray-400">
            Don't have an account?
            <NuxtLink to="/register" class="font-bold text-indigo-600 hover:text-purple-600 transition">
              Create one →
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})

const supabase = useSupabaseClient()
const router = useRouter()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    loading.value = false

    if (loginError) {
      if (loginError.message.includes('Invalid login credentials')) {
        error.value = 'Invalid email or password. Please try again.'
      } else if (loginError.message.includes('Email not confirmed')) {
        error.value = 'Please confirm your email address before logging in.'
      } else {
        error.value = loginError.message
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 500))
      return navigateTo('/', { replace: true })
    }
  } catch (err) {
    loading.value = false
    error.value = 'An unexpected error occurred. Please try again.'
  }
}
</script>