# FlatMateX

FlatMateX is a Vite + React dashboard for organizing shared flatmate life:
expenses, groceries, chores, events, notes, planning, and wellness.

## Development

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

The application currently uses the existing local demo data layer. Supabase
authentication and PostgreSQL persistence are available when configured.

## Supabase setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env` and add the project URL and anon key.
3. Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL editor. This creates the group, membership, invitation, and row-level security rules.
4. Start the app with `npm run dev`.

Shared expenses, groceries, events, tasks, timetable entries, and notes are
visible to members of the same flat group. Mood entries remain private to the
user who created them. The Flatmates page creates a reusable seven-day group
link that can be copied and shared manually. The recipient signs in, opens the
link, and joins the group.

When the Supabase variables are present, dashboard routes require authentication
and the Settings page supports profile updates, password reset emails, and sign
out. Without them, the app runs in its local demo mode.

### Google OAuth

In Supabase, open **Authentication → Providers → Google**, enable the provider,
and copy the generated callback URL. In Google Cloud Console, add this exact URL
as an **Authorized redirect URI**:

```text
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

Replace `YOUR_PROJECT_REF` with the project reference from the error message
(for example, `tecsmrvjwmnlrobhvypx`). Do not use `http://localhost:5173` as the
Google redirect URI; that URL belongs in Supabase's **Site URL** and
**Redirect URLs** settings. Add `http://localhost:5173/**` there for local
development.
