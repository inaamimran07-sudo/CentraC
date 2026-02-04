# Team Management App - Quick Start Guide

## What You Get

This is a complete private team management application designed for managing corporate accounts, tax returns, and team collaboration.

## Core Features

### 1. **Secure Login System**
- Email/password authentication
- Admin and regular user roles
- Session persistence with JWT tokens
- Auto-created admin account for demo

### 2. **Team Members Management**
- Assign team members with custom colors for easy identification
- Admin-controlled member management
- Visual member cards with color badges

### 3. **Flexible Categories**
- Pre-configured categories:
  - Corporation Tax Returns
  - Self Assessments
- Admin can create unlimited custom categories
- Expandable/collapsible interface

### 4. **Smart Account Management**
Each account tracks:
- Company name
- Manual priority (High/Medium/Low)
- **Automatic priority adjustment** based on due date:
  - 0-2 months until due → High Priority (⚡ Fast flashing)
  - 2-4 months until due → Medium Priority (⚡ Medium flashing)
  - 4+ months until due → Low Priority (no flashing)
- Progress status (Not Started, In Progress, Completed)
- Account due date
- Creator information with filtering

### 5. **Interactive Calendar**
- Full-year calendar view
- Add tasks to specific dates
- Quick task deletion
- Month navigation
- Visual task indicators

### 6. **Access Control**
- "My Accounts Only" filter to see only your created accounts
- Creator information visible on each account
- Clear admin-only controls
- Role-based feature access

## Visual Design

- **Modern gradient interface** with purple/blue theme
- **Responsive layout** that works on desktop and tablet
- **Smooth animations** for transitions
- **Color-coded priorities** with flashing animations
- **Intuitive navigation** with clear sidebar menu

## How Priority Flashing Works

The flashing animations provide instant visual feedback:

```
High Priority (Due within 2 months):
████████ ░░░░░░░░ (fast flashing - every 0.5 seconds)

Medium Priority (Due within 4 months):
████████ ░░░░░░░░ (medium flashing - every 1 second)

Low Priority (Due 4+ months out):
████████ (no flashing - solid display)
```

## Database Design

The app uses SQLite with 6 main tables:

| Table | Purpose |
|-------|---------|
| users | User accounts and authentication |
| team_members | Team roster with assigned colors |
| categories | Account categories (Tax Returns, etc.) |
| subcategories | Individual accounts with metadata |
| tasks | Calendar events and to-do items |

All relationships are maintained with foreign keys for data integrity.

## API Architecture

**RESTful API** with:
- 20+ endpoints covering all features
- JWT authentication on all protected routes
- Proper HTTP status codes
- Error handling and validation
- Query parameters for filtering

### Key Endpoints

```
POST   /api/auth/login                    # User login
POST   /api/auth/register                 # User registration

GET    /api/team-members                  # List team members
POST   /api/team-members                  # Add member (admin)
DELETE /api/team-members/:id              # Remove member (admin)

GET    /api/categories                    # List categories
POST   /api/categories                    # Create category (admin)
DELETE /api/categories/:id                # Delete category (admin)

GET    /api/categories/:id/subcategories  # List accounts
POST   /api/subcategories                 # Create account
PUT    /api/subcategories/:id             # Update account
DELETE /api/subcategories/:id             # Delete account

GET    /api/tasks                         # List tasks
POST   /api/tasks                         # Create task
DELETE /api/tasks/:id                     # Delete task
```

## Technology Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | Node.js + Express.js |
| **Database** | SQLite3 |
| **Authentication** | JWT + bcrypt |
| **Frontend** | React 18 |
| **HTTP Client** | Axios |
| **Styling** | CSS3 (no external UI library) |
| **State Management** | React Context API |

## Security Features

✅ Password hashing with bcryptjs
✅ JWT token-based authentication
✅ Protected API routes
✅ Role-based access control
✅ Environment variables for secrets
✅ CORS enabled
✅ Input validation

## Workflow Example

### Scenario: Adding a New Corporation Tax Return Account

1. **Login** with admin credentials
2. **Navigate** to Categories tab
3. **Expand** "Corporation Tax Returns"
4. **Click** "Add Account"
5. **Fill in** the modal:
   - Company: "ABC Corporation Ltd"
   - Priority: "Medium"
   - Progress: "Not Started"
   - Due Date: "2024-06-15"
6. **Submit** - account appears with your name as creator
7. The system **automatically adjusts priority** as the due date approaches
8. **Filter** to see only your accounts with "My Accounts Only"
9. **Update progress** as you work on it
10. **Calendar** shows any related tasks

## File Structure

```
team-management-app/
├── README.md                 # Full documentation
├── setup.bat / setup.sh      # Automated setup
├── .gitignore               # Git ignore rules
│
├── backend/
│   ├── server.js            # All API logic (550+ lines)
│   ├── package.json         # Dependencies
│   ├── .env                 # Configuration
│   └── app.db              # SQLite database (auto-created)
│
└── frontend/
    ├── public/
    │   └── index.html       # HTML template
    ├── src/
    │   ├── App.js           # Main component
    │   ├── index.js         # React entry point
    │   ├── context/
    │   │   └── AuthContext.js       # Auth state
    │   ├── pages/
    │   │   ├── LoginPage.js         # Login screen
    │   │   └── Dashboard.js         # Main app
    │   ├── components/
    │   │   ├── TeamMembers.js       # Team management
    │   │   ├── Categories.js        # Category list
    │   │   ├── Subcategories.js     # Account list
    │   │   └── Calendar.js          # Calendar UI
    │   └── styles/          # CSS for all components
    └── package.json         # Dependencies
```

## Getting Started in 5 Minutes

### Windows:
```bash
cd team-management-app
setup.bat
```

### Mac/Linux:
```bash
cd team-management-app
chmod +x setup.sh
./setup.sh
```

### Manual Setup:
```bash
# Terminal 1
cd backend && npm install && npm start

# Terminal 2 (new terminal)
cd frontend && npm install && npm start
```

## Demo Login

**Email:** admin@example.com
**Password:** admin123

This admin account is automatically created on first run.

## Customization

All styles can be easily customized in the `/styles` folder. Key files:
- `LoginPage.css` - Purple gradient theme
- `Dashboard.css` - Sidebar and layout
- `Subcategories.css` - Flashing animation definitions
- `Calendar.css` - Calendar styling

## Performance

- Lightweight frontend (no heavy dependencies)
- Efficient database queries
- Fast authentication with JWT
- Minimal API payload sizes
- Responsive UI with CSS animations

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancement Ideas

- 📧 Email notifications for upcoming due dates
- 📱 Mobile app version
- 📊 Dashboard analytics
- 🔄 Recurring tasks
- 📝 Task comments/notes
- 🌙 Dark mode
- 📤 Export to Excel/PDF
- 🔔 Real-time notifications
- 👥 Team activity log
- 📅 iCalendar integration

## Troubleshooting

**Port already in use?**
```bash
# Change ports in .env (backend)
PORT=5001

# Frontend already starts on 3000, use:
PORT=3001 npm start
```

**Database corrupted?**
```bash
rm backend/app.db
npm start  # Recreates database
```

**Dependencies not installing?**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

**Ready to use!** All features are implemented and production-ready. Start with the setup script and you'll be up and running in minutes.
