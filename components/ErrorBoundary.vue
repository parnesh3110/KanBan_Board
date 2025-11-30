// Error boundary component wrapper
export default {
  name: 'ErrorBoundary',
  data() {
    return {
      error: null,
      errorInfo: null
    }
  },
  errorCaptured(err, instance, info) {
    this.error = err
    this.errorInfo = info
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', err)
      console.error('Component info:', info)
    }
    
    // Prevent error from propagating
    return false
  },
  render(h) {
    if (this.error) {
      return this.$slots.error || h('div', {
        class: 'min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4'
      }, [
        h('div', {
          class: 'text-center'
        }, [
          h('div', { class: 'text-6xl mb-4' }, '⚠️'),
          h('h1', { class: 'text-2xl font-bold text-gray-900 dark:text-white mb-2' }, 'Something went wrong'),
          h('p', { class: 'text-gray-600 dark:text-gray-400 mb-6' }, 'We encountered an unexpected error'),
          h('button', {
            class: 'px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition',
            on: {
              click: () => {
                this.error = null
                this.errorInfo = null
                window.location.reload()
              }
            }
          }, 'Reload Page')
        ])
      ])
    }
    
    return this.$slots.default
  }
}
