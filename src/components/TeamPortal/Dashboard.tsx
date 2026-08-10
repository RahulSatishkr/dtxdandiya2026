import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, set, push, serverTimestamp } from 'firebase/database';
import { db } from '../../config';
import type { TeamInfo } from '../../types/team';
import { INITIAL_JUDGES_SCHEDULE, type JudgesSchedule } from '../../config/judgesSchedule';
import { createInitialTeamData } from '../../config/initializeDatabase';
import { FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

type TabType = 'announcements' | 'information' | 'tech-time-video' | 'schedule' | 'report';
type DashboardTeamId = string | 'admin' | 'judge' | 'reps';
type UserType = 'team' | 'judge' | 'reps' | 'liaison';

interface TabConfig {
  key: TabType;
  label: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [teamId, setTeamId] = useState<DashboardTeamId | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('announcements');
  const [scheduleData, setScheduleData] = useState<TeamInfo['schedule'] | null>(null);
  const [reportForm, setReportForm] = useState({ description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userType, setUserType] = useState<UserType>('team');
  const [judgesScheduleData, setJudgesScheduleData] = useState<JudgesSchedule>(INITIAL_JUDGES_SCHEDULE);
  const isTeamPortalUser = userType === 'team' || userType === 'liaison';

  // Hogwarts House Assignment mapping for team portals
  const hogwartsAssignments: { [key: string]: string } = {
    tamu: 'Tennis',
    texas: 'Golf',
    michigan: 'Court',
    uf: 'Pickleball',
    uiuc: 'Squash',
    uw: 'Swimming',
    washu: 'Badminton',
    ucsd: 'Croquet'
  };

  const hogwartsHouse = teamId && hogwartsAssignments[teamId];

  let houseColorClass = '';
  if (hogwartsHouse === 'Ravenclaw') {
    houseColorClass = 'bg-blue-600';
  } else if (hogwartsHouse === 'Slytherin') {
    houseColorClass = 'bg-green-600';
  } else if (hogwartsHouse === 'Hufflepuff') {
    houseColorClass = 'bg-yellow-600';
  } else if (hogwartsHouse === 'Gryffindor') {
    houseColorClass = 'bg-red-600';
  }

  // Static schedule data for judges and reps
  const repsScheduleData = {
    friday: [
      { event: "Check-in/Registration", location: "Lobby", time: "12:00 PM - 3:00 PM" },
      { event: "Dinner", location: "Lobby", time: "4:00 PM" },
      { event: "Mixer", location: "Ballroom", time: "5:15 PM" },
      { event: "Go Out", location: "Downtown", time: "8:00 PM" },
    ],
    saturday: [
      { event: "Breakfast", location: "Lobby", time: "7:00 AM" },
      { event: "Props Setup", location: "Venue", time: "5:30 AM - 8:00 AM" },
      { event: "Props Cleanup", location: "Venue", time: "8:00 AM" },
      { event: "Tech Time", location: "Venue", time: "8:40 AM" },
      { event: "Mock Deliberations", location: "Boardroom", time: "11:00 AM" },
      { event: "Lunch", location: "During/After Deliberations", time: "2:00 PM" },
      { event: "Rep/Judges Photos", location: "Venue", time: "3:40 PM" },
      { event: "Show", location: "Venue", time: "5:30 PM" },
      { event: "Show Deliberations", location: "Venue Viewing Room", time: "8:00 PM" },
      { event: "Judges Meeting/Dinner", location: "RAS Rep Hotel Room", time: "10:00 PM" },
      { event: "After Party", location: "The Reserve", time: "11:00 PM" }
    ]
  };

  useEffect(() => {
    const storedTeam = sessionStorage.getItem("team") as DashboardTeamId | null;
    const storedRole = sessionStorage.getItem('portalRole') as UserType | null;
    
    if (!storedTeam) {
      console.log('No team stored, redirecting to login');
      navigate("/team-portal/login");
      return;
    }

    setTeamId(storedTeam);
    
    // Determine user type
    if (storedTeam === 'judge') {
      setUserType('judge');
    } else if (storedTeam === 'reps') {
      setUserType('reps');
    } else {
      setUserType(storedRole === 'liaison' ? 'liaison' : 'team');
      if (storedTeam === 'texas') {
        const texasFallback = createInitialTeamData('texas') as TeamInfo;
        setActiveTab('information');
        setTeamInfo(texasFallback);
        setScheduleData(texasFallback.schedule);
      }
      // Only fetch from Firebase for actual teams
    const teamRef = ref(db, `teams/${storedTeam}`);
    const unsubscribe = onValue(teamRef, (snapshot) => {
      if (snapshot.exists()) {
          const data = snapshot.val() as Partial<TeamInfo>;
          if (storedTeam === 'texas') {
            const fallback = createInitialTeamData('texas') as TeamInfo;
            const resolvedData: TeamInfo = {
              ...fallback,
              ...data,
              announcements: data.announcements || fallback.announcements,
              information: {
                ...fallback.information,
                ...data.information,
                liaisons: data.information?.liaisons || fallback.information.liaisons,
                tech: { ...fallback.information.tech, ...data.information?.tech },
                venue: { ...fallback.information.venue, ...data.information?.venue },
                hotel: { ...fallback.information.hotel, ...data.information?.hotel },
              },
              techVideo: { ...fallback.techVideo, ...data.techVideo },
              schedule: {
                ...fallback.schedule,
                ...data.schedule,
                saturdayPostShow: {
                  ...fallback.schedule.saturdayPostShow,
                  ...data.schedule?.saturdayPostShow,
                },
              },
              nearbyLocations: data.nearbyLocations || fallback.nearbyLocations,
            };
            setTeamInfo(resolvedData);
            setScheduleData(resolvedData.schedule);
          } else {
            setTeamInfo(data as TeamInfo);
            setScheduleData(data.schedule || null);
          }
      } else if (storedTeam === 'texas') {
          const texasData = createInitialTeamData('texas') as TeamInfo;
          setTeamInfo(texasData);
          setScheduleData(texasData.schedule);
      }
      }, (error) => {
        console.error('Error loading team data:', error);
    });

    return () => unsubscribe();
    }
  }, [navigate]);

  useEffect(() => {
    const judgesScheduleRef = ref(db, 'portalSchedules/judges');
    return onValue(judgesScheduleRef, (snapshot) => {
      if (snapshot.exists()) {
        setJudgesScheduleData(snapshot.val() as JudgesSchedule);
      }
    });
  }, []);

  // Move debug logging to a separate effect
  useEffect(() => {
    if (activeTab === 'schedule' && teamInfo) {
      console.log('Schedule tab active, current team info:', teamInfo);
      console.log('Schedule data:', teamInfo.schedule);
      console.log('Schedule published:', teamInfo.schedule?.isPublished);
      console.log('Show order:', teamInfo.schedule?.showOrder);
    }
  }, [activeTab, teamInfo]);

  const renderScheduleSection = (
    title: string,
    events: Array<{ time: string; event: string; location: string }> | undefined
  ) => {
    if (!events || events.length === 0) {
      return null;
    }

    return (
      <div className="mb-12">
        <h3 className="text-xl sm:text-2xl font-cormorant text-white mb-8 px-1">{title}</h3>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-[15px] sm:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-blue-500/50">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-500/30 backdrop-blur-sm border border-blue-500"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-500/30 backdrop-blur-sm border border-blue-500"></div>
          </div>

          <div className="space-y-8 relative">
            {events.map((event, index) => (
              <div 
                key={index} 
                className={`relative flex items-center gap-8 ${
                  index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-[14px] sm:left-1/2 top-1/2 -translate-y-1/2 sm:-translate-x-1/2 w-4 h-4">
                  <div className="absolute inset-0 rounded-full bg-blue-500 animate-pulse"></div>
                  <div className="absolute inset-[2px] rounded-full bg-black"></div>
                  <div className="absolute inset-[3px] rounded-full bg-blue-500"></div>
                </div>

                {/* Time Badge */}
                <div className={`hidden sm:flex w-32 ${
                  index % 2 === 0 ? 'justify-end' : 'justify-start'
                }`}>
                  <div className="px-3 py-1 rounded-full bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 text-blue-300 font-medium font-cormorant">
                    {event.time}
                  </div>
                </div>

                {/* Event Card */}
                <div className={`ml-8 sm:ml-0 flex-1 max-w-lg ${
                  index % 2 === 0 ? 'sm:mr-[calc(50%+2rem)]' : 'sm:ml-[calc(50%+2rem)]'
                }`}>
                  <div className="group relative p-4 bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
                    {/* Mobile Time Badge */}
                    <div className="sm:hidden mb-2 inline-block px-3 py-1 rounded-full bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 text-blue-300 font-medium font-cormorant">
                      {event.time}
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-white font-cormorant text-lg group-hover:text-blue-300 transition-colors">
                        {event.event}
                      </h4>
                      <p className="text-blue-200/80 text-2x1 font-cormorant">
                        {event.location}
                      </p>
                    </div>

                    {/* Decorative Corner */}
                    <div className="absolute -top-px -right-px w-4 h-4 rounded-br-xl border-r border-t border-blue-500/30 group-hover:border-blue-500/60 transition-colors"></div>
                    <div className="absolute -bottom-px -left-px w-4 h-4 rounded-tl-xl border-l border-b border-blue-500/30 group-hover:border-blue-500/60 transition-colors"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderJudgeScheduleSection = (
    title: string,
    events: Array<{ time: string; event: string; location: string }>
  ) => (
    <section className="judge-schedule-day">
      <header className="judge-schedule-heading">
        <h3>{title}</h3>
        <span>{events.length} events</span>
      </header>
      <ol className="judge-schedule-list">
        {events.map((item) => (
          <li key={`${title}-${item.time}-${item.event}`} className="judge-schedule-row">
            <time>{item.time}</time>
            <span className="judge-schedule-marker" aria-hidden="true" />
            <div>
              <h4>{item.event}</h4>
              <p>{item.location}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );

  const renderSchedule = () => {
    if (isTeamPortalUser) {
      // Existing team schedule rendering logic
      if (!scheduleData) {
        return (
          <div className="p-6 bg-blue-900/10 backdrop-blur-sm rounded-xl border border-blue-500/20">
            <p className="text-blue-200/80 text-center font-cormorant">Schedule will be available soon.</p>
          </div>
        );
      }

      if (!scheduleData.isPublished) {
        return (
          <div className="p-6 bg-blue-900/10 backdrop-blur-sm rounded-xl border border-blue-500/20">
            <p className="text-blue-200/80 text-center font-cormorant">Schedule will be available soon.</p>
          </div>
        );
      }

      if (!scheduleData.showOrder) {
        return (
          <div className="p-6 bg-blue-900/10 backdrop-blur-sm rounded-xl border border-blue-500/20">
            <p className="text-blue-200/80 text-center font-cormorant">Schedule has not been assigned yet.</p>
          </div>
        );
      }

      return (
        <div className="space-y-8">
          <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl border border-blue-500/20">
            <p className="text-2xl sm:text-3xl text-white font-cormorant text-center">
              Performance Order: {scheduleData.showOrder}
            </p>
          </div>
          {renderScheduleSection("Friday", scheduleData.friday)}
          {renderScheduleSection("Saturday Tech Time", scheduleData.saturdayTech)}
          {renderScheduleSection("Saturday Pre-Show", scheduleData.saturdayPreShow)}
          {renderScheduleSection("Saturday Show", scheduleData.saturdayShow)}
          {scheduleData.saturdayPostShow && (
            <>
              {renderScheduleSection("Saturday Post-Show (Non-Placing)", scheduleData.saturdayPostShow.nonPlacing)}
              {renderScheduleSection("Saturday Post-Show (Placing)", scheduleData.saturdayPostShow.placing)}
            </>
          )}
        </div>
      );
    } else if (userType === 'judge') {
      return (
        <div className="judge-schedule">
          <div className="judge-schedule-intro">
            <p className="judge-eyebrow">Competition weekend</p>
            <h2>Judges Schedule</h2>
            <p>All times are local. Please arrive a few minutes before each scheduled activity.</p>
          </div>
          <div className="judge-schedule-days">
            {renderJudgeScheduleSection("Friday", judgesScheduleData.friday)}
            {renderJudgeScheduleSection("Saturday", judgesScheduleData.saturday)}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {renderScheduleSection("Friday", repsScheduleData.friday)}
        {renderScheduleSection("Saturday", repsScheduleData.saturday)}
      </div>
    );
  };

  const handleLogout = () => {
    sessionStorage.removeItem("team");
    sessionStorage.removeItem('portalRole');
    navigate("/team-portal/login");
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.description.trim()) return;

    setIsSubmitting(true);
    try {
      const reportsRef = ref(db, 'reports');
      const newReportRef = push(reportsRef);
      await set(newReportRef, {
        description: reportForm.description,
        timestamp: serverTimestamp(),
        teamId: teamId
      });
      
      toast.success('Report submitted successfully');
      setReportForm({ description: '' });
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get available tabs based on user type
  const getAvailableTabs = (): TabConfig[] => {
    if (userType === 'team') {
      return [
        { key: 'announcements', label: 'Announcements' },
        { key: 'information', label: 'Information' },
        { key: 'tech-time-video', label: 'Tech Time Video' },
        { key: 'schedule', label: 'Schedule' },
        { key: 'report', label: 'Report' }
      ];
    } else if (userType === 'liaison') {
      return [
        { key: 'announcements', label: 'Announcements' },
        { key: 'information', label: 'Information' },
        { key: 'tech-time-video', label: 'Tech Time Video' },
        { key: 'schedule', label: 'Schedule' },
      ];
    } else {
      return [
        { key: 'information', label: 'Information' },
        { key: 'schedule', label: 'Schedule' }
      ];
    }
  };

  // Get header title based on user type
  const getHeaderTitle = () => {
    if (isTeamPortalUser && teamInfo?.displayName) {
      return teamInfo.displayName;
    } else if (userType === 'judge') {
      return 'Judges Portal';
    } else if (userType === 'reps') {
      return 'Representatives Portal';
    }
    return '';
  };

  const renderInformationTab = () => {
    if (userType === 'reps') {
      return (
        <div className="space-y-8">
          {/* Reps Information Section */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-500/20">
            <h3 className="text-xl sm:text-2xl font-cormorant text-white mb-4">Reps Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 2a1 1 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v12a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2h2V2zm8 2H7V2h6v2zm1 2H6v12h8V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Props Boxes</h4>
                  <p className="text-white font-sans">Props Boxes are in permanent places</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Props Setup Measurement</h4>
                  <p className="text-white font-sans">DTX Directors/Logs will provide tech reps with a measuring tape at the venue during props setup to check prop box dimensions</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Extension Cables</h4>
                  <p className="text-white font-sans">Extension cables for teams will NOT be provided</p>
                </div>
              </div>

              {/* Schedule Links Section */}
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Schedule Links</h4>
                  <div className="space-y-1">
                    <a 
                      href="https://docs.google.com/spreadsheets/d/11ytMeEyOhhEabiAevLSC23Do-ef0figqto6gh3UKp-8/edit?usp=sharing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-white hover:text-blue-300 font-sans text-sm transition-colors flex items-center gap-1"
                    >
                      Master Schedule
                      <FaExternalLinkAlt className="text-xs" />
                    </a>
                    <a 
                      href="https://docs.google.com/spreadsheets/d/1O9vJkks8azyS_EtfZdqhKAp3xnrw-GwZRijVF3U14qE/edit?usp=drivesdk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-white hover:text-blue-300 font-sans text-sm transition-colors flex items-center gap-1"
                    >
                      Transportation Schedule
                      <FaExternalLinkAlt className="text-xs" />
                    </a>
                    <a 
                      href="https://docs.google.com/spreadsheets/d/1tiEEU1NxE6ESQepGqpQJiKClk4wmeuZmCeCdvFwNrwQ/edit?usp=drivesdk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-white hover:text-blue-300 font-sans text-sm transition-colors flex items-center gap-1"
                    >
                      Board Schedule
                      <FaExternalLinkAlt className="text-xs" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tech Information Section */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-500/20">
            <h3 className="text-xl sm:text-2xl font-cormorant text-white mb-4">General Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Danceable Space</h4>
                  <p className="text-white font-sans">42' x 28'</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Backdrop Space</h4>
                  <p className="text-white font-sans">4 ft</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Apron Space</h4>
                  <p className="text-white font-sans">4 ft</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Stage Props Dimensions</h4>
                  <p className="text-white font-sans">42" x 4"</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Prop Box Size</h4>
                  <p className="text-white font-sans">10ft (Length) x 10ft (Width) x 10ft (Height)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H7a1 1 0 00-1 1v2a1 1 0 01-1-1V4zm3 1h6v7H7V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Info Packet</h4>
                  <a 
                    href="https://docs.google.com/document/d/1GQUVDQqxsWHZwS1oQtvnx7dhFsoDwt-S-NU2hYmMzVo/edit?usp=drive_link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-blue-300 font-sans transition-colors flex items-center gap-1"
                  >
                    View Document
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                </div>
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-200 text-sm">*There will be NO RIGGING this year at Marshall Arts Center*</p>
              </div>
            </div>
          </div>

          {/* Tech Time Flow Section */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-500/20">
            <h3 className="text-xl sm:text-2xl font-cormorant text-white mb-4">Tech Time Flow</h3>
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg border border-blue-500/20">
              <img
                src="/assets/reps/techtime_flow.pdf"
                alt="Tech Time Flow"
                className="absolute top-0 left-0 w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Show Flow Section */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-500/20">
            <h3 className="text-xl sm:text-2xl font-cormorant text-white mb-4">Show Flow</h3>
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg border border-blue-500/20">
              <img
                src="/assets/reps/show_flow.pdf"
                alt="Show Flow"
                className="absolute top-0 left-0 w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Existing sections */}
          {renderVenueInfoSection()}
          {renderHotelInfoSection()}
          {renderLivestreamSection()}
          {renderNearbyPlacesSection()}
        </div>
      );
    }

    if (userType === 'judge') {
      const judgeHighlights = [
        { label: 'Check-in', day: 'Friday', time: '12:00–3:00 PM', dateTime: '2027-02-05T12:00:00-06:00', detail: 'Hotel Lobby' },
        { label: 'Showtime', day: 'Saturday', time: '5:30 PM', dateTime: '2027-02-06T17:30:00-06:00', detail: 'Marshall Arts Center' },
        { label: 'Judges Meeting', day: 'Saturday', time: '10:00 PM', dateTime: '2027-02-06T22:00:00-06:00', detail: 'Judges Room' },
      ];

      return (
        <div className="judge-information space-y-8">
          <section className="judge-briefing">
            <div className="judge-briefing-copy">
              <span className="judge-eyebrow">DTX Dandiya 2027</span>
              <h2>Judges Information</h2>
              <p>Everything you need for competition weekend, including key times, venue details, and hotel information.</p>
            </div>
          </section>

          <section className="judge-timeline" aria-label="Judge schedule timeline">
            {judgeHighlights.map((item) => (
              <article key={item.label} className="judge-timeline-event">
                <span className="judge-timeline-dot" aria-hidden="true" />
                <div className="judge-timeline-content">
                  <p className="judge-card-label">{item.label}</p>
                  <h3>
                    <span>{item.day}</span>
                    <time dateTime={item.dateTime}>{item.time}</time>
                  </h3>
                  <p className="judge-card-detail">{item.detail}</p>
                </div>
              </article>
            ))}
          </section>

          <section className="judge-info-grid">
            {renderVenueInfoSection()}
            {renderHotelInfoSection()}
          </section>

          <section className="judge-nearby-section">
            {renderNearbyPlacesSection(true)}
          </section>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Team information overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-500/20">
            <h3 className="text-xl sm:text-2xl font-cormorant text-white mb-4">General Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Danceable Space</h4>
                  <p className="text-white font-sans">42' x 28'</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Backdrop Space</h4>
                  <p className="text-white font-sans">4 ft</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Stage Props Dimensions</h4>
                  <p className="text-white font-sans">42" x 4"</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Prop Box Size</h4>
                  <p className="text-white font-sans">10ft (Length) x 10ft (Width) x 10ft (Height)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H7a1 1 0 00-1 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm3 1h6v7H7V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Info Packet</h4>
                  <a 
                    href="https://docs.google.com/document/d/1GQUVDQqxsWHZwS1oQtvnx7dhFsoDwt-S-NU2hYmMzVo/edit?usp=drive_link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-blue-300 font-sans transition-colors flex items-center gap-1"
                  >
                    View Document
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                </div>
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-200 text-sm">*There will be NO RIGGING this year at Marshall Arts Center*</p>
              </div>
            </div>
            </div>
            {renderVenueInfoSection()}
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-red-500/25 bg-red-950/20 p-4 sm:p-5">
              <h3 className="text-lg sm:text-xl font-cormorant text-white">
                Here’s the livestream link to share with your family and friends
              </h3>
              <a
                href="https://www.youtube.com/live/M6yG0KuC7gw?si=5mOY4XecCcl2sc5j"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block break-all text-sm text-red-300 underline decoration-red-500/40 underline-offset-4 hover:text-red-200 font-sans"
              >
                https://www.youtube.com/live/M6yG0KuC7gw?si=5mOY4XecCcl2sc5j
              </a>
            </div>

            {isTeamPortalUser && teamInfo?.information?.liaisons && (
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-500/20">
                <h3 className="text-xl sm:text-2xl font-cormorant text-white mb-4">Liaisons Information</h3>
                <div className="space-y-3">
                  {teamInfo.information.liaisons.map((liaison, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-blue-500/5 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-medium font-sans truncate">{liaison.name}</p>
                        {liaison.phone && (
                          <a
                            href={`tel:${liaison.phone.replace(/[^0-9]/g, '')}`}
                            className="text-blue-300 hover:text-blue-200 transition-colors flex items-center gap-2 text-sm font-sans"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            {liaison.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {renderHotelInfoSection()}
          </div>
        </div>

      </div>
    );
  };

  const renderContent = () => {
    if (isTeamPortalUser && !teamInfo) {
      return null;
    }

    const renderAnnouncementsTab = () => {
      if (!isTeamPortalUser || !teamInfo) return null;
      return (
        <div>
          <h2 className="text-3xl sm:text-4xl font-cormorant text-white mb-4 sm:mb-6">Announcements</h2>
          <div className="space-y-3 sm:space-y-4">
            {teamInfo.announcements?.length > 0 ? (
              teamInfo.announcements.map((announcement) => (
                <div key={announcement.id} className="p-4 sm:p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/20">
                  <h3 className="text-lg sm:text-xl font-cormorant text-white mb-2">{announcement.title}</h3>
                  <p className="text-blue-200/80 whitespace-pre-wrap font-sans mb-3 sm:mb-4">{announcement.content}</p>
                  <p className="text-xs sm:text-sm text-blue-200/60 font-sans">
                    Posted: {new Date(announcement.timestamp).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-blue-200/60 font-sans text-center py-4">No announcements at this time.</p>
            )}
          </div>
        </div>
      );
    };

    const renderTechVideoTab = () => {
      if (!isTeamPortalUser || !teamInfo) return null;
      return (
        <div className="tech-video-page">
          <header>
            <h2>Tech Time Video</h2>
            <p>Review your team’s recording in Google Drive at its original uploaded quality.</p>
          </header>
          {teamInfo.techVideo?.isPublished && teamInfo.techVideo.driveUrl ? (
            <div className="tech-video-resource">
              <div>
                <p className="tech-video-label">Google Drive</p>
                <h3>Your team recording</h3>
                <p>Open the file to watch it in Drive or download the original video for a closer review.</p>
              </div>
                <a
                  href={teamInfo.techVideo.driveUrl.startsWith('http') ? teamInfo.techVideo.driveUrl : `https://${teamInfo.techVideo.driveUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tech-video-link"
                >
                  <span>View or Download Video</span>
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M14 5l7 7m0 0l-7 7m7-7H3" 
                    />
                  </svg>
                </a>
            </div>
          ) : (
            <div className="tech-video-empty">
              <p>Your team’s recording will appear here when it is ready.</p>
            </div>
          )}
        </div>
      );
    };

    const renderReportTab = () => {
      if (userType !== 'team') return null;
      return (
        <div className="report-page">
          <header className="report-header">
            <h2>Anonymous Report</h2>
            <p>Use this form to share a concern, report an incident, or provide feedback to the DTX Dandiya Directors.</p>
          </header>

          <div className="report-card">
            <div className="report-privacy-note">
              <div>
                <strong>About your privacy</strong>
                <p>No name, email, or contact information is requested. Reports are reviewed only by DTX Dandiya Directors.</p>
              </div>
            </div>

            <form onSubmit={handleReportSubmit} className="report-form">
                <div className="report-field">
                  <label htmlFor="description">Report details</label>
                  <textarea
                    id="description"
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ description: e.target.value })}
                    placeholder="Provide as much detail as you feel comfortable sharing."
                    maxLength={3000}
                    required
                  />
                </div>

                <div className="report-actions">
                  <p>{reportForm.description.length} / 3000 characters · Reports cannot be edited after submission.</p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Report
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
            </form>
          </div>
        </div>
      );
    };

    const getTabContent = () => {
      switch (activeTab) {
        case 'announcements':
          return renderAnnouncementsTab();
        case 'information':
          return renderInformationTab();
        case 'tech-time-video':
          return renderTechVideoTab();
        case 'schedule':
          return (
            <div>
              <h2 className="text-3xl sm:text-4xl font-cormorant text-white mb-4 sm:mb-6"
              style={{ wordSpacing: '0.1em' }}>
                Schedule
              </h2>
              {renderSchedule()}
            </div>
          );
        case 'report':
          return renderReportTab();
        default:
          return null;
      }
    };

    return (
      <div className="space-y-6 sm:space-y-8">
        {getTabContent()}
      </div>
    );
  };

  const renderVenueInfoSection = () => (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-500/20">
      <h3 className="text-xl sm:text-2xl font-cormorant text-white mb-4">Venue Information</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H7a1 1 0 00-1 1v2a1 1 0 01-1-1V4zm3 1h6v7H7V5z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-blue-300 text-sm font-sans font-medium">Name</h4>
            <p className="text-white font-sans">Marshall Family Performing Arts Center</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-blue-500/5 rounded-lg">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-blue-300 text-sm font-sans font-medium">Address</h4>
            <p className="text-white font-sans mb-2">4141 Spring Valley Rd, Addison, TX 75001</p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=4141+Spring+Valley+Rd+Addison+TX+75001"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-200 text-sm"
            >
              View in Google Maps
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHotelInfoSection = () => (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-500/20">
      <h3 className="text-xl sm:text-2xl font-cormorant text-white mb-4">Hotel Information</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </div>
          <div>
            <h4 className="text-blue-300 text-sm font-sans font-medium">Name</h4>
            <p className="text-white font-sans">Holiday Inn Express & Suites North Dallas at Preston by IHG</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-blue-500/5 rounded-lg">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-blue-300 text-sm font-sans font-medium">Address</h4>
            <p className="text-white font-sans mb-2">6055 Lyndon B Johnson Fwy, Dallas, TX 75240</p>
            <a
              href="https://maps.app.goo.gl/RBzNfqZZ96uKBRxEA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-200 text-sm"
            >
              View in Google Maps
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLivestreamSection = () => (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-500/20">
      <h3 className="text-xl sm:text-2xl font-cormorant text-white mb-4">Livestream</h3>
      <div className="space-y-4">
        <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg border border-blue-500/20">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src="https://www.youtube.com/live/M6yG0KuC7gw?si=5mOY4XecCcl2sc5j" 
            title="DTX Dandiya 2026 Livestream"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );

  const renderNearbyPlacesSection = (hidePropRepair = false) => (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
      <h3 className="text-xl sm:text-2xl font-cormorant text-white mb-6">Nearby Places</h3>
      <div className="space-y-6">
        <div>
          <h4 className="text-xl font-cormorant text-white mb-4">Food Options</h4>
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <FaMapMarkerAlt className="text-blue-300 mt-1 flex-shrink-0" />
              <div>
                <p className="text-white font-sans">Chick-fil-A</p>
                <a 
                  href="https://maps.google.com/?q=13347+Montfort+Dr,+Dallas,+TX+75240"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 text-sm font-sans flex items-center gap-1"
                >
                  13347 Montfort Dr, Dallas, TX 75240
                  <FaExternalLinkAlt className="text-xs" />
                </a>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <FaMapMarkerAlt className="text-blue-300 mt-1 flex-shrink-0" />
              <div>
                <p className="text-white font-sans">In-N-Out Burger</p>
                <a 
                  href="https://maps.google.com/?q=7940+Belt+Line+Rd,+Dallas,+TX+75254"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 text-sm font-sans flex items-center gap-1"
                >
                  7940 Belt Line Rd, Dallas, TX 75254
                  <FaExternalLinkAlt className="text-xs" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {!hidePropRepair && <div>
          <h4 className="text-xl font-cormorant text-white mb-4">Prop Repair Places</h4>
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <FaMapMarkerAlt className="text-blue-300 mt-1 flex-shrink-0" />
              <div>
                <p className="text-white font-sans">At Home</p>
                <a 
                  href="https://maps.google.com/?q=13710+Dallas+Pkwy,+Dallas,+TX+75240"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 text-sm font-sans flex items-center gap-1"
                >
                  13710 Dallas Pkwy, Dallas, TX 75240
                  <FaExternalLinkAlt className="text-xs" />
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <FaMapMarkerAlt className="text-blue-300 mt-1 flex-shrink-0" />
              <div>
                <p className="text-white font-sans">Hobby Lobby</p>
                <a 
                  href="https://maps.google.com/?q=14555+Dallas+Pkwy,+Dallas,+TX+75254"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 text-sm font-sans flex items-center gap-1"
                >
                  14555 Dallas Pkwy, Dallas, TX 75254
                  <FaExternalLinkAlt className="text-xs" />
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <FaMapMarkerAlt className="text-blue-300 mt-1 flex-shrink-0" />
              <div>
                <p className="text-white font-sans">Joann Fabrics and Crafts</p>
                <a 
                  href="https://maps.google.com/?q=13710+Dallas+Pkwy,+Dallas,+TX+75240"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 text-sm font-sans flex items-center gap-1"
                >
                  13710 Dallas Pkwy, Dallas, TX 75240
                  <FaExternalLinkAlt className="text-xs" />
                </a>
              </div>
            </div>
          </div>
        </div>}
      </div>
    </div>
  );

  if (!teamId || (isTeamPortalUser && !teamInfo)) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-black relative overflow-hidden ${teamId === 'texas' ? 'texas-team-portal' : ''}`}>
      <Toaster position="top-right" />
      
      {/* Background Effects */}
      {teamId !== 'texas' && <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-950/30 via-black to-black">
          <div className="absolute inset-0" 
            style={{
              background: `
                radial-gradient(circle at 20% 30%, rgba(141, 0, 23, 0.18), transparent 70%),
                radial-gradient(circle at 80% 70%, rgba(239, 35, 60, 0.1), transparent 70%)
              `
            }}
          />
        </div>
      </div>}

      <div className="relative z-10 container mx-auto px-3 sm:px-4 py-8 sm:py-12">
        {/* Header */}
        <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 sm:mb-12 ${teamId === 'texas' ? 'texas-dashboard-header' : ''}`}>
          <div className="flex flex-col items-center sm:items-start gap-2">
            {teamId === 'texas' ? (
              <div className="texas-brand-lockup">
                <img src="/assets/team/dsd-logo.png" alt="Dirty South Dandiya logo" />
                <div className="texas-portal-brand text-left">
                  <p>Texas Team Portal</p>
                  <h1>Dirty South Dandiya</h1>
                </div>
              </div>
            ) : (
              <h1 className="text-4xl md:text-5xl font-cormorant text-white glow-text-intense text-center sm:text-left">
                {getHeaderTitle()}
              </h1>
            )}
            {teamId !== 'texas' && userType === 'team' && hogwartsHouse && (
              <div className={`${houseColorClass} bg-opacity-40 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-white/20 shadow-lg transform hover:scale-105 transition-all duration-300`}>
                <span className="text-xl font-cormorant text-white">Country Club: {hogwartsHouse}</span>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-white font-cormorant hover:bg-blue-500/20 transition-all duration-300"
          >
            Logout
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row border-b border-blue-500/30">
            {getAvailableTabs().map((tab) => (
            <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 sm:py-2 font-cormorant text-lg sm:text-base transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-blue-500/20 sm:bg-transparent border-b-2 border-blue-500 text-white'
                    : 'text-blue-200/60 hover:text-white hover:bg-blue-500/10 sm:hover:bg-transparent'
                }`}
              >
                {tab.label}
            </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
} 
