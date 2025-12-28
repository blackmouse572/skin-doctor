import {
  CalendarBlank,
  ChatCircle,
  Drop,
  FirstAid,
  PencilSimple,
  Virus,
  Warning,
} from '@phosphor-icons/react';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { FocusCard, FocusCardContent } from '@repo/ui/components/focus-card';
import { Meter, MeterIndicator, MeterTrack } from '@repo/ui/components/meter';
import { cn } from '@repo/ui/lib/utils';
import { Link } from '@tanstack/react-router';
import type { RouterOutput } from '@repo/api/client';
import { UploadedImage } from '../components';

interface ResultStepProps {
  data: RouterOutput['skinAnalysis']['create'];
}

export function ResultStep({ data }: ResultStepProps) {
  const { analysisId, summary } = data.data;

  return (
    <FocusCard className="w-full max-w-6xl mx-auto  animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FocusCardContent className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full mx-0 max-w-max">
        {/* Left Column - Image */}
        <div className="lg:col-span-5">
          <div className="sticky top-8">
            <UploadedImage
              uploadedImage={{
                preview: summary.images[0],
              }}
            />
          </div>
        </div>
        {/* Right Column - Metrics & Concerns */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Skin Type */}
            <Card className="group gap-4 py-4">
              <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
                <Drop className="w-24 h-24 text-blue-500" weight="fill" />
              </div>
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Skin Type
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {summary.skin.skinType}
                  </span>
                </div>
                <Meter className="mt-4 h-1.5" value={100}>
                  <MeterTrack className="rounded-full">
                    <MeterIndicator className="bg-blue-500" />
                  </MeterTrack>
                </Meter>
              </CardContent>
            </Card>

            {/* Skin Age */}
            <Card className="group gap-4 py-4">
              <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
                <CalendarBlank
                  className="w-24 h-24 text-foreground"
                  weight="fill"
                />
              </div>
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Skin Age
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      {summary.skin.skinAge}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Based on analysis
                </p>
              </CardContent>
            </Card>

            {/* Health Score */}
            <Card className="group gap-4 py-4">
              <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
                <FirstAid
                  className="w-24 h-24 text-emerald-500"
                  weight="fill"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-emerald-500">
                    {summary.skin.healthPoint}/100
                  </span>
                </div>
                <Meter
                  className="mt-4 h-1.5"
                  value={summary.skin.healthPoint}
                  max={summary.skin.healthPoint}
                >
                  <MeterTrack className="rounded-full">
                    <MeterIndicator className="bg-emerald-500" />
                  </MeterTrack>
                </Meter>
              </CardContent>
            </Card>
          </div>

          {/* Concerns Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Skin Concerns Detail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {summary.concerns.map((concern, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                          concern.severity === 'high'
                            ? 'bg-red-100 text-red-600'
                            : concern.severity === 'medium'
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-blue-100 text-blue-600',
                        )}
                      >
                        {concern.severity === 'high' ? (
                          <Virus className="w-6 h-6" weight="fill" />
                        ) : concern.severity === 'medium' ? (
                          <Warning className="w-6 h-6" weight="fill" />
                        ) : (
                          <Drop className="w-6 h-6" weight="fill" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-base">
                          {concern.type}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {concern.description}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        concern.severity === 'high'
                          ? 'destructive'
                          : concern.severity === 'medium'
                            ? 'secondary'
                            : 'outline'
                      }
                      className={cn(
                        concern.severity === 'medium' &&
                          'bg-ui-tag-orange-bg text-ui-tag-orange-text hover:bg-ui-tag-orange-bg-hover border-ui-tag-orange-border',
                        concern.severity === 'low' &&
                          'border-ui-tag-green-border text-ui-tag-green-text hover:bg-ui-tag-green-bg-hover bg-ui-tag-green-bg',
                      )}
                    >
                      {concern.severity === 'high'
                        ? 'High'
                        : concern.severity === 'medium'
                          ? 'Medium'
                          : 'Low'}
                    </Badge>
                  </div>

                  {/* Meter for concern points/severity */}
                  <Meter className="h-2" value={concern.points} max={100}>
                    <MeterTrack className="bg-muted">
                      <MeterIndicator
                        className={cn(
                          concern.severity === 'high'
                            ? 'bg-ui-tag-red-icon'
                            : concern.severity === 'medium'
                              ? 'bg-ui-tag-orange-icon'
                              : 'bg-ui-tag-green-icon',
                        )}
                      />
                    </MeterTrack>
                  </Meter>

                  {index < summary.concerns.length - 1 && (
                    <div className="h-px bg-border my-4" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Chat Action */}
          <div className="flex justify-end">
            <Link
              to="/chat/$chatid"
              params={{ chatid: analysisId }}
              className="w-full sm:w-auto"
            >
              <Button size="lg" className="w-full">
                <ChatCircle className="w-5 h-5 mr-2" weight="fill" />
                Chat with AI Assistant
              </Button>
            </Link>
          </div>
        </div>
      </FocusCardContent>
    </FocusCard>
  );
}
