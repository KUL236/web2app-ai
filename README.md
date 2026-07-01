# Web2App AI — Complete Deployment Guide

## Architecture
```
React (Netlify CDN) + Netlify Functions + Supabase + GitHub Actions
```

---

## STEP 1: Supabase Setup

1. Go to https://supabase.com → your project
2. Click **SQL Editor** → **New Query**
3. Paste the entire contents of `supabase-schema.sql`
4. Click **Run** — all tables, RLS policies, and triggers will be created
5. Go to **Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

---

## STEP 2: GitHub Repository Setup

1. Create a new GitHub repository named `web2app-ai`
2. Push this entire project to it:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/web2app-ai.git
   git push -u origin main
   ```

3. Generate an Android keystore for signing APKs:
   ```bash
   keytool -genkey -v -keystore release.jks \
     -alias web2app \
     -keyalg RSA \
     -keysize 2048 \
     -validity 10000 \
     -storepass YOUR_STORE_PASSWORD \
     -keypass YOUR_KEY_PASSWORD \
     -dname "CN=Web2App AI, OU=Mobile, O=Web2App, L=Mumbai, S=MH, C=IN"

   # Encode to base64
   base64 -w 0 release.jks > keystore_base64.txt
   ```

4. Go to GitHub repo → **Settings → Secrets and Variables → Actions**
   Add these secrets:
   ```
   KEYSTORE_BASE64        = (contents of keystore_base64.txt)
   KEYSTORE_PASSWORD      = YOUR_STORE_PASSWORD
   KEY_ALIAS              = web2app
   KEY_PASSWORD           = YOUR_KEY_PASSWORD
   SUPABASE_URL           = https://lgmndgllitkbdbjiyaef.supabase.co
   SUPABASE_SERVICE_ROLE_KEY = (from Supabase settings)
   INTERNAL_SECRET        = (generate: openssl rand -hex 32)
   ```

---

## STEP 3: Netlify Deployment

1. Go to https://netlify.com → **Add new site → Import from Git**
2. Connect your GitHub repo
3. Build settings (auto-detected from netlify.toml):
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Go to **Site Settings → Environment Variables** and add ALL of these:
   ```
   VITE_SUPABASE_URL          = https://lgmndgllitkbdbjiyaef.supabase.co
   VITE_SUPABASE_ANON_KEY     = sb_publishable_sfZ4-OzupQmdN7OCZQpVrg_I1jCaloE
   VITE_NETLIFY_URL           = https://YOUR-SITE.netlify.app
   SUPABASE_URL               = https://lgmndgllitkbdbjiyaef.supabase.co
   SUPABASE_SERVICE_ROLE_KEY  = (service role key from Supabase)
   GITHUB_TOKEN               = (Personal Access Token — needs repo + workflow scopes)
   GITHUB_OWNER               = your_github_username
   GITHUB_REPO                = web2app-ai
   INTERNAL_SECRET            = (same value you set in GitHub secrets)
   URL                        = https://YOUR-SITE.netlify.app
   ```
5. Click **Deploy site**

---

## STEP 4: Generate GitHub Personal Access Token

1. GitHub → **Settings → Developer Settings → Personal Access Tokens → Fine-grained**
2. Set permissions:
   - **Repository contents**: Read & Write
   - **Actions**: Read & Write
   - **Metadata**: Read
3. Copy the token → set as `GITHUB_TOKEN` in Netlify

---

## STEP 5: Test a Build

1. Open your Netlify URL → Sign up for an account
2. Go to **Create App**
3. Enter:
   - App Name: `Test App`
   - Website URL: `https://example.com`
   - Package: auto-generated
4. Click **Create App & Build APK**
   - You can keep **Use website favicon as app icon** enabled, or upload a custom PNG/JPG logo instead.
5. Watch the Build Status page — should update every 5 seconds
6. After ~3-5 minutes → Download your APK!

---

## STEP 6: Test APK Installation

1. Transfer the downloaded APK to an Android device
2. Enable **Settings → Security → Install unknown apps**
3. Tap the APK and install
4. Open the app — it loads your website in a native wrapper

---

## Troubleshooting

### Build never starts
- Check GitHub Actions tab in your repo for errors
- Verify `GITHUB_TOKEN` has `workflow` permission
- Verify `GITHUB_OWNER` and `GITHUB_REPO` match exactly

### Build status stuck on "queued"
- The callback URL must be reachable from GitHub Actions
- Check Netlify function logs: **Netlify Dashboard → Functions**

### APK not signing
- Verify `KEYSTORE_BASE64` was encoded correctly: `base64 -w 0 release.jks`
- Verify passwords match what you used in `keytool`

### Supabase RLS errors
- Make sure you ran the entire `supabase-schema.sql`
- Check `service_role` key is used in Netlify functions (NOT anon key)

---

## Production Checklist

- [ ] Supabase schema deployed
- [ ] GitHub repo created and code pushed
- [ ] Android keystore generated and secrets added to GitHub
- [ ] Netlify site deployed with all environment variables
- [ ] GitHub PAT created with correct permissions
- [ ] Test build completed successfully
- [ ] APK installs on Android device
- [ ] Custom domain configured (optional)
- [ ] Supabase Auth email templates customized (optional)

---

## File Structure Summary

```
web2app-ai/
├── src/                    # React frontend
│   ├── pages/              # 9 pages
│   ├── components/         # UI components
│   ├── context/            # Auth context
│   ├── hooks/              # Data hooks
│   └── lib/                # Supabase client + utils
├── netlify/functions/      # 3 serverless functions
├── android-template/       # Native Kotlin Android app
├── .github/workflows/      # GitHub Actions CI/CD
├── supabase-schema.sql     # Complete DB schema
├── netlify.toml            # Netlify configuration
└── .env.example            # Environment variables template
```
