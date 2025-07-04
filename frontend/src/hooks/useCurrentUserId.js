import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export default function useCurrentUserId() {
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && token.split(".").length === 3) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.id);
      } catch (err) {
        console.error("JWT decode error:", err.message);
        setCurrentUserId(null);
      }
    }
  }, []);

  return currentUserId;
}
