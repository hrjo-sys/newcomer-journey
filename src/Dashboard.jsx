import React, { useState, useRef, useEffect } from "react";
import {
  Plus, Settings2, X, Trash2, Phone, Mail, Calendar, Briefcase,
  Building2, Flag, User, Award, ChevronLeft, PlusCircle, GripVertical,
  Hash, ExternalLink, LayoutGrid, Pencil,
} from "lucide-react";

const TOTAL_WEEKS = 13; // ~90 days
const TODAY = new Date(2026, 6, 7);

function daysAgo(n) {
  return new Date(TODAY.getTime() - n * 24 * 60 * 60 * 1000);
}
function parseDateInput(str) {
  const clean = str.replaceAll(".", "-").replaceAll("/", "-");
  const d = new Date(clean);
  return isNaN(d.getTime()) ? TODAY : d;
}
function addDays(date, n) {
  return new Date(date.getTime() + n * 24 * 60 * 60 * 1000);
}
function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}
function elapsedWeeks(hireDate) {
  const days = Math.max(0, Math.floor((TODAY - hireDate) / (24 * 60 * 60 * 1000)));
  return days / 7;
}
function pct(week) {
  return Math.min(100, Math.max(0, (week / TOTAL_WEEKS) * 100));
}

const STAGE_COLORS = ["#3355FF", "#8B5CF6", "#F5A623", "#16A34A", "#EF4444", "#0EA5E9", "#EC4899"];

const initialStages = [
  { id: 1, order: 1, name: "입사당일", startWeek: 0, endWeek: 0, color: STAGE_COLORS[0] },
  { id: 2, order: 2, name: "버디 프로그램", startWeek: 0, endWeek: 3, color: STAGE_COLORS[1] },
  { id: 3, order: 3, name: "팩토리 현장체험", startWeek: 3, endWeek: 4, color: STAGE_COLORS[2] },
  { id: 4, order: 4, name: "중간면담", startWeek: 6, endWeek: 6, color: STAGE_COLORS[3] },
  { id: 5, order: 5, name: "수습평가", startWeek: 11, endWeek: 11, color: STAGE_COLORS[4] },
];

const initialEmployees = [
  { id: 1, empNo: "24091", name: "정유진", gender: "여", phone: "010-2231-9081", birth: "1997.03.12", email: "yjjeong@drygo.co.kr", personalEmail: "yj.jeong97@naver.com", org: "HR실", title: "사원", position: "HR Operations", hireDate: daysAgo(0), career: "신입", extra: [] },
  { id: 2, empNo: "24088", name: "최민준", gender: "남", phone: "010-5521-3390", birth: "1995.11.02", email: "mjchoi@drygo.co.kr", personalEmail: "minjun.c@gmail.com", org: "마케팅실", title: "주임", position: "퍼포먼스 마케팅", hireDate: daysAgo(10), career: "2년", extra: [] },
  { id: 3, empNo: "24081", name: "박서연", gender: "여", phone: "010-7742-6650", birth: "1998.06.21", email: "sypark@drygo.co.kr", personalEmail: "seoyeon.park@naver.com", org: "CS실", title: "사원", position: "CX 운영", hireDate: daysAgo(25), career: "신입", extra: [] },
  { id: 4, empNo: "24074", name: "오지훈", gender: "남", phone: "010-3312-8871", birth: "1993.01.30", email: "jhoh@drygo.co.kr", personalEmail: "jihoon.oh@daum.net", org: "물류기획실", title: "대리", position: "물류 기획", hireDate: daysAgo(45), career: "4년", extra: [] },
  { id: 5, empNo: "24069", name: "이도윤", gender: "남", phone: "010-9981-2214", birth: "1996.09.09", email: "dyleee@drygo.co.kr", personalEmail: "doyoon.lee@gmail.com", org: "개발실", title: "사원", position: "백엔드 개발", hireDate: daysAgo(60), career: "1년", extra: [] },
  { id: 6, empNo: "24052", name: "김하늘", gender: "여", phone: "010-1123-4499", birth: "1994.04.18", email: "hnkim@drygo.co.kr", personalEmail: "haneul.kim@naver.com", org: "재무실", title: "주임", position: "재무 회계", hireDate: daysAgo(95), career: "3년", extra: [], result: "합격" },
];

