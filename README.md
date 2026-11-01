# Progress Tracker

A comprehensive 12-month development programme tracker built with Next.js, Firebase, and modern UI components.

## Features

- ✅ **Monthly Progress Tracking** - Track 12 months of development goals
- ✅ **Task Management** - Add, complete, and delete tasks for each month
- ✅ **Portfolio Tracking** - Monitor 5 key portfolio projects
- ✅ **Competency Checklist** - 17 essential competencies to track
- ✅ **Weekly Hours Logging** - Log daily hours with detailed entries
- ✅ **Analytics Dashboard** - Visual progress charts and insights
- ✅ **Firebase Integration** - Cloud sync with authentication
- ✅ **Dark/Light Mode** - Theme support with system preference
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Gamification** - XP system, streaks, achievements, and badges
- ✅ **Export/Import** - Backup and restore your data
- ✅ **PWA Support** - Install as a progressive web app

## Tech Stack

- **Framework**: Next.js 16.4.3 (App Router)
- **UI**: Tailwind CSS, Radix UI, shadcn/ui
- **Charts**: Recharts
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **State Management**: React Context
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/progress-tracker.git
cd progress-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This project is deployed on Vercel. See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deploy to Vercel

1. Push code to GitHub
2. Import repository in Vercel
3. Add Firebase environment variables
4. Deploy!

## Environment Variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Project Structure

```
progress-tracker/
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/                # Utility functions and logic
├── public/             # Static assets
├── .env.local          # Environment variables (not committed)
└── package.json        # Dependencies
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Features in Detail

### Monthly Tracking
- 12-month development programme
- Task management per month
- Status tracking (not-started, in-progress, complete)
- Visual progress indicators

### Analytics
- Overall progress calculation
- Weekly hours chart
- Streak tracking
- Competency completion rate
- Portfolio progress visualization

### Gamification
- XP system for hours logged
- Daily challenges
- Achievement badges
- Streak bonuses
- Leaderboard-style metrics

### Data Management
- Local storage (default)
- Firebase cloud sync (with authentication)
- Export to JSON
- Import from JSON
- Automatic backups

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and for personal use.

## Support

For issues or questions, please refer to the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) or [FIREBASE_CLOUDFLARE_SETUP.md](./FIREBASE_CLOUDFLARE_SETUP.md).

---

Built with ❤️ using Next.js and Firebase
