Trip Logger is a cross-platform mobile application built with React Native (Expo) and TypeScript that allows users to record daily trips, track mileage and travel time, and generate exportable reports.

The app supports offline-first data storage using SQLite, enables multiple trip entries per day, automatically calculates total mileage and time, and allows exporting trip data as PDF or Word documents.

Designed with a clean and professional UI, the application runs seamlessly on both Android and iOS platforms.

**Project Structured**
trip-logger/
├── App.tsx
├── app.json
├── eas.json
├── babel.config.js
├── tsconfig.json
├── src/
   ├── components/
   │   ├── Header.tsx
   │   ├── LoadingSpinner.tsx
   │   └── TripRow.tsx
   ├── db/
   │   └── database.ts
   ├── navigation/
   │   └── AppNavigator.tsx
   ├── screens/
   │   ├── ProfileSetupScreen.tsx
   │   ├── ProfileScreen.tsx
   │   ├── AddTripScreen.tsx
   │   └── TripsScreen.tsx
   ├── types/
   │   └── index.ts
   ├── utils/
   │   ├── format.ts
   │   └── pdf.ts
   └── theme/
       └── colors.ts
