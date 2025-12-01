import OpenAI from 'openai'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const { tasks } = await readBody(event)
    
    // Access process.env directly (loaded by the plugin)
    const apiKey = process.env.OPENAI_API_KEY

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🤖 AI PRIORITIZATION REQUEST')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 Tasks to analyze:', tasks?.length)
    console.log('🔑 Has API Key (process.env):', !!apiKey)
    console.log('🔑 Key length:', apiKey?.length || 0)

    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY not found!')
      return { 
        success: false, 
        error: 'OpenAI API key not configured' 
      }
    }

    if (!tasks || tasks.length === 0) {
      return { success: false, error: 'No tasks provided' }
    }

    const openai = new OpenAI({
      apiKey: apiKey
    })

    const prompt = `You are a task prioritization expert. Analyze these tasks and assign priority scores from 1-10.

Consider:
- Urgency: Due dates and time sensitivity
- Complexity: Effort and difficulty
- Impact: Business value and importance
- Status: Current state

Tasks to analyze:
${tasks.map((t, i) => `
${i + 1}. ID: ${t.id}
   Title: ${t.title}
   Description: ${t.description || 'None'}
   Due Date: ${t.due_date || 'Not set'}
   Status: ${t.status}
`).join('\n')}

Respond with ONLY valid JSON (no markdown, no explanation):
[
  {
    "id": "exact-task-id-here",
    "priority_score": 8,
    "reasoning": "Brief explanation under 100 chars"
  }
]`

    console.log('📤 Sending request to OpenAI...')

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are a task prioritization assistant. Respond ONLY with valid JSON array. No markdown formatting.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const response = completion.choices[0].message.content
    console.log('📥 Received response from OpenAI')

    // Parse response
    let priorities
    try {
      const cleaned = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/`/g, '')
        .trim()
      
      priorities = JSON.parse(cleaned)
      console.log('✅ Parsed priorities:', priorities.length, 'items')
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError.message)
      return { 
        success: false, 
        error: 'AI returned invalid format. Please try again.' 
      }
    }

    // Update database
    const supabase = await serverSupabaseClient(event)
    let updated = 0
    
    console.log('💾 Updating tasks in database...')
    
    for (const priority of priorities) {
      const { error } = await supabase
        .from('tasks')
        .update({
          ai_priority_score: priority.priority_score,
          ai_reasoning: priority.reasoning
        })
        .eq('id', priority.id)

      if (error) {
        console.error(`❌ Failed to update task ${priority.id}:`, error.message)
      } else {
        updated++
      }
    }

    console.log(`✅ Updated ${updated}/${priorities.length} tasks`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    return { 
      success: true, 
      priorities,
      updated: updated
    }

  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('❌ AI PRIORITIZATION ERROR')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('Error:', error.message)
    
    return { 
      success: false, 
      error: error.message 
    }
  }
})