import { ModuleOptions as ColorModeOptions } from '@nuxtjs/color-mode'


declare module 'nuxt/schema' {
  interface NuxtConfig {
    supabase?: {
      redirect?: boolean
      redirectOptions?: {
        login?: string
        callback?: string
        exclude?: string[]
      }
    }
  }
}

declare module 'nuxt/schema' {
  interface NuxtConfig {
    colorMode?: Partial<ColorModeOptions> // Changed from ColorModeOptions
  }
}

export {}