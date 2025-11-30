<template>
  <div class="relative overflow-visible" @click.stop>
    <!-- Priority Corner Badge -->
    <div v-if="task.ai_priority_score" class="absolute -top-3 -right-3 z-20">
      <div
        :class="getPriorityBadgeClass(task.ai_priority_score)"
        class="w-10 h-10 rounded-full flex items-center justify-center shadow-xl border-[3px] border-white dark:border-gray-800"
        :style="task.ai_priority_score >= 8 ? 'animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;' : ''"
      >
        <span class="text-base">{{ getPriorityIcon(task.ai_priority_score) }}</span>
      </div>
    </div>

    <!-- Urgent Tag -->
    <div v-if="task.ai_priority_score >= 8" class="absolute -top-3 left-3 z-20">
      <div class="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-lg uppercase tracking-wide animate-pulse">
        🔥 Urgent
      </div>
    </div>

    <!-- Card Content -->
    <div class="pt-6">
      <!-- Title & Actions Row -->
      <div class="flex items-start gap-2 mb-3">
        <!-- Editable Title -->
        <h4 
          v-if="!isEditing"
          @dblclick="startEdit"
          class="font-bold text-gray-900 dark:text-white flex-1 leading-snug text-base px-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition group"
          title="Double-click to edit"
        >
          {{ task.title }}
          <span class="text-xs text-gray-400 opacity-0 group-hover:opacity-100 ml-2">✏️</span>
        </h4>

        <input
          v-else
          v-model="editedTitle"
          @blur="saveEdit"
          @keyup.enter="saveEdit"
          @keyup.esc="cancelEdit"
          @click.stop
          @mousedown.stop
          class="font-bold text-gray-900 dark:text-white flex-1 text-base px-2 py-1 border-2 border-indigo-500 dark:border-indigo-400 rounded focus:outline-none bg-white dark:bg-gray-800"
          ref="editInput"
        >

        <!-- Quick Actions Menu -->
        <div class="relative flex gap-1">
          <button
            @mousedown.stop
            @click.stop="showActions = !showActions"
            class="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition"
            title="More actions"
          >
            <span class="text-lg font-bold">⋮</span>
          </button>

          <button
            @mousedown.stop
            @click.stop="handleDelete"
            class="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
            title="Delete task"
          >
            <span class="text-base">🗑️</span>
          </button>
          
          <!-- Dropdown Menu -->
          <teleport to="body">
            <div
              v-if="showActions"
              class="fixed bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-gray-200 dark:border-gray-700 py-2 z-[9999] min-w-[180px]"
              :style="menuPosition"
              @click.stop
            >
              <button
                @mousedown.stop
                @click.stop="duplicateTask"
                class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300 font-medium"
              >
                <span class="text-base">📋</span> Duplicate Task
              </button>
              <button
                @mousedown.stop
                @click.stop="setDueToday"
                class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300 font-medium"
              >
                <span class="text-base">📅</span> Set Due Today
              </button>
              <button
                @mousedown.stop
                @click.stop="shareToEmail"
                class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300 font-medium"
              >
                <span class="text-base">📧</span> Email Task
              </button>
              <hr class="my-2 border-gray-200 dark:border-gray-700">
              <button
                @mousedown.stop
                @click.stop="startEdit"
                class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300 font-medium"
              >
                <span class="text-base">✏️</span> Edit Title
              </button>
            </div>
          </teleport>
        </div>
      </div>

      <!-- Description -->
      <p v-if="task.description" class="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
        {{ task.description }}
      </p>

      <!-- Badges -->
      <div class="flex flex-wrap gap-2 mb-4">
        <!-- Category Badge -->
        <div
          v-if="task.category"
          :class="getCategoryClass(task.category)"
          class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full"
        >
          <span>{{ getCategoryIcon(task.category) }}</span>
          <span>{{ task.category }}</span>
        </div>

        <!-- Recurring Badge -->
        <div
          v-if="task.is_recurring"
          class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
        >
          <span>🔄</span>
          <span>{{ getRecurrenceText(task) }}</span>
        </div>

        <!-- AI Priority Score -->
        <div
          v-if="task.ai_priority_score"
          :class="getPriorityScoreClass(task.ai_priority_score)"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full shadow-md"
        >
          <span class="text-sm">{{ getPriorityIcon(task.ai_priority_score) }}</span>
          <span>Priority {{ task.ai_priority_score }}</span>
        </div>
        
        <!-- Due Date -->
        <div
          v-if="task.due_date"
          :class="getDueDateClass(task.due_date)"
          class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full"
        >
          <span class="text-sm">📅</span>
          <span>{{ formatDate(task.due_date) }}</span>
        </div>
      </div>

      <!-- AI Reasoning -->
      <div v-if="task.ai_reasoning" class="mb-4 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
        <div class="flex gap-3">
          <div class="w-7 h-7 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
            <span class="text-white text-xs font-black">AI</span>
          </div>
          <div class="flex-1">
            <p class="text-[10px] text-purple-900 dark:text-purple-300 font-black mb-1.5 uppercase tracking-wider">AI Analysis</p>
            <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{{ task.ai_reasoning }}</p>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <button
        @mousedown.stop
        @click.stop="$emit('toggle', task)"
        class="w-full px-4 py-3 text-sm font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
        :class="task.status === 'completed' 
          ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600' 
          : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg'"
      >
        {{ task.status === 'completed' ? '↩️ Reopen' : '✓ Mark Done' }}
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['toggle', 'delete', 'duplicate'])

