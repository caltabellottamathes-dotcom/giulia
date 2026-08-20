// Editorial reeks 11 — zelfde visuele taal als reeks 3 (full-bleed foto + donkere
// gradient + grote editorial headline + één grafisch/animatie-element), maar
// toegepast op andere OS-functies: Wake, Budget, Tijd, Mensen, Routines,
// Journal, Therapie, Groei.
import { SELF_PHOTO, PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial/selfEditorial";
import { PHOTOS4 } from "@/self/widgets/editorial3/editorial3Data";

export { PLUM, SAGE, PLUM_FAINT };

export const PHOTOS11 = {
  wakeFigure: SELF_PHOTO.wake,
  ceiling: PHOTOS4.suitChairs,
  stride: PHOTOS4.legsLacing,
  twoCoats: PHOTOS4.greenTweed,
  numbersNeck: SELF_PHOTO.routines,
  cornerBlur: SELF_PHOTO.journal,
  vasePetal: SELF_PHOTO.therapy,
  gloveThread: SELF_PHOTO.development,
};