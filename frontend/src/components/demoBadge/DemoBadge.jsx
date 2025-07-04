import { useState } from "react";

const DemoBadge = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        top: "16px",
        right: "20px",
        zIndex: 1200,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        backgroundColor: "#facc15",
        color: "#000",
        padding: "4px 8px",
        borderRadius: "6px",
        fontWeight: "300",
        fontSize: "11px",
        cursor: "default",
        userSelect: "none",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      aria-label="Demo mode badge"
    >
      Demo Mode
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        aria-expanded={showTooltip}
        aria-controls="demo-tooltip"
        style={{
          background: "none",
          border: "none",
          fontWeight: "bold",
          fontSize: "11px",
          cursor: "pointer",
          lineHeight: 1,
          padding: 0,
          margin: 0,
          userSelect: "none",
          color: "#000",
        }}
        aria-label="Toggle demo mode info"
        type="button"
      >
        ?
      </button>
      {showTooltip && (
        <div
          id="demo-tooltip"
          role="tooltip"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            maxWidth: "220px",
            backgroundColor: "#333",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "11px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
            userSelect: "none",
            zIndex: 1010,
          }}
        >
          Some features are disabled in the demo version.
        </div>
      )}
    </div>
  );
};

export default DemoBadge;
