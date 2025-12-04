import OpenAI from 'openai'

export default defineEventHandler(async (event) => {
  try {
    const { message, tasks, context } = await readBody(event)
    const apiKey = process.env.OPENAI_API_KEY

    console.log('💬 AI Chat Request:', message)
    console.log('🔑 Has API Key:', !!apiKey)

    if (!apiKey) {
      return { 
        success: false, 
        message: '❌ OpenAI API key not configured.' 
      }
    }

    const openai = new OpenAI({
      apiKey: apiKey
    })

    const systemPrompt = `You are a helpful AI task management assistant. 

Current user context:
- Total tasks: ${tasks?.length || 0}
- Pending: ${tasks?.filter(t => t.status === 'pending').length || 0}
- In progress: ${tasks?.filter(t => t.status === 'in_progress').length || 0}
- Completed: ${tasks?.filter(t => t.status === 'completed').length || 0}

${context ? `Additional context: ${context}` : ''}

Provide concise, actionable advice. Keep responses under 200 words.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    const response = completion.choices[0].message.content
    console.log('✅ AI Chat response generated')

    return { 
      success: true, 
      message: response 
    }

  } catch (error) {
    console.error('❌ AI Chat error:', error.message)
    return { 
      success: false, 
      message: `Sorry, I encountered an error: ${error.message}` 
    }
  }
})