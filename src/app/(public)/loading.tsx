import Skeleton from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="text-center space-y-4">
          <Skeleton variant="text" className="w-32 mx-auto" />
          <Skeleton variant="text" className="w-64 mx-auto h-8" />
          <Skeleton variant="text" className="w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton variant="card" className="h-80" />
          <Skeleton variant="card" className="h-80" />
          <Skeleton variant="card" className="h-80" />
        </div>
      </div>
    </div>
  )
}
