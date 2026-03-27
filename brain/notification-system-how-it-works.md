# Notification System - How It Works

## Question from User (Feb 6, 2026):
"When L1 uploads a file and passes it to L2, are L3, L4, L5 also receiving notifications?"

## Answer: NO - Only Selected Handlers Receive Notifications

### How the System Works (Step-by-Step):

#### Scenario: 5-Level Department (L1 → L2 → L3 → L4 → L5)

**Step 1: L1 Uploads File**
- File is created at L1
- Current handler: L1 uploader
- Status: "pending"
- ❌ No notifications sent (uploader is the handler)

**Step 2: L1 Passes to L2**
1. L1 user clicks "Pass to Next"
2. System shows ONLY L2 users in the selection dropdown
3. L1 user selects specific L2 handler(s) (e.g., "John from L2")
4. L1 user signs and confirms

**What Happens:**
```javascript
// Only selected L2 handlers receive notifications
handlerIds = ["selected_L2_user_id"]
- Send notification to: John (L2) ✅
- Send email to: John (L2) ✅
- Do NOT send to: L3, L4, L5 ❌
```

**Step 3: L2 Passes to L3**
1. John (L2) clicks "Pass to Next"
2. System shows ONLY L3 users
3. John selects specific L3 handler(s)
4. John signs and confirms

**What Happens:**
```javascript
// Only selected L3 handlers receive notifications
- Send notification to: Selected L3 users ✅
- Do NOT send to: L1, L2, L4, L5 ❌
```

### Code That Ensures This:

#### Backend: `workflow.controller.js` - `passToNextLevel()`

```javascript
// Line 79-81: Only selected handlers
const handlerIds = Array.isArray(nextHandler) ? nextHandler : [nextHandler];
const primaryHandler = handlerIds[0];

// Line 84-90: Fetch ONLY selected handlers
const handlers = await User.find({ _id: { $in: handlerIds } });

// Line 133-141: Send notifications ONLY to selected handlers
await createBulkNotifications(
  handlerIds,  // ⭐ ONLY selected handlers
  req.user._id,
  file._id,
  'assigned',
  'New File Assigned',
  `${req.user.name} has assigned "${file.title}" to you at ${nextLevelName}`,
  '/files/my-files'
);

// Line 144-156: Send emails ONLY to selected handlers
for (const handler of handlers) {  // ⭐ ONLY selected handlers
  await emailService.sendFileAssignedEmail(handler, {...});
}
```

#### Backend: `workflow.controller.js` - `getDepartmentUsers()`

```javascript
// Line 369-390: Get NEXT level users only
if (currentLevelId) {
  const currentLevel = await Level.findById(currentLevelId);
  const nextLevel = await Level.findById(currentLevel.nextLevel)  // ⭐ NEXT level only
    .populate('handlers', 'name email designation level role');
  
  return res.json({
    users: nextLevel.handlers  // ⭐ ONLY next level handlers
  });
}
```

#### Frontend: `my-files/page.tsx`

```javascript
// Line 49: Fetch ONLY next level users
const response = await workflowAPI.getDepartmentUsers(
  departmentId, 
  true, 
  currentLevelId  // ⭐ Current level ID provided
);
const nextLevelUsers = response.data.users;  // ⭐ ONLY next level users

// Line 432-451: Display ONLY next level users
departmentUsers.map((u) => (
  <input type="checkbox" ... />  // ⭐ User selects from ONLY next level
))
```

### Possible Misconceptions:

#### ❌ WRONG Understanding:
"When L1 passes a file, everyone (L2, L3, L4, L5) gets notified"

#### ✅ CORRECT Understanding:
"When L1 passes a file, ONLY the selected L2 handler(s) get notified"

### How to Verify This is Working:

#### Test Scenario:
1. **Setup**: Create 5 levels with different users at each level
   - L1: User_A
   - L2: User_B, User_C
   - L3: User_D
   - L4: User_E
   - L5: User_F

2. **Action**: User_A uploads file and passes to User_B (L2)

3. **Check Notifications**:
   ```sql
   -- In MongoDB
   db.notifications.find({ file: file_id })
   
   -- Should see ONLY:
   - Notification to User_B ✅
   
   -- Should NOT see:
   - Notification to User_C ❌ (not selected)
   - Notification to User_D ❌ (L3)
   - Notification to User_E ❌ (L4)
   - Notification to User_F ❌ (L5)
   ```

4. **Check Emails**:
   ```
   - Email sent to User_B ✅
   - No emails to User_C, D, E, F ❌
   ```

### Backend Logging (Added for Debugging):

To verify notifications are sent correctly, check PM2 logs:

```bash
pm2 logs demand-planning-backend | grep "notification"
```

You should see:
```
Sending notifications to: ["user_B_id"]
Email sent to: user_B@example.com
```

You should NOT see emails or notifications for L3, L4, L5 users.

### Common Confusion Points:

1. **"I see all files in the dashboard"**
   - ❌ This does NOT mean all users were notified
   - ✅ Different users see different files based on their assignments

2. **"I selected multiple users at L2"**
   - ❌ This is not a bug
   - ✅ System allows selecting multiple handlers at the same level
   - ✅ All selected L2 users will be notified (this is intentional)

3. **"I see levels L1-L5 in the admin panel"**
   - ❌ This does NOT mean notifications go to all levels
   - ✅ This just shows the configured approval flow
   - ✅ Notifications only go to the current assigned level

### Summary:

**Question:** "Do L3, L4, L5 receive notifications when file is passed from L1 to L2?"

**Answer:** **NO**. Only the L2 handler(s) selected by L1 receive notifications.

**Why:** The system is designed to notify ONLY the handlers at the currently assigned level, not all future levels.

**Code Locations:**
- `backend/controllers/workflow.controller.js` lines 133-156 (notifications)
- `backend/controllers/workflow.controller.js` lines 369-420 (user filtering)
- `frontend/src/app/files/my-files/page.tsx` lines 47-75 (frontend filtering)

## If You're Still Seeing This Issue:

### Debugging Steps:

1. **Check PM2 Logs:**
   ```bash
   pm2 logs demand-planning-backend --lines 100 | grep -A 5 "assigned"
   ```

2. **Check Database:**
   ```javascript
   // In MongoDB
   db.notifications.find({ 
     file: ObjectId("file_id"),
     createdAt: { $gte: new Date("2026-02-06") }
   })
   ```

3. **Check Which Users You Selected:**
   - In the "Pass to Next" modal
   - The checkbox list shows ONLY next level users
   - Did you accidentally select ALL users shown?

4. **Check Level Configuration:**
   ```bash
   # Make sure each level has correct handlers assigned
   db.levels.find({ department: ObjectId("dept_id") })
   ```

### If Issue Persists:

Please provide:
1. PM2 logs showing the notification sending
2. MongoDB query result for notifications collection
3. Screenshot of the "Pass to Next" modal showing which users are listed
4. Which users received emails/notifications vs which ones should have

This will help identify if there's an edge case or configuration issue.
