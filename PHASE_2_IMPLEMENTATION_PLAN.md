# Phase 2 Implementation Plan

## Overview
Phase 2 migrates all components from legacy React Context + legacy data model to Zustand + new domain model, and implements the core tracker semantics.

## Migration Priority Order

### High Priority (Tracker Core)
1. **HabitTracker Migration** - Foundation for all habit features
2. **StudyHours Migration** - Study session management
3. **Temporal Correctness** - Midnight rollover, timezone handling
4. **Streak Engine Integration** - Use existing `lib/streak.ts` with HabitLog
5. **Habit ↔ Study Linkage** - Auto-logging study hours from habits

### Medium Priority (Data Features)
6. **Competencies Migration** - Use new domain types
7. **Portfolio Migration** - Full CRUD with image upload
8. **Certificates Migration** - Full CRUD with file upload
9. **Journey Progress** - Use existing `lib/journey.ts`
10. **Goals & On-Track Logic** - Use existing `lib/goals.ts`

### Lower Priority (Enhancements)
11. **Trends** - WoW delta, sparklines, heatmaps
12. **Daily Check-In** - Keyboard shortcuts, full-screen mobile
13. **Next-Action Widget** - Guidance system
14. **Habit Lifecycle** - Pause, archive, grace days
15. **Data Resilience** - Corrupt data recovery, Safari ITP
16. **Behavioral Integration Tests** - Vitest + Playwright

---

## Detailed Migration: HabitTracker

### Current Issues
- Uses legacy `Habit` type with `completedDates[]` array
- Manual streak calculation in component
- Direct `setData` calls instead of store actions
- No integration with `lib/streak.ts`
- Week calculation uses Sunday start (should be Monday by default)

### Migration Steps

#### Step 1: Update Imports
```typescript
// Remove
import { useApp } from "@/lib/context";
import { Habit } from "@/lib/data";

// Add
import { useAppStore, selectActiveHabits, selectHabitLogsForHabit } from "@/lib/store";
import { Habit as NewHabit } from "@/types/domain";
import { computeStreak } from "@/lib/streak";
import { computeHabitGoalStatus } from "@/lib/goals";
import { getToday, getStartOfISOWeek, daysBetween } from "@/lib/timezone";
```

#### Step 2: Replace State Access
```typescript
// Old
const { data, setData } = useApp();
const habits = data.habits;

// New
const habits = useAppStore(selectActiveHabits);
const habitLogs = useAppStore((state) => state.habitLogs);
const toggleHabitLog = useAppStore((state) => state.toggleHabitLog);
const addHabit = useAppStore((state) => state.addHabit);
const updateHabit = useAppStore((state) => state.updateHabit);
const deleteHabit = useAppStore((state) => state.deleteHabit);
```

#### Step 3: Replace Streak Calculation
```typescript
// Old (manual calculation in component)
let streak = 0;
const sortedDates = [...updatedDates].sort().reverse();
// ... manual loop

// New (use lib/streak.ts)
const habitLogsForHabit = habitLogs.filter(log => log.habitId === habitId);
const streakResult = computeStreak(habitLogsForHabit, habitId, today, {
  graceDays: habit.allowGraceDays ? 1 : 0,
  freezes: 0,
});
const currentStreak = streakResult.current;
const atRisk = streakResult.atRisk;
```

#### Step 4: Replace Week Calculation
```typescript
// Old (Sunday start)
const weekStart = new Date();
weekStart.setDate(weekStart.getDate() - weekStart.getDay());

// New (Monday start from settings)
const weekStartsOn = useAppStore((state) => state.settings.weekStartsOn);
const weekStart = getStartOfISOWeek(today, weekStartsOn);
```

#### Step 5: Replace Weekly Progress
```typescript
// Old
const completedThisWeek = habit.completedDates.filter(date => weekDates.includes(date)).length;
const progress = (completedThisWeek / habit.target) * 100;

// New (use lib/goals.ts)
const completedThisWeek = habitLogsForHabit
  .filter(log => log.completed && log.date >= weekStart && log.date <= today)
  .length;
const goalStatus = computeHabitGoalStatus(completedThisWeek, habit.targetPerWeek, weekStartsOn);
const progress = goalStatus.percentage;
const status = goalStatus.status; // 'ahead' | 'on-track' | 'behind'
```

