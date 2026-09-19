# NetsUp — Cricket Net Practice Tracker

## 1. Product Overview

Build a modern, mobile-first web application called **NetsUp** using **Next.js + TypeScript**.

NetsUp is designed for cricket net practice sessions where players want to accurately track every ball they face and understand their batting performance.

The core problem:

> During cricket net practice, players often lose track of how many balls they have actually faced and how those balls were played.
> NetsUp allows another person (coach, teammate, or friend) to record the outcome of every delivery with a single tap.

The application should make recording extremely fast while providing useful session and historical statistics.

---

# 2. Core Concept

A user starts a cricket practice session.

Example:

```
Player: Amit
Date: 19 Sep 2026
Start Time: 5:30 PM

Balls faced: 42
Overs: 7.0

Middle: 18
Edge: 9
Miss: 10
Wide: 5
Out: 2
```

The person recording the session should be able to update the result of each delivery with **one tap**.

The UI must prioritize:

1. Speed
2. Large touch targets
3. Minimal navigation
4. Clear real-time statistics
5. Visually engaging feedback
6. Mobile usability

---

# 3. User Accounts / Usernames

Do NOT implement traditional authentication initially.

Users should be able to create a simple **NetsUp username/profile**.

Example:

```
Create your profile

Username:
[ Amit ]

[ Create Profile ]
```

The username should be unique within the application's storage.

Users should subsequently be able to select an existing profile:

```
Who is batting?

[ Amit ]
[ Rahul ]
[ Rohit ]
[ + Create New Player ]
```

The purpose is to maintain personalized historical records without requiring authentication.

Each player should have their own session history and aggregated statistics.

Example:

```
Amit

Sessions: 14
Balls Played: 684
Middle: 312
Edges: 143
Misses: 191
Wides: 38
Dismissals: 12
```

---

# 4. Storage

Do NOT introduce a paid database.

The application should be deployable on the **Netlify free tier**.

Use a free/simple storage approach suitable for an MVP.

Preferred options:

### Option A — Supabase Free Tier

Use Supabase for persistent storage if practical.

Potential data:

```
players
sessions
deliveries
```

### Option B — Local Storage

If implementing Supabase adds unnecessary complexity for the first version, use browser localStorage/IndexedDB behind a clean storage abstraction.

Important:

Create a storage service/interface so the application can later migrate from local storage to Supabase without rewriting the UI.

Example conceptual interface:

```
interface StorageService {
  createPlayer(): Promise<Player>;
  getPlayers(): Promise<Player[]>;
  createSession(): Promise<Session>;
  saveDelivery(): Promise<Delivery>;
  getSessions(): Promise<Session[]>;
  getPlayerStats(): Promise<PlayerStats>;
}
```

Do not tightly couple React components directly to localStorage.

---

# 5. Session Creation

The user should be able to start a new session.

Screen:

```
Start New Net Session

Player
[ Select Player ▼ ]

Date
[ 19 Sep 2026 ]

Start Time
[ 05:30 PM ]

[ Start Session ]
```

Requirements:

- Current date should be selected automatically.
- Current time should be selected automatically.
- User can modify the date/time.
- Player selection should support existing usernames.
- User should be able to create a new player from this screen.
- Multiple players can participate in different sessions.
- A session belongs to exactly one batting player initially.
  Future architecture should allow multiple players within one group/session.

---

# 6. Main Session Screen

This is the most important screen.

It should be optimized for someone standing beside the cricket net and recording deliveries.

Example layout:

```
← Exit Session

AMIT
Session: 05:30 PM

        42
    BALLS FACED

      7.0 OVERS

  ┌─────────┐  ┌─────────┐
  │ MIDDLE  │  │  EDGE   │
  │   18    │  │    9    │
  └─────────┘  └─────────┘

  ┌─────────┐  ┌─────────┐
  │  MISS   │  │   OUT   │
  │   10    │  │    2    │
  └─────────┘  └─────────┘

        WIDE
          5
```

The action buttons should be large enough to tap quickly.

---

# 7. Ball Outcome Types

The MVP should support these outcomes:

### 1. Middle

The batter makes clean/middle contact.

Effect:

```
ballsFaced += 1
middle += 1
```

### 2. Edge

The batter makes contact but edges the ball.

Effect:

```
ballsFaced += 1
edges += 1
```

