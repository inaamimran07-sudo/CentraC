# Step-by-Step Render Deployment (Easiest Method)

## Part 1: Prepare Your Code

1. Open a new PowerShell terminal
2. Navigate to your project:
   ```powershell
   cd C:\Users\inaam\coding\team-management-app
   ```

3. Initialize Git (if not already done):
   ```powershell
   git init
   git add .
   git commit -m "Initial commit for deployment"
   ```

4. Create a GitHub repository:
   - Go to https://github.com/new
   - Name it: `centra-consultants`
   - Don't initialize with README
   - Click "Create repository"

5. Push your code to GitHub:
   ```powershell
   git remote add origin https://github.com/YOUR-USERNAME/centra-consultants.git
   git branch -M main
   git push -u origin main
   ```

## Part 2: Deploy Backend to Render

1. Go to https://dashboard.render.com (create free account)

2. Click "New +" → "Web Service"

3. Connect your GitHub repository

4. Configure Backend:
   - **Name:** `centra-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** `Free`

5. Add Environment Variables:
   - Click "Environment" tab
   - Add: `SECRET_KEY` = `your-random-secret-key-123456789`
   - Add: `PORT` = `5000`
   - Add: `NODE_ENV` = `production`

6. Click "Create Web Service"

7. Wait 5-10 minutes for deployment

8. Copy your backend URL (e.g., `https://centra-backend.onrender.com`)

## Part 3: Update Frontend to Use Backend URL

1. Update frontend to point to your backend URL

2. Deploy Frontend:
   - In Render, click "New +" → "Web Service"
   - Select same repository
   - **Name:** `centra-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

3. Add Environment Variable:
   - `REACT_APP_API_URL` = `your-backend-url`

## Part 4: Access Your App

Your app will be live at:
- Frontend: `https://centra-frontend.onrender.com`

Share this URL with your team!

## Notes:
- Free tier sleeps after 15 min of inactivity
- First load may take 30 seconds to wake up
- Upgrade to paid ($7/month) for always-on service
- Database persists between deployments
