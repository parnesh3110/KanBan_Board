// Composable for debounced search
export const useDebounce = (fn, delay = 300) => {
  let timeoutId = null
  
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}
