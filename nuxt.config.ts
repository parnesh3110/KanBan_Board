// @ts-nocheck
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  
  ssr: false,
  
  modules: [
    '@nuxtjs/supabase',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode'
  ],
  
  colorMode: {
    classSuffix: ''
  },

  supabase: {
    redirect: false,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/']
    }
  },

  runtimeConfig: {
    openaiApiKey: process.env.OPENAI_API_KEY || ''
  },

  app: {
    head: {
      title: 'TaskMaster Pro',
      meta: [
        { name: 'description', content: 'AI-Powered Task Management Application' }
      ]
    }
  },

  vite: {
    logLevel: 'error'
  }
})