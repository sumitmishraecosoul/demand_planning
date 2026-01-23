# Demand Planning Frontend

Frontend application for Demand Planning - Document Workflow Management System built with Next.js.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **React Icons** - Icon library

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── login/        # Login page
│   │   ├── dashboard/    # Dashboard page
│   │   ├── files/        # File management pages
│   │   └── admin/        # Admin panel pages
│   ├── components/       # Reusable components
│   │   ├── Layout.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── FilePreview.tsx
│   │   ├── StatusTracker.tsx
│   │   └── SignatureModal.tsx
│   ├── lib/              # Utilities and configurations
│   │   └── api.ts        # API client and endpoints
│   └── store/            # Zustand state management
│       └── useAuthStore.ts
├── public/               # Static files
└── package.json
```

## Features

### User Features
- Upload CSV/PDF files
- Preview and download files
- Update files with new versions
- Digital signature verification
- Pass files to next level in hierarchy
- Track workflow status
- View file history and versions

### Director Features
- Access multiple departments
- View all files across assigned departments
- Monitor workflow status

### Admin Features
- Create and manage departments
- Create and manage users
- Configure hierarchical levels for departments
- View system-wide statistics

## Environment Variables

The frontend connects to the backend API at `http://localhost:5000/api` by default. You can change this by setting:

```bash
NEXT_PUBLIC_API_URL=http://your-api-url/api
```

## Building for Production

```bash
npm run build
npm start
```

## Demo Credentials

- **Admin**: admin@demandplanning.com / admin123 (create via backend first)
- **Signup**: Available at /signup (development mode only)
- Users can also be created by the admin
