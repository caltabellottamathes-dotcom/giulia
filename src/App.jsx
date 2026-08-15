import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
// Add page imports here
import Home from '@/pages/Home';
import Agenda from '@/pages/Agenda';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import Tasks from '@/pages/Tasks';
import Email from '@/pages/Email';
import WhatsApp from '@/pages/WhatsApp';
import Chat from '@/pages/Chat';
import Voice from '@/pages/Voice';
import Knowledge from '@/pages/Knowledge';
import Documents from '@/pages/Documents';
import People from '@/pages/People';
import PersonDetail from '@/pages/PersonDetail';
import Approvals from '@/pages/Approvals';
import Notifications from '@/pages/Notifications';
import Activity from '@/pages/Activity';
import Memory from '@/pages/Memory';
import Integrations from '@/pages/Integrations';
import Settings from '@/pages/Settings';
import Profile from '@/pages/Profile';
import SearchPage from '@/pages/Search';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import OAuthConsent from '@/pages/OAuthConsent';
import Insights from '@/pages/Insights';
import Planning from '@/pages/Planning';
import Experiment from '@/pages/Experiment';
import TimeTracker from '@/pages/TimeTracker';
import Agents from '@/pages/Agents';
import QuickCommand from '@/pages/QuickCommand';
import Updates from '@/pages/Updates';
import WidgetGallery from '@/pages/WidgetGallery';
import WidgetGallery2 from '@/pages/WidgetGallery2';
import WidgetGallery3 from '@/pages/WidgetGallery3';
import WidgetGallery4 from '@/pages/WidgetGallery4';
import Briefing from '@/pages/Briefing';
import WakeMode from '@/pages/WakeMode';
import LifeLanding from '@/pages/life/LifeLanding';
import SocialPulsePage from '@/pages/life/SocialPulsePage';
import SocialPlannerPage from '@/pages/life/SocialPlannerPage';
import HouseholdPage from '@/pages/life/HouseholdPage';
import PersonalAdminPage from '@/pages/life/PersonalAdminPage';
import HobbiesPage from '@/pages/life/HobbiesPage';
import HobbyDetail from '@/pages/life/HobbyDetail';
import WantsToKnow from '@/pages/WantsToKnow';
// Slick staging pages are self-contained (PageShell per page)
import SlickHome from '@/pages/slick/SlickHome';
import SlickWeek from '@/pages/slick/SlickWeek';
import SlickDag from '@/pages/slick/SlickDag';
import SlickProjecten from '@/pages/slick/SlickProjecten';
import SlickContacten from '@/pages/slick/SlickContacten';
import SlickTaakDetails from '@/pages/slick/SlickTaakDetails';
import SlickMatrix from '@/pages/slick/SlickMatrix';
import SlickNotitieblok from '@/pages/slick/SlickNotitieblok';
import SlickInstellingen from '@/pages/slick/SlickInstellingen';
import SlickTijd from '@/pages/slick/SlickTijd';
import SlickArchief from '@/pages/slick/SlickArchief';
import SlickFocus from '@/pages/slick/SlickFocus';
import SlickBriefing from '@/pages/slick/SlickBriefing';
import SlickDoelen from '@/pages/slick/SlickDoelen';
import SlickVergader from '@/pages/slick/SlickVergader';
import SlickInspiratie from '@/pages/slick/SlickInspiratie';
import SlickTakenoverzicht from '@/pages/slick/SlickTakenoverzicht';
import SlickStatistieken from '@/pages/slick/SlickStatistieken';
import SlickAgendaOverzicht from '@/pages/slick/SlickAgendaOverzicht';

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