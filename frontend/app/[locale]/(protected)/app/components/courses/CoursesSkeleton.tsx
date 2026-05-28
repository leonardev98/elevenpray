"use client";

import { Skeleton } from "@/components/ui/skeleton";

function CourseCardSkeleton() {
  return (
    <div className="student-card flex flex-col p-5" aria-hidden>
      <Skeleton className="h-6 w-16 rounded-lg" />
      <Skeleton className="mt-3 h-6 w-4/5" />
      <Skeleton className="mt-2 h-4 w-1/2" />
      <div className="mt-3 flex gap-1.5">
        <Skeleton className="h-6 w-10 rounded-md" />
        <Skeleton className="h-6 w-10 rounded-md" />
        <Skeleton className="h-6 w-10 rounded-md" />
      </div>
      <Skeleton className="mt-4 h-2 w-full rounded-full" />
      <Skeleton className="mt-2 h-3 w-24" />
    </div>
  );
}

export function CoursesSkeleton({ showCycleFilter = false }: { showCycleFilter?: boolean }) {
  return (
    <div aria-busy="true" aria-label="Cargando cursos">
      {showCycleFilter && (
        <div className="mb-8 flex flex-wrap gap-2" aria-hidden>
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      )}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
