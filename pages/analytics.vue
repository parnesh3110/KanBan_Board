<template>
  <div class="px-4 py-8">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">📊 Analytics Dashboard</h1>
      <button
        @click="$router.push('/')"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        ← Back
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">Loading analytics...</p>
      </div>
    </div>

    <div v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Tasks</div>
          <div class="text-3xl font-bold text-indigo-600">{{ totalTasks }}</div>
          <div class="text-xs text-gray-500 mt-2">All time</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Completed</div>
          <div class="text-3xl font-bold text-green-600">{{ completedTasks }}</div>
          <div class="text-xs text-gray-500 mt-2">{{ completionRate }}% completion rate</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">In Progress</div>
          <div class="text-3xl font-bold text-blue-600">{{ inProgressTasks }}</div>
          <div class="text-xs text-gray-500 mt-2">Active now</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Pending</div>
          <div class="text-3xl font-bold text-yellow-600">{{ pendingTasks }}</div>
          <div class="text-xs text-gray-500 mt-2">Awaiting action</div>
        </div>
      </div>

      <!-- Productivity Score & Category Breakdown -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h3 class="text-xl font-bold mb-6 text-gray-900 dark:text-white">⭐ Productivity Score</h3>
          <div class="flex items-center justify-center">
            <div class="text-center">
              <div class="text-8xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                {{ productivityScore }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400 mb-4">Out of 100</div>
              <div class="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
                {{ getProductivityMessage() }}
              </div>
              <div class="mt-6 space-y-2 text-sm text-left">
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Completion Rate:</span>
                  <span class="font-bold">{{ completionRate }}%</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Tasks with AI Priority:</span>
                  <span class="font-bold">{{ tasksWithPriority }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Avg Priority Score:</span>
                  <span class="font-bold">{{ avgPriorityScore }}/10</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Category Breakdown - REAL DATA -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h3 class="text-xl font-bold mb-6 text-gray-900 dark:text-white">🏷️ Tasks by Category</h3>
          <div class="space-y-4">
            <div v-for="cat in categoryBreakdown" :key="cat.name" class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-2xl">{{ cat.icon }}</span>
                <span class="font-medium text-gray-700 dark:text-gray-300">{{ cat.name }}</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    class="h-full rounded-full transition-all" 
                    :class="cat.color"
                    :style="{ width: cat.percentage + '%' }"
                  ></div>
                </div>
                <span class="text-sm font-bold text-gray-900 dark:text-white w-12 text-right">{{ cat.count }}</span>
              </div>
            </div>
            <div v-if="totalTasks === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
              No tasks yet. Create some tasks to see breakdown!
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity - REAL DATA -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h3 class="text-xl font-bold mb-6 text-gray-900 dark:text-white">📈 Recent Activity (Last 7 Days)</h3>
        
        <div v-if="recentActivity.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-6xl mb-4">📊</div>
          <p class="text-lg font-semibold">No recent activity</p>
          <p class="text-sm">Start creating and completing tasks to see activity here!</p>
        </div>

        <div v-else class="space-y-3">
          <div 
            v-for="day in recentActivity" 
            :key="day.date"
            class="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg px-4 transition"
          >
            <div class="flex-1">
              <div class="font-semibold text-gray-900 dark:text-white mb-1">
                {{ formatDayLabel(day.date) }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatDate(day.date) }}
              </div>
            </div>
            <div class="flex gap-6 text-sm">
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ day.created }}</div>
                <div class="text-xs text-gray-600 dark:text-gray-400">📝 Created</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ day.completed }}</div>
                <div class="text-xs text-gray-600 dark:text-gray-400">✅ Done</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ day.total }}</div>
                <div class="text-xs text-gray-600 dark:text-gray-400">📊 Total</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tasks by Status Over Time -->
      <div class="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h3 class="text-xl font-bold mb-6 text-gray-900 dark:text-white">📈 Task Status Distribution</h3>
        <div class="grid grid-cols-3 gap-6">
          <div class="text-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
            <div class="text-5xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">{{ pendingTasks }}</div>
            <div class="text-sm font-semibold text-yellow-800 dark:text-yellow-300">📋 Pending Tasks</div>
            <div class="text-xs text-gray-600 dark:text-gray-400 mt-2">{{ pendingPercentage }}% of total</div>
          </div>
          <div class="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
            <div class="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">{{ inProgressTasks }}</div>
            <div class="text-sm font-semibold text-blue-800 dark:text-blue-300">⚡ In Progress</div>
            <div class="text-xs text-gray-600 dark:text-gray-400 mt-2">{{ inProgressPercentage }}% of total</div>
          </div>
          <div class="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
            <div class="text-5xl font-bold text-green-600 dark:text-green-400 mb-2">{{ completedTasks }}</div>
            <div class="text-sm font-semibold text-green-800 dark:text-green-300">✅ Completed</div>
            <div class="text-xs text-gray-600 dark:text-gray-400 mt-2">{{ completionRate }}% completion</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const loading = ref(true)
