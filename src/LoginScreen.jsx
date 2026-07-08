import React, { useEffect, useRef } from "react";
import { GOOGLE_CLIENT_ID } from "./auth.js";

export default function LoginScreen({ onCredential, errorMessage }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    function init() {
      if (!window.google || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => onCredential(response.credential),
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "pill",
      });
    }
    // Google Identity Services 스크립트는 index.html에서 로드하는데,
    // 로드 타이밍이 늦을 수 있어 약간의 재시도를 둡니다.
    if (window.google) init();
    else {
      const t = setInterval(() => {
        if (window.google) {
          clearInterval(t);
          init();
        }
      }, 200);
      return () => clearInterval(t);
    }
  }, [onCredential]);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ fontFamily: "'Inter', sans-serif", background: "#FAF9F5" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap');
      `}</style>
      <div
        className="rounded-2xl shadow-sm border p-10 flex flex-col items-center gap-6"
        style={{ borderColor: "#E7E5DD", background: "#FFFFFF", width: 380, maxWidth: "90vw" }}
      >
        <div className="text-center">
          <div style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-semibold mb-1">
            New-drygo
          </div>
          <div className="text-sm" style={{ color: "#6B7280" }}>
            Newcomer Journey 관리 시스템
          </div>
        </div>
        <div ref={buttonRef} />
        {errorMessage && (
          <div className="text-sm text-center px-3 py-2 rounded-lg" style={{ background: "#FEF2F2", color: "#B91C1C" }}>
            {errorMessage}
          </div>
        )}
        <p className="text-xs text-center" style={{ color: "#6B7280" }}>
          회사 Google 계정으로 로그인해주세요.<br />권한이 없는 계정은 접근할 수 없습니다.
        </p>
      </div>
    </div>
  );
}
