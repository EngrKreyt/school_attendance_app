# School Attendance App

A full-stack web application for managing school attendance, built with React, Node.js, Express, and MongoDB.

## Features

- User authentication (Admin, Teacher, Student roles)
- Real-time attendance tracking
- Class-wise attendance management
- Date-based attendance records
- Responsive Material-UI design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd school-attendance-app
```

2. Install dependencies:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/school_attendance
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

4. Start the development servers:
```bash
# Start backend server (from root directory)
npm run server

# Start frontend server (from client directory)
npm run client

# Or start both concurrently (from root directory)
npm run dev:all
```

## Usage

1. Access the application at `http://localhost:5173`
2. Log in with your credentials
3. View and manage attendance based on your role:
   - Teachers can mark and update attendance
   - Students can view their attendance records
   - Admins have full access to all features

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

### Attendance
- GET `/api/attendance` - Get attendance records
- POST `/api/attendance` - Mark attendance
- PUT `/api/attendance/:id` - Update attendance record

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the ISC License. 