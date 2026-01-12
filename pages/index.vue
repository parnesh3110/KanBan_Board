<template>
  <div class="px-4 py-8">
    <!-- Loading State -->
    <div v-if="initialLoading" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">Loading your tasks...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Header with Stats & Search -->
      <div class="mb-8">
        <div class="flex flex-col gap-4 mb-6">
          <!-- Title Row -->
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400 mb-2">
                My Tasks
              </h1>
              <p class="text-gray-600 dark:text-gray-400">Drag • Search • Prioritize with AI</p>
            </div>
            
            <!-- Stats Cards -->
            <div class="flex gap-3">
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md px-5 py-3 text-center min-w-[80px] hover:shadow-lg transition-all">
                <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{{ tasks.length }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</div>
              </div>
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md px-5 py-3 text-center min-w-[80px] hover:shadow-lg transition-all">
                <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-500">{{ pendingCount }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Pending</div>
              </div>
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md px-5 py-3 text-center min-w-[80px] hover:shadow-lg transition-all">
                <div class="text-2xl font-bold text-green-600 dark:text-green-500">{{ completedCount }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Done</div>
              </div>
            </div>
          </div>

          <!-- Search Bar + Export Button -->
          <div class="flex gap-3">
            <div class="relative flex-1">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search tasks"
                class="w-full px-5 py-3 pl-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm text-gray-900 dark:text-gray-100"
                ref="searchInput"
              />
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
              <button
                v-if="searchQuery"
                @click="searchQuery = ''"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <button
              @click="exportTasks"
              class="px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold flex items-center gap-2 shadow-md transition"
            >
              <span>📥</span>
              Export
            </button>
          </div>

          <!-- Sort & Category Filters + Progress -->
          <div class="flex flex-wrap gap-3">
            <select
              v-model="sortBy"
              class="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="priority">🎯 Priority (AI)</option>
              <option value="created">📅 Newest First</option>
              <option value="dueDate">⏰ Due Date</option>
              <option value="title">🔤 Alphabetical</option>
            </select>

            <select
              v-model="categoryFilter"
              class="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="all">🏷️ All Categories</option>
              <option value="work">💼 Work</option>
              <option value="personal">🏠 Personal</option>
              <option value="urgent">🔥 Urgent</option>
              <option value="other">📌 Other</option>
            </select>

            <div class="flex-1 min-w-[200px] bg-white dark:bg-gray-800 rounded-lg px-4 py-2 border-2 border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-bold text-gray-700 dark:text-gray-300">Progress</span>
                <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">{{ completionPercentage }}%</span>
              </div>
              <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500 rounded-full"
                  :style="{ width: completionPercentage + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Task Insights Widget -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-red-800 dark:text-red-300 font-semibold mb-1">⚠️ Overdue</div>
              <div class="text-3xl font-bold text-red-600 dark:text-red-400">{{ overdueTasks }}</div>
            </div>
            <button 
              v-if="overdueTasks > 0"
              @click="filterOverdue"
              class="text-xs text-red-600 dark:text-red-400 hover:underline font-medium"
            >
              View →
            </button>
          </div>
        </div>

        <div class="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-orange-800 dark:text-orange-300 font-semibold mb-1">📅 Due Today</div>
              <div class="text-3xl font-bold text-orange-600 dark:text-orange-400">{{ dueTodayTasks }}</div>
            </div>
            <button 
              v-if="dueTodayTasks > 0"
              @click="filterDueToday"
              class="text-xs text-orange-600 dark:text-orange-400 hover:underline font-medium"
            >
              View →
            </button>
          </div>
        </div>

        <div class="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-purple-800 dark:text-purple-300 font-semibold mb-1">🔥 High Priority</div>
              <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">{{ highPriorityTasks }}</div>
            </div>
            <button 
              v-if="highPriorityTasks > 0"
              @click="sortBy = 'priority'"
              class="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium"
            >
              View →
            </button>
          </div>
        </div>
      </div>

      <!-- AI Prioritization Section -->
      <div class="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 dark:from-purple-700 dark:via-indigo-800 dark:to-blue-900 rounded-2xl shadow-2xl p-8 text-white mb-8 overflow-hidden relative transition-colors">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        
        <div class="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-4xl">🤖</span>
              <h3 class="text-2xl font-bold">AI Prioritization</h3>
            </div>
            <p class="text-purple-100 leading-relaxed">
              Analyze urgency, complexity, and business impact to rank your tasks intelligently.
            </p>
            <p v-if="lastPrioritized" class="text-purple-200 text-sm mt-2">
              ✓ Last prioritized: {{ lastPrioritized }}
            </p>
          </div>
          
          <button
            @click="prioritizeTasks"
            :disabled="aiLoading || tasks.length === 0"
            class="px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-110 active:scale-95 shadow-2xl whitespace-nowrap"
          >
            <span v-if="aiLoading" class="flex items-center gap-3">
              <svg class="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </span>
            <span v-else class="flex items-center gap-2">
              <span class="text-xl">✨</span>
              Prioritize Tasks
            </span>
          </button>
        </div>
        
        <div v-if="aiError" class="relative mt-5 p-4 bg-red-900/30 backdrop-blur-sm rounded-xl border border-red-300/30">
          <p class="text-red-100 text-sm flex items-center gap-2">
            <span class="text-lg">⚠️</span>
            {{ aiError }}
          </p>
        </div>
      </div>

      <!-- Kanban Board -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Pending Column -->
        <div
          @drop="onDrop($event, 'pending')"
          @dragover="dragOver"
          @dragenter="dragEnter($event, 'pending')"
          @dragleave="dragLeave"
          :class="[
            'bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-4 min-h-[500px] border-2 transition-all',
            draggedOver === 'pending' ? 'border-yellow-500 dark:border-yellow-400 bg-yellow-100 dark:bg-yellow-900/40 scale-[1.02] shadow-2xl' : 'border-yellow-200 dark:border-yellow-800'
          ]"
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
              <span class="text-2xl">📋</span>
              Pending
            </h3>
            <span class="px-3 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-bold">
              {{ getFilteredPendingTasks.length }}
            </span>
          </div>
          
          <div class="space-y-3">
            <div
              v-for="task in getFilteredPendingTasks"
              :key="task.id"
              draggable="true"
              @dragstart="dragStart($event, task)"
              @dragend="dragEnd"
              class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md hover:shadow-xl cursor-move transition-all border-l-4 border-yellow-500 dark:border-yellow-400 hover:scale-[1.02] overflow-visible"
            >
              <TaskCard :task="task" @toggle="toggleComplete" @delete="deleteTask" @duplicate="duplicateTask" />
            </div>
            
            <div v-if="getFilteredPendingTasks.length === 0" class="text-center py-12 text-yellow-600 dark:text-yellow-400 opacity-60">
              <div class="text-4xl mb-2">📋</div>
              <p class="text-sm font-medium">No pending tasks</p>
              <p class="text-xs">Drag tasks here or create new ones</p>
            </div>
          </div>
        </div>

        <!-- In Progress Column -->
        <div
          @drop="onDrop($event, 'in_progress')"
          @dragover="dragOver"
          @dragenter="dragEnter($event, 'in_progress')"
          @dragleave="dragLeave"
          :class="[
            'bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 min-h-[500px] border-2 transition-all',
            draggedOver === 'in_progress' ? 'border-blue-500 dark:border-blue-400 bg-blue-100 dark:bg-blue-900/40 scale-[1.02] shadow-2xl' : 'border-blue-200 dark:border-blue-800'
          ]"
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <span class="text-2xl">⚡</span>
              In Progress
            </h3>
            <span class="px-3 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-sm font-bold">
              {{ getFilteredInProgressTasks.length }}
            </span>
          </div>
          
          <div class="space-y-3">
            <div
              v-for="task in getFilteredInProgressTasks"
              :key="task.id"
              draggable="true"
              @dragstart="dragStart($event, task)"
              @dragend="dragEnd"
              class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md hover:shadow-xl cursor-move transition-all border-l-4 border-blue-500 dark:border-blue-400 hover:scale-[1.02] overflow-visible"
            >
              <TaskCard :task="task" @toggle="toggleComplete" @delete="deleteTask" @duplicate="duplicateTask" />
            </div>
            
            <div v-if="getFilteredInProgressTasks.length === 0" class="text-center py-12 text-blue-600 dark:text-blue-400 opacity-60">
              <div class="text-4xl mb-2">⚡</div>
              <p class="text-sm font-medium">No active tasks</p>
              <p class="text-xs">Drag tasks here to start working</p>
            </div>
          </div>
        </div>

        <!-- Completed Column -->
        <div
          @drop="onDrop($event, 'completed')"
          @dragover="dragOver"
          @dragenter="dragEnter($event, 'completed')"
          @dragleave="dragLeave"
          :class="[
            'bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 min-h-[500px] border-2 transition-all',
            draggedOver === 'completed' ? 'border-green-500 dark:border-green-400 bg-green-100 dark:bg-green-900/40 scale-[1.02] shadow-2xl' : 'border-green-200 dark:border-green-800'
          ]"
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-green-800 dark:text-green-300 flex items-center gap-2">
              <span class="text-2xl">✅</span>
              Completed
            </h3>
            <span class="px-3 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full text-sm font-bold">
              {{ getFilteredCompletedTasks.length }}
            </span>
          </div>
          
          <div class="space-y-3">
            <div
              v-for="task in getFilteredCompletedTasks"
              :key="task.id"
              draggable="true"
              @dragstart="dragStart($event, task)"
              @dragend="dragEnd"
              class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md hover:shadow-xl cursor-move transition-all border-l-4 border-green-500 dark:border-green-400 hover:scale-[1.02] opacity-80 hover:opacity-100 overflow-visible"
            >
              <TaskCard :task="task" @toggle="toggleComplete" @delete="deleteTask" @duplicate="duplicateTask" />
            </div>
            
            <div v-if="getFilteredCompletedTasks.length === 0" class="text-center py-12 text-green-600 dark:text-green-400 opacity-60">
              <div class="text-4xl mb-2">✅</div>
              <p class="text-sm font-medium">No completed tasks yet</p>
              <p class="text-xs">Complete tasks to see them here</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating Add Button -->
      <button
        @click="showForm = !showForm"
        class="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 active:scale-90 flex items-center justify-center z-50 hover:rotate-90"
        title="Add new task (Press N)"
      >
        <span class="text-3xl transition-transform">{{ showForm ? '×' : '+' }}</span>
      </button>

      <!-- Add Task Modal -->
      <transition name="modal">
        <div v-if="showForm" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showForm = false">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors" @click.stop>
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Create New Task</h2>
              <button @click="showForm = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-3xl transition">&times;</button>
            </div>
            
            <form @submit.prevent="addTask" class="space-y-5">
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Task Title <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="newTask.title"
                  type="text"
                  placeholder="e.g., Complete quarterly report"
                  required
                  class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-sm"
                />
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  v-model="newTask.description"
                  placeholder="Add details, context, or notes..."
                  rows="4"
                  class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none shadow-sm"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">🏷️ Category</label>
                <select
                  v-model="newTask.category"
                  class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-sm"
                >
                  <option value="work">💼 Work</option>
                  <option value="personal">🏠 Personal</option>
                  <option value="urgent">🔥 Urgent</option>
                  <option value="other">📌 Other</option>
                </select>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">📅 Due Date</label>
                  <input
                    v-model="newTask.due_date"
                    type="date"
                    class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-sm"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <select
                    v-model="newTask.status"
                    class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-sm"
                  >
                    <option value="pending">📋 Pending</option>
                    <option value="in_progress">⚡ In Progress</option>
                    <option value="completed">✅ Completed</option>
                  </select>
                </div>
              </div>
              
              <button
                type="submit"
                :disabled="loading"
                class="w-full px-6 py-4 text-white font-bold bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl"
              >
                <span v-if="loading">Adding...</span>
                <span v-else>+ Create Task</span>
              </button>
            </form>
          </div>
        </div>
      </transition>

      <!-- Confetti Canvas -->
      <canvas ref="confettiCanvas" class="fixed inset-0 pointer-events-none z-[100]"></canvas>
    </div>
  </div>
