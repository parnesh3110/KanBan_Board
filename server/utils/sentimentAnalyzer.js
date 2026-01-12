// this checks how urgent a task is based on the words used
// like if someone says "URGENT" or "ASAP" we know it's important

export function analyzeSentiment(text) {
  if (!text) return { urgency: 5, priority: 'medium', keywords: [] }
  
  const lowerText = text.toLowerCase()
  
  // words that mean something is urgent (with scores 1-10)
  const urgencyKeywords = {
    critical: 10,
    urgent: 9,
    asap: 9,
    emergency: 10,
    immediately: 9,
    'right now': 9,
    crucial: 8,
    important: 7,
    priority: 7,
    'high priority': 8,
    deadline: 7,
    overdue: 8,
    late: 7,
    soon: 6,
    quick: 6,
    fast: 6
  }
  
  // words that mean it's not urgent
  const lowPriorityKeywords = {
    later: 3,
    eventually: 2,
    someday: 2,
    maybe: 3,
    'when possible': 3,
    'low priority': 2,
    optional: 2,
    'nice to have': 3
  }
  
  let urgencyScore = 5  // start at medium (5 out of 10)
  const foundKeywords = []
  
  // look for urgent words and bump up the score
  for (const [keyword, weight] of Object.entries(urgencyKeywords)) {
    if (lowerText.includes(keyword)) {
      urgencyScore = Math.max(urgencyScore, weight)
      foundKeywords.push(keyword)
    }
  }
  
  // look for low priority words and lower the score
  for (const [keyword, weight] of Object.entries(lowPriorityKeywords)) {
    if (lowerText.includes(keyword)) {
      urgencyScore = Math.min(urgencyScore, weight)
      foundKeywords.push(keyword)
    }
  }
  
  // exclamation marks usually mean it's urgent!
  const exclamationCount = (text.match(/!/g) || []).length
  if (exclamationCount > 0) {
    urgencyScore = Math.min(10, urgencyScore + exclamationCount)
  }
  
  // ALL CAPS words also mean urgency
  const capsWords = text.match(/\b[A-Z]{3,}\b/g) || []
  if (capsWords.length > 0) {
    urgencyScore = Math.min(10, urgencyScore + 1)
  }
  
  // convert score to priority level
  let priority = 'medium'
  if (urgencyScore >= 8) priority = 'high'
  else if (urgencyScore <= 3) priority = 'low'
  
  return {
    urgency: urgencyScore,
    priority,
    keywords: foundKeywords,
    hasExclamations: exclamationCount > 0,
    hasCapitalization: capsWords.length > 0
  }
}

// figures out what category a task belongs to based on keywords
// like if it mentions "gym" or "workout" it's probably health-related
export function detectCategory(text) {
  const lowerText = text.toLowerCase()
  
  // different categories with their keywords
  const categoryPatterns = {
    work: ['work', 'office', 'meeting', 'client', 'project', 'deadline', 'presentation', 'report', 'email', 'call', 'conference'],
    personal: ['personal', 'home', 'family', 'friend', 'birthday', 'appointment', 'doctor', 'dentist', 'shopping', 'groceries'],
    health: ['health', 'fitness', 'gym', 'workout', 'exercise', 'doctor', 'medical', 'appointment', 'medicine', 'diet'],
    finance: ['finance', 'budget', 'money', 'payment', 'bill', 'invoice', 'tax', 'bank', 'expense', 'salary'],
    learning: ['learn', 'study', 'course', 'tutorial', 'read', 'book', 'research', 'practice', 'training', 'education'],
    social: ['social', 'party', 'event', 'gathering', 'dinner', 'lunch', 'coffee', 'hangout', 'celebration']
  }
  
  const scores = {}
  
  // count how many keywords match for each category
  for (const [category, keywords] of Object.entries(categoryPatterns)) {
    scores[category] = 0
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        scores[category]++
      }
    }
  }
  
  // pick the category with the most matches
  let bestCategory = 'work'  // default to work if nothing matches
  let maxScore = 0
  
  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      bestCategory = category
    }
  }
  
  return maxScore > 0 ? bestCategory : 'work'
}

// cleans up task titles by removing common prefixes
// like "create task to review budget" becomes "Review budget"
export function extractTaskTitle(text) {
  // remove stuff like "create task" or "add todo" from the beginning
  let title = text
    .replace(/^(create|add|make|new)\s+(a\s+)?(task|todo|item)?\s*(to\s+|for\s+|:)?/i, '')
    .replace(/^(remind me to|i need to|todo:)\s*/i, '')
    .trim()
  
  // capitalize first letter to make it look nice
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1)
  }
  
  // remove trailing commas and semicolons
  title = title.replace(/[,;]$/, '')
  
  return title
}
