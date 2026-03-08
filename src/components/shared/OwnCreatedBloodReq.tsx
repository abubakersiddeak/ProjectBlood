"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Calendar,
  Droplet,
  Edit,
  MapPin,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { IDonationRequest } from "@/types/reqTyps";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import server from "@/lib/api";
import EditDonationReqModal from "../modal/EditDonationReqModal";

export default function OwnCreatedBloodReq() {
  const [requests, setRequests] = useState<IDonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editRequest, setEditRequest] = useState<IDonationRequest | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchMyRequests();
  }, [statusFilter, page]);

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const response = await fetch(
        `/api/bloodDonationReq/my-requests?${params}`,
      );
      const data = await response.json();

      if (data.success) {
        setRequests(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const handleReqDeleteClick = async (id: string) => {
    setDeleting(true);
    try {
      const { data, ok } = await server.delete(`/api/bloodDonationReq/${id}`);

      if (ok && data.success) {
        toast.success(data.message || "Request deleted successfully");

        setRequests((prev) => prev.filter((req) => req._id !== id));

        if (requests.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          fetchMyRequests();
        }
      } else {
        toast.error(data.message || "Failed to delete request");
      }
    } catch (error) {
      console.error("Error deleting request:", error);
      toast.error("An error occurred while deleting the request");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleEditClick = (request: IDonationRequest) => {
    setEditRequest(request);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setEditRequest(null);
    fetchMyRequests();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "fulfilled":
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cancelled":
      case "cancel":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "Emergency":
        return "rounded-none bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200";
      case "Urgent":
        return "rounded-none bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200";
      case "Normal":
        return "rounded-none bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "rounded-none bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Clean Filter Tabs */}
      <div className="w-full flex">
        <div className="inline-flex justify-between bg-white dark:bg-gray-900 p-1 border border-gray-200 dark:border-gray-800 shadow-sm">
          {["all", "pending", "in-progress", "success", "cancel"].map(
            (status) => (
              <button
                key={status}
                className={`px-3 py-1 text-sm font-medium transition-all duration-200 cursor-pointer ${
                  statusFilter === status
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Empty State */}
      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-4">
            <Droplet className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No requests found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You haven't created any requests yet
          </p>
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {requests.map((request) => (
            <Card
              key={request._id}
              className="group hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 gap-2"
            >
              <CardHeader className="">
                {/* Blood Group */}
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950">
                  <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-gray-800 p-2">
                      <Droplet className="h-5 w-5 text-red-600 fill-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Blood Group
                      </p>
                      <span className="text-2xl font-bold text-red-600">
                        {request.bloodGroup}
                      </span>
                    </div>
                  </div>
                  <Badge className={getUrgencyColor(request.urgency)}>
                    {request.urgency}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Details */}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                      {request.recipientName}
                    </CardTitle>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                      {new Date(request.donationDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 line-clamp-1">
                      {request.hospitalName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Droplet className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {request.totalUnitsNeeded} Unit
                      {request.totalUnitsNeeded !== 1 ? "s" : ""} needed
                    </span>
                  </div>

                  {request.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 line-clamp-1">
                        {request.location.city || request.location.address}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div>
                  <Badge
                    className={`${getStatusColor(request.donationStatus)} border-0 rounded-none`}
                  >
                    {request.donationStatus}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    onClick={() => handleEditClick(request)}
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => setDeleteId(request._id)}
                    variant="outline"
                    size="sm"
                    className="flex-1 cursor-pointer rounded-none text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Clean Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer disabled:cursor-not-allowed"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-md text-sm font-medium transition-all cursor-pointer ${
                  page === p
                    ? "bg-red-600 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer disabled:cursor-not-allowed"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <AlertDialogTitle className="text-xl">
                Delete Request?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete this blood donation request? This
              action cannot be undone and all associated data will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="cursor-pointer" disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 cursor-pointer"
              onClick={() => deleteId && handleReqDeleteClick(deleteId)}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Request
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Modal */}
      <EditDonationReqModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditRequest(null);
        }}
        onSuccess={handleEditSuccess}
        request={editRequest}
      />
    </div>
  );
}
