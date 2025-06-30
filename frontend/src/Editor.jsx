// Editor.jsx 

import React, { useEffect, useState, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import CustomToolbar from "./CustomToolbar";
import Quill from "quill";

// Register font sizes and families
const Font = Quill.import("formats/font");
Font.whitelist = ["", "serif", "monospace", "sans-serif", "times-new-roman", "arial", "verdana", "georgia", "tahoma", "impact", "courier", "comic-sans", "trebuchet", "garamond", "palatino", "lucida"];
Quill.register(Font, true);

const Size = Quill.import("attributors/style/size");
Size.whitelist = Array.from({ length: 30 }, (_, i) => `${i + 1}px`);
Quill.register(Size, true);

const SAVE_INTERVAL_MS = 60000;

export default function Editor({ readOnly = false }) {
  const { id: documentId } = useParams();
  const [socket, setSocket] = useState(null);
  const quillRef = useRef(null);
  const cursorsRef = useRef({});
  const clientId = useRef(crypto.randomUUID());

  useEffect(() => {
    const s = io("http://localhost:3001");
    setSocket(s);
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    if (!socket || !quillRef.current) return;
    const editor = quillRef.current.getEditor();
    socket.once("load-document", (doc) => {
      editor.setContents(doc);
      editor.enable(!readOnly);
    });
    socket.emit("get-document", documentId);
    return () => socket.off("load-document");
  }, [socket, documentId, readOnly]);

  const handleChange = useCallback(
    (content, delta, source) => {
      if (source !== "user" || readOnly) return;
      socket?.emit("send-changes", delta);
    },
    [socket, readOnly]
  );

  useEffect(() => {
    if (!socket || !quillRef.current) return;
    const editor = quillRef.current.getEditor();
    const handler = (delta) => {
      if (!readOnly) editor.updateContents(delta);
    };
    socket.on("receive-changes", handler);
    return () => socket.off("receive-changes", handler);
  }, [socket, readOnly]);

  useEffect(() => {
    if (!socket || !quillRef.current || readOnly) return;
    const editor = quillRef.current.getEditor();
    editor.on("selection-change", (range) => {
      socket.emit("cursor-change", { range, clientId: clientId.current });
    });
    return () => editor.off("selection-change");
  }, [socket, readOnly]);

  useEffect(() => {
    if (!socket || !quillRef.current || readOnly) return;
    const editor = quillRef.current.getEditor();
    const cursors = cursorsRef.current;
    const handleRemoteCursor = ({ range, clientId: senderId }) => {
      if (!range || senderId === clientId.current) return;
      cursors[senderId]?.remove();
      const index = range.index;
      const cursorSpan = document.createElement("span");
      cursorSpan.style.borderLeft = "2px solid red";
      cursorSpan.style.height = "1em";
      cursorSpan.style.display = "inline-block";
      cursorSpan.style.marginLeft = "-1px";
      cursorSpan.style.pointerEvents = "none";
      cursorSpan.title = `User: ${senderId}`;
      const leaf = editor.getLeaf(index)?.[0];
      if (!leaf) return;
      const leafNode = leaf.domNode;
      leafNode?.parentNode?.insertBefore(cursorSpan, leafNode);
      cursors[senderId] = {
        remove: () => cursorSpan.parentNode?.removeChild(cursorSpan),
      };
      setTimeout(() => {
        cursors[senderId]?.remove();
        delete cursors[senderId];
      }, 10000);
    };
    socket.on("remote-cursor-change", handleRemoteCursor);
    return () => socket.off("remote-cursor-change", handleRemoteCursor);
  }, [socket, readOnly]);

  useEffect(() => {
    if (!socket || !quillRef.current || readOnly) return;
    const interval = setInterval(() => {
      const data = quillRef.current.getEditor().getContents();
      socket.emit("save-document", data);
    }, SAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [socket, readOnly]);

  // Add handlers for custom buttons (undo, redo, star, settings)
  useEffect(() => {
    if (!quillRef.current) return;
    const quill = quillRef.current.getEditor();
    document.querySelector(".ql-undo")?.addEventListener("click", () => {
      quill.history.undo();
    });
    document.querySelector(".ql-redo")?.addEventListener("click", () => {
      quill.history.redo();
    });
    document.querySelector(".ql-star")?.addEventListener("click", () => {
      alert("Starred! 🌟");
    });
    document.querySelector(".ql-settings")?.addEventListener("click", () => {
      alert("Settings clicked ⚙");
    });
  }, []);

  return (
    <div className="container" style={{ padding: "20px" }}>
      <CustomToolbar />
      <ReactQuill
        ref={quillRef}
        theme="snow"
        onChange={handleChange}
        modules={{
          toolbar: {
            container: "#custom-toolbar",
          },
        }}
        placeholder={readOnly ? "🔒 Read-only mode" : "Start writing..."}
        readOnly={readOnly}
      />
    </div>
  );
}

Editor.propTypes = {
  readOnly: PropTypes.bool,
};
