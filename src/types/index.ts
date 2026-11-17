export type SubjectCategory = 'C++' | 'Mathematics' | 'Physics' | 'Computer Networks' | 'Data Structures' | 'Electrical Circuits';

export interface NotePage {
  id: string;
  imageUrl: string;
  pageNumber: number;
  caption?: string;
}

export interface Author {
  name: string;
  username: string;
  avatar: string;
  university: string;
  major: string;
  graduationYear: string;
  isVerified?: boolean;
}

export interface NoteItem {
  id: string;
  title: string;
  subject: SubjectCategory;
  topic: string;
  lectureDate: string;
  uploadDate: string;
  courseCode: string;
  author: Author;
  pages: NotePage[];
  thumbnailUrl: string;
  starCount: number;
  bookmarkCount: number;
  viewsCount: number;
  isPublic: boolean;
  summary: string;
  tags: string[];
  pdfAvailable?: boolean;
}

export interface SubjectStats {
  name: SubjectCategory;
  code: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  noteCount: number;
  iconName: string;
}

export interface UserProfile extends Author {
  bio: string;
  joinedDate: string;
  totalNotes: number;
  totalStarsEarned: number;
  savedNotesCount: number;
  publicCollectionsCount: number;
  socialLinks: {
    github?: string;
    linkedin?: string;
    website?: string;
  };
}
