# Online Knowledge Sharing System (MERN Stack)

A full-stack knowledge sharing platform built with MongoDB, Express.js, React.js, and Node.js. Users can create courses, exchange knowledge, earn points, and connect with other learners and teachers.

## 📁 Project Structure

```
knowledge-sharing-system/
├── frontend/                # React App
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API calls
│   │   ├── context/        # Auth & user state
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                 # Node + Express API
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # MongoDB models
│   │   ├── services/       # Business logic
│   │   ├── middlewares/    # Auth middleware
│   │   └── app.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
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

3. Configure environment variables:
   - Copy `.env` file and update with your MongoDB connection string:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/knowledge_sharing_system
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The backend server will run on `http://localhost:5000`

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

The frontend will run on `http://localhost:3000`

## 🎨 Features

### Frontend Components

- **DashboardLayout**: Main dashboard with sidebar navigation
- **ProfileCard**: User profile, skills, and role management
- **TeachCourses**: Create and manage courses you teach
- **LearningCourses**: Browse and enroll in courses
- **MutualExchange**: Peer-to-peer skill exchange
- **PointsWallet**: View earned points and rewards
- **RequestsPanel**: Manage teaching/learning requests

### Backend API Endpoints

#### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /profile` - Get current user profile (protected)

#### Courses (`/api/courses`)
- `GET /` - Get all courses
- `GET /teaching` - Get courses user is teaching (protected)
- `GET /learning` - Get courses user is learning (protected)
- `POST /` - Create new course (protected)
- `POST /:courseId/enroll` - Enroll in course (protected)

#### Exchanges (`/api/exchanges`)
- `GET /` - Get all exchanges (protected)
- `GET /my-exchanges` - Get user's exchanges (protected)
- `POST /` - Create exchange request (protected)
- `PATCH /:exchangeId/status` - Update exchange status (protected)

#### Requests (`/api/requests`)
- `GET /` - Get all requests (protected)
- `GET /my-requests` - Get user's requests (protected)
- `POST /` - Create request (protected)
- `PATCH /:requestId/status` - Update request status (protected)

#### Users (`/api/users`)
- `GET /` - Get all users (protected)
- `GET /wallet` - Get user points wallet (protected)
- `GET /:userId` - Get user by ID (protected)
- `PATCH /profile` - Update user profile (protected)

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication. Tokens are stored in localStorage and sent with each API request via the Authorization header.

## 💰 Points System

Users earn points by:
- Creating courses (20 points per enrollment)
- Completing learning (15 points per course)
- Mutual exchanges (10 points per exchange)
- Accepting requests (15 points per request)

Points can be used to:
- Enroll in premium courses
- Unlock exclusive features

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router, Axios, Vite
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT, bcryptjs
- **Styling**: CSS3 with modern design patterns

## 📝 Notes

- All API endpoints require authentication except `/api/auth/register` and `/api/auth/login`
- MongoDB models include User, Course, Exchange, and Request
- The frontend uses React Context for state management
- Responsive design for mobile and desktop

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available for learning purposes.