</template>

<script setup>
import confetti from 'canvas-confetti'

definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { $toast: toast } = useNuxtApp()

const tasks = ref([])
const loading = ref(false)
const initialLoading = ref(true)
const aiLoading = ref(false)
const aiError = ref('')
const showForm = ref(false)
const draggedTask = ref(null)
const draggedOver = ref(null)
const searchQuery = ref('')
const sortBy = ref('created')
const categoryFilter = ref('all')
const searchInput = ref(null)
const confettiCanvas = ref(null)
const lastPrioritized = ref(null)

const newTask = ref({
  title: '',
  description: '',
  due_date: '',
  status: 'pending',
  category: 'work'
})

// Keyboard shortcuts
onMounted(() => {
  fetchTasks()
  
  const handleKeyPress = (e) => {
    if (e.key === 'n' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      showForm.value = true
    }
    if (e.key === 'Escape') {
      showForm.value = false
    }
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault()
      searchInput.value?.focus()
    }
  }
  
  window.addEventListener('keydown', handleKeyPress)
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyPress)
  })
})

// Computed
const pendingCount = computed(() => tasks.value.filter(t => t.status === 'pending').length)
const completedCount = computed(() => tasks.value.filter(t => t.status === 'completed').length)
const completionPercentage = computed(() => {
  if (tasks.value.length === 0) return 0
  return Math.round((completedCount.value / tasks.value.length) * 100)
})

