# Habit Tracker Application

A full-stack habit tracking application built with React Native (frontend) and NestJS (backend) with MongoDB database.

## Features

### Core Features
- **Maximum 4 Daily Habits**: Users can add up to 4 habits (enforced by backend validation)
- **Daily Tracking**: Mark habits as complete/incomplete for each day
- **Streak Tracking**: View current streaks for each habit
- **Activity Heatmap**: Visual representation of the last 60 days of activity
- **REST API**: Clean RESTful API with proper validation

### Tech Stack
- **Frontend**: React Native with React Navigation
- **Backend**: NestJS with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Validation**: class-validator and class-transformer
- **HTTP Client**: Axios

## Prerequisites

Before running this application, ensure you have the following installed:

1. **Node.js** (v18 or higher)
2. **npm** (comes with Node.js)
3. **MongoDB** (v5.0 or higher)
   - Install MongoDB: https://www.mongodb.com/docs/manual/installation/
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas
4. **React Native Development Environment**
   - For iOS: Xcode (macOS only)
   - For Android: Android Studio
   - Follow the official guide: https://reactnative.dev/docs/environment-setup

## Project Structure

```
micro-me-mono/
├── api/                          # NestJS Backend
│   └── src/
│       ├── app/                  # App module
│       ├── habits/               # Habits module (CRUD)
│       ├── entries/              # Entries module (completion tracking)
│       ├── stats/                # Stats module (heatmap & streaks)
│       ├── schemas/              # Mongoose schemas
│       ├── dto/                  # Data Transfer Objects
│       └── main.ts               # Entry point
├── mobile/                       # React Native Frontend
│   └── src/
│       ├── app/                  # Main app component
│       ├── screens/              # Screen components
│       │   ├── TodayScreen.tsx   # Today's habits view
│       │   └── StatsScreen.tsx   # Statistics view
│       ├── navigation/           # Navigation setup
│       └── services/             # API service layer
└── package.json                  # Root package file
```

## Setup Instructions

### 1. Install Dependencies

From the project root:

```bash
npm install
```

### 2. Setup MongoDB

#### Option A: Local MongoDB
1. Start MongoDB service:
   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod

   # Windows
   net start MongoDB
   ```

2. The application will connect to `mongodb://localhost:27017/habit-tracker` by default.

#### Option B: MongoDB Atlas (Cloud)
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Get your connection string
3. Set the `MONGODB_URI` environment variable (see Configuration section)

### 3. Configure the Backend

The backend will use default configurations, but you can customize by setting environment variables:

```bash
# Optional: Set custom MongoDB URI
export MONGODB_URI="mongodb://localhost:27017/habit-tracker"

# Optional: Set custom port (default: 3000)
export PORT=3000
```

### 4. Configure the Frontend

Update the API base URL in `mobile/src/services/api.ts`:

```typescript
// For iOS Simulator
const API_BASE_URL = 'http://localhost:3000/api';

// For Android Emulator
const API_BASE_URL = 'http://10.0.2.2:3000/api';

// For Physical Device (replace with your computer's IP)
const API_BASE_URL = 'http://192.168.1.XXX:3000/api';
```

To find your computer's IP:
```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

## Running the Application

### Start the Backend (NestJS API)

From the project root:

```bash
# Development mode with hot-reload
npx nx serve api

# Or build and run
npx nx build api
npx nx serve api --configuration=production
```

The API will be available at `http://localhost:3000/api`

### Start the Frontend (React Native)

#### For iOS (macOS only):

```bash
# Install iOS dependencies
cd mobile/ios && pod install && cd ../..

# Start Metro bundler
npx nx start mobile

# In another terminal, run the app
npx nx run-ios mobile
```

#### For Android:

```bash
# Start Metro bundler
npx nx start mobile

# In another terminal, run the app
npx nx run-android mobile
```

#### For Web (Development):

```bash
npx nx serve mobile
```

## API Endpoints

### Habits

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/habits` | Create a new habit (max 4) |
| GET | `/api/habits` | Get all habits |
| DELETE | `/api/habits/:id` | Delete a habit and its entries |

### Entries

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/entries` | Mark habit as complete for a date |
| DELETE | `/api/entries` | Remove completion entry |
| GET | `/api/entries/today` | Get today's completed habit IDs |

### Stats

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats/heatmap?days=60` | Get activity heatmap data |
| GET | `/api/stats/streaks` | Get current streaks for all habits |

## API Usage Examples

### Create a Habit

```bash
curl -X POST http://localhost:3000/api/habits \
  -H "Content-Type: application/json" \
  -d '{"name": "Morning Exercise"}'
```

### Get All Habits

```bash
curl http://localhost:3000/api/habits
```

### Mark Habit as Complete

```bash
curl -X POST http://localhost:3000/api/entries \
  -H "Content-Type: application/json" \
  -d '{"habitId": "64f5a1b2c3d4e5f6g7h8i9j0", "date": "2025-10-30"}'
```

### Get Today's Entries

```bash
curl http://localhost:3000/api/entries/today
```

### Get Streaks

```bash
curl http://localhost:3000/api/stats/streaks
```

### Get Heatmap

```bash
curl http://localhost:3000/api/stats/heatmap?days=60
```

## Features in Detail

### Today Screen
- View all your habits
- Toggle completion status with a tap
- Add new habits (up to 4)
- Delete habits with confirmation
- Pull-to-refresh functionality
- Visual feedback for completed habits

### Stats Screen
- **Current Streaks**: See consecutive days of completion for each habit
- **Activity Heatmap**: GitHub-style contribution graph showing your consistency
- **Pull-to-refresh**: Update stats in real-time
- **Fire Emoji**: Special indicator for 7+ day streaks

## Validation Rules

### Habit Creation
- Name is required
- Maximum 100 characters
- Maximum 4 habits per user

### Entry Creation
- HabitId must be valid MongoDB ObjectId
- Date must be in YYYY-MM-DD format
- One entry per habit per date (enforced by unique index)

## Troubleshooting

### Backend won't start
- Ensure MongoDB is running: `mongod --version`
- Check if port 3000 is available: `lsof -i :3000`
- Verify MongoDB connection string

### Frontend can't connect to backend
- Check API_BASE_URL in `mobile/src/services/api.ts`
- Ensure backend is running
- For physical devices, use your computer's local IP
- Check firewall settings

### MongoDB connection errors
- Verify MongoDB is running: `mongo` (or `mongosh`)
- Check connection string format
- For Atlas: verify IP whitelist and credentials

### Metro bundler issues
```bash
# Clear cache and restart
npx react-native start --reset-cache
```

### iOS build issues
```bash
# Clean and reinstall
cd mobile/ios
pod deintegrate
pod install
cd ../..
```

## Development

### Running Tests

```bash
# Backend tests
npx nx test api

# Frontend tests
npx nx test mobile
```

### Linting

```bash
# Lint all projects
npx nx run-many -t lint

# Lint specific project
npx nx lint api
npx nx lint mobile
```

### Building for Production

```bash
# Build backend
npx nx build api --configuration=production

# Build Android APK
cd mobile/android
./gradlew assembleRelease

# Build iOS (requires macOS and Xcode)
cd mobile/ios
xcodebuild -workspace Mobile.xcworkspace -scheme Mobile -configuration Release
```

## Architecture Notes

### Backend Architecture
- **Modular Design**: Separate modules for Habits, Entries, and Stats
- **Validation**: Input validation using class-validator decorators
- **Error Handling**: Proper HTTP status codes and error messages
- **CORS Enabled**: Configured for React Native access
- **Indexes**: Optimized MongoDB queries with compound indexes

### Frontend Architecture
- **Component-Based**: Reusable screen components
- **Navigation**: Bottom tab navigation with Today and Stats screens
- **State Management**: React hooks (useState, useEffect)
- **API Layer**: Centralized API service with Axios
- **Type Safety**: TypeScript interfaces for API responses

### Database Schema
- **Habit**: `{ name, userId, createdAt }`
- **Entry**: `{ habitId, userId, date }` with unique compound index on (habitId, date)

## Future Enhancements

- User authentication (JWT)
- Multiple users support
- Habit categories/tags
- Custom habit frequencies (not just daily)
- Notifications/reminders
- Data export functionality
- Social features (share streaks)
- Dark mode support
- Habit templates

## License

MIT

## Support

For issues or questions, please check the MongoDB connection and ensure all dependencies are installed correctly.

