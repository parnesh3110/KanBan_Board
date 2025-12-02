<template>
  <div class="px-4 py-8">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">📅 Calendar View</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Click any date to quick-add tasks • Drag tasks to reschedule
        </p>
      </div>
      <button
        @click="$router.push('/')"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        ← Back to Board
      </button>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
      <div v-if="loading" class="text-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">Loading calendar...</p>
      </div>

      <div v-else class="p-6">
        <!-- Calendar Controls -->
        <div class="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-4">
            <button
              @click="goToToday"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              📍 Today
            </button>
            <button
              @click="changeMonth(-1)"
              class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              ← Prev
            </button>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white min-w-[200px] text-center">
              {{ currentMonthYear }}
            </h2>
            <button
              @click="changeMonth(1)"
              class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Next →
            </button>
          </div>

          <!-- Stats -->
          <div class="flex gap-4 text-sm">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span class="text-gray-600 dark:text-gray-400">Pending: {{ monthStats.pending }}</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span class="text-gray-600 dark:text-gray-400">In Progress: {{ monthStats.inProgress }}</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-green-400 rounded-full"></div>
              <span class="text-gray-600 dark:text-gray-400">Completed: {{ monthStats.completed }}</span>
            </div>
          </div>
        </div>

        <!-- Calendar Grid -->
        <div class="grid grid-cols-7 gap-2">
          <!-- Day Headers -->
          <div
            v-for="day in ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']"
            :key="day"
            class="text-center font-bold text-gray-700 dark:text-gray-300 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            {{ day.slice(0, 3) }}
          </div>

          <!-- Calendar Days -->
          <div
            v-for="day in calendarDays"
            :key="day.date"
            @click="openQuickAdd(day.date)"
            @drop="onDrop($event, day.date)"
            @dragover.prevent
            @dragenter.prevent="dragEnterDate = day.date"
            @dragleave="dragEnterDate = null"
            :class="[
              'min-h-[120px] p-2 border-2 rounded-xl cursor-pointer transition-all',
              day.isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900 opacity-60',
              day.isToday ? 'ring-2 ring-indigo-500 shadow-lg' : 'border-gray-200 dark:border-gray-700',
              dragEnterDate === day.date ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 scale-105' : '',
              'hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:shadow-md'
            ]"
          >
            <div class="flex items-center justify-between mb-2">
              <div 
                :class="[
                  'text-sm font-semibold',
                  day.isToday ? 'w-7 h-7 flex items-center justify-center bg-indigo-600 text-white rounded-full' : '',
                  !day.isToday && day.isCurrentMonth ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'
                ]"
              >
                {{ day.dayNumber }}
              </div>
              <button
                v-if="day.tasks.length > 0"
                @click.stop="showDayTasks(day)"
                class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                {{ day.tasks.length }}
              </button>
            </div>
            
            <div class="space-y-1 overflow-hidden">
              <div
                v-for="task in day.tasks.slice(0, 3)"
                :key="task.id"
                draggable="true"
                @dragstart="dragStart($event, task)"
                @click.stop="editTask(task)"
                :class="getTaskColor(task.status)"
                class="text-xs p-1.5 rounded-lg truncate cursor-move hover:opacity-80 transition font-medium shadow-sm"
                :title="task.title"
              >
                {{ getStatusIcon(task.status) }} {{ task.title }}
              </div>
              <div
                v-if="day.tasks.length > 3"
                class="text-xs text-gray-500 dark:text-gray-400 font-semibold pl-1.5"
              >
                +{{ day.tasks.length - 3 }} more
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Add Task Modal -->
    <teleport to="body">
      <div
        v-if="showQuickAddModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
        @click.self="showQuickAddModal = false"
      >
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full" @click.stop>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Add Task for {{ formatDateLong(selectedDate) }}
          </h3>
          
          <form @submit.prevent="quickAddTask" class="space-y-4">
            <div>
              <input
                v-model="quickTaskTitle"
                type="text"
                placeholder="Task title..."
                required
                autofocus
                class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <textarea
                v-model="quickTaskDescription"
                placeholder="Description (optional)..."
                rows="3"
                class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <select
                v-model="quickTaskCategory"
                class="px-4 py-3 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500"
              >
                <option value="work">💼 Work</option>
                <option value="personal">🏠 Personal</option>
                <option value="urgent">🔥 Urgent</option>
                <option value="other">📌 Other</option>
              </select>

              <select
                v-model="quickTaskStatus"
                class="px-4 py-3 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500"
              >
                <option value="pending">📋 Pending</option>
                <option value="in_progress">⚡ In Progress</option>
              </select>
            </div>
            
            <div class="flex gap-3">
              <button
                type="button"
                @click="showQuickAddModal = false"
                class="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="!quickTaskTitle"
                class="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-bold"
              >
                ✓ Add Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>

    <!-- Day Tasks Modal -->
    <teleport to="body">
      <div
        v-if="showDayModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
        @click.self="showDayModal = false"
      >
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" @click.stop>
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ formatDateLong(selectedDayData?.date) }}
            </h3>
            <button
              @click="showDayModal = false"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div class="space-y-3">
            <div
              v-for="task in selectedDayData?.tasks"
              :key="task.id"
              class="p-4 border-l-4 rounded-r-xl"
              :class="getTaskBorderColor(task.status)"
            >
              <div class="flex items-start justify-between">
                <div>
                  <h4 class="font-bold text-gray-900 dark:text-white mb-1">
                    {{ getStatusIcon(task.status) }} {{ task.title }}
                  </h4>
                  <p v-if="task.description" class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {{ task.description }}
                  </p>
                  <div class="flex gap-2">
                    <span :class="getCategoryClass(task.category)" class="text-xs px-2 py-1 rounded-full font-semibold">
                      {{ getCategoryIcon(task.category) }} {{ task.category }}
                    </span>
                    <span :class="getStatusClass(task.status)" class="text-xs px-2 py-1 rounded-full font-semibold">
                      {{ task.status.replace('_', ' ') }}
                    </span>
                  </div>
                </div>
                <button
                  @click="goToTask(task)"
                  class="px-3 py-1 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  View →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const loading = ref(true)
