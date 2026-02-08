import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Profile, Trip } from '../types';
import { formatDate, minutesToTime, timeToMinutes } from './format';

export const exportToPDF = async (profile: Profile, trips: Trip[]) => {
  // Group trips by date
  const groups = trips.reduce((acc, trip) => {
    if (!acc[trip.tripDate]) acc[trip.tripDate] = [];
    acc[trip.tripDate].push(trip);
    return acc;
  }, {} as Record<string, Trip[]>);

  let tripRows = '';
  let grandDistance = 0;
  let grandMinutes = 0;

  Object.keys(groups)
    .sort((a, b) => b.localeCompare(a))
    .forEach(date => {
      const dayTrips = groups[date];
      let dayDistance = 0;
      let dayMinutes = 0;

      dayTrips.forEach(t => {
        dayDistance += t.distance;
        dayMinutes += timeToMinutes(t.time);
      });

      grandDistance += dayDistance;
      grandMinutes += dayMinutes;

      tripRows += `<tr><td colspan="7" style="background:#f0f0f0; font-weight:bold;">${formatDate(date)} — ${dayDistance} miles, ${minutesToTime(dayMinutes)}</td></tr>`;

      dayTrips.forEach(t => {
        tripRows += `
          <tr>
            <td>${t.startDestination}</td>
            <td>${t.endDestination}</td>
            <td>${t.startPostal || ''} → ${t.endPostal || ''}</td>
            <td>${t.distance}</td>
            <td>${t.time}</td>
            <td>${t.description || '-'}</td>
          </tr>`;
      });
    });

  const html = `
  <html>
    <head>
      <style>
        body { font-family: Helvetica; padding: 20px; }
        h1 { text-align: center; color: #007bff; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #333; padding: 10px; text-align: left; }
        th { background: #007bff; color: white; }
      </style>
    </head>
    <body>
      <h1>Trip Log Report</h1>
      <p><strong>Name:</strong> ${profile.name}</p>
      <p><strong>Email:</strong> ${profile.email}</p>
      <p><strong>Designation:</strong> ${profile.designation}</p>
      <p><strong>Phone:</strong> ${profile.phone}</p>
      <p><strong>Company:</strong> ${profile.company}</p>

      <table>
        <thead>
          <tr>
            <th>Start</th><th>End</th><th>Postal Codes</th><th>Miles</th><th>Time</th><th>Description</th>
          </tr>
        </thead>
        <tbody>
          ${tripRows}
          <tr><td colspan="6" style="text-align:right; font-weight:bold; background:#e9ecef;">
            GRAND TOTAL: ${grandDistance} miles — ${minutesToTime(grandMinutes)}
          </td></tr>
        </tbody>
      </table>
    </body>
  </html>`;

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Trip Log Report' });
};