const overdueTasks = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return tasks.value.filter(t => {
    if (!t.due_date || t.status === 'completed') return false
    const dueDate = new Date(t.due_date)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate < today
  }).length
})

const dueTodayTasks = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return tasks.value.filter(t => {
    if (!t.due_date || t.status === 'completed') return false
    const dueDate = new Date(t.due_date)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate.getTime() === today.getTime()
  }).length
})

const highPriorityTasks = computed(() => {
  return tasks.value.filter(t => t.ai_priority_score >= 8).length
})

const filterTasks = (taskList) => {
  let filtered = taskList

  if (categoryFilter.value !== 'all') {
    filtered = filtered.filter(t => t.category === categoryFilter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(t => 
      t.title.toLowerCase().includes(query) || 
      (t.description && t.description.toLowerCase().includes(query))
    )
  }

  return filtered
}

const sortTasks = (taskList) => {
  return [...taskList].sort((a, b) => {
    if (a.ai_priority_score && b.ai_priority_score) {
      return b.ai_priority_score - a.ai_priority_score
    }
    
    if (a.ai_priority_score && !b.ai_priority_score) return -1
    if (!a.ai_priority_score && b.ai_priority_score) return 1
    
    switch (sortBy.value) {
      case 'priority':
        return 0
      case 'dueDate':
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return new Date(a.due_date) - new Date(b.due_date)
      case 'title':
        return a.title.localeCompare(b.title)
      default:
        return new Date(b.created_at) - new Date(a.created_at)
    }
  })
}

const getFilteredPendingTasks = computed(() => {
  const pending = tasks.value.filter(t => t.status === 'pending')
  return sortTasks(filterTasks(pending))
})

const getFilteredInProgressTasks = computed(() => {
  const inProgress = tasks.value.filter(t => t.status === 'in_progress')
  return sortTasks(filterTasks(inProgress))
})

const getFilteredCompletedTasks = computed(() => {
  const completed = tasks.value.filter(t => t.status === 'completed')
  return sortTasks(filterTasks(completed))
})

// Filter helpers
const filterOverdue = () => {
  searchQuery.value = ''
  categoryFilter.value = 'all'
  sortBy.value = 'dueDate'
  toast.info('📅 Showing overdue tasks')
}

const filterDueToday = () => {
  searchQuery.value = ''
  categoryFilter.value = 'all'
  sortBy.value = 'dueDate'
  toast.info('📅 Showing tasks due today')
}

// Drag & Drop
const dragStart = (event, task) => {
  event.stopPropagation()
  draggedTask.value = task
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', task.id)
  
  setTimeout(() => {
    if (event.target) {
      event.target.style.opacity = '0.4'
    }
  }, 0)
}

const dragEnd = (event) => {
  event.stopPropagation()
  if (event.target) {
    event.target.style.opacity = '1'
  }
  setTimeout(() => {
    draggedTask.value = null
    draggedOver.value = null
  }, 100)
}

const dragEnter = (event, status) => {
  event.preventDefault()
  event.stopPropagation()
  draggedOver.value = status
}

const dragLeave = (event) => {
  event.preventDefault()
  event.stopPropagation()
  if (!event.currentTarget.contains(event.relatedTarget)) {
    draggedOver.value = null
  }
}

const dragOver = (event) => {
  event.preventDefault()
  event.stopPropagation()
  event.dataTransfer.dropEffect = 'move'
}

const onDrop = async (event, newStatus) => {
  event.preventDefault()
  event.stopPropagation()
  
  draggedOver.value = null
  
  if (!draggedTask.value || draggedTask.value.status === newStatus) {
    draggedTask.value = null
    return
  }

  const task = draggedTask.value
  draggedTask.value = null

  try {
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', task.id)

    if (error) {
      toast.error('❌ Failed to move task')
    } else {
      toast.success(`✅ Moved to ${newStatus.replace('_', ' ')}`)
      await fetchTasks()
    }
  } catch (err) {
    toast.error('❌ Error moving task')
  }
}

// Functions
const fetchTasks = async () => {
  if (tasks.value.length === 0) {
    initialLoading.value = true
  }
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.value.id)
    .order('created_at', { ascending: false })

  if (error) {
    toast.error('❌ Failed to load tasks')
  } else {
    tasks.value = data || []
  }
  
  initialLoading.value = false
}

