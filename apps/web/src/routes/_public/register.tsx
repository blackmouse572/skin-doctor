import { createFileRoute, Link } from '@tanstack/react-router';
import RegisterCredentialsForm from '@/routes/_public/-components/register-form';

export const Route = createFileRoute('/_public/register')({
  component: RouteComponent,
});

function RouteComponent() {
  return <RegisterCredentialsForm />;
}
