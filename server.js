const express = require("express");
const mongoose = require("mongoose");
const Document = require("./Document");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // or use another like "hotmail"
  auth: {
    user: "baraiyanihar106@gmail.com",          //  Replace with your email
    pass: "your app password",       //  Use Gmail App Password (not regular password)
  },
});

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/docs", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const defaultValue = { ops: [] };

// Real-time collaboration logic
io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

   socket.on("save-document", async (data) => {
  try {
    const doc = await Document.findById(documentId);
    if (!doc) return;

    doc.data = data;
    doc.versions.push({ data }); //  push version snapshot
    await doc.save();            //  save updated doc
    console.log("Auto-saved document version");
  } catch (err) {
    console.error("Error saving document:", err);
  }
});

  

    //  Real-time cursor position broadcast
    socket.on("cursor-change", (cursor) => {
      socket.broadcast.to(documentId).emit("remote-cursor-change", {
        ...cursor,
        socketId: socket.id,
      });
    });
  });
});

// Utility to find or create a document
async function findOrCreateDocument(id) {
  if (!id) return;
  const doc = await Document.findById(id);
  if (doc) return doc;
  return await Document.create({ _id: id, data: defaultValue });
}

// Async error wrapper
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ---------------------- REST API Routes ----------------------

// Get single document
app.get("/documents/:id", asyncHandler(async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).send("Not found");
  res.json(doc);
}));

// List all documents
app.get("/documents", asyncHandler(async (req, res) => {
  const docs = await Document.find().sort({ pinned: -1, updatedAt: -1 });
  res.json(docs);
}));

// Update document title
app.post("/documents/:id/title", asyncHandler(async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Title required" });
  const doc = await Document.findByIdAndUpdate(req.params.id, { title }, { new: true });
  res.json(doc);
}));

// Delete a document
app.delete("/documents/:id", asyncHandler(async (req, res) => {
  await Document.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
}));

// Toggle pinned state
app.post("/documents/:id/pin", asyncHandler(async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).send("Not found");
  doc.pinned = !doc.pinned;
  await doc.save();
  res.json(doc);
}));

// Toggle read-only state
app.post("/documents/:id/readonly", asyncHandler(async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).send("Not found");
  doc.readOnly = !doc.readOnly;
  await doc.save();
  res.json(doc);
}));

// Get document version history
app.get("/documents/:id/versions", asyncHandler(async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).send("Not found");
  res.json(doc.versions || []);
}));

// Restore a document from a specific version
app.post("/documents/:id/restore/:versionId", asyncHandler(async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).send("Not found");
  const version = doc.versions.id(req.params.versionId);
  if (!version) return res.status(404).send("Version not found");
  doc.data = version.data;
  await doc.save();
  res.json(doc);
}));

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});
// Share a document via email (roles)
// Share document with a user (email + role)
app.post("/documents/:id/share", asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: "Document not found" });

  // Check for duplicates
  const alreadyShared = doc.sharedWith.some((entry) => entry.email === email);
  if (alreadyShared) {
    return res.status(400).json({ error: "Already shared with this email" });
  }

  doc.sharedWith.push({ email, role });
  await doc.save();

  // 🔧 Try sending email
  try {
    await transporter.sendMail({
      from: "baraiya@gmail.com",
      to: email,
      subject: "You've been invited to collaborate",
      text: `You have been invited as a ${role} to a document.\nOpen: http://localhost:5173/documents/${req.params.id}`,
    });

    res.json({ message: "Shared successfully and email sent" });
  } catch (emailError) {
    console.error("📧 Email failed:", emailError); // <-- log real error
    res.status(500).json({ error: "Failed to send email, but user was added" });
  }
}));


// Start the server
server.listen(3001, () => {
  console.log("✅ Server is running at http://localhost:3001");
});
