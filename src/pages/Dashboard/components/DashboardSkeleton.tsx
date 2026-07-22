/**
 * First-load placeholder. Only the first load shows this — a refresh dims the
 * live cards in place instead, so the layout never jumps under the reader.
 */
export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10" />
            <div className="flex items-center justify-between p-4 pb-0">
              <div className="h-4 w-28 rounded bg-gray-100 dark:bg-white/10" />
              <div className="size-9 rounded-xl bg-gray-100 dark:bg-white/10" />
            </div>
            <div className="mx-4 mt-2 mb-4 h-7 w-36 rounded bg-gray-100 dark:bg-white/10" />
          </div>
        ))}
      </div>

      {/* Heights track the real cards after the panels tightened — a skeleton
          taller than what replaces it is just a different layout jump. */}
      <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-6">
        <div className="h-[400px] rounded-2xl border border-gray-200 bg-white lg:col-span-3 xl:col-span-2 dark:border-gray-800 dark:bg-white/[0.03]" />
        <div className="h-[350px] rounded-2xl border border-gray-200 bg-white lg:col-span-3 xl:col-span-2 dark:border-gray-800 dark:bg-white/[0.03]" />
        <div className="h-[260px] rounded-2xl border border-gray-200 bg-white lg:col-span-6 xl:col-span-2 dark:border-gray-800 dark:bg-white/[0.03]" />
      </div>
    </div>
  );
}

/**
 * The charts come from their own endpoint, so they get their own placeholder —
 * the figures above are not made to wait on twelve months of aggregation.
 */
export function ChartRowSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 xl:grid-cols-2"
      aria-hidden="true"
    >
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10" />
          <div className="flex items-center gap-2.5 border-b border-gray-200 p-4 dark:border-gray-800">
            <div className="size-10 shrink-0 rounded-lg bg-gray-100 dark:bg-white/10" />
            <div className="flex-1">
              <div className="h-4 w-44 rounded bg-gray-100 dark:bg-white/10" />
              <div className="mt-2 h-3 w-60 max-w-full rounded bg-gray-100 dark:bg-white/10" />
            </div>
          </div>
          {/* Columns of uneven height rather than one gray slab — the shape of
              what is coming is the useful part of a placeholder. */}
          <div className="flex h-[300px] items-end gap-2.5 p-4">
            {[45, 70, 35, 85, 55, 65, 40].map((height, bar) => (
              <div
                key={bar}
                className="flex-1 rounded-t bg-gray-100 dark:bg-white/10"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
