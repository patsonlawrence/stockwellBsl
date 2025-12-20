"use client";

import { useState, type CSSProperties } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setMessage(data.message);
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src="/logo.jpg" alt="BSL Logo" style={styles.logo} />
        <h1 style={styles.title}>BSL Investment Club</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Login
          </button>
          {message && <p style={styles.message}>{message}</p>}
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {    
    height: "100%",                  // full body height
    width: "100%",                   // full width
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    background: "#ffffff",
    padding: "2rem",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "400px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
  },
  logo: {
    width: "70px",
    marginBottom: "1rem",
  },
  title: {
    marginBottom: "2rem",
    fontSize: "1.8rem",
    color: "#1e3c72",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "12px",
    marginBottom: "1rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
  button: {
    padding: "12px",
    backgroundColor: "#1e3c72",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: "bold",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  message: {
    marginTop: "1rem",
    color: "red",
    fontWeight: "bold",
  },
};
