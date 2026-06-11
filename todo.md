# AuraFit Pro — TODO

## Schema & Infrastructure
- [x] Extend drizzle schema: userProfiles, workoutLogs, aiChatMessages, aiPlans, subscriptions
- [x] Run migration and apply SQL
- [x] Add server-side query helpers in db.ts

## Landing Page & Design System
- [x] Premium dark theme with emerald/gold accent palette in index.css
- [x] Google Fonts (Inter + Playfair Display) in index.html
- [x] Landing page: hero section with CTA
- [x] Landing page: feature highlights section
- [x] Landing page: pricing/plans section
- [x] Landing page: footer

## Authentication & Profile Setup
- [x] Auth flow via Manus OAuth (already wired)
- [x] Post-login profile setup wizard (name, goal, level, weight, height)
- [x] Profile completion check — redirect to setup if incomplete
- [x] Profile page to view/edit user info and subscription status

## Home Workout Library
- [x] Workout data seeded in shared constants
- [x] Workout list page with filter by level and muscle group
- [x] Workout detail page with exercise list, sets, reps, rest, tips
- [x] Mark workout as complete (logs to DB)

## Gym Workout Library
- [x] Gym exercise cards with sets, reps, rest, technique tips
- [x] Filter by muscle group/category
- [x] Gym exercise detail view

## AI Fitness Coach Chat
- [x] tRPC procedure: aiChat (LLM with user profile context)
- [x] Chat UI with message history and streaming rendering
- [x] PRO gate: limit free users to 5 messages/day
- [x] Chat history persisted in DB

## AI-Generated Plans
- [x] tRPC procedure: generateWorkoutPlan (LLM, PRO only)
- [x] tRPC procedure: generateNutritionPlan (LLM, PRO only)
- [x] Plans display page with structured output
- [x] PRO gate with upgrade CTA

## Progress Tracker
- [x] Log completed workouts (tRPC mutation)
- [x] Streak calculation (consecutive days)
- [x] Weekly/monthly stats aggregation
- [x] Charts with Recharts (weekly workouts bar chart)
- [x] Progress dashboard page

## Stripe PRO Upgrade
- [x] Add Stripe feature via webdev_add_feature
- [x] tRPC procedure: createCheckoutSession
- [x] Stripe webhook handler (update subscription in DB)
- [x] Subscription status check in protectedProcedure context
- [x] PRO badge in user profile
- [x] Upgrade page with plan details and FAQ

## Admin Dashboard
- [x] adminProcedure guard (role === 'admin')
- [x] Admin: list all users with role/subscription info
- [x] Admin: platform stats (total users, PRO users, workouts logged)
- [x] Admin: promote/demote user role
- [x] Admin route restricted in frontend

## Navigation & Layout
- [x] Top navigation for public pages
- [x] Authenticated app layout with sidebar
- [x] Mobile-responsive navigation
- [x] Route protection (redirect to login if not authenticated)

## Tests & Polish
- [x] Vitest: profile setup procedure
- [x] Vitest: workout log procedure
- [x] Vitest: admin FORBIDDEN guard
- [x] Vitest: subscription checkout
- [x] All 14 tests passing
- [x] Final checkpoint and delivery