const addTask = async () => {
  if (!newTask.value.title) return

  loading.value = true
  
  const { error } = await supabase
    .from('tasks')
    .insert([{
      user_id: user.value.id,
      title: newTask.value.title,
      description: newTask.value.description,
      due_date: newTask.value.due_date || null,
      status: newTask.value.status,
      category: newTask.value.category
    }])

  loading.value = false

  if (error) {
    toast.error('❌ Failed to add task')
  } else {
    toast.success('✅ Task created!')
    newTask.value = {
      title: '',
      description: '',
      due_date: '',
      status: 'pending',
      category: 'work'
    }
    showForm.value = false
    await fetchTasks()
  }
}

const deleteTask = async (id) => {
  const taskToDelete = tasks.value.find(t => t.id === id)
  const oldTasks = [...tasks.value]
  
  tasks.value = tasks.value.filter(t => t.id !== id)
  
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.value.id)

    if (error) {
      tasks.value = oldTasks
      toast.error('❌ Failed to delete')
    } else {
      toast.success('🗑️ Deleted', {
        timeout: 5000,
        action: {
          text: 'Undo',
          onClick: () => restoreTask(taskToDelete)
        }
      })
    }
  } catch (err) {
    tasks.value = oldTasks
    toast.error('❌ Error deleting task')
  }
}