#### Step 6: Replace Toggle Logic
```typescript
// Old (direct setData with completedDates array)
const toggleHabitCompletion = (habitId, date) => {
  const updatedDates = isCompleted
    ? habit.completedDates.filter(d => d !== date)
    : [...habit.completedDates, date];
  // ... manual streak calc
  setData({ ...prevData, habits: updatedHabits });
};

// New (use store action with HabitLog)
const toggleHabitCompletion = (habitId, date) => {
  toggleHabitLog(habitId, date || today);
  // Handle study linkage
  if (habit.contributesToStudy && habit.studyUnitHours) {
    const isCompleted = habitLogs.some(
      log => log.habitId === habitId && log.date === date && log.completed
    );
    if (!isCompleted) {
      addStudySession({
        date: date || today,
        hours: habit.studyUnitHours,
        note: `Auto-logged from habit: ${habit.name}`,
        sourceHabitId: habitId,
      });
    } else {
      // Remove corresponding study session
      const studySessions = useAppStore.getState().studySessions;
      const sessionToRemove = studySessions.find(
        s => s.date === date && s.sourceHabitId === habitId
      );
      if (sessionToRemove) {
        deleteStudySession(sessionToRemove.id);
      }
    }
  }
};
```

#### Step 7: Replace Add/Edit/Delete
```typescript
// Old (direct setData)
const addHabit = () => {
  const newHabit: Habit = { /* legacy schema */ };
  setData(prev => ({ ...prev, habits: [...habits, newHabit] }));
};

// New (use store actions with new schema)
const addHabit = () => {
  addHabit({
    name: newHabitName,
    description: newHabitDesc,
    category: newHabitCategory,
    targetPerWeek: newHabitTarget,
    status: 'active',
    pausedUntil: null,
    allowGraceDays: false,
    contributesToStudy: newHabitContributesToStudy,
    studyUnitHours: newHabitContributesToStudy ? newHabitStudyUnitHours : undefined,
  });
};
```

#### Step 8: Replace Field Names
```typescript
// Old
habit.target → habit.targetPerWeek
habit.color → (removed, use category icon)
habit.completedDates → derived from habitLogs
habit.currentStreak → derived from computeStreak()
```

---

## Detailed Migration: StudyHours

### Current Issues
- Uses legacy `WeeklyLogEntry` type
- No edit/delete for past sessions
- No integration with HabitLog

### Migration Steps

#### Step 1: Update Imports
```typescript
import { useAppStore, selectTotalStudyHours } from "@/lib/store";
import { StudySession } from "@/types/domain";
import { computeStudyGoalStatus } from "@/lib/goals";
```

#### Step 2: Replace State Access
```typescript
const studySessions = useAppStore((state) => state.studySessions);
const addStudySession = useAppStore((state) => state.addStudySession);
const updateStudySession = useAppStore((state) => state.updateStudySession);
const deleteStudySession = useAppStore((state) => state.deleteStudySession);
const weeklyGoalHours = useAppStore((state) => state.settings.weeklyGoalHours);
```

#### Step 3: Replace Field Names
```typescript
// Old
WeeklyLogEntry { id, date, hours, focus }

// New
StudySession { id, date, hours, note, sourceHabitId, createdAt, updatedAt }
```

#### Step 4: Add Edit/Delete UI
- Add edit button to each session entry
- Add delete button to each session entry
- Block future-dated entries with validation

---

## Detailed Migration: Competencies

### Current Issues
- Uses legacy `CompetencyItem` type
- No `completedAt` timestamp
- No `deadline` field
- No pace indicator

### Migration Steps

#### Step 1: Update Imports
```typescript
import { useAppStore, selectCompletedCompetencies, selectCompetencyProgress } from "@/lib/store";
import { Competency } from "@/types/domain";
import { computeCompetencyPace } from "@/lib/goals";
```

