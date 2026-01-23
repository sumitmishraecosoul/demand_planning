# DataHive - Workflow Guide

## 📊 System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          DATAHIVE SYSTEM                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN SETUP PHASE                         │
└─────────────────────────────────────────────────────────────────┘

    [Admin Login] 
         │
         ├─→ [Create Departments]
         │       ├─→ Retail
         │       ├─→ Quick Commerce
         │       └─→ E-commerce
         │
         ├─→ [Configure Levels]
         │       │
         │       └─→ For Each Department:
         │             ├─→ L1 (Junior Officer)
         │             ├─→ L2 (Senior Officer)
         │             ├─→ L3 (Manager)
         │             └─→ L4 (Senior Manager)
         │
         └─→ [Create Users]
                 └─→ Assign to Department + Level

┌─────────────────────────────────────────────────────────────────┐
│                     DOCUMENT WORKFLOW PHASE                      │
└─────────────────────────────────────────────────────────────────┘

    [L1 User Login]
         │
         └─→ [Upload File]
                 │
                 ├─→ Select File (CSV/PDF/Excel)
                 ├─→ Add Title & Description
                 ├─→ Sign with Name
                 └─→ Submit
                        │
                        ▼
                  [File Created]
                  Status: Pending
                  Current Level: L1
                        │
                        ▼
            ┌───────────────────────┐
            │  L2 Handler Receives  │
            │    File in My Files   │
            └───────────────────────┘
                        │
                        ├─→ [Preview File]
                        │      │
                        │      └─→ View details, versions, history
                        │
                        ├─→ [Download File] (Optional)
                        │      │
                        │      └─→ Edit in Excel/PDF editor
                        │             │
                        │             └─→ [Upload Updated Version]
                        │                    ├─→ Sign
                        │                    └─→ Comments
                        │
                        └─→ [Decision]
                               │
                ┌──────────────┼──────────────┐
                │              │              │
             [Reject]      [Approve]    [Pass to Next]
                │              │              │
                ▼              ▼              ▼
          Status: Rejected    │    [Select Next Handler]
          Workflow Ends       │              │
                              │         [L3 User]
                              │              │
                              │         [Sign & Pass]
                              │              │
                              │              ▼
                              │    [File moves to L3]
                              │    Status: In-Progress
                              │              │
                              │              └─→ [L3 Handler Reviews]
                              │                         │
                              │                         └─→ Same process...
                              │                                │
                              │                                └─→ [L4 Handler]
                              │                                       │
                              │                                       └─→ [Final Approval]
                              │
                              └────────────────────────────────────────┐
                                                                       ▼
                                                            [Status: Completed]
                                                            [Workflow Ends]

┌─────────────────────────────────────────────────────────────────┐
│                      TRACKING & MONITORING                       │
└─────────────────────────────────────────────────────────────────┘

    [Any User in Department]
         │
         └─→ [View Files]
                │
                ├─→ [All Files] - See all department files
                │
                ├─→ [My Files] - Files assigned to me
                │
                └─→ [File Status Tracking]
                       │
                       └─→ View Workflow Timeline:
                             ├─→ Uploaded by: John (L1)
                             ├─→ Reviewed by: Sarah (L2)
                             ├─→ Updated by: Sarah (L2)
                             ├─→ Passed to: Mike (L3)
                             ├─→ Currently at: Mike (L3)
                             └─→ Status: In-Progress

┌─────────────────────────────────────────────────────────────────┐
│                      DIRECTOR ACCESS                             │
└─────────────────────────────────────────────────────────────────┘

    [Director Login]
         │
         └─→ [Multi-Department View]
                │
                ├─→ View Retail Department
                │      └─→ All files, statuses, workflows
                │
                └─→ View Quick Commerce Department
                       └─→ All files, statuses, workflows
```

---

## 🔄 File Lifecycle

```
┌──────────────┐
│   CREATED    │ → File uploaded by L1 user
└──────────────┘
       ↓
┌──────────────┐
│   PENDING    │ → Waiting for first handler
└──────────────┘
       ↓
┌──────────────┐
│ IN-PROGRESS  │ → Moving through levels
└──────────────┘
       ↓
   ┌───┴───┐
   ↓       ↓
┌─────┐  ┌──────────┐
│REJECT│  │COMPLETED │
└─────┘  └──────────┘
```

---

## 👥 User Journey Examples

### Example 1: L1 User (John - Retail Department)

```
1. Login → Dashboard
2. Click "Upload File"
3. Upload "Monthly_Sales.csv"
   - Title: "Monthly Sales Report - January"
   - Description: "Sales data for all stores"
   - Sign: "John Doe"
   - Comments: "All data verified"
4. Submit
5. File created and sent to L2 (configured default: Sarah)
```

### Example 2: L2 User (Sarah - Retail Department)

```
1. Login → Dashboard
2. See notification: "1 file pending"
3. Go to "My Files"
4. See "Monthly Sales Report - January"
5. Click Preview → Review data
6. Find error in row 45
7. Download file
8. Edit in Excel
9. Upload updated version
   - Sign: "Sarah Smith"
   - Comments: "Corrected row 45 - store ID mismatch"
