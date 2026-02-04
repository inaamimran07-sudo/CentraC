# 📱 App Navigation & User Guide

## Screen Flow Diagram

```
┌─────────────────────────────────────────┐
│         LOGIN/REGISTER PAGE             │
│  (Email & Password Authentication)      │
│                                         │
│  Email: admin@example.com              │
│  Password: admin123                     │
│  [Login] [Register]                     │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│     MAIN DASHBOARD (After Login)        │
│                                         │
│ [Welcome, John Smith] [Logout]          │
└─────────────────────────────────────────┘
│ ┌───────────────┐  ┌─────────────────┐ │
│ │  SIDEBAR      │  │ MAIN CONTENT    │ │
│ │               │  │                 │ │
│ │ ▶ Team        │  │ Different view  │ │
│ │   Members     │  │ based on        │ │
│ │               │  │ selected menu   │ │
│ │ ▶ Categories  │  │                 │ │
│ │               │  │                 │ │
│ │ ▶ Calendar    │  │                 │ │
│ │               │  │                 │ │
│ └───────────────┘  └─────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 1. TEAM MEMBERS VIEW

```
┌─────────────────────────────────────────────────────────┐
│ Team Members                                [+ Add Member] │ (Admin Only)
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │  ● John Smith    │  │  ● Sarah Johnson │           │
│  │  john@email.com  │  │  sarah@email.com │           │
│  │  [Remove] (Admin)│  │  [Remove] (Admin)│           │
│  └──────────────────┘  └──────────────────┘           │
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │  ● Mike Davis    │  │  ● Emma Wilson   │           │
│  │  mike@email.com  │  │  emma@email.com  │           │
│  │  [Remove] (Admin)│  │  [Remove] (Admin)│           │
│  └──────────────────┘  └──────────────────┘           │
│                                                         │
└─────────────────────────────────────────────────────────┘

Colors assigned to each member for easy identification
```

---

## 2. CATEGORIES VIEW

```
┌─────────────────────────────────────────────────────────┐
│ Categories                              [+ Add Category]  │ (Admin Only)
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ▼ Corporation Tax Returns                   [Delete] │
│    ├─ Account 1: ABC Corp        Created: 02/01/25   │
│    ├─ Account 2: XYZ Inc         Created: 02/02/25   │
│    └─ Account 3: DEF Ltd         Created: 02/03/25   │
│    [+ Add Account]                                    │
│    [✓] My Accounts Only                              │
│                                                       │
│  ▼ Self Assessments                         [Delete] │
│    ├─ Account 1: Person A        Created: 02/04/25   │
│    └─ Account 2: Person B        Created: 02/05/25   │
│    [+ Add Account]                                    │
│    [✓] My Accounts Only                              │
│                                                       │
│  ▼ Custom Category                          [Delete] │
│    └─ No accounts yet                                 │
│    [+ Add Account]                                    │
│                                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 3. ADDING AN ACCOUNT (Popup Modal)

```
┌────────────────────────────────────────────┐
│ Add New Account                           │
├────────────────────────────────────────────┤
│                                            │
│ Company Name:                              │
│ [________________________] (e.g., ABC Inc) │
│                                            │
│ Priority:                                  │
│ [v Low Priority   v]                       │
│                                            │
│ Progress:                                  │
│ [v Not Started    v]                       │
│                                            │
│ Accounts Due Date:                         │
│ [____/____/____]                           │
│                                            │
│      [Cancel]           [Add Account]      │
│                                            │
└────────────────────────────────────────────┘
```

---

## 4. ACCOUNT CARD DISPLAY (Examples)

```
High Priority (Due within 2 months):
┌─────────────────────────────────────────┐
│ ⚡ ABC Corporation             [HIGH] ⚡ │  <-- Fast Flash
│ Created: 2025-02-15                     │
│                                         │
│ Due Date: 2025-04-15                    │
│ Progress: [In Progress v]               │
│                                         │
│         [Delete]                        │
└─────────────────────────────────────────┘

Medium Priority (Due within 4 months):
┌─────────────────────────────────────────┐
│ ⚡ XYZ Company            [MEDIUM] ⚡   │  <-- Medium Flash
│ Created: 2025-01-20                     │
│                                         │
│ Due Date: 2025-05-20                    │
│ Progress: [Completed v]                 │
│                                         │
│         [Delete]                        │
└─────────────────────────────────────────┘

Low Priority (Due 4+ months away):
┌─────────────────────────────────────────┐
│ DEF Consultants                [LOW]    │  <-- No Flash
│ Created: 2024-12-01                     │
│                                         │
│ Due Date: 2025-08-01                    │
│ Progress: [Not Started v]               │
│                                         │
│         [Delete]                        │
└─────────────────────────────────────────┘
```

---

## 5. CALENDAR VIEW

```
┌─────────────────────────────────────────────────────────┐
│ Calendar                                              │
│                                                         │
│ [← Previous]  February 2025  [Next →]                 │
├─────────────────────────────────────────────────────────┤
│  Sun    Mon    Tue    Wed    Thu    Fri    Sat         │
├─────────────────────────────────────────────────────────┤
│                                      1      2           │
│   3      4      5      6      7      8      9           │
│  10     11     12     13     14     15     16           │
│           [15] ┐                                        │
│                ├─ Task 1                               │
│                └─ Task 2                               │
│  17     18     19     20     21     22     23           │
│  24     25     26     27     28                         │
│                                                         │
│  [Calendar Date Clicked]                              │
│  ┌──────────────────────────────────────┐             │
│  │ Add Task for 2025-02-15              │             │
│  ├──────────────────────────────────────┤             │
│  │ Task: [____________]                 │             │
│  │       [Cancel]  [Add Task]           │             │
│  └──────────────────────────────────────┘             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Workflow Examples

### Scenario 1: Add a New Team Member (Admin)

```
Step 1: Click "Team Members" in sidebar
        ↓
