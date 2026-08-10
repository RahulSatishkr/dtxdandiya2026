import { ref, set, get } from 'firebase/database';
import { db } from './firebase';

export const TEAM_IDS = ['tamu', 'texas', 'ucsd', 'uiuc', 'uw', 'washu', 'uf', 'michigan'] as const;

export type TeamId = typeof TEAM_IDS[number];
export type DashboardTeamId = TeamId | 'admin';

export const TEAM_DISPLAY_NAMES: Record<TeamId, string> = {
  tamu: 'TAMU Wreckin\' Raas',
  texas: 'Dirty South Dandiya',
  michigan: 'Michigan Wolveraas',
  uiuc: 'UIUC Illini Raas',
  uw: 'UW Raas',
  washu: 'WashU Raas',
  uf: 'UF Gatoraas',
  ucsd: 'UCSD Raas Ruckus'
};

export interface ScheduleEvent {
  time: string;
  event: string;
  location: string;
}

export interface Schedule {
  showOrder: number | null;
  isPublished: boolean;
  friday: ScheduleEvent[];
  saturdayTech: ScheduleEvent[];
  saturdayPreShow: ScheduleEvent[];
  saturdayShow: ScheduleEvent[];
  saturdayPostShow: {
    placing: ScheduleEvent[];
    nonPlacing: ScheduleEvent[];
  };
}

export interface TeamInfo {
  displayName: string;
  announcements: Array<{
    id: string;
    title: string;
    content: string;
    timestamp: number;
    targetTeams?: TeamId[];
  }>;
  information: {
    liaisons: Array<{
      name: string;
      phone: string;
    }>;
    tech: typeof TECH_INFO;
    venue: typeof VENUE_INFO;
    hotel: typeof HOTEL_INFO;
  };
  techVideo: {
    title: string;
    youtubeUrl: string;
    driveUrl: string;
    description: string;
    isPublished: boolean;
  };
  schedule: Schedule;
  nearbyLocations: Array<{
    id: string;
    name: string;
    address: string;
    type: 'Food' | 'Practice' | 'Hotel' | 'Emergency' | 'Other';
    distance?: string;
    notes?: string;
  }>;
}

