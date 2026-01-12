# TaskMaster Pro

A task manager app I built to help organize my life. Has AI features, drag-and-drop boards, and a bunch of other stuff.

## What it does

- **Kanban board** - drag tasks between pending, in progress, and done
- **AI chat** - talk to an AI assistant that can create tasks for you
- **Voice input** - speak to create tasks (pretty cool)
- **Smart prioritization** - AI ranks your tasks by importance
- **Analytics** - see charts and stats about your productivity
- **Calendar view** - see all your tasks on a calendar
- **Mind map** - visualize task relationships
- **Dark mode** - because light mode hurts my eyes

## Tech stack

Built with:
- **Nuxt 3** (Vue.js framework)
- **Supabase** (database + auth)
- **Tailwind CSS** (styling)
- **Google Gemini AI** (for the smart features)

## Setup

1. Clone this repo
```bash
git clone 
cd Task_Manager
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Create a `.env` file:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
GEMINI_API_KEY=your_gemini_api_key
```

4. Run the dev server
```bash
npm run dev
```

App should be running at `http://localhost:3000`

## Features breakdown

### Task Board
- Create, edit, delete tasks
- Drag and drop to change status
- Filter by category (work, personal, urgent)
- Search tasks
- Export to CSV

### AI Chat
- Natural language task creation
- Get task suggestions
- Chat history saved to database
- Export conversations as JSON

### Analytics
- Task completion charts
- Category breakdown
- Productivity trends
- Sentiment analysis

### Calendar
- Monthly view of all tasks
- Click dates to add tasks
- Color-coded by category

## Database schema

Using Supabase with these tables:
- `tasks` - all task data
- `chat_conversations` - AI chat history

## Known issues

- Sometimes the AI takes a few seconds to respond
- Mobile menu was buggy but I fixed it
- Voice recognition only works in Chrome

## Future ideas

- [ ] Add task templates
- [ ] Team collaboration features
- [ ] Mobile app version
- [ ] Recurring tasks
- [ ] Task dependencies

## Notes

This was a learning project to get better at Vue/Nuxt and work with AI APIs. Feel free to use the code however you want.

---

Made by a student trying to stay organized 📚