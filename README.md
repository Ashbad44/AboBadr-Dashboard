# Monthly Earning Report — Setup Guide

A private, login-protected accounting dashboard matching your spreadsheet and design.
Follow these steps in order. Total time: ~15 minutes.

---

## 1. Set up the database (Supabase)

1. Go to your Supabase project → **SQL Editor** → **New query**.
2. Open `sql/schema.sql` from this project, copy all of it, paste it in, and click **Run**.
   This creates all 5 tables, security rules, and pre-fills Branch 1–5 and your 8 earning sources
   exactly as in your spreadsheet.

## 2. Create your login (single user, no public sign-up)

1. In Supabase, go to **Authentication → Users → Add user → Create new user**.
2. Enter your email and a password. Check "Auto Confirm User."
3. Go to **Authentication → Providers → Email**, and turn **OFF** "Allow new users to sign up."
   This makes sure no one else can register an account — only you, created manually, can log in.

## 3. Get your API keys

1. In Supabase, go to **Project Settings → API**.
2. Copy the **Project URL** and the **anon public** key. You'll paste these into Vercel next.

## 4. Deploy to Vercel

**Easiest path (no coding tools needed):**

1. Go to vercel.com → **Add New → Project**.
2. Since this project isn't on GitHub yet, the simplest route is:
   - Create a free GitHub account if you don't have one (github.com).
   - Create a new empty repository, e.g. `monthly-earning-report`.
   - On your Mac, open Terminal, `cd` into this project folder, then run:
     ```
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/YOUR-USERNAME/monthly-earning-report.git
     git push -u origin main
     ```
3. Back in Vercel, import that GitHub repo.
4. When Vercel asks for **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` → paste your Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → paste your anon public key
5. Click **Deploy**. In under a minute you'll get a live URL like `monthly-earning-report.vercel.app`.

## 5. First login

1. Open your live Vercel URL.
2. Sign in with the email/password you created in Step 2.
3. Go to **Settings** in the sidebar → **Enable authenticator app 2FA** → scan the QR code with
   Google Authenticator / Microsoft Authenticator / Authy → enter the 6-digit code to confirm.
4. From now on, every login asks for password + that 6-digit code.

## 6. Using it day to day

- The **month dropdown** at the top loads/saves that month's data separately — past months stay saved.
- Every number field saves automatically about half a second after you stop typing (you'll see "saving…" next to the subtitle).
- Branch and earning source **names are editable** — type directly into the name field.
- Use **+ Add branch** / **+ Add source** to add new rows any time; the ✕ button archives one (old months keep their history).

---

## Updating an already-deployed site (Arabic + editable text)

If you already deployed this once before, you only need two quick steps to get
the new Arabic interface and the "edit any text" feature:

1. In Supabase → SQL Editor → New query, paste and run `sql/migration_arabic_labels.sql`
   (not the full `schema.sql` — this only adds the new `labels` table, it won't touch
   your existing branches or saved months).
2. On your Mac, back in the project folder in Terminal, push the updated code:
   ```
   git add .
   git commit -m "Arabic interface and editable text"
   git push
   ```
   Vercel will automatically detect the push and redeploy your site within a minute or two.

**Editing any title, label, or column name:** go to **Settings → تحرير نصوص الموقع** (Edit
Site Text). Every heading, card title, table column, and button label is grouped there and
editable — change any of them and click the save button under that group.

**Branch and earning-source names** were already editable directly on the Dashboard before
this update (type right into the name field) — that hasn't changed, it just now defaults to
Arabic names.

**Numbers stay in Western digits (0–9)** everywhere, including money amounts and the year —
only the surrounding text and month names are in Arabic.

---

## One assumption I made — please confirm

In your spreadsheet, the last row was labeled *"final total income **+** electricity, water,
salaries & other payment."* Since electricity, salaries, etc. are costs (not income), I built it
as **Final Total Income − those payments**, so the number reflects what's actually left over.
If you actually want them added instead, tell me and I'll flip the formula in `app/dashboard/page.js` (one line).

---

## Local development (optional)

If you want to preview changes on your Mac before pushing to Vercel:

```
npm install
cp .env.local.example .env.local   # then paste in your Supabase URL + key
npm run dev
```

Then open http://localhost:3000
