import { config } from 'dotenv'
import { resolve } from 'path'

export default defineNitroPlugin(() => {
  // Load .env file
  config({ path: resolve(process.cwd(), '.env') })
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔐 Environment Variables Loaded')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY)
  console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0)
  console.log('SUPABASE_URL exists:', !!process.env.SUPABASE_URL)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
})