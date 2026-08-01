import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  // this runs when the user clicks the Login button
  async function handleSubmit(e) {
    e.preventDefault(); // stop the page from refreshing

    let valid = true;

    // check email field
    if (email.trim() === "") {
      setEmailError("Email is required");
      valid = false;
    } else if (!email.includes("@")) {
      setEmailError("Enter a valid email");
      valid = false;
    } else {
      setEmailError("");
    }

    // check password field
    if (password.trim() === "") {
      setPasswordError("Password is required");
      valid = false;
    } else {
      setPasswordError("");
    }

    // stop here if any field is wrong
    if (!valid) {
      setMessage({ text: "Please fix the errors above", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    // send the email and password to the server to check if they are correct
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    setLoading(false);

    // if the server says login failed, show the error message
    if (!response.ok) {
      setMessage({ text: data.message || "Something went wrong, please try again", type: "error" });
      return;
    }

    // login worked, so save the token and user info in the browser
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // go to the dashboard page
    navigate("/dashboard");
  }

  return (
    <div className="page">
      <div className="left-side">
        <h2>
          Welcome to<br />
          Academic and Research Tracker
        </h2>
        <p>Sign in to your Academic and Research Tracker account to manage your courses, track research progress, and stay on top of every deadline at BRAC University.</p>
      </div>

      <div className="right-side">
        <div className="login-box">
          <h1>Login</h1>
          <p>Log in to access your Academic and Research Tracker account.</p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="error">{emailError}</p>

            <label htmlFor="password">Password</label>
            <div className="password-box">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {/* switches the password field between hidden and visible */}
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            <p className="error">{passwordError}</p>

            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            {message.text && <p className={`message ${message.type}`}>{message.text}</p>}
          </form>

          <p className="switch-link">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
