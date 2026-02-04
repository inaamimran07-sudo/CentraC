# Team Management App

A comprehensive team management application with authentication, team member management, category-based task organization, and a calendar system.

## Features

✅ **User Authentication**
- Login and registration system
- Email and password authentication
- Session management with JWT tokens

✅ **Team Members Management**
- Admin can add team members with assigned colors
- Visual representation of team members
- Easy removal of team members

✅ **Categories & Subcategories**
- Pre-created categories: "Corporation Tax Returns" and "Self Assessments"
- Admin can create and delete custom categories
- Subcategories with company names and metadata

✅ **Account Management**
- Add accounts with company name, priority level, and due date
- Track progress (Not Started, In Progress, Completed)
- Automatic priority adjustment based on due date:
  - Within 2 months: High Priority (fast flashing)
  - Within 4 months: Medium Priority (medium flashing)
  - Over 4 months: Low Priority (no flashing)

✅ **Calendar System**
- Year calendar with task management
- Add and delete tasks on specific dates
- Visual task display on calendar

✅ **Filtering & Organization**
- Filter accounts by creator
- See who created each account
- Admin-only operations clearly marked

## Project Structure

```
team-management-app/
├── backend/
│   ├── server.js          # Express server with all API routes
│   ├── package.json       # Backend dependencies
│   ├── .env              # Environment variables
│   └── app.db            # SQLite database (auto-created)
│
└── frontend/
    ├── public/
    │   └── index.html    # Main HTML file
    ├── src/
    │   ├── App.js        # Main app component with routing
    │   ├── index.js      # React entry point
    │   ├── context/
    │   │   └── AuthContext.js  # Authentication context
    │   ├── pages/
    │   │   ├── LoginPage.js    # Login/Register page
    │   │   └── Dashboard.js    # Main dashboard
    │   ├── components/
    │   │   ├── TeamMembers.js  # Team members management
    │   │   ├── Categories.js   # Categories management
    │   │   ├── Subcategories.js # Accounts/Subcategories
    │   │   └── Calendar.js     # Calendar with tasks
    │   └── styles/        # CSS files for all components
    └── package.json       # Frontend dependencies
```

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd team-management-app/backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm start
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. In a new terminal, navigate to the frontend directory:
```bash
cd team-management-app/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Demo Credentials

Default admin account is created automatically:
- **Email:** admin@example.com
- **Password:** admin123

## Usage Guide

### First Time Login
1. Login with the default admin credentials
2. Create additional users by clicking "Register"
3. Add users to team members with assigned colors

### Managing Categories
- Click the "Categories" tab in the sidebar
- Admin can create new categories or delete existing ones
- Click to expand a category and see subcategories

### Managing Accounts
- Click to expand a category
- Click "Add Account" to create new accounts
- Fill in company name, priority level, progress, and due date
- The system automatically adjusts priority based on the due date

### Using the Calendar
- Click "Calendar" in the sidebar
- Navigate through months
- Click any date to add tasks
- Tasks appear as colored items on the calendar
- Click a task to delete it

### Filtering
- In the categories section, check "My Accounts Only" to see only your accounts
- This helps organize work by team member

## Technical Stack

**Backend:**
- Node.js with Express.js
- SQLite3 database
- JWT for authentication
- bcryptjs for password hashing

**Frontend:**
- React 18
- Axios for API calls
- CSS3 for styling and animations
- Local Storage for token persistence

## Database Schema

The app automatically creates the following tables:
- **users**: User accounts with authentication
- **team_members**: Team membership with assigned colors
- **categories**: Account categories
- **subcategories**: Individual accounts with metadata
- **tasks**: Calendar tasks

## Key Features Explained

### Priority Flashing
- **High Priority**: Fast flashing animation (every 0.5s)
- **Medium Priority**: Slow flashing animation (every 1s)
- **Low Priority**: No flashing

### Automatic Priority Adjustment
When viewing accounts, the system calculates if the due date falls within:
- 0-2 months: Automatically marked as High Priority
- 2-4 months: Automatically marked as Medium Priority
- 4+ months: Remains as Low Priority

### Authentication
- All API routes are protected with JWT authentication
- Login tokens are stored in localStorage
- Sessions persist across page refreshes

### Admin-Only Features
- Creating/deleting categories
- Adding/removing team members
- Only admin users can perform these operations

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Team Members
- `GET /api/team-members` - Get all team members
- `POST /api/team-members` - Add team member (admin only)
- `DELETE /api/team-members/:id` - Remove team member (admin only)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Subcategories
- `GET /api/categories/:id/subcategories` - Get accounts in category
- `POST /api/subcategories` - Create account
- `PUT /api/subcategories/:id` - Update account
- `DELETE /api/subcategories/:id` - Delete account

### Tasks
- `GET /api/tasks` - Get tasks
- `POST /api/tasks` - Create task
- `DELETE /api/tasks/:id` - Delete task

### Users
- `GET /api/users` - Get available users for team (admin only)

## Troubleshooting

**Backend won't start:**
- Make sure port 5000 is available
- Check that Node.js is installed: `node --version`

**Frontend won't load:**
- Ensure backend is running first
- Check that port 3000 is available
- Clear browser cache and try again

**Database errors:**
- Delete `app.db` and restart the backend to recreate the database
- Make sure the backend directory is writable

## Future Enhancements

- Email notifications for upcoming due dates
- Recurring tasks
- Team member activity logs
- Export reports
- Dark mode
- Mobile app
- Real-time collaboration

## Support

For issues or questions, please refer to the code comments in the source files or review the component structure.

---

**Created:** February 2026
**Version:** 1.0.0
