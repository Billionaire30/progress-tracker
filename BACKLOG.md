# Progress Tracker - Prioritized Backlog

## Completed Features ✅

### Phase 1: Data Model & Persistence
- [x] Optimize Context implementation with debounced localStorage writes
- [x] Add domain types to `/types/domain.ts`
- [x] Verify Export/Import JSON functionality
- [x] Verify initial data seeding

### Phase 2: Core Functionality
- [x] Add 7-day mini-grid to Habit Tracker
- [x] Improve streak calculation with historical date support
- [x] Verify Log Hours modal functionality
- [x] Verify Competencies show all 17 items
- [x] Add Portfolio item detail drawer
- [x] Add "+ Add Item" functionality to Portfolio
- [x] Verify Certificates empty state has CTA

### Phase 3: UI/UX Premium Polish
- [x] Add mobile bottom navigation bar
- [x] Add section IDs for navigation
- [x] Implement auto-hide behavior on scroll

### Phase 4: Performance
- [x] Add code splitting with next/dynamic for heavy components

### Phase 6: Premium Features
- [x] Add Focus Timer (Pomodoro) with auto-logging

### Phase 7: Deliverables
- [x] Update README.md with architecture and documentation

---

## High Priority 🔴

### Accessibility Improvements
- [ ] Add ARIA labels to all icon buttons
- [ ] Ensure keyboard navigation works for all interactive elements
- [ ] Add focus trap to modals
- [ ] Verify contrast ratios meet WCAG AA (4.5:1)
- [ ] Add visible focus rings for keyboard users
- [ ] Add skip-to-main-content link (partially implemented)

### Mobile UX Enhancements
- [ ] Ensure all tap targets are ≥44×44px
- [ ] Test on 320px breakpoint (small phones)
- [ ] Add haptic feedback for habit completion (if supported)
- [ ] Optimize touch spacing in dense areas
- [ ] Add pull-to-refresh on mobile

### Data Integrity
- [ ] Add conflict resolution for Firebase sync
- [ ] Implement offline queue for sync operations
- [ ] Add data validation on import
- [ ] Add backup before major operations
- [ ] Implement undo for destructive actions

---

## Medium Priority 🟡

### Phase 3: Design System & Micro-interactions
- [ ] Refine design system tokens (ensure consistency)
- [ ] Add check-off animations (scale + check draw)
- [ ] Add progress bar animations on value change
- [ ] Add skeleton loaders for async operations
- [ ] Add toast notifications for all save operations
- [ ] Add Recharts habit heatmap (last 90 days)
- [ ] Add Recharts competency completion ring

### Phase 4: Performance Optimization
- [ ] Add React.memo to expensive list items
- [ ] Add useMemo for derived selectors
- [ ] Configure @next/bundle-analyzer
- [ ] Remove unused dependencies
- [ ] Optimize Recharts and Framer Motion imports
- [ ] Add next/font with display: swap
- [ ] Target Lighthouse ≥95 Performance
- [ ] Add PWA service worker with next-pwa
- [ ] Make app offline-capable

### Phase 5: Code Quality
- [ ] Set up ESLint + Prettier in CI
- [ ] Add tsc --noEmit to CI
- [ ] Add Vitest unit tests for streak calculation
- [ ] Add Vitest unit tests for week calculation
- [ ] Add Vitest unit tests for persistence migration
- [ ] Add Playwright e2e test: add habit → complete → reload → verify
- [ ] Add Playwright e2e test: log hours → verify weekly total
- [ ] Add error boundary around app shell
- [ ] Remove dead code
- [ ] Split large components (>200 lines)
- [ ] Move hard-coded strings to /constants/
- [ ] Add JSDoc for exported utilities

---

## Low Priority 🟢

### Phase 6: Premium Features
- [ ] Add Share Card feature (html-to-image)
  - Generate PNG progress snapshot
  - Include streak + % + top habits
  - Download/share button