### 3. Miss

The batter attempts to play the ball but does not make contact.

Effect:

```
ballsFaced += 1
misses += 1
```

### 4. Wide

The delivery is a wide.

Effect:

```
wides += 1
ballsFaced += 0
```

A wide must NOT increment the legal ball count.

### 5. Out

The batter gets dismissed.

Effect:

```
ballsFaced += 1
outs += 1
```

An out should also allow the user to optionally categorize the ball:

```
Out
├── Bowled
├── Caught
├── LBW
├── Run Out
└── Other
```

However, keep this optional if it makes the recording flow slower.

---

# 8. Overs Calculation

Calculate overs based only on legal deliveries.

Examples:

```
6 legal balls = 1.0 overs
12 legal balls = 2.0 overs
18 legal balls = 3.0 overs
25 legal balls = 4.1 overs
```

Important:

Do NOT calculate overs using normal decimal division.

Use cricket notation:

```
const completedOvers = Math.floor(legalBalls / 6);
const remainingBalls = legalBalls % 6;

const overs = `${completedOvers}.${remainingBalls}`;
```

Example:

```
25 balls → 4.1 overs
29 balls → 4.5 overs
30 balls → 5.0 overs
```

Wides should not affect this count.

---

# 9. Delivery History

The user should be able to see recent deliveries.

Example:

```
Last 12 balls

1  MIDDLE
2  EDGE
3  MISS
4  MIDDLE
5  WIDE
6  MIDDLE
7  OUT
```

Represent outcomes visually.

Example:

```
● M  ● E  ● M  ● M  ○ W  ● M
```

The history should help the recorder verify that they didn't accidentally tap the wrong button.

---

# 10. Undo Last Ball

This is mandatory.

Because the app is being used in a fast-paced environment, accidental taps will happen.

Provide:

```
↶ Undo
```

Undo should completely reverse the previous delivery's impact.

Example:

```
Before:
Balls = 42
Middle = 18

User accidentally taps Middle

Balls = 43
Middle = 19

User taps Undo

Balls = 42
Middle = 18
```

Undo should also work correctly for:

- Wide
- Edge
- Miss
- Out
  If possible, support undo for the most recent delivery only in MVP.

---

# 11. Session Summary

When the user finishes the session:

```
Session Complete

AMIT

Balls Faced
42

Overs
7.0

Middle
18
43%

Edges
9
21%

Misses
10
24%

Wides
5

Outs
2
```

Show useful percentages.

For example:

```
Middle % = Middle / Legal Balls × 100
Edge % = Edge / Legal Balls × 100
Miss % = Miss / Legal Balls × 100
```

Out should be tracked separately.

The summary should visually communicate performance without overwhelming the user.

---

# 12. Player Dashboard

Each player should have a dashboard.

Example:

```
Welcome back, Amit

━━━━━━━━━━━━━━━━━━

Sessions
14

Balls Played
684

Overs
114.0

Dismissals
12

━━━━━━━━━━━━━━━━━━

Contact Quality

Middle
312
45.6%

Edge
143
20.9%

Miss
191
27.9%

━━━━━━━━━━━━━━━━━━

Recent Sessions

19 Sep
42 balls
18 Middle
9 Edge
10 Miss
2 Out

17 Sep
54 balls
25 Middle
11 Edge
16 Miss
1 Out
```

The dashboard should make improvement over time easy to understand.

---

# 13. Historical Analytics

Provide a simple analytics section.

Useful metrics:

- Total sessions
- Total legal balls
- Total overs
- Total middles
- Total edges
- Total misses
- Total wides
- Total dismissals
- Middle percentage
- Edge percentage
- Miss percentage
  Show trends where useful.

Example:

```
Middle Contact %

Session 1    34%
Session 2    38%
Session 3    41%
Session 4    46%
Session 5    49%
```

Use simple charts.

Avoid over-engineering analytics in the first version.

---

# 14. Gen-Z Visual Design

The UI should NOT look like a traditional cricket scorecard.

Target:

> Modern sports-tech + Gen-Z fitness app.
> Design characteristics:

- Dark mode by default
- Strong typography
- Large numbers
- Rounded cards
- Subtle gradients
- Glassmorphism where appropriate
- High contrast
- Smooth transitions
- Large touch-friendly controls
- Minimal text
- Mobile-first layout
  Think:

```
Strava
+
Apple Fitness
+
Modern sports dashboard
```

Avoid:

- Old-school cricket scoreboard styling
- Excessive tables
- Tiny buttons
- Dense forms
- Corporate dashboard appearance

---

# 15. Ball Feedback Animations

This is an important product differentiator.

Every ball action should produce immediate visual feedback.

## Middle

When user taps Middle:

- Brief celebratory animation
- Cricket ball impact effect
- "MIDDLED!" text
- Small vibration if supported
- Counter increments immediately
  Example:

```
        ✦
      MIDDLED!
        🏏
```

Animation should be quick, approximately 500–1000ms.

Do not block the next input.

---

## Edge

Display something like:

```
EDGE!
↗
```

Use a subtle bat/ball trajectory animation.

---

## Miss

Display:

```
MISSED
```

with a quick ball-swing/passing animation.

Keep it playful rather than negative.

---

## Out

Make this more dramatic:

```
        🏏

       OUT!

      ❌
```

Potential animation:

- Screen shake
- Stumps animation
- Ball hitting stumps
- Red/contrast flash
- Short vibration
  Keep the animation short so the recorder can immediately record the next delivery.

---

## Wide

Display:

```
WIDE!
↗
```

with the ball moving outside the batting zone.

Do NOT trigger a legal-ball increment.

---

# 16. Sound / Haptic Feedback

If browser capabilities allow it:

- Middle → subtle positive sound/haptic
- Edge → light impact
- Miss → subtle miss sound
- Out → stronger wicket sound/haptic
- Wide → subtle notification
  Sound should be disabled by default if browser autoplay restrictions prevent it.

Provide:

```
Settings

🔊 Sound
ON / OFF

📳 Haptic Feedback
ON / OFF
```

Haptic feedback should use the browser vibration API where supported.

---

# 17. Performance Requirements

The session recording experience must feel instant.

When the user taps an action:

```
Tap
 ↓
Update UI immediately
 ↓
Animation
 ↓
Persist data asynchronously
```

Do not make the user wait for storage/database confirmation before updating the UI.

Use optimistic UI updates.

The recorder should be able to record multiple deliveries rapidly.

---

# 18. Offline-Friendly Behaviour

Net practice locations may have poor internet connectivity.

The application should continue working if the connection temporarily drops.

For MVP:

- Store active session locally.
- Persist every delivery locally.
- Sync to cloud storage when connectivity is available if Supabase is implemented.
- Never lose an active session because of a network failure.
  The active session should survive:

- Page refresh
- Temporary network loss
  If practical, use IndexedDB for active-session persistence.

---

# 19. Responsive Design

Primary target:

```
Mobile
```

Secondary:

```
Tablet
Desktop
```

The main session screen should be extremely comfortable on a phone.

Buttons should have large touch targets.

Avoid requiring precise taps.

Recommended:

```
minimum touch target: ~48px
```

Prefer larger buttons for the primary ball actions.

---

# 20. Navigation

Suggested navigation:

```
Home
│
├── Start Session
│
├── Players
│   ├── Player Profile
│   └── Player Stats
│
├── Session History
│
└── Settings
```

During an active session:

```
Active Session
│
├── Ball Counter
├── Delivery History
├── Undo
└── End Session
```

Do not expose unnecessary navigation while recording balls.

---

# 21. Home Screen

The home screen should immediately communicate the purpose.

Example:

```
NetsUp

Your net.
Your balls.
Your stats.

Track every delivery.
Improve every session.

[ Start a Session ]

[ View My Stats ]
```

If the user has an existing profile:

```
Welcome back, Amit.

Ready for another session?

[ Start Session ]
```

---

# 22. Data Model

Design the data model around individual deliveries.

Example:

```
type DeliveryOutcome =
  | "middle"
  | "edge"
  | "miss"
  | "wide"
  | "out";

interface Player {
  id: string;
  username: string;
  createdAt: string;
}

interface Session {
  id: string;
  playerId: string;
  startedAt: string;
  endedAt?: string;
  totalDeliveries: number;
  legalBalls: number;
}

interface Delivery {
  id: string;
  sessionId: string;
  outcome: DeliveryOutcome;
  timestamp: string;
  ballNumber: number;
}
```

Important:

`ballNumber` should represent the legal delivery sequence.

