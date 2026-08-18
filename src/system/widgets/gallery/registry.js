import { WIDGETS } from "@/lib/widgetRegistry";

import GiuliaGallery from "./GiuliaGallery";
import ConciergeGallery from "./ConciergeGallery";
import ApprovalsGallery from "./ApprovalsGallery";
import InsightsGallery from "./InsightsGallery";
import UpdatesGallery from "./UpdatesGallery";
import GiuliaQuestionsGallery from "./GiuliaQuestionsGallery";
import AgendaGallery from "./AgendaGallery";
import TasksGallery from "./TasksGallery";
import ProjectsGallery from "./ProjectsGallery";
import EmailGallery from "./EmailGallery";
import WhatsAppGallery from "./WhatsAppGallery";
import DocumentsGallery from "./DocumentsGallery";
import PeopleGallery from "./PeopleGallery";
import TimeTrackerGallery from "./TimeTrackerGallery";
import PersonalAdminGallery from "./PersonalAdminGallery";
import HobbiesGallery from "./HobbiesGallery";
import FoodGallery from "./FoodGallery";
import GoodMorningGallery from "./GoodMorningGallery";
import MemoryGallery from "./MemoryGallery";
import ActivityGallery from "./ActivityGallery";
import AgentActivityGallery from "./AgentActivityGallery";
import KnowledgeGallery from "./KnowledgeGallery";
import NotificationsGallery from "./NotificationsGallery";
import ImageViewerGallery from "./ImageViewerGallery";
import VideoPlayerGallery from "./VideoPlayerGallery";
import MusicPlayerGallery from "./MusicPlayerGallery";
import DocViewerGallery from "./DocViewerGallery";
import BeeldbankGallery from "./BeeldbankGallery";

// Widgets approved/already in the editorial style → reuse existing component.
// All others → new gallery redesign.
const GALLERY_MAP = {
  giulia: GiuliaGallery,
  concierge: ConciergeGallery,
  approvals: ApprovalsGallery,
  insights: InsightsGallery,
  updates: UpdatesGallery,
  giuliaquestions: GiuliaQuestionsGallery,
  agenda: AgendaGallery,
  tasks: TasksGallery,
  projects: ProjectsGallery,
  email: EmailGallery,
  whatsapp: WhatsAppGallery,
  documents: DocumentsGallery,
  people: PeopleGallery,
  timetracker: TimeTrackerGallery,
  personaladmin: PersonalAdminGallery,
  hobbies: HobbiesGallery,
  food: FoodGallery,
  goodmorning: GoodMorningGallery,
  memory: MemoryGallery,
  activity: ActivityGallery,
  agentactivity: AgentActivityGallery,
  knowledge: KnowledgeGallery,
  notifications: NotificationsGallery,
  imageviewer: ImageViewerGallery,
  videoplayer: VideoPlayerGallery,
  musicplayer: MusicPlayerGallery,
  docviewer: DocViewerGallery,
  beeldbank: BeeldbankGallery,
};

export const GALLERY_WIDGET_LIST = Object.values(WIDGETS).map((def) => {
  const GalleryComp = GALLERY_MAP[def.type];
  return { ...def, Component: GalleryComp || def.Component };
});