import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "./Editor";
import ShareModal from "./ShareModal"; //  Import ShareModal

function DocumentPage() {
  const { id } = useParams();
  const [title, setTitle] = useState("Loading...");
  const [editMode, setEditMode] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false); //  modal toggle
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDocument() {
      try {
        const res = await fetch(`http://localhost:3001/documents/${id}`);
        const doc = await res.json();
        setTitle(doc.title || "Untitled Document");
        setReadOnly(doc.readOnly || false);
        setPinned(doc.pinned || false);
      } catch (err) {
        console.error("Failed to fetch document:", err);
        setTitle("Untitled Document");
      }
    }

    fetchDocument();
  }, [id]);

  function handleTitleChange(e) {
    setTitle(e.target.value);
  }

  function handleBlur() {
    setEditMode(false);
    if (readOnly) return;

    fetch(`http://localhost:3001/documents/${id}/title`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }).catch((err) => {
      console.error("Failed to update title", err);
    });
  }

  return (
    <div className="p-4">
      <div className="flex items-center space-x-2 flex-wrap">
        {editMode && !readOnly ? (
          <input
            value={title}
            onChange={handleTitleChange}
            onBlur={handleBlur}
            autoFocus
            className="text-xl font-semibold border px-2 py-1 rounded"
          />
        ) : (
          <button
            onClick={() => {
              if (!readOnly) setEditMode(true);
            }}
            className="text-xl font-semibold bg-transparent border-none cursor-pointer"
            aria-label="Edit document title"
          >
            {title}
          </button>
        )}

        {pinned && <span title="Pinned">📌</span>}
        {readOnly && <span title="Read-Only">🔒</span>}

        <button
          onClick={() => navigate(`/documents/${id}/history`)}
          className="ml-4 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
        >
          🕘 View History
        </button>

        {/*  Share Button */}
        <button
          onClick={() => setShowShareModal(true)}
          className="ml-2 px-3 py-1 text-sm bg-green-200 hover:bg-green-300 rounded"
        >
          📤 Share
        </button>
      </div>

      <div className="mt-4 flex">
        <div className="flex-grow">
          <Editor readOnly={readOnly} />
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal documentId={id} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
}

export default DocumentPage;
