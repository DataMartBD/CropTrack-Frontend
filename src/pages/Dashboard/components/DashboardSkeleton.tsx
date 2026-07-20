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
