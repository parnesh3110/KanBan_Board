<template>
  <div class="px-4 py-8 max-w-4xl mx-auto">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">🤖 AI Assistant</h1>
      <button
        @click="$router.push('/')"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        ← Back
      </button>
    </div>

    <!-- Chat Container -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
      <!-- Messages -->
      <div class="h-[500px] overflow-y-auto p-6 space-y-4" ref="chatContainer">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="[
            'flex gap-3',
            msg.role === 'user' ? 'justify-end' : 'justify-start'
          ]"
        >
          <div
            :class="[
              'max-w-[80%] rounded-2xl p-4',
              msg.role === 'user'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
            ]"
          >
            <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ msg.content }}</p>
          </div>
        </div>

        <div v-if="isLoading" class="flex gap-3">
          <div class="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4">
            <div class="flex gap-2">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="border-t border-gray-200 dark:border-gray-700 p-4">
        <div class="flex gap-3">
          <input
            v-model="newMessage"
            @keyup.enter="sendMessage"
            type="text"
            placeholder="Ask me anything about your tasks..."
            class="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            @click="sendMessage"
            :disabled="!newMessage.trim() || isLoading"
            class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>

        <!-- Quick Actions -->
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="quick in quickActions"
            :key="quick"
            @click="newMessage = quick; sendMessage()"
            class="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            {{ quick }}
          </button>
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
const router = useRouter()

const messages = ref([
  {
    role: 'assistant',
    content: 'Hi! I\'m your AI task assistant. I can help you:\n\n• Get recommendations on what to work on next\n• Create new tasks with natural language\n• Get productivity advice\n• Analyze your workload\n\nWhat would you like help with?'
  }
])

const newMessage = ref('')
const isLoading = ref(false)
const chatContainer = ref(null)
const tasks = ref([])

const quickActions = [
  'What should I work on next?',
  'Create a task to review budget',
  'Show my productivity tips',
  'How many tasks do I have?'
]

const fetchTasks = async () => {
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.value.id)

  tasks.value = data || []
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || isLoading.value) return

  const userMsg = newMessage.value
  messages.value.push({
    role: 'user',
    content: userMsg
  })
  newMessage.value = ''
  isLoading.value = true

  try {
    const response = await $fetch('/api/ai-chat', {
      method: 'POST',
      body: {
        message: userMsg,
        tasks: tasks.value,
        context: `User has ${tasks.value.length} total tasks.`
      }
    })

    if (response.success) {
      messages.value.push({
        role: 'assistant',
        content: response.message
      })

      // If AI wants to create a task
      if (response.action === 'create_task') {
        await createTaskFromAI(response.task)
      }

      scrollToBottom()
    }
  } catch (error) {
    messages.value.push({
      role: 'assistant',
      content: 'Sorry, I encountered an error. Please try again.'
    })
  } finally {
    isLoading.value = false
  }
}

const createTaskFromAI = async (taskData) => {
  const { error } = await supabase
    .from('tasks')
    .insert([{
      user_id: user.value.id,
      title: taskData.title,
      description: taskData.description,
      category: taskData.category || 'work',
      due_date: taskData.due_date || null,
      status: 'pending'
    }])

  if (!error) {
    messages.value.push({
      role: 'assistant',
      content: '✅ Task created successfully! You can view it on your dashboard.'
    })
    await fetchTasks()
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

onMounted(() => {
  fetchTasks()
})
</script>