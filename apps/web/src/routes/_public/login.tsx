import { createFileRoute, Link } from '@tanstack/react-router';
import LoginCredentialsForm from '@/routes/_public/-components/login-form';

export const Route = createFileRoute('/_public/login')({
  component: RouteComponent,
});

function RouteComponent() {
  return <LoginCredentialsForm />;
}
