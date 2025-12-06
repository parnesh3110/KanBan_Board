<template>
  <div class="px-4 py-8">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">📜 Task History</h1>
      <div class="flex gap-3">
        <button
          @click="fetchHistory"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          🔄 Refresh
        </button>
        <button
          @click="$router.push('/')"
          class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          ← Back
        </button>
      </div>
    </div>

    <!-- Completed Tasks -->
    <div class="mb-8">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">✅ Completed Tasks</h2>
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p class="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>

        <div v-else-if="completedTasks.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-6xl mb-4">📝</div>
          <p class="text-lg font-semibold">No completed tasks yet</p>
          <p class="text-sm">Complete some tasks to see them here!</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="task in completedTasks"
            :key="task.id"
            class="border-l-4 border-green-500 pl-4 py-3 bg-green-50 dark:bg-green-900/20 rounded-r-lg"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="font-bold text-gray-900 dark:text-white mb-1">
                  {{ task.title }}
                </div>
                <div v-if="task.description" class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {{ task.description }}
                </div>
                <div class="flex flex-wrap gap-2 text-xs">
                  <span class="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-full font-semibold">
                    ✅ Completed
                  </span>
                  <span v-if="task.category" class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                    {{ getCategoryIcon(task.category) }} {{ task.category }}
                  </span>
                  <span v-if="task.due_date" class="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full">
                    📅 Due: {{ formatDate(task.due_date) }}
                  </span>
                </div>
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400 ml-4 text-right">
                <div>Completed on</div>
                <div class="font-semibold">{{ formatDateTime(task.updated_at) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Activity Log -->
    <div>
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">📋 Activity Log</h2>
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <div v-if="historyLoading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p class="text-gray-600 dark:text-gray-400">Loading activity...</p>
        </div>

        <div v-else-if="history.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-6xl mb-4">📜</div>
          <p class="text-lg font-semibold">No activity yet</p>
          <p class="text-sm">Start making changes to see history here</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="entry in history"
            :key="entry.id"
            class="border-l-4 pl-4 py-3 rounded-r-lg"
            :class="getBorderClass(entry.action)"
          >
            <div class="flex items-start justify-between">
              <div>
                <div class="font-semibold text-gray-900 dark:text-white">
                  {{ getActionLabel(entry.action) }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {{ formatDateTime(entry.created_at) }}
                </div>
              </div>
              <span
                :class="getActionColor(entry.action)"
                class="px-3 py-1 text-xs font-bold rounded-full"
              >
                {{ entry.action }}
              </span>
            </div>
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
const historyLoading = ref(true)
const completedTasks = ref([])
const history = ref([])

const fetchCompletedTasks = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.value.id)
      .eq('status', 'completed')
      .order('updated_at', { ascending: false })

    if (error) throw error
    completedTasks.value = data || []
  } catch (error) {
    console.error('Error fetching completed tasks:', error)
  } finally {
    loading.value = false
  }
}

const fetchHistory = async () => {
  historyLoading.value = true
  try {
    const response = await $fetch('/api/task-history?limit=100')
    if (response.success) {
      history.value = response.data || []
    }
  } catch (error) {
    console.error('Error fetching history:', error)
    history.value = []
  } finally {
    historyLoading.value = false
  }
}

const getCategoryIcon = (category) => {
  const icons = {
    work: '💼',
    personal: '🏠',
    urgent: '🔥',
    other: '📌'
  }
  return icons[category] || '📌'
}

const getActionLabel = (action) => {
  const labels = {
    UPDATE: 'Task Updated',
    DELETE: 'Task Deleted',
    INSERT: 'Task Created'
  }
  return labels[action] || action
}

const getActionColor = (action) => {
  const colors = {
    UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    INSERT: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
  }
  return colors[action] || 'bg-gray-100 text-gray-800'
}

const getBorderClass = (action) => {
  const colors = {
    UPDATE: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    DELETE: 'border-red-500 bg-red-50 dark:bg-red-900/20',
    INSERT: 'border-green-500 bg-green-50 dark:bg-green-900/20'
  }
  return colors[action] || 'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
}

const formatDate = (date) => {
  if (!date) return 'No date'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchCompletedTasks()
  fetchHistory()
})
</script>