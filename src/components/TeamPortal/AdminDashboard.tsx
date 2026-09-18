import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { ref, onValue, update, get, set } from 'firebase/database';
import { TEAM_DISPLAY_NAMES, INITIAL_LIAISONS, GENERIC_SCHEDULES, INITIAL_SCHEDULE, createInitialTeamData } from '../../config/initializeDatabase';
import type { TeamInfo, TeamId, DashboardTeamId, Schedule, ScheduleEvent } from '../../types/team';
import { INITIAL_JUDGES_SCHEDULE, type JudgesSchedule } from '../../config/judgesSchedule';
import { FiEdit2, FiTrash2, FiSend, FiAlertCircle, FiCheck, FiX, FiEye, FiChevronUp, FiChevronDown, FiPlus, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaExternalLinkAlt } from 'react-icons/fa';

interface AnnouncementFormData {
  id?: string;
    title: string;
    content: string;
  isEditing?: boolean;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'announcements' | 'information' | 'tech-time-video' | 'schedule' | 'reports' | 'applications'>('announcements');
  const [teamData, setTeamData] = useState<Record<TeamId, TeamInfo>>(() => ({
    texas: createInitialTeamData('texas') as TeamInfo,
  } as Record<TeamId, TeamInfo>));
  const [selectedTeams, setSelectedTeams] = useState<TeamId[]>([]);
  const [updateMessage, setUpdateMessage] = useState<string>('');
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
  const [announcementForm, setAnnouncementForm] = useState<AnnouncementFormData>({
    title: '',
    content: ''
  });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAnnouncementTab, setActiveAnnouncementTab] = useState<'new' | 'manage'>('new');
  const [selectedTeamForAnnouncements, setSelectedTeamForAnnouncements] = useState<TeamId | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [reports, setReports] = useState<Array<{
    id: string;
    description: string;
    timestamp: number;
    teamId: TeamId;
  }>>([]);
  const [judgesSchedule, setJudgesSchedule] = useState<JudgesSchedule>(() => ({
    friday: INITIAL_JUDGES_SCHEDULE.friday.map((event) => ({ ...event })),
    saturday: INITIAL_JUDGES_SCHEDULE.saturday.map((event) => ({ ...event })),
  }));
  const [isSavingJudgesSchedule, setIsSavingJudgesSchedule] = useState(false);
  const [selectedScheduleTarget, setSelectedScheduleTarget] = useState<'judges' | TeamId>('texas');
  const [techVideoFeedback, setTechVideoFeedback] = useState<Partial<Record<TeamId, 'published' | 'error'>>>({});
  const [techVideoDrafts, setTechVideoDrafts] = useState<Partial<Record<TeamId, string>>>({});
  const [teamApplicationUrl, setTeamApplicationUrl] = useState('');
  const [isSavingApplicationUrl, setIsSavingApplicationUrl] = useState(false);

  const getTechVideoInputValue = (teamId: TeamId) => {
    const value = techVideoDrafts[teamId] ?? teamData[teamId]?.techVideo?.driveUrl ?? '';
    return /^publishing(?:\.{3}|…)?$/i.test(value.trim()) ? '' : value;
  };

  useEffect(() => {
    const teamsRef = ref(db, 'teams');
    const unsubscribe = onValue(teamsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as Record<TeamId, TeamInfo>;
        if (!data.texas) data.texas = createInitialTeamData('texas') as TeamInfo;
        console.log('Received teams data:', data);
        setTeamData(data);
      } else {
        setTeamData({ texas: createInitialTeamData('texas') as TeamInfo } as Record<TeamId, TeamInfo>);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const judgesScheduleRef = ref(db, 'portalSchedules/judges');
    return onValue(judgesScheduleRef, (snapshot) => {
      if (snapshot.exists()) {
        setJudgesSchedule(snapshot.val() as JudgesSchedule);
      }
    });
  }, []);

  useEffect(() => onValue(ref(db, 'publicSettings/teamApplicationUrl'), (snapshot) => {
    setTeamApplicationUrl(typeof snapshot.val() === 'string' ? snapshot.val() : '');
  }), []);

  const handleSaveApplicationUrl = async () => {
    const normalizedUrl = teamApplicationUrl.trim();

    if (normalizedUrl) {
      try {
        const parsedUrl = new URL(normalizedUrl);
        if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') throw new Error('Invalid protocol');
      } catch {
        toast.error('Enter a valid Google Form URL, including https://');
        return;
      }
    }

    setIsSavingApplicationUrl(true);
    try {
      await set(ref(db, 'publicSettings/teamApplicationUrl'), normalizedUrl || null);
      setTeamApplicationUrl(normalizedUrl);
      toast.success(normalizedUrl ? 'Application link saved.' : 'Application link removed.');
    } catch (error) {
      console.error('Error updating team application URL:', error);
      toast.error('Could not update the application link.');
    } finally {
      setIsSavingApplicationUrl(false);
    }
  };

  useEffect(() => {
    if (selectedTeamForAnnouncements) {
      console.log('Selected team changed to:', selectedTeamForAnnouncements);
      console.log('Current team data:', teamData[selectedTeamForAnnouncements]);
      console.log('Team announcements:', teamData[selectedTeamForAnnouncements]?.announcements);
    }
  }, [selectedTeamForAnnouncements, teamData]);

  useEffect(() => {
    if (activeTab === 'schedule' && teamData) {
      Object.keys(teamData).forEach(teamId => {
        console.log(`Schedule data for ${teamId}:`, teamData[teamId as TeamId]?.schedule);
        console.log(`Schedule published:`, teamData[teamId as TeamId]?.schedule?.isPublished);
        console.log(`Show order:`, teamData[teamId as TeamId]?.schedule?.showOrder);
      });
    }
  }, [activeTab, teamData]);

  useEffect(() => {
    if (activeTab === 'reports') {
      const reportsRef = ref(db, 'reports');
      const unsubscribe = onValue(reportsRef, (snapshot) => {
        if (snapshot.exists()) {
          const reportsData = snapshot.val();
          const formattedReports = Object.entries(reportsData).map(([id, data]: [string, any]) => ({
            id,
            description: data.description,
            timestamp: data.timestamp,
            teamId: data.teamId
          })).sort((a, b) => b.timestamp - a.timestamp);
          
          setReports(formattedReports);
        }
      });

      return () => unsubscribe();
    }
  }, [activeTab]);

  const handleLogout = () => {
    sessionStorage.removeItem('team');
    sessionStorage.removeItem('portalRole');
    navigate('/team-portal/login');
  };

  const handleTeamSelect = (teamId: TeamId) => {
    console.log('Team selection handler called with:', teamId);
    console.log('Current team data available:', teamData);
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleUpdateTeamData = async (teamId: TeamId, updates: Partial<TeamInfo>) => {
    try {
      const teamRef = ref(db, `teams/${teamId}`);
      const snapshot = await get(teamRef);
      const currentData = snapshot.val() || {};
      await set(teamRef, { ...currentData, ...updates });
      setUpdateMessage('Updates saved successfully!');
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (error) {
      console.error('Error updating team data:', error);
      setUpdateMessage('Error saving updates. Please try again.');
      setTimeout(() => setUpdateMessage(''), 3000);
    }
  };

  const handleAddAnnouncement = (teamId: TeamId) => {
    const newAnnouncement = {
      id: Date.now().toString(),
      title: '',
      content: '',
      timestamp: Date.now()
    };
    
    const currentAnnouncements = teamData[teamId].announcements || [];
    handleUpdateTeamData(teamId, {
      announcements: [...currentAnnouncements, newAnnouncement]
    });
  };

  const handleUpdateScheduleSection = async (teamId: TeamId, section: keyof Schedule, data: any) => {
    try {
      const teamRef = ref(db, `teams/${teamId}/schedule`);
      const snapshot = await get(teamRef);
      const currentSchedule = snapshot.val() || {};
      await set(teamRef, {
        ...currentSchedule,
        [section]: data
      });
      toast.success('Schedule updated successfully!');
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Error updating schedule');
    }
  };

  const handleUpdateSchedulePublished = async (teamId: TeamId, isPublished: boolean) => {
    try {
      const teamRef = ref(db, `teams/${teamId}/schedule`);
      const snapshot = await get(teamRef);
      const currentSchedule = snapshot.val() || INITIAL_SCHEDULE;
      
      if (isPublished && !currentSchedule.showOrder) {
        toast.error('Please assign a show order before publishing');
        return;
      }
      
      // Get the generic schedule if show order exists
      const genericSchedule = currentSchedule.showOrder ? GENERIC_SCHEDULES[`Team ${currentSchedule.showOrder}`] : null;
      
      // Initialize schedule with all required fields
      const updatedSchedule: Schedule = {
        ...currentSchedule,
        isPublished,
        friday: currentSchedule.friday || genericSchedule?.friday || [],
        saturdayTech: currentSchedule.saturdayTech || genericSchedule?.saturdayTech || [],
        saturdayPreShow: currentSchedule.saturdayPreShow || genericSchedule?.saturdayPreShow || [],
        saturdayShow: currentSchedule.saturdayShow || genericSchedule?.saturdayShow || [],
        saturdayPostShow: {
          placing: currentSchedule.saturdayPostShow?.placing || genericSchedule?.saturdayPostShow?.placing || [],
          nonPlacing: currentSchedule.saturdayPostShow?.nonPlacing || genericSchedule?.saturdayPostShow?.nonPlacing || []
        }
      };
      
      await set(teamRef, updatedSchedule);
      toast.success(isPublished 
        ? `Schedule published and now visible to Team ${currentSchedule.showOrder}` 
        : 'Schedule unpublished and hidden from team');
    } catch (error) {
      console.error('Error updating schedule published status:', error);
      toast.error(isPublished ? 'Failed to publish schedule' : 'Failed to unpublish schedule');
    }
  };

  const handleUpdateShowOrder = async (teamId: TeamId, order: number | null) => {
    try {
      const teamRef = ref(db, `teams/${teamId}/schedule`);
      const snapshot = await get(teamRef);
      const currentSchedule = snapshot.val() || {};
      await set(teamRef, {
        ...currentSchedule,
        showOrder: order
      });
      setUpdateMessage('Show order updated successfully!');
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (error) {
      console.error('Error updating show order:', error);
      setUpdateMessage('Error updating show order. Please try again.');
      setTimeout(() => setUpdateMessage(''), 3000);
    }
  };

  const handleSendAnnouncement = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');

      // Validation
      if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
        setErrorMessage('Please fill in both title and content.');
        return;
      }
      if (selectedTeams.length === 0) {
        setErrorMessage('Please select at least one team.');
        return;
      }

      const newAnnouncement = {
        id: announcementForm.id || Date.now().toString(),
        title: announcementForm.title.trim(),
        content: announcementForm.content.trim(),
        timestamp: Date.now(),
        targetTeams: selectedTeams
      };

      console.log('Sending announcement:', newAnnouncement);
      console.log('Target teams:', selectedTeams);

      await Promise.all(selectedTeams.map(async teamId => {
        const teamRef = ref(db, `teams/${teamId}`);
        const snapshot = await get(teamRef);
        if (snapshot.exists()) {
          const teamData = snapshot.val();
          let currentAnnouncements = teamData.announcements || [];
          
          // Ensure currentAnnouncements is an array
          if (!Array.isArray(currentAnnouncements)) {
            currentAnnouncements = Object.values(currentAnnouncements);
          }
          
          // If editing, remove the old announcement
          const filteredAnnouncements = announcementForm.id 
            ? currentAnnouncements.filter((a: any) => a.id !== announcementForm.id)
            : currentAnnouncements;
          
          const updatedAnnouncements = [...filteredAnnouncements, newAnnouncement];
          console.log(`Updating announcements for team ${teamId}:`, updatedAnnouncements);
          
          await set(teamRef, {
            ...teamData,
            announcements: updatedAnnouncements
          });
        }
      }));

      toast.success(announcementForm.id ? 'Announcement updated successfully' : 'Announcement sent successfully');
      setAnnouncementForm({ title: '', content: '' });
      setSelectedTeams([]);
      setActiveAnnouncementTab('manage');
    } catch (error) {
      console.error('Error sending announcement:', error);
      toast.error('Failed to send announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAnnouncement = (announcement: TeamInfo['announcements'][0]) => {
    console.log('Editing announcement:', announcement);
    setAnnouncementForm({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      isEditing: true
    });
    setSelectedTeams(announcement.targetTeams || []);
    setActiveAnnouncementTab('new');
  };

  const handleDeleteAnnouncement = async (announcementId: string, teamId: TeamId) => {
    if (!teamId) {
      console.error('No team selected for deletion');
      toast.error('Please select a team first');
      return;
    }
    
    try {
      console.log(`Deleting announcement ${announcementId} from team ${teamId}`);
      const teamRef = ref(db, `teams/${teamId}`);
      const snapshot = await get(teamRef);
      
      if (snapshot.exists()) {
        const teamData = snapshot.val();
        console.log('Current team data:', teamData);
        
        let currentAnnouncements = teamData.announcements || [];
        if (!Array.isArray(currentAnnouncements)) {
          currentAnnouncements = Object.values(currentAnnouncements);
        }
        
        console.log('Current announcements:', currentAnnouncements);
        const updatedAnnouncements = currentAnnouncements.filter((a: any) => a.id !== announcementId);
        console.log('Updated announcements:', updatedAnnouncements);
        
        await set(teamRef, {
          ...teamData,
          announcements: updatedAnnouncements
        });
        
        toast.success('Announcement deleted successfully');
    } else {
        console.error('Team data not found');
        toast.error('Team data not found');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  const handleUpdateLiaisons = async (teamId: TeamId, liaisons: Array<{ name: string; phone: string }>) => {
    try {
      const teamRef = ref(db, `teams/${teamId}/information/liaisons`);
      await set(teamRef, liaisons);
      toast.success('Liaisons updated successfully!');
    } catch (error) {
      console.error('Error updating liaisons:', error);
      toast.error('Error updating liaisons');
    }
  };

  const handleUpdateTechVideo = async (teamId: TeamId, videoData: Partial<TeamInfo['techVideo']>) => {
    try {
      const teamRef = ref(db, `teams/${teamId}/techVideo`);
      const snapshot = await get(teamRef);
      const currentData = snapshot.val() || {};
      
      // Ensure URL has proper protocol
      if ('driveUrl' in videoData && videoData.driveUrl) {
        const url = videoData.driveUrl;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          videoData.driveUrl = `https://${url}`;
        }
      }
      
      await set(teamRef, {
        ...currentData,
        ...videoData,
        title: 'Tech Time Video'
      });
      
      // Only show success message if we're not just updating the URL
      if (!('driveUrl' in videoData)) {
        toast.success('Tech video updated successfully!');
      }
    } catch (error) {
      console.error('Error updating tech video:', error);
      toast.error('Error updating tech video');
    }
  };

  const handlePublishTechVideo = async (teamId: TeamId) => {
    setTechVideoFeedback((current) => ({ ...current, [teamId]: undefined }));
    try {
      const teamRef = ref(db, `teams/${teamId}/techVideo`);
      const localVideo = teamData[teamId]?.techVideo;
      const draftUrl = getTechVideoInputValue(teamId);
      
      if (!/^https?:\/\//i.test(draftUrl.trim())) {
        setTechVideoFeedback((current) => ({ ...current, [teamId]: 'error' }));
        toast.error('Please paste a complete Google Drive link before publishing');
        return;
      }

      const publishRequest = set(teamRef, {
        ...localVideo,
        driveUrl: draftUrl,
        title: 'Tech Time Video',
        isPublished: true
      });
      const publishTimeout = new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error('Publishing timed out')), 8000);
      });

      await Promise.race([publishRequest, publishTimeout]);

      setTeamData((current) => ({
        ...current,
        [teamId]: {
          ...current[teamId],
          techVideo: {
            ...current[teamId].techVideo,
            driveUrl: draftUrl,
            isPublished: true,
          },
        },
      }));
      setTechVideoFeedback((current) => ({ ...current, [teamId]: 'published' }));
      
      toast.success('Published to the team portal');
    } catch (error) {
      console.error('Error publishing tech video:', error);
      setTechVideoFeedback((current) => ({ ...current, [teamId]: 'error' }));
      toast.error('Error publishing tech video');
    }
  };

  const handleRemoveTechVideo = async (teamId: TeamId) => {
    try {
      const teamRef = ref(db, `teams/${teamId}/techVideo`);
      await set(teamRef, {
        title: 'Tech Time Video',
        driveUrl: '',
        isPublished: false
      });

      setTeamData((current) => ({
        ...current,
        [teamId]: {
          ...current[teamId],
          techVideo: {
            ...current[teamId].techVideo,
            driveUrl: '',
            isPublished: false,
          },
        },
      }));
      
      toast.success('Tech video removed successfully!');
    } catch (error) {
      console.error('Error removing tech video:', error);
      toast.error('Error removing tech video');
    }
  };

  const handleUpdateLocation = (teamId: TeamId, location: TeamInfo['nearbyLocations'][0]) => {
    const currentLocations = teamData[teamId].nearbyLocations || [];
    const locationIndex = currentLocations.findIndex(l => l.id === location.id);
    
    if (locationIndex === -1) {
      handleUpdateTeamData(teamId, {
        nearbyLocations: [...currentLocations, location]
      });
    } else {
      const updatedLocations = [...currentLocations];
      updatedLocations[locationIndex] = location;
      handleUpdateTeamData(teamId, {
        nearbyLocations: updatedLocations
      });
    }
  };

  const handleAssignShowOrder = async (teamId: TeamId, showOrder: number) => {
    try {
      console.log(`Assigning show order ${showOrder} to team ${teamId}`);
      const teamRef = ref(db, `teams/${teamId}/schedule`);
      const genericSchedule = GENERIC_SCHEDULES[`Team ${showOrder}`];
      
      if (!genericSchedule) {
        console.error(`No schedule template found for Team ${showOrder}`);
        toast.error('Invalid show order');
        return;
      }

      // Get current schedule to preserve publish status
      const snapshot = await get(teamRef);
      const currentSchedule = snapshot.val() || INITIAL_SCHEDULE;
      
      // Initialize schedule with all required fields
      const schedule: Schedule = {
        isPublished: currentSchedule.isPublished || false,
        showOrder: showOrder,
        friday: genericSchedule.friday || [],
        saturdayTech: genericSchedule.saturdayTech || [],
        saturdayPreShow: genericSchedule.saturdayPreShow || [],
        saturdayShow: genericSchedule.saturdayShow || [],
        saturdayPostShow: {
          placing: genericSchedule.saturdayPostShow?.placing || [],
          nonPlacing: genericSchedule.saturdayPostShow?.nonPlacing || []
        }
      };

      console.log('Setting schedule:', schedule);
      await set(teamRef, schedule);
      toast.success(`Show order ${showOrder} assigned. Publish schedule when ready.`);
    } catch (error) {
      console.error('Error assigning show order:', error);
      toast.error('Error assigning show order');
    }
  };

  const renderNewAnnouncementSection = () => (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
        <h3 className="text-xl font-semibold text-white mb-4">New Announcement</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-300 mb-1">Title</label>
            <input
              type="text"
              placeholder="Enter announcement title"
              value={announcementForm.title}
              onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-2 text-white"
            />
        </div>

          <div>
            <label className="block text-sm font-medium text-blue-300 mb-1">Content</label>
            <textarea
              placeholder="Enter announcement content"
              value={announcementForm.content}
              onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
              className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-2 text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-300 mb-2">Select Teams</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(TEAM_DISPLAY_NAMES).map(([teamId, name]) => (
              <button
                key={teamId}
                onClick={() => handleTeamSelect(teamId as TeamId)}
                  className={`flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                  selectedTeams.includes(teamId as TeamId)
                      ? 'bg-blue-500/20 text-white border-2 border-blue-500'
                      : 'text-blue-200/60 border border-blue-500/20 hover:bg-blue-500/10'
                }`}
              >
                  <span className="truncate">{name}</span>
                  {selectedTeams.includes(teamId as TeamId) && (
                    <FiCheck className="text-blue-400 ml-2 flex-shrink-0" />
                  )}
              </button>
            ))}
          </div>
        </div>

          {errorMessage && (
            <div className="flex items-center gap-2 text-red-400 bg-red-900/20 p-3 rounded-lg">
              <FiAlertCircle />
              <span>{errorMessage}</span>
          </div>
        )}

          <div className="flex justify-between items-center pt-4 border-t border-blue-500/20">
            <div className="flex gap-2">
            <button
                onClick={() => {
                  setAnnouncementForm({ title: '', content: '' });
                  setSelectedTeams([]);
                  setErrorMessage('');
                }}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Clear All
            </button>
            <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`flex items-center gap-2 px-4 py-2 ${
                  previewMode 
                    ? 'bg-blue-500/20 text-blue-300' 
                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                } rounded-lg transition-colors`}
              >
                <FiEye />
                Preview
            </button>
            </div>
            
            <button
              onClick={handleSendAnnouncement}
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FiSend />
              {isSubmitting ? 'Sending...' : 'Send Announcement'}
            </button>
          </div>
          </div>

        {previewMode && announcementForm.title && announcementForm.content && (
          <div className="mt-6 border-t border-blue-500/20 pt-6">
            <h4 className="text-lg font-medium text-blue-300 mb-4">Preview</h4>
            <div className="bg-black/40 p-4 rounded-lg border border-blue-500/10">
              <h5 className="text-lg font-medium text-white mb-2">{announcementForm.title}</h5>
              <p className="text-blue-200/80 whitespace-pre-wrap">{announcementForm.content}</p>
              <div className="mt-4 text-sm text-blue-300/60">
                Will be sent to: {selectedTeams.map(id => TEAM_DISPLAY_NAMES[id]).join(', ')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderManageAnnouncementsSection = () => {
    console.log('Rendering manage announcements section');
    console.log('Selected team:', selectedTeamForAnnouncements);
    console.log('Team data available:', Object.keys(teamData));
    
    if (selectedTeamForAnnouncements) {
      console.log('Selected team data:', teamData[selectedTeamForAnnouncements]);
      console.log('Selected team announcements:', 
        teamData[selectedTeamForAnnouncements]?.announcements
      );
    }

    const selectedTeamAnnouncements = selectedTeamForAnnouncements 
      ? teamData[selectedTeamForAnnouncements]?.announcements || []
      : [];

    console.log('Announcements to render:', selectedTeamAnnouncements);

    return (
      <div className="space-y-6">
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-xl font-semibold text-white">Manage Announcements</h3>
            <div className="w-full sm:w-auto">
              <select
                value={selectedTeamForAnnouncements || ''}
                onChange={(e) => {
                  const teamId = e.target.value as TeamId;
                  console.log('Team selection changed to:', teamId);
                  console.log('Available team data:', Object.keys(teamData));
                  if (teamId && teamId in teamData) {
                    const selectedTeamData = teamData[teamId];
                    console.log('Selected team data:', {
                      displayName: selectedTeamData.displayName,
                      hasAnnouncements: !!selectedTeamData.announcements,
                      announcementCount: selectedTeamData.announcements?.length || 0
                    });
                  }
                  setSelectedTeamForAnnouncements(teamId || null);
                }}
                className="w-full sm:w-64 bg-black/40 border border-blue-500/30 rounded-lg p-2 text-white"
              >
                <option value="">Select a team</option>
                {Object.entries(TEAM_DISPLAY_NAMES).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedTeamForAnnouncements ? (
            <div className="space-y-4">
              {selectedTeamAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-blue-500/20"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-white mb-2">{announcement.title}</h4>
                      <p className="text-blue-200/80 whitespace-pre-wrap mb-3">{announcement.content}</p>
                      <div className="flex flex-wrap gap-2 items-center text-sm text-blue-300/60">
                        <span>{new Date(announcement.timestamp).toLocaleString()}</span>
                        {announcement.targetTeams && announcement.targetTeams.length > 0 && (
                          <>
                            <span>•</span>
                            <span>Sent to: {announcement.targetTeams.map(id => TEAM_DISPLAY_NAMES[id]).join(', ')}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditAnnouncement(announcement)}
                        className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                        title="Edit announcement"
                      >
                        <FiEdit2 className="text-blue-400" />
                      </button>
                                <button
                                  onClick={() => {
                          console.log('Deleting announcement:', announcement.id);
                          handleDeleteAnnouncement(announcement.id, selectedTeamForAnnouncements);
                        }}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Delete announcement"
                      >
                        <FiTrash2 className="text-red-400" />
                                </button>
                    </div>
                              </div>
                            </div>
                          ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              <p className="text-blue-200/60 mb-2">Select a team to view and manage their announcements</p>
              <p className="text-blue-200/40 text-sm">You can edit, delete, or view the history of announcements for each team</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAnnouncementsSection = () => (
    <div className="space-y-6">
      <div className="flex space-x-4 mb-6">
                          <button
          onClick={() => setActiveAnnouncementTab('new')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeAnnouncementTab === 'new'
              ? 'bg-blue-500/20 text-white'
              : 'text-blue-200/60 hover:bg-blue-500/10'
          }`}
        >
          New Announcement
                                </button>
                          <button
          onClick={() => setActiveAnnouncementTab('manage')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeAnnouncementTab === 'manage'
              ? 'bg-blue-500/20 text-white'
              : 'text-blue-200/60 hover:bg-blue-500/10'
          }`}
        >
          Manage Announcements
                          </button>
                        </div>

      {activeAnnouncementTab === 'new' ? renderNewAnnouncementSection() : renderManageAnnouncementsSection()}
                      </div>
  );

  const updateJudgeEvent = (
    day: keyof JudgesSchedule,
    index: number,
    field: keyof ScheduleEvent,
    value: string
  ) => {
    setJudgesSchedule((current) => ({
      ...current,
      [day]: current[day].map((event, eventIndex) =>
        eventIndex === index ? { ...event, [field]: value } : event
      ),
    }));
  };

  const addJudgeEvent = (day: keyof JudgesSchedule) => {
    setJudgesSchedule((current) => ({
      ...current,
      [day]: [...current[day], { time: '', event: '', location: '' }],
    }));
  };

  const removeJudgeEvent = (day: keyof JudgesSchedule, index: number) => {
    setJudgesSchedule((current) => ({
      ...current,
      [day]: current[day].filter((_, eventIndex) => eventIndex !== index),
    }));
  };

  const moveJudgeEvent = (day: keyof JudgesSchedule, index: number, direction: -1 | 1) => {
    setJudgesSchedule((current) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current[day].length) return current;
      const nextEvents = [...current[day]];
      [nextEvents[index], nextEvents[targetIndex]] = [nextEvents[targetIndex], nextEvents[index]];
      return { ...current, [day]: nextEvents };
    });
  };

  const saveJudgesSchedule = async () => {
    const hasIncompleteEvent = [...judgesSchedule.friday, ...judgesSchedule.saturday]
      .some(({ time, event, location }) => !time.trim() || !event.trim() || !location.trim());

    if (hasIncompleteEvent) {
      toast.error('Complete the time, event, and location for every row before saving.');
      return;
    }

    setIsSavingJudgesSchedule(true);
    try {
      const cleanedSchedule: JudgesSchedule = {
        friday: judgesSchedule.friday.map((item) => ({
          time: item.time.trim(), event: item.event.trim(), location: item.location.trim(),
        })),
        saturday: judgesSchedule.saturday.map((item) => ({
          time: item.time.trim(), event: item.event.trim(), location: item.location.trim(),
        })),
      };
      await set(ref(db, 'portalSchedules/judges'), cleanedSchedule);
      setJudgesSchedule(cleanedSchedule);
      toast.success('Judges schedule saved.');
    } catch (error) {
      console.error('Error saving judges schedule:', error);
      toast.error('Could not save the judges schedule.');
    } finally {
      setIsSavingJudgesSchedule(false);
    }
  };

  const renderJudgesScheduleEditor = () => (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-red-500/25">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-red-300 text-xs uppercase tracking-[0.16em] mb-1">Judges Portal</p>
          <h3 className="text-2xl font-cormorant text-white">Judges Schedule</h3>
          <p className="text-white/55 text-sm mt-1">Edit the schedule shown to judges. Changes go live when saved.</p>
        </div>
        <button
          type="button"
          onClick={saveJudgesSchedule}
          disabled={isSavingJudgesSchedule}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white transition-colors"
        >
          <FiSave />
          {isSavingJudgesSchedule ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-8">
        {(['friday', 'saturday'] as const).map((day) => (
          <section key={day}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <h4 className="text-xl font-cormorant text-white capitalize">{day}</h4>
              <button
                type="button"
                onClick={() => addJudgeEvent(day)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 text-white/80 hover:text-white hover:border-red-500/50 transition-colors text-sm"
              >
                <FiPlus /> Add Event
              </button>
            </div>

            <div className="space-y-2">
              {judgesSchedule[day].map((item, index) => (
                <div key={`${day}-${index}`} className="grid grid-cols-1 md:grid-cols-[8rem_minmax(0,1fr)_minmax(0,1.2fr)_auto] gap-2 p-3 rounded-lg bg-white/[0.035] border border-white/10">
                  <input
                    value={item.time}
                    onChange={(event) => updateJudgeEvent(day, index, 'time', event.target.value)}
                    aria-label={`${day} event ${index + 1} time`}
                    placeholder="Time"
                    className="w-full bg-black/40 border border-white/15 focus:border-red-500/60 rounded-lg p-2.5 text-white outline-none"
                  />
                  <input
                    value={item.event}
                    onChange={(event) => updateJudgeEvent(day, index, 'event', event.target.value)}
                    aria-label={`${day} event ${index + 1} name`}
                    placeholder="Event"
                    className="w-full bg-black/40 border border-white/15 focus:border-red-500/60 rounded-lg p-2.5 text-white outline-none"
                  />
                  <input
                    value={item.location}
                    onChange={(event) => updateJudgeEvent(day, index, 'location', event.target.value)}
                    aria-label={`${day} event ${index + 1} location`}
                    placeholder="Location"
                    className="w-full bg-black/40 border border-white/15 focus:border-red-500/60 rounded-lg p-2.5 text-white outline-none"
                  />
                  <div className="flex items-center justify-end gap-1">
                    <button type="button" onClick={() => moveJudgeEvent(day, index, -1)} disabled={index === 0} aria-label="Move event up" className="p-2 text-white/60 hover:text-white disabled:opacity-25"><FiChevronUp /></button>
                    <button type="button" onClick={() => moveJudgeEvent(day, index, 1)} disabled={index === judgesSchedule[day].length - 1} aria-label="Move event down" className="p-2 text-white/60 hover:text-white disabled:opacity-25"><FiChevronDown /></button>
                    <button type="button" onClick={() => removeJudgeEvent(day, index)} aria-label="Delete event" className="p-2 text-red-400 hover:text-red-300"><FiTrash2 /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );

  const renderScheduleSection = (
    teamId: TeamId,
    section: keyof Omit<TeamInfo['schedule'], 'showOrder' | 'isPublished'>,
    title: string
  ) => {
    if (!teamData[teamId]?.schedule) {
      return null;
    }

    const schedule = teamData[teamId].schedule;
    
    if (section === 'saturdayPostShow') {
      const postShowData = schedule[section] || { placing: [], nonPlacing: [] };
      return (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <div className="mb-4">
            <h4 className="text-lg mb-2">Placing Teams</h4>
            {(postShowData.placing || []).map((event, index) => (
              <div key={index} className="flex gap-2 mb-2">
                            <input
                  value={event.time || ''}
                              onChange={(e) => {
                    const newPlacing = [...(postShowData.placing || [])];
                    newPlacing[index] = { ...event, time: e.target.value };
                    handleUpdateScheduleSection(teamId, 'saturdayPostShow', {
                      ...postShowData,
                      placing: newPlacing
                                });
                              }}
                  className="w-32 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                            />
                            <input
                  value={event.event || ''}
                              onChange={(e) => {
                    const newPlacing = [...(postShowData.placing || [])];
                    newPlacing[index] = { ...event, event: e.target.value };
                    handleUpdateScheduleSection(teamId, 'saturdayPostShow', {
                      ...postShowData,
                      placing: newPlacing
                                });
                              }}
                  className="flex-1 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                />
                <input
                  value={event.location || ''}
                              onChange={(e) => {
                    const newPlacing = [...(postShowData.placing || [])];
                    newPlacing[index] = { ...event, location: e.target.value };
                    handleUpdateScheduleSection(teamId, 'saturdayPostShow', {
                      ...postShowData,
                      placing: newPlacing
                                });
                              }}
                  className="w-48 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                />
                      </div>
                    ))}
                  </div>
                  <div>
            <h4 className="text-lg mb-2">Non-Placing Teams</h4>
            {(postShowData.nonPlacing || []).map((event, index) => (
              <div key={index} className="flex gap-2 mb-2">
                            <input
                  value={event.time || ''}
                              onChange={(e) => {
                    const newNonPlacing = [...(postShowData.nonPlacing || [])];
                    newNonPlacing[index] = { ...event, time: e.target.value };
                    handleUpdateScheduleSection(teamId, 'saturdayPostShow', {
                      ...postShowData,
                      nonPlacing: newNonPlacing
                                });
                              }}
                  className="w-32 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                            />
                            <input
                  value={event.event || ''}
                              onChange={(e) => {
                    const newNonPlacing = [...(postShowData.nonPlacing || [])];
                    newNonPlacing[index] = { ...event, event: e.target.value };
                    handleUpdateScheduleSection(teamId, 'saturdayPostShow', {
                      ...postShowData,
                      nonPlacing: newNonPlacing
                                });
                              }}
                  className="flex-1 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                />
                <input
                  value={event.location || ''}
                              onChange={(e) => {
                    const newNonPlacing = [...(postShowData.nonPlacing || [])];
                    newNonPlacing[index] = { ...event, location: e.target.value };
                    handleUpdateScheduleSection(teamId, 'saturdayPostShow', {
                      ...postShowData,
                      nonPlacing: newNonPlacing
                                });
                              }}
                  className="w-48 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                            />
                      </div>
                    ))}
                  </div>
        </div>
      );
    }

    const events = schedule[section] || [];
    return (
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        {(events as ScheduleEvent[]).map((event, index) => (
          <div key={index} className="flex gap-2 mb-2">
                                <input
              value={event.time || ''}
                                  onChange={(e) => {
                const newEvents = [...events];
                newEvents[index] = { ...event, time: e.target.value };
                handleUpdateScheduleSection(teamId, section, newEvents);
                                  }}
                                  className="w-32 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                />
                                <input
              value={event.event || ''}
                                  onChange={(e) => {
                const newEvents = [...events];
                newEvents[index] = { ...event, event: e.target.value };
                handleUpdateScheduleSection(teamId, section, newEvents);
              }}
              className="flex-1 bg-black/40 border border-purple-500/30 rounded-lg p-2"
            />
                                    <input
              value={event.location || ''}
                                      onChange={(e) => {
                const newEvents = [...events];
                newEvents[index] = { ...event, location: e.target.value };
                handleUpdateScheduleSection(teamId, section, newEvents);
              }}
              className="w-48 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                    />
                                  </div>
        ))}
                                  </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-6xl font-cormorant text-white" style={{ wordSpacing: "0.35em" }}>
            Admin Dashboard
            </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
                                  </div>

        {updateMessage && (
          <div className="mb-6 p-4 bg-green-600/20 border border-green-500 rounded-lg text-green-200">
            {updateMessage}
                                  </div>
        )}

        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              ['announcements', 'Announcements'],
              ['information', 'Information'],
              ['schedule', 'Schedule'],
              ['tech-time-video', 'Tech Time Video'],
              ['applications', 'Applications'],
              ['reports', 'Reports']
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as typeof activeTab)}
                className={`px-6 py-2 rounded-lg font-cormorant transition-all duration-300 ${
                  activeTab === key
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-500/10 text-blue-200/60 hover:bg-blue-500/20 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto">
          {activeTab === 'announcements' && renderAnnouncementsSection()}
          {activeTab === 'information' && (
            <div className="space-y-8">
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                <h3 className="text-2xl font-semibold font-cormorant text-white mb-6">Liaisons Information</h3>
                <div className="grid grid-cols-1 gap-8">
                  {Object.keys(teamData).map(teamId => (
                    <div key={teamId} className="space-y-4">
                      <h4 className="text-xl text-white border-b border-blue-500/30 pb-2 mb-4">
                        {TEAM_DISPLAY_NAMES[teamId as TeamId]}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(teamData[teamId as TeamId].information?.liaisons || INITIAL_LIAISONS).map((liaison, index) => (
                          <div key={index} className="p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-blue-500/20">
                            <div className="space-y-2">
                                    <input
                                      type="text"
                                value={liaison.name}
                                      onChange={(e) => {
                                  const updatedLiaisons = [...(teamData[teamId as TeamId].information?.liaisons || INITIAL_LIAISONS)];
                                  updatedLiaisons[index] = { ...liaison, name: e.target.value };
                                  handleUpdateLiaisons(teamId as TeamId, updatedLiaisons);
                                }}
                                placeholder="Liaison Name"
                                className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-2 text-white mb-2"
                              />
                              <input
                                type="tel"
                                value={liaison.phone}
                                      onChange={(e) => {
                                  const updatedLiaisons = [...(teamData[teamId as TeamId].information?.liaisons || INITIAL_LIAISONS)];
                                  updatedLiaisons[index] = { ...liaison, phone: e.target.value };
                                  handleUpdateLiaisons(teamId as TeamId, updatedLiaisons);
                                }}
                                placeholder="Phone Number"
                                className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-2 text-white"
                                    />
                                  </div>
                                </div>
                        ))}
                      </div>
                              </div>
                            ))}
                          </div>
                        </div>

              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                <h3 className="text-2xl font-semibold font-cormorant text-white mb-6">Tech Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-cormorant font-medium">Info Packet</h4>
                  <a 
                    href="https://docs.google.com/document/d/1P68N1dQVvHo5vtKcbFzOjVPJHFAVX7uE2NDq7p-ZfvU/edit?tab=t.0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-blue-300 font-cormorant transition-colors flex items-center gap-1"
                  >
                    View Document
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                  </div>
                  <div>
                    <h4 className="text-blue-300 text-sm font-cormorant font-medium mb-2">Danceable Space</h4>
                    <p className="text-white">42' x 28'</p>
                      </div>
                  <div>
                    <h4 className="text-blue-300 text-sm font-cormorant font-medium mb-2">Backdrop Space</h4>
                    <p className="text-white">4 ft</p>
                  </div>
                  <div>
                    <h4 className="text-blue-300 text-sm font-cormorant font-medium mb-2">Apron Space</h4>
                    <p className="text-white">4 ft</p>
                  </div>
                  <div>
                    <h4 className="text-blue-300 text-sm font-cormorant font-medium mb-2">Props Box</h4>
                    <p className="text-white">7ft (length) x 5ft (depth) x 10ft (height)</p>
                  </div>
                  <div>
                    <h4 className="text-blue-300 text-sm font-cormorant font-medium mb-2">Props Dimensions</h4>
                    <p className="text-white">42" x 4"</p>
                  </div>
                  <div className="md:col-span-2">
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200">
                      *There will be NO RIGGING this year at Marshall Arts Center*
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                <h3 className="text-2xl font-semibold font-cormorant text-white mb-6">Venue Information</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-blue-300 text-sm font-cormorant font-medium mb-2">Name</h4>
                    <p className="text-white">Marshall Family Performing Arts Center</p>
                  </div>
                  <div>
                    <h4 className="text-blue-300 text-sm font-cormorant font-medium mb-2">Address</h4>
                    <div className="flex items-center gap-4">
                      <p className="text-white">4141 Spring Valley Rd, Addison, TX 75001</p>
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=4141+Spring+Valley+Rd+Addison+TX+75001"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors font-cormorant text-blue-200"
                      >
                        View in Google Maps
                      </a>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-blue-300 text-sm font-medium mb-2">Seating Capacity</h4>
                    <p className="text-white">600 seat auditorium</p>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                <h3 className="text-2xl font-semibold font-cormorant text-white mb-6">Hotel Information</h3>
                        <div className="space-y-4">
                                <div>
                    <h4 className="text-blue-300 text-sm font-medium font-cormorant mb-2">Name</h4>
                    <p className="text-white font-cormorant ">DoubleTree by Hilton Hotel Dallas</p>
                                </div>
                                <div>
                    <h4 className="text-blue-300 text-smfont-cormorant font-medium mb-2">Address</h4>
                    <div className="flex items-center gap-4">
                      <p className="text-white">4099 Valley View Ln, Dallas, TX 75244</p>
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=4099+Valley+View+Ln+Dallas+TX+75244"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-200"
                      >
                        View in Google Maps
                      </a>
                                </div>
                                </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'tech-time-video' && (
            <div className="mt-6">
              <div className="mb-6">
                <h2 className="text-3xl sm:text-4xl font-cormorant text-white">Tech Time Videos</h2>
                <p className="mt-2 text-sm text-blue-200/60">Add a Google Drive link, then publish it when the recording is ready for the team.</p>
              </div>
              {Object.keys(teamData).map(teamId => (
                <div key={teamId} className="mb-8 bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold font-cormorant text-white">{TEAM_DISPLAY_NAMES[teamId as TeamId]}</h3>
                    <div className="flex items-center gap-2">
                      {teamData[teamId as TeamId]?.techVideo?.isPublished ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-2 text-sm font-cormorant text-green-300 bg-green-400/10 border border-green-400/20 px-3 py-2 rounded-lg">
                            <span className="h-2 w-2 rounded-full bg-green-400" aria-hidden="true" />
                            Published to team portal
                          </span>
                          <button
                            onClick={() => handleRemoveTechVideo(teamId as TeamId)}
                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg font-cormorant transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePublishTechVideo(teamId as TeamId)}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 font-cormorant text-white rounded-lg transition-colors"
                        >
                          Publish
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                                <div>
                      <label className="block text-sm font-cormorant font-medium text-blue-300 mb-1">Google Drive Video Link</label>
                                  <input
                                    type="url"
                        value={getTechVideoInputValue(teamId as TeamId)}
                        onChange={(e) => {
                          const id = teamId as TeamId;
                          const driveUrl = e.target.value;
                          setTechVideoFeedback((current) => ({ ...current, [id]: undefined }));
                          setTechVideoDrafts((current) => ({ ...current, [id]: driveUrl }));
                        }}
                        className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-2 text-white"
                        placeholder="Paste the Google Drive sharing link"
                                  />
                      <p className="mt-2 text-xs text-blue-200/50">The link is saved when you click Publish.</p>
                      {techVideoFeedback[teamId as TeamId] === 'published' && (
                        <p className="mt-3 text-sm font-medium text-green-400" role="status">Published successfully — the video is now available in the team portal.</p>
                      )}
                      {techVideoFeedback[teamId as TeamId] === 'error' && (
                        <p className="mt-3 text-sm font-medium text-red-400" role="alert">The video could not be published. Please check the link and try again.</p>
                      )}
                                </div>
                                </div>
                              </div>
              ))}
            </div>
          )}
          {activeTab === 'applications' && (
            <section className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
              <h2 className="text-3xl sm:text-4xl font-cormorant text-white">Team Applications</h2>
              <p className="mt-2 text-sm text-blue-200/60">
                Save the Google Form link for audition-video applications. The homepage application button is currently hidden.
              </p>
              <div className="mt-6 max-w-3xl">
                <label htmlFor="team-application-url" className="block text-blue-300 text-sm font-medium mb-2">
                  Google Form URL
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    id="team-application-url"
                    type="url"
                    value={teamApplicationUrl}
                    onChange={(event) => setTeamApplicationUrl(event.target.value)}
                    placeholder="https://forms.gle/..."
                    className="flex-1 bg-black/40 border border-blue-500/30 rounded-lg p-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={handleSaveApplicationUrl}
                    disabled={isSavingApplicationUrl}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    <FiSave aria-hidden="true" />
                    {isSavingApplicationUrl ? 'Saving…' : 'Save Link'}
                  </button>
                </div>
                {teamApplicationUrl && (
                  <a
                    href={teamApplicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    Preview application form <FaExternalLinkAlt aria-hidden="true" />
                  </a>
                )}
              </div>
            </section>
          )}
          {activeTab === 'schedule' && (
            <div className="space-y-8">
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                <label htmlFor="schedule-target" className="block text-sm font-medium text-blue-300 mb-2">Whose schedule do you want to adjust?</label>
                <select
                  id="schedule-target"
                  value={selectedScheduleTarget}
                  onChange={(event) => setSelectedScheduleTarget(event.target.value as 'judges' | TeamId)}
                  className="w-full sm:max-w-sm p-3 bg-black/60 border border-blue-500/30 rounded-lg text-white"
                >
                  <option value="judges">Judges</option>
                  {Object.keys(teamData).map((teamId) => (
                    <option key={teamId} value={teamId}>{TEAM_DISPLAY_NAMES[teamId as TeamId]}</option>
                  ))}
                </select>
              </div>

              {selectedScheduleTarget === 'judges' ? renderJudgesScheduleEditor() : (() => {
                const selectedTeamId = selectedScheduleTarget as TeamId;
                const selectedTeam = teamData[selectedTeamId];
                if (!selectedTeam) return <p className="text-white/60">This team’s schedule is not available yet.</p>;

                return (
                  <>
                    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                      <h3 className="text-2xl font-cormorant text-white mb-6">Schedule Settings</h3>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h4 className="text-lg text-white font-cormorant">{TEAM_DISPLAY_NAMES[selectedTeamId]}</h4>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <select
                            value={selectedTeam.schedule?.showOrder ?? ''}
                            onChange={(e) => {
                              const showOrder = e.target.value ? parseInt(e.target.value) : null;
                              if (showOrder) {
                                handleAssignShowOrder(selectedTeamId, showOrder);
                              }
                            }}
                            className="w-32 p-2 bg-black/40 border border-blue-500/30 rounded text-white"
                          >
                            <option value="">Select Order</option>
                            {Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
                              <option key={num} value={num}>Team {num}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleUpdateSchedulePublished(selectedTeamId, !selectedTeam.schedule?.isPublished)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              selectedTeam.schedule?.isPublished
                                ? 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                          >
                            {selectedTeam.schedule?.isPublished ? 'Published' : 'Publish'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-cormorant text-white">
                        {TEAM_DISPLAY_NAMES[selectedTeamId]}
                        {selectedTeam.schedule?.showOrder ? ` — Team ${selectedTeam.schedule.showOrder}` : ''}
                      </h3>
                    </div>

                    {renderScheduleSection(selectedTeamId, 'friday', 'Friday')}
                    {renderScheduleSection(selectedTeamId, 'saturdayTech', 'Saturday Tech Time')}
                    {renderScheduleSection(selectedTeamId, 'saturdayPreShow', 'Saturday Pre-Show')}
                    {renderScheduleSection(selectedTeamId, 'saturdayShow', 'Saturday Show')}
                    {renderScheduleSection(selectedTeamId, 'saturdayPostShow', 'Saturday Post-Show')}
                  </div>
                  </>
                );
              })()}
                  </div>
                )}
          {activeTab === 'reports' && (
            <div>
              <h2 className="text-3xl sm:text-4xl font-cormorant text-white mb-6"
              style={{ wordSpacing: '0.1em' }}>
                Anonymous Reports
              </h2>
              <div className="space-y-6">
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <div key={report.id} className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <span className="text-blue-300 font-sans text-sm">
                            Team: {teamData[report.teamId]?.displayName || TEAM_DISPLAY_NAMES[report.teamId] || report.teamId}
                          </span>
                          <span className="text-blue-200/60 font-sans text-sm">
                            {report.timestamp ? new Date(report.timestamp).toLocaleString() : 'Time not available'}
                          </span>
                        </div>
                        <p className="text-white font-sans whitespace-pre-wrap">{report.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-blue-200/60 font-sans">No reports have been submitted yet.</p>
                  </div>
            )}
          </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 