// n8n /get-employees가 내려주는 원본 객체를 Dashboard 내부에서 쓰는 형태로 변환.
// hireDate는 시트에 저장된 문자열(예: "2026.07.01")이라 Date로 파싱해야 elapsedWeeks 계산이 됨.
function normalizeEmployee(e, idx) {
  return {
    id: e.id ?? e.empNo ?? `remote-${idx}`,
    empNo: e.empNo || "",
    name: e.name || "",
    gender: e.gender || "",
    phone: e.phone || "",
    birth: e.birth || "",
    email: e.email || "",
    personalEmail: e.personalEmail || "",
    org: e.org || "",
    parentOrg: e.parentOrg || "",
    title: e.title || "",
    position: e.position || "",
    career: e.career || "",
    hireDate: e.hireDate ? parseDateInput(String(e.hireDate)) : TODAY,
    buddyEmail: e.buddyEmail || "",
    extra: Array.isArray(e.extra) ? e.extra : [],
    result: e.result || "",
  };
}

function Modal({ children, onClose, width = 480 }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(28,31,38,0.45)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rounded-2xl shadow-xl overflow-hidden"
        style={{ background: "var(--surface)", width, maxWidth: "92vw", maxHeight: "86vh", overflowY: "auto" }}
      >
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs font-medium" style={{ color: "var(--ink-muted)" }}>{label}</span>
      {children}
    </label>
  );
}

function Row({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: "var(--ink-muted)" }}>{icon}</span>
      <span className="w-24 shrink-0 text-xs" style={{ color: "var(--ink-muted)" }}>{label}</span>
      <span className="font-medium text-sm">{value || "-"}</span>
    </div>
  );
}

// StageBand renders the journey as a continuous colored strip.
// Uncovered ranges stay white; the whole strip gets a 2px black border.
function StageBand({ stages, height = 16, laneTexture = false }) {
  const sorted = [...stages].sort((a, b) => a.order - b.order);
  return (
    <div
      className="relative overflow-hidden"
      style={{ height, borderRadius: height / 2, border: "2px solid #000", background: "#fff" }}
    >
      {sorted.map((s) => {
        const left = pct(s.startWeek);
        const width = Math.max(pct(s.endWeek) - pct(s.startWeek), 0.6);
        return (
          <div
            key={s.id}
            className="absolute top-0 bottom-0"
            style={{ left: `${left}%`, width: `${width}%`, background: s.color }}
            title={s.name}
          />
        );
      })}
      {laneTexture && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0 3px, transparent 3px 13px)" }}
        />
      )}
    </div>
  );
}

