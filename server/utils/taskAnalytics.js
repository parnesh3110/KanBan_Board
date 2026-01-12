// generates insights about productivity from the user's tasks
// shows stuff like completion rate, overdue tasks, etc.

export function generateInsights(tasks) {
  if (!tasks || tasks.length === 0) {
    return {
      summary: 'No tasks yet. Start adding tasks to see insights!',
      insights: []
    }
  }
  
  const insights = []
  const now = new Date()
  
  // calculate what percentage of tasks are done
  const completedTasks = tasks.filter(t => t.status === 'completed')
  const completionRate = (completedTasks.length / tasks.length * 100).toFixed(1)
  
  insights.push({
    type: 'completion_rate',
    icon: '📊',
    title: 'Completion Rate',
    value: `${completionRate}%`,
    description: `You've completed ${completedTasks.length} out of ${tasks.length} tasks`
  })
  
  // find which category has the most tasks
  const categoryCount = {}
  tasks.forEach(t => {
    const cat = t.category || 'uncategorized'
    categoryCount[cat] = (categoryCount[cat] || 0) + 1
  })
  
  const topCategory = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])[0]
  
  if (topCategory) {
    insights.push({
      type: 'top_category',
      icon: '🏆',
      title: 'Most Common Category',
      value: topCategory[0],
      description: `${topCategory[1]} tasks in this category`
    })
  }
  
  // check for tasks that are past their due date
  const overdueTasks = tasks.filter(t => {
    if (!t.due_date || t.status === 'completed') return false
    return new Date(t.due_date) < now
  })
  
  if (overdueTasks.length > 0) {
    insights.push({
      type: 'overdue',
      icon: '⚠️',
      title: 'Overdue Tasks',
      value: overdueTasks.length,
      description: 'Tasks that need immediate attention',
      priority: 'high'
    })
  }
  
  // see how productive they've been this week
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const recentlyCompleted = completedTasks.filter(t => {
    return new Date(t.updated_at || t.created_at) > sevenDaysAgo
  })
  
  insights.push({
    type: 'weekly_productivity',
    icon: '📈',
    title: 'This Week',
    value: `${recentlyCompleted.length} completed`,
    description: 'Tasks completed in the last 7 days'
  })
  
  // find high priority tasks that aren't done yet
  const highPriorityTasks = tasks.filter(t => 
    t.ai_priority_score >= 8 && t.status !== 'completed'
  )
  
  if (highPriorityTasks.length > 0) {
    insights.push({
      type: 'high_priority',
      icon: '🔥',
      title: 'High Priority',
      value: highPriorityTasks.length,
      description: 'Important tasks requiring focus',
      priority: 'high'
    })
  }
  
  // tasks coming up in the next few days
  const threeDaysFromNow = new Date(now)
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
  
  const dueSoon = tasks.filter(t => {
    if (!t.due_date || t.status === 'completed') return false
    const dueDate = new Date(t.due_date)
    return dueDate >= now && dueDate <= threeDaysFromNow
  })
  
  if (dueSoon.length > 0) {
    insights.push({
      type: 'due_soon',
      icon: '⏰',
      title: 'Due Soon',
      value: dueSoon.length,
      description: 'Tasks due in the next 3 days'
    })
  }
  
  // create a nice summary message
  let summary = `You have ${tasks.length} total tasks with a ${completionRate}% completion rate. `
  
  if (overdueTasks.length > 0) {
    summary += `⚠️ ${overdueTasks.length} task${overdueTasks.length > 1 ? 's are' : ' is'} overdue. `
  }
  
  if (highPriorityTasks.length > 0) {
    summary += `🔥 Focus on ${highPriorityTasks.length} high-priority task${highPriorityTasks.length > 1 ? 's' : ''}. `
  }
  
  if (recentlyCompleted.length > 0) {
    summary += `Great job completing ${recentlyCompleted.length} task${recentlyCompleted.length > 1 ? 's' : ''} this week!`
  }
  
  return {
    summary: summary.trim(),
    insights,
    stats: {
      total: tasks.length,
      completed: completedTasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      overdue: overdueTasks.length,
      dueSoon: dueSoon.length,
      completionRate: parseFloat(completionRate)
    }
  }
}

// suggests what the user should work on next
// prioritizes overdue stuff, then high priority, then upcoming deadlines
export function suggestNextActions(tasks) {
  const suggestions = []
  const now = new Date()
  
  // first priority: overdue tasks (these need attention ASAP)
  const overdue = tasks.filter(t => {
    if (!t.due_date || t.status === 'completed') return false
    return new Date(t.due_date) < now
  })
  
  if (overdue.length > 0) {
    suggestions.push({
      type: 'overdue',
      priority: 'high',
      message: `You have ${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}. I recommend starting with "${overdue[0].title}".`,
      action: 'focus_overdue'
    })
  }
  
  // Suggest high priority tasks
  const highPriority = tasks.filter(t => 
    t.ai_priority_score >= 8 && t.status !== 'completed'
  ).sort((a, b) => (b.ai_priority_score || 0) - (a.ai_priority_score || 0))
  
  if (highPriority.length > 0 && overdue.length === 0) {
    suggestions.push({
      type: 'high_priority',
      priority: 'high',
      message: `Focus on high-priority task: "${highPriority[0].title}" (Priority: ${highPriority[0].ai_priority_score}/10)`,
      action: 'focus_priority'
    })
  }
  
  // Suggest tasks due soon
  const threeDaysFromNow = new Date(now)
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
  
  const dueSoon = tasks.filter(t => {
    if (!t.due_date || t.status === 'completed') return false
    const dueDate = new Date(t.due_date)
    return dueDate >= now && dueDate <= threeDaysFromNow
  }).sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
  
  if (dueSoon.length > 0 && suggestions.length === 0) {
    suggestions.push({
      type: 'due_soon',
      priority: 'medium',
      message: `"${dueSoon[0].title}" is due ${dueSoon[0].due_date}. Consider working on it soon.`,
      action: 'focus_upcoming'
    })
  }
  
  // Suggest completing in-progress tasks
  const inProgress = tasks.filter(t => t.status === 'in_progress')
  
  if (inProgress.length > 0 && suggestions.length === 0) {
    suggestions.push({
      type: 'in_progress',
      priority: 'medium',
      message: `You have ${inProgress.length} task${inProgress.length > 1 ? 's' : ''} in progress. Consider completing "${inProgress[0].title}" first.`,
      action: 'complete_in_progress'
    })
  }
  
  // If nothing urgent, suggest starting pending tasks
  const pending = tasks.filter(t => t.status === 'pending')
  
  if (pending.length > 0 && suggestions.length === 0) {
    suggestions.push({
      type: 'pending',
      priority: 'low',
      message: `Great work! No urgent tasks. You could start working on "${pending[0].title}".`,
      action: 'start_pending'
    })
  }
  
  // All done!
  if (suggestions.length === 0) {
    suggestions.push({
      type: 'all_clear',
      priority: 'low',
      message: '🎉 All caught up! No pending tasks. Time to relax or plan ahead.',
      action: 'celebrate'
    })
  }
  
  return suggestions
}