#### Step 2: Replace State Access
```typescript
const competencies = useAppStore((state) => state.competencies);
const toggleCompetency = useAppStore((state) => state.toggleCompetency);
const startDate = useAppStore((state) => state.settings.startDate);
const targetEndDate = useAppStore((state) => state.settings.targetEndDate);
```

#### Step 3: Add Pace Indicator
```typescript
const completed = selectCompletedCompetencies(useAppStore.getState());
const total = competencies.length;
const pace = computeCompetencyPace(completed, total, startDate, targetEndDate);
// Display: pace.status ('ahead' | 'on-track' | 'behind')
// Display: "X / 17 complete • Expected: {pace.expected}"
```

---

## Detailed Migration: Portfolio

### Current Issues
- Uses legacy `PortfolioItem` type
- No full CRUD (only status cycling)
- No image upload
- No tags
- No per-category organization

### Migration Steps

#### Step 1: Update Imports
```typescript
import { useAppStore, selectPortfolioByCategory } from "@/lib/store";
import { PortfolioItem, PortfolioCategory } from "@/types/domain";
import { PORTFOLIO_CATEGORIES } from "@/constants/seedData";
```

#### Step 2: Replace State Access
```typescript
const portfolio = useAppStore((state) => state.portfolio);
const addPortfolioItem = useAppStore((state) => state.addPortfolioItem);
const updatePortfolioItem = useAppStore((state) => state.updatePortfolioItem);
const deletePortfolioItem = useAppStore((state) => state.deletePortfolioItem);
```

#### Step 3: Implement Full CRUD
- Add: Modal with category, title, description, tags, image upload (base64)
- Edit: Modal with all fields editable
- Delete: Confirmation dialog
- Image: File input → FileReader → base64 → imageDataUrl

#### Step 4: Organize by Category
```typescript
PORTFOLIO_CATEGORIES.map(category => {
  const items = selectPortfolioByCategory(category.id)(useAppStore.getState());
  // Render category section with items
})
```

---

## Detailed Migration: Certificates

### Current Issues
- Uses legacy `Certificate` type
- No file upload
- Incomplete schema

### Migration Steps

#### Step 1: Update Imports
```typescript
import { useAppStore } from "@/lib/store";
import { Certificate } from "@/types/domain";
```

#### Step 2: Replace State Access
```typescript
const certificates = useAppStore((state) => state.certificates);
const addCertificate = useAppStore((state) => state.addCertificate);
const updateCertificate = useAppStore((state) => state.updateCertificate);
const deleteCertificate = useAppStore((state) => state.deleteCertificate);
```

#### Step 3: Add File Upload
- File input for PDF/image
- FileReader → base64 → fileDataUrl
- Display file preview if exists

---

## Temporal Correctness Implementation

### Midnight Rollover
```typescript
// In AppProvider or layout wrapper
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      const today = getToday();
      const lastActive = useAppStore.getState().settings.lastActiveDate;
      if (today !== lastActive) {
        // Trigger UI refresh
        useAppStore.getState().updateSettings({ lastActiveDate: today });
      }
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', handleVisibilityChange);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', handleVisibilityChange);
  };
}, []);
```

### Timezone Handling
- Already implemented in `lib/timezone.ts`
- Ensure all date comparisons use `getToday()` (local, not UTC)
- Store user timezone in settings on first load

---

## Streak Engine Integration

### Existing Implementation
- `lib/streak.ts` already has `computeStreak()` and `computeGlobalStreak()`
- Follows specification (best never decreases, at-risk state, grace days)

### Integration Points
1. **HabitTracker**: Use `computeStreak()` for each habit
2. **Dashboard KPIs**: Use `computeGlobalStreak()` for total streak
3. **Next-Action Widget**: Check `atRisk` for urgent actions
4. **Daily Check-In**: Show streak-at-risk banners

---

## Habit ↔ Study Linkage

### Logic
1. When habit with `contributesToStudy=true` is completed:
   - Add `StudySession` with `sourceHabitId=habitId`
   - Set `hours=habit.studyUnitHours`
   - Set `note="Auto-logged from habit: {name}"`

2. When habit is un-completed:
   - Find `StudySession` with matching `sourceHabitId` and date
   - Delete that session

