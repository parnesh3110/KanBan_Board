// this function helps convert stuff like "tomorrow" or "next friday" into actual dates
// pretty useful for when users just type naturally instead of picking dates from a calendar

export function parseNaturalDate(input) {
  if (!input) return null
  
  const text = input.toLowerCase().trim()
  const now = new Date()
  
  // just formats dates to YYYY-MM-DD format (like 2026-01-15)
  const formatDate = (date) => {
    return date.toISOString().split('T')[0]
  }
  
  // adds X number of days to a date
  const addDays = (date, days) => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }
  
  // figures out when the next occurrence of a weekday is
  // like if today is monday and you want "next friday", it calculates that
  const getNextWeekday = (targetDay) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const targetIndex = days.indexOf(targetDay)
    const currentIndex = now.getDay()
    
    let daysToAdd = targetIndex - currentIndex
    if (daysToAdd <= 0) daysToAdd += 7  // if the day already passed this week, go to next week
    
    return addDays(now, daysToAdd)
  }
  
  // check for simple cases first
  if (text.includes('today')) {
    return formatDate(now)
  }
  
  if (text.includes('tomorrow')) {
    return formatDate(addDays(now, 1))
  }
  
  if (text.includes('yesterday')) {
    return formatDate(addDays(now, -1))
  }
  
  if (text.includes('next week')) {
    return formatDate(addDays(now, 7))
  }
  
  // end of week usually means friday
  if (text.includes('end of week') || text.includes('this friday')) {
    const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7
    return formatDate(addDays(now, daysUntilFriday))
  }
  
  // check if they mentioned a specific weekday like "next monday"
  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  for (const day of weekdays) {
    if (text.includes(`next ${day}`) || text.includes(day)) {
      return formatDate(getNextWeekday(day))
    }
  }
  
  // handles stuff like "in 3 days" or "in 2 weeks"
  const inDaysMatch = text.match(/in (\d+) days?/)
  if (inDaysMatch) {
    return formatDate(addDays(now, parseInt(inDaysMatch[1])))
  }
  
  const inWeeksMatch = text.match(/in (\d+) weeks?/)
  if (inWeeksMatch) {
    return formatDate(addDays(now, parseInt(inWeeksMatch[1]) * 7))
  }
  
  const inMonthsMatch = text.match(/in (\d+) months?/)
  if (inMonthsMatch) {
    const result = new Date(now)
    result.setMonth(result.getMonth() + parseInt(inMonthsMatch[1]))
    return formatDate(result)
  }
  
  // end of month = last day of current month
  if (text.includes('end of month') || text.includes('eom')) {
    const result = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return formatDate(result)
  }
  
  // end of year = december 31st
  if (text.includes('end of year') || text.includes('eoy')) {
    return `${now.getFullYear()}-12-31`
  }
  
  // next month = first day of next month
  if (text.includes('next month')) {
    const result = new Date(now)
    result.setMonth(result.getMonth() + 1)
    result.setDate(1)
    return formatDate(result)
  }
  
  // if they typed an actual date like "2026-01-15" just use that
  const isoMatch = text.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) {
    return isoMatch[0]
  }
  
  // also handle american format like "1/15/2026"
  const slashMatch = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (slashMatch) {
    const [, month, day, year] = slashMatch
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  
  return null  // couldn't figure out the date
}

// tries to pull out a due date from a sentence
// like "review budget due tomorrow" -> extracts "tomorrow"
export function extractDueDate(text) {
  const patterns = [
    /due (.*?)(?:\.|$|,)/i,
    /by (.*?)(?:\.|$|,)/i,
    /on (.*?)(?:\.|$|,)/i,
    /for (.*?)(?:\.|$|,)/i,
    /(tomorrow|today|next \w+|in \d+ days?)/i
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const dateStr = match[1] || match[0]
      const parsed = parseNaturalDate(dateStr)
      if (parsed) return parsed
    }
  }
  
  return null
}
