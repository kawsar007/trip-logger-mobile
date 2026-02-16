import * as SQLite from 'expo-sqlite';
import { Profile, Trip } from '../types';

const db = SQLite.openDatabaseAsync('tripLogger.db');

export const initDB = async () => {
  const database = await db;

  await database.execAsync(`PRAGMA journal_mode = WAL;`);
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      designation TEXT,
      phone TEXT,
      company TEXT
    );

    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tripDate TEXT NOT NULL,
      startDestination TEXT NOT NULL,
      endDestination TEXT NOT NULL,
      startPostal TEXT,
      endPostal TEXT,
      distance REAL NOT NULL,
      time TEXT NOT NULL,
      description TEXT
    );
  `);
  try {
    await database.execAsync(`
      ALTER TABLE trips ADD COLUMN startTravelTime TEXT;
    `);
    console.log('Added column: startTravelTime');
  } catch (e) {
    // Ignore if column already exists (error code is usually "duplicate column name")
    console.log('startTravelTime column already exists or other error:', e);
  }

  try {
    await database.execAsync(`
      ALTER TABLE trips ADD COLUMN endTravelTime TEXT;
    `);
    console.log('Added column: endTravelTime');
  } catch (e) {
    console.log('endTravelTime column already exists or other error:', e);
  }
};

export const getProfile = async (): Promise<Profile | null> => {
  const database = await db;
  return await database.getFirstAsync('SELECT * FROM profile WHERE id = 1');
};

export const saveProfile = async (profile: Profile) => {
  const database = await db;
  await database.runAsync(
    `INSERT OR REPLACE INTO profile (id, name, email, designation, phone, company) 
     VALUES (1, ?, ?, ?, ?, ?)`,
    [profile.name, profile.email, profile.designation || '', profile.phone || '', profile.company || '']
  );
};

export const addTrip = async (trip: Trip) => {
  const database = await db;
  await database.runAsync(
    `INSERT INTO trips (tripDate, startDestination, endDestination, startPostal, endPostal, distance, time, description, startTravelTime, endTravelTime)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      trip.tripDate,
      trip.startDestination,
      trip.endDestination,
      trip.startPostal || '',
      trip.endPostal || '',
      trip.distance,
      trip.time,
      trip.description || '',
      trip.startTravelTime || null,
      trip.endTravelTime || null,
    ]
  );
};

export const getAllTrips = async (): Promise<Trip[]> => {
  const database = await db;
  return await database.getAllAsync(
    `SELECT 
      id, tripDate, startDestination, endDestination, startPostal, endPostal,
      distance, time, description, startTravelTime, endTravelTime
     FROM trips 
     ORDER BY tripDate DESC, startTravelTime ASC, id DESC`
  );
};

export const updateTrip = async (id: number, trip: Trip) => {
  const database = await db;
  await database.runAsync(
    `UPDATE trips 
     SET tripDate = ?, startDestination = ?, endDestination = ?, 
         startPostal = ?, endPostal = ?, distance = ?, time = ?, 
         description = ?, startTravelTime = ?, endTravelTime = ?
     WHERE id = ?`,
    [
      trip.tripDate,
      trip.startDestination,
      trip.endDestination,
      trip.startPostal || '',
      trip.endPostal || '',
      trip.distance,
      trip.time,
      trip.description || '',
      trip.startTravelTime || null,
      trip.endTravelTime || null,
      id,
    ]
  );
};

export const getTripById = async (id: number): Promise<Trip | null> => {
  const database = await db;
  return await database.getFirstAsync(
    `SELECT id, tripDate, startDestination, endDestination, startPostal, endPostal,
            distance, time, description, startTravelTime, endTravelTime
     FROM trips WHERE id = ?`,
    [id]
  );
};

export const deleteTrip = async (id: number) => {
  const database = await db;
  await database.runAsync('DELETE FROM trips WHERE id = ?', [id]);
};

export const clearAllData = async () => {
  const database = await db;

  await database.execAsync(`
    DELETE FROM trips; 
    DELETE FROM profile;
    `);
};