<template>
  <div class="px-4 py-8">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">🧠 Mind Map</h1>
      <div class="flex gap-3">
        <button
          @click="savePositions"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          💾 Save Layout
        </button>
        <button
          @click="$router.push('/')"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          ← Back
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 h-[700px] relative overflow-hidden" ref="mindmapContainer">
      <!-- SVG for connection lines -->
      <svg class="absolute inset-0 w-full h-full pointer-events-none z-0">
        <g v-for="line in connectionLines" :key="line.id">
          <line
            :x1="line.x1"
            :y1="line.y1"
            :x2="line.x2"
            :y2="line.y2"
            stroke="#6366f1"
            stroke-width="2"
            stroke-dasharray="5,5"
            class="opacity-50"
          />
        </g>
      </svg>

      <!-- Task nodes -->
      <div
        v-for="task in tasks"
        :key="task.id"
        :style="{
          position: 'absolute',
          left: task.position_x + 'px',
          top: task.position_y + 'px',
          cursor: draggingTask?.id === task.id ? 'grabbing' : 'grab',
          zIndex: 10
        }"
        @mousedown="startDrag($event, task)"
        class="w-56 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl p-4 shadow-lg border-2 border-indigo-200 dark:border-indigo-800 hover:shadow-xl transition"
      >
        <div class="font-bold text-sm text-gray-900 dark:text-white mb-2">
          {{ task.title }}
        </div>
        <div class="flex items-center gap-2 mb-2">
          <span :class="getCategoryClass(task.category)" class="text-xs px-2 py-1 rounded-full">
            {{ getCategoryIcon(task.category) }} {{ task.category }}
          </span>
        </div>
        <div class="text-xs text-gray-600 dark:text-gray-400">
          {{ task.status.replace('_', ' ') }}
        </div>
        
        <!-- Connect button -->
        <button
          v-if="!connectingFrom || connectingFrom.id !== task.id"
          @mousedown.stop
          @click.stop="startConnection(task)"
          class="mt-2 w-full px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {{ connectingFrom ? '→ Connect Here' : '🔗 Connect' }}
        </button>
        <button
          v-if="connectingFrom?.id === task.id"
          @mousedown.stop
          @click.stop="cancelConnection"
          class="mt-2 w-full px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
        >
          ✕ Cancel
        </button>
      </div>
    </div>

    <div class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
      💡 Drag tasks to organize • Click "Connect" on two tasks to draw relationship lines
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const tasks = ref([])
const draggingTask = ref(null)
const dragOffset = ref({ x: 0, y: 0 })
const mindmapContainer = ref(null)
const connectingFrom = ref(null)
const connections = ref([])

const connectionLines = computed(() => {
  return connections.value.map((conn, index) => {
    const fromTask = tasks.value.find(t => t.id === conn.from)
    const toTask = tasks.value.find(t => t.id === conn.to)
    
    if (!fromTask || !toTask) return null
    
    return {
      id: index,
      x1: fromTask.position_x + 112, // center of card (224/2)
      y1: fromTask.position_y + 60,
      x2: toTask.position_x + 112,
      y2: toTask.position_y + 60
    }
  }).filter(Boolean)
})

const fetchTasks = async () => {
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.value.id)

  // Initialize random positions if not set
  tasks.value = data?.map((task, index) => ({
    ...task,
    position_x: task.position_x || 100 + (index % 4) * 280,
    position_y: task.position_y || 100 + Math.floor(index / 4) * 180
  })) || []

  // Load connections (you can store these in DB too)
  const stored = localStorage.getItem('mindmap_connections')
  if (stored) {
    connections.value = JSON.parse(stored)
  }
}

const startConnection = (task) => {
  if (!connectingFrom.value) {
    connectingFrom.value = task
  } else {
    // Create connection
    connections.value.push({
      from: connectingFrom.value.id,
      to: task.id
    })
    localStorage.setItem('mindmap_connections', JSON.stringify(connections.value))
    connectingFrom.value = null
  }
}

const cancelConnection = () => {
  connectingFrom.value = null
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
    work: 'bg-blue-100 text-blue-800',
    personal: 'bg-purple-100 text-purple-800',
    urgent: 'bg-red-100 text-red-800',
    other: 'bg-gray-100 text-gray-800'
  }
  return classes[category] || classes.other
}

const startDrag = (event, task) => {
  draggingTask.value = task
  const container = mindmapContainer.value.getBoundingClientRect()
  dragOffset.value = {
    x: event.clientX - container.left - task.position_x,
    y: event.clientY - container.top - task.position_y
  }

  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
}

const onDrag = (event) => {
  if (!draggingTask.value) return

  const container = mindmapContainer.value.getBoundingClientRect()
  
  draggingTask.value.position_x = Math.max(0, Math.min(container.width - 224, event.clientX - container.left - dragOffset.value.x))
  draggingTask.value.position_y = Math.max(0, Math.min(container.height - 120, event.clientY - container.top - dragOffset.value.y))
}

const stopDrag = () => {
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  draggingTask.value = null
}

const savePositions = async () => {
  for (const task of tasks.value) {
    await supabase
      .from('tasks')
      .update({
        position_x: task.position_x,
        position_y: task.position_y
      })
      .eq('id', task.id)
  }

  alert('✅ Layout saved!')
}

onMounted(() => {
  fetchTasks()
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
})
</script>