const restoreTask = async (task) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .insert([{
        id: task.id,
        user_id: task.user_id,
        title: task.title,
        description: task.description,
        due_date: task.due_date,
        status: task.status,
        category: task.category,
        ai_priority_score: task.ai_priority_score,
        ai_reasoning: task.ai_reasoning
      }])
    
    if (!error) {
      await fetchTasks()
      toast.success('↩️ Task restored!')
    }
  } catch (err) {
    toast.error('❌ Failed to restore')
  }
}

const duplicateTask = async (task) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .insert([{
        user_id: user.value.id,
        title: `${task.title} (Copy)`,
        description: task.description,
        due_date: task.due_date,
        status: 'pending',
        category: task.category
      }])

    if (!error) {
      await fetchTasks()
      toast.success('📋 Task duplicated!')
    }
  } catch (err) {
    toast.error('❌ Failed to duplicate')
  }
}

const toggleComplete = async (task) => {
  const newStatus = task.status === 'completed' ? 'pending' : 'completed'
  
  const { error } = await supabase
    .from('tasks')
    .update({ status: newStatus })
    .eq('id', task.id)

  if (error) {
    toast.error('❌ Failed to update')
  } else {
    if (newStatus === 'completed') {
      toast.success('✅ Task completed!')
      
      if (confettiCanvas.value) {
        confetti.create(confettiCanvas.value, {
          resize: true,
          useWorker: true
        })({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      }
    } else {
      toast.info('📋 Task reopened')
    }
    
    await fetchTasks()
  }
}

const prioritizeTasks = async () => {
  if (tasks.value.length === 0) {
    toast.warning('📝 Add tasks first!')
    return
  }

  aiLoading.value = true
  aiError.value = ''

  try {
    const response = await $fetch('/api/prioritize-tasks', {
      method: 'POST',
      body: {
        tasks: tasks.value.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          due_date: t.due_date,
          status: t.status
        }))
      }
    })

    if (response.success) {
      await fetchTasks()
      sortBy.value = 'priority'
      
      lastPrioritized.value = new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      })
      
      toast.success(`🤖 ${response.updated || 0} tasks prioritized!`, {
        timeout: 5000
      })
    } else {
      aiError.value = response.error || 'Failed'
      toast.error('❌ ' + aiError.value)
    }
  } catch (error) {
    aiError.value = error.message
    toast.error('❌ AI error')
  } finally {
    aiLoading.value = false
  }
}

const exportTasks = () => {
  if (tasks.value.length === 0) {
    toast.warning('📝 No tasks to export')
    return
  }

  const headers = ['Title', 'Description', 'Status', 'Category', 'Due Date', 'Priority', 'Created']
  const rows = tasks.value.map(task => [
    task.title,
    task.description || '',
    task.status,
    task.category,
    task.due_date || '',
    task.ai_priority_score || '',
    new Date(task.created_at).toLocaleDateString()
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tasks-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)

  toast.success(`📥 Exported ${tasks.value.length} tasks`)
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>