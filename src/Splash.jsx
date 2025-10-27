import { useEffect, useState } from "react";
import logo from "./assets/Logo_Zercana (sin fondo).png";

export default function Splash({ onFinish }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // ⏱️ Mostrar splash durante 2.5 segundos antes de ocultar
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onFinish, 600); // Espera animación fade-out
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(180deg, #000000 10%, #1a1a1a 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        transition: "opacity 0.6s ease-in-out",
        opacity: visible ? 1 : 0,
        zIndex: 9999,
      }}
    >
      {/* 🧩 Logo con animación flotante */}
      <img
        src={logo}
        alt="Zercana Consulting"
        style={{
          width: "650px",                // 👈 más grande aún
          maxWidth: "85vw",              // ✅ adaptable a pantallas pequeñas
          filter: "drop-shadow(0 0 35px rgba(255, 165, 0, 0.9))",
          animation: "float 3s ease-in-out infinite",
          transformOrigin: "center",
        }}
      />

      {/* ✨ Texto de carga animado */}
      <p
        style={{
          color: "#ffa500",
          fontSize: "1.4rem",
          marginTop: "35px",
          fontFamily: "Arial, sans-serif",
          letterSpacing: "1px",
          fontWeight: 600,
          textShadow: "0 0 12px rgba(255,165,0,0.6)",
          animation: "fadein 1.5s ease-in-out infinite alternate",
        }}
      >
        Cargando red de líneas…
      </p>

      {/* 🎞️ Animaciones CSS */}
      <style>
        {`
          @keyframes float {
            0% { transform: scale(1) translateY(0); opacity: 0.95; }
            50% { transform: scale(1.08) translateY(-12px); opacity: 1; }
            100% { transform: scale(1) translateY(0); opacity: 0.95; }
          }

          @keyframes fadein {
            from { opacity: 0.3; }
            to { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}
