import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './system/pages/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/system/components/UserNotRegisteredError';
import ScrollToTop from './system/components/ScrollToTop';
import ProtectedRoute from '@/system/components/ProtectedRoute';
import Layout from '@/system/components/Layout';
// Add page imports here
import Home from '@/system/pages/Home';
import Agenda from '@/focus/pages/Agenda';
import Projects from '@/focus/pages/Projects';
import ProjectDetail from '@/focus/pages/ProjectDetail';
import Tasks from '@/focus/pages/Tasks';
import Email from '@/focus/pages/Email';
import WhatsApp from '@/focus/pages/WhatsApp';
import Chat from '@/giulia/pages/Chat';
import Voice from '@/giulia/pages/Voice';
import Knowledge from '@/focus/pages/Knowledge';
import Documents from '@/focus/pages/Documents';
import People from '@/focus/pages/People';
import PersonDetail from '@/focus/pages/PersonDetail';
import Approvals from '@/giulia/pages/Approvals';
import Notifications from '@/focus/pages/Notifications';
import Activity from '@/giulia/pages/Activity';
import Memory from '@/giulia/pages/Memory';
import Integrations from '@/system/pages/Integrations';
import Settings from '@/system/pages/Settings';
import Profile from '@/system/pages/Profile';
import SearchPage from '@/system/pages/Search';
import Login from '@/system/pages/Login';
import Register from '@/system/pages/Register';
import ForgotPassword from '@/system/pages/ForgotPassword';
import ResetPassword from '@/system/pages/ResetPassword';
import OAuthConsent from '@/system/pages/OAuthConsent';
import Insights from '@/giulia/pages/Insights';
import TimeTracker from '@/focus/pages/TimeTracker';
import Agents from '@/giulia/pages/Agents';
import QuickCommand from '@/system/pages/QuickCommand';
import Updates from '@/giulia/pages/Updates';
import Briefing from '@/giulia/pages/Briefing';
import LifeGallery from '@/life/pages/LifeGallery';
import SelfGallery from '@/self/pages/SelfGallery';
import WakeMode from '@/self/pages/WakeMode';
import LifeLanding from '@/life/pages/LifeLanding';
import SocialPage from '@/life/pages/SocialPage';
import HouseholdPage from '@/life/pages/HouseholdPage';
import PersonalAdminPage from '@/life/pages/PersonalAdminPage';
import HobbiesPage from '@/life/pages/HobbiesPage';
import HobbyDetail from '@/life/pages/HobbyDetail';
import FoodPage from '@/life/pages/FoodPage';
import WantsToKnow from '@/giulia/pages/WantsToKnow';
import DailyStatePage from '@/self/pages/DailyStatePage';
import PersonalDevelopmentPage from '@/self/pages/PersonalDevelopmentPage';
import Beeldbank from '@/system/pages/Beeldbank';
import WidgetGalleryAll from '@/system/pages/WidgetGalleryAll';
// GlassAgenda scoped pages
import GlassLayout from '@/glass/components/GlassLayout';
import GlassHome from '@/glass/pages/Home';
import Archief from '@/glass/pages/Archief';
import Notitieblok from '@/glass/pages/Notitieblok';
import PrioriteitenMatrix from '@/glass/pages/PrioriteitenMatrix';
import InspiratieBord from '@/glass/pages/InspiratieBord';
import DoelenDashboard from '@/glass/pages/DoelenDashboard';
import DagelijkseBriefing from '@/glass/pages/DagelijkseBriefing';
import Dagplanning from '@/glass/pages/Dagplanning';
import FocusModus from '@/glass/pages/FocusModus';
import Instellingen from '@/glass/pages/Instellingen';
import TaakDetails from '@/glass/pages/TaakDetails';
import VergaderNotities from '@/glass/pages/VergaderNotities';
import Contacten from '@/glass/pages/Contacten';
import AgendaOverzicht from '@/glass/pages/AgendaOverzicht';
import Takenoverzicht from '@/glass/pages/Takenoverzicht';
import Tijdsregistratie from '@/glass/pages/Tijdsregistratie';
import Weekplanning from '@/glass/pages/Weekplanning';
import Projecten from '@/glass/pages/Projecten';
import Statistieken from '@/glass/pages/Statistieken';
import SelfIndex from '@/glass/pages/self/Index';
import DailyStatePanel from '@/glass/pages/self/DailyStatePanel';
import RoutinesPanel from '@/glass/pages/self/RoutinesPanel';
import WakePanel from '@/glass/pages/self/WakePanel';
import TherapyPanel from '@/glass/pages/self/TherapyPanel';
import JournalPanel from '@/glass/pages/self/JournalPanel';
import DevelopmentPanel from '@/glass/pages/self/DevelopmentPanel';
import PersonalTimePanel from '@/glass/pages/self/PersonalTimePanel';
import InsightsPanel from '@/glass/pages/self/InsightsPanel';
import FoodPanel from '@/glass/pages/self/FoodPanel';
import ModTaken from '@/glass/pages/modules/Taken';
import ModEmail from '@/glass/pages/modules/Email';
import ModNotifications from '@/glass/pages/modules/Notifications';
import ModApprovals from '@/glass/pages/modules/Approvals';
import ModDocuments from '@/glass/pages/modules/DocumentsPreview';
import ModKnowledge from '@/glass/pages/modules/KnowledgePreview';
import ModPeople from '@/glass/pages/modules/PeoplePreview';
import ModProjectAdd from '@/glass/pages/modules/ProjectAddPanel';
import ModTaskArchive from '@/glass/pages/modules/TaskArchivePreview';
import ModTaskDetail from '@/glass/pages/modules/TaskDetailPreview';
import ModTimeTracker from '@/glass/pages/modules/TimeTrackerPreview';
import ModWeekView from '@/glass/pages/modules/WeekView';
import ModWhatsApp from '@/glass/pages/modules/WhatsAppPreview';


