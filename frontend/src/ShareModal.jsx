import React, { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";

//  ShareModal component for sharing a document with another user
export default function ShareModal({ documentId, onClose }) {
  // State variables to handle user input and response messages
  const [email, setEmail] = useState("");       // Email input
  const [role, setRole] = useState("viewer");   // Role (viewer/editor)
  const [message, setMessage] = useState("");   // Message to show success/error

  //  Function to send a POST request to share the document
  const handleShare = async () => {
    try {
      const res = await axios.post(
        `http://localhost:3001/documents/${documentId}/share`,
        { email, role } // Data to send in body
      );
      setMessage(res.data.message);  // Success message from server
      setEmail("");                  // Reset input
      setRole("viewer");
    } catch (err) {
      // Handle error and show appropriate message
      const msg =
        err.response?.data?.error ||
        err.message ||
        "Error sharing document";
      setMessage(msg);
    }
  };

  //  JSX for the share modal popup
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-lg font-bold mb-4">📤 Share Document</h2>

        {/* 📧 Email input field */}
        <input
          type="email"
          placeholder="Enter email"
          className="w-full p-2 border rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/*  Role selection dropdown */}
        <select
          className="w-full p-2 border rounded mb-4"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
        </select>

        {/*  Share and Cancel buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleShare}
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
          >
            Share
          </button>
          <button
            onClick={onClose}
            className="text-gray-700 hover:underline ml-2"
          >
            Cancel
          </button>
        </div>

        {/* Message display area */}
        {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
      </div>
    </div>
  );
}

//  Prop validation to ensure required props are passed
ShareModal.propTypes = {
  documentId: PropTypes.string.isRequired, // Document ID to share
  onClose: PropTypes.func.isRequired,      // Function to close the modal
};
