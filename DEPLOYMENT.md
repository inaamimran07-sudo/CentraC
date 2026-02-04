# Team Management App - Deployment Guide

## Quick Deploy Options

### Option 1: Render (Recommended - Free Tier Available)
**Best for:** Easy setup, free hosting, automatic deployments

1. **Prepare Your App**
   - All files are ready (see below)
   - Database will automatically migrate to production

2. **Deploy Steps**
   - Go to https://render.com and sign up (free)
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Create a new repository for this project
   - Push your code to GitHub
   - Select the repository in Render
   - Configure:
     * Name: centra-consultants-backend
     * Environment: Node
     * Build Command: `npm install`
     * Start Command: `node server.js`
     * Add Environment Variable: `SECRET_KEY` = (generate a random string)
   - Click "Create Web Service"
   - Repeat for frontend:
     * Name: centra-consultants-frontend
     * Build Command: `npm install && npm run build`
     * Start Command: `npm start`

### Option 2: Railway (Easy Alternative)
**Best for:** Simple deployment, good free tier

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Node.js and deploys
6. Add environment variables in settings
7. Get your public URL

### Option 3: DigitalOcean (Most Control - $5/month)
**Best for:** Full control, better performance

1. Create a DigitalOcean account
2. Create a Droplet (Ubuntu Server)
3. SSH into server
4. Install Node.js, npm, git
5. Clone your repository
6. Install dependencies
7. Use PM2 to keep app running
8. Configure Nginx as reverse proxy
9. Set up SSL certificate (free with Let's Encrypt)

### Option 4: Heroku (Paid - $7/month)
**Best for:** Established platform, easy management

1. Install Heroku CLI
2. Run: `heroku create centra-consultants`
3. Push: `git push heroku main`
4. Set environment variables
5. App is live!

## What's Included in Your Deployment Package

✅ Backend configured for production
✅ Frontend build scripts ready
✅ Database will work in production
✅ Environment variables configured
✅ Static file serving enabled
✅ CORS properly configured

## Accessing Your App

Once deployed, you'll get a URL like:
- `https://centra-consultants.onrender.com`
- `https://centra-consultants.up.railway.app`

Share this URL with your team - they can access it from any device, anywhere!

## Need Help?

I can walk you through any of these options step-by-step. Which deployment method would you prefer?
