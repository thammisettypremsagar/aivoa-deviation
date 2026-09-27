import { useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  updateField,
  updateDeviation,
  resetDeviation,
} from "./store/deviationSlice";
import "./App.css";

function App() {
  const dispatch = useDispatch();

  const formData = useSelector((state) => state.deviation);

  const [inputText, setInputText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [editInstruction, setEditInstruction] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const handleChange = (e) => {
    dispatch(
      updateField({
        field: e.target.name,
        value: e.target.value,
      })
    );
  };

  // =========================================================
  // ANALYZE PASTED TEXT
  // =========================================================

  const analyzeDeviation = async () => {
    if (!inputText.trim()) {
      alert("Please paste deviation details first.");
      return;
    }

    setAiLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/deviations/extract",
        {
          text: inputText,
        }
      );

      const result = response.data.data;

      console.log("AI TEXT RESULT:", result);

      setAiResult(result);
    } catch (error) {
      console.error("AI extraction error:", error);

      if (error.response) {
        console.error("Backend response:", error.response.data);
      }

      alert(
        "Could not connect to the backend. Make sure FastAPI is running."
      );
    } finally {
      setAiLoading(false);
    }
  };

  // =========================================================
  // PDF UPLOAD
  // =========================================================

  const handlePdfUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      alert("Please select a PDF file.");
      event.target.value = "";
      return;
    }

    setAiLoading(true);

    try {
      const pdfFormData = new FormData();

      pdfFormData.append("file", file);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/deviations/extract-pdf",
        pdfFormData
      );

      const result = response.data.data;

      console.log("PDF AI RESULT:", result);

      setAiResult(result);

      // Automatically populate the form with AI-extracted information
      dispatch(
        updateDeviation({
          site: result.site || "",
          date: result.date || "",
          title: result.title || "",
          source: result.source || "",
          product: result.product || "",
          batch: result.batch || "",
          description: result.description || "",
          impact: result.impact || "",
          severity: result.severity || "",
          severity_reason: result.severity_reason || "",
        })
      );

      alert("PDF processed successfully.");
    } catch (error) {
      console.error("PDF processing error:", error);

      if (error.response) {
        console.error(
          "Backend response:",
          error.response.data
        );
      }

      alert(
        "Could not process the PDF. Make sure FastAPI is running."
      );
    } finally {
      setAiLoading(false);

      // Allows the same PDF to be selected again
      event.target.value = "";
    }
  };

  // =========================================================
  // APPLY AI RESULT TO FORM
  // =========================================================

  const applyToForm = () => {
    if (!aiResult) return;

    dispatch(
      updateDeviation({
        site: aiResult.site || "",
        date: aiResult.date || "",
        title: aiResult.title || "",
        source: aiResult.source || "",
        product: aiResult.product || "",
        batch: aiResult.batch || "",
        description: aiResult.description || "",
        impact: aiResult.impact || "",
        severity: aiResult.severity || "",
        severity_reason: aiResult.severity_reason || "",
      })
    );
  };

  // =========================================================
  // AI EDIT INTERACTION
  // =========================================================

  const editWithAI = async () => {
    if (!editInstruction.trim()) {
      alert("Please enter a change for the AI assistant.");
      return;
    }

    setEditLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/deviations/edit",
        {
          instruction: editInstruction,
          current_data: formData,
        }
      );

      const updated = response.data.data;

      dispatch(updateDeviation(updated));

      setAiResult((prev) => ({
        ...(prev || {}),
        ...updated,
      }));

      setEditInstruction("");

      alert("AI edit applied successfully.");
    } catch (error) {
      console.error("AI edit error:", error);

      if (error.response) {
        console.error(
          "Backend response:",
          error.response.data
        );
      }

      alert("Could not apply the AI edit.");
    } finally {
      setEditLoading(false);
    }
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    dispatch(resetDeviation());
    setInputText("");
    setAiResult(null);
    setEditInstruction("");
  };

  // =========================================================
  // SAVE DEVIATION
  // =========================================================

  const saveDeviation = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/deviations",
        {
          site: formData.site,
          date: formData.date,
          title: formData.title,
          source: formData.source,
          product: formData.product,
          batch: formData.batch,
          description: formData.description,
          impact: formData.impact,
          severity: formData.severity,
          severity_reason: aiResult?.severity_reason || "",
        }
      );

      console.log("SAVE RESPONSE:", response.data);

      alert(
        `Deviation saved successfully. ID: ${response.data.id}`
      );
    } catch (error) {
      console.error("Save error:", error);

      if (error.response) {
        console.error(
          "Backend response:",
          error.response.data
        );
      }

      alert(
        "Could not save the deviation. Make sure the backend is running."
      );
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="app">

      {/* ================= HEADER ================= */}

      <header className="header">

        <div>
          <h1>AIVOA.AI</h1>
          <p>Deviation Management System</p>
        </div>

        <div className="header-status">
          <span className="status-dot"></span>
          AI Assistant Active
        </div>

      </header>

      {/* ================= MAIN ================= */}

      <main className="main-container">

        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <section className="form-panel">

          <div className="panel-heading">

            <h2>Log Deviation</h2>

            <p>
              Review and verify the extracted deviation information.
            </p>

          </div>

          <div className="form-grid">

            {/* SITE */}

            <div className="form-group">

              <label>Site / Plant</label>

              <input
                name="site"
                value={formData.site}
                onChange={handleChange}
                placeholder="Enter site or plant"
              />

            </div>

            {/* DATE */}

            <div className="form-group">

              <label>Date of Occurrence</label>

              <input
                name="date"
                value={formData.date}
                onChange={handleChange}
                placeholder="DD/MM/YYYY"
              />

            </div>

            {/* TITLE */}

            <div className="form-group full">

              <label>Title / Short Description</label>

              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter deviation title"
              />

            </div>

            {/* SOURCE */}

            <div className="form-group">

              <label>Source</label>

              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
              >

                <option value="">
                  Select source
                </option>

                <option value="Manufacturing Process">
                  Manufacturing Process
                </option>

                <option value="Equipment">
                  Equipment
                </option>

                <option value="Quality Control">
                  Quality Control
                </option>

                <option value="Documentation">
                  Documentation
                </option>

                <option value="Supplier">
                  Supplier
                </option>

              </select>

            </div>

            {/* PRODUCT */}

            <div className="form-group">

              <label>Related Product / Material</label>

              <input
                name="product"
                value={formData.product}
                onChange={handleChange}
                placeholder="Product / material"
              />

            </div>

            {/* BATCH */}

            <div className="form-group full">

              <label>Batch / Lot Number</label>

              <input
                name="batch"
                value={formData.batch}
                onChange={handleChange}
                placeholder="Batch or lot number"
              />

            </div>

            {/* DESCRIPTION */}

            <div className="form-group full">

              <label>Detailed Description</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed description of the deviation"
                rows="5"
              />

            </div>

            {/* IMPACT */}

            <div className="form-group full">

              <label>Initial Impact</label>

              <textarea
                name="impact"
                value={formData.impact}
                onChange={handleChange}
                placeholder="Describe the potential impact"
                rows="4"
              />

            </div>

            {/* SEVERITY */}

            <div className="form-group">

              <label>Initial Severity</label>

              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
              >

                <option value="">
                  Select severity
                </option>

                <option value="Low">
                  Low
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="High">
                  High
                </option>

                <option value="Critical">
                  Critical
                </option>

              </select>

            </div>

          </div>

          {/* FORM BUTTONS */}

          <div className="form-actions">

            <button
              className="reset-button"
              onClick={resetForm}
            >
              Reset Form
            </button>

            <button
              className="save-button"
              onClick={saveDeviation}
            >
              Save Deviation
            </button>

          </div>

        </section>

        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <section className="ai-panel">

          <div className="ai-heading">

            <div className="ai-icon">
              ✦
            </div>

            <div>

              <h2>AI Deviation Assistant</h2>

              <p>
                Extract, analyze and assess deviation information.
              </p>

            </div>

          </div>

          {/* =================================================
              PDF UPLOAD
          ================================================= */}

          <div className="upload-box">

            <div className="upload-icon">
              ↑
            </div>

            <h3>
              Upload Deviation Document
            </h3>

            <p>
              Drag & drop a PDF document here or choose a file
            </p>

            <label className="upload-btn">

              Choose PDF

              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handlePdfUpload}
                style={{ display: "none" }}
              />

            </label>

            <span className="supported">
              Supported format: PDF
            </span>

          </div>

          {/* DIVIDER */}

          <div className="divider">
            <span>OR</span>
          </div>

          {/* =================================================
              TEXT INPUT
          ================================================= */}

          <div className="ai-input-section">

            <label>
              Paste Deviation Details
            </label>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste deviation report, email or incident details here..."
              rows="7"
            />

            <button
              className="analyze-button"
              onClick={analyzeDeviation}
              disabled={aiLoading}
            >

              {aiLoading
                ? "Analyzing..."
                : "✦ Analyze with AI"}

            </button>

          </div>

          {/* =================================================
              AI RESULT
          ================================================= */}

          {aiResult && (

            <div className="ai-result">

              <div className="result-header">

                <div>

                  <h3>
                    AI Extraction Complete
                  </h3>

                  <p>
                    Review the information before applying it.
                  </p>

                </div>

                <span className="complete-badge">
                  ✓ Complete
                </span>

              </div>

              {/* EXTRACTED FIELDS */}

              <div className="extracted-fields">

                <div>

                  <span>
                    Batch Number
                  </span>

                  <strong>
                    {aiResult.batch || "Not identified"}
                  </strong>

                </div>

                <div>

                  <span>
                    Product
                  </span>

                  <strong>
                    {aiResult.product || "Not identified"}
                  </strong>

                </div>

                <div>

                  <span>
                    Source
                  </span>

                  <strong>
                    {aiResult.source || "Not identified"}
                  </strong>

                </div>

                <div>

                  <span>
                    Severity
                  </span>

                  <strong className="severity-high">
                    {aiResult.severity || "Not assessed"}
                  </strong>

                </div>

              </div>

              {/* IMPACT */}

              <div className="impact-card">

                <div className="impact-title">

                  <span>
                    AI Impact Assessment
                  </span>

                  <span className="ai-badge">
                    AI Assisted
                  </span>

                </div>

                <div className="severity-display">

                  <span>
                    Recommended Severity
                  </span>

                  <strong>
                    {aiResult.severity
                      ? aiResult.severity.toUpperCase()
                      : "NOT ASSESSED"}
                  </strong>

                </div>

                <p>
                  {aiResult.impact ||
                    "No impact assessment available."}
                </p>

                {/* SEVERITY REASON */}

                {aiResult.severity_reason && (

                  <div className="severity-reason">

                    <strong>
                      Reason:
                    </strong>

                    <span>
                      {aiResult.severity_reason}
                    </span>

                  </div>

                )}

                <small>
                  AI-assisted assessment — Review required
                </small>

              </div>

              {/* APPLY BUTTON */}

              <button
                className="apply-button"
                onClick={applyToForm}
              >
                Apply AI Information to Form →
              </button>

            </div>

          )}

          {/* =================================================
              AI EDIT INTERACTION
          ================================================= */}

          {aiResult && (

            <div className="ai-input-section">

              <label>
                Ask AI to edit the form
              </label>

              <textarea
                value={editInstruction}
                onChange={(e) =>
                  setEditInstruction(e.target.value)
                }
                placeholder="Example: Change batch number to API-24092 and severity to Medium"
                rows="3"
              />

              <button
                className="analyze-button"
                onClick={editWithAI}
                disabled={editLoading}
              >
                {editLoading
                  ? "Updating..."
                  : "✦ Apply AI Edit"}
              </button>

            </div>

          )}

          {/* EMPTY AI STATE */}

          {!aiResult && (

            <div className="empty-ai">

              <div className="empty-icon">
                ✦
              </div>

              <h3>
                AI analysis will appear here
              </h3>

              <p>
                Upload a deviation document or paste the
                deviation details to begin AI extraction.
              </p>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default App;