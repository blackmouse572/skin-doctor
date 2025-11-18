import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@repo/ui/components/sidebar';
import { Navigate, Outlet, createFileRoute } from '@tanstack/react-router';
import { AppSidebar } from './-components/app-sidebar';
import { authClient } from '@/clients/authClient';
import Spinner from '@/routes/-components/common/spinner';

export const Route = createFileRoute('/_protected')({
  component: Layout,
});

function Layout() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Spinner />;
  }

  if (!session?.user) {
    return <Navigate to="/" />;
  }

  return (
    <main className="min-h-screen flex flex-col">
      <SidebarProvider>
        <AppSidebar collapsible="icon" user={session.user} />
        <SidebarInset>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
}
