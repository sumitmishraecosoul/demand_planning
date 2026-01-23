# Demand Planning Backend API

Backend server for Demand Planning - Document Workflow Management System

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update MongoDB URI and other settings

3. Start MongoDB:
```bash
# Make sure MongoDB is running locally or update MONGODB_URI in .env
```

4. Run the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `GET /me` - Get current user

### Admin (`/api/admin`) - Admin only
- `POST /departments` - Create department
- `GET /departments` - Get all departments
- `POST /levels` - Create levels for department
- `GET /levels/:departmentId` - Get levels by department
- `POST /users` - Create user
- `GET /users` - Get all users
- `PUT /users/:userId` - Update user
- `PATCH /users/:userId/deactivate` - Deactivate user

### Departments (`/api/departments`)
- `GET /` - Get all departments
- `GET /:departmentId/levels` - Get department levels

### Files (`/api/files`)
- `POST /upload` - Upload file
- `GET /` - Get all files (with filters)
- `GET /:fileId` - Get file details
- `GET /:fileId/download/:version?` - Download file
- `PUT /:fileId/update` - Update file (new version)

### Workflow (`/api/workflow`)
- `POST /files/:fileId/pass` - Pass file to next level
- `POST /files/:fileId/reject` - Reject file
- `GET /files/:fileId` - Get workflow for file
- `GET /departments/:departmentId/users` - Get department users

### Users (`/api/users`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `GET /dashboard/stats` - Get dashboard statistics

## Database Models

- **User** - System users (admin, director, user)
- **Department** - Company departments
- **Level** - Hierarchical levels within departments
- **File** - Uploaded documents with versions
- **Workflow** - Workflow tracking and history
