import OpenAI from 'openai'
import { serverSupabaseClient } from '#supabase/server'
import { parseNaturalDate, extractDueDate } from '../utils/dateParser'
import { analyzeSentiment, detectCategory, extractTaskTitle } from '../utils/sentimentAnalyzer'
import { generateInsights, suggestNextActions } from '../utils/taskAnalytics'

export default defineEventHandler(async (event) => {
  try {
    const { message, conversationHistory } = await readBody(event)
    const apiKey = process.env.OPENAI_API_KEY

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('AI CHAT REQUEST')
    console.log('Message:', message)
    console.log('Has API Key:', !!apiKey)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    if (!apiKey) {
      return { 
        success: false, 
        message: 'ERROR: OpenAI API key not configured.' 
      }
    }

    // get the current user and their tasks from the database
    const supabase = await serverSupabaseClient(event)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'Not authenticated' }
    }

    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // load past conversations from the database so AI remembers context
    const { data: dbHistory } = await supabase
      .from('chat_conversations')
      .select('role, content, action')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    const openai = new OpenAI({ apiKey })

    // calculate some basic stats about the user's tasks
    const stats = {
      total: tasks?.length || 0,
      pending: tasks?.filter(t => t.status === 'pending').length || 0,
      in_progress: tasks?.filter(t => t.status === 'in_progress').length || 0,
      completed: tasks?.filter(t => t.status === 'completed').length || 0,
      high_priority: tasks?.filter(t => t.ai_priority_score >= 8).length || 0,
      overdue: tasks?.filter(t => {
        if (!t.due_date || t.status === 'completed') return false
        return new Date(t.due_date) < new Date()
      }).length || 0
    }

    // generate smart insights and suggestions using our analytics
    const insights = generateInsights(tasks || [])
    const suggestions = suggestNextActions(tasks || [])

    const systemPrompt = `You are an intelligent AI task management assistant with advanced capabilities.

CURRENT USER CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Statistics:
- Total Tasks: ${stats.total}
- Pending: ${stats.pending}
- In Progress: ${stats.in_progress}
- Completed: ${stats.completed}
- High Priority (≥8): ${stats.high_priority}
- Overdue: ${stats.overdue}

💡 AI Insights:
${insights.summary}

🎯 Smart Suggestions:
${suggestions.map(s => `- ${s.message}`).join('\n')}

📋 Recent Tasks (Top 15):
${tasks?.slice(0, 15).map((t, i) => `${i + 1}. [ID: ${t.id.substring(0, 8)}] "${t.title}"
   Status: ${t.status} | Category: ${t.category} | Due: ${t.due_date || 'none'}
   Priority: ${t.ai_priority_score || 'unscored'}/10${t.ai_reasoning ? ' - ' + t.ai_reasoning : ''}`).join('\n\n') || 'No tasks yet'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ENHANCED CAPABILITIES - You have these powerful features:

1️⃣ CREATE TASK - Extract details from natural language with smart defaults
Examples: "Add task to review budget tomorrow", "Create urgent task: client meeting Friday 2pm"
- Auto-detect category from context (work, personal, health, finance, learning, social)
- Parse natural dates: "tomorrow", "next Friday", "in 3 days", "end of month"
- Analyze sentiment for urgency (detect words like urgent, ASAP, critical)
- Extract clean task titles automatically
Response format:
{
  "action": "create_task",
  "task": {
    "title": "Review budget",
    "description": "Quarterly budget review for Q1",
    "category": "work",
    "due_date": "2026-01-12",
    "status": "pending",
    "ai_priority_score": 8
  }
}

2️⃣ DELETE TASK - Identify by title/description match
Examples: "Delete the assignment task", "Remove budget task"
Response format:
{
  "action": "delete_task",
  "task_id": "matching-uuid"
}

3️⃣ UPDATE TASK - Modify existing tasks
Examples: "Mark budget task as done", "Change client meeting to tomorrow"
Response format:
{
  "action": "update_task",
  "task_id": "uuid",
  "updates": {
    "status": "completed",
    "due_date": "2026-01-12"
  }
}

4️⃣ LIST TASKS - Filter and show tasks
Examples: "Show pending tasks", "List overdue tasks", "What's due today?"
Response format:
{
  "action": "list_tasks",
  "filter": "pending|completed|in_progress|overdue|today|high_priority"
}

5️⃣ SEARCH TASKS - Find by keyword
Examples: "Find tasks about budget", "Search meeting tasks"
Response format:
{
  "action": "search_tasks",
  "query": "budget"
}

6️⃣ PRIORITIZE - Recommend what to work on
Examples: "What should I work on?", "What's most important?"
Use the AI suggestions above to provide intelligent recommendations
Response format:
{
  "action": "recommend",
  "message": "Based on your current workload, I recommend [specific advice with reasoning]"
}

7️⃣ BULK OPERATIONS - Multiple tasks at once
Examples: "Mark all overdue tasks as completed", "Delete all completed tasks"
Response format:
{
  "action": "bulk_update",
  "filter": "overdue|completed|pending",
  "updates": {"status": "completed"}
}

8️⃣ INSIGHTS - Provide productivity analysis
Examples: "How am I doing?", "Show my productivity", "Any insights?"
Use the insights data above to provide meaningful analysis
Response format:
{
  "action": "insights",
  "message": "Here's your productivity analysis: [detailed insights]"
}

INTELLIGENCE RULES:
- Be proactive: If user says "budget meeting", auto-categorize as "work"
- Smart dates: Use natural language parsing - "tomorrow", "next Friday", "in 3 days"
- Context aware: Remember previous conversation from history
- Fuzzy matching: "assignment" can match "Complete assignment task"
- Multi-step: Can create multiple tasks from one request
- Validate: Check if task exists before deleting/updating
- Sentiment analysis: Detect urgency from tone (urgent, ASAP, critical = high priority)
- Learning: Adapt to user patterns and preferences
- Proactive suggestions: Offer helpful advice based on task patterns

CONVERSATION MEMORY:
You have access to past conversations. Use this context to:
- Remember user preferences and patterns
- Provide personalized recommendations
- Understand references to previous discussions
- Build on past interactions

For regular conversation (not actions), provide helpful, concise advice in plain text.
Be friendly, supportive, and proactive in helping the user stay productive.`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []).slice(-8),
      { role: 'user', content: message }
    ]

    console.log('[AI Chat] Sending request to OpenAI...')

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 1500
    })

    const response = completion.choices[0].message.content
    console.log('[AI Chat] Response received:', response.substring(0, 150) + '...')

    // save the user's message to database for conversation history
    await supabase.from('chat_conversations').insert({
      user_id: user.id,
      role: 'user',
      content: message,
      metadata: {}
    })

    // check if the AI wants to do an action (like create a task)
    let actionResult = null
    try {
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed = JSON.parse(cleaned)
      
      if (parsed.action) {
        console.log('[AI Chat] Executing action:', parsed.action)
        actionResult = await executeAction(parsed, supabase, user.id, tasks)
        console.log('[AI Chat] Action executed:', actionResult)
      }
    } catch (e) {
      // not JSON, just a regular text response - that's totally fine
      console.log('[AI Chat] Regular text response (not an action)')
    }

    // save the AI's response to database too
    await supabase.from('chat_conversations').insert({
      user_id: user.id,
      role: 'assistant',
      content: actionResult?.message || response,
      action: actionResult?.action || null,
      metadata: actionResult?.data || {}
    })

    return { 
      success: true, 
      message: actionResult?.message || response,
      action: actionResult?.action,
      data: actionResult?.data
    }

  } catch (error) {
    console.error('=========================================')
    console.error('[AI Chat] ERROR:', error.message)
    console.error('=========================================')
    return { 
      success: false, 
      message: `ERROR: ${error.message}` 
    }
  }
})

