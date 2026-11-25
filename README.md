# The Academic Curator

Student-led campus tours of colleges in Delhi NCR and Dehradun. Students and
parents book a visit, a current student shows them around, and partner colleges
pay a commission when a visitor takes admission.

React 19 + Vite + Tailwind 4 on the front end, Supabase (Postgres, Auth,
Storage) behind it, deployed on Vercel.

## Run it locally

```bash
npm install
cp .env.example .env.local   # then fill in the two values
npm run dev
```

`.env.local` needs:

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

## Database

Migrations are plain SQL files run by hand in the Supabase SQL editor, in this
order:

1. `migration.sql`
2. `migration_v2.sql`
3. `migration_v3_storage.sql`
4. `migration_v4_queries.sql`
5. `migration_v5_user_roles.sql` (then grant your own account admin using the commented statement at the bottom)
6. `migration_v6_site_settings.sql`
7. `migration_v7_security_and_indexes.sql`
8. `migration_v8_slots_and_concurrency.sql`
9. `migration_v9_booking_integrity.sql`

`database.types.ts` is out of date: it predates the pricing, slot and status
columns. Regenerate it after running the migrations:

```bash
npx supabase gen types typescript --project-id <project-ref> > database.types.ts
```

## How bookings work

Students never write to the `bookings` table directly. The app calls three
database functions, and each takes the user from the session:

| Function | What it does |
| --- | --- |
| `create_booking` | Checks seats, reads the price from the tour, creates the booking |
| `update_booking` | Changes date, slot, course or group size of an upcoming booking |
| `cancel_booking` | Marks an upcoming booking cancelled and frees its seats |

Only admins can mark a booking completed. That status is the record a college
commission is claimed against, so it must not be editable by the student.

## Scripts

- `npm run dev`: local dev server
- `npm run build`: production build
- `npm run lint`: ESLint
