"use client";

import MaterialIcon from "./MaterialIcon";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  type?: "alert" | "confirm" | "info";
  onClose: () => void;
  onConfirm?: () => void;
};

export default function ConfirmModal({
  isOpen,
  title,
  message,
  type = "confirm",
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        padding: "16px",
      }}
    >
      {/* Stop propagation so clicking inside the modal doesn't close it */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "480px",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
          overflow: "hidden",
          border: "1px solid #e5e7eb",
        }}
      >
        {/* Header */}
        <div style={{ padding: "24px 24px 0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                backgroundColor: type === "alert" ? "#fef2f2" : type === "info" ? "#eff6ff" : "#fff1f2",
                color: type === "alert" ? "#dc2626" : type === "info" ? "#2563eb" : "#be123c",
              }}
            >
              <MaterialIcon name={type === "alert" ? "warning" : type === "info" ? "info" : "delete_forever"} />
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 700,
                color: "#111827",
                lineHeight: 1.3,
              }}
            >
              {title}
            </h3>
          </div>
          <div
            style={{
              margin: 0,
              fontSize: "15px",
              color: "#4b5563",
              lineHeight: 1.6,
              paddingBottom: "20px",
            }}
          >
            {message}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            padding: "16px 24px",
            backgroundColor: "#f9fafb",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          {type === "confirm" && (
            <button
              onClick={onClose}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "14px",
                color: "#374151",
                background: "transparent",
                border: "1px solid #d1d5db",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#f3f4f6")}
              onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
            >
              Cancelar
            </button>
          )}
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "14px",
              color: "#ffffff",
              background: type === "alert" ? "#2563eb" : type === "info" ? "#2563eb" : "#dc2626",
              border: "none",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = type === "alert" ? "#1d4ed8" : type === "info" ? "#1d4ed8" : "#b91c1c")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = type === "alert" ? "#2563eb" : type === "info" ? "#2563eb" : "#dc2626")
            }
          >
            {type === "alert" || type === "info" ? "Entendido" : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
