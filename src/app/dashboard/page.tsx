"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormsStore } from "@/store/formsStore";
import { FormStatus } from "@/models/forms";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function Dashboard() {
  const router = useRouter();
  const { forms, isLoading, error, fetchForms, deleteForm } = useFormsStore();
  const responses = useFormsStore((state) => state.responses);
  const clearResponses = useFormsStore((state) => state.clearResponses);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);

  // Fetch forms when component mounts
  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  const handleDeleteForm = (formId: string) => {
    // Show confirmation dialog
    setFormToDelete(formId);
  };

  const confirmDelete = async () => {
    if (formToDelete) {
      const success = await deleteForm(formToDelete);
      if (success) {
        setFormToDelete(null);
      }
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-gray-600">Loading forms...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-red-500">Error: {error}</p>
        <Button className="mt-4" onClick={() => fetchForms()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Confirmation dialog */}
      {formToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h3 className="text-xl font-bold mb-4 text-red-600">Delete Form</h3>
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete this form? All responses and data
              associated with it will be permanently deleted.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setFormToDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <Link href="/" passHref className="cursor-pointer">
          <h1 className="text-gray-600 text-2xl font-bold">Simple Form</h1>
        </Link>
        <Link href="/forms/create" passHref>
          <Button leftIcon={<span>+</span>} className="cursor-pointer">
            Create Form
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden bg-white shadow-md rounded-lg">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 font-medium text-gray-500">
          <div className="col-span-5">Forms</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-1 text-center">Responses</div>
          <div className="col-span-2 text-center">Last Updated</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {forms.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No forms created yet. Create your first form to get started.
          </div>
        ) : (
          forms.map((form) => (
            <div
              key={form.id}
              className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 items-center hover:bg-gray-50"
            >
              <div className="text-gray-600 col-span-5 font-medium">
                {form.title}
              </div>
              <div className="col-span-2 text-center">
                <Badge
                  variant={
                    form.status === FormStatus.Published ? "success" : "default"
                  }
                >
                  {form.status === FormStatus.Published ? "Published" : "Draft"}
                </Badge>
              </div>
              {/* <div className="text-gray-600 col-span-1 text-center">{form.responseCount}</div> */}
              <div className="col-span-1 text-center">
                {form.responseCount > 0 ? (
                  <button
                    onClick={() => router.push(`/forms/responses/${form.id}`)}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
                    aria-label="View responses"
                  >
                    {form.responseCount}
                  </button>
                ) : (
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-50 text-gray-400">
                    {form.responseCount}
                  </span>
                )}
              </div>
              <div className="text-gray-600 col-span-2 text-center">
                {new Date(form.updatedAt).toLocaleDateString()}
              </div>
              <div className="col-span-2 flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer"
                  isDisabled={form.status === FormStatus.Published}
                  onClick={() => router.push(`/forms/${form.id}`)}
                >
                  Edit
                </Button>
                {/* <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/forms/preview/${form.id}`)}
              >
                Preview
              </Button> */}
                <Button
                  variant="primary"
                  size="sm"
                  className="cursor-pointer"
                  isDisabled={form.status === FormStatus.Draft}
                  onClick={() => router.push(`/forms/respond/${form.id}`)}
                >
                  Respond
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 cursor-pointer"
                  onClick={() => handleDeleteForm(form.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
