"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDate } from "@/lib/utils";
import { FileText, FolderOpen } from "lucide-react";
import UploadForm from "./UploadForm";
import DocumentActions from "./DocumentActions";

const categoryColors: Record<string, string> = {
  policy: "bg-blue-100 text-blue-800",
  form: "bg-green-100 text-green-800",
  resource: "bg-purple-100 text-purple-800",
  curriculum: "bg-orange-100 text-orange-800",
  general: "bg-gray-100 text-gray-800",
};

interface DocData {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  category: string;
  accessRoles: string;
  createdAt: string;
  uploadedBy: { name: string };
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocData[]>([]);
  const [role, setRole] = useState("");
  const [canUpload, setCanUpload] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/documents");
    if (res.ok) {
      const data = await res.json();
      setDocuments(data.documents || []);
      setRole(data.role || "");
      setCanUpload(data.canUpload || false);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="max-w-4xl mx-auto p-8 text-center text-gray-400">Loading...</div>;

  const grouped = documents.reduce<Record<string, DocData[]>>((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Library</h1>
          <p className="text-gray-500 mt-1">Access policies, forms, and resources</p>
        </div>
        {canUpload && <UploadForm />}
      </div>

      {Object.keys(grouped).length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No documents uploaded yet</p>
        </div>
      )}

      {Object.entries(grouped).map(([category, docs]) => (
        <div key={category}>
          <h2 className="text-lg font-semibold text-gray-900 capitalize mb-3">{category}s</h2>
          <div className="space-y-3">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4"
              >
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 truncate">{doc.title}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        categoryColors[doc.category] || categoryColors.general
                      }`}
                    >
                      {doc.category}
                    </span>
                  </div>
                  {doc.description && (
                    <p className="text-sm text-gray-500 mt-1 truncate">{doc.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Uploaded by {doc.uploadedBy.name} • {formatDate(new Date(doc.createdAt))}
                  </p>
                </div>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  View
                </a>
                {role === "admin" && (
                  <DocumentActions doc={doc} onUpdated={fetchData} onDeleted={fetchData} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
