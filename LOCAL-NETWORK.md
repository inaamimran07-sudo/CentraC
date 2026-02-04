# Local Network Setup (Access from other devices in your home/office)

## Quick Setup - Access from phones/tablets on same WiFi

### Step 1: Find Your Computer's IP Address

Open PowerShell and run:
```powershell
ipconfig
```

Look for "IPv4 Address" under your active network (usually starts with 192.168.x.x)
Example: `192.168.1.100`

### Step 2: Update Frontend Configuration

1. Open: `frontend/package.json`
2. Find the "proxy" line and update it to:
   ```json
   "proxy": "http://192.168.1.100:5000"
   ```
   (Replace with YOUR IP address)

### Step 3: Start Both Servers

```powershell
# Terminal 1 - Backend
cd C:\Users\inaam\coding\team-management-app\backend
node server.js

# Terminal 2 - Frontend  
cd C:\Users\inaam\coding\team-management-app\frontend
npm start
```

### Step 4: Access from Other Devices

On your phone/tablet (connected to same WiFi):
- Open browser
- Go to: `http://192.168.1.100:3000`
  (Replace with YOUR computer's IP)

### Important Notes:

✅ **Works when:** Your laptop is ON and connected to WiFi
❌ **Stops when:** You close your laptop or turn off WiFi
🔒 **Security:** Only accessible on your local network
⚡ **Speed:** Very fast since it's local

### To Keep Running 24/7:

**Option A: Use a Desktop Computer**
- Leave it on all the time
- More reliable than a laptop

**Option B: Cloud Deployment** (Recommended)
- See DEPLOYMENT.md for cloud hosting
- Works even when your computer is off
- Accessible from anywhere with internet

## Windows Firewall Setup

If others can't connect, allow Node.js through firewall:

1. Search "Windows Defender Firewall"
2. Click "Allow an app through firewall"
3. Click "Change settings"
4. Find "Node.js" and check both Private and Public
5. Click OK

## Troubleshooting

**Can't connect from phone?**
- Make sure phone is on same WiFi network
- Check firewall settings
- Restart both servers
- Try http:// not https://

**Connection refused?**
- Verify backend is running on port 5000
- Check if IP address changed (run ipconfig again)
