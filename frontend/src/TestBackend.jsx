import { useEffect, useState } from "react";

export default function TestBackend() {
  const [message, setMessage] = useState("Checking backend...");

  useEffect(() => {
    fetch("http://localhost:5000/api/health") // backend URL
      .then((res) => res.json())
      .then((data) => {
        setMessage(`Backend says: ${JSON.stringify(data)}`);
      })
      .catch((err) => {
        setMessage(`Error connecting to backend: ${err.message}`);
      });
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Frontend Test</h1>
      <p>{message}</p>
    </div>
  );
}