10. Click "Pass to Next Level"
11. Select L3 handler: "Mike Johnson"
12. Sign and submit
```

### Example 3: L3 User (Mike - Retail Department)

```
1. Login → Dashboard
2. Go to "My Files"
3. See "Monthly Sales Report - January" (Version 2)
4. Preview file
5. Review changes in version history
6. Verify corrections
7. Click "Pass to Next Level"
8. Select L4 handler: "Director Lisa"
9. Sign: "Mike Johnson"
10. Comments: "All corrections verified. Approved."
11. Submit
```

### Example 4: L4 Final Approver (Lisa - Retail Department)

```
1. Login → Dashboard
2. Go to "My Files"
3. See "Monthly Sales Report - January" (Version 2)
4. Preview file
5. Review complete workflow history:
   - John uploaded (v1)
   - Sarah updated (v2) - fixed row 45
   - Mike approved
6. Click "Pass to Next Level" (or "Approve" if final level)
7. Sign: "Lisa Anderson"
8. Comments: "Final approval. Ready for processing."
9. Submit
10. File status → COMPLETED ✓
```

---

## 🎯 Real-World Scenario

### Scenario: Retail Department Monthly Sales Report

**Department Setup:**
```
Retail Department Hierarchy:
L1 → Junior Data Analyst
L2 → Senior Data Analyst
L3 → Department Manager
L4 → Regional Director
```

**Day 1 - 9:00 AM:**
- **John** (L1 - Junior Analyst) uploads monthly sales CSV
- Signs: "Data collected from all POS systems"
- File → Sarah (L2)

**Day 1 - 11:00 AM:**
- **Sarah** (L2 - Senior Analyst) reviews
- Finds discrepancy in Store #24 data
- Downloads, corrects in Excel, uploads v2
- Signs: "Corrected Store #24 sales figure"
- Passes to Mike (L3)

**Day 1 - 2:00 PM:**
- **Mike** (L3 - Manager) reviews
- Verifies correction
- Signs: "All store data verified"
- Passes to Lisa (L4)

**Day 2 - 10:00 AM:**
- **Lisa** (L4 - Regional Director) final review
- Approves
- Signs: "Approved for board presentation"
- File → COMPLETED

**Visibility:**
- John can track: "Currently at L4 - Regional Director"
- Anyone in Retail can see: Full workflow history
- Director of multiple departments can see this across Retail, Quick Commerce, etc.

---

## 📈 Status Tracking View

```
File: Monthly Sales Report - January
Status: IN-PROGRESS
Current Handler: Lisa Anderson (L4)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Timeline:

🔵 L1 - UPLOADED
   👤 John Doe (Junior Data Analyst)
   📅 Jan 15, 2024 - 9:00 AM
   ✍️  "Data collected from all POS systems"
   📎 Version 1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟡 L2 - UPDATED & PASSED
   👤 Sarah Smith (Senior Data Analyst)
   📅 Jan 15, 2024 - 11:30 AM
   ✍️  "Corrected Store #24 sales figure"
   📎 Version 2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟢 L3 - APPROVED & PASSED
   👤 Mike Johnson (Department Manager)
   📅 Jan 15, 2024 - 2:15 PM
   ✍️  "All store data verified"
   📎 Version 2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏳ L4 - PENDING REVIEW
   👤 Lisa Anderson (Regional Director)
   📅 Assigned: Jan 15, 2024 - 2:15 PM
   ⏰ Status: Awaiting approval
```

---

## 🎨 Dashboard Metrics

```
┌─────────────────────────────────────┐
│         YOUR DASHBOARD              │
├─────────────────────────────────────┤
│  📊 Total Files:        45          │
│  📝 My Files:           3           │
│  ⏱️  Pending:            12          │
│  🔄 In Progress:        28          │
│  ✅ Completed:          3           │
│  ❌ Rejected:           2           │
└─────────────────────────────────────┘
```

---

## 🚀 Quick Reference

### For Regular Users:
1. **Upload** → Go to "Upload File"
2. **Review** → Check "My Files"
3. **Track** → View any file status
4. **Update** → Download, edit, re-upload
5. **Approve** → Sign and pass to next level

### For Directors:
1. View multiple departments
2. Monitor all workflows
3. Identify bottlenecks
4. Track department performance

### For Admins:
1. Setup departments
2. Configure levels
3. Create users
4. Monitor system

---

## ✅ Best Practices

1. **Always sign with your real name**
2. **Add meaningful comments** when updating files
3. **Review version history** before approving
4. **Download and verify** CSV data carefully
5. **Track status regularly** to avoid delays
6. **Communicate** with team if file is stuck

---

**This workflow ensures complete accountability, transparency, and efficiency in your document approval process!** 🎉
