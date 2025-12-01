import OpenAI from 'openai'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const { task } = await readBody(event)
  const config = useRuntimeConfig(event)

  if (!config.openaiApiKey) {
    return { 
      success: false, 
      error: 'OpenAI API key not configured' 
    }
  }

  const openai = new OpenAI({
    apiKey: config.openaiApiKey
  })

  try {
    const prompt = `Analyze this task and provide suggestions:
Title: ${task.title}
Description: ${task.description || 'No description'}
Category: ${task.category || 'Not specified'}
Due Date: ${task.due_date || 'Not set'}

Provide:
1. Suggested subtasks (break it down into 3-5 smaller steps)
2. Recommended deadline (if not set, suggest one based on complexity)
3. Recommended category (if unclear)
4. Dependencies (what should be done first)

Respond in JSON format:
{
  "subtasks": ["step 1", "step 2", ...],
  "recommended_deadline": "YYYY-MM-DD",
  "recommended_category": "work|personal|urgent|other",
  "dependencies": ["task that should be done first"],
  "reasoning": "why these suggestions"
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 800
    })

    const response = completion.choices[0].message.content
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const suggestions = JSON.parse(cleaned)

    return { success: true, suggestions }
  } catch (error) {
    console.error('AI Suggestions error:', error)
    return { success: false, error: error.message }
  }
})