import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function HomePage() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 5;

  // 🔄 Fetch all documents on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("http://localhost:3001/documents");
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error("Failed to load documents", err);
    }
  };

  // 🔍 Filter and sort documents
  useEffect(() => {
    let filtered = documents.filter((doc) =>
      (doc.title || "Untitled Document").toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortOption) {
      case "newest":
        filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
        break;
      case "az":
        filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
    }

    setFilteredDocs(filtered);
    setCurrentPage(1); // Reset to first page after search/sort
  }, [documents, searchTerm, sortOption]);

  const paginatedDocs = filteredDocs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  async function deleteDoc(id) {
    if (!window.confirm("Delete this document?")) return;
    await fetch(`http://localhost:3001/documents/${id}`, { method: "DELETE" });
    fetchDocuments();
  }

  async function renameDoc(id, currentTitle) {
    const newTitle = prompt("Enter new title", currentTitle || "Untitled Document");
    if (!newTitle) return;

    await fetch(`http://localhost:3001/documents/${id}/title`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });

    fetchDocuments();
  }

  async function togglePin(id) {
    await fetch(`http://localhost:3001/documents/${id}/pin`, { method: "POST" });
    fetchDocuments();
  }

  async function toggleReadOnly(id) {
    await fetch(`http://localhost:3001/documents/${id}/readonly`, { method: "POST" });
    fetchDocuments();
  }

  function exportDoc(id, title) {
    const doc = documents.find((d) => d._id === id);
    const content = doc?.data?.ops?.map((op) => op.insert).join("") || "";
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${title || "Untitled"}.txt`;
    link.click();
  }

  const totalPages = Math.ceil(filteredDocs.length / ITEMS_PER_PAGE);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between mb-4 items-center">
        <h1 className="text-2xl font-bold">📄 All Documents</h1>
        <button
          onClick={() => navigate("/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ➕ New Document
        </button>
      </div>

      {/* 🔍 Search + Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
        <input
          type="text"
          placeholder="🔍 Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-1/2"
        />

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border px-2 py-2 rounded w-full sm:w-48"
        >
          <option value="newest">📅 Newest First</option>
          <option value="oldest">📆 Oldest First</option>
          <option value="az">🔤 A–Z (Title)</option>
        </select>
      </div>

      {/* 📜 Document List */}
      {paginatedDocs.length === 0 ? (
        <p className="text-gray-500">No documents found.</p>
      ) : (
        <ul className="space-y-4">
          {paginatedDocs.map((doc) => (
            <li
              key={doc._id}
              className="border p-4 rounded shadow-sm flex justify-between items-start"
            >
              <div>
                <Link
                  to={`/documents/${doc._id}`}
                  className="text-lg font-semibold text-blue-700 hover:underline"
                >
                  {doc.title?.trim() || "Untitled Document"}{" "}
                  {doc.pinned && "📌"} {doc.readOnly && "🔒"}
                </Link>
                <p className="text-sm text-gray-500">
                  Last edited:{" "}
                  {doc.updatedAt
                    ? new Date(doc.updatedAt).toLocaleString()
                    : "Unknown"}
                </p>
              </div>

              <div className="space-y-1 text-sm text-right flex flex-col items-end">
                <button
                  onClick={() => renameDoc(doc._id, doc.title)}
                  className="text-yellow-600 hover:underline"
                  disabled={doc.readOnly}
                >
                  ✏ Rename
                </button>

                <button
                  onClick={() => togglePin(doc._id)}
                  className="text-purple-600 hover:underline"
                >
                  {doc.pinned ? "📌 Unpin" : "📍 Pin"}
                </button>

                <button
                  onClick={() => toggleReadOnly(doc._id)}
                  className="text-gray-600 hover:underline"
                >
                  {doc.readOnly ? "🔓 Unlock" : "🔒 Read-Only"}
                </button>

                <button
                  onClick={() => exportDoc(doc._id, doc.title)}
                  className="text-green-700 hover:underline"
                >
                  ⬇ Export
                </button>

                <button
                  onClick={() => deleteDoc(doc._id)}
                  className="text-red-600 hover:underline"
                >
                  🗑 Delete
                </button>

                <button
                  onClick={() => navigate(`/documents/${doc._id}/history`)}
                  className="text-blue-500 hover:underline"
                >
                  🕘 History
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 📄 Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
