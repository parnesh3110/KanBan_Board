<template>
  <div class="min-h-[85vh] flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-2xl mb-6">
          <span class="text-4xl">✨</span>
        </div>
        <h2 class="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
          Get Started
        </h2>
        <p class="text-gray-600">Create your TaskMaster account</p>
      </div>

      <!-- Form -->
      <div class="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
        <form @submit.prevent="handleRegister" class="space-y-5">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
            <input
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-sm hover:border-gray-300"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <input
              v-model="password"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-sm hover:border-gray-300"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
            <input
              v-model="confirmPassword"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-sm hover:border-gray-300"
              placeholder="Re-enter password"
            />
          </div>

          <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p class="text-red-700 text-sm font-medium flex items-center gap-2">
              <span>⚠️</span> {{ error }}
            </p>
          </div>
          
          <div v-if="success" class="p-4 bg-green-50 border border-green-200 rounded-xl">
            <p class="text-green-700 text-sm font-medium flex items-center gap-2">
              <span>✓</span> {{ success }}
            </p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full px-6 py-4 text-white font-bold bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl"
          >
            <span v-if="loading">Creating account...</span>
            <span v-else>Create Account</span>
          </button>
        </form>

        <div class="mt-8 text-center">
          <p class="text-gray-600">
            Already have an account?
            <NuxtLink to="/login" class="font-bold text-indigo-600 hover:text-purple-600 transition">
              Sign in →
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
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  const { data, error: signUpError } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  })

  loading.value = false

  if (signUpError) {
    error.value = signUpError.message
  } else {
    success.value = 'Account created! Redirecting...'
    setTimeout(() => {
      navigateTo('/')
    }, 1000)
  }
}
</script>