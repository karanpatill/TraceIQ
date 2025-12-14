import { useEffect, useState } from "react";
import axios from "axios";
import { FeaturesSection } from "./components/FeaturesSection";

function App() {
  const [status, setStatus] = useState("loading");
  const [file, setFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [projectId, setProjectId] = useState(null);

  // Google Login init
  useEffect(() => {
    /* global google */
    if (!window.google || !window.google.accounts?.id) {
      console.warn("Google Identity script not loaded");
      return;
    }

    window.google.accounts.id.initialize({
      client_id:
        "379071280284-tt3ekucit1ikbr1jcs2u11v8jgljvk35.apps.googleusercontent.com",
      callback: async (response) => {
        try {
          const res = await axios.post("http://localhost:3000/auth/google", {
            credential: response.credential,
          });

          const { token, user } = res.data;

          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
          
          // Cancel Google button before updating state
          window.google.accounts.id.cancel();
          
          setToken(token);
          setUser(user);
          console.log("Logged in as:", user.email);
        } catch (err) {
          console.error("Google login failed:", err);
          alert("Google login failed");
        }
      },
    });
  }, []);

  // backend health check
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await axios.get("http://localhost:3000/health");
        setStatus(res.data.status);
      } catch (err) {
        console.error("Health check failed:", err);
        setStatus("error");
      }
    };

    checkHealth();
  }, []);

  const resetAnalysisState = () => {
    setAnalysisResult(null);
    setAiText("");
    setProjectId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setFile(null);
    resetAnalysisState();
    setRepos([]);
    setSelectedRepo("");
  };

  // file upload + analysis handler
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    if (!token) {
      alert("Please sign in with Google first");
      return;
    }

    try {
      setLoadingUpload(true);
      resetAnalysisState();

      const formData = new FormData();
      formData.append("project", file);

      const res = await axios.post("http://localhost:3000/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload + analysis response:", res.data);
      alert("File uploaded & analyzed successfully");

      if (res.data.scanResult) {
        setAnalysisResult(res.data.scanResult);
      } else {
        console.warn("No scanResult field in response");
      }

      if (res.data.projectDoc && res.data.projectDoc._id) {
        setProjectId(res.data.projectDoc._id);
      } else {
        console.warn("No projectDoc._id in response");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert(
        err.response?.data?.message ||
          "File upload failed (maybe too large or invalid zip)"
      );
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleExplainWithAI = async () => {
    if (!token) {
      alert("Please sign in first");
      return;
    }
    if (!projectId) {
      alert("Analyze a project first");
      return;
    }

    try {
      setAiLoading(true);
      setAiText("");

      const res = await axios.post(
        "http://localhost:3000/ai/explain",
        { projectId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAiText(res.data.explanation || "No explanation received");
    } catch (err) {
      console.error("AI explain failed:", err);
      alert(
        err.response?.data?.message ||
          "AI explanation failed (possibly timeout)"
      );
    } finally {
      setAiLoading(false);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#050507",
      fontFamily: "'Inter', '-apple-system', 'Segoe UI', sans-serif",
      margin: 0,
      display: "flex",
      flexDirection: "column",
      color: "#e4e4e7",
    },
    header: {
      background: "rgba(5, 5, 7, 0.95)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(120, 200, 200, 0.1)",
      padding: "20px 48px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,
      position: "sticky",
      top: 0,
      zIndex: 100,
    },
    headerLeft: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
    },
    logo: {
      width: "40px",
      height: "40px",
      background: "#0ea5a5",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontWeight: "800",
      fontSize: "20px",
      boxShadow: "0 0 20px rgba(14, 165, 165, 0.2)",
    },
    title: {
      fontSize: "26px",
      fontWeight: "700",
      color: "#f4f4f5",
      margin: 0,
      letterSpacing: "-0.5px",
    },
    userInfo: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
    },
    userBadge: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      background: "rgba(14, 165, 165, 0.05)",
      borderRadius: "24px",
      padding: "8px 16px",
      border: "1px solid rgba(14, 165, 165, 0.2)",
    },
    avatar: {
      width: "34px",
      height: "34px",
      background: "#0ea5a5",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontSize: "13px",
      fontWeight: "600",
    },
    userEmail: {
      fontSize: "13px",
      color: "#a1a1a6",
    },
    logoutBtn: {
      padding: "8px 12px",
      backgroundColor: "rgba(14, 165, 165, 0.1)",
      border: "1px solid rgba(14, 165, 165, 0.2)",
      borderRadius: "6px",
      cursor: "pointer",
      color: "#0ea5a5",
      fontSize: "13px",
      fontWeight: "500",
      transition: "all 0.3s",
    },
    main: {
      maxWidth: "1100px",
      margin: "0 auto",
      padding: "60px 48px",
      flex: 1,
      width: "100%",
      boxSizing: "border-box",
    },
    statusBadge: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "48px",
      padding: "10px 14px",
      background: "rgba(14, 165, 165, 0.05)",
      borderRadius: "6px",
      border: "1px solid rgba(14, 165, 165, 0.15)",
      width: "fit-content",
      fontSize: "12px",
      color: "#71d5d5",
      fontWeight: "500",
    },
    statusIcon: {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      animation: "pulse 2s infinite",
    },
    card: {
      background: "rgba(15, 15, 20, 0.8)",
      border: "1px solid rgba(14, 165, 165, 0.1)",
      borderRadius: "12px",
      padding: "44px",
      backdropFilter: "blur(10px)",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
    },
    cardTitle: {
      fontSize: "32px",
      fontWeight: "700",
      color: "#f4f4f5",
      margin: "0 0 12px 0",
      letterSpacing: "-0.5px",
    },
    cardSubtitle: {
      fontSize: "15px",
      color: "#71838b",
      margin: "0 0 40px 0",
      lineHeight: "1.6",
    },
    uploadArea: {
      border: "2px solid rgba(14, 165, 165, 0.2)",
      borderRadius: "12px",
      padding: "64px 40px",
      textAlign: "center",
      cursor: "pointer",
      background: "rgba(14, 165, 165, 0.02)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      marginBottom: "28px",
    },
    uploadAreaActive: {
      borderColor: "rgba(14, 165, 165, 0.5)",
      background: "rgba(14, 165, 165, 0.08)",
    },
    uploadIcon: {
      fontSize: "48px",
      marginBottom: "20px",
      transition: "all 0.3s",
      opacity: 0.7,
    },
    uploadText: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#e4e4e7",
      margin: "0 0 6px 0",
    },
    uploadSubtext: {
      fontSize: "14px",
      color: "#71838b",
      margin: 0,
    },
    uploadBtn: {
      width: "100%",
      background: "#0ea5a5",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      padding: "14px 24px",
      fontSize: "15px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      boxShadow: "0 8px 24px rgba(14, 165, 165, 0.2)",
    },
    uploadBtnDisabled: {
      background: "rgba(14, 165, 165, 0.2)",
      cursor: "not-allowed",
      boxShadow: "none",
    },
    resultCard: {
      marginTop: "48px",
      background: "rgba(15, 15, 20, 0.8)",
      border: "1px solid rgba(14, 165, 165, 0.1)",
      borderRadius: "12px",
      padding: "44px",
      backdropFilter: "blur(10px)",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
    },
    resultHeader: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "32px",
    },
    resultTitle: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#e4e4e7",
      margin: 0,
    },
    codeBlock: {
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      borderRadius: "8px",
      padding: "20px",
      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      fontSize: "12px",
      overflow: "auto",
      border: "1px solid rgba(14, 165, 165, 0.1)",
      color: "#71d5d5",
      maxHeight: "280px",
      lineHeight: "1.6",
    },
    aiContainer: {
      marginTop: "28px",
      padding: "28px",
      borderRadius: "12px",
      background: "rgba(14, 165, 165, 0.04)",
      border: "1px solid rgba(14, 165, 165, 0.15)",
    },
    aiText: {
      fontSize: "15px",
      lineHeight: "1.8",
      color: "#d4d4d8",
      whiteSpace: "pre-wrap",
      margin: 0,
    },
    aiButton: {
      marginTop: "24px",
      padding: "12px 24px",
      borderRadius: "8px",
      border: "1px solid rgba(14, 165, 165, 0.3)",
      background: "rgba(14, 165, 165, 0.08)",
      color: "#0ea5a5",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s",
    },
    footer: {
      textAlign: "center",
      padding: "32px 48px",
      borderTop: "1px solid rgba(14, 165, 165, 0.1)",
      marginTop: "auto",
      flexShrink: 0,
      background: "rgba(5, 5, 7, 0.6)",
    },
    footerText: {
      fontSize: "13px",
      color: "#71838b",
      margin: 0,
    },
  };

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        * {
          scrollbar-color: rgba(168, 85, 247, 0.3) transparent;
        }
        *::-webkit-scrollbar {
          width: 8px;
        }
        *::-webkit-scrollbar-track {
          background: transparent;
        }
        *::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.3);
          border-radius: 4px;
        }
      `}</style>
      
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>T</div>
          <h1 style={styles.title}>TraceIQ</h1>
        </div>

        {user ? (
          <div style={styles.userInfo}>
            <div style={styles.userBadge}>
              <div style={styles.avatar}>{user.email[0].toUpperCase()}</div>
              <span style={styles.userEmail}>{user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              style={styles.logoutBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(14, 165, 165, 0.5)";
                e.currentTarget.style.background = "rgba(14, 165, 165, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(14, 165, 165, 0.2)";
                e.currentTarget.style.background = "rgba(14, 165, 165, 0.1)";
              }}
              title="Sign out"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={() => window.google.accounts.id.prompt()}
            style={{
              padding: "10px 20px",
              backgroundColor: "#0ea5a5",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s",
              boxShadow: "0 4px 12px rgba(14, 165, 165, 0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(14, 165, 165, 0.3)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(14, 165, 165, 0.2)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Sign in with Google
          </button>
        )}
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Status Badge */}
        <div style={styles.statusBadge}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor:
                status === "ok"
                  ? "#10b981"
                  : status === "error"
                  ? "#ef4444"
                  : "#f59e0b",
              animation: "pulse 2s infinite",
            }}
          />
          <span>
            {status === "ok"
              ? "System operational"
              : status === "error"
              ? "System error"
              : "Checking status..."}
          </span>
        </div>

        {/* Upload Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Analyze your project</h2>
          <p style={styles.cardSubtitle}>
            Upload a ZIP file to get AI-powered insights about your codebase architecture, dependencies, and potential improvements.
          </p>

          <div
            style={{
              marginBottom: "12px",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              color: "#71838b",
              fontWeight: "600",
            }}
          >
            Select ZIP File
          </div>

          <label>
            <div
              style={
                file
                  ? { ...styles.uploadArea, ...styles.uploadAreaActive }
                  : styles.uploadArea
              }
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = "rgba(14, 165, 165, 0.6)";
                e.currentTarget.style.background = "rgba(14, 165, 165, 0.12)";
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(14, 165, 165, 0.2)";
                e.currentTarget.style.background = "rgba(14, 165, 165, 0.02)";
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files[0]) {
                  setFile(e.dataTransfer.files[0]);
                  resetAnalysisState();
                }
              }}
            >
              <input
                type="file"
                onChange={(e) => {
                  setFile(e.target.files[0] || null);
                  resetAnalysisState();
                }}
                accept=".zip"
                style={{ display: "none" }}
                disabled={!user}
              />

              <div
                style={{
                  width: "44px",
                  height: "44px",
                  margin: "0 auto 20px",
                  borderRadius: "8px",
                  background: "rgba(14, 165, 165, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0ea5a5",
                  fontSize: "20px",
                  fontWeight: "600",
                }}
              >
                {file ? "+" : "^"}
              </div>

              {file ? (
                <div>
                  <p style={styles.uploadText}>{file.name}</p>
                  <p style={styles.uploadSubtext}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB — Ready to analyze
                  </p>
                </div>
              ) : (
                <div>
                  <p style={styles.uploadText}>
                    {user ? "Drag your ZIP file here" : "Sign in to upload files"}
                  </p>
                  <p style={styles.uploadSubtext}>
                    {user
                      ? "or click to select from your computer"
                      : "Use the Google button above to get started"}
                  </p>
                </div>
              )}
            </div>
          </label>

          <button
            onClick={handleUpload}
            disabled={loadingUpload || !file || !user}
            style={
              loadingUpload || !file || !user
                ? { ...styles.uploadBtn, ...styles.uploadBtnDisabled }
                : styles.uploadBtn
            }
            onMouseEnter={(e) => {
              if (!loadingUpload && file && user) {
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(14, 165, 165, 0.25)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loadingUpload && file && user) {
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(14, 165, 165, 0.2)";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            {loadingUpload ? (
              <>
                <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>↻</span>
                <span>Analyzing project...</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: "16px" }}>→</span>
                <span>Upload and analyze</span>
              </>
            )}
          </button>
        </div>

        {/* Analysis Result + AI */}
        {analysisResult && (
          <div style={styles.resultCard}>
            <div style={styles.resultHeader}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#10b981",
                }}
              />
              <h2 style={styles.resultTitle}>Analysis complete</h2>
            </div>

            <div style={{ marginBottom: "32px" }}>
              <div
                style={{
                  color: "#71838b",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "1.2px",
                  margin: "0 0 20px 0",
                  fontWeight: "600",
                }}
              >
                Project structure
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px"
              }}>
                {analysisResult && Object.entries(analysisResult).slice(0, 6).map(([key, value]) => (
                  <div key={key} style={{
                    background: "rgba(14, 165, 165, 0.05)",
                    border: "1px solid rgba(14, 165, 165, 0.15)",
                    borderRadius: "8px",
                    padding: "16px",
                  }}>
                    <div style={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      color: "#0ea5a5",
                      fontWeight: "600",
                      marginBottom: "8px"
                    }}>
                      {key}
                    </div>
                    <div style={{
                      fontSize: "13px",
                      color: "#d4d4d8",
                      wordBreak: "break-word"
                    }}>
                      {typeof value === 'object' ? JSON.stringify(value).substring(0, 100) : String(value).substring(0, 100)}
                    </div>
                  </div>
                ))}
              </div>
              <details style={{
                cursor: "pointer",
                marginTop: "12px"
              }}>
                <summary style={{
                  fontSize: "12px",
                  color: "#0ea5a5",
                  fontWeight: "600",
                  padding: "8px",
                  userSelect: "none"
                }}>View full JSON</summary>
                <div style={styles.codeBlock}>
                  <pre style={{ margin: 0 }}>
                    {JSON.stringify(analysisResult, null, 2)}
                  </pre>
                </div>
              </details>
            </div>

            <button
              onClick={handleExplainWithAI}
              disabled={aiLoading}
              style={{
                ...styles.aiButton,
                background: aiLoading 
                  ? "rgba(14, 165, 165, 0.05)"
                  : "rgba(14, 165, 165, 0.08)",
                color: aiLoading ? "#718a90" : "#0ea5a5",
                cursor: aiLoading ? "default" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!aiLoading) {
                  e.currentTarget.style.borderColor = "rgba(14, 165, 165, 0.5)";
                  e.currentTarget.style.background = "rgba(14, 165, 165, 0.12)";
                }
              }}
              onMouseLeave={(e) => {
                if (!aiLoading) {
                  e.currentTarget.style.borderColor = "rgba(14, 165, 165, 0.3)";
                  e.currentTarget.style.background = "rgba(14, 165, 165, 0.08)";
                }
              }}
            >
              {aiLoading ? "Getting AI insights..." : "Explain with AI"}
            </button>

            {aiText && (
              <div
                style={{
                  marginTop: "32px",
                  animation: "slideIn 0.4s ease-out",
                }}
              >
                <div
                  style={{
                    color: "#71838b",
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "1.2px",
                    margin: "0 0 20px 0",
                    fontWeight: "600",
                  }}
                >
                  AI Insights
                </div>
                <div style={{
                  background: "linear-gradient(135deg, rgba(14, 165, 165, 0.08) 0%, rgba(14, 165, 165, 0.03) 100%)",
                  border: "1px solid rgba(14, 165, 165, 0.2)",
                  borderRadius: "12px",
                  overflow: "hidden"
                }}>
                  <div style={{
                    background: "rgba(14, 165, 165, 0.1)",
                    padding: "16px 20px",
                    borderBottom: "1px solid rgba(14, 165, 165, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }}>
                    <div style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#0ea5a5",
                      animation: "pulse 2s infinite"
                    }} />
                    <span style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#e4e4e7"
                    }}>Intelligent Analysis</span>
                  </div>
                  <div style={{
                    padding: "24px",
                    maxHeight: "400px",
                    overflow: "auto"
                  }}>
                    <p style={{
                      ...styles.aiText,
                      margin: 0,
                      fontSize: "14px",
                      lineHeight: "1.8"
                    }}>
                      {aiText}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Features Section */}
      {!analysisResult && <FeaturesSection />}

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "40px", marginBottom: "40px" }}>
            <div>
              <h3 style={{ margin: "0 0 12px 0", color: "#e4e4e7", fontSize: "14px", fontWeight: "600" }}>Getting Started</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                <li style={{ marginBottom: "8px" }}><span style={{ color: "#0ea5a5" }}>1.</span> <span style={{ color: "#a1a1a6" }}>Sign in with Google</span></li>
                <li style={{ marginBottom: "8px" }}><span style={{ color: "#0ea5a5" }}>2.</span> <span style={{ color: "#a1a1a6" }}>Upload your project as ZIP</span></li>
                <li style={{ marginBottom: "8px" }}><span style={{ color: "#0ea5a5" }}>3.</span> <span style={{ color: "#a1a1a6" }}>Wait for analysis to complete</span></li>
                <li><span style={{ color: "#0ea5a5" }}>4.</span> <span style={{ color: "#a1a1a6" }}>Review insights with AI</span></li>
              </ul>
            </div>
            <div>
              <h3 style={{ margin: "0 0 12px 0", color: "#e4e4e7", fontSize: "14px", fontWeight: "600" }}>What You Get</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                <li style={{ marginBottom: "8px", color: "#a1a1a6" }}>Project architecture analysis</li>
                <li style={{ marginBottom: "8px", color: "#a1a1a6" }}>Dependency mapping</li>
                <li style={{ marginBottom: "8px", color: "#a1a1a6" }}>AI-powered recommendations</li>
                <li style={{ color: "#a1a1a6" }}>Code quality insights</li>
              </ul>
            </div>
            <div>
              <h3 style={{ margin: "0 0 12px 0", color: "#e4e4e7", fontSize: "14px", fontWeight: "600" }}>Requirements</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                <li style={{ marginBottom: "8px", color: "#a1a1a6" }}>ZIP file format only</li>
                <li style={{ marginBottom: "8px", color: "#a1a1a6" }}>Valid project structure</li>
                <li style={{ marginBottom: "8px", color: "#a1a1a6" }}>Google account required</li>
                <li style={{ color: "#a1a1a6" }}>Internet connection needed</li>
              </ul>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(14, 165, 165, 0.1)", paddingTop: "24px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "13px", color: "#71838b" }}>TraceIQ © {new Date().getFullYear()} — Powered by intelligent code analysis</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
