import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./HomePage";
import DocumentPage from "./DocumentPage";
import HistoryPage from "./HistoryPage";
import { v4 as uuidV4 } from "uuid";
import './styles/documents.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home page: list of documents */}
        <Route path="/" element={<HomePage />} />

        {/* New document: redirects to a new UUID */}
        <Route path="/new" element={<Navigate to={`/documents/${uuidV4()}`} />} />

        {/* Main editor page */}
        <Route path="/documents/:id" element={<DocumentPage />} />

        {/*  View document version history */}
        <Route path="/documents/:id/history" element={<HistoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}
