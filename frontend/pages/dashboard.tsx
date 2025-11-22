import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
interface User {
  fullName: string;
  email: string;
  _id: string;
}

interface Row {
  object: string;
  confidence: number;
  bbox: string;
  bbox_array: number[]; // this property exists in the data
}

export default function AIVisionDashboard() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadAreaRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const [previewSrc, setPreviewSrc] = useState<string>("");
  const [imageActive, setImageActive] = useState(false);
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const [rows, setRows] = useState<Row[]>([]);

  const [sortState, setSortState] = useState<{
    col: number | null;
    asc: boolean;
  }>({
    col: null,
    asc: false,
  });

  const [messages, setMessages] = useState<
    { who: "user" | "ai"; text: string }[]
  >([]);

  // Handle file and create preview
  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewSrc(String(e.target?.result ?? ""));
      setImageActive(true);
    };
    reader.readAsDataURL(file);
  }

  // Handle file selection via input
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFileInput(file);
    if (!file) return;

    handleFile(file);

    // Reset input so same file can be selected again
    // if (fileInputRef.current) fileInputRef.current.value = "";
  };

  function onUploadAreaClick() {
    fileInputRef.current?.click();
  }

  async function detectImage() {
    const file = fileInput;

    if (!file) {
      console.error("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_YOLO_URL}/detect`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        console.error("Detection failed");
        return;
      }

      const result = await response.json();

      // OPTIONAL: update table + annotated preview
      setRows(
        result.detections.map(
          (d: {
            class: string;
            confidence: number;
            bbox: [number, number, number, number];
          }) => {
            return {
              object:
                d.class.charAt(0).toUpperCase() +
                d.class.slice(1).toLowerCase(),
              confidence: Math.round(d.confidence * 100),
              bbox: `(${Math.round(d.bbox[0])}, ${Math.round(
                d.bbox[1]
              )}, ${Math.round(d.bbox[2])}, ${Math.round(d.bbox[3])})`,
            };
          }
        )
      );

      // If backend returns an annotated image:
      if (result.annotated_image) {
        setPreviewSrc(`data:image/jpeg;base64,${result.annotated_image}`);
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(true);
  }

  function onDragLeave() {
    setDragOver(false);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  }

  function removeImage() {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setPreviewSrc("");
    setImageActive(false);
  }

  // Table sorting
  function sortTable(columnIndex: number) {
    const isSameColumn = sortState.col === columnIndex;
    const asc = isSameColumn ? !sortState.asc : false; // toggle or default descending
    setSortState({ col: columnIndex, asc });

    const sorted = [...rows].sort((a, b) => {
      if (columnIndex === 0) {
        return asc
          ? a.object.localeCompare(b.object)
          : b.object.localeCompare(a.object);
      }
      if (columnIndex === 1) {
        return asc ? a.confidence - b.confidence : b.confidence - a.confidence;
      }
      // bbox string compare
      return asc ? a.bbox.localeCompare(b.bbox) : b.bbox.localeCompare(a.bbox);
    });
    setRows(sorted);
  }

  // Chat auto-scroll
  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const img = document.getElementById("previewImg") as HTMLImageElement;
    const canvas = document.getElementById(
      "overlayCanvas"
    ) as HTMLCanvasElement;

    if (!img || !canvas || !rows.length) return;

    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const colors = ["#10b981", "#2563eb", "#f59e0b", "#ec4899", "#8b5cf6"];

    rows.forEach((r, idx) => {
      const [x1, y1, x2, y2] = r.bbox
        .replace(/[()]/g, "")
        .split(",")
        .map((v) => parseInt(v.trim(), 10));

      ctx.strokeStyle = colors[idx % colors.length];
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]); // dashed
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      ctx.font = "16px Arial";
      ctx.fillStyle = colors[idx % colors.length];
      ctx.fillText(`${r.object} (${r.confidence}%)`, x1 + 4, y1 + 18);
    });
  }, [rows, previewSrc]);

  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const userInfoStr = localStorage.getItem("userInfo");
      if (!userInfoStr) {
        router.push("/"); // redirect to login if no token
      }
      try {
        const userInfo: User = userInfoStr ? JSON.parse(userInfoStr) : null;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/current-user`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: userInfo._id }),
          }
        );
        const data = await res.json();
        // debugger;
        // if (!res.ok) {
        //   router.push("/"); // redirect to login if not authenticated
        //   return alert(data.error);
        // }
        setUser(userInfo);
        return;
      } catch (err) {
        localStorage.removeItem("userInfo");
        router.push("/");
      }
    };
    checkAuth();
  }, [router]);

  // // Example: programmatically add a message (e.g., after a detection)
  // function addAIMessage(text: string) {
  //   setMessages((m) => [...m, { who: "ai", text }]);
  // }

  async function sendMessage() {
    const val = inputValue.trim();
    if (!val) return;

    // push user message ⬇
    setMessages((m) => [...m, { who: "user", text: val }]);

    // clear input
    setInputValue("");

    try {
      // ---- REAL API CALL ----
      const payload = {
        question: val,
        detections: rows.map((r) => ({
          class: r.object.toLowerCase(),
          confidence: r.confidence / 100,
          bbox: r.bbox_array, // make sure this is [x1, y1, x2, y2] numbers
        })),
      };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_YOLO_URL}/ai/question`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        throw new Error("Network response failed");
      }

      const data = await res.json();

      // Push AI message
      setMessages((m) => [
        ...m,
        { who: "ai", text: data.reply || data.answer || "No response" },
      ]);
    } catch (err) {
      // Handle failure
      setMessages((m) => [
        ...m,
        { who: "ai", text: "Error: Failed to get response from server." },
      ]);
      console.error(err);
    }
  }

  async function submitLogout() {
    localStorage.removeItem("userInfo");
    router.push("/");
  }

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </div>
            <h1>AI Vision Platform</h1>
          </div>
          <div className="user-menu">
            <div className="user-info">
              <div className="avatar">JD</div>
              <div className="user-details">
                <div className="user-name">{user?.fullName}</div>
                <div className="user-email">{user?.email}</div>
              </div>
            </div>
            <button className="logout-btn" onClick={submitLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="upload-section">
          <h2 className="section-title">Upload Image for Detection</h2>
          <p className="section-subtitle">
            Upload an image to detect objects using our advanced YOLO model
          </p>

          <div
            id="uploadArea"
            ref={uploadAreaRef}
            onClick={onUploadAreaClick}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`upload-area ${dragOver ? "dragover" : ""}`}
          >
            <div className="upload-icon">
              <svg viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <div className="upload-text">Drop your image here</div>
            <div className="upload-subtext">
              or click to browse (PNG, JPG, JPEG up to 10MB)
            </div>
            <button
              type="button"
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              Select Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              id="fileInput"
              className="file-input"
              accept="image/*"
              onChange={onFileChange}
              style={{ display: "none" }}
            />
          </div>

          <div
            id="imagePreview"
            className={`image-preview ${imageActive ? "active" : ""}`}
          >
            <div className="preview-container">
              <div className="preview-image-wrapper">
                <img
                  src={previewSrc}
                  alt="Preview"
                  className="preview-image"
                  id="previewImg"
                />
              </div>
              <div className="preview-actions">
                <button
                  type="button"
                  className="action-btn detect-btn"
                  onClick={() => detectImage()}
                >
                  Detect Objects
                </button>
                <button
                  type="button"
                  className="action-btn remove-btn"
                  onClick={removeImage}
                >
                  Remove Image
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="results-section active" id="resultsSection">
          <div className="results-grid">
            <div className="result-card">
              <div className="card-header">
                <h3 className="card-title">Annotated Image</h3>
                <span className="card-badge"> {rows.length} Objects</span>
              </div>
              {previewSrc ? (
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={previewSrc}
                    alt="Preview"
                    id="previewImg"
                    style={{ display: "block" }}
                  />
                  <canvas
                    id="overlayCanvas"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      pointerEvents: "none", // lets clicks pass through
                    }}
                  />
                </div>
              ) : (
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect fill='%23f1f5f9' width='600' height='400'/%3E%3Crect x='80' y='120' width='180' height='160' fill='none' stroke='%2310b981' stroke-width='3' stroke-dasharray='8 4'/%3E%3Ctext x='90' y='145' font-family='Arial' font-size='14' font-weight='bold' fill='%2310b981'%3ECar (0.94)%3C/text%3E%3Crect x='340' y='80' width='140' height='180' fill='none' stroke='%232563eb' stroke-width='3' stroke-dasharray='8 4'/%3E%3Ctext x='350' y='105' font-family='Arial' font-size='14' font-weight='bold' fill='%232563eb'%3EPerson (0.89)%3C/text%3E%3Crect x='150' y='260' width='100' height='80' fill='none' stroke='%23f59e0b' stroke-width='3' stroke-dasharray='8 4'/%3E%3Ctext x='160' y='285' font-family='Arial' font-size='14' font-weight='bold' fill='%23f59e0b'%3EBike (0.87)%3C/text%3E%3Crect x='380' y='280' width='120' height='90' fill='none' stroke='%23ec4899' stroke-width='3' stroke-dasharray='8 4'/%3E%3Ctext x='390' y='305' font-family='Arial' font-size='14' font-weight='bold' fill='%23ec4899'%3ESign (0.76)%3C/text%3E%3Crect x='20' y='30' width='80' height='60' fill='none' stroke='%238b5cf6' stroke-width='3' stroke-dasharray='8 4'/%3E%3Ctext x='30' y='55' font-family='Arial' font-size='14' font-weight='bold' fill='%238b5cf6'%3ETree (0.82)%3C/text%3E%3C/svg%3E"
                  alt="Annotated"
                  className="annotated-image"
                />
              )}
            </div>

            <div className="result-card">
              <div className="card-header">
                <h3 className="card-title">Detection Results</h3>
                <span className="card-badge">Sortable</span>
              </div>
              <div className="table-wrapper">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th onClick={() => sortTable(0)}>
                        Object
                        <span className="sort-icon">
                          {sortState.col === 0
                            ? sortState.asc
                              ? "▲"
                              : "▼"
                            : "▼"}
                        </span>
                      </th>
                      <th onClick={() => sortTable(1)}>
                        Confidence
                        <span className="sort-icon">
                          {sortState.col === 1
                            ? sortState.asc
                              ? "▲"
                              : "▼"
                            : "▼"}
                        </span>
                      </th>
                      <th onClick={() => sortTable(2)}>
                        Bounding Box
                        <span className="sort-icon">
                          {sortState.col === 2
                            ? sortState.asc
                              ? "▲"
                              : "▼"
                            : "▼"}
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className="object-class">{r.object}</span>
                        </td>
                        <td>
                          <div className="confidence-bar">
                            <div className="confidence-progress">
                              <div
                                className="confidence-fill"
                                style={{ width: `${r.confidence}%` }}
                              />
                            </div>
                            <span className="confidence-value">
                              {r.confidence}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="bbox-coords">{r.bbox}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="qa-section">
            <div className="qa-header">
              <div className="qa-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path>
                </svg>
              </div>
              <div>
                <h3 className="card-title">Ask Questions About Results</h3>
                <p className="section-subtitle" style={{ margin: 0 }}>
                  Powered by Gemini 2.5 Flash
                </p>
              </div>
            </div>

            <div className="chat-container" ref={chatContainerRef}>
              {messages.map((m, i) => (
                <div key={i} className={`chat-message ${m.who}`}>
                  <div className={`message-avatar ${m.who}`}>
                    {m.who === "user" ? "JD" : "AI"}
                  </div>
                  <div className="message-content">{m.text}</div>
                </div>
              ))}
            </div>

            <div className="qa-input-wrapper">
              <input
                type="text"
                className="qa-input"
                placeholder="Ask a question about the detected objects..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
              />
              <button className="qa-submit" onClick={sendMessage}>
                Send
              </button>
            </div>
          </div>
        </div>
        <style jsx global>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: "Inter", sans-serif;
            background: #f8fafc;
            min-height: 100vh;
          }

          .header {
            background: white;
            border-bottom: 1px solid #e2e8f0;
            padding: 18px 0;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          }

          .header-content {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 32px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .logo {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .logo-icon {
            width: 38px;
            height: 38px;
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            border-radius: 9px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .logo-icon svg {
            width: 22px;
            height: 22px;
            stroke: white;
            stroke-width: 2.5;
            fill: none;
          }

          .logo h1 {
            font-size: 20px;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: -0.3px;
          }

          .user-menu {
            display: flex;
            align-items: center;
            gap: 20px;
          }

          .user-info {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 16px 8px 8px;
            background: #f8fafc;
            border-radius: 24px;
            cursor: pointer;
            transition: background 0.3s ease;
          }

          .user-info:hover {
            background: #f1f5f9;
          }

          .avatar {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            color: white;
            font-size: 14px;
          }

          .user-details {
            display: flex;
            flex-direction: column;
          }

          .user-name {
            font-size: 14px;
            font-weight: 600;
            color: #0f172a;
            line-height: 1.2;
          }

          .user-email {
            font-size: 12px;
            color: #64748b;
          }

          .logout-btn {
            padding: 9px 18px;
            background: white;
            border: 1.5px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            color: #475569;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: "Inter", sans-serif;
          }

          .logout-btn:hover {
            border-color: #cbd5e1;
            background: #f8fafc;
          }

          .main-content {
            max-width: 1400px;
            margin: 0 auto;
            padding: 32px 32px 60px;
          }

          .upload-section {
            background: white;
            border-radius: 16px;
            padding: 36px;
            margin-bottom: 28px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
            border: 1px solid #e2e8f0;
          }

          .section-title {
            font-size: 20px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 8px;
            letter-spacing: -0.3px;
          }

          .section-subtitle {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 28px;
          }

          .upload-area {
            border: 2px dashed #cbd5e1;
            border-radius: 12px;
            padding: 48px 32px;
            text-align: center;
            background: #f8fafc;
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
          }

          .upload-area:hover {
            border-color: #2563eb;
            background: #eff6ff;
          }

          .upload-area.dragover {
            border-color: #2563eb;
            background: #eff6ff;
          }

          .upload-icon {
            width: 56px;
            height: 56px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 18px;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
          }

          .upload-icon svg {
            width: 28px;
            height: 28px;
            stroke: #2563eb;
            stroke-width: 2;
            fill: none;
          }

          .upload-text {
            font-size: 16px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 6px;
          }

          .upload-subtext {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 20px;
          }

          .upload-btn {
            padding: 11px 24px;
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: "Inter", sans-serif;
          }

          .upload-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
          }

          .file-input {
            display: none;
          }

          .image-preview {
            display: none;
            margin-top: 28px;
          }

          .image-preview.active {
            display: block;
          }

          .preview-container {
            display: flex;
            gap: 24px;
            align-items: flex-start;
          }

          .preview-image-wrapper {
            flex: 1;
            position: relative;
            border-radius: 12px;
            overflow: hidden;
            background: #f1f5f9;
            max-width: 500px;
          }

          .preview-image {
            width: 100%;
            height: auto;
            display: block;
          }

          .preview-actions {
            flex: 0 0 auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .action-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: "Inter", sans-serif;
            white-space: nowrap;
          }

          .detect-btn {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          }

          .detect-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
          }

          .remove-btn {
            background: white;
            color: #ef4444;
            border: 1.5px solid #fecaca;
          }

          .remove-btn:hover {
            background: #fef2f2;
            border-color: #fca5a5;
          }

          .results-section {
            display: none;
            margin-top: 28px;
          }

          .results-section.active {
            display: block;
          }

          .results-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 28px;
          }

          .result-card {
            background: white;
            border-radius: 16px;
            padding: 28px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
            border: 1px solid #e2e8f0;
          }

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }

          .card-title {
            font-size: 17px;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: -0.2px;
          }

          .card-badge {
            padding: 5px 12px;
            background: #eff6ff;
            color: #2563eb;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }

          .annotated-image-wrapper {
            border-radius: 10px;
            overflow: hidden;
            background: #f1f5f9;
          }

          .annotated-image {
            width: 100%;
            height: auto;
            display: block;
          }

          .table-wrapper {
            overflow-x: auto;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
          }

          .results-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
          }

          .results-table thead {
            background: #f8fafc;
          }

          .results-table th {
            padding: 14px 16px;
            text-align: left;
            font-weight: 600;
            color: #475569;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            cursor: pointer;
            user-select: none;
            position: relative;
          }

          .results-table th:hover {
            background: #f1f5f9;
          }

          .sort-icon {
            display: inline-block;
            margin-left: 6px;
            opacity: 0.4;
            font-size: 11px;
          }

          .results-table th.sorted .sort-icon {
            opacity: 1;
          }

          .results-table td {
            padding: 14px 16px;
            border-top: 1px solid #e2e8f0;
            color: #334155;
          }

          .results-table tbody tr:hover {
            background: #f8fafc;
          }

          .object-class {
            display: inline-flex;
            align-items: center;
            padding: 4px 10px;
            background: #f1f5f9;
            color: #475569;
            border-radius: 6px;
            font-weight: 500;
            font-size: 13px;
          }

          .confidence-bar {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .confidence-progress {
            flex: 1;
            height: 6px;
            background: #e2e8f0;
            border-radius: 3px;
            overflow: hidden;
          }

          .confidence-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981 0%, #059669 100%);
            border-radius: 3px;
            transition: width 0.4s ease;
          }

          .confidence-value {
            font-weight: 600;
            color: #0f172a;
            font-size: 13px;
            min-width: 45px;
          }

          .bbox-coords {
            font-family: "Courier New", monospace;
            font-size: 12px;
            color: #64748b;
          }

          .qa-section {
            background: white;
            border-radius: 16px;
            padding: 28px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
            border: 1px solid #e2e8f0;
          }

          .qa-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
          }

          .qa-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .qa-icon svg {
            width: 22px;
            height: 22px;
            stroke: white;
            stroke-width: 2.5;
            fill: none;
          }

          .chat-container {
            max-height: 320px;
            overflow-y: auto;
            margin-bottom: 20px;
            padding: 16px;
            background: #f8fafc;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
          }

          .chat-message {
            margin-bottom: 16px;
            display: flex;
            gap: 12px;
          }

          .chat-message.user {
            flex-direction: row-reverse;
          }

          .message-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 12px;
            flex-shrink: 0;
          }

          .message-avatar.user {
            background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
            color: white;
          }

          .message-avatar.ai {
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: white;
          }

          .message-content {
            max-width: 75%;
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 14px;
            line-height: 1.6;
          }

          .chat-message.user .message-content {
            background: #2563eb;
            color: white;
            border-bottom-right-radius: 4px;
          }

          .chat-message.ai .message-content {
            background: white;
            color: #334155;
            border: 1px solid #e2e8f0;
            border-bottom-left-radius: 4px;
          }

          .qa-input-wrapper {
            display: flex;
            gap: 12px;
          }

          .qa-input {
            flex: 1;
            padding: 13px 18px;
            border: 1.5px solid #e2e8f0;
            border-radius: 10px;
            font-size: 14px;
            font-family: "Inter", sans-serif;
            transition: all 0.3s ease;
          }

          .qa-input:focus {
            outline: none;
            border-color: #8b5cf6;
            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
          }

          .qa-submit {
            padding: 13px 24px;
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: "Inter", sans-serif;
            white-space: nowrap;
          }

          .qa-submit:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(139, 92, 246, 0.3);
          }

          .empty-state {
            text-align: center;
            padding: 32px;
            color: #94a3b8;
          }

          .empty-state svg {
            width: 48px;
            height: 48px;
            stroke: #cbd5e1;
            stroke-width: 1.5;
            fill: none;
            margin: 0 auto 16px;
          }

          .empty-state p {
            font-size: 14px;
          }

          @media (max-width: 1024px) {
            .results-grid {
              grid-template-columns: 1fr;
            }

            .preview-container {
              flex-direction: column;
            }

            .preview-image-wrapper {
              max-width: 100%;
            }

            .preview-actions {
              flex-direction: row;
              width: 100%;
            }

            .action-btn {
              flex: 1;
            }
          }

          @media (max-width: 768px) {
            .header-content {
              padding: 0 20px;
            }

            .main-content {
              padding: 20px;
            }

            .upload-section,
            .result-card,
            .qa-section {
              padding: 24px 20px;
            }

            .user-details {
              display: none;
            }

            .table-wrapper {
              font-size: 13px;
            }

            .results-table th,
            .results-table td {
              padding: 10px 12px;
            }

            .message-content {
              max-width: 85%;
            }
          }

          @media (max-width: 480px) {
            .logo h1 {
              font-size: 16px;
            }

            .section-title {
              font-size: 18px;
            }

            .upload-area {
              padding: 32px 20px;
            }

            .qa-input-wrapper {
              flex-direction: column;
            }

            .qa-submit {
              width: 100%;
            }
          }
        `}</style>
      </main>
    </>
  );
}