function EmployeeFormModal({ mode = "add", initialEmployee, onClose, onSave, customFieldDefs, onAddCustomFieldDef }) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState(
    isEdit
      ? {
          empNo: initialEmployee.empNo || "", name: initialEmployee.name || "", gender: initialEmployee.gender || "여",
          phone: initialEmployee.phone || "", birth: initialEmployee.birth || "", email: initialEmployee.email || "",
          personalEmail: initialEmployee.personalEmail || "", org: initialEmployee.org || "", title: initialEmployee.title || "",
          position: initialEmployee.position || "", career: initialEmployee.career || "", hireDate: fmtDate(initialEmployee.hireDate),
        }
      : { empNo: "", name: "", gender: "여", phone: "", birth: "", email: "", personalEmail: "", org: "", title: "", position: "", career: "", hireDate: fmtDate(TODAY) }
  );
  const [extra, setExtra] = useState(
    isEdit && initialEmployee.extra?.length
      ? initialEmployee.extra.map((f) => ({ ...f, applyToAll: false }))
      : customFieldDefs.map((f) => ({ label: f.label, value: "", applyToAll: false }))
  );

  function set(k, v) { setForm((prev) => ({ ...prev, [k]: v })); }
  function addExtraField() { setExtra((prev) => [...prev, { label: "", value: "", applyToAll: false }]); }
  function updateExtra(i, key, val) {
    setExtra((prev) => prev.map((e, idx) => (idx === i ? { ...e, [key]: val } : e)));
  }
  function removeExtra(i) { setExtra((prev) => prev.filter((_, idx) => idx !== i)); }

  function submit() {
    if (!form.name.trim()) return;
    extra.forEach((f) => {
      if (f.applyToAll && f.label.trim()) onAddCustomFieldDef(f.label.trim());
    });
    const payload = { ...form, hireDate: parseDateInput(form.hireDate), extra: extra.map(({ label, value }) => ({ label, value })) };
    if (isEdit) onSave({ ...payload, id: initialEmployee.id });
    else onSave(payload);
  }

  return (
    <Modal onClose={onClose} width={580}>
      <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: "var(--line)" }}>
        <h2 className="font-display text-lg font-semibold">{isEdit ? `${initialEmployee.name}님 정보 수정` : "신규 입사자 추가"}</h2>
        <button onClick={onClose}><X size={18} /></button>
      </div>
      <div className="p-6 grid grid-cols-2 gap-4">
        <Field label="사번">
          <input value={form.empNo} onChange={(e) => set("empNo", e.target.value)} className="field-input" placeholder="예: 002098" />
        </Field>
        <Field label="이름">
          <input value={form.name} onChange={(e) => set("name", e.target.value)} className="field-input" placeholder="예: 홍길동" />
        </Field>
        <Field label="성별">
          <select value={form.gender} onChange={(e) => set("gender", e.target.value)} className="field-input">
            <option>여</option><option>남</option>
          </select>
        </Field>
        <Field label="전화번호">
          <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="field-input" placeholder="010-0000-0000" />
        </Field>
        <Field label="생년월일">
          <input value={form.birth} onChange={(e) => set("birth", e.target.value)} className="field-input" placeholder="1997.01.01" />
        </Field>
        <Field label="이메일">
          <input value={form.email} onChange={(e) => set("email", e.target.value)} className="field-input" placeholder="company@drygo.co.kr" />
        </Field>
        <Field label="개인이메일">
          <input value={form.personalEmail} onChange={(e) => set("personalEmail", e.target.value)} className="field-input" />
        </Field>
        <Field label="소속 조직">
          <input value={form.org} onChange={(e) => set("org", e.target.value)} className="field-input" placeholder="HR실" />
        </Field>
        <Field label="입사일">
          <input value={form.hireDate} onChange={(e) => set("hireDate", e.target.value)} className="field-input" placeholder="2026.07.07" />
        </Field>
        <Field label="직위">
          <input value={form.title} onChange={(e) => set("title", e.target.value)} className="field-input" placeholder="예: 팀원, 실원, 그룹장" />
        </Field>
        <Field label="포지션명">
          <input value={form.position} onChange={(e) => set("position", e.target.value)} className="field-input" placeholder="예: 백엔드 개발" />
        </Field>
        <Field label="총 경력">
          <input value={form.career} onChange={(e) => set("career", e.target.value)} className="field-input" placeholder="신입 / 3년" />
        </Field>
      </div>

      <div className="px-6 pb-2 flex flex-col gap-2">
        {extra.map((f, i) => (
          <div key={i} className="rounded-lg p-2.5 flex flex-col gap-2" style={{ background: "var(--bg)" }}>
            <div className="flex gap-2">
              <input value={f.label} onChange={(e) => updateExtra(i, "label", e.target.value)} placeholder="항목명" className="field-input flex-1" />
              <input value={f.value} onChange={(e) => updateExtra(i, "value", e.target.value)} placeholder="내용" className="field-input flex-1" />
              <button onClick={() => removeExtra(i)}><Trash2 size={16} style={{ color: "var(--ink-muted)" }} /></button>
            </div>
            <label className="flex items-center gap-1.5 text-xs" style={{ color: "var(--ink-muted)" }}>
              <input type="checkbox" checked={f.applyToAll} onChange={(e) => updateExtra(i, "applyToAll", e.target.checked)} />
              이 항목을 모든 신규입사자 공통 필드로 등록
            </label>
          </div>
        ))}
      </div>
      <div className="px-6 pb-4">
        <button onClick={addExtraField} className="text-xs font-medium flex items-center gap-1" style={{ color: "var(--primary)" }}>
          <PlusCircle size={14} /> 기타 항목 추가
        </button>
        <p className="text-[11px] mt-1.5" style={{ color: "var(--ink-muted)" }}>
          사번~총경력까지 기본 항목은 고정이며 추가·삭제할 수 없습니다. 커스텀 항목만 자유롭게 추가/삭제 가능합니다.
          (전체 필드 관리 화면은 추후 별도 제공 예정)
        </p>
      </div>

      <div className="px-6 py-4 border-t flex justify-end gap-2" style={{ borderColor: "var(--line)" }}>
        <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: "var(--line)" }}>취소</button>
        <button onClick={submit} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "var(--primary)" }}>
          {isEdit ? "저장하기" : "추가하기"}
        </button>
      </div>
    </Modal>
  );
}

