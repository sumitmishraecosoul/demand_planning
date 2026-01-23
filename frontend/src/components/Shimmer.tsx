// Base shimmer component for loading states

export const Shimmer = () => (
  <div className="animate-pulse-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]" />
);

// Shimmer wrapper for inline elements
export const ShimmerBox = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded ${className}`} />
);

// File Card Shimmer
export const FileCardShimmer = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
    {/* Title */}
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-2">
        <ShimmerBox className="h-6 w-3/4" />
        <ShimmerBox className="h-4 w-1/2" />
      </div>
      <ShimmerBox className="h-6 w-20 rounded-full" />
    </div>

    {/* Actions */}
    <div className="flex flex-wrap gap-2 pt-4">
      <ShimmerBox className="h-9 w-24" />
      <ShimmerBox className="h-9 w-28" />
      <ShimmerBox className="h-9 w-24" />
      <ShimmerBox className="h-9 w-20" />
    </div>
  </div>
);

// Table Row Shimmer
export const TableRowShimmer = ({ columns = 5 }: { columns?: number }) => (
  <tr className="animate-pulse">
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index} className="px-6 py-4 whitespace-nowrap">
        <ShimmerBox className="h-5 w-full" />
      </td>
    ))}
  </tr>
);

// Table Shimmer
export const TableShimmer = ({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) => (
  <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {Array.from({ length: columns }).map((_, index) => (
            <th key={index} className="px-6 py-3 text-left">
              <ShimmerBox className="h-4 w-24" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, index) => (
          <TableRowShimmer key={index} columns={columns} />
        ))}
      </tbody>
    </table>
  </div>
);

// Stats Card Shimmer
export const StatsCardShimmer = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-3">
    <div className="flex items-center justify-between">
      <ShimmerBox className="h-5 w-32" />
      <ShimmerBox className="h-10 w-10 rounded-full" />
    </div>
    <ShimmerBox className="h-8 w-20" />
    <ShimmerBox className="h-4 w-24" />
  </div>
);

// Form Shimmer
export const FormShimmer = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
    <div className="space-y-2">
      <ShimmerBox className="h-5 w-24" />
      <ShimmerBox className="h-10 w-full" />
    </div>
    <div className="space-y-2">
      <ShimmerBox className="h-5 w-32" />
      <ShimmerBox className="h-24 w-full" />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <ShimmerBox className="h-5 w-20" />
        <ShimmerBox className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <ShimmerBox className="h-5 w-28" />
        <ShimmerBox className="h-10 w-full" />
      </div>
    </div>
    <div className="flex gap-3 pt-4">
      <ShimmerBox className="h-10 flex-1" />
      <ShimmerBox className="h-10 flex-1" />
    </div>
  </div>
);

// Workflow Tracker Shimmer
export const WorkflowShimmer = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4].map((index) => (
      <div key={index} className="flex gap-4">
        <div className="flex flex-col items-center">
          <ShimmerBox className="h-10 w-10 rounded-full" />
          {index < 4 && <ShimmerBox className="h-12 w-0.5 my-2" />}
        </div>
        <div className="flex-1 pb-8 space-y-2">
          <ShimmerBox className="h-5 w-32" />
          <ShimmerBox className="h-4 w-48" />
          <ShimmerBox className="h-4 w-40" />
        </div>
      </div>
    ))}
  </div>
);

// Full Page Shimmer with Layout
export const PageShimmer = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header */}
    <div className="space-y-2">
      <ShimmerBox className="h-8 w-64" />
      <ShimmerBox className="h-5 w-96" />
    </div>

    {/* Content */}
    <div className="grid gap-4">
      <FileCardShimmer />
      <FileCardShimmer />
      <FileCardShimmer />
    </div>
  </div>
);

// Dashboard Shimmer
export const DashboardShimmer = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="space-y-2">
      <ShimmerBox className="h-8 w-48" />
      <ShimmerBox className="h-5 w-64" />
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCardShimmer />
      <StatsCardShimmer />
      <StatsCardShimmer />
      <StatsCardShimmer />
    </div>

    {/* Recent Activity */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
      <ShimmerBox className="h-6 w-40" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            <ShimmerBox className="h-12 w-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <ShimmerBox className="h-4 w-3/4" />
              <ShimmerBox className="h-3 w-1/2" />
            </div>
            <ShimmerBox className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  </div>
);
