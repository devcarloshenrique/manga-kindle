export const mockMetrics = [
  { label: "Downloads Ativos", value: 6, icon: "download" },
  { label: "Conversões na Fila", value: 3, icon: "layers" },
  { label: "Mangás na Biblioteca", value: 42, icon: "book" },
  { label: "Conectores Online", value: 4, icon: "plug" },
];

export const mockWeekly = [
  { day: "Seg", value: 35 },
  { day: "Ter", value: 50 },
  { day: "Qua", value: 44 },
  { day: "Qui", value: 70 },
  { day: "Sex", value: 82 },
  { day: "Sáb", value: 48 },
  { day: "Dom", value: 30 },
];

export type MangaStatus = "ongoing" | "completed" | "hiatus";

export interface Manga {
  slug: string;
  title: string;
  status: MangaStatus;
  chapters: number;
  cover?: string;
  author?: string;
  genres?: string[];
}

export const mockMangas: Manga[] = [
  {
    slug: "one-piece",
    title: "One Piece",
    status: "ongoing",
    chapters: 1118,
    author: "Eiichiro Oda",
    genres: ["Aventura", "Ação", "Comédia"],
  },
  {
    slug: "solo-leveling",
    title: "Solo Leveling",
    status: "completed",
    chapters: 179,
    author: "Chugong",
    genres: ["Ação", "Fantasia"],
  },
  {
    slug: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    status: "ongoing",
    chapters: 257,
    author: "Gege Akutami",
    genres: ["Ação", "Sobrenatural"],
  },
  {
    slug: "chainsaw-man",
    title: "Chainsaw Man",
    status: "ongoing",
    chapters: 196,
    author: "Tatsuki Fujimoto",
    genres: ["Ação", "Terror"],
  },
  {
    slug: "spy-x-family",
    title: "Spy x Family",
    status: "ongoing",
    chapters: 98,
    author: "Tatsuya Endo",
    genres: ["Ação", "Comédia", "Slice of Life"],
  },
  {
    slug: "demon-slayer",
    title: "Demon Slayer",
    status: "completed",
    chapters: 205,
    author: "Koyoharu Gotouge",
    genres: ["Ação", "Sobrenatural"],
  },
];

export type DownloadStatus = "queued" | "downloading" | "completed" | "failed";

export interface Download {
  id: string;
  manga: string;
  chapter: string;
  status: DownloadStatus;
  progress: number;
  started: string;
}

export const mockDownloads: Download[] = [
  {
    id: "DL-991",
    manga: "One Piece",
    chapter: "1118",
    status: "downloading",
    progress: 58,
    started: "08/04 10:12",
  },
  {
    id: "DL-992",
    manga: "Solo Leveling",
    chapter: "177",
    status: "completed",
    progress: 100,
    started: "08/04 09:30",
  },
  {
    id: "DL-993",
    manga: "Jujutsu Kaisen",
    chapter: "254",
    status: "failed",
    progress: 21,
    started: "08/04 08:55",
  },
  {
    id: "DL-994",
    manga: "Chainsaw Man",
    chapter: "195",
    status: "queued",
    progress: 0,
    started: "08/04 11:00",
  },
];

export interface Connector {
  name: string;
  url: string;
  language: string;
  healthy: boolean;
}

export const mockConnectors: Connector[] = [
  { name: "MangaDex", url: "https://mangadex.org", language: "pt-br", healthy: true },
  { name: "MangaLivre", url: "https://mangalivre.net", language: "pt-br", healthy: true },
  { name: "Leitor.net", url: "https://leitor.net", language: "en", healthy: false },
  { name: "MangaPlus", url: "https://mangaplus.shueisha.co.jp", language: "en", healthy: true },
];

export type JobStatus = "queued" | "processing" | "completed" | "failed";

export interface ConversionJob {
  id: string;
  manga: string;
  profile: string;
  format: string;
  status: JobStatus;
  chapters?: number;
}

export const mockJobs: ConversionJob[] = [
  { id: "JOB-21", manga: "One Piece", profile: "Kindle PW", format: "EPUB", status: "processing", chapters: 10 },
  { id: "JOB-22", manga: "Solo Leveling", profile: "Kindle Basic", format: "CBZ", status: "completed", chapters: 5 },
  { id: "JOB-23", manga: "Jujutsu Kaisen", profile: "Kindle Scribe", format: "EPUB", status: "queued", chapters: 8 },
];

export interface ConvertedFile {
  file: string;
  size: string;
  createdAt: string;
  manga: string;
}

export const mockConverted: ConvertedFile[] = [
  { file: "one-piece-v01.epub", size: "232MB", createdAt: "07/04 23:10", manga: "One Piece" },
  { file: "solo-leveling-v03.cbz", size: "184MB", createdAt: "07/04 20:40", manga: "Solo Leveling" },
  { file: "demon-slayer-complete.epub", size: "1.2GB", createdAt: "06/04 15:20", manga: "Demon Slayer" },
];

export const conversionProfiles = ["Kindle PW", "Kindle Basic", "Kindle Scribe", "Kobo Libra", "Kobo Clara"];
export const conversionPresets = ["default", "manga", "webtoon", "highQuality", "noProcessing"];
export const conversionFormats = ["EPUB", "MOBI", "CBZ", "KFX", "PDF"];
