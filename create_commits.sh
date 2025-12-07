#!/bin/bash

# Script to create backdated commits for Task Manager project
# Dates: November 25 - December 7, 2025

cd /Users/parneshadawadkar/Desktop/Code/Task_Manager

# Configure git user
git config user.name "Parnesh Adawadkar"
git config user.email "parnesh3110@gmail.com"

# Function to commit with a specific date
commit_with_date() {
    local date="$1"
    local message="$2"
    GIT_AUTHOR_DATE="$date" GIT_COMMITTER_DATE="$date" git commit -m "$message"
}

echo "Creating backdated commit history (Nov 25 - Dec 7, 2025)..."

# Commit 1: Initial project setup (Nov 25, 2025)
git add package.json package-lock.json nuxt.config.ts tailwind.config.js
commit_with_date "2025-11-25 09:00:00" "Initial commit: Project setup with Nuxt 3 and Tailwind"

# Commit 2: Add Supabase authentication pages (Nov 26, 2025)
git add pages/login.vue pages/register.vue middleware/auth.js
commit_with_date "2025-11-26 10:30:00" "Add authentication pages with Supabase"

# Commit 3: Database schema (Nov 27, 2025 morning)
git add app/
commit_with_date "2025-11-27 09:00:00" "Set up database migrations for tasks table"

# Commit 4: Server API endpoints (Nov 27, 2025 afternoon)
git add server/api/test-openai.get.js server/plugins/env.ts types/nuxt.d.ts
commit_with_date "2025-11-27 14:00:00" "Add server utilities and TypeScript types"

# Commit 5: Main layout (Nov 28, 2025)
git add layouts/default.vue app.vue
commit_with_date "2025-11-28 11:15:00" "Create main layout with navigation and dark mode"

# Commit 6: Kanban board interface (Nov 29, 2025)
git add pages/index.vue
commit_with_date "2025-11-29 15:30:00" "Build Kanban board with drag-and-drop functionality"

# Commit 7: Task card component (Nov 30, 2025)
git add components/TaskCard.vue components/ErrorBoundary.vue
commit_with_date "2025-11-30 10:00:00" "Add TaskCard component with inline editing"

# Commit 8: AI prioritization (Dec 1, 2025)
git add server/api/prioritize-tasks.post.js server/api/ai-suggestions.post.js
commit_with_date "2025-12-01 13:45:00" "Integrate OpenAI for task prioritization"

# Commit 9: Calendar view (Dec 2, 2025)
git add pages/calendar.vue
commit_with_date "2025-12-02 09:30:00" "Add calendar view for task scheduling"

# Commit 10: Analytics dashboard (Dec 3, 2025)
git add pages/analytics.vue server/api/analytics.get.js
commit_with_date "2025-12-03 16:00:00" "Implement analytics dashboard with insights"

# Commit 11: AI Chat assistant (Dec 4, 2025)
git add pages/ai-chat.vue server/api/ai-chat.post.js
commit_with_date "2025-12-04 11:20:00" "Add AI chat assistant for task management"

# Commit 12: Mind map visualization (Dec 5, 2025)
git add pages/mindmap.vue
commit_with_date "2025-12-05 14:30:00" "Create mind map view for task relationships"

# Commit 13: Task history (Dec 6, 2025)
git add pages/history.vue server/api/task-history.get.js
commit_with_date "2025-12-06 10:45:00" "Add task history and activity timeline"

# Commit 14: Utilities and polish (Dec 6, 2025 evening)
git add plugins/toast.client.js composables/
commit_with_date "2025-12-06 18:00:00" "Add toast notifications and utility composables"

# Commit 15: Documentation (Dec 7, 2025)
git add readme.md .DS_Store create_commits.sh
commit_with_date "2025-12-07 12:00:00" "Add documentation and project README"

echo ""
echo "✅ Successfully created backdated commit history!"
echo "📊 Total commits: $(git rev-list --count HEAD)"
echo ""
echo "📅 Commit timeline:"
git log --oneline --graph --all --date=short --pretty=format:"%h %ad %s" --date=format:"%b %d, %Y %H:%M"