function JourneyEditModal({ stages, onClose, onUpdate, onAdd, onDelete, onReorder }) {
  const dragId = useRef(null);
  const [overId, setOverId] = useState(null);
  const sorted = [...stages].sort((a, b) => a.order - b.order);

  function handleDrop(targetId) {
    if (dragId.current !== null && dragId.current !== targetId) onReorder(dragId.current, targetId);
    dragId.current = null;
    setOverId(null);
  }

  return (
    <Modal onClose={onClose} width={720}>
      <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: "var(--line)" }}>
        <h2 className="font-display text-lg font-semibold">Journey 수정</h2>
        <button onClick={onClose}><X size={18} /></button>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-12 gap-2 text-xs font-medium pb-2 mb-1 border-b" style={{ color: "var(--ink-muted)", borderColor: "var(--line)" }}>
          <div className="col-span-1"></div>
          <div className="col-span-1">단계</div>
          <div className="col-span-4">이름</div>
          <div className="col-span-2">시작(W)</div>
          <div className="col-span-2">종료(W)</div>
          <div className="col-span-1">색상</div>
          <div className="col-span-1"></div>
        </div>
        {sorted.map((s) => (
          <div
            key={s.id}
            draggable
            onDragStart={() => (dragId.current = s.id)}
            onDragOver={(e) => { e.preventDefault(); setOverId(s.id); }}
            onDrop={() => handleDrop(s.id)}
            className="grid grid-cols-12 gap-2 items-center py-1.5 rounded-lg"
            style={{ background: overId === s.id ? "var(--bg)" : "transparent" }}
          >
            <div className="col-span-1 cursor-grab flex justify-center" style={{ color: "var(--ink-muted)" }}>
              <GripVertical size={16} />
            </div>
            <div className="col-span-1 font-mono text-sm">{s.order}</div>
            <input className="field-input col-span-4" value={s.name} onChange={(e) => onUpdate(s.id, { name: e.target.value })} />
            <input type="number" step="0.5" className="field-input col-span-2" value={s.startWeek} onChange={(e) => onUpdate(s.id, { startWeek: Number(e.target.value) })} />
            <input type="number" step="0.5" className="field-input col-span-2" value={s.endWeek} onChange={(e) => onUpdate(s.id, { endWeek: Number(e.target.value) })} />
            <div className="col-span-1 flex justify-center">
              <div className="w-5 h-5 rounded-full border" style={{ background: s.color, borderColor: "var(--line)" }} />
            </div>
            <div className="col-span-1 flex justify-end">
              <button onClick={() => onDelete(s.id)}><Trash2 size={16} style={{ color: "var(--ink-muted)" }} /></button>
            </div>
          </div>
        ))}
        <button onClick={onAdd} className="mt-3 text-sm font-medium flex items-center gap-1" style={{ color: "var(--primary)" }}>
          <PlusCircle size={15} /> 단계 추가
        </button>
        <p className="mt-4 text-xs" style={{ color: "var(--ink-muted)" }}>
          '시작(W)'·'종료(W)'는 입사일 기준 경과 주차입니다. 왼쪽 손잡이를 드래그해 단계 순서를 바꿀 수 있어요. 홈 화면의 띠 색상·위치에 즉시 반영됩니다.
        </p>
      </div>
      <div className="px-6 py-4 border-t flex justify-end" style={{ borderColor: "var(--line)" }}>
        <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "var(--primary)" }}>완료</button>
      </div>
    </Modal>
  );
}