- [ ] Add Daily reminder with Notifications API
  - Local notification support
  - "Remind me" toggle in settings
  - Configurable reminder time
- [ ] Add 3-step onboarding flow
  - Step 1: Name
  - Step 2: Start date
  - Step 3: Weekly goal
  - Skip option available

### Additional Premium Features
- [ ] Backup to GitHub Gist (stretch)
- [ ] Habit edit functionality (currently only add/delete)
- [ ] Portfolio image upload in "Add Item" (base64 for MVP)
- [ ] Custom habit icons
- [ ] Habit categories customization
- [ ] Weekly goal per day (not just per week)
- [ ] Multiple workspaces support
- [ ] Export to PDF report
- [ ] Calendar view of study sessions
- [ ] Heatmap calendar (GitHub-style)

### Social Features
- [ ] Public profile sharing
- [ ] Friend leaderboard
- [ ] Challenge friends to streak battles
- [ ] Share progress on social media

---

## Technical Debt 🔧

### Code Structure
- [ ] Consolidate duplicate components
- [ ] Standardize error handling patterns
- [ ] Extract magic numbers to constants
- [ ] Improve type coverage (currently partial)
- [ ] Add proper error boundaries for each section

### Testing
- [ ] Increase test coverage to 80%+
- [ ] Add integration tests for Firebase sync
- [ ] Add visual regression tests
- [ ] Add performance regression tests

### Documentation
- [ ] Add component documentation (Storybook?)
- [ ] Add API documentation for lib functions
- [ ] Add architecture decision records (ADRs)
- [ ] Add contribution guidelines

---

## Future Enhancements 💡

### AI Features
- [ ] AI-powered study suggestions
- [ ] Intelligent habit recommendations
- [ ] Progress prediction based on patterns
- [ ] Natural language queries (e.g., "How many hours did I study last week?")

### Integrations
- [ ] Google Calendar sync
- [ ] Notion integration
- [ ] Toggl time tracking integration
- [ ] Dropbox file storage
- [ ] Health app integration (focus time)

### Analytics
- [ ] Advanced analytics dashboard
- [ ] Personal insights and recommendations
- [ ] Productivity trends over time
- [ ] Comparative analysis (your progress vs typical)

### Gamification Enhancements
- [ ] More achievement types
- [ ] Seasonal challenges
- [ ] Daily streak multipliers
- [ ] Leaderboards (anonymous)
- [ ] Unlockable themes

---

## Bug Reports 🐛

### Known Issues
- None currently reported

### Potential Issues to Monitor
- LocalStorage quota limits (5MB typically)
- Firebase rate limits on free tier
- Memory usage with large data sets
- Performance on low-end mobile devices

---

## Metrics & KPIs 📊

### Performance Targets
- Lighthouse Performance: ≥95
- Lighthouse Accessibility: 100
- Lighthouse Best Practices: 100
- Time to Interactive: <3s
- First Contentful Paint: <1.5s

### Engagement Targets
- Daily Active Users: N/A (personal app)
- Session Duration: >10 minutes
- Habit Completion Rate: >70%
- Weekly Goal Achievement: >60%

---

## Resources 📚

### Dependencies to Monitor
- Next.js updates (currently 16.4.3)
- React updates (currently 19.3.1)
- Radix UI updates
- Firebase SDK updates

### External Services
- Vercel (hosting)
- Firebase (optional sync)
- Cloudflare (optional - see existing docs)

---

## Release Notes Template

### vX.X.X (YYYY-MM-DD)

#### New Features
- [Feature 1]
- [Feature 2]

#### Improvements
- [Improvement 1]
- [Improvement 2]

#### Bug Fixes
- [Bug fix 1]
- [Bug fix 2]

#### Breaking Changes
- [Breaking change - if any]

#### Dependencies
- Updated [package] to [version]

---

Last updated: 2026-11-03
