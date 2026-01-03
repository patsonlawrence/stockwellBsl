import './globals.css';

export const metadata = {
  title: 'BSL Investment Club',
  description: 'Investment club management system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen min-w-screen m-0 p-0 bg-gray-100">
        {children}
      </body>
    </html>
  );
}