function EmployeeDetailModal({ emp, onClose, onOpenJourneyLog, onEdit, isAdmin }) {
  const weeks = elapsedWeeks(emp.hireDate);
  const done = weeks >= TOTAL_WEEKS;
  return (
    <Modal onClose={onClose} width={420}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-full flex items-center justify-center text-sm font-semibold text-white" style={{ width: 48, height: 48, background: done ? "var(--success)" : "var(--primary)" }}>
            {emp.name.slice(-2)}
          </div>
          <div>
            <div className="font-display text-lg font-semibold">{emp.name}</div>
            <div className="text-xs" style={{ color: "var(--ink-muted)" }}>{emp.title} · {emp.position}</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => onEdit(emp)}
                className="flex items-center justify-center w-8 h-8 rounded-lg border"
                style={{ borderColor: "var(--line)" }}
                aria-label="정보 수정"
              >
                <Pencil size={14} />
              </button>
            )}
            <button
              onClick={() => onOpenJourneyLog(emp)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border"
              style={{ borderColor: "var(--line)" }}
            >
              Journey 보기 <ExternalLink size={12} />
            </button>
            <button onClick={onClose}><X size={18} /></button>
          </div>
        </div>
        <div className="rounded-lg px-3 py-2 mb-4 text-sm font-mono" style={{ background: "var(--bg)", color: "var(--ink)" }}>
          {done ? "Journey 완료" : `${weeks.toFixed(1)}주차`} · 현재 단계: {emp.stageLabel}
        </div>
        <div className="flex flex-col gap-2.5">
          <Row icon={<Hash size={14} />} label="사번" value={emp.empNo} />
          <Row icon={<Building2 size={14} />} label="소속" value={emp.org} />
          <Row icon={<Calendar size={14} />} label="입사일" value={fmtDate(emp.hireDate)} />
          <Row icon={<Briefcase size={14} />} label="총 경력" value={emp.career} />
          <Row icon={<Phone size={14} />} label="전화번호" value={emp.phone} />
          <Row icon={<Mail size={14} />} label="이메일" value={emp.email} />
          <Row icon={<Mail size={14} />} label="개인이메일" value={emp.personalEmail} />
          <Row icon={<User size={14} />} label="생년월일 · 성별" value={`${emp.birth} · ${emp.gender}`} />
          {emp.extra && emp.extra.filter((f) => f.label).map((f, i) => (
            <Row key={i} icon={<Award size={14} />} label={f.label} value={f.value} />
          ))}
        </div>
      </div>
    </Modal>
  );
}

function JourneyLogModal({ emp, onClose }) {
  return (
    <Modal onClose={onClose} width={520}>
      <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: "var(--line)" }}>
        <h2 className="font-display text-lg font-semibold">{emp?.name}님의 Journey 보기</h2>
        <button onClick={onClose}><X size={18} /></button>
      </div>
      <div className="p-6">
        <div className="rounded-xl border py-14 text-center text-sm" style={{ borderColor: "var(--line)", color: "var(--ink-muted)" }}>
          버디 프로그램 활동 내역, 중간면담·수습평가 자료 등록 화면은<br />상세 레이아웃 전달 후 구현 예정입니다.
        </div>
      </div>
    </Modal>
  );
}

function JourneyOverviewScreen({ employees, onBack }) {
  return (
    <div className="px-8 py-8">
      <button onClick={onBack} className="flex items-center gap-1 text-sm mb-6" style={{ color: "var(--ink-muted)" }}>
        <ChevronLeft size={16} /> 홈으로
      </button>
      <h2 className="font-display text-xl font-semibold mb-1">Journey 모아보기</h2>
      <p className="text-sm mb-6" style={{ color: "var(--ink-muted)" }}>
        버디 프로그램 활동 내역 · 중간면담 자료 · 수습평가 자료를 중심으로 입사자 데이터를 한눈에 봅니다.
      </p>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--line)" }}>
        <div className="grid grid-cols-4 px-4 py-3 text-xs font-medium" style={{ background: "var(--bg)", color: "var(--ink-muted)" }}>
          <div>이름</div><div>버디 프로그램 활동 내역</div><div>중간면담 자료</div><div>수습평가 자료</div>
        </div>
        {employees.map((e) => (
          <div key={e.id} className="grid grid-cols-4 px-4 py-3 text-sm border-t items-center" style={{ borderColor: "var(--line)" }}>
            <div className="font-medium">{e.name}</div>
            <div className="text-xs" style={{ color: "var(--ink-muted)" }}>등록 예정</div>
            <div className="text-xs" style={{ color: "var(--ink-muted)" }}>등록 예정</div>
            <div className="text-xs" style={{ color: "var(--ink-muted)" }}>등록 예정</div>
          </div>
        ))}
      </div>
      <p className="text-xs mt-3" style={{ color: "var(--ink-muted)" }}>
        상단 바의 각 Journey를 눌러 해당 단계를 거쳐간 입사자 데이터를 모아보는 방식은 추후 별도 업데이트될 예정입니다.
      </p>
    </div>
  );
}

