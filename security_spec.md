# Security Specification - Weber Inácio Personal

## 1. Data Invariants
- A `Workout` must belong to a valid `User` (student).
- An `Exercise` must belong to a valid `Workout`.
- A `ProgressEntry` must belong to a valid `User` (student).
- Only an `admin` can create and update `User` roles.
- Only an `admin` can create and update `Workouts` and `Exercises`.
- Students can only read `Workouts` and `Exercises` assigned to their `studentId`.
- Students can only read and write their own `ProgressEntry`.
- Students can only read and update their own `User` profile (except role).

## 2. The "Dirty Dozen" Payloads (Unauthorized Attempts)
1. **Role Escalation**: Student trying to update their role to 'admin'.
2. **Workout Hijack**: Student trying to read another student's workout.
3. **Ghost Workout**: Student trying to create a workout for themselves.
4. **Exercise Injection**: Student trying to add an exercise to any workout.
5. **Profile Peeking**: Student trying to read another student's profile.
6. **Progress Forge**: Student trying to create a progress entry for another student.
7. **Workout Deletion**: Student trying to delete their own workout.
8. **Admin Impersonation**: Unauthenticated user trying to list all users.
9. **Exercise Modification**: Student trying to update exercise reps/sets.
10. **Progress Scraper**: Student trying to list all global progress entries.
11. **Shadow Field Injection**: Student adding `isVerified: true` to their profile.
12. **Orphaned Exercise**: Creating an exercise for a non-existent workout.

## 3. Test Runner (Conceptual)
The `firestore.rules.test.ts` would verify that all the above payloads return `PERMISSION_DENIED`.
