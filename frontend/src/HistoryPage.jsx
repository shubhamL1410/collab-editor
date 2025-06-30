import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function HistoryPage() {
  const { id } = useParams();
  const [versions, setVersions] = useState([]);
  const navigate = useNavigate();

  //  Fetch version history for the document
  useEffect(() => {
    fetch(`http://localhost:3001/documents/${id}/versions`)
      .then((res) => res.json())
      .then(setVersions)
      .catch((err) => console.error("Failed to fetch version history:", err));
  }, [id]);

  //  Restore specific version
  const handleRestore = async (versionId) => {
    const confirmed = window.confirm(
      "Restore this version? This will overwrite current content."
    );
    if (!confirmed) return;

    await fetch(`http://localhost:3001/documents/${id}/restore/${versionId}`, {
      method: "POST",
    });

    alert("✅ Version restored successfully.");
    navigate(`/documents/${id}`);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🕘 Version History</h1>
      <button
        className="mb-4 text-blue-600 underline"
        onClick={() => navigate(`/documents/${id}`)}
      >
        ← Back to Document
      </button>

      {versions.length === 0 ? (
        <p className="text-gray-500">No versions available.</p>
      ) : (
        <ul className="space-y-4">
          {versions
            .slice()
            .reverse()
            .map((v, idx) => (
              <li
                key={v._id || idx}
                className="border p-4 rounded shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">Snapshot #{versions.length - idx}</p>
                  <p className="text-sm text-gray-500">
                    Saved at:{" "}
                    {v.timestamp
                      ? new Date(v.timestamp).toLocaleString()
                      : "Unknown"}
                  </p>
                </div>
                <button
                  className="text-green-700 hover:underline"
                  onClick={() => handleRestore(v._id)}
                >
                  ♻ Restore This
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

export default HistoryPage;