function Track({ emp, stages, onSelect }) {
  const weeks = elapsedWeeks(emp.hireDate);
  const p = pct(weeks);
  const done = weeks >= TOTAL_WEEKS;
  return (
    <div className="relative" style={{ height: "64px" }}>
      <div className="absolute left-0 right-0" style={{ top: "50%", transform: "translateY(-50%)" }}>
        <StageBand stages={stages} height={18} laneTexture />
      </div>

      {/* start / finish ticks */}
      <div className="absolute" style={{ left: "0%", top: "50%", transform: "translate(-50%,-260%)" }}>
        <Flag size={13} style={{ color: "var(--ink-muted)" }} />
      </div>
      <div className="absolute" style={{ left: "100%", top: "50%", transform: "translate(-50%,-260%)" }}>
        <Flag size={13} style={{ color: "var(--success)" }} />
      </div>

      {/* avatar pin */}
      <button
        onClick={() => onSelect(emp)}
        className="absolute flex flex-col items-center group z-10"
        style={{ left: `${p}%`, top: "50%", transform: "translate(-50%, -50%)" }}
      >
        <div
          className="rounded-full flex items-center justify-center text-xs font-semibold text-white shadow-sm"
          style={{ width: "30px", height: "30px", background: done ? "var(--success)" : "var(--ink)", border: "2px solid var(--surface)" }}
        >
          {emp.name.slice(-2)}
        </div>
        <div
          className="opacity-0 group-hover:opacity-100 transition absolute -top-8 px-2 py-1 rounded text-[10px] whitespace-nowrap text-white z-20"
          style={{ background: "var(--ink)" }}
        >
          {emp.name} · {done ? "완료" : `${weeks.toFixed(1)}주차`}
        </div>
      </button>
    </div>
  );
}