const allTasks = ref([])

// Stats
const totalTasks = ref(0)
const completedTasks = ref(0)
const inProgressTasks = ref(0)
const pendingTasks = ref(0)
const tasksWithPriority = ref(0)

const completionRate = computed(() => {
  if (totalTasks.value === 0) return 0
  return Math.round((completedTasks.value / totalTasks.value) * 100)
})

const pendingPercentage = computed(() => {
  if (totalTasks.value === 0) return 0
  return Math.round((pendingTasks.value / totalTasks.value) * 100)
})

const inProgressPercentage = computed(() => {
  if (totalTasks.value === 0) return 0
  return Math.round((inProgressTasks.value / totalTasks.value) * 100)
})

const avgPriorityScore = computed(() => {
  const tasksWithScores = allTasks.value.filter(t => t.ai_priority_score)
  if (tasksWithScores.length === 0) return 0
  const sum = tasksWithScores.reduce((acc, t) => acc + t.ai_priority_score, 0)
  return (sum / tasksWithScores.length).toFixed(1)
})

const productivityScore = computed(() => {
  const rate = completionRate.value * 0.6  // 60% weight on completion
  const volume = Math.min(completedTasks.value / 20, 1) * 30  // 30% weight on volume
  const priorityUsage = tasksWithPriority.value > 0 ? 10 : 0  // 10% bonus for using AI
  return Math.round(rate + volume + priorityUsage)
})

// Category Breakdown - REAL DATA
const categoryBreakdown = computed(() => {
  const categories = [
    { name: 'Work', value: 'work', icon: '💼', color: 'bg-blue-500' },
    { name: 'Personal', value: 'personal', icon: '🏠', color: 'bg-purple-500' },
    { name: 'Urgent', value: 'urgent', icon: '🔥', color: 'bg-red-500' },
    { name: 'Other', value: 'other', icon: '📌', color: 'bg-gray-500' }
  ]

  return categories.map(cat => {
    const count = allTasks.value.filter(t => t.category === cat.value).length
    const percentage = totalTasks.value > 0 ? (count / totalTasks.value) * 100 : 0
    
    return {
      ...cat,
      count,
      percentage: Math.round(percentage)
    }
  })
})

// Recent Activity - REAL DATA from last 7 days
const recentActivity = computed(() => {
  const days = []
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    
    const dateStr = date.toISOString().split('T')[0]
    const nextDateStr = nextDay.toISOString().split('T')[0]
    
    // Tasks created on this day
    const created = allTasks.value.filter(t => {
      const taskDate = new Date(t.created_at).toISOString().split('T')[0]
      return taskDate === dateStr
    }).length
    
    // Tasks completed on this day (updated to completed status on this day)
    const completed = allTasks.value.filter(t => {
      if (t.status !== 'completed') return false
      const updatedDate = new Date(t.updated_at).toISOString().split('T')[0]
      return updatedDate === dateStr
    }).length
    
    // Total tasks that existed on this day
    const total = allTasks.value.filter(t => {
      const taskCreatedDate = new Date(t.created_at)
      return taskCreatedDate <= nextDay
    }).length
    
    days.push({
      date: dateStr,
      created,
      completed,
      total
    })
  }
  
  return days
})

const getProductivityMessage = () => {
  const score = productivityScore.value
  if (score >= 80) return '🔥 Outstanding! You\'re crushing it!'
  if (score >= 60) return '⭐ Great work! Keep it up!'
  if (score >= 40) return '💪 Good progress! Stay consistent!'
  return '🎯 Let\'s build momentum together!'
}

const formatDayLabel = (dateStr) => {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dateCheck = new Date(dateStr)
  dateCheck.setHours(0, 0, 0, 0)
  
  const diffDays = Math.floor((today - dateCheck) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays <= 6) return date.toLocaleDateString('en-US', { weekday: 'long' })
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const fetchAnalytics = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.value.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    allTasks.value = data || []
    totalTasks.value = data?.length || 0
    completedTasks.value = data?.filter(t => t.status === 'completed').length || 0
    inProgressTasks.value = data?.filter(t => t.status === 'in_progress').length || 0
    pendingTasks.value = data?.filter(t => t.status === 'pending').length || 0
    tasksWithPriority.value = data?.filter(t => t.ai_priority_score).length || 0
  } catch (error) {
    console.error('Error fetching analytics:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAnalytics()
})
</script>