Step 2: Click "+ Add Member" button
        ↓
Step 3: Modal opens with user selection
        [Select user from dropdown]
        [Choose color for this member]
        ↓
Step 4: Click "Add Member"
        ↓
Step 5: Team member card appears with assigned color
        User can now be assigned to accounts
```

### Scenario 2: Create Corporation Tax Return Account

```
Step 1: Click "Categories" in sidebar
        ↓
Step 2: Click ▼ to expand "Corporation Tax Returns"
        ↓
Step 3: Click "+ Add Account"
        ↓
Step 4: Fill modal form:
        - Company: "Johnson & Associates Ltd"
        - Priority: "High"
        - Progress: "Not Started"
        - Due Date: "2025-04-15"
        ↓
Step 5: Click "Add Account"
        ↓
Step 6: Account appears with:
        - Your name as creator
        - Creation date displayed
        - Account due date shown
        - ⚡ FAST FLASHING (because within 2 months)
```

### Scenario 3: Add Calendar Task

```
Step 1: Click "Calendar" in sidebar
        ↓
Step 2: Click on any date (e.g., Feb 20)
        ↓
Step 3: Modal opens for that date
        ↓
Step 4: Enter task: "Review ABC Corp Returns"
        ↓
Step 5: Click "Add Task"
        ↓
Step 6: Task appears on calendar
        Can click to delete
```

### Scenario 4: Monitor Auto-Priority Update

```
Initial Account Created:
- Company: "Test Corp"
- Due Date: 2025-04-20 (3 months away)
- Manual Priority: "Low"
- Display: Shows as "MEDIUM" with medium flash ⚡

After 1 Month:
- Same account now 2 months away
- System auto-updates to "HIGH"
- Display: Shows as "HIGH" with fast flash ⚡⚡⚡

After 2 More Months:
- Due date is tomorrow
- Still "HIGH" priority with fast flash ⚡⚡⚡
```

---

## Key UI Elements

### Buttons

| Button | Purpose | Who Can Use |
|--------|---------|-------------|
| [+ Add Member] | Add person to team | Admin Only |
| [+ Add Category] | Create new category | Admin Only |
| [+ Add Account] | Create new account | Everyone |
| [Delete] | Remove item | Admin (Categories)<br>Everyone (Accounts) |
| [Remove] | Remove team member | Admin Only |
| [Update] | Save changes | Everyone |

### Indicators

| Symbol | Meaning |
|--------|---------|
| ▶ | Category is collapsed |
| ▼ | Category is expanded |
| ⚡ | Flashing animation (High/Medium priority) |
| ● | Colored circle (Team member badge) |
| [✓] | Checkbox (for filtering) |

### Status Colors

| Status | Color | Flash |
|--------|-------|-------|
| High Priority | Red (#FF6B6B) | Fast (0.5s) |
| Medium Priority | Orange (#FFA07A) | Medium (1s) |
| Low Priority | Teal (#98D8C8) | None |

---

## Role-Based Features

### Regular User Can:
- ✅ Login/Logout
- ✅ View team members
- ✅ Create accounts
- ✅ Update account progress
- ✅ Delete their own accounts
- ✅ View calendar
- ✅ Add/delete calendar tasks
- ✅ Filter accounts by creator
- ❌ Add/remove team members
- ❌ Create/delete categories

### Admin User Can:
- ✅ All user features plus:
- ✅ Add team members with colors
- ✅ Remove team members
- ✅ Create categories
- ✅ Delete categories
- ✅ Manage all accounts (delete any)
- ✅ Manage all tasks

---

## Mobile Responsiveness

**Desktop (1200px+):**
- Sidebar on left
- Main content on right
- Multi-column grids

**Tablet (768px - 1200px):**
- Sidebar converts to horizontal menu
- Single to dual column layout
- Touch-friendly buttons

**Mobile (<768px):**
- Full-width layout
- Single column everything
- Stacked menus
- Large touch targets

---

## Data You Can See

### On Team Member Cards:
- Name
- Email
- Assigned color
- Delete option (Admin)

### On Account Cards:
- Company name
- Creation date
- Due date
- Priority (with flash indicator)
- Progress status (dropdown to edit)
- Creator's name (who added it)
- Delete button

### On Calendar:
- Date
- Task titles
- Task count if multiple
- Clickable for adding/viewing

---

## Common Actions & Shortcuts

| Want to... | Do this |
|-----------|---------|
| See who created an account | Look for creator info on account card |
| Filter to my accounts only | Check "My Accounts Only" box |
| Change account progress | Click the dropdown on the account |
| Delete an account | Click [Delete] on the account card |
| Add calendar task | Click any date on calendar |
| Remove calendar task | Click the task itself |
| Change theme colors | Edit CSS files in /styles folder |
| Add admin user | Register user, manually set isAdmin in DB |

---

**The app is intuitive and self-explanatory. Just login and explore!** 🚀
