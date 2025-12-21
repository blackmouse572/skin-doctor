import { createFileRoute } from '@tanstack/react-router';
import { SkinAnalysisWizard } from './-components/skin-analysis/skin-analysis-wizard';
import { ThemeSwitcher } from './-components/common/theme-switcher';
import { NavUser } from './_protected/-components/nav-user';
import { authClient } from '../clients/authClient';
import { Button } from '@repo/ui/components/button';
import { UserHeader } from './-components/layout/user-header/user-header';

export const Route = createFileRoute('/')({
  component: SkinAnalysisPage,
});

function SkinAnalysisPage() {
  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <UserHeader />
      <SkinAnalysisWizard />
      <ThemeSwitcher />
    </div>
  );
}
