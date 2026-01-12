<template>
  <div class="px-4 py-8 max-w-6xl mx-auto">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
          🤖 AI Task Assistant
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Powered by GPT-4 • {{ tasks.length }} tasks in context • {{ messages.length - 1 }} messages
        </p>
      </div>
      <div class="flex gap-3">
        <button
          @click="showInsights = !showInsights"
          class="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 font-medium transition"
          title="Toggle AI Insights"
        >
          📊 Insights
        </button>
        <button
          @click="exportChat"
          class="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 font-medium transition"
          title="Export Conversation"
        >
          💾 Export
        </button>
        <button
          @click="clearChat"
          class="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 font-medium transition"
        >
          🗑️ Clear
        </button>
        <button
          @click="$router.push('/')"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          ← Back
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Chat Area -->
      <div class="lg:col-span-2">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <!-- Messages -->
          <div class="h-[600px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800" ref="chatContainer">
            <div v-for="(msg, index) in messages" :key="index" class="flex gap-3" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
              <div v-if="msg.role === 'assistant'" class="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <span class="text-white text-lg">🤖</span>
              </div>

              <div :class="[
                'max-w-[80%] rounded-2xl p-4 shadow-md',
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
              ]">
                <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ msg.content }}</p>
                
                <div v-if="msg.action" class="mt-3 pt-3 border-t" :class="msg.role === 'user' ? 'border-white/20' : 'border-gray-200 dark:border-gray-600'">
                  <div class="flex items-center gap-2 text-xs font-bold" :class="msg.role === 'user' ? 'text-white/90' : 'text-indigo-600 dark:text-indigo-400'">
                    <span class="text-base">{{ getActionIcon(msg.action) }}</span>
                    <span>{{ getActionLabel(msg.action) }}</span>
                  </div>
                </div>
              </div>

              <div v-if="msg.role === 'user'" class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg text-white font-bold text-sm">
                {{ user?.email?.charAt(0).toUpperCase() }}
              </div>
            </div>

            <div v-if="isLoading" class="flex gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <span class="text-white text-lg">🤖</span>
              </div>
              <div class="bg-white dark:bg-gray-700 rounded-2xl p-4 border border-gray-200 dark:border-gray-600">
                <div class="flex gap-2">
                  <div class="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce"></div>
                  <div class="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                  <div class="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Input -->
          <div class="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
            <div class="flex gap-3 mb-3">
              <button
                v-if="speechSupported"
                @click="toggleVoiceInput"
                :class="[
                  'px-4 py-3 rounded-xl font-bold transition shadow-lg flex items-center gap-2',
                  isListening 
                    ? 'bg-red-600 text-white animate-pulse' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                ]"
                :title="isListening ? 'Stop Recording' : 'Voice Input'"
              >
                <span class="text-xl">{{ isListening ? '⏹️' : '🎤' }}</span>
              </button>
              <input
                v-model="newMessage"
                @keyup.enter="sendMessage"
                type="text"
                placeholder="💬 Ask anything: 'Create task', 'Show pending', 'What should I work on?'"
                class="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                :disabled="isLoading"
              />
              <button
                @click="sendMessage"
                :disabled="!newMessage.trim() || isLoading"
                class="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition shadow-lg"
              >
                Send
              </button>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                v-for="quick in quickActions"
                :key="quick.text"
                @click="newMessage = quick.text; sendMessage()"
                :disabled="isLoading"
                class="px-3 py-2 text-xs bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 transition font-medium flex items-center gap-2"
              >
                <span>{{ quick.icon }}</span>
                <span>{{ quick.text }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="lg:col-span-1 space-y-4">
        <!-- Stats -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">📊 Task Summary</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">📋 Pending</span>
              <span class="text-xl font-bold text-yellow-600">{{ pendingCount }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">⚡ In Progress</span>
              <span class="text-xl font-bold text-blue-600">{{ inProgressCount }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">✅ Done</span>
              <span class="text-xl font-bold text-green-600">{{ completedCount }}</span>
            </div>
          </div>
          <button
            @click="fetchTasks"
            class="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm"
          >
            🔄 Refresh
          </button>
        </div>

        <!-- AI Insights Panel -->
        <div v-if="showInsights && aiInsights" class="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">🧠 AI Insights</h3>
          
          <div class="space-y-3 mb-4">
            <div v-for="insight in aiInsights.insights?.insights?.slice(0, 4)" :key="insight.type" 
                 class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
              <div class="flex justify-between items-center">
                <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {{ insight.icon }} {{ insight.title }}
                </span>
                <span class="text-lg font-bold text-purple-600 dark:text-purple-400">{{ insight.value }}</span>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">{{ insight.description }}</p>
            </div>
          </div>

          <div v-if="aiInsights.suggestions?.length > 0" class="pt-3 border-t border-purple-200 dark:border-purple-700">
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-2">💡 Smart Suggestions</h4>
            <div class="space-y-2">
              <div v-for="(suggestion, idx) in aiInsights.suggestions.slice(0, 2)" :key="idx"
                   class="text-xs text-gray-700 dark:text-gray-300 p-2 bg-white dark:bg-gray-800 rounded-lg">
                {{ suggestion.message }}
              </div>
            </div>
          </div>

          <button
            @click="loadInsights"
            class="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm"
          >
            🔄 Refresh Insights
          </button>
        </div>

        <!-- Examples -->
        <div class="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-800">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">💡 Try These</h3>
          <div class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <div>✅ "Add urgent task: Client presentation Friday"</div>
            <div>🗑️ "Delete all completed tasks"</div>
            <div>✏️ "Change budget task to in progress"</div>
            <div>📋 "Show high priority tasks"</div>
            <div>🔍 "Find meeting tasks"</div>
            <div>💡 "What needs my attention?"</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <transition name="slide-up">
      <div v-if="lastAction" class="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 z-50">
        <span class="text-3xl">{{ getActionIcon(lastAction.action) }}</span>
        <div>
          <div class="font-bold">Success!</div>
          <div class="text-sm opacity-90">{{ lastAction.message }}</div>
        </div>
        <button @click="$router.push('/')" class="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 text-sm font-bold">
          View →
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { useSpeechRecognition } from '~/composables/useSpeechRecognition'

definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { $toast } = useNuxtApp()
const toast = $toast

// setup voice recognition for hands-free input
const { isListening, isSupported: speechSupported, transcript, toggle: toggleVoiceInput } = useSpeechRecognition()

// when the user speaks, put the text in the input field
watch(transcript, (newTranscript) => {
  if (newTranscript) {
    newMessage.value = newTranscript
  }
})

// auto-send the message when they stop talking
watch(isListening, (listening, wasListening) => {
  if (wasListening && !listening && newMessage.value.trim()) {
    setTimeout(() => {
      sendMessage()
    }, 500)
  }
})

const messages = ref([
  {
    role: 'assistant',
    content: `Hey! 👋 I'm here to help you manage your tasks!

Here's what I can do:
✅ Create tasks - "add task: finish homework by friday"
🗑️ Delete tasks - "delete the assignment task"
✏️ Update tasks - "mark homework as done"
📋 List tasks - "show my pending tasks"
🔍 Search - "find tasks about meetings"
🔄 Bulk actions - "mark all overdue as completed"
💡 Get advice - "what should i work on today?"
📊 Check progress - "how am i doing?" or "show my stats"
🎤 Voice input - just click the mic and talk!

**Cool features:**
🧠 I remember our chats so you don't have to repeat yourself
📅 I get dates like "next friday" or "in 3 days"
🎯 I can tell when something's urgent and sort it for you
📈 I'll give you tips on staying productive

Just type or use your voice - whatever works for you!`
  }
])

const newMessage = ref('')
const isLoading = ref(false)
const chatContainer = ref(null)
const tasks = ref([])
const lastAction = ref(null)
const showInsights = ref(false)
const aiInsights = ref(null)

const quickActions = [
  { icon: '📝', text: 'Create: Review emails' },
  { icon: '📋', text: 'Show pending tasks' },
  { icon: '⚠️', text: 'List overdue' },
  { icon: '🔥', text: 'High priority tasks' },
  { icon: '💡', text: 'What to prioritize?' },
  { icon: '📅', text: 'Tasks due today' }
]

const pendingCount = computed(() => tasks.value.filter(t => t.status === 'pending').length)
const inProgressCount = computed(() => tasks.value.filter(t => t.status === 'in_progress').length)
const completedCount = computed(() => tasks.value.filter(t => t.status === 'completed').length)

// load all tasks from the database
const fetchTasks = async () => {
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.value.id)
    .order('created_at', { ascending: false })

  tasks.value = data || []
  toast.success(`🔄 Loaded ${tasks.value.length} tasks`)
}

// get AI-generated insights about productivity
const loadInsights = async () => {
  try {
    const data = await $fetch('/api/ai-insights')
    if (data.success) {
      aiInsights.value = data
      toast.success('📊 Insights loaded')
    }
  } catch (error) {
    console.error('Failed to load insights:', error)
    toast.error('Failed to load insights')
  }
}

// load previous chat messages from database
const loadChatHistory = async () => {
  try {
    // First try to load from localStorage (instant)
    const hasLocalMessages = loadChatFromLocalStorage()
    
    // Then try to load from database (if table exists)
    const data = await $fetch('/api/chat-history?limit=50')
    if (data.success && data.messages.length > 0) {
      const welcomeMsg = messages.value[0]
      // Merge database messages with localStorage messages (database takes precedence)
      messages.value = [welcomeMsg, ...data.messages]
      toast.success(`📜 Loaded ${data.messages.length} messages from database`)
    } else if (hasLocalMessages) {
      toast.success(`💾 Restored ${messages.value.length - 1} messages from cache`)
    }
  } catch (error) {
    console.error('Failed to load chat history:', error)
    // If database fails, localStorage messages are already loaded
  }
}

// download the entire conversation as a JSON file
const exportChat = async () => {
  try {
    const format = 'json'
    const data = await $fetch(`/api/chat-export?format=${format}`)
    
    // create a downloadable file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-chat-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('💾 Chat exported successfully')
  } catch (error) {
    console.error('Failed to export chat:', error)
    toast.error('Failed to export chat')
  }
}

// save chat messages to localStorage
const saveChatToLocalStorage = () => {
  try {
    // Save all messages except the welcome message
    const chatMessages = messages.value.slice(1)
    localStorage.setItem('ai-chat-messages', JSON.stringify(chatMessages))
  } catch (error) {
    console.error('Failed to save chat to localStorage:', error)
  }
}

// load chat messages from localStorage
const loadChatFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem('ai-chat-messages')
    if (saved) {
      const chatMessages = JSON.parse(saved)
      if (chatMessages.length > 0) {
        // Keep welcome message and add saved messages
        const welcomeMsg = messages.value[0]
        messages.value = [welcomeMsg, ...chatMessages]
        return true
      }
    }
  } catch (error) {
    console.error('Failed to load chat from localStorage:', error)
  }
  return false
}

