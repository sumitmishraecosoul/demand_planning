# Demand Planning - Document Workflow Management System

A comprehensive document workflow management system for organizations with multiple departments and hierarchical approval processes.

## Overview

Demand Planning enables organizations to manage document workflows across multiple departments with configurable hierarchical levels. Users can upload, review, update, and pass documents through defined approval chains with digital signatures and complete audit trails.

## Key Features

### Multi-Department Support
- Create and manage multiple departments (Retail, Quick Commerce, E-commerce, etc.)
- Each department has its own configurable hierarchy
- Department-level access control

### Hierarchical Workflow
- Admin-defined levels (L1, L2, L3, L4, etc.)
- Dynamic workflow routing based on configured hierarchy
- Files automatically follow department-specific approval chains

### Document Management
- Upload PDF, CSV, and Excel files
- File versioning - update documents at any level
- Preview files in the system
- Download files for editing
- Digital signature for verification

### User Roles

#### Admin
- Create and manage departments
- Configure hierarchical levels for each department
- Create and manage users
- Assign roles and permissions
- System-wide visibility

#### Director
- Access multiple departments (as assigned by admin)
- View all files and workflows across assigned departments
- Monitor bottlenecks and progress

#### User (L1, L2, L3, L4...)
- Upload documents to their department
- Review and approve/reject documents
- Update documents if corrections needed
- Pass documents to next level with signature
- View files within their department only
- Track document status and history

### Workflow Features
- Digital signatures at each level
- Comments and notes support
- Complete audit trail
- Version history
- File status tracking (pending, in-progress, completed, rejected)
- Identify workflow bottlenecks

## Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File upload handling
- **bcrypt** - Password hashing

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## Project Structure

```
Datahive/
├── backend/              # Node.js + Express backend
│   ├── models/           # MongoDB models
│   ├── controllers/      # Business logic
│   ├── routes/           # API routes
│   ├── middleware/       # Auth & upload middleware
│   └── server.js         # Server entry point
│
├── frontend/             # Next.js frontend
│   ├── src/
│   │   ├── app/          # Next.js pages (App Router)
│   │   ├── components/   # Reusable components
│   │   ├── lib/          # API client
│   │   └── store/        # State management
│   └── package.json
│
└── README.md             # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/datahive
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

4. Start MongoDB (if running locally)

5. Start the backend server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## Usage Guide

### First Time Setup

1. **Start both backend and frontend servers**

2. **Create Admin User** (via API or MongoDB directly):
```javascript
// Example MongoDB command or use Postman to POST to /api/auth/register
{
  "name": "Admin User",
  "email": "admin@datahive.com",
  "password": "admin123",
  "role": "admin"
}
```

3. **Login as Admin** at `http://localhost:3000/login`

4. **Create Departments**:
   - Go to Admin Panel → Departments
   - Create departments (e.g., Retail, Quick Commerce)

5. **Configure Levels for Each Department**:
   - Go to Admin Panel → Manage Levels
   - Select a department
   - Configure levels (L1, L2, L3, L4, etc.)
   - Assign default handlers (optional)

6. **Create Users**:
   - Go to Admin Panel → Users
   - Create users with:
     - Name, Email, Password
     - Role (user/director)
     - Department
     - Level (for regular users)
     - Designation

### User Workflow

1. **L1 User uploads a file**:
   - Login → Upload File
   - Select file (CSV/PDF/Excel)
   - Add title and description
   - Sign with your name
   - Submit

2. **File moves to first level handler**:
   - Handler receives the file in "My Files"
   - Can preview, download, or edit
   - If corrections needed: download → edit in Excel → upload new version
   - If correct: sign and pass to next level (select handler from dropdown)

3. **File progresses through levels**:
   - Each level handler reviews
   - Can update file if needed
   - Signs and passes to next level
   - Or rejects if issues found

4. **Track Progress**:
   - Any user in the department can view file status
   - Complete workflow history visible
   - See who approved, when, and with what comments

### Director Workflow

- Directors can view multiple departments
- Access all files across assigned departments
- Monitor workflow progress
- Identify bottlenecks

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Admin
- `POST /api/admin/departments` - Create department
- `GET /api/admin/departments` - Get all departments
- `POST /api/admin/levels` - Create levels
- `GET /api/admin/levels/:departmentId` - Get department levels
- `POST /api/admin/users` - Create user
- `GET /api/admin/users` - Get all users

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files` - Get files (with filters)
- `GET /api/files/:fileId` - Get file details
- `GET /api/files/:fileId/download` - Download file
- `PUT /api/files/:fileId/update` - Update file

### Workflow
- `POST /api/workflow/files/:fileId/pass` - Pass to next level
- `POST /api/workflow/files/:fileId/reject` - Reject file
- `GET /api/workflow/files/:fileId` - Get workflow history

## Key Concepts

### Department Hierarchy
Each department has a pre-configured hierarchy of levels (e.g., L1 → L2 → L3 → L4). When a user uploads a file, it automatically enters at Level 1 and follows the defined chain.

### Digital Signatures
At each stage, users must sign with their name to verify they have reviewed the document and confirm its accuracy.

### File Versioning
If corrections are needed, users can download the file, make changes, and upload a new version. All versions are tracked with signatures and timestamps.

### Access Control
- **Users**: See only their department's files
- **Directors**: See all files from assigned departments
- **Admin**: Full system access

## Contributing

This is a custom project built for internal use. For modifications or enhancements, please contact the development team.

## License

Proprietary - All rights reserved

## Support

For issues or questions, please contact your system administrator.
