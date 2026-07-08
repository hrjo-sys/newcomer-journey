// ── 설정: 아래 두 값만 채우면 됩니다 ──────────────────────────────
// 1) Google Cloud Console에서 발급받은 OAuth 클라이언트 ID
export const GOOGLE_CLIENT_ID = "623620899491-790u7rr7v18drgedcpmmafbh02gu4hca.apps.googleusercontent.com";

// 2) n8n에 /check-permission 웹훅을 만든 뒤 그 URL로 교체하세요.
//    예: "https://n8n-production-9ff8.up.railway.app/webhook/check-permission"
export const PERMISSION_CHECK_URL = "https://n8n-production-9ff8.up.railway.app/webhook/check-permission";

// 3) n8n /get-employees 웹훅 URL.
export const GET_EMPLOYEES_URL = "https://n8n-production-9ff8.up.railway.app/webhook/get-employees";
// ─────────────────────────────────────────────────────────────

// n8n 웹훅이 아직 없거나 응답하지 않을 때 로컬 개발/테스트용으로 쓰는 임시 권한 목록.
// ⚠️ 실서비스 전환 시 이 객체는 지우고 n8n + 권한관리 시트로만 판단하도록 하세요.
const TEMP_LOCAL_PERMISSIONS = {
  "hrjo@lifegoeson.kr": { role: "admin", name: "조하리" },
};

// Google이 내려주는 ID 토큰(JWT)에서 이메일/이름 등을 꺼내는 함수.
// 서명 검증은 하지 않음 — 실제 신뢰 여부 판단은 n8n(백엔드)의 /check-permission에서 해야 함.
export function decodeGoogleJwt(credential) {
  const base64Url = credential.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
}

// n8n의 /check-permission 웹훅을 호출해 role을 조회.
// 요청 형식: POST { email }
// 기대하는 응답 형식: { role: "admin" | "viewer" | null, name?: string }
export async function checkPermission(email) {
  try {
    const res = await fetch(PERMISSION_CHECK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    return { role: data.role || null, name: data.name || null, source: "n8n" };
  } catch (err) {
    console.warn("[auth] n8n /check-permission 호출 실패, 임시 로컬 권한 목록으로 대체합니다:", err);
    const local = TEMP_LOCAL_PERMISSIONS[email];
    return { role: local ? local.role : null, name: local ? local.name : null, source: "local-fallback" };
  }
}

// n8n의 /get-employees 웹훅을 호출해 role별로 필터링된 입사자 목록을 조회.
// 요청 형식: POST { email } — 웹훅이 내부적으로 email → role을 다시 조회해 범위를 결정함
//   (admin/hr: 전체, leader: 담당자만, newcomer: 본인만)
// 기대하는 응답 형식: 입사자 객체 배열. 필드명은 진행상황 요약 문서의 매핑을 따름
//   (birth, org, parentOrg, title, position, hireDate, buddyEmail 등 — 이미 영문으로 변환된 상태)
// 호출 실패 시 null을 반환 — Dashboard.jsx는 null이면 기존 더미 데이터로 폴백함.
export async function getEmployees(email) {
  try {
    const res = await fetch(GET_EMPLOYEES_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("[auth] n8n /get-employees 호출 실패, 더미 데이터로 대체합니다:", err);
    return null;
  }
}
