import OpenAI from 'openai'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  
  console.log('🔍 Runtime Config Check:')
  console.log('- Has openaiApiKey:', !!config.openaiApiKey)
  console.log('- Key length:', config.openaiApiKey?.length || 0)
  console.log('- Key preview:', config.openaiApiKey?.substring(0, 20) + '...')
  
  if (!config.openaiApiKey) {
    return {
      success: false,
      error: 'OpenAI API key not found in runtime config',
      config: {
        hasKey: false
      }
    }
  }

  try {
    const openai = new OpenAI({
      apiKey: config.openaiApiKey
    })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: 'Say "API key works!" if you can read this.' }
      ],
      max_tokens: 20
    })

    return {
      success: true,
      message: completion.choices[0].message.content,
      config: {
        hasKey: true,
        keyLength: config.openaiApiKey.length
      }
    }
  } catch (error) {
    console.error('OpenAI test error:', error)
    return {
      success: false,
      error: error.message,
      details: error.stack
    }
  }
})