const tasks = ref([])
const currentDate = ref(new Date())
const draggedTask = ref(null)
const dragEnterDate = ref(null)

// Quick Add Modal
const showQuickAddModal = ref(false)
const selectedDate = ref(null)
const quickTaskTitle = ref('')
const quickTaskDescription = ref('')
const quickTaskCategory = ref('work')
const quickTaskStatus = ref('pending')

// Day Tasks Modal
const showDayModal = ref(false)
const selectedDayData = ref(null)

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const monthStats = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const monthTasks = tasks.value.filter(task => {
    if (!task.due_date) return false
    const taskDate = new Date(task.due_date)
    return taskDate.getFullYear() === year && taskDate.getMonth() === month
  })

  return {
    pending: monthTasks.filter(t => t.status === 'pending').length,
    inProgress: monthTasks.filter(t => t.status === 'in_progress').length,
    completed: monthTasks.filter(t => t.status === 'completed').length
  }
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    const dateStr = date.toISOString().split('T')[0]
    const dayTasks = tasks.value.filter(t => t.due_date === dateStr)
    
    days.push({
      date: dateStr,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: date.toDateString() === today.toDateString(),
      tasks: dayTasks
    })
  }
  
  return days
})

const changeMonth = (delta) => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + delta)
  currentDate.value = newDate
}

const goToToday = () => {
  currentDate.value = new Date()
}

const openQuickAdd = (date) => {
  selectedDate.value = date
  showQuickAddModal.value = true
  quickTaskTitle.value = ''
  quickTaskDescription.value = ''
  quickTaskCategory.value = 'work'
  quickTaskStatus.value = 'pending'
}

const quickAddTask = async () => {
  try {
    const { error } = await supabase
      .from('tasks')
      .insert([{
        user_id: user.value.id,
        title: quickTaskTitle.value,
        description: quickTaskDescription.value,
        due_date: selectedDate.value,
        category: quickTaskCategory.value,
        status: quickTaskStatus.value
      }])

    if (error) throw error

    showQuickAddModal.value = false
    await fetchTasks()
  } catch (error) {
    console.error('Error adding task:', error)
    alert('Failed to add task')
  }
}

const showDayTasks = (day) => {
  selectedDayData.value = day
  showDayModal.value = true
}

const editTask = (task) => {
  // Go to main board with task highlighted
  router.push('/')
}

const goToTask = (task) => {
  router.push('/')
}

// Drag and Drop
const dragStart = (event, task) => {
  draggedTask.value = task
  event.dataTransfer.effectAllowed = 'move'
}

const onDrop = async (event, newDate) => {
  event.preventDefault()
  dragEnterDate.value = null

  if (!draggedTask.value) return

  try {
    const { error } = await supabase
      .from('tasks')
      .update({ due_date: newDate })
      .eq('id', draggedTask.value.id)

    if (error) throw error

    await fetchTasks()
  } catch (error) {
    console.error('Error updating task date:', error)
  } finally {
    draggedTask.value = null
  }
}

// Helper Functions
const getTaskColor = (status) => {
  const colors = {
    pending: 'bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100',
    in_progress: 'bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100',
    completed: 'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100'
  }
  return colors[status] || 'bg-gray-200 text-gray-800'
}

const getTaskBorderColor = (status) => {
  const colors = {
    pending: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    in_progress: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    completed: 'border-green-500 bg-green-50 dark:bg-green-900/20'
  }
  return colors[status] || 'border-gray-500 bg-gray-50'
}

const getStatusIcon = (status) => {
  const icons = {
    pending: '📋',
    in_progress: '⚡',
    completed: '✅'
  }
  return icons[status] || '📋'
}

const getStatusClass = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
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

const getCategoryClass = (category) => {
  const colors = {
    work: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    personal: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
  return colors[category] || colors.other
}

const formatDateLong = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

const fetchTasks = async () => {
  loading.value = true
  
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.value.id)

    if (error) throw error
    tasks.value = data || []
  } catch (error) {
    console.error('Error fetching tasks:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTasks()
})
</script>