import { cn } from '@repo/ui/lib/utils';
import React from 'react';

const Root = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="grid min-h-screen grid-cols-1 bg-sidebar-accent lg:grid-cols-[640px_1fr]">
      {children}
    </section>
  );
};

const FormContainer = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'flex flex-1 justify-center px-4 py-12 md:items-center md:px-8 md:py-32 bg-background',
        className,
      )}
      {...props}
    />
  );
};

const SubContainer = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'flex w-full flex-col lg:max-w-(--breakpoint-sm)',
        className,
      )}
    >
      <div
        className={
          'relative hidden w-full gap-20 overflow-hidden bg-tertiary pt-24 pr-16 pl-20 lg:flex lg:flex-col'
        }
        {...props}
      />
    </div>
  );
};

const FormHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <header
      className={cn('flex flex-col gap-3 md:gap-6', className)}
      {...props}
    />
  );
};
const FormFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <footer
      className={cn('flex justify-center gap-1 text-center', className)}
      {...props}
    />
  );
};
const FormContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn('flex w-full flex-col gap-8 sm:max-w-90', className)}
      {...props}
    />
  );
};

const SubTitle = ({
  className,
  subTitle,
  title,
  subDesc,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  title: React.ReactNode;
  subTitle: React.ReactNode;
  subDesc?: React.ReactNode;
}) => {
  return (
    <figure
      className={cn('flex max-w-3xl flex-col gap-6', className)}
      {...props}
    >
      <blockquote>
        <p className="text-display-sm font-medium text-primary">{title}</p>
      </blockquote>
      <figcaption>
        <p className="text-lg font-semibold text-primary">{subTitle}</p>
        <cite className="text-md font-medium text-tertiary not-italic">
          {subDesc}
        </cite>
      </figcaption>
    </figure>
  );
};

const SubImage = ({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) => {
  return (
    <div className="relative">
      <div className="absolute top-0 left-0 h-170.5 rounded-[9.03px] bg-background p-[0.9px] shadow-lg ring-[0.56px] ring-utility-gray-300 ring-inset md:rounded-[26.95px] md:p-[3.5px] md:ring-[1.68px]">
        <div className="h-full rounded-[7.9px] bg-background p-0.5 shadow-modern-mockup-inner-md md:rounded-[23.58px] md:p-1 md:shadow-modern-mockup-inner-lg">
          <div className="relative h-full overflow-hidden rounded-[6.77px] bg-utility-gray-50 ring-[0.56px] ring-utility-gray-200 md:rounded-[20.21px] md:ring-[1.68px]">
            <img
              className={cn(
                'absolute top-1/2 left-1/2 h-auto w-full max-w-none -translate-x-1/2 -translate-y-1/2',
                className,
              )}
              {...props}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const Title = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h1
      className={cn(
        'text-4xl font-semibold text-primary md:text-display-md',
        className,
      )}
      {...props}
    />
  );
};

export const Description = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p
      className={cn('text-md text-tertiary md:text-lg', className)}
      {...props}
    />
  );
};

export const AuthLayout = {
  Root,
  FormContainer,
  FormHeader,
  FormFooter,
  FormContent,
  SubContainer,
  SubTitle,
  SubImage,
  Title,
  Description,
};