A wide should not consume a ball number.

Example:

```
Delivery 1 → Middle → Ball #1
Delivery 2 → Wide   → no legal ball number
Delivery 3 → Edge   → Ball #2
Delivery 4 → Miss   → Ball #3
```

---

# 23. Architecture

Use a clean, scalable structure.

Suggested:

```
src/
├── app/
│   ├── page.tsx
│   ├── session/
│   ├── players/
│   └── history/
│
├── components/
│   ├── session/
│   ├── player/
│   ├── dashboard/
│   ├── animations/
│   └── ui/
│
├── hooks/
│
├── lib/
│   ├── storage/
│   ├── stats/
│   └── utils/
│
├── types/
│
└── constants/
```

Use reusable components.

Do not put all session logic inside one giant component.

---

# 24. State Management

Keep state management lightweight.

Do not introduce Redux unless genuinely required.

Use:

- React state
- Context where appropriate
- Zustand if global state becomes useful
  The active session state should be centralized enough that:

- Session screen
- Delivery history
- Statistics
- Undo
- Animations
  remain synchronized.

---

# 25. SEO

The application should have SEO-friendly public pages.

Use Next.js metadata.

Target keywords around:

- cricket net practice
- cricket practice tracker
- cricket ball counter
- cricket net session tracker
- batting practice tracker
  Create meaningful metadata:

```
Title:
NetsUp — Cricket Net Practice Tracker

Description:
Track every ball during cricket net practice and analyze your batting performance with real-time session statistics.
```

The actual authenticated/private-style tracker does not need to be SEO indexed.

Public landing/content pages should be optimized for search engines.

---

# 26. Accessibility

Ensure:

- Keyboard accessibility
- Proper button semantics
- Accessible labels
- Good color contrast
- Reduced-motion support
  If the user enables:

```
prefers-reduced-motion
```

animations should be reduced or disabled.

---

# 27. Error Handling

The app should never silently lose session data.

Handle:

- Storage failure
- Invalid player name
- Duplicate username
- Session creation failure
- Corrupted local data
- Network failure
  Display concise actionable messages.

Avoid technical error messages to end users.

---

# 28. MVP Scope

Prioritize these features first:

### Phase 1

1. Landing page
2. Player creation
3. Player selection
4. Session creation
5. Current date/time
6. Ball recording
7. Middle
8. Edge
9. Miss
10. Wide
11. Out
12. Live ball count
13. Live overs
14. Undo
15. Session history
16. Session summary
17. Player statistics
18. Local persistence
19. Mobile-first UI
20. Animations

### Phase 2

After the MVP works:

1. Supabase cloud persistence
2. User authentication
3. Cloud sync
4. Advanced analytics
5. Charts
6. Multiple players in a single session
7. Out-type categorization
8. Sound effects
9. Haptic feedback
10. PWA installation
11. Offline sync
    Do not implement Phase 2 features before the core ball-recording experience is stable.

---

# 29. Critical UX Principle

The application is being used **while someone is actively bowling in a cricket net**.

Therefore:

> Recording a delivery must require one tap.
> The user should NOT have to:

- Open a modal
- Fill a form
- Confirm every delivery
- Wait for an API request
- Navigate to another page
  Correct flow:

```
Ball happens
     ↓
Recorder taps outcome
     ↓
Counter updates instantly
     ↓
Animation plays
     ↓
Ready for next ball
```

Target interaction time:

**< 1 second per delivery.**

---

# 30. Product Philosophy

NetsUp should answer three questions:

### During practice

> "How many balls have I faced?"

### Immediately after practice

> "How did I perform?"

### Over multiple sessions

> "Am I actually improving?"
> Every feature should support one of these three questions.

Avoid adding features that increase complexity without improving these core outcomes.

---

# 31. Development Instructions

Build the application incrementally.

First implement:

```
Landing Page
→ Player Profile
→ Start Session
→ Active Session
→ Ball Recording
→ Session Summary
→ History
→ Player Stats
```

Before moving to the next stage, ensure the previous stage works correctly.

Use TypeScript strictly.

Avoid unnecessary dependencies.

Prefer simple, maintainable architecture over premature abstraction.

The final application should feel like a polished consumer sports product rather than a CRUD demo.

Focus heavily on the **active session screen**, because that is the core product experience.