const supabase = useSupabaseClient()
const { $toast: toast } = useNuxtApp()

// Inline editing
const isEditing = ref(false)
const editedTitle = ref('')
const editInput = ref(null)

const startEdit = () => {
  showActions.value = false
  isEditing.value = true
  editedTitle.value = props.task.title
  nextTick(() => {
    editInput.value?.focus()
    editInput.value?.select()
  })
}

const saveEdit = async () => {
  if (!editedTitle.value.trim()) {
    toast.warning('⚠️ Title cannot be empty')
    cancelEdit()
    return
  }
  
  if (editedTitle.value === props.task.title) {
    cancelEdit()
    return
  }
  
  const { error } = await supabase
    .from('tasks')
    .update({ title: editedTitle.value })
    .eq('id', props.task.id)
  
  if (error) {
    toast.error('❌ Failed to update')
    cancelEdit()
  } else {
    props.task.title = editedTitle.value
    toast.success('✅ Title updated')
    isEditing.value = false
  }
}

const cancelEdit = () => {
  isEditing.value = false
  editedTitle.value = ''
}

// Quick actions menu
const showActions = ref(false)
const menuPosition = ref({})

onMounted(() => {
  const handleClickOutside = () => {
    showActions.value = false
  }
  document.addEventListener('click', handleClickOutside)
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})

watch(showActions, (newVal) => {
  if (newVal) {
    nextTick(() => {
      const rect = event?.target?.getBoundingClientRect()
      if (rect) {
        menuPosition.value = {
          top: (rect.bottom + 5) + 'px',
          right: (window.innerWidth - rect.right) + 'px'
        }
      }
    })
  }
})

const handleDelete = () => {
  showActions.value = false
  emit('delete', props.task.id)
}

const duplicateTask = () => {
  emit('duplicate', props.task)
  showActions.value = false
}

const setDueToday = async () => {
  const today = new Date().toISOString().split('T')[0]
  
  const { error } = await supabase
    .from('tasks')
    .update({ due_date: today })
    .eq('id', props.task.id)
  
  if (!error) {
    props.task.due_date = today
    toast.success('📅 Due date set to today')
  } else {
    toast.error('❌ Failed to update date')
  }
  
  showActions.value = false
}

const shareToEmail = () => {
  const subject = encodeURIComponent(`Task: ${props.task.title}`)
  const body = encodeURIComponent(`Task: ${props.task.title}

Description: ${props.task.description || 'None'}
Due Date: ${props.task.due_date || 'No deadline'}
Status: ${props.task.status}
Category: ${props.task.category}
Priority: ${props.task.ai_priority_score ? props.task.ai_priority_score + '/10' : 'Not set'}

---
Sent from TaskMaster Pro`)
  
  window.location.href = `mailto:?subject=${subject}&body=${body}`
  showActions.value = false
  toast.info('📧 Opening email client...')
}

// Helper functions
const getPriorityIcon = (score) => {
  if (score >= 9) return '🔥'
  if (score >= 8) return '⚠️'
  if (score >= 6) return '⭐'
  if (score >= 4) return '📌'
  return '💡'
}

const getPriorityBadgeClass = (score) => {
  if (score >= 9) return 'bg-gradient-to-br from-red-500 via-red-600 to-red-700'
  if (score >= 8) return 'bg-gradient-to-br from-orange-500 to-red-600'
  if (score >= 6) return 'bg-gradient-to-br from-yellow-400 to-orange-500'
  if (score >= 4) return 'bg-gradient-to-br from-blue-500 to-indigo-600'
  return 'bg-gradient-to-br from-green-500 to-emerald-600'
}

const getPriorityScoreClass = (score) => {
  if (score >= 9) return 'bg-gradient-to-r from-red-500 to-red-700 text-white'
  if (score >= 8) return 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
  if (score >= 6) return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
  if (score >= 4) return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
  return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
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
  const classes = {
    work: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    personal: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
    urgent: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800',
    other: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
  }
  return classes[category] || classes.other
}

const getRecurrenceText = (task) => {
  if (!task.is_recurring) return ''
  
  const interval = task.recurrence_interval || 1
  const pattern = task.recurrence_pattern || 'daily'
  
  if (interval === 1) {
    return pattern.charAt(0).toUpperCase() + pattern.slice(1)
  }
  
  return `Every ${interval} ${pattern}`
}

const getDueDateClass = (dueDate) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800'
  if (diffDays === 0) return 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-800'
  if (diffDays <= 3) return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-800'
  return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
}

const formatDate = (date) => {
  if (!date) return 'No deadline'
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(date)
  due.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return `Overdue ${Math.abs(diffDays)}d`
  if (diffDays === 0) return 'Today!'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays <= 7) return `${diffDays} days`
  
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: .8;
    transform: scale(1.05);
  }
}
</style>