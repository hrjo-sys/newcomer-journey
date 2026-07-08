import React, { useState, useCallback } from "react";
import LoginScreen from "./LoginScreen.jsx";
import Dashboard from "./Dashboard.jsx";
import { decodeGoogleJwt, checkPermission, getEmployees } from "./auth.js";

// 인증 단계: "loggedOut" → "checking" → "granted" | "denied"
export default function App() {
  const [status, setStatus] = useState("loggedOut");
  const [user, setUser] = useState(null); // { email, name }
  const [role, setRole] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  // null = 아직 못 받아옴(Dashboard가 더미 데이터로 폴백), 배열 = n8n에서 받은 실데이터
  const [employees, setEmployees] = useState(null);

  const handleCredential = useCallback(async (credential) => {
    setStatus("checking");
    setErrorMessage("");
    let payload;
    try {
      payload = decodeGoogleJwt(credential);
    } catch (e) {
      setStatus("loggedOut");
      setErrorMessage("로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      return;
    }
    const email = payload.email;
    const name = payload.name || email;
    setUser({ email, name });

    const { role: grantedRole, name: sheetName, source } = await checkPermission(email);
    if (source === "local-fallback") {
      console.info("[auth] 현재 임시 로컬 권한 목록을 사용 중입니다. n8n 웹훅 연결 후 src/auth.js의 PERMISSION_CHECK_URL을 확인하세요.");
    }
    if (!grantedRole) {
      setStatus("denied");
      return;
    }
    setRole(grantedRole);
    if (sheetName) setUser({ email, name: sheetName });
    setStatus("granted");

    // 권한 확인 후 실데이터 조회 (실패해도 로그인 자체는 막지 않음 — Dashboard가 더미로 폴백)
    const emps = await getEmployees(email);
    setEmployees(emps);
  }, []);

  function logout() {
    setStatus("loggedOut");
    setUser(null);
    setRole(null);
    setEmployees(null);
    setErrorMessage("");
    if (window.google?.accounts?.id) window.google.accounts.id.disableAutoSelect();
  }

  if (status === "granted") {
    return (
      <Dashboard
        role={role}
        userEmail={user?.email}
        userName={user?.name}
        onLogout={logout}
        remoteEmployees={employees}
      />
    );
  }

  if (status === "checking") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: "#FAF9F5", color: "#6B7280" }}>
        권한 확인 중...
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: "#FAF9F5" }}>
        <div className="rounded-2xl border shadow-sm p-8 text-center" style={{ borderColor: "#E7E5DD", background: "#fff", width: 380, maxWidth: "90vw" }}>
          <div className="text-lg font-semibold mb-2">접근 권한이 없습니다</div>
          <p className="text-sm mb-5" style={{ color: "#6B7280" }}>
            {user?.email} 계정은 New-drygo에 등록되어 있지 않습니다.<br />
            HR팀(hrjo@lifegoeson.kr)에 권한 등록을 요청해주세요.
          </p>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: "#3355FF" }}
          >
            다른 계정으로 로그인
          </button>
        </div>
      </div>
    );
  }

  return <LoginScreen onCredential={handleCredential} errorMessage={errorMessage} />;
}
