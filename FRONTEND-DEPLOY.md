# Frontend Deployment Guide - Render

## Quick Deploy Steps

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Select your GitHub repository: `CentraC`
   - Click "Connect"

3. **Configure Frontend Service**
   ```
   Name: CentraC-Frontend
   Region: Oregon (US West) or closest to you
   Branch: main
   Root Directory: frontend
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npx serve -s build -l $PORT
   Instance Type: Free
   ```

4. **Add Environment Variables**
   Click "Advanced" and add:
   - Key: `NODE_ENV`
     Value: `production`

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete (3-5 minutes)
   - Your app will be live at: `https://centrac-frontend-xxxx.onrender.com`

## Important Notes

- The frontend connects to your backend at: https://centrac.onrender.com
- Free tier: sleeps after 15 min inactivity, 30-50s wake time
- Auto-deploys on every GitHub push
- Build may fail if npm modules have issues - check logs

## Testing

Once deployed:
1. Visit your frontend URL
2. Login with: inaamimran07@gmail.com / Atg9341poL
3. Test all features: team members, categories, calendar
4. Share URL with your team!

## Troubleshooting

**Build fails:**
- Check Render logs for specific error
- Verify all dependencies are in package.json
- Ensure build command is correct

**Cannot connect to backend:**
- Verify backend URL in package.json proxy setting
- Check backend is still running (visit https://centrac.onrender.com/api/auth/login)
- Check CORS settings in backend

**Slow loading:**
- First load after sleep takes 30-50 seconds (free tier)
- Consider upgrading to paid tier for instant wake
