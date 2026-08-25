import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  // this runs when the user clicks the Sign Up button
  async function handleSubmit(e) {
    e.preventDefault(); // stop the page from refreshing

    let valid = true;

    // check name field
    if (name.trim() === "") {
      setNameError("Name is required");
      valid = false;
    } else {
      setNameError("");
    }

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
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
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

    // send the new account info to the server so it can create the account
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    setLoading(false);

    // if the server could not create the account, show why
    if (!response.ok) {
      setMessage({ text: data.message || "Something went wrong, please try again", type: "error" });
      return;
    }

    // account created, so log the user in right away
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // go to the dashboard page
    navigate("/dashboard");
  }

  return (
    <div className="page">
      <div className="left-side">
        <div className="brand-name">Academic and Research Tracker</div>
        <h2>Create Your Account</h2>
        <p>Sign up for the Academic and Research Tracker to organize your coursework, research, and academic milestones throughout your time at BRAC University.</p>
      </div>

      <div className="right-side">
        <div className="login-box">
          <h1>Sign Up</h1>
          <p>Create an account to start tracking your academic journey.</p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="error">{nameError}</p>

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
                placeholder="Create a password"
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
              {loading ? "Creating account..." : "Sign Up"}
            </button>

            {message.text && <p className={`message ${message.type}`}>{message.text}</p>}
          </form>

          <p className="switch-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
