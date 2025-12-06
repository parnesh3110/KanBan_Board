import Toast, { useToast as vueToastUseToast } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Toast, {
    position: 'top-right',
    timeout: 3000,
    closeOnClick: true,
    pauseOnHover: true,
    hideProgressBar: false,
    icon: true,
    transition: 'Vue-Toastification__bounce'
  })

  // Provide useToast as a composable
  return {
    provide: {
      toast: vueToastUseToast()
    }
  }
})