// Curated editorial photograph set — objects on sand, muted earth tones.
// Used as design elements across the project management pages (a photo as a
// framed panel, a mood band, or a backdrop) — not as content thumbnails.
export const PROJECT_PHOTOS = {
  clipboard:
    "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/e945fbc8c_Person_holding_clipboard_on_sand_202608101819.jpg",
  hourglass:
    "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/10128ace0_Hourglass_and_jacket_on_backdrop_202608101819.jpg",
  capTablet:
    "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/78bc2d39e_Baseball_cap_on_tablet_device_202608101819.jpg",
  twoChairs:
    "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/55f821bae_Two_lawn_chairs_on_sand_202608101819.jpg",
  notebookChair:
    "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/7957539c7_Notebook_and_pen_on_chair_202608101812.jpg",
  walkingChair:
    "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/56d8a9141_Person_walking_toward_white_chair_202608101812.jpg",
  folder:
    "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/23c9e382b_Woman_holding_leather_folder_2K_202608101812.jpg",
  stacked:
    "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/e146fa41a_Notebook_on_stacked_lawn_chairs_202608101812.jpg",
  capBoot:
    "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/a88ecf260_Baseball_cap_and_rubber_boot_202608101750.jpg",
  brokenChairs:
    "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/b3ca1d776_Plastic_lawn_chairs_on_beach_202608101750.jpg",
  capBoot2:
    "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/55609f956_Baseball_cap_on_rubber_boot_202608101750.jpg",
  handbag:
    "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/155ef4546_Leather_handbag_and_quilted_jacket_202608101729.jpg",
};

// A stable rotation so each project gets a consistent "mood photo" even when
// it has no custom image — derived from its id so it doesn't flicker on reload.
export const projectMoodPhoto = (projectId = "") => {
  const pool = [
    PROJECT_PHOTOS.notebookChair,
    PROJECT_PHOTOS.hourglass,
    PROJECT_PHOTOS.stacked,
    PROJECT_PHOTOS.capTablet,
    PROJECT_PHOTOS.handbag,
    PROJECT_PHOTOS.capBoot2,
  ];
  let h = 0;
  for (let i = 0; i < projectId.length; i++) h = (h * 31 + projectId.charCodeAt(i)) >>> 0;
  return pool[h % pool.length];
};