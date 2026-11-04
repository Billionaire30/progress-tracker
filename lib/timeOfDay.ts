/**
 * Time-of-day awareness utilities
 * Helps adapt UI and messaging based on current time
 */

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export function getTimeOfDayGreeting(): string {
  const timeOfDay = getTimeOfDay();

  switch (timeOfDay) {
    case 'morning':
      return "Good morning! Start your day with purpose.";
    case 'afternoon':
      return "Good afternoon! Keep the momentum going.";
    case 'evening':
      return "Good evening! Reflect on your progress.";
    case 'night':
      return "Working late? Remember to rest well.";
  }
}

export function getTimeOfDayPrompt(): string {
  const timeOfDay = getTimeOfDay();

  switch (timeOfDay) {
    case 'morning':
      return "What's your main focus for today?";
    case 'afternoon':
      return "How's your progress so far?";
    case 'evening':
      return "What did you accomplish today?";
    case 'night':
      return "What's on your mind?";
  }
}

export function getTimeOfDayColor(): string {
  const timeOfDay = getTimeOfDay();

  switch (timeOfDay) {
    case 'morning':
      return "from-orange-400 to-yellow-300";
    case 'afternoon':
      return "from-blue-400 to-cyan-300";
    case 'evening':
      return "from-purple-400 to-pink-300";
    case 'night':
      return "from-indigo-400 to-blue-300";
  }
}

export function getOptimalStudyTime(): string {
  const timeOfDay = getTimeOfDay();

  switch (timeOfDay) {
    case 'morning':
      return "Morning is great for focused work. Try 90-minute deep work sessions.";
    case 'afternoon':
      return "Afternoon energy varies. Take short breaks and stay hydrated.";
    case 'evening':
      return "Evening is good for review and lighter tasks.";
    case 'night':
      return "Night sessions can be productive but watch your sleep schedule.";
  }
}