export const GENERIC_SCHEDULES: Record<string, Schedule> = {
  'Team 1': {
    isPublished: false,
    showOrder: null,
    friday: [
      { time: "11:55 AM", event: "Registration", location: "Oak Room" },
      { time: "2:40 PM", event: "Check-In", location: "Oak Room" },
      { time: "3:55 PM", event: "Dinner", location: "Team Rooms" },
      { time: "4:55 PM", event: "Mixer", location: "Garden Terrace" },
      { time: "7:25 PM", event: "Captains Meeting", location: "Near Room" },
      { time: "7:55 PM", event: "Post-Mixer Practice", location: "Ebony Room" },
      { time: "8:30 PM", event: "Optional Practice", location: "Garden Terrace" }
    ],
    saturdayTech: [
      { time: "7:35 AM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "8:00 AM", event: "Stretching", location: "DR 1" },
      { time: "8:20 AM", event: "Hold", location: "Side Stage" },
      { time: "8:35 AM", event: "Tech Time (20 Mins)", location: "Stage" },
      { time: "9:10 AM", event: "Video Review (10 Mins)", location: "Viewing Room" },
      { time: "9:30 AM", event: "Post Tech", location: "Dance and Choral Hall" },
      { time: "9:55 AM", event: "Travel to Hotel", location: "Venue Lobby" },
      { time: "12:20 PM", event: "Captains Travel to Venue", location: "Hotel Lobby" },
      { time: "12:35 PM", event: "Lighting Cues", location: "Auditorium" }
    ],
    saturdayPreShow: [
      { time: "3:20 PM", event: "Last Call", location: "Hotel Lobby" },
      { time: "3:25 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "3:45 PM", event: "Photo Shoot", location: "Outside Venue" }
    ],
    saturdayShow: [
      { time: "4:55 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "5:05 PM", event: "Dressing Room", location: "DR 1" },
      { time: "5:20 PM", event: "Hold", location: "Side Stage" },
      { time: "5:40 PM", event: "Team Performance", location: "Stage" },
      { time: "5:55 PM", event: "Post Performance", location: "Audience" }
    ],
    saturdayPostShow: {
      nonPlacing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:15 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "10:25 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "10:45 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:25 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ],
      placing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:45 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "11:05 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "11:25 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:35 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ]
    }
  },
  'Team 2': {
    isPublished: false,
    showOrder: null,
    friday: [
      { time: "11:55 AM", event: "Registration", location: "Oak Room" },
      { time: "2:40 PM", event: "Check-In", location: "Oak Room" },
      { time: "3:55 PM", event: "Dinner", location: "Team Rooms" },
      { time: "4:55 PM", event: "Mixer", location: "Garden Terrace" },
      { time: "7:25 PM", event: "Captains Meeting", location: "Near Room" },
      { time: "7:55 PM", event: "Post-Mixer Practice", location: "Teak Room" },
      { time: "8:50 PM", event: "Optional Practice", location: "Garden Terrace" }
    ],
    saturdayTech: [
      { time: "8:05 AM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "8:30 AM", event: "Stretching", location: "DR 2" },
      { time: "8:50 AM", event: "Hold", location: "Side Stage" },
      { time: "9:05 AM", event: "Tech Time (20 Mins)", location: "Stage" },
      { time: "9:40 AM", event: "Video Review (10 Mins)", location: "Viewing Room" },
      { time: "10:00 AM", event: "Post Tech", location: "Dance and Choral Hall" },
      { time: "10:25 AM", event: "Travel to Hotel", location: "Venue Lobby" },
      { time: "12:30 PM", event: "Captains Travel to Venue", location: "Hotel Lobby" },
      { time: "12:45 PM", event: "Lighting Cues", location: "Auditorium" }
    ],
    saturdayPreShow: [
      { time: "3:30 PM", event: "Last Call", location: "Hotel Lobby" },
      { time: "3:35 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "3:55 PM", event: "Photo Shoot", location: "Outside Venue" }
    ],
    saturdayShow: [
      { time: "5:10 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "5:20 PM", event: "Dressing Room", location: "DR 2" },
      { time: "5:35 PM", event: "Hold", location: "Side Stage" },
      { time: "5:55 PM", event: "Team Performance", location: "Stage" },
      { time: "6:10 PM", event: "Post Performance", location: "Audience" }
    ],
    saturdayPostShow: {
      nonPlacing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:15 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "10:25 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "10:45 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:25 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ],
      placing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:45 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "11:05 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "11:25 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:35 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ]
    }
  },
  'Team 3': {
    isPublished: false,
    showOrder: null,
    friday: [
      { time: "11:55 AM", event: "Registration", location: "Oak Room" },
      { time: "2:40 PM", event: "Check-In", location: "Oak Room" },
      { time: "3:55 PM", event: "Dinner", location: "Team Rooms" },
      { time: "4:55 PM", event: "Mixer", location: "Garden Terrace" },
      { time: "7:25 PM", event: "Captains Meeting", location: "Near Room" },
      { time: "8:30 PM", event: "Post-Mixer Practice", location: "Ebony Room" },
      { time: "9:10 PM", event: "Optional Practice", location: "Garden Terrace" }
    ],
    saturdayTech: [
      { time: "8:35 AM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "9:00 AM", event: "Stretching", location: "DR 1" },
      { time: "9:20 AM", event: "Hold", location: "Side Stage" },
      { time: "9:35 AM", event: "Tech Time (20 Mins)", location: "Stage" },
      { time: "10:10 AM", event: "Video Review (10 Mins)", location: "Viewing Room" },
      { time: "10:30 AM", event: "Post Tech", location: "Dance and Choral Hall" },
      { time: "10:55 AM", event: "Travel to Hotel", location: "Venue Lobby" },
      { time: "12:40 PM", event: "Captains Travel to Venue", location: "Hotel Lobby" },
      { time: "12:55 PM", event: "Lighting Cues", location: "Auditorium" }
    ],
    saturdayPreShow: [
      { time: "3:40 PM", event: "Last Call", location: "Hotel Lobby" },
      { time: "3:45 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "4:05 PM", event: "Photo Shoot", location: "Outside Venue" }
    ],
    saturdayShow: [
      { time: "5:25 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "5:35 PM", event: "Dressing Room", location: "DR 1" },
      { time: "5:50 PM", event: "Hold", location: "Side Stage" },
      { time: "6:10 PM", event: "Team Performance", location: "Stage" },
      { time: "6:25 PM", event: "Post Performance", location: "Audience" }
    ],
    saturdayPostShow: {
      nonPlacing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:15 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "10:25 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "10:45 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:25 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ],
      placing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:45 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "11:05 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "11:25 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:35 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ]
    }
  },
  'Team 4': {
    isPublished: false,
    showOrder: null,
    friday: [
      { time: "11:55 AM", event: "Registration", location: "Oak Room" },
      { time: "2:40 PM", event: "Check-In", location: "Oak Room" },
      { time: "3:55 PM", event: "Dinner", location: "Team Rooms" },
      { time: "4:55 PM", event: "Mixer", location: "Garden Terrace" },
      { time: "7:25 PM", event: "Captains Meeting", location: "Near Room" },
      { time: "8:30 PM", event: "Post-Mixer Practice", location: "Teak Room" },
      { time: "9:30 PM", event: "Optional Practice", location: "Garden Terrace" }
    ],
    saturdayTech: [
      { time: "9:05 AM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "9:30 AM", event: "Stretching", location: "DR 2" },
      { time: "9:50 AM", event: "Hold", location: "Side Stage" },
      { time: "10:05 AM", event: "Tech Time (20 Mins)", location: "Stage" },
      { time: "10:40 AM", event: "Video Review (10 Mins)", location: "Viewing Room" },
      { time: "11:00 AM", event: "Post Tech", location: "Dance and Choral Hall" },
      { time: "11:25 AM", event: "Travel to Hotel", location: "Venue Lobby" },
      { time: "12:50 PM", event: "Captains Travel to Venue", location: "Hotel Lobby" },
      { time: "1:05 PM", event: "Lighting Cues", location: "Auditorium" }
    ],
    saturdayPreShow: [
      { time: "3:50 PM", event: "Last Call", location: "Hotel Lobby" },
      { time: "3:55 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "4:15 PM", event: "Photo Shoot", location: "Outside Venue" }
    ],
    saturdayShow: [
      { time: "5:40 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "5:50 PM", event: "Dressing Room", location: "DR 2" },
      { time: "6:05 PM", event: "Hold", location: "Side Stage" },
      { time: "6:25 PM", event: "Team Performance", location: "Stage" },
      { time: "6:40 PM", event: "Post Performance", location: "Audience" }
    ],
    saturdayPostShow: {
      nonPlacing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:15 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "10:25 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "10:45 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:25 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ],
      placing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:45 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "11:05 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "11:25 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:35 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ]
    }
  },
  'Team 5': {
    isPublished: false,
    showOrder: null,
    friday: [
      { time: "11:55 AM", event: "Registration", location: "Oak Room" },
      { time: "2:40 PM", event: "Check-In", location: "Oak Room" },
      { time: "3:55 PM", event: "Dinner", location: "Team Rooms" },
      { time: "4:55 PM", event: "Mixer", location: "Garden Terrace" },
      { time: "7:55 PM", event: "Captains Meeting", location: "Near Room" },
      { time: "9:05 PM", event: "Post-Mixer Practice", location: "Ebony Room" },
      { time: "9:50 PM", event: "Optional Practice", location: "Garden Terrace" }
    ],
    saturdayTech: [
      { time: "9:35 AM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "10:00 AM", event: "Stretching", location: "DR 1" },
      { time: "10:20 AM", event: "Hold", location: "Side Stage" },
      { time: "10:35 AM", event: "Tech Time (20 Mins)", location: "Stage" },
      { time: "11:10 AM", event: "Video Review (10 Mins)", location: "Viewing Room" },
      { time: "11:30 AM", event: "Post Tech", location: "Dance and Choral Hall" },
      { time: "11:55 AM", event: "Travel to Hotel", location: "Venue Lobby" },
      { time: "1:00 PM", event: "Captains Travel to Venue", location: "Hotel Lobby" },
      { time: "1:15 PM", event: "Lighting Cues", location: "Auditorium" }
    ],
    saturdayPreShow: [
      { time: "4:00 PM", event: "Last Call", location: "Hotel Lobby" },
      { time: "4:05 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "4:25 PM", event: "Photo Shoot", location: "Outside Venue" }
    ],
    saturdayShow: [
      { time: "6:10 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "6:20 PM", event: "Dressing Room", location: "DR 1" },
      { time: "6:35 PM", event: "Hold", location: "Side Stage" },
      { time: "6:55 PM", event: "Team Performance", location: "Stage" },
      { time: "7:10 PM", event: "Post Performance", location: "Audience" }
    ],
    saturdayPostShow: {
      nonPlacing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:15 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "10:25 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "10:45 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:25 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ],
      placing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:45 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "11:05 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "11:25 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:35 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ]
    }
  },
  'Team 6': {
    isPublished: false,
    showOrder: null,
    friday: [
      { time: "11:55 AM", event: "Registration", location: "Oak Room" },
      { time: "2:40 PM", event: "Check-In", location: "Oak Room" },
      { time: "3:55 PM", event: "Dinner", location: "Team Rooms" },
      { time: "4:55 PM", event: "Mixer", location: "Garden Terrace" },
      { time: "7:55 PM", event: "Captains Meeting", location: "Near Room" },
      { time: "9:05 PM", event: "Post-Mixer Practice", location: "Teak Room" },
      { time: "10:10 PM", event: "Optional Practice", location: "Garden Terrace" }
    ],
    saturdayTech: [
      { time: "10:05 AM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "10:30 AM", event: "Stretching", location: "DR 2" },
      { time: "10:50 AM", event: "Hold", location: "Side Stage" },
      { time: "11:05 AM", event: "Tech Time (20 Mins)", location: "Stage" },
      { time: "11:40 AM", event: "Video Review (10 Mins)", location: "Viewing Room" },
      { time: "12:00 PM", event: "Post Tech", location: "Dance and Choral Hall" },
      { time: "12:25 PM", event: "Travel to Hotel", location: "Venue Lobby" },
      { time: "1:10 PM", event: "Captains Travel to Venue", location: "Hotel Lobby" },
      { time: "1:25 PM", event: "Lighting Cues", location: "Auditorium" }
    ],
    saturdayPreShow: [
      { time: "4:10 PM", event: "Last Call", location: "Hotel Lobby" },
      { time: "4:15 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "4:35 PM", event: "Photo Shoot", location: "Outside Venue" }
    ],
    saturdayShow: [
      { time: "6:25 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "6:35 PM", event: "Dressing Room", location: "DR 2" },
      { time: "6:50 PM", event: "Hold", location: "Side Stage" },
      { time: "7:10 PM", event: "Team Performance", location: "Stage" },
      { time: "7:25 PM", event: "Post Performance", location: "Audience" }
    ],
    saturdayPostShow: {
      nonPlacing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:15 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "10:25 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "10:45 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:25 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ],
      placing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:45 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "11:05 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "11:25 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:35 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ]
    }
  },
  'Team 7': {
    isPublished: false,
    showOrder: null,
    friday: [
      { time: "11:55 AM", event: "Registration", location: "Oak Room" },
      { time: "2:40 PM", event: "Check-In", location: "Oak Room" },
      { time: "3:55 PM", event: "Dinner", location: "Team Rooms" },
      { time: "4:55 PM", event: "Mixer", location: "Garden Terrace" },
      { time: "7:55 PM", event: "Captains Meeting", location: "Near Room" },
      { time: "9:40 PM", event: "Post-Mixer Practice", location: "Ebony Room" },
      { time: "10:30 PM", event: "Optional Practice", location: "Garden Terrace" }
    ],
    saturdayTech: [
      { time: "10:35 AM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "11:00 AM", event: "Stretching", location: "DR 1" },
      { time: "11:20 AM", event: "Hold", location: "Side Stage" },
      { time: "11:35 AM", event: "Tech Time (20 Mins)", location: "Stage" },
      { time: "12:10 PM", event: "Video Review (10 Mins)", location: "Viewing Room" },
      { time: "12:30 PM", event: "Post Tech", location: "Dance and Choral Hall" },
      { time: "12:55 PM", event: "Travel to Hotel", location: "Venue Lobby" },
      { time: "1:20 PM", event: "Captains Travel to Venue", location: "Hotel Lobby" },
      { time: "1:35 PM", event: "Lighting Cues", location: "Auditorium" }
    ],
    saturdayPreShow: [
      { time: "4:20 PM", event: "Last Call", location: "Hotel Lobby" },
      { time: "4:25 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "4:45 PM", event: "Photo Shoot", location: "Outside Venue" }
    ],
    saturdayShow: [
      { time: "6:40 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "6:50 PM", event: "Dressing Room", location: "DR 1" },
      { time: "7:05 PM", event: "Hold", location: "Side Stage" },
      { time: "7:25 PM", event: "Team Performance", location: "Stage" },
      { time: "7:40 PM", event: "Post Performance", location: "Audience" }
    ],
    saturdayPostShow: {
      nonPlacing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:15 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "10:25 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "10:45 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:25 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ],
      placing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:45 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "11:05 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "11:25 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:35 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ]
    }
  },
  'Team 8': {
    isPublished: false,
    showOrder: null,
    friday: [
      { time: "11:55 AM", event: "Registration", location: "Oak Room" },
      { time: "2:40 PM", event: "Check-In", location: "Oak Room" },
      { time: "3:55 PM", event: "Dinner", location: "Team Rooms" },
      { time: "4:55 PM", event: "Mixer", location: "Garden Terrace" },
      { time: "7:55 PM", event: "Captains Meeting", location: "Near Room" },
      { time: "9:40 PM", event: "Post-Mixer Practice", location: "Teak Room" },
      { time: "10:50 PM", event: "Optional Practice", location: "Garden Terrace" }
    ],
    saturdayTech: [
      { time: "11:05 AM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "11:30 AM", event: "Stretching", location: "DR 2" },
      { time: "11:50 AM", event: "Hold", location: "Side Stage" },
      { time: "12:05 PM", event: "Tech Time (20 Mins)", location: "Stage" },
      { time: "12:40 PM", event: "Video Review (10 Mins)", location: "Viewing Room" },
      { time: "1:00 PM", event: "Post Tech", location: "Dance and Choral Hall" },
      { time: "1:25 PM", event: "Travel to Hotel", location: "Venue Lobby" },
      { time: "1:30 PM", event: "Captains Travel to Venue", location: "Hotel Lobby" },
      { time: "1:45 PM", event: "Lighting Cues", location: "Auditorium" }
    ],
    saturdayPreShow: [
      { time: "4:30 PM", event: "Last Call", location: "Hotel Lobby" },
      { time: "4:35 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "4:55 PM", event: "Photo Shoot", location: "Outside Venue" }
    ],
    saturdayShow: [
      { time: "6:55 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "7:05 PM", event: "Dressing Room", location: "DR 2" },
      { time: "7:20 PM", event: "Hold", location: "Side Stage" },
      { time: "7:40 PM", event: "Team Performance", location: "Stage" },
      { time: "7:55 PM", event: "Post Performance", location: "Audience" }
    ],
    saturdayPostShow: {
      nonPlacing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:15 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "10:25 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "10:45 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:25 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ],
      placing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:45 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "11:05 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "11:25 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:35 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ]
    }
  }
};

export const INITIAL_SCHEDULE: Schedule = {
  isPublished: false,
  showOrder: null,
  friday: [],
  saturdayTech: [],
  saturdayPreShow: [],
  saturdayShow: [],
  saturdayPostShow: {
    placing: [],
    nonPlacing: []
  }
};

export const updateSchedule = (existingSchedule: Partial<Schedule> | undefined): Schedule => {
  const schedule = { ...INITIAL_SCHEDULE };
  
  if (!existingSchedule) return schedule;

  return {
    ...schedule,
    ...existingSchedule,
    saturdayPostShow: {
      ...schedule.saturdayPostShow,
      ...(existingSchedule.saturdayPostShow || {})
    }
  };
};

export const VENUE_INFO = {
  name: 'Marshall Family Performing Arts Center',
  address: '4141 Spring Valley Rd, Addison, TX 75001',
  seatingCapacity: '600 seat auditorium'
} as const;

export const HOTEL_INFO = {
  name: 'DoubleTree by Hilton Hotel Dallas',
  address: '4099 Valley View Ln, Dallas, TX 75244'
} as const;

export const TECH_INFO = {
  danceableSpace: "42' x 28'",
  backdropSpace: '4 ft',
  apronSpace: '4 ft',
  propsBox: '7ft (length) x 5ft (depth) x 10ft (height)',
  additionalNotes: '*There will be NO RIGGING this year at Marshall Arts Center*'
} as const;

export const INITIAL_LIAISONS = {
  texas: [
    { name: 'Dev Patel', phone: '972.258.4904' },
    { name: 'Srinidhi Vijayaraghavan', phone: '469.748.6923' },
    { name: 'Shreya Ravi', phone: '214.437.4286' }
  ],
  ucsd: [
    { name: 'Aanshi Shah', phone: '469.525.3956' },
    { name: 'Tisha Chhatbar', phone: '469.468.7617' },
    { name: 'Sahya Punati', phone: '925.819.8231' }
  ],
  uf: [
    { name: 'Svayam Sharma', phone: '972.510.7638' },
    { name: 'Omisha Cherala', phone: '805.657.4013' },
    { name: 'Rhea Sayani', phone: '214.972.7365' },
    { name: 'Lahek Patel', phone: '346.888.9482'}
  ],
  washu: [
    { name: 'Prajna Premnath', phone: '469.486.2118' },
    { name: 'Hemangi Swaroop', phone: '484.223.5587' },
    { name: 'Nishtha Gajera', phone: '469.714.5161' }
  ],
  uw: [
    { name: 'Misha Patel', phone: '469.834.7200' },
    { name: 'Paramveer Grewal', phone: '713.742.3877' },
    { name: 'Dhwani Patel', phone: '512.784.1690' }
  ],
  michigan: [
    { name: 'Satya Rallabandi', phone: '214.897.1156' },
    { name: 'Marvel Patel', phone: '469.720.5458' },
    { name: 'Sherley Sawant', phone: '682.472.2366' }
  ],
  tamu: [
    { name: 'Divya Patel', phone: '936.232.8316' },
    { name: 'Shreejha Sureshkumar', phone: '801.865.1989' },
    { name: 'Rithika Shenoy', phone: '512.810.4858' }
  ],
  uiuc: [
    { name: 'Fagun ShahB', phone: '281.714.1028' },
    { name: 'Krisha Nashte', phone: '469.618.4225' },
    { name: 'Anika Kallam', phone: '469.900.7728' }
  ]
} as const;

export const createInitialTeamData = (teamId: TeamId): TeamInfo => ({
  displayName: TEAM_DISPLAY_NAMES[teamId],
  announcements: [],
  information: {
    liaisons: INITIAL_LIAISONS[teamId].map((liaison) => ({ ...liaison })),
    tech: { ...TECH_INFO },
    venue: { ...VENUE_INFO },
    hotel: { ...HOTEL_INFO },
  },
  techVideo: {
    title: 'Tech Time Video',
    youtubeUrl: '',
    driveUrl: '',
    description: '',
    isPublished: false,
  },
  schedule: {
    ...INITIAL_SCHEDULE,
    friday: [],
    saturdayTech: [],
    saturdayPreShow: [],
    saturdayShow: [],
    saturdayPostShow: { placing: [], nonPlacing: [] },
  },
  nearbyLocations: [],
});

export const initializeTeamData = async () => {
  try {
    for (const teamId of TEAM_IDS) {
      const teamRef = ref(db, `teams/${teamId}`);
      const snapshot = await get(teamRef);
      
      if (!snapshot.exists()) {
        await set(teamRef, createInitialTeamData(teamId));
        console.log(`Initialized data for team: ${TEAM_DISPLAY_NAMES[teamId]}`);
      }
    }
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};
