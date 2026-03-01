import Skeleton from "@/components/ui/Skeleton"

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton variant="text" className="w-40 h-7" />
        <Skeleton variant="text" className="w-60 mt-1" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="card" className="h-28" />)}
      </div>
      <Skeleton variant="card" className="h-80" />
    </div>
  )
}
