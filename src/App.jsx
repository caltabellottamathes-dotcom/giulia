import React from "react";
import { Toaster } from "@/components/ui/toaster"
import { ConversationProvider } from '@elevenlabs/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './system/pages/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/system/components/UserNotRegisteredError';
import ScrollToTop from './system/components/ScrollToTop';
import ProtectedRoute from '@/system/components/ProtectedRoute';
import Layout from '@/system/components/Layout';
// Add page imports here — SPEED: alle pagina's lazy geladen (code-splitting),
// zodat het OS niet de JS van 80+ pagina's in één keer binnenhaalt. Elke route
// laadt alléén z'n eigen chunk zodra hij bezocht wordt.
const Home = React.lazy(() => import('@/system/pages/Home'));
const Agenda = React.lazy(() => import('@/focus/pages/Agenda'));
const Projects = React.lazy(() => import('@/focus/pages/Projects'));
const ProjectDetail = React.lazy(() => import('@/focus/pages/ProjectDetail'));
const ProjectsStudio = React.lazy(() => import('@/focus/pages/ProjectsStudio'));
const ProjectsStudioDetail = React.lazy(() => import('@/focus/pages/ProjectsStudioDetail'));
const Tasks = React.lazy(() => import('@/focus/pages/Tasks'));
const Email = React.lazy(() => import('@/focus/pages/Email'));
const WhatsApp = React.lazy(() => import('@/focus/pages/WhatsApp'));
const Chat = React.lazy(() => import('@/giulia/pages/Chat'));
const Voice = React.lazy(() => import('@/giulia/pages/Voice'));
const Knowledge = React.lazy(() => import('@/focus/pages/Knowledge'));
const People = React.lazy(() => import('@/focus/pages/People'));
const PersonDetail = React.lazy(() => import('@/focus/pages/PersonDetail'));
const Approvals = React.lazy(() => import('@/giulia/pages/Approvals'));
const Notifications = React.lazy(() => import('@/focus/pages/Notifications'));
const Activity = React.lazy(() => import('@/giulia/pages/Activity'));
const Memory = React.lazy(() => import('@/giulia/pages/Memory'));
const Integrations = React.lazy(() => import('@/system/pages/Integrations'));
const Settings = React.lazy(() => import('@/system/pages/Settings'));
const Profile = React.lazy(() => import('@/system/pages/Profile'));
const SearchPage = React.lazy(() => import('@/system/pages/Search'));
const Login = React.lazy(() => import('@/system/pages/Login'));
const Register = React.lazy(() => import('@/system/pages/Register'));
const ForgotPassword = React.lazy(() => import('@/system/pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('@/system/pages/ResetPassword'));
const OAuthConsent = React.lazy(() => import('@/system/pages/OAuthConsent'));
const Insights = React.lazy(() => import('@/giulia/pages/Insights'));
const TimeTracker = React.lazy(() => import('@/focus/pages/TimeTracker'));
const Agents = React.lazy(() => import('@/giulia/pages/Agents'));
const QuickCommand = React.lazy(() => import('@/system/pages/QuickCommand'));
const Updates = React.lazy(() => import('@/giulia/pages/Updates'));
const Briefing = React.lazy(() => import('@/giulia/pages/Briefing'));
const MattiaMobile = React.lazy(() => import('@/giulia/pages/MattiaMobile'));
const LifeGallery = React.lazy(() => import('@/life/pages/LifeGallery'));
const WakeMode = React.lazy(() => import('@/life/pages/WakeMode'));
const LifeLanding = React.lazy(() => import('@/life/pages/LifeLanding'));
const SocialPage = React.lazy(() => import('@/life/pages/SocialPage'));
const SocialPage2 = React.lazy(() => import('@/life/pages/SocialPage2'));
const SocialPage3 = React.lazy(() => import('@/life/pages/SocialPage3'));
const HouseholdPage = React.lazy(() => import('@/life/pages/HouseholdPage'));
const PersonalAdminPage = React.lazy(() => import('@/life/pages/PersonalAdminPage'));
const HobbiesPage = React.lazy(() => import('@/life/pages/HobbiesPage'));
const HobbyDetail = React.lazy(() => import('@/life/pages/HobbyDetail'));
const FoodPage = React.lazy(() => import('@/life/pages/FoodPage'));
const WantsToKnow = React.lazy(() => import('@/giulia/pages/WantsToKnow'));
const DailyStatePage = React.lazy(() => import('@/life/pages/DailyStatePage'));
const PersonalDevelopmentPage = React.lazy(() => import('@/life/pages/PersonalDevelopmentPage'));
const Beeldbank = React.lazy(() => import('@/system/pages/Beeldbank'));
const FilesPage = React.lazy(() => import('@/system/pages/FilesPage'));
const WidgetGalleryAll = React.lazy(() => import('@/system/pages/WidgetGalleryAll'));
const WidgetGallery2 = React.lazy(() => import('@/system/pages/WidgetGallery2'));
const WidgetGallery3 = React.lazy(() => import('@/system/pages/WidgetGallery3'));
const WidgetGallery4 = React.lazy(() => import('@/system/pages/WidgetGallery4'));
const GraphGallery = React.lazy(() => import('@/system/pages/GraphGallery'));
const GraphGallery2 = React.lazy(() => import('@/system/pages/GraphGallery2'));
const UiItems = React.lazy(() => import('@/system/pages/UiItems'));
const WidgetsGiulia = React.lazy(() => import('@/giulia/pages/WidgetsGiulia'));
const WidgetsFocus = React.lazy(() => import('@/focus/pages/WidgetsFocus'));
const WidgetsLife = React.lazy(() => import('@/life/pages/WidgetsLife'));
const WidgetsSlide = React.lazy(() => import('@/life/pages/WidgetsSlide'));
const PaginaOntwerp = React.lazy(() => import('@/life/pages/PaginaOntwerp'));
const AdminPage = React.lazy(() => import('@/life/pages/AdminPage'));
const PlayTimePage = React.lazy(() => import('@/life/pages/PlayTimePage'));
const ShellCollection = React.lazy(() => import('@/system/pages/ShellCollection'));
const PanelDesign = React.lazy(() => import('@/system/pages/PanelDesign'));
const QuestionsPanelPage = React.lazy(() => import('@/system/pages/QuestionsPanelPage'));
const Ingest = React.lazy(() => import('@/system/pages/Ingest'));
const PlaytimeAdminPage = React.lazy(() => import('@/system/pages/PlaytimeAdminPage'));
const JournalPage = React.lazy(() => import('@/self/pages/JournalPage'));


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
    <React.Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    }>
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
          <Route path="/projects/:id" element={<ProjectsStudioDetail />} />
          <Route path="/projects-studio" element={<ProjectsStudio />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/email" element={<Email />} />
          <Route path="/whatsapp" element={<WhatsApp />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/voice" element={<Voice />} />
          <Route path="/knowledge" element={<Knowledge />} />
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
          <Route path="/life/social-2" element={<SocialPage2 />} />
          <Route path="/life/social-3" element={<SocialPage3 />} />
          <Route path="/life/household" element={<HouseholdPage />} />
          <Route path="/life/personal-admin" element={<PersonalAdminPage />} />
          <Route path="/life/hobbies" element={<HobbiesPage />} />
          <Route path="/life/hobbies/:id" element={<HobbyDetail />} />
          <Route path="/life/food" element={<FoodPage />} />
          <Route path="/life/development" element={<PersonalDevelopmentPage />} />
          <Route path="/life/daily-state" element={<DailyStatePage />} />
          <Route path="/wants-to-know" element={<WantsToKnow />} />
          <Route path="/beeldbank" element={<Beeldbank />} />
          <Route path="/media" element={<FilesPage />} />
          <Route path="/widget-gallery" element={<WidgetGalleryAll />} />
          <Route path="/widget-gallery-2" element={<WidgetGallery2 />} />
          <Route path="/widget-gallery-3" element={<WidgetGallery3 />} />
          <Route path="/widget-gallery-4" element={<WidgetGallery4 />} />
          <Route path="/graph-gallery" element={<GraphGallery />} />
          <Route path="/graph-gallery-2" element={<GraphGallery2 />} />
          <Route path="/UI-items" element={<UiItems />} />
          <Route path="/widgets-giulia" element={<WidgetsGiulia />} />
          <Route path="/widgets-focus" element={<WidgetsFocus />} />
          <Route path="/widgets-life" element={<WidgetsLife />} />
          <Route path="/widget-slide" element={<WidgetsSlide />} />
          <Route path="/Pagina-Ontwerp" element={<PaginaOntwerp />} />
          <Route path="/life/admin" element={<AdminPage />} />
          <Route path="/playtime" element={<PlayTimePage />} />
          <Route path="/playtime-admin" element={<PlaytimeAdminPage />} />
          <Route path="/self/journal" element={<JournalPage />} />
          <Route path="/shell-collection" element={<ShellCollection />} />
          <Route path="/panel-design" element={<PanelDesign />} />
          <Route path="/questions-panel" element={<QuestionsPanelPage />} />
          <Route path="/ingest" element={<Ingest />} />
        </Route>
        <Route path="/life-gallery" element={<LifeGallery />} />
        <Route path="/quick" element={<QuickCommand />} />
        <Route path="/briefing" element={<Briefing />} />
        <Route path="/mattia-mobile" element={<MattiaMobile />} />
        <Route path="/wake" element={<WakeMode />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </React.Suspense>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <ConversationProvider>
            <AuthenticatedApp />
          </ConversationProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App