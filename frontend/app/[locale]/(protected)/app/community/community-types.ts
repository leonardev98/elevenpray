export type PostType = "apunte" | "pregunta" | "plantilla" | "pdf";

export type CommunityTab = "feed" | "questions" | "templates";

export type UniversityId = "UNI" | "UPC" | "PUCP" | "UNMSM" | "General" | "Todas";

export type FeedPost = {
  id: string;
  type: PostType;
  author: string;
  authorInitial: string;
  authorColor: string;
  title: string;
  body: string;
  course: string;
  university: string;
  timeAgo: string;
  likes: number;
  comments: number;
  pdfFile?: { name: string; size: string };
};

export type MockComment = {
  id: string;
  author: string;
  authorInitial: string;
  authorColor: string;
  text: string;
  timeAgo: string;
};

export type CommunityQuestion = {
  id: string;
  title: string;
  body: string;
  university: UniversityId;
  course: string;
  author: string;
  timeAgo: string;
  views: number;
  answerCount: number;
  hasAcceptedAnswer: boolean;
  answers: MockAnswer[];
};

export type MockAnswer = {
  id: string;
  author: string;
  authorInitial: string;
  authorColor: string;
  text: string;
  upvotes: number;
};

export type CommunityTemplate = {
  id: string;
  name: string;
  author: string;
  university: string;
  downloads: number;
  rating: number;
};

export type TrendItem = {
  id: string;
  rank: number;
  topic: string;
  postCount: number;
};

export type TopContributor = {
  id: string;
  name: string;
  university: string;
  initial: string;
  color: string;
  contributions: number;
};
