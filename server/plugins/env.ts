import { config } from 'dotenv'
import { resolve } from 'path'

export default defineNitroPlugin(() => {
  // Load .env file
  config({ path: resolve(process.cwd(), '.env') })
  
  console.log('[Server] Environment variables loaded')
  console.log('[Server] OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY)
  console.log('[Server] OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0)
  console.log('[Server] SUPABASE_URL exists:', !!process.env.SUPABASE_URL)
})