async function executeAction(parsed, supabase, userId, existingTasks) {
  console.log('[Action] Executing:', parsed.action)
  
  switch (parsed.action) {
    case 'create_task': {
      console.log('[Action] Creating task:', parsed.task.title)
      
      // Use sentiment analysis to determine priority if not provided
      const sentiment = analyzeSentiment(parsed.task.title + ' ' + (parsed.task.description || ''))
      const aiPriorityScore = parsed.task.ai_priority_score || sentiment.urgency
      
      // Auto-detect category if not provided
      const category = parsed.task.category || detectCategory(parsed.task.title + ' ' + (parsed.task.description || ''))
      
      // Parse natural language date if provided
      let dueDate = parsed.task.due_date
      if (dueDate && !dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const parsedDate = parseNaturalDate(dueDate)
        if (parsedDate) dueDate = parsedDate
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          user_id: userId,
          title: parsed.task.title,
          description: parsed.task.description || null,
          category: category,
          due_date: dueDate || null,
          status: parsed.task.status || 'pending',
          ai_priority_score: aiPriorityScore,
          ai_reasoning: sentiment.keywords.length > 0 
            ? `Detected urgency keywords: ${sentiment.keywords.join(', ')}`
            : null
        }])
        .select()
      
      if (error) {
        console.error('[Action] Create error:', error)
        throw error
      }
      
      console.log('[Action] Task created successfully')
      
      return {
        action: 'create_task',
        message: `Created task: "${parsed.task.title}"${dueDate ? ` (Due: ${dueDate})` : ''} [${category}] Priority: ${aiPriorityScore}/10`,
        data: data[0]
      }
    }

    case 'delete_task': {
      console.log('[Action] Deleting task:', parsed.task_id)
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', parsed.task_id)
        .eq('user_id', userId)
      
      if (error) {
        console.error('[Action] Delete error:', error)
        throw error
      }
      
      const deletedTask = existingTasks.find(t => t.id === parsed.task_id)
      console.log('[Action] Task deleted')
      
      return {
        action: 'delete_task',
        message: `Deleted task: "${deletedTask?.title || 'Task'}"`,
        data: { task_id: parsed.task_id }
      }
    }

    case 'update_task': {
      console.log('[Action] Updating task:', parsed.task_id, parsed.updates)
      
      const { error } = await supabase
        .from('tasks')
        .update(parsed.updates)
        .eq('id', parsed.task_id)
        .eq('user_id', userId)
      
      if (error) {
        console.error('[Action] Update error:', error)
        throw error
      }
      
      const updatedTask = existingTasks.find(t => t.id === parsed.task_id)
      console.log('[Action] Task updated')
      
      return {
        action: 'update_task',
        message: `Updated "${updatedTask?.title || 'Task'}" - ${Object.keys(parsed.updates).join(', ')} changed`,
        data: { task_id: parsed.task_id, updates: parsed.updates }
      }
    }

    case 'list_tasks': {
      console.log('[Action] Listing tasks with filter:', parsed.filter)
      
      let filtered = existingTasks
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (parsed.filter === 'pending') {
        filtered = filtered.filter(t => t.status === 'pending')
      } else if (parsed.filter === 'completed') {
        filtered = filtered.filter(t => t.status === 'completed')
      } else if (parsed.filter === 'in_progress') {
        filtered = filtered.filter(t => t.status === 'in_progress')
      } else if (parsed.filter === 'overdue') {
        filtered = filtered.filter(t => {
          if (!t.due_date || t.status === 'completed') return false
          return new Date(t.due_date) < today
        })
      } else if (parsed.filter === 'today') {
        const todayStr = today.toISOString().split('T')[0]
        filtered = filtered.filter(t => t.due_date === todayStr)
      } else if (parsed.filter === 'high_priority') {
        filtered = filtered.filter(t => t.ai_priority_score >= 8)
      }
      
      const taskList = filtered.slice(0, 20).map((t, i) => 
        `${i + 1}. "${t.title}" - ${t.status}${t.category ? ` [${t.category}]` : ''}${t.due_date ? ` (Due: ${t.due_date})` : ''}${t.ai_priority_score ? ` Priority: ${t.ai_priority_score}/10` : ''}`
      ).join('\n')
      
      console.log(`[Action] Found ${filtered.length} tasks`)
      
      return {
        action: 'list_tasks',
        message: `Found ${filtered.length} ${parsed.filter || 'total'} task${filtered.length !== 1 ? 's' : ''}:\n\n${taskList || 'No tasks found'}`,
        data: filtered
      }
    }

    case 'search_tasks': {
      console.log('[Action] Searching for:', parsed.query)
      
      const query = parsed.query.toLowerCase()
      const results = existingTasks.filter(t => 
        t.title.toLowerCase().includes(query) ||
        (t.description && t.description.toLowerCase().includes(query)) ||
        t.category?.toLowerCase().includes(query)
      )
      
      const taskList = results.slice(0, 15).map((t, i) => 
        `${i + 1}. "${t.title}" - ${t.status}${t.category ? ` [${t.category}]` : ''}`
      ).join('\n')
      
      console.log(`[Action] Found ${results.length} matches`)
      
      return {
        action: 'search_tasks',
        message: `Found ${results.length} task${results.length !== 1 ? 's' : ''} matching "${parsed.query}":\n\n${taskList || 'No matches found'}`,
        data: results
      }
    }

    case 'recommend': {
      // AI already provided recommendation in message
      return {
        action: 'recommend',
        message: parsed.message
      }
    }

    case 'insights': {
      // Generate and return productivity insights
      const insights = generateInsights(existingTasks)
      const suggestions = suggestNextActions(existingTasks)
      
      let insightsMessage = `**Productivity Insights**\n\n${insights.summary}\n\n`
      
      if (insights.insights && insights.insights.length > 0) {
        insightsMessage += '**Key Metrics:**\n'
        insights.insights.forEach(insight => {
          insightsMessage += `${insight.icon} ${insight.title}: ${insight.value}\n`
        })
        insightsMessage += '\n'
      }
      
      if (suggestions && suggestions.length > 0) {
        insightsMessage += '**Recommendations:**\n'
        suggestions.slice(0, 3).forEach((sug, i) => {
          insightsMessage += `${i + 1}. ${sug.message}\n`
        })
      }
      
      return {
        action: 'insights',
        message: insightsMessage,
        data: { insights, suggestions }
      }
    }

    case 'bulk_update': {
      console.log('[Action] Bulk update with filter:', parsed.filter)
      
      let tasksToUpdate = existingTasks
      
      if (parsed.filter === 'overdue') {
        const today = new Date()
        tasksToUpdate = tasksToUpdate.filter(t => {
          if (!t.due_date || t.status === 'completed') return false
          return new Date(t.due_date) < today
        })
      } else if (parsed.filter === 'completed') {
        tasksToUpdate = tasksToUpdate.filter(t => t.status === 'completed')
      } else if (parsed.filter === 'pending') {
        tasksToUpdate = tasksToUpdate.filter(t => t.status === 'pending')
      }
      
      const taskIds = tasksToUpdate.map(t => t.id)
      
      if (taskIds.length === 0) {
        return {
          action: 'bulk_update',
          message: `No ${parsed.filter} tasks found to update`
        }
      }
      
      const { error } = await supabase
        .from('tasks')
        .update(parsed.updates)
        .in('id', taskIds)
        .eq('user_id', userId)
      
      if (error) throw error
      
      console.log(`[Action] Updated ${taskIds.length} tasks`)
      
      return {
        action: 'bulk_update',
        message: `Updated ${taskIds.length} ${parsed.filter} task${taskIds.length !== 1 ? 's' : ''}`,
        data: { count: taskIds.length }
      }
    }

    default:
      return {
        message: parsed.message || 'I understand, but I\'m not sure what action to take.'
      }
  }
}