3. Prevent double-counting:
   - If user manually logs study hours for a date where habit is already linked:
     - Either auto-complete the habit, or warn user
     - Option: Auto-complete the habit to prevent double-counting

---

## Data Resilience Implementation

### Corrupt Data Recovery
```typescript
// In store onRehydrateStorage
onRehydrateStorage: () => (state) => {
  if (state) {
    const validation = validateAppState(state);
    if (!validation.valid) {
      console.error('Data validation failed:', validation.errors);
      // Show recovery UI: "Data corrupted. Download backup or reset?"
      // Store corrupt data in localStorage under 'progress-tracker:corruptBackup'
    }
  }
}
```

### Safari ITP Detection
```typescript
// In AppProvider or layout
useEffect(() => {
  const hasData = localStorage.getItem('progress-tracker-storage');
  const lastKnownUser = localStorage.getItem('progress-tracker:lastKnownUser');

  if (lastKnownUser === 'true' && !hasData) {
    // Show ITP recovery UI: "Your browser may have cleared saved data. Do you have a backup?"
  }
}, []);
```

### Quota Handling
```typescript
// In storage-new.ts
try {
  localStorage.setItem(key, JSON.stringify(data));
} catch (e) {
  if (e.name === 'QuotaExceededError') {
    // Show warning: "Storage full. Export data and reset?"
  }
}
```

---

## Testing Strategy

### Unit Tests (Vitest)
- `lib/streak.test.ts`: Test streak calculation edge cases
- `lib/timezone.test.ts`: Test date utilities, DST transitions
- `lib/goals.test.ts`: Test goal status calculations
- `lib/journey.test.ts`: Test journey progress calculations

### Integration Tests (Playwright)
- Habit: Complete Mon, skip Tue, open Wed → verify streak=0, best=1
- Study: Log 20 hrs → verify weekly=100% → reload → verify persists
- Timezone: Change UTC+0 → UTC+8 → verify today's logs stay on same day
- Habit ↔ Study: Complete linked habit → verify study total updated
- Pause: Pause habit 3 days → verify streak preserved
- Backfill: Backfill yesterday → verify streak recomputed
- Midnight: Wait for 23:59 → 00:01 → verify dashboard refreshes

---

## Phase 2 Deliverables Checklist

- [ ] HabitTracker migrated to useAppStore + new domain types
- [ ] StudyHours migrated to useAppStore + StudySession
- [ ] Competencies migrated to new domain types + pace indicator
- [ ] Portfolio migrated to new domain types + full CRUD + image upload
- [ ] Certificates migrated to new domain types + file upload
- [ ] Temporal correctness (midnight rollover, timezone handling)
- [ ] Streak engine integrated with HabitLog
- [ ] Journey progress calculated and displayed
- [ ] Goals and on-track logic integrated
- [ ] Trends (WoW delta, sparklines, heatmaps)
- [ ] Daily check-in flow with keyboard shortcuts
- [ ] Next-action widget guidance system
- [ ] Habit lifecycle (pause, archive, grace days)
- [ ] Habit ↔ study linkage working
- [ ] Data resilience (corrupt data, Safari ITP, quota)
- [ ] Unit tests for streak, timezone, goals, journey
- [ ] Integration tests for behavioral specs
- [ ] Build passes with all migrations
- [ ] Legacy context removed (if all components migrated)

---

## Implementation Order Recommendation

Given the complexity, I recommend this order:

1. **HabitTracker** (most complex, foundation)
2. **StudyHours** (depends on habit linkage)
3. **Temporal Correctness** (enables proper streak calculation)
4. **Streak Engine Integration** (uses temporal correctness)
5. **Competencies** (independent, medium complexity)
6. **Portfolio** (independent, medium complexity)
7. **Certificates** (independent, simpler)
8. **Trends** (depends on above data)
9. **Daily Check-In** (uses HabitTracker and StudyHours)
10. **Next-Action Widget** (uses all above)
11. **Habit Lifecycle** (enhancement to HabitTracker)
12. **Data Resilience** (infrastructure)
13. **Tests** (verify all above)

Would you like me to proceed with migrating HabitTracker first?
