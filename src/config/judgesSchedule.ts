import type { ScheduleEvent } from '../types/team';

export interface JudgesSchedule {
  friday: ScheduleEvent[];
  saturday: ScheduleEvent[];
}

export const INITIAL_JUDGES_SCHEDULE: JudgesSchedule = {
  friday: [
    { event: 'Check In', location: 'Hotel (Holiday Inn Express)', time: '3:00 PM' },
    { event: 'Chill', location: 'Hotel (Holiday Inn Express)', time: '4:15 PM' },
    { event: 'Pre-Mixer Photos', location: 'Hotel Main Ballroom (Holiday Inn Express)', time: '4:30 PM' },
    { event: 'Mixer', location: 'Hotel Main Ballroom (Holiday Inn Express)', time: '5:00 PM' },
    { event: 'Captains Meeting', location: 'Hotel Boardroom (Holiday Inn Express)', time: '6:45 PM' },
  ],
  saturday: [
    { event: 'Breakfast', location: 'Hotel Lobby', time: '4:30 AM' },
    { event: 'Travel to Venue', location: 'Marshall Performing Arts Center', time: '4:45 AM' },
    { event: 'Props Setup', location: 'Marshall Performing Arts Center', time: '5:00 AM' },
    { event: 'Props Cleanup Ends', location: 'Marshall Performing Arts Center', time: '8:15 AM' },
    { event: 'Chill', location: 'Hotel (Holiday Inn Express)', time: '8:30 AM' },
    { event: 'Mock Deliberations', location: 'Hotel Boardroom (Holiday Inn Express)', time: '11:00 AM' },
    { event: 'Get Ready for Show', location: 'Hotel (Holiday Inn Express)', time: '1:45 PM' },
    { event: 'Travel to Venue', location: 'Marshall Performing Arts Center', time: '3:15 PM' },
    { event: 'Pre-Show Photos', location: 'Marshall Performing Arts Center', time: '3:30 PM' },
    { event: 'Judges and Teams Seated', location: 'Marshall Performing Arts Center', time: '4:00 PM' },
    { event: 'Show', location: 'Marshall Performing Arts Center', time: '5:30 PM' },
    { event: 'Travel to Hotel', location: 'Hotel (Holiday Inn Express)', time: '9:30 PM' },
    { event: 'Judges Meeting', location: 'Hotel Boardroom (Holiday Inn Express)', time: '10:00 PM' },
    { event: 'Get Ready for AP', location: 'Hotel (Holiday Inn Express)', time: '10:45 PM' },
    { event: 'After Party', location: 'Reserve in Euless', time: '11:00 PM' },
  ],
};