const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/oauth-consent" element={<OAuthConsent />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/email" element={<Email />} />
          <Route path="/whatsapp" element={<WhatsApp />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/voice" element={<Voice />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/people" element={<People />} />
          <Route path="/people/:id" element={<PersonDetail />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/memory" element={<Memory />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/timetracker" element={<TimeTracker />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/updates" element={<Updates />} />
          <Route path="/life" element={<LifeLanding />} />
          <Route path="/life/social" element={<SocialPage />} />
          <Route path="/life/household" element={<HouseholdPage />} />
          <Route path="/life/personal-admin" element={<PersonalAdminPage />} />
          <Route path="/life/hobbies" element={<HobbiesPage />} />
          <Route path="/life/hobbies/:id" element={<HobbyDetail />} />
          <Route path="/life/food" element={<FoodPage />} />
          <Route path="/life/development" element={<PersonalDevelopmentPage />} />
          <Route path="/life/daily-state" element={<DailyStatePage />} />
          <Route path="/wants-to-know" element={<WantsToKnow />} />
          <Route path="/beeldbank" element={<Beeldbank />} />
          <Route path="/widget-gallery" element={<WidgetGalleryAll />} />
          {/* GlassAgenda — scoped suite */}
          <Route element={<GlassLayout />}>
            <Route path="/glass" element={<GlassHome />} />
            <Route path="/glass/archief" element={<Archief />} />
            <Route path="/glass/notitieblok" element={<Notitieblok />} />
            <Route path="/glass/prioriteiten" element={<PrioriteitenMatrix />} />
            <Route path="/glass/inspiratie" element={<InspiratieBord />} />
            <Route path="/glass/doelen" element={<DoelenDashboard />} />
            <Route path="/glass/briefing" element={<DagelijkseBriefing />} />
            <Route path="/glass/dagplanning" element={<Dagplanning />} />
            <Route path="/glass/focus" element={<FocusModus />} />
            <Route path="/glass/instellingen" element={<Instellingen />} />
            <Route path="/glass/taak-details" element={<TaakDetails />} />
            <Route path="/glass/vergader" element={<VergaderNotities />} />
            <Route path="/glass/contacten" element={<Contacten />} />
            <Route path="/glass/agenda" element={<AgendaOverzicht />} />
            <Route path="/glass/taken" element={<Takenoverzicht />} />
            <Route path="/glass/tijd" element={<Tijdsregistratie />} />
            <Route path="/glass/week" element={<Weekplanning />} />
            <Route path="/glass/projecten" element={<Projecten />} />
            <Route path="/glass/statistieken" element={<Statistieken />} />
            <Route path="/glass/self" element={<SelfIndex />} />
            <Route path="/glass/self/daily-state" element={<DailyStatePanel />} />
            <Route path="/glass/self/routines" element={<RoutinesPanel />} />
            <Route path="/glass/self/wake" element={<WakePanel />} />
            <Route path="/glass/self/therapy" element={<TherapyPanel />} />
            <Route path="/glass/self/journal" element={<JournalPanel />} />
            <Route path="/glass/self/development" element={<DevelopmentPanel />} />
            <Route path="/glass/self/personal-time" element={<PersonalTimePanel />} />
            <Route path="/glass/self/insights" element={<InsightsPanel />} />
            <Route path="/glass/self/food" element={<FoodPanel />} />
            <Route path="/glass/modules/taken" element={<ModTaken />} />
            <Route path="/glass/modules/email" element={<ModEmail />} />
            <Route path="/glass/modules/notifications" element={<ModNotifications />} />
            <Route path="/glass/modules/approvals" element={<ModApprovals />} />
            <Route path="/glass/modules/documents" element={<ModDocuments />} />
            <Route path="/glass/modules/knowledge" element={<ModKnowledge />} />
            <Route path="/glass/modules/people" element={<ModPeople />} />
            <Route path="/glass/modules/project-add" element={<ModProjectAdd />} />
            <Route path="/glass/modules/task-archive" element={<ModTaskArchive />} />
            <Route path="/glass/modules/task-detail" element={<ModTaskDetail />} />
            <Route path="/glass/modules/time-tracker" element={<ModTimeTracker />} />
            <Route path="/glass/modules/week" element={<ModWeekView />} />
            <Route path="/glass/modules/whatsapp" element={<ModWhatsApp />} />
          </Route>
        </Route>
        <Route path="/life-gallery" element={<LifeGallery />} />
        <Route path="/self-gallery" element={<SelfGallery />} />
        <Route path="/quick" element={<QuickCommand />} />
        <Route path="/briefing" element={<Briefing />} />
        <Route path="/wake" element={<WakeMode />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App