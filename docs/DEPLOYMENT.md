# Deployment Guide

This guide covers deploying the full-stack Free Fire Inspired Esports Tournament Platform using **Vercel** for the frontend, **Koyeb** for the Spring Boot backend, and **Supabase** for the PostgreSQL database.

---

## 1. Cloud Deployment (Vercel + Koyeb + Supabase) [Recommended]

This setup ensures:
1. **No sleep/wake-up delays** on the free tier (thanks to Koyeb).
2. **No database expiry** after 90 days (thanks to Supabase).
3. **Automatic HTTPS/SSL** on all layers.

---

### Step 1: Push Code to GitHub
1. Make sure your local project is pushed to your private GitHub repository (`https://github.com/eglesportsff-dev/EGL.git`).

---

### Step 2: Set Up PostgreSQL on Supabase
1. Sign in to the [Supabase Dashboard](https://supabase.com/).
2. Click **"New Project"**, select your organization, and configure:
   - **Name**: `tournament-db`
   - **Database Password**: *(Choose a strong password and save it)*
   - **Region**: Choose the closest region (e.g. `Singapore` or `East US`).
   - **Plan**: Select **Free**.
3. Click **"Create new project"** and wait for the database to provision (1-2 minutes).
4. Navigate to **Project Settings** (gear icon on the left menu) -> **Database**.
5. Scroll down to the **Connection string** section, select **URI**, and copy the connection string.
   - Example: `postgresql://postgres.[YOUR-PROJECT-ID]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
   - *(Note: Remember to replace `[YOUR-PASSWORD]` with your actual password).*

---

### Step 3: Deploy the Spring Boot Backend on Koyeb
1. Sign in to the [Koyeb Dashboard](https://app.koyeb.com/).
2. Click **"Create Service"** (or **"Create App"**).
3. Select **GitHub** as the deployment method and authorize it to access your repositories.
4. Select your repository `eglesportsff-dev/EGL`.
5. Configure the service settings:
   - **Branch**: `main`
   - **Work Directory**: `/backend`
   - **Builder**: Select **Docker** (to use our `backend/Dockerfile` automatically).
   - **Instance Type**: Select **Eco (Nano)** (512MB RAM, 0.25 vCPU - Free).
   - **Service Name**: `tournament-backend`
6. Click **"Add Environment Variable"** and enter the following keys and values:
   - `DATABASE_URL`: *(Your Supabase Connection URI from Step 2 with `jdbc:` prepended. Example: `jdbc:postgresql://postgres.[ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require`)*
   - `DATABASE_USERNAME`: `postgres.[YOUR-PROJECT-ID]` *(The username portion from your Supabase connection URI)*
   - `DATABASE_PASSWORD`: *(Your Supabase database password)*
   - `JWT_SECRET`: *(A secure 64+ character random string)*
   - `FRONTEND_ORIGIN`: `https://your-frontend.vercel.app` *(update this to your Vercel URL once the frontend is deployed)*
   - `MAIL_HOST`: `smtp-relay.brevo.com`
   - `MAIL_PORT`: `587`
   - `MAIL_USERNAME`: `ac2e9d001@smtp-brevo.com`
   - `MAIL_PASSWORD`: *(Your Brevo SMTP key from your local .env)*
   - `MAIL_FROM`: `eglesportsff@gmail.com`
   - `ADMIN_EMAIL`: `lavkush01maurya@gmail.com`
   - `ADMIN_PASSWORD`: `Lav#2004`
   - `ADMIN_USERNAME`: `Lavkush`
7. Click **"Deploy"**. Koyeb will compile and boot your backend. Once active, copy the public URL generated (e.g. `https://[app-name].koyeb.app`).

---

### Step 4: Deploy the React Frontend on Vercel
1. Log in to [Vercel](https://vercel.com/) using your GitHub account.
2. Click **"Add New"** > **"Project"** and import your repository.
3. Configure the project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand the **Environment Variables** section and add:
   - `VITE_API_URL`: `https://[your-app-name].koyeb.app/api` *(replace this with the public Koyeb backend URL you copied in Step 3, making sure to append `/api`)*
5. Click **"Deploy"**. Vercel will build the frontend and provide you with a public `https://...` URL.

---

### Step 5: Update CORS Origin in Koyeb
1. Return to your **Koyeb Dashboard** and open your backend service settings.
2. Go to **Environment Variables** and update the `FRONTEND_ORIGIN` variable with your new Vercel URL (e.g. `https://[your-app-name].vercel.app`).
3. Save the changes. Koyeb will automatically redeploy the service to apply the new CORS permission.

---

## 2. Production Checklist

- [ ] **DDL Updates**: Once the database structure is stable, edit the backend env config on Koyeb and set `JPA_DDL_AUTO` to `validate` (instead of `update`).
- [ ] **Rate Limiting & Security**: Route your Vercel frontend domain through Cloudflare for DDoS protection and CDN caching.
