# Patient Portal — React + Supabase

A working patient registration/login app wired to your `Patients` table.

## What it does

- **Sign up** → creates a Supabase Auth account (email + password)
- **Log in** → if you already have a patient record, shows it (tests your SELECT policy)
- **Log in, no record yet** → shows the intake form with all 10 columns; saving it inserts a row tied to your `user_id` (tests your INSERT policy)

## 1. Install Node.js (one-time, skip if you already have it)

Download and install from https://nodejs.org (the "LTS" version). This gives you the `node` and `npm` commands.

## 2. Get your Supabase keys

In your Supabase project dashboard: **Settings → API**. Copy:
- **Project URL**
- **anon public** key (NOT the `service_role` key — never use that one here)

## 3. Configure the project

In this folder, make a copy of `.env.example` and rename it to `.env`, then paste in your values:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

## 4. Run it

Open a terminal in this folder and run:

```
npm install
npm run dev
```

Terminal will print a local address, usually `http://localhost:5173` — open that in your browser.

## Important: email confirmation setting

By default, Supabase requires patients to click a confirmation link in their email before they get a login session. Since RLS requires an authenticated session to insert a row, an *unconfirmed* signup can't complete registration yet.

For quick local testing, you can turn this off:
**Supabase dashboard → Authentication → Providers → Email → toggle off "Confirm email"**.

Leave it on for anything real — patients should verify their email address.

## Files that matter

- `src/supabaseClient.js` — connects to your project using the `.env` values
- `src/App.jsx` — all the logic (auth, form, profile view)
- `src/App.css` — styling
- `.env` — your keys (never commit this file or share it)

## Next steps once this is confirmed working

- Password reset flow
- Editing an existing patient record (currently insert-only)
- A doctor/physician-facing view (needs separate RLS policies — your current policies only let a patient see their own row)
