# School Attendance App

A full-stack web application for managing school attendance, built with React, Node.js, Express, and MongoDB.

## Features

- User authentication (Admin, Teacher, Student roles)
- Real-time attendance tracking
- Class-wise attendance management
- Date-based attendance records
- Responsive Material-UI design
- Role-based access control:
  - Students can only see classes they are assigned to
  - Teachers can manage their own classes
  - Admins have full access to all features
- Form validation for login and registration
- Class management for teachers (create, edit, delete)
- Mobile device access for testing

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

# For mobile device access, use the provided script
./start-dev.bat  # Windows
```

## Usage

1. Access the application at `http://localhost:5173`
2. Log in with your credentials
3. View and manage attendance based on your role:
   - Teachers can mark and update attendance, manage classes
   - Students can view their attendance records for assigned classes
   - Admins have full access to all features

## Mobile Device Access

To test the application on mobile devices:

1. Run the `start-dev.bat` script (Windows)
2. The script will display your computer's IP address
3. On your mobile device (connected to the same WiFi network), open a browser and navigate to:
   `http://YOUR_COMPUTER_IP:5173`

Note: You may need to allow the application through your firewall for this to work.

## Class Management

Teachers can:
- Create new classes
- Edit existing classes (name, description)
- Delete classes (with confirmation)
- Add students to classes
- Remove students from classes

Students will only see classes they are assigned to in their dashboard.

## Form Validation

The application includes client-side validation for:
- Login form (email format, required fields)
- Registration form (email format, password requirements, matching passwords)
- Class creation/editing forms

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user
- GET `/api/auth/students` - Get all students

### Attendance
- GET `/api/attendance` - Get attendance records
- POST `/api/attendance` - Mark attendance
- PUT `/api/attendance/:id` - Update attendance record

### Classes
- GET `/api/classes` - Get classes (filtered by role)
- POST `/api/classes` - Create a new class
- PUT `/api/classes/:id` - Update a class
- DELETE `/api/classes/:id` - Delete a class
- POST `/api/classes/:classId/students` - Add students to a class
- DELETE `/api/classes/:classId/students/:studentId` - Remove a student from a class

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the ISC License. 