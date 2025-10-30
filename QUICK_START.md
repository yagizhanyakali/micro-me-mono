# Habit Tracker - Quick Start Guide

This is a **production-ready habit tracker application** with a React Native frontend and NestJS backend.

## ⚡ Quick Start (3 Steps)

### 1. Start MongoDB

Make sure MongoDB is running on your machine:

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB

# Verify it's running
mongosh  # or mongo (should connect without errors)
```

### 2. Start the Backend API

Open a terminal in the project root and run:

```bash
npm run start:api
```

✅ You should see: `🚀 Application is running on: http://localhost:3000/api`

### 3. Start the Mobile App

Open another terminal and run:

```bash
# Start Metro bundler
npm run start:mobile
```

Then in another terminal:

```bash
# For iOS (macOS only)
npx nx run-ios mobile

# For Android
npx nx run-android mobile

# For Web
npx nx serve mobile
```

## 🎯 Test the Application

### Option 1: Using the Mobile App

1. Open the app (it will start on the "Today" screen)
2. Add your first habit (e.g., "Morning Exercise")
3. Tap the circle to mark it complete ✓
4. Go to "Stats" tab to see your streak (1 day!)
5. Add up to 3 more habits (max 4 total)

### Option 2: Using API Directly

```bash
# Create a habit
curl -X POST http://localhost:3000/api/habits \
  -H "Content-Type: application/json" \
  -d '{"name": "Drink Water"}'

# Get all habits
curl http://localhost:3000/api/habits

# Mark as complete today (replace HABIT_ID with actual ID from above)
curl -X POST http://localhost:3000/api/entries \
  -H "Content-Type: application/json" \
  -d '{"habitId": "HABIT_ID", "date": "2025-10-30"}'

# Get streaks
curl http://localhost:3000/api/stats/streaks

# Get heatmap
curl http://localhost:3000/api/stats/heatmap?days=60
```

## 📱 App Screens

### Today Screen (Default)
- View all your habits
- Check/uncheck to mark complete for today
- Add new habits (button appears only if < 4 habits)
- Swipe or tap X to delete habits
- Shows current date

### Stats Screen
- **Streaks**: Shows consecutive days for each habit
- **Heatmap**: Visual calendar of last 60 days (GitHub-style)
- Color intensity = number of habits completed that day
- 🔥 Fire emoji for 7+ day streaks

## 🔧 Troubleshooting

### "Cannot connect to backend"
**For iOS Simulator**: API URL should be `http://localhost:3000/api` ✅  
**For Android Emulator**: Change to `http://10.0.2.2:3000/api` in `mobile/src/services/api.ts`  
**For Physical Device**: Use your computer's local IP (e.g., `http://192.168.1.100:3000/api`)

```bash
# Find your IP:
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

### "MongoDB connection failed"
1. Make sure MongoDB is running: `mongosh` should connect
2. Default connection: `mongodb://localhost:27017/habit-tracker`
3. If using custom MongoDB, set environment variable:
   ```bash
   export MONGODB_URI="your_mongodb_connection_string"
   npm run start:api
   ```

### "Port 3000 already in use"
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or use a different port
PORT=3001 npm run start:api
```

## ✨ Key Features Implemented

### Backend (NestJS + MongoDB)
- ✅ **4 Habit Limit**: Enforced by backend validation
- ✅ **RESTful API**: All CRUD operations
- ✅ **Validation**: Input validation with proper error messages
- ✅ **MongoDB Integration**: Mongoose schemas with indexes
- ✅ **CORS Enabled**: For React Native access
- ✅ **Error Handling**: Proper HTTP status codes

### Frontend (React Native)
- ✅ **Tab Navigation**: Today and Stats screens
- ✅ **Habit Management**: Add, delete, toggle completion
- ✅ **Real-time Updates**: Pull-to-refresh on both screens
- ✅ **Visual Feedback**: Completed habits show checkmark
- ✅ **Heatmap Visualization**: Custom calendar grid
- ✅ **Streak Tracking**: Daily consecutive completion count
- ✅ **Responsive UI**: Clean, minimalist design

## 📊 API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/habits` | GET | List all habits |
| `/api/habits` | POST | Create habit (max 4) |
| `/api/habits/:id` | DELETE | Delete habit + entries |
| `/api/entries` | POST | Mark complete |
| `/api/entries` | DELETE | Mark incomplete |
| `/api/entries/today` | GET | Today's completions |
| `/api/stats/heatmap` | GET | 60-day activity data |
| `/api/stats/streaks` | GET | Current streak counts |

## 🗂️ Project Structure

```
micro-me-mono/
├── api/src/
│   ├── habits/          # Habit CRUD operations
│   ├── entries/         # Completion tracking
│   ├── stats/           # Heatmap & streaks
│   ├── schemas/         # MongoDB models
│   └── dto/             # Validation objects
│
├── mobile/src/
│   ├── screens/         # Today & Stats screens
│   ├── navigation/      # Tab navigator
│   └── services/        # API service layer
│
├── HABIT_TRACKER_README.md  # Full documentation
└── QUICK_START.md           # This file
```

## 🚀 Next Steps

1. **Test the 4-habit limit**: Try adding a 5th habit (should fail)
2. **Test streaks**: Mark a habit complete for multiple consecutive days
3. **Test heatmap**: Complete different numbers of habits on different days
4. **Test deletion**: Delete a habit (all its entries are also deleted)
5. **Test validation**: Try creating a habit with empty name or invalid date format

## 📚 Full Documentation

For detailed setup instructions, architecture notes, and deployment guide, see:
- [HABIT_TRACKER_README.md](./HABIT_TRACKER_README.md)

## 💡 Tips

- The app uses a demo user ID (`demo-user-1`) for simplicity
- All dates are stored in `YYYY-MM-DD` format
- Streaks allow a grace day (can skip today and continue yesterday's streak)
- Heatmap colors: Gray (0) → Light Green (1) → Green (2) → Dark Green (3+)
- MongoDB indexes ensure one entry per habit per date

## 🐛 Common Issues

**Metro bundler cache issues**:
```bash
npx react-native start --reset-cache
```

**iOS build issues**:
```bash
cd mobile/ios && pod install && cd ../..
```

**Android build issues**:
```bash
cd mobile/android && ./gradlew clean && cd ../..
```

---

**Enjoy tracking your habits! 🎉**