const clearChat = () => {
  messages.value = messages.value.slice(0, 1)  // keep just the welcome message
  localStorage.removeItem('ai-chat-messages')  // also clear localStorage
  toast.success('🗑️ Chat cleared')
}

// send a message to the AI
const sendMessage = async () => {
  if (!newMessage.value.trim() || isLoading.value) return

  const userMsg = newMessage.value
  messages.value.push({ role: 'user', content: userMsg })
  newMessage.value = ''
  isLoading.value = true
  scrollToBottom()

  try {
    // send to our API which talks to OpenAI
    const response = await $fetch('/api/ai-chat', {
      method: 'POST',
      body: {
        message: userMsg,
        conversationHistory: messages.value.slice(-10)  // send last 10 messages for context
      }
    })

    if (response.success) {
      messages.value.push({
        role: 'assistant',
        content: response.message,
        action: response.action
      })

      // if AI did something (like create a task), show a notification
      if (response.action) {
        lastAction.value = {
          action: response.action,
          message: response.message
        }
        
        setTimeout(() => lastAction.value = null, 6000)
        
        // refresh tasks if they were modified
        if (['create_task', 'delete_task', 'update_task', 'bulk_update'].includes(response.action)) {
          setTimeout(() => fetchTasks(), 500)
        }
      }

      scrollToBottom()
    }
  } catch (error) {
    messages.value.push({
      role: 'assistant',
      content: '❌ Error: ' + error.message
    })
    toast.error('AI request failed')
  } finally {
    isLoading.value = false
  }
}

// scroll to bottom of chat when new messages arrive
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTo({ top: chatContainer.value.scrollHeight, behavior: 'smooth' })
    }
  })
}

// get emoji icon for different action types
const getActionIcon = (action) => {
  return { create_task: '✅', delete_task: '🗑️', update_task: '✏️', list_tasks: '📋', search_tasks: '🔍', recommend: '💡', bulk_update: '🔄' }[action] || '💬'
}

// get readable label for action types
const getActionLabel = (action) => {
  return { create_task: 'Created', delete_task: 'Deleted', update_task: 'Updated', list_tasks: 'Listed', search_tasks: 'Searched', recommend: 'Recommended', bulk_update: 'Bulk Updated' }[action] || 'Done'
}

// watch messages and auto-save to localStorage
watch(messages, () => {
  saveChatToLocalStorage()
}, { deep: true })

// load everything when the page first loads
onMounted(() => {
  fetchTasks()
  loadChatHistory()
  loadInsights()
})
</script>

<style scoped>
.slide-up-enter-active { animation: slideUp 0.3s ease; }
.slide-up-leave-active { animation: slideUp 0.3s ease reverse; }

@keyframes slideUp {
  from { transform: translateY(100px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>