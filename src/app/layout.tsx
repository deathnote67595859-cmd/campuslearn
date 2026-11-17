import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'CampusNotes | Student Handwritten Note Archive',
  description: 'Upload, organize by course and lecture date, search, and share handwritten class notes with fellow university students.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF7F2] text-[#23211F] font-sans antialiased selection:bg-[#EAE0D2] selection:text-[#23211F]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
