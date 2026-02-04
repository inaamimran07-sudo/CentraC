# 🚀 Team Management App - Quick Reference

## Installation (Choose One Method)

### Method 1: Automated Setup (Recommended)
**Windows:**
```bash
cd team-management-app
setup.bat
```

**Mac/Linux:**
```bash
cd team-management-app
chmod +x setup.sh
./setup.sh
```

### Method 2: Manual Setup
```bash
# Terminal 1 - Backend
cd team-management-app/backend
npm install
npm start

# Terminal 2 - Frontend
cd team-management-app/frontend
npm install
npm start
```

## ✅ Default Credentials

| Field | Value |
|-------|-------|
| Email | admin@example.com |
| Password | admin123 |

**⚠️ Change these in production!**

## 📋 Features Checklist

- ✅ **Login & Registration** - Secure authentication with JWT
- ✅ **Team Members** - Add members with assigned colors
- ✅ **Categories** - Pre-made "Corporation Tax Returns" & "Self Assessments"
- ✅ **Accounts** - Company-specific tracking with priority & progress
- ✅ **Auto-Priority** - System adjusts based on due date:
  - Within 2 months → High (⚡ fast flash)
  - Within 4 months → Medium (⚡ medium flash)
  - 4+ months → Low (no flash)
- ✅ **Calendar** - Year view with task management
- ✅ **Filtering** - View only your created accounts
- ✅ **Admin Controls** - Manage categories & team members

## 🎯 Common Tasks

### Add a Team Member
1. Go to **Team Members** tab
2. Click **+ Add Member** (admin only)
3. Select user and assign color
4. Click **Add Member**

### Create an Account
1. Go to **Categories** tab
2. Expand desired category
3. Click **+ Add Account**
4. Fill in:
   - Company Name
   - Priority (High/Medium/Low)
   - Progress (Not Started/In Progress/Completed)
   - Accounts Due Date
5. Click **Add Account**

### Add a Calendar Task
1. Go to **Calendar** tab
2. Click any date
3. Enter task description
4. Click **Add Task**

### Filter by Creator
1. Go to **Categories** tab
2. Expand a category
3. Check **My Accounts Only**

## 🔒 Security Features

- Password hashing (bcryptjs)
- JWT token authentication
- Protected API routes
- Role-based access control
- Environment variable secrets

## 📊 Database Tables

```
users              Team user accounts
team_members       Team roster with colors
categories         Account categories
subcategories      Individual accounts
tasks             Calendar tasks
```

## 🌐 API Base URL

`http://localhost:5000/api`

All requests need:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🎨 Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express.js |
| Database | SQLite3 |
| Frontend | React 18 |
| Auth | JWT + bcrypt |
| Styling | CSS3 |
| State | React Context |

## 📁 Project Structure

```
team-management-app/
├── backend/         ← Express server + SQLite
├── frontend/        ← React app
├── README.md        ← Full documentation
└── FEATURES.md      ← Feature details
```

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is free
netstat -ano | findstr :5000

# Or use different port
PORT=5001 npm start
```

### Frontend won't start
```bash
# Check port 3000 is free
# Clear cache:
rm -rf node_modules package-lock.json
npm install
npm start
```

### Database errors
```bash
# Delete database and restart
rm backend/app.db
npm start
```

### Dependencies issues
```bash
# Clear and reinstall all
rm -rf node_modules package-lock.json
npm install
```

## 🔧 Configuration

### Backend (.env)
```
SECRET_KEY=your-secret-key-change-this
PORT=5000
```

### Frontend (package.json)
```json
"proxy": "http://localhost:5000"
```

## 📱 Supported Browsers

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚀 To Start Running

1. **Run setup script** (or install manually)
2. **Open two terminals**
3. **Terminal 1:** `cd backend && npm start`
4. **Terminal 2:** `cd frontend && npm start`
5. **Navigate to:** `http://localhost:3000`
6. **Login with:** admin@example.com / admin123

## 📞 Need Help?

- Check **README.md** for detailed docs
- Check **FEATURES.md** for feature explanations
- Review code comments in source files
- Verify both servers are running
- Check browser console for errors
- Ensure correct Node.js version installed

## 🎓 Learning Resources

The code demonstrates:
- ✅ RESTful API design
- ✅ JWT authentication
- ✅ React Hooks & Context API
- ✅ Database design with SQLite
- ✅ CRUD operations
- ✅ Error handling
- ✅ Responsive UI design
- ✅ CSS animations
- ✅ API integration with Axios

## 📝 Notes

- Admin account created automatically on first run
- Database creates automatically (`app.db`)
- All timestamps stored in UTC
- Sessions persist in localStorage
- No external UI library (pure CSS)

---

**Ready to go!** Your complete team management application is ready for use. 🎉
