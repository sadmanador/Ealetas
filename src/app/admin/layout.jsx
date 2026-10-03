import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AdminSessionProvider from '@/components/AdminSessionProvider';
import AdminSidebar from '@/components/AdminSidebar';

export const metadata = {
  title: 'Admin Atelier | Ealetas',
};

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <AdminSessionProvider session={session}>
      {session ? (
        <div className="min-h-screen bg-[#f7f5f2] flex flex-col md:flex-row">
          <AdminSidebar session={session} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      ) : (
        <div className="min-h-screen bg-[#faf8f5]">{children}</div>
      )}
    </AdminSessionProvider>
  );
}
