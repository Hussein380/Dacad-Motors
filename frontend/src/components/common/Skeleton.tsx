import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'circular' | 'text' | 'card';
}

export function Skeleton({ className, variant = 'default' }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-muted';
  
  const variantClasses = {
    default: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded h-4 w-full',
    card: 'rounded-lg',
  };
  
  return (
    <div className={cn(baseClasses, variantClasses[variant], className)} />
  );
}

export function CarCardSkeleton() {
  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-md">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function BookingCardSkeleton() {
  return (
    <div className="bg-card rounded-lg p-4 shadow-md space-y-3">
      <div className="flex gap-4">
        <Skeleton className="h-20 w-32 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="h-[500px] gradient-hero animate-pulse flex items-center justify-center">
      <div className="space-y-4 text-center">
        <Skeleton className="h-12 w-64 mx-auto bg-muted/20" />
        <Skeleton className="h-6 w-96 mx-auto bg-muted/20" />
      </div>
    </div>
  );
}
