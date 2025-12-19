import { createFileRoute } from '@tanstack/react-router';
import { SkinAnalysisWizard } from './-components/skin-analysis/skin-analysis-wizard';
import { ThemeSwitcher } from './-components/common/theme-switcher';

export const Route = createFileRoute('/')({
  component: SkinAnalysisPage,
});

function SkinAnalysisPage() {
  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <SkinAnalysisWizard />
      <ThemeSwitcher />
    </div>
  );
}