export default function Dashboard({ role, userEmail, userName, onLogout, remoteEmployees }) {
  const isAdmin = role === "admin";
  const [stages, setStages] = useState(initialStages);
  // remoteEmployees: null(아직 못 받아옴/실패) → 더미 데이터, 배열 → n8n 실데이터
  const [employees, setEmployees] = useState(() =>
    remoteEmployees ? remoteEmployees.map(normalizeEmployee) : initialEmployees
  );
  useEffect(() => {
    if (remoteEmployees) setEmployees(remoteEmployees.map(normalizeEmployee));
  }, [remoteEmployees]);
  const [customFieldDefs, setCustomFieldDefs] = useState([]);
  const [view, setView] = useState("home");
  const [showAdd, setShowAdd] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [showJourney, setShowJourney] = useState(false);
  const [showFinished, setShowFinished] = useState(false);
  const [selected, setSelected] = useState(null);
  const [journeyLogEmp, setJourneyLogEmp] = useState(null);
  const [toast, setToast] = useState("");

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  function addEmployee(emp) {
    setEmployees((prev) => [...prev, { ...emp, id: Date.now() }]);
    setShowAdd(false);
    showToast(`${emp.name}님이 추가되었습니다`);
  }

  function saveEditedEmployee(emp) {
    setEmployees((prev) => prev.map((e) => (e.id === emp.id ? { ...e, ...emp } : e)));
    setEditEmp(null);
    showToast(`${emp.name}님의 정보가 저장되었습니다`);
  }

  function addCustomFieldDef(label) {
    setCustomFieldDefs((prev) => (prev.some((f) => f.label === label) ? prev : [...prev, { label }]));
  }

  function updateStage(id, patch) {
    setStages((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }
  function addStage() {
    setStages((prev) => [
      ...prev,
      { id: Date.now(), order: prev.length + 1, name: "새 단계", startWeek: 0, endWeek: 0, color: STAGE_COLORS[prev.length % STAGE_COLORS.length] },
    ]);
  }
  function deleteStage(id) {
    setStages((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i + 1 })));
  }
  function reorderStage(dragId, targetId) {
    setStages((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const dragIdx = sorted.findIndex((s) => s.id === dragId);
      const targetIdx = sorted.findIndex((s) => s.id === targetId);
      if (dragIdx === -1 || targetIdx === -1) return prev;
      const [moved] = sorted.splice(dragIdx, 1);
      sorted.splice(targetIdx, 0, moved);
      return sorted.map((s, i) => ({ ...s, order: i + 1 }));
    });
  }

  function currentStageLabel(emp) {
    const weeks = elapsedWeeks(emp.hireDate);
    if (weeks >= TOTAL_WEEKS) return "수습 종료";
    const sorted = [...stages].sort((a, b) => a.endWeek - b.endWeek);
    for (const s of sorted) {
      if (weeks <= s.endWeek) return s.name;
    }
    return sorted[sorted.length - 1]?.name || "-";
  }

  const sortedStages = [...stages].sort((a, b) => a.order - b.order);
  const inProgress = employees.filter((e) => elapsedWeeks(e.hireDate) < TOTAL_WEEKS);
  const finished = employees
    .filter((e) => elapsedWeeks(e.hireDate) >= TOTAL_WEEKS)
    .sort((a, b) => b.hireDate - a.hireDate); // 입사일 역순

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "var(--bg)", color: "var(--ink)" }} className="min-h-screen w-full relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');
        :root {
          --bg: #FAF9F5;
          --surface: #FFFFFF;
          --ink: #1C1F26;
          --ink-muted: #6B7280;
          --track: #23262F;
          --primary: #3355FF;
          --accent: #FFB020;
          --success: #16A34A;
          --line: #E7E5DD;
        }
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .field-input {
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 14px;
          width: 100%;
          outline: none;
          background: var(--surface);
          color: var(--ink);
        }
        .field-input:focus { border-color: var(--primary); }
      `}</style>

      <div className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: "var(--line)" }}>
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-semibold">New-drygo</span>
          <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: "var(--line)", color: "var(--ink-muted)" }}>
            Newcomer Journey
          </span>
        </div>
        {view === "home" && (
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "var(--ink-muted)" }}>
              <input type="checkbox" checked={showFinished} onChange={(e) => setShowFinished(e.target.checked)} />
              완주자 표시
            </label>
            <button
              onClick={() => setView("journeyOverview")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border"
              style={{ borderColor: "var(--line)" }}
            >
              <LayoutGrid size={16} /> Journey 모아보기
            </button>
            {isAdmin && (
              <button
                onClick={() => setShowJourney(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border"
                style={{ borderColor: "var(--line)" }}
              >
                <Settings2 size={16} /> Journey 수정
              </button>
            )}
            <div className="flex items-center gap-2 pl-4 ml-1 border-l" style={{ borderColor: "var(--line)" }}>
              <div className="text-right leading-tight">
                <div className="text-xs font-medium">{userName || userEmail}</div>
                <div className="text-[10px]" style={{ color: "var(--ink-muted)" }}>{isAdmin ? "admin" : "viewer"}</div>
              </div>
              <button
                onClick={onLogout}
                className="text-xs font-medium px-2.5 py-1.5 rounded-lg border"
                style={{ borderColor: "var(--line)", color: "var(--ink-muted)" }}
              >
                로그아웃
              </button>
            </div>
          </div>
        )}
      </div>

      {view === "home" && (
        <div className="px-8 pt-10 pb-24">
          <div className="mb-8">
            <div className="relative mb-2" style={{ height: "34px" }}>
              {sortedStages.map((s) => (
                <div key={s.id} className="absolute text-center" style={{ left: `${pct(s.endWeek)}%`, transform: "translateX(-50%)" }}>
                  <div className="font-mono text-[10px]" style={{ color: s.color }}>D+{Math.round(s.endWeek * 7)}({s.endWeek}W)</div>
                  <div className="font-display text-xs font-semibold whitespace-nowrap">{s.name}</div>
                </div>
              ))}
              <button
                onClick={() => setView("result")}
                className="absolute text-right font-display text-xs font-semibold whitespace-nowrap"
                style={{ left: "100%", transform: "translateX(-100%)", color: "var(--primary)" }}
              >
                Result →
              </button>
            </div>
            <StageBand stages={sortedStages} height={12} />
          </div>

          <div className="flex flex-col gap-8 mt-8">
            {inProgress.map((emp) => (
              <div key={emp.id}>
                <div className="text-xs font-mono mb-1.5" style={{ color: "var(--ink-muted)" }}>{emp.name} · {emp.org}</div>
                <Track emp={emp} stages={sortedStages} onSelect={(e) => setSelected({ ...e, stageLabel: currentStageLabel(e) })} />
              </div>
            ))}
          </div>

          {showFinished && finished.length > 0 && (
            <div className="mt-12 pt-8 border-t" style={{ borderColor: "var(--line)" }}>
              <div className="font-display text-sm font-semibold mb-6" style={{ color: "var(--ink-muted)" }}>
                결승선 통과 · 입사일 역순
              </div>
              <div className="flex flex-col gap-8">
                {finished.map((emp) => (
                  <div key={emp.id}>
                    <div className="text-xs font-mono mb-1.5" style={{ color: "var(--ink-muted)" }}>{emp.name} · {emp.org} · 완료</div>
                    <Track emp={emp} stages={sortedStages} onSelect={(e) => setSelected({ ...e, stageLabel: currentStageLabel(e) })} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* floating add button, bottom right, 2x the avatar pin size (30px -> 60px), admin only */}
          {isAdmin && (
            <button
              onClick={() => setShowAdd(true)}
              className="fixed flex items-center justify-center rounded-full shadow-lg"
              style={{ width: "60px", height: "60px", background: "var(--primary)", right: "32px", bottom: "32px" }}
              aria-label="신규추가"
            >
              <Plus size={28} color="#fff" />
            </button>
          )}
        </div>
      )}

      {view === "result" && (
        <div className="px-8 py-8">
          <button onClick={() => setView("home")} className="flex items-center gap-1 text-sm mb-6" style={{ color: "var(--ink-muted)" }}>
            <ChevronLeft size={16} /> 홈으로
          </button>
          <h2 className="font-display text-xl font-semibold mb-1">수습평가 Result</h2>
          <p className="text-sm mb-6" style={{ color: "var(--ink-muted)" }}>
            {TOTAL_WEEKS}주 Journey를 완료한 입사자의 수습평가 결과입니다.
          </p>
          {finished.length === 0 ? (
            <div className="rounded-xl border py-16 text-center text-sm" style={{ borderColor: "var(--line)", color: "var(--ink-muted)" }}>
              아직 Journey를 완료한 입사자가 없습니다.
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--line)" }}>
              <div className="grid grid-cols-5 px-4 py-3 text-xs font-medium" style={{ background: "var(--bg)", color: "var(--ink-muted)" }}>
                <div>이름</div><div>소속</div><div>입사일</div><div>완료일</div><div>결과</div>
              </div>
              {finished.map((e) => (
                <div key={e.id} className="grid grid-cols-5 px-4 py-3 text-sm border-t items-center" style={{ borderColor: "var(--line)" }}>
                  <div className="font-medium">{e.name}</div>
                  <div style={{ color: "var(--ink-muted)" }}>{e.org}</div>
                  <div className="font-mono text-xs">{fmtDate(e.hireDate)}</div>
                  <div className="font-mono text-xs">{fmtDate(addDays(e.hireDate, TOTAL_WEEKS * 7))}</div>
                  <div>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        background: e.result === "합격" ? "#DCFCE7" : "#FEF3C7",
                        color: e.result === "합격" ? "var(--success)" : "#B45309",
                      }}
                    >
                      {e.result || "평가 예정"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "journeyOverview" && <JourneyOverviewScreen employees={employees} onBack={() => setView("home")} />}

      {showAdd && (
        <EmployeeFormModal
          mode="add"
          onClose={() => setShowAdd(false)}
          onSave={addEmployee}
          customFieldDefs={customFieldDefs}
          onAddCustomFieldDef={addCustomFieldDef}
        />
      )}
      {editEmp && (
        <EmployeeFormModal
          mode="edit"
          initialEmployee={editEmp}
          onClose={() => setEditEmp(null)}
          onSave={saveEditedEmployee}
          customFieldDefs={customFieldDefs}
          onAddCustomFieldDef={addCustomFieldDef}
        />
      )}
      {showJourney && (
        <JourneyEditModal
          stages={stages}
          onClose={() => setShowJourney(false)}
          onUpdate={updateStage}
          onAdd={addStage}
          onDelete={deleteStage}
          onReorder={reorderStage}
        />
      )}
      {selected && (
        <EmployeeDetailModal
          emp={selected}
          onClose={() => setSelected(null)}
          onOpenJourneyLog={(e) => { setSelected(null); setJourneyLogEmp(e); }}
          onEdit={(e) => { setSelected(null); setEditEmp(e); }}
          isAdmin={isAdmin}
        />
      )}
      {journeyLogEmp && <JourneyLogModal emp={journeyLogEmp} onClose={() => setJourneyLogEmp(null)} />}

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-lg text-sm font-medium text-white shadow-lg"
          style={{ background: "var(--ink)" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
