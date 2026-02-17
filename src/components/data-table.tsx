"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { DISTRICT_LIST } from "@/lib/geoLocationUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import Image from "next/image";

import { IUserModel } from "@/types/modelTyps";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { DataTableSkeleton } from "./skeletons/DataTableSkeletion";
import { useSession } from "next-auth/react";
import {
  IconBan,
  IconCircleCheck,
  IconDotsVertical,
  IconEye,
  IconTrash,
  IconUserPlus,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Define types for better type safety
type UserRole = "admin" | "volunteer" | "user";
type UserStatus = "active" | "blocked";

interface ActionHandlers {
  onView: (userId: string) => void;
  onStatusChange: (userId: string, newStatus: UserStatus) => Promise<void>;
  onRoleChange: (userId: string, newRole: UserRole) => Promise<void>;
  onDelete: (userId: string, userName: string) => Promise<void>;
}

// Create columns with handlers
const createColumns = (
  handlers: ActionHandlers,
  currentUserRole: UserRole,
): ColumnDef<IUserModel>[] => {
  const baseColumns: ColumnDef<IUserModel>[] = [
    {
      accessorKey: "avatar",
      header: "",
      cell: ({ row }) => (
        <Image
          src={row.getValue("avatar")}
          alt="Avatar"
          height={50}
          width={50}
          className="w-8 h-8  object-cover border"
        />
      ),
    },
    {
      accessorKey: "fullName",
      header: "Name",
    },
    {
      accessorKey: "userId",
      header: () => <span className="">User ID</span>,
      cell: ({ row }) => (
        <span className="text-gray-500">{row.getValue("userId")}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <span className="text-gray-500">{row.getValue("phone")}</span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      filterFn: (row, id, value) => {
        if (!value) return true;
        return row.getValue(id) === value;
      },
      cell: ({ row }) => {
        const role = row.getValue("role") as string;

        const colors: Record<string, string> = {
          admin: "bg-blue-100 text-blue-700 border-blue-200",
          volunteer: "bg-green-100 text-green-700 border-green-200",
          user: "bg-gray-100 text-gray-700 border-gray-200",
        };

        const badgeStyle =
          colors[role] ?? "bg-gray-100 text-gray-700 border-gray-200";

        return (
          <span
            className={`px-2 py-1 text-xs font-medium border ${badgeStyle}`}
          >
            {role}
          </span>
        );
      },
    },
    {
      accessorKey: "bloodGroup",
      header: "Blood Group",
      filterFn: (row, id, value) => {
        if (!value) return true;
        return row.getValue(id) === value;
      },
      cell: ({ row }) => {
        const bloodGroup = row.getValue("bloodGroup") as string;
        const badgeStyle = "bg-red-100 text-red-700 border-red-200";

        return (
          <span className={`px-2 py-1 text-xs font-bold border ${badgeStyle}`}>
            {bloodGroup}
          </span>
        );
      },
    },
    {
      id: "district",
      accessorFn: (row) => row.location?.address?.district,
      header: "District",
      filterFn: (row, id, value) => {
        if (!value) return true;
        return row.getValue(id) === value;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      filterFn: (row, id, value) => {
        if (!value) return true;
        return row.getValue(id) === value;
      },
      cell: ({ row }) => {
        const status = row.getValue("status") as string;

        const colors: Record<string, string> = {
          active: "bg-green-100 text-green-700 border-green-200",
          pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
          blocked: "bg-red-100 text-red-700 border-red-200",
          inactive: "bg-gray-100 text-gray-700 border-gray-200",
        };

        const badgeStyle =
          colors[status?.toLowerCase()] ??
          "bg-gray-100 text-gray-700 border-gray-200";

        return (
          <span
            className={`px-2 py-0.5 text-[10px] uppercase font-bold border ${badgeStyle}`}
          >
            {status}
          </span>
        );
      },
    },
  ];

  // Only add actions column for admin and volunteer
  if (currentUserRole === "admin" || currentUserRole === "volunteer") {
    baseColumns.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user_id = row.original._id?.toString() || "";
        const userStatus = row.original.status as UserStatus;
        const userRole = row.original.role as UserRole;
        const userName = row.original.fullName;

        const canManageRoles = currentUserRole === "admin";
        const canManageStatus =
          currentUserRole === "admin" || currentUserRole === "volunteer";
        const canDelete = currentUserRole === "admin";

        // Admins cannot modify other admins
        const isTargetAdmin = userRole === "admin";
        const canModifyThisUser = currentUserRole === "admin" && !isTargetAdmin;

        return (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 cursor-pointer hover:bg-gray-100"
                >
                  <span className="sr-only">Open menu</span>
                  <IconDotsVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs text-gray-500">
                  Actions
                </DropdownMenuLabel>

                {/* View Details - Always visible */}
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the Row click from firing
                    handlers.onView(user_id);
                  }}
                >
                  <IconEye className="h-4 w-4 mr-2 text-blue-600" />
                  <span>View Details</span>
                </DropdownMenuItem>

                {/* Status Management - For admin and volunteer */}
                {canManageStatus && !isTargetAdmin && (
                  <>
                    <DropdownMenuSeparator className="my-1 h-px bg-gray-200" />
                    <DropdownMenuLabel className="text-xs text-gray-500">
                      Status Management
                    </DropdownMenuLabel>

                    {userStatus === "active" ? (
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                        onClick={() =>
                          handlers.onStatusChange(user_id, "blocked")
                        }
                      >
                        <IconBan className="h-4 w-4 mr-2" />
                        <span>Block User</span>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        className="cursor-pointer text-green-600 focus:text-green-700 focus:bg-green-50"
                        onClick={() =>
                          handlers.onStatusChange(user_id, "active")
                        }
                      >
                        <IconCircleCheck className="h-4 w-4 mr-2" />
                        <span>Unblock User</span>
                      </DropdownMenuItem>
                    )}
                  </>
                )}

                {/* Role Management - Only for admin, cannot modify other admins */}
                {canManageRoles && canModifyThisUser && (
                  <>
                    <DropdownMenuSeparator className="my-1 h-px bg-gray-200" />
                    <DropdownMenuLabel className="text-xs text-gray-500">
                      Role Management
                    </DropdownMenuLabel>

                    {userRole === "user" && (
                      <>
                        <DropdownMenuItem
                          className="cursor-pointer text-gray-600 focus:text-gray-700 focus:bg-gray-50"
                          onClick={() =>
                            handlers.onRoleChange(user_id, "admin")
                          }
                        >
                          <IconUserPlus className="h-4 w-4 mr-2" />
                          <span>Make Admin</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-gray-600 focus:text-gray-700 focus:bg-gray-50"
                          onClick={() =>
                            handlers.onRoleChange(user_id, "volunteer")
                          }
                        >
                          <IconUserPlus className="h-4 w-4 mr-2" />
                          <span>Make Volunteer</span>
                        </DropdownMenuItem>
                      </>
                    )}

                    {userRole === "volunteer" && (
                      <>
                        <DropdownMenuItem
                          className="cursor-pointer text-gray-600 focus:text-gray-700 focus:bg-gray-50"
                          onClick={() =>
                            handlers.onRoleChange(user_id, "admin")
                          }
                        >
                          <IconUserPlus className="h-4 w-4 mr-2" />
                          <span>Make Admin</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-gray-600 focus:text-gray-700 focus:bg-gray-50"
                          onClick={() => handlers.onRoleChange(user_id, "user")}
                        >
                          <IconUserPlus className="h-4 w-4 mr-2" />
                          <span>Demote to User</span>
                        </DropdownMenuItem>
                      </>
                    )}
                  </>
                )}

                {/* Delete User - Only for admin, cannot delete other admins */}
                {canDelete && canModifyThisUser && (
                  <>
                    <DropdownMenuSeparator className="my-1 h-px bg-gray-200" />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                      onClick={() => handlers.onDelete(user_id, userName)}
                    >
                      <IconTrash className="h-4 w-4 mr-2" />
                      <span>Delete Account</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    });
  }

  return baseColumns;
};

export function DataTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState<IUserModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const router = useRouter();
  const { data: session } = useSession();

  const currentUserRole = (session?.user?.role as UserRole) || "user";

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users/getAllUsarData");
      if (!response.ok) throw new Error("Failed to fetch users");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Action handlers
  const handleViewUser = useCallback(
    (user_id: string) => {
      router.push(`/dashboard/${currentUserRole}/userDetails/${user_id}`);
      console.log("click  ", user_id);
    },
    [router, currentUserRole],
  );

  const handleStatusChange = useCallback(
    async (userId: string, newStatus: UserStatus) => {
      try {
        setIsUpdating(true);
        const response = await fetch(`/api/users/${userId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) throw new Error("Failed to update status");

        toast.success(`User status updated to ${newStatus}`);
        await fetchUsers(); // Refresh data
      } catch (error) {
        console.error("Error updating status:", error);
        toast.error("Failed to update user status");
      } finally {
        setIsUpdating(false);
      }
    },
    [fetchUsers],
  );

  const handleRoleChange = useCallback(
    async (userId: string, newRole: UserRole) => {
      try {
        setIsUpdating(true);
        const response = await fetch(`/api/users/${userId}/role`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        });

        if (!response.ok) throw new Error("Failed to update role");

        toast.success(`User role updated to ${newRole}`);
        await fetchUsers(); // Refresh data
      } catch (error) {
        console.error("Error updating role:", error);
        toast.error("Failed to update user role");
      } finally {
        setIsUpdating(false);
      }
    },
    [fetchUsers],
  );

  const handleDeleteUser = useCallback(
    async (userId: string, userName: string) => {
      if (!confirm(`Are you sure you want to delete ${userName}?`)) return;

      try {
        setIsUpdating(true);
        const response = await fetch(`/api/users/${userId}/deleteUser`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete user");

        toast.success("User deleted successfully");
        await fetchUsers(); // Refresh data
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
      } finally {
        setIsUpdating(false);
      }
    },
    [fetchUsers],
  );

  const actionHandlers: ActionHandlers = useMemo(
    () => ({
      onView: handleViewUser,
      onStatusChange: handleStatusChange,
      onRoleChange: handleRoleChange,
      onDelete: handleDeleteUser,
    }),
    [handleViewUser, handleStatusChange, handleRoleChange, handleDeleteUser],
  );

  const columns = useMemo(
    () => createColumns(actionHandlers, currentUserRole),
    [actionHandlers, currentUserRole],
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  if (loading) return <DataTableSkeleton />;

  return (
    <div className="w-full space-y-4">
      {/* Filters Section */}
      <div className="flex flex-col space-y-3 py-4 lg:flex-row lg:items-center lg:gap-4 lg:space-y-0">
        {/* Search */}
        <Input
          placeholder="Search by name, email or ID..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="w-full rounded-none lg:max-w-sm h-10"
          disabled={isUpdating}
        />

        {/* Filters */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:flex lg:gap-4 w-full">
          {/* Blood Group Filter */}
          <select
            className="border p-2 text-sm bg-white h-10 w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            value={
              (table.getColumn("bloodGroup")?.getFilterValue() as string) ?? ""
            }
            onChange={(e) =>
              table
                .getColumn("bloodGroup")
                ?.setFilterValue(e.target.value || undefined)
            }
            disabled={isUpdating}
          >
            <option value="">All Blood Groups</option>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </select>

          {/* District Filter */}
          <select
            className="border p-2 text-sm bg-white h-10 w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            value={
              (table.getColumn("district")?.getFilterValue() as string) ?? ""
            }
            onChange={(e) =>
              table
                .getColumn("district")
                ?.setFilterValue(e.target.value || undefined)
            }
            disabled={isUpdating}
          >
            <option value="">All Districts</option>
            {DISTRICT_LIST.map((district, index) => (
              <option key={index} value={district}>
                {district}
              </option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            className="border p-2 text-sm bg-white h-10 w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            value={(table.getColumn("role")?.getFilterValue() as string) ?? ""}
            onChange={(e) =>
              table
                .getColumn("role")
                ?.setFilterValue(e.target.value || undefined)
            }
            disabled={isUpdating}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="volunteer">Volunteer</option>
          </select>

          {/* Status Filter */}
          <select
            className="border p-2 text-sm bg-white h-10 w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            value={
              (table.getColumn("status")?.getFilterValue() as string) ?? ""
            }
            onChange={(e) =>
              table
                .getColumn("status")
                ?.setFilterValue(e.target.value || undefined)
            }
            disabled={isUpdating}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="bg-gray-50">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={`cursor-pointer hover:bg-slate-50  ${
                    isUpdating ? "opacity-50" : ""
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <div
                        onClick={(e) => {
                          if (cell.column.id === "actions") {
                            e.stopPropagation();
                          }
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center h-24 text-gray-500"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-4 px-2 py-4 sm:flex-row">
        <div className="flex-1 text-sm text-muted-foreground text-center sm:text-left">
          Showing {table.getFilteredRowModel().rows.length} of {data.length}{" "}
          total users
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <select
                className="h-8 w-16 border border-input bg-transparent px-1 py-1 text-sm outline-none cursor-pointer"
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
              >
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0 cursor-pointer disabled:cursor-not-allowed"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              {"<<"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 cursor-pointer disabled:cursor-not-allowed"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              {"<"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 cursor-pointer disabled:cursor-not-allowed"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              {">"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 cursor-pointer disabled:cursor-not-allowed"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              {">>"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
