import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DataTableSkeleton() {
  const skeletonRows = Array.from({ length: 20 });

  return (
    <div className="w-full space-y-4">
      {/* Search and Filter Skeleton */}
      <div className="flex flex-col space-y-3 py-4 lg:flex-row lg:items-center lg:gap-4 lg:space-y-0">
        <Skeleton className="h-10 w-full lg:max-w-sm rounded-none" />
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:flex lg:gap-4 w-full">
          <Skeleton className="h-10 w-full lg:w-32 rounded-none" />
          <Skeleton className="h-10 w-full lg:w-32 rounded-none" />
          <Skeleton className="h-10 w-full lg:w-32 rounded-none" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow>
              {/* আপনার কলাম অনুযায়ী ৫-৬টি হেড স্কেলিটন */}
              <TableHead>
                <Skeleton className="h-4 w-8" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-24" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-32" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-20" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-16" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-12" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skeletonRows.map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-10 w-10 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full max-w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full max-w-[150px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full max-w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full max-w-[80px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded-none" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex flex-col items-center justify-between gap-4 px-2 py-4 sm:flex-row">
        <Skeleton className="h-4 w-40" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
    </div>
  );
}
