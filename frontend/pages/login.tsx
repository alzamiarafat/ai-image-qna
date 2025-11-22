import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Page() {
  const router = useRouter();
  const [tab, setTab] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    login: false,
    signup: false,
    signupConfirm: false,
  });

  const header = tab === "login" ? "Welcome Back" : "Create Account";
  const subtext =
    tab === "login"
      ? "Enter your credentials to access your account"
      : "Sign up to start analyzing images with AI";

  function switchTab(target) {
    setTab(target);
  }

  function togglePassword(key) {
    setShowPasswords((prev) => ({ ...prev, [key]: !prev[key] }));
  }
  async function handleSubmit(e) {
    e.preventDefault();

    if (tab === "login") {
      const res = await fetch("http://localhost:9001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error);
      debugger;
      localStorage.setItem("userInfo", JSON.stringify(data));
      router.push("/dashboard");
    } else {
      const res = await fetch("http://localhost:9001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error);

      alert("Account created successfully! Please log in.");
      setTab("login");
    }
  }

  return (
    <>
      <Head>
        <title>AI Vision Platform - {header}</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="page-root">
        <div className="container">
          <div className="left-panel">
            <div className="brand">
              <h1>AI Vision Platform</h1>
              <p>
                Advanced object detection and intelligent analysis powered by
                state-of-the-art machine learning models
              </p>
            </div>

            <div className="features">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                  </svg>
                </div>
                <div className="feature-content">
                  <h3>YOLO Object Detection</h3>
                  <p>
                    Real-time object detection with industry-leading accuracy
                    and performance metrics
                  </p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                </div>
                <div className="feature-content">
                  <h3>AI-Powered Q&A</h3>
                  <p>
                    Ask questions about detected objects using Gemini's advanced
                    natural language understanding
                  </p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </div>
                <div className="feature-content">
                  <h3>Interactive Analysis</h3>
                  <p>
                    Sortable results with detailed confidence scores and
                    bounding box coordinates
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="right-panel">
            <div className="auth-header">
              <h2>{header}</h2>
              <p>{subtext}</p>
            </div>

            <div className="tab-container">
              <button
                type="button"
                className={`tab ${tab === "login" ? "active" : ""}`}
                onClick={() => switchTab("login")}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`tab ${tab === "signup" ? "active" : ""}`}
                onClick={() => switchTab("signup")}
              >
                Sign Up
              </button>
            </div>

            {tab === "login" && (
              <form className="login-form active" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="login-email">Email Address</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <input
                      type="email"
                      id="login-email"
                      placeholder="you@example.com"
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="login-password">Password</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    <input
                      type={showPasswords.login ? "text" : "password"}
                      id="login-password"
                      placeholder="Enter your password"
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePassword("login")}
                      aria-label="Toggle password visibility"
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="remember-forgot">
                  <div className="checkbox-wrapper">
                    <input type="checkbox" id="remember" />
                    <label htmlFor="remember">Remember me</label>
                  </div>
                  <a href="#" className="forgot-link">
                    Forgot Password?
                  </a>
                </div>

                <button type="submit" className="submit-btn">
                  Sign In
                </button>

                <div className="divider">
                  <span>OR CONTINUE WITH</span>
                </div>

                <button
                  type="button"
                  className="google-btn"
                  onClick={() =>
                    alert("Google sign-in not implemented in demo")
                  }
                >
                  <svg className="google-icon" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </button>
              </form>
            )}

            {tab === "signup" && (
              <form className="signup-form active" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="signup-name">Full Name</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input
                      type="text"
                      id="signup-name"
                      placeholder="John Doe"
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="signup-email">Email Address</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <input
                      type="email"
                      id="signup-email"
                      placeholder="you@example.com"
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="signup-password">Password</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    <input
                      type={showPasswords.signup ? "text" : "password"}
                      id="signup-password"
                      placeholder="Create a password"
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePassword("signup")}
                      aria-label="Toggle password visibility"
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="signup-confirm">Confirm Password</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    <input
                      type={showPasswords.signupConfirm ? "text" : "password"}
                      id="signup-confirm"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        // Validate password match in real-time
                        if (e.target.value !== password) {
                          setPasswordError("Passwords do not match");
                        } else {
                          setPasswordError("");
                        }
                      }}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePassword("signupConfirm")}
                      aria-label="Toggle password visibility"
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                  {passwordError && (
                    <p
                      style={{
                        color: "red",
                        fontSize: "13px",
                        marginTop: "6px",
                      }}
                    >
                      {passwordError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={!!passwordError}
                >
                  Create Account
                </button>

                <div className="divider">
                  <span>OR CONTINUE WITH</span>
                </div>

                <button
                  type="button"
                  className="google-btn"
                  onClick={() =>
                    alert("Google sign-up not implemented in demo")
                  }
                >
                  <svg className="google-icon" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign up with Google
                </button>
              </form>
            )}
          </div>
        </div>

        <style jsx global>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body,
          html,
          #__next {
            height: 100%;
            font-family: "Inter", sans-serif;
          }

          .page-root {
            background: linear-gradient(
              127deg,
              #0f172a 0%,
              #1e293b 47%,
              #334155 100%
            );
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }

          .container {
            display: flex;
            max-width: 1100px;
            width: 100%;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 24px 48px rgba(0, 0, 0, 0.24);
          }

          .left-panel {
            flex: 1;
            background: linear-gradient(165deg, #2563eb 0%, #1e40af 100%);
            padding: 60px 50px;
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            overflow: hidden;
          }

          .left-panel::before {
            content: "";
            position: absolute;
            top: -50%;
            right: -20%;
            width: 400px;
            height: 400px;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 50%;
          }

          .left-panel::after {
            content: "";
            position: absolute;
            bottom: -30%;
            left: -10%;
            width: 300px;
            height: 300px;
            background: rgba(255, 255, 255, 0.06);
            border-radius: 50%;
          }

          .brand {
            position: relative;
            z-index: 1;
          }
          .brand h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 12px;
            letter-spacing: -0.5px;
          }
          .brand p {
            font-size: 15px;
            opacity: 0.92;
            line-height: 1.6;
            font-weight: 300;
          }

          .features {
            position: relative;
            z-index: 1;
            margin-top: 40px;
          }
          .feature-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 28px;
          }
          .feature-icon {
            width: 44px;
            height: 44px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 18px;
            flex-shrink: 0;
            backdrop-filter: blur(10px);
          }
          .feature-icon svg {
            width: 22px;
            height: 22px;
            stroke: white;
            stroke-width: 2;
            fill: none;
          }
          .feature-content h3 {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 6px;
          }
          .feature-content p {
            font-size: 14px;
            opacity: 0.88;
            line-height: 1.5;
            font-weight: 300;
          }

          .right-panel {
            flex: 1;
            padding: 60px 50px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .auth-header {
            margin-bottom: 36px;
          }
          .auth-header h2 {
            font-size: 32px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 8px;
            letter-spacing: -0.8px;
          }
          .auth-header p {
            font-size: 15px;
            color: #64748b;
            font-weight: 400;
          }

          .tab-container {
            display: flex;
            gap: 8px;
            margin-bottom: 32px;
            background: #f1f5f9;
            padding: 6px;
            border-radius: 10px;
          }
          .tab {
            flex: 1;
            padding: 12px 24px;
            border: none;
            background: transparent;
            color: #64748b;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            border-radius: 7px;
            transition: all 0.3s ease;
          }
          .tab.active {
            background: white;
            color: #2563eb;
            box-shadow: 0 2px 8px rgba(37, 99, 235, 0.12);
          }

          .form-group {
            margin-bottom: 22px;
          }
          .form-group label {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: #334155;
            margin-bottom: 8px;
          }
          .input-wrapper {
            position: relative;
          }
          .input-icon {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            width: 20px;
            height: 20px;
            stroke: #94a3b8;
            stroke-width: 2;
            fill: none;
          }

          input[type="text"],
          input[type="email"],
          input[type="password"] {
            width: 100%;
            padding: 14px 16px 14px 48px;
            border: 1.5px solid #e2e8f0;
            border-radius: 10px;
            font-size: 15px;
          }
          input:focus {
            outline: none;
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
          }

          .password-toggle {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
          }
          .password-toggle svg {
            width: 20px;
            height: 20px;
            stroke: #94a3b8;
            stroke-width: 2;
            fill: none;
          }

          .remember-forgot {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
          }
          .checkbox-wrapper {
            display: flex;
            align-items: center;
          }
          .checkbox-wrapper input[type="checkbox"] {
            width: 18px;
            height: 18px;
            margin-right: 8px;
            cursor: pointer;
            accent-color: #2563eb;
          }
          .checkbox-wrapper label {
            font-size: 14px;
            color: #475569;
            cursor: pointer;
            margin: 0;
            font-weight: 500;
          }

          .forgot-link {
            font-size: 14px;
            color: #2563eb;
            text-decoration: none;
            font-weight: 600;
          }
          .forgot-link:hover {
            color: #1e40af;
          }

          .submit-btn {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
          }
          .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
          }

          .divider {
            display: flex;
            align-items: center;
            margin: 28px 0;
          }
          .divider::before,
          .divider::after {
            content: "";
            flex: 1;
            height: 1px;
            background: #e2e8f0;
          }
          .divider span {
            padding: 0 16px;
            font-size: 13px;
            color: #94a3b8;
            font-weight: 500;
          }

          .google-btn {
            width: 100%;
            padding: 14px;
            background: white;
            color: #334155;
            border: 1.5px solid #e2e8f0;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
          }
          .google-btn:hover {
            background: #f8fafc;
            border-color: #cbd5e1;
          }
          .google-icon {
            width: 20px;
            height: 20px;
          }

          .signup-form {
            display: none;
          }
          .signup-form.active,
          .login-form.active {
            display: block;
          }

          @media (max-width: 968px) {
            .container {
              flex-direction: column;
            }
            .left-panel {
              padding: 40px 30px;
            }
            .right-panel {
              padding: 40px 30px;
            }
            .features {
              margin-top: 30px;
            }
            .feature-item {
              margin-bottom: 20px;
            }
          }

          @media (max-width: 480px) {
            .page-root {
              padding: 0;
            }
            .container {
              border-radius: 0;
            }
            .left-panel,
            .right-panel {
              padding: 30px 20px;
            }
            .auth-header h2 {
              font-size: 26px;
            }
            .brand h1 {
              font-size: 24px;
            }
          }
        `}</style>
      </div>
    </>
  );
}
