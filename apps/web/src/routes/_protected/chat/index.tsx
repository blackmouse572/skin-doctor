import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected/chat/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col items-center w-full h-full p-2 mx-auto justify-center @sm:p-4 @sm:gap-9 isolate mt-16 @sm:mt-0 overflow-scroll">
      <div className="flex flex-col items-center gap-6 h-[450px] w-full @sm:pt-12 isolate transition-transform">
        <div className="absolute bottom-0 mx-auto inset-x-0 max-w-breakout @sm:relative flex flex-col items-center w-full gap-1 @sm:gap-5 @sm:bottom-auto @sm:inset-x-auto @sm:max-w-full"></div>
      </div>
      Hello "/_protected/chat/"!
    </div>
  );
}
