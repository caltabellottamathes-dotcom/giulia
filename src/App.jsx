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
import Planning from '@/focus/pages/Planning';
import Experiment from '@/system/pages/Experiment';
import TimeTracker from '@/focus/pages/TimeTracker';
import Agents from '@/giulia/pages/Agents';
import QuickCommand from '@/system/pages/QuickCommand';
import Updates from '@/giulia/pages/Updates';
import WidgetGallery from '@/system/pages/WidgetGallery';
import WidgetGallery2 from '@/system/pages/WidgetGallery2';
import WidgetGallery3 from '@/system/pages/WidgetGallery3';
import WidgetGallery4 from '@/system/pages/WidgetGallery4';
import Briefing from '@/giulia/pages/Briefing';
import WakeMode from '@/self/pages/WakeMode';
import LifeLanding from '@/life/pages/LifeLanding';
import SocialPulsePage from '@/life/pages/SocialPulsePage';
import SocialPlannerPage from '@/life/pages/SocialPlannerPage';
import HouseholdPage from '@/life/pages/HouseholdPage';
import PersonalAdminPage from '@/life/pages/PersonalAdminPage';
import HobbiesPage from '@/life/pages/HobbiesPage';
import HobbyDetail from '@/life/pages/HobbyDetail';
import WantsToKnow from '@/giulia/pages/WantsToKnow';
// Slick staging pages are self-contained (PageShell per page)
import SlickHome from '@/system/pages/slick/SlickHome';
import SlickWeek from '@/system/pages/slick/SlickWeek';
import SlickDag from '@/system/pages/slick/SlickDag';
import SlickProjecten from '@/system/pages/slick/SlickProjecten';
import SlickContacten from '@/system/pages/slick/SlickContacten';
import SlickTaakDetails from '@/system/pages/slick/SlickTaakDetails';
import SlickMatrix from '@/system/pages/slick/SlickMatrix';
import SlickNotitieblok from '@/system/pages/slick/SlickNotitieblok';
import SlickInstellingen from '@/system/pages/slick/SlickInstellingen';
import SlickTijd from '@/system/pages/slick/SlickTijd';
import SlickArchief from '@/system/pages/slick/SlickArchief';
import SlickFocus from '@/system/pages/slick/SlickFocus';
import SlickBriefing from '@/system/pages/slick/SlickBriefing';
import SlickDoelen from '@/system/pages/slick/SlickDoelen';
import SlickVergader from '@/system/pages/slick/SlickVergader';
import SlickInspiratie from '@/system/pages/slick/SlickInspiratie';
import SlickTakenoverzicht from '@/system/pages/slick/SlickTakenoverzicht';
import SlickStatistieken from '@/system/pages/slick/SlickStatistieken';
import SlickAgendaOverzicht from '@/system/pages/slick/SlickAgendaOverzicht';

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
          <Route path="/planning" element={<Planning />} />
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
          <Route path="/experiment" element={<Experiment />} />
          <Route path="/timetracker" element={<TimeTracker />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/updates" element={<Updates />} />
          <Route path="/widget-gallery-2" element={<WidgetGallery2 />} />
          <Route path="/widget-gallery-3" element={<WidgetGallery3 />} />
          <Route path="/widget-gallery-4" element={<WidgetGallery4 />} />
          <Route path="/life" element={<LifeLanding />} />
          <Route path="/life/social-pulse" element={<SocialPulsePage />} />
          <Route path="/life/social-planner" element={<SocialPlannerPage />} />
          <Route path="/life/household" element={<HouseholdPage />} />
          <Route path="/life/personal-admin" element={<PersonalAdminPage />} />
          <Route path="/life/hobbies" element={<HobbiesPage />} />
          <Route path="/life/hobbies/:id" element={<HobbyDetail />} />
          <Route path="/wants-to-know" element={<WantsToKnow />} />
        </Route>
        <Route path="/slick" element={<SlickHome />} />
        <Route path="/slick/weekplanning" element={<SlickWeek />} />
        <Route path="/slick/dagplanning" element={<SlickDag />} />
        <Route path="/slick/projecten" element={<SlickProjecten />} />
        <Route path="/slick/contacten" element={<SlickContacten />} />
        <Route path="/slick/taak-details" element={<SlickTaakDetails />} />
        <Route path="/slick/prioriteiten-matrix" element={<SlickMatrix />} />
        <Route path="/slick/notitieblok" element={<SlickNotitieblok />} />
        <Route path="/slick/instellingen" element={<SlickInstellingen />} />
        <Route path="/slick/tijdsregistratie" element={<SlickTijd />} />
        <Route path="/slick/archief" element={<SlickArchief />} />
        <Route path="/slick/focus-modus" element={<SlickFocus />} />
        <Route path="/slick/dagelijkse-briefing" element={<SlickBriefing />} />
        <Route path="/slick/doelen-dashboard" element={<SlickDoelen />} />
        <Route path="/slick/vergader-notities" element={<SlickVergader />} />
        <Route path="/slick/inspiratie-bord" element={<SlickInspiratie />} />
        <Route path="/slick/takenoverzicht" element={<SlickTakenoverzicht />} />
        <Route path="/slick/statistieken" element={<SlickStatistieken />} />
        <Route path="/slick/agenda-overzicht" element={<SlickAgendaOverzicht />} />
        <Route path="/quick" element={<QuickCommand />} />
        <Route path="/briefing" element={<Briefing />} />
        <Route path="/wake" element={<WakeMode />} />
        <Route path="/widget-gallery" element={<WidgetGallery />} />
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