<template>
  <div :class="{ 'dark': $colorMode.value === 'dark' }" class="min-h-screen transition-colors duration-300">
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 transition-colors duration-300">
      <!-- Navigation -->
      <nav class="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <!-- Left Side: Logo + Navigation Links -->
            <div class="flex items-center gap-8">
              <!-- Logo -->
              <NuxtLink to="/" class="flex items-center gap-3 group">
                <div class="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span class="text-xl">📋</span>
                </div>
                <span class="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  TaskMaster
                </span>
              </NuxtLink>

              <!-- Navigation Links (ADD THIS SECTION HERE) -->
              <div class="hidden md:flex items-center gap-6">
                <NuxtLink 
                  to="/" 
                  class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  active-class="text-indigo-600 dark:text-indigo-400 font-bold"
                >
                  📋 Board
                </NuxtLink>
                <NuxtLink 
                  to="/calendar" 
                  class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  active-class="text-indigo-600 dark:text-indigo-400 font-bold"
                >
                  📅 Calendar
                </NuxtLink>
                <NuxtLink 
                  to="/analytics" 
                  class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  active-class="text-indigo-600 dark:text-indigo-400 font-bold"
                >
                  📊 Analytics
                </NuxtLink>
                <NuxtLink 
                  to="/ai-chat" 
                  class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  active-class="text-indigo-600 dark:text-indigo-400 font-bold"
                >
                  🤖 AI Chat
                </NuxtLink>
                <NuxtLink 
                  to="/mindmap" 
                  class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  active-class="text-indigo-600 dark:text-indigo-400 font-bold"
                >
                  🧠 Mind Map
                </NuxtLink>
                <NuxtLink 
                  to="/history" 
                  class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  active-class="text-indigo-600 dark:text-indigo-400 font-bold"
                >
                  📜 History
                </NuxtLink>
              </div>
            </div>
            
            <!-- Right Menu: Dark Mode + User -->
            <div class="flex items-center gap-3">

              <!-- Add this right before the dark mode toggle -->
<button
  v-if="user"
  @click="mobileMenuOpen = !mobileMenuOpen"
  class="md:hidden w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center justify-center"
>
  <span class="text-xl">{{ mobileMenuOpen ? '✕' : '☰' }}</span>
</button>

<!-- Add this after the main nav div, before main content -->
<div 
  v-if="mobileMenuOpen && user" 
  class="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
>
  <div class="px-4 py-3 space-y-2">
    <NuxtLink to="/" class="block py-2 text-sm font-medium" @click="mobileMenuOpen = false">
      📋 Board
    </NuxtLink>
    <NuxtLink to="/calendar" class="block py-2 text-sm font-medium" @click="mobileMenuOpen = false">
      📅 Calendar
    </NuxtLink>
    <NuxtLink to="/analytics" class="block py-2 text-sm font-medium" @click="mobileMenuOpen = false">
      📊 Analytics
    </NuxtLink>
    <NuxtLink to="/ai-chat" class="block py-2 text-sm font-medium" @click="mobileMenuOpen = false">
      🤖 AI Chat
    </NuxtLink>
    <NuxtLink to="/mindmap" class="block py-2 text-sm font-medium" @click="mobileMenuOpen = false">
      🧠 Mind Map
    </NuxtLink>
    <NuxtLink to="/history" class="block py-2 text-sm font-medium" @click="mobileMenuOpen = false">
      📜 History
    </NuxtLink>
  </div>
</div>
              <!-- Dark Mode Toggle -->
              <button
                @click="toggleDarkMode"
                class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center justify-center group"
                title="Toggle dark mode"
              >
                <span v-if="$colorMode.value === 'dark'" class="text-xl group-hover:scale-125 transition-transform">🌙</span>
                <span v-else class="text-xl group-hover:scale-125 transition-transform">☀️</span>
              </button>

              <!-- User Info -->
              <template v-if="user">
                <div class="hidden md:flex items-center gap-3 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl transition-colors">
                  <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {{ user.email.charAt(0).toUpperCase() }}
                  </div>
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ user.email }}</span>
                </div>
                <button
                  @click="handleSignOut"
                  class="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  Sign Out
                </button>
              </template>
              <template v-else>
                <NuxtLink
                  to="/login"
                  class="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  Login
                </NuxtLink>
                <NuxtLink
                  to="/register"
                  class="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Sign Up
                </NuxtLink>
              </template>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-8">
        <slot />
      </main>

      <!-- Footer -->
      <footer class="mt-20 py-8 text-center text-gray-500 dark:text-gray-400 text-sm transition-colors">
        <p>Built with 💜 by Parnesh Adawadkar</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const colorMode = useColorMode()
const mobileMenuOpen = ref(false)


const toggleDarkMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const handleSignOut = async () => {
  await supabase.auth.signOut()
  navigateTo('/login')
}
</script>