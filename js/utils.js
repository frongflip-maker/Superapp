"use strict";
function showErr(t){var e=document.getElementById("err");e.style.display="block";e.textContent=t;var b=document.getElementById("boot");if(b)b.style.display="none";}
window.onerror=function(m,s,l){showErr("ERROR:\n"+m+"\n(line "+l+")");};
window.addEventListener("error",function(e){if(e&&e.target&&(e.target.tagName==="SCRIPT"||e.target.tagName==="LINK")){showErr("โหลดไฟล์ไม่สำเร็จ (404 หรือ path ผิด): "+(e.target.src||e.target.href));}},true);
window.addEventListener("load",function(){setTimeout(function(){var miss=[];if(!window.React)miss.push("React");if(!window.ReactDOM)miss.push("ReactDOM");if(!window.lucide)miss.push("lucide");if(miss.length)showErr("โหลด library ไม่ได้: "+miss.join(", "));},3000);
    setTimeout(function(){var b=document.getElementById("boot");if(b&&b.style.display!=="none"){showErr("โหลดแอปไม่สำเร็จ (timeout) — ไฟล์ js/*.js บางไฟล์อาจโหลดไม่ครบ หรือ path/ชื่อไฟล์ไม่ตรง ลองเปิด Console (F12) เพื่อดู error");}},8000);});
    var useState = React.useState, useMemo = React.useMemo, useEffect = React.useEffect;
    var createRoot = ReactDOM.createRoot;
    function makeIcon(name) { var node = (window.lucide && window.lucide.icons && window.lucide.icons[name]) || null; return function (props) { var p = props || {}; var size = p.size || 24, color = p.color || "currentColor", style = p.style || {}, className = p.className, sw = p.strokeWidth || 2; if (!node)
        return React.createElement("span", { style: { display: "inline-block", width: size, height: size } }); var children = node.map(function (c, i) { return React.createElement(c[0], Object.assign({ key: i }, c[1])); }); return React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round", style: style, className: className }, children); }; }
    const Home = makeIcon("Home");
    const CalendarDays = makeIcon("CalendarDays");
    const Music = makeIcon("Music");
    const BarChart3 = makeIcon("BarChart3");
    const Plus = makeIcon("Plus");
    const X = makeIcon("X");
    const Check = makeIcon("Check");
    const Flame = makeIcon("Flame");
    const Zap = makeIcon("Zap");
    const Briefcase = makeIcon("Briefcase");
    const Dumbbell = makeIcon("Dumbbell");
    const Video = makeIcon("Video");
    const Map = makeIcon("Map");
    const FileText = makeIcon("FileText");
    const Moon = makeIcon("Moon");
    const User = makeIcon("User");
    const Circle = makeIcon("Circle");
    const Speaker = makeIcon("Speaker");
    const Sparkles = makeIcon("Sparkles");
    const TrendingUp = makeIcon("TrendingUp");
    const Clock = makeIcon("Clock");
    const Heart = makeIcon("Heart");
    const ChevronLeft = makeIcon("ChevronLeft");
    const ChevronRight = makeIcon("ChevronRight");
    const Trophy = makeIcon("Trophy");
    const Settings = makeIcon("Settings");
    const Download = makeIcon("Download");
    const Upload = makeIcon("Upload");
    const Cloud = makeIcon("Cloud");
    const LogOut = makeIcon("LogOut");
    const Gift = makeIcon("Gift");
    const RotateCcw = makeIcon("RotateCcw");
    const History = makeIcon("History");
    const Battery = makeIcon("Battery");
    const Trash2 = makeIcon("Trash2");
    const Pencil = makeIcon("Pencil");
    const AlertCircle = makeIcon("AlertCircle");
    const CalendarPlus = makeIcon("CalendarPlus");
    const MapPin = makeIcon("MapPin");
    const Play = makeIcon("Play");
    const Pause = makeIcon("Pause");
    const Timer = makeIcon("Timer");
    const Minus = makeIcon("Minus");
    const Repeat = makeIcon("Repeat");
    const Tag = makeIcon("Tag");
    const ChevronUp = makeIcon("ChevronUp");
    const Target = makeIcon("Target");
    const LayersIcon = makeIcon("Layers");
    const ChevronDown = makeIcon("ChevronDown");
    const Wallet = makeIcon("Wallet");
    const TrendingDown = makeIcon("TrendingDown");
    const T = {
        bg: "#080A12", surf: "#111827", surf2: "#182033", border: "#27324A",
        text: "#F8FAFC", sub: "#94A3B8", muted: "#64748B",
        purple: "#8B5CF6", blue: "#38BDF8", green: "#22C55E", orange: "#F97316",
        red: "#EF4444", cyan: "#06B6D4", gold: "#FACC15", pink: "#EC4899",
        violet: "#7C3AED", indigo: "#6366F1", slate: "#64748B", gray: "#6B7280",
    };
    const glow = (c, a = 0.35) => `0 0 0 1px ${c}33, 0 8px 28px ${hex(c, a)}`;
    function hex(c, a) { const n = parseInt(c.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }
    const KG2LB = 2.20462;
    const wDisplay = (kgVal, unit) => unit === "lbs" ? Math.round((Number(kgVal) || 0) * KG2LB * 10) / 10 : (Number(kgVal) || 0);
    const wToKg = (val, unit) => unit === "lbs" ? (Number(val) || 0) / KG2LB : (Number(val) || 0);
    const MUSCLE_PARTS = ["อก", "หลัง", "ขา", "ไหล่", "ไบเซ็บ", "ไตรเซ็บ", "แกนกลาง", "ก้น"];
    const PRESET_MUSCLE_GROUPS = ["Chest", "Back", "Shoulders", "Legs", "Glutes", "Biceps", "Triceps", "Abs", "Calves", "Cardio/Full Body"];
    const GYM_STYLES = ["เซอร์กิต", "โมบิลิตี้", "คาร์ดิโอ", "ฟังก์ชันนัล"];
    const SPORT_LIST = ["วิ่ง", "ว่ายน้ำ", "ปั่นจักรยาน", "ฟุตบอล", "บาสเกตบอล", "แบดมินตัน", "เทนนิส", "มวย", "ปีนผา", "โยคะ", "อื่นๆ"];
    const FIT_KINDS = [["weight", "GYM"], ["sport", "SPORTS"]];
    const EVENT_TYPES = {
        work: { label: "Work", Icon: Briefcase, color: T.blue },
        studio: { label: "Studio", Icon: Speaker, color: T.purple },
        fitness: { label: "Fitness", Icon: Dumbbell, color: T.green },
        content: { label: "Content", Icon: Video, color: T.pink },
        practice: { label: "Practice", Icon: Music, color: T.violet },
        social: { label: "Social", Icon: Map, color: T.gold },
        admin: { label: "Admin", Icon: FileText, color: T.slate },
        recovery: { label: "Recovery", Icon: Moon, color: T.cyan },
        personal: { label: "Personal", Icon: User, color: T.indigo },
        other: { label: "Other", Icon: Circle, color: T.gray },
    };
    const TH_M = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const TH_D = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
    const today = new Date();
    const dkey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const parseK = (k) => { const [y, m, dd] = k.split("-").map(Number); return new Date(y, m - 1, dd); };
    const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
    const EN_D = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const EN_M = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const toMin = (t) => { if (!t)
        return 0; const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    const hoursBetween = (a, b) => Math.max(0, (toMin(b) - toMin(a)) / 60);
    const TK = dkey(today);
    const uid = () => Math.random().toString(36).slice(2, 9);
    const seedEvents = () => [];
    const seedBookings = () => [];
    const Glass = ({ children, style, glowColor, className = "", onClick }) => (React.createElement("div", { onClick: onClick, className: `rounded-2xl ${className}`, style: {
            background: `linear-gradient(160deg, ${hex(T.surf2, 0.9)}, ${hex(T.surf, 0.92)})`,
            border: `1px solid ${T.border}`, boxShadow: glowColor ? glow(glowColor) : "0 4px 20px rgba(0,0,0,.3)", ...style
        } }, children));
    const Pill = ({ color, children, solid }) => (React.createElement("span", { className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold", style: { background: solid ? color : hex(color, 0.14), color: solid ? "#0A0A0A" : color, border: `1px solid ${hex(color, 0.4)}` } }, children));
    function Ring({ value, color, size = 92, label, sub }) {
        const r = size / 2 - 7, c = 2 * Math.PI * r, off = c * (1 - Math.min(value, 100) / 100);
        return (React.createElement("div", { className: "relative", style: { width: size, height: size } },
            React.createElement("svg", { width: size, height: size, className: "-rotate-90" },
                React.createElement("circle", { cx: size / 2, cy: size / 2, r: r, fill: "none", stroke: T.surf2, strokeWidth: "7" }),
                React.createElement("circle", { cx: size / 2, cy: size / 2, r: r, fill: "none", stroke: color, strokeWidth: "7", strokeLinecap: "round", strokeDasharray: c, strokeDashoffset: off, style: { transition: "stroke-dashoffset .6s ease", filter: `drop-shadow(0 0 6px ${hex(color, .6)})` } })),
            React.createElement("div", { className: "absolute inset-0 flex flex-col items-center justify-center" },
                React.createElement("span", { className: "text-2xl font-extrabold", style: { color: T.text } }, label),
                sub && React.createElement("span", { className: "text-[10px] font-medium", style: { color: T.muted } }, sub))));
    }
    const Bar = ({ value, color }) => (React.createElement("div", { className: "h-2 rounded-full overflow-hidden", style: { background: T.surf2 } },
        React.createElement("div", { className: "h-full rounded-full", style: { width: `${Math.min(value, 100)}%`, background: color, boxShadow: `0 0 8px ${hex(color, .6)}`, transition: "width .5s" } })));
    const ICS_ALARM_MIN = 15;
    function icsEsc(s) { return String(s == null ? "" : s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n"); }
    function icsFold(line) {
        if (line.length <= 74)
            return line;
        let out = "", i = 0;
        while (i < line.length) {
            const chunk = line.slice(i, i + (i === 0 ? 74 : 73));
            out += (i === 0 ? "" : "\r\n ") + chunk;
            i += (i === 0 ? 74 : 73);
        }
        return out;
    }
    function icsDT(dateK, hm) { const [y, m, d] = (dateK || "").split("-"); const [H, M] = ((hm || "09:00").split(":")); return `${y}${m}${d}T${H}${M}00`; }
    function addHour(hm) { const [H, M] = (hm || "09:00").split(":").map(Number); const t = H * 60 + M + 60; return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`; }
    function eventToVEVENT(e) {
        const start = icsDT(e.date, e.startTime || "09:00");
        const end = icsDT(e.date, e.endTime || addHour(e.startTime || "09:00"));
        const uidv = (e.id || Math.random().toString(36).slice(2)) + "@discipline-os";
        const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        const descBits = [(EVENT_TYPES[e.type] || {}).label, e.location ? `สถานที่: ${e.location}` : "", e.income ? `รายรับ ฿${e.income}` : ""].filter(Boolean).join(" · ");
        const L = ["BEGIN:VEVENT", "UID:" + uidv, "DTSTAMP:" + stamp, "DTSTART:" + start, "DTEND:" + end, "SUMMARY:" + icsEsc(e.title)];
        if (e.location)
            L.push("LOCATION:" + icsEsc(e.location));
        if (descBits)
            L.push("DESCRIPTION:" + icsEsc(descBits));
        L.push("BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + icsEsc(e.title || "แจ้งเตือน"), "TRIGGER:-PT" + ICS_ALARM_MIN + "M", "END:VALARM", "END:VEVENT");
        return L.map(icsFold).join("\r\n");
    }
    function buildICS(events) {
        const evs = (events || []).filter(e => e.date && e.startTime);
        return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Discipline OS//TH//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
            ...evs.map(eventToVEVENT), "END:VCALENDAR"].join("\r\n");
    }
    function downloadICS(filename, events) {
        const content = buildICS(events);
        const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
        const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        if (isIOS) {
            window.location.href = url;
            setTimeout(() => { try {
                URL.revokeObjectURL(url);
            }
            catch { } }, 4000);
            return;
        }
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { try {
            document.body.removeChild(a);
        }
        catch { } URL.revokeObjectURL(url); }, 800);
    }
    const NumBoxE = ({ value, onChange }) => (React.createElement("input", { type: "number", inputMode: "decimal", value: value, onChange: e => onChange(e.target.value), className: "px-2 py-1.5 rounded-lg text-sm font-bold text-center outline-none w-full", style: { background: T.surf2, color: T.text, border: `1px solid ${T.border}` } }));
    const TxtBoxE = ({ value, onChange, ph }) => (React.createElement("input", { value: value, onChange: e => onChange(e.target.value), placeholder: ph, className: "px-2 py-1.5 rounded-lg text-sm font-bold text-center outline-none w-full", style: { background: T.surf2, color: T.text, border: `1px solid ${T.border}` } }));
    function EventModal({ onClose, onSave, onSaveSeries, mode = "add", initial = null, defaultDate = null, txnCategories, onDelete, onDeleteSeries }) {
        const [f, setF] = useState(initial
            ? { title: initial.title || "", type: initial.type || "work", date: initial.date || defaultDate || TK, startTime: initial.startTime || "09:00", endTime: initial.endTime || "10:00", location: initial.location || "", energyCost: initial.energyCost ?? 2, income: initial.income || "", category: initial.category || "งานสอน", fitKind: initial.fitKind || "weight", fitParts: initial.fitParts || [], fitSport: initial.fitSport || "", fitRun: initial.fitRun || { tKm: "", tPace: "", tTime: "", aKm: "", aPace: "", aTime: "" } }
            : { title: "", type: "work", date: defaultDate || TK, startTime: "09:00", endTime: "10:00", location: "", energyCost: 2, income: "", category: "งานสอน", fitKind: "weight", fitParts: [], fitSport: "", fitRun: { tKm: "", tPace: "", tTime: "", aKm: "", aPace: "", aTime: "" } });
        const isEdit = mode === "edit";
        const [repeat, setRepeat] = useState(false);
        const [repeatFreq, setRepeatFreq] = useState("week");
        const [repeatCount, setRepeatCount] = useState(4);
        const [delConfirm, setDelConfirm] = useState(null);
        const togglerPart = (p) => setF(s => ({ ...s, fitParts: s.fitParts.includes(p) ? s.fitParts.filter(x => x !== p) : [...s.fitParts, p] }));
        const setRun = (k, v) => setF(s => ({ ...s, fitRun: { ...s.fitRun, [k]: v } }));
        const isRun = f.fitSport === "วิ่ง";
        return (React.createElement(Sheet, { onClose: onClose, title: isEdit ? "แก้ไข Event" : "เพิ่ม Event" },
            React.createElement(Input, { label: "\u0E0A\u0E37\u0E48\u0E2D", value: f.title, onChange: v => setF({ ...f, title: v }), placeholder: "\u0E40\u0E0A\u0E48\u0E19 \u0E2A\u0E2D\u0E19\u0E01\u0E25\u0E2D\u0E07" }),
            React.createElement("div", { className: "mb-3" },
                React.createElement(Label, null, "\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17"),
                React.createElement("div", { className: "flex gap-1.5 flex-wrap" }, Object.entries(EVENT_TYPES).map(([k, v]) => {
                    const on = f.type === k;
                    return React.createElement("button", { key: k, onClick: () => setF({ ...f, type: k }), className: "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium", style: { background: on ? v.color : T.surf2, color: on ? "#000" : T.sub, border: `1px solid ${on ? v.color : T.border}` } },
                        React.createElement(v.Icon, { size: 12 }),
                        v.label);
                }))),
            f.type === "fitness" && (React.createElement("div", { className: "mb-3 p-3 rounded-xl", style: { background: T.surf2, border: `1px solid ${hex(T.green, .4)}` } },
                React.createElement(Label, null, "\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E01\u0E32\u0E23\u0E2D\u0E2D\u0E01\u0E01\u0E33\u0E25\u0E31\u0E07"),
                React.createElement("div", { className: "flex gap-1.5 mb-2" }, FIT_KINDS.map(([k, l]) => {
                    const on = f.fitKind === k;
                    return React.createElement("button", { key: k, onClick: () => setF({ ...f, fitKind: k }), className: "flex-1 py-2 rounded-lg text-xs font-bold", style: { background: on ? T.green : "transparent", color: on ? "#000" : T.sub, border: `1px solid ${on ? T.green : T.border}` } }, l);
                })),
                f.fitKind === "weight" && (React.createElement("div", { className: "space-y-2" },
                    React.createElement("div", null,
                        React.createElement(Label, null, "\u0E2A\u0E48\u0E27\u0E19\u0E17\u0E35\u0E48\u0E40\u0E25\u0E48\u0E19 (\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E44\u0E14\u0E49\u0E2B\u0E25\u0E32\u0E22\u0E2A\u0E48\u0E27\u0E19)"),
                        React.createElement("div", { className: "flex gap-1.5 flex-wrap" }, MUSCLE_PARTS.map(p => {
                            const on = f.fitParts.includes(p);
                            return React.createElement("button", { key: p, onClick: () => togglerPart(p), className: "px-2.5 py-1.5 rounded-lg text-xs font-medium", style: { background: on ? T.green : T.surf, color: on ? "#000" : T.sub, border: `1px solid ${on ? T.green : T.border}` } },
                                on ? "✓ " : "",
                                p);
                        }))),
                    React.createElement("div", null,
                        React.createElement(Label, null, "\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A (optional)"),
                        React.createElement("div", { className: "flex gap-1.5 flex-wrap" }, GYM_STYLES.map(p => {
                            const on = f.fitParts.includes(p);
                            return React.createElement("button", { key: p, onClick: () => togglerPart(p), className: "px-2.5 py-1.5 rounded-lg text-xs font-medium", style: { background: on ? T.cyan : T.surf, color: on ? "#000" : T.sub, border: `1px solid ${on ? T.cyan : T.border}` } },
                                on ? "✓ " : "",
                                p);
                        }))))),
                f.fitKind === "sport" && (React.createElement("div", { className: "space-y-2" },
                    React.createElement("div", null,
                        React.createElement(Label, null, "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E01\u0E35\u0E2C\u0E32"),
                        React.createElement("div", { className: "flex gap-1.5 flex-wrap" }, SPORT_LIST.map(sp => {
                            const on = f.fitSport === sp;
                            return React.createElement("button", { key: sp, onClick: () => setF({ ...f, fitSport: sp }), className: "px-2.5 py-1.5 rounded-lg text-xs font-medium", style: { background: on ? T.green : T.surf, color: on ? "#000" : T.sub, border: `1px solid ${on ? T.green : T.border}` } },
                                on ? "✓ " : "",
                                sp);
                        }))),
                    isRun && (React.createElement("div", { className: "p-2.5 rounded-xl", style: { background: T.surf, border: `1px solid ${hex(T.blue, .4)}` } },
                        React.createElement("div", { className: "text-[11px] font-bold mb-1.5", style: { color: T.blue } }, "\u0E27\u0E34\u0E48\u0E07 \u2014 \u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22 vs \u0E17\u0E33\u0E44\u0E14\u0E49\u0E08\u0E23\u0E34\u0E07"),
                        React.createElement("div", { className: "grid grid-cols-3 gap-1.5 items-end" },
                            React.createElement("div", null),
                            React.createElement("div", { className: "text-[10px] text-center", style: { color: T.muted } }, "\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22"),
                            React.createElement("div", { className: "text-[10px] text-center", style: { color: T.muted } }, "\u0E17\u0E33\u0E44\u0E14\u0E49\u0E08\u0E23\u0E34\u0E07"),
                            React.createElement("span", { className: "text-[11px]", style: { color: T.sub } }, "\u0E23\u0E30\u0E22\u0E30 (km)"),
                            React.createElement(NumBoxE, { value: f.fitRun.tKm, onChange: v => setRun("tKm", v) }),
                            React.createElement(NumBoxE, { value: f.fitRun.aKm, onChange: v => setRun("aKm", v) }),
                            React.createElement("span", { className: "text-[11px]", style: { color: T.sub } }, "\u0E40\u0E1E\u0E0B (/km)"),
                            React.createElement(TxtBoxE, { value: f.fitRun.tPace, onChange: v => setRun("tPace", v), ph: "5:30" }),
                            React.createElement(TxtBoxE, { value: f.fitRun.aPace, onChange: v => setRun("aPace", v), ph: "5:30" }),
                            React.createElement("span", { className: "text-[11px]", style: { color: T.sub } }, "\u0E40\u0E27\u0E25\u0E32"),
                            React.createElement(TxtBoxE, { value: f.fitRun.tTime, onChange: v => setRun("tTime", v), ph: "30:00" }),
                            React.createElement(TxtBoxE, { value: f.fitRun.aTime, onChange: v => setRun("aTime", v), ph: "30:00" })))))))),
            React.createElement("div", { className: "mb-3" },
                React.createElement(Label, null, "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48"),
                React.createElement("input", { type: "date", value: f.date, onChange: e => setF({ ...f, date: e.target.value }), className: "w-full px-3 py-2.5 rounded-xl text-sm outline-none", style: { background: T.surf, color: T.text, border: `1px solid ${T.border}`, colorScheme: "dark" } })),
            React.createElement("div", { className: "flex gap-2 mb-3" },
                React.createElement("div", { className: "flex-1" },
                    React.createElement(Label, null, "\u0E40\u0E23\u0E34\u0E48\u0E21"),
                    React.createElement(TimeInput, { value: f.startTime, onChange: v => setF({ ...f, startTime: v }) })),
                React.createElement("div", { className: "flex-1" },
                    React.createElement(Label, null, "\u0E08\u0E1A"),
                    React.createElement(TimeInput, { value: f.endTime, onChange: v => setF({ ...f, endTime: v }) }))),
            React.createElement(Input, { label: "\u0E2A\u0E16\u0E32\u0E19\u0E17\u0E35\u0E48 (optional)", value: f.location, onChange: v => setF({ ...f, location: v }), placeholder: "\u0E40\u0E0A\u0E48\u0E19 \u0E2A\u0E15\u0E39\u0E14\u0E34\u0E42\u0E2D" }),
            React.createElement(Input, { label: "\u0E23\u0E32\u0E22\u0E23\u0E31\u0E1A \u0E3F (optional)", value: f.income, onChange: v => setF({ ...f, income: v }), placeholder: "0", type: "number" }),
            Number(f.income) > 0 && (React.createElement("div", { className: "mb-3" },
                React.createElement(Label, null, "\u0E2B\u0E21\u0E27\u0E14\u0E23\u0E32\u0E22\u0E23\u0E31\u0E1A"),
                React.createElement("div", { className: "flex gap-1.5 flex-wrap" }, (txnCategories?.income || ["งานสอน"]).map(c => {
                    const on = f.category === c;
                    return React.createElement("button", { key: c, onClick: () => setF({ ...f, category: c }), className: "px-2.5 py-1.5 rounded-lg text-xs font-medium", style: { background: on ? T.green : T.surf2, color: on ? "#000" : T.sub, border: `1px solid ${on ? T.green : T.border}` } }, c);
                })))),
            !isEdit && (React.createElement("div", { className: "mb-3 p-3 rounded-xl", style: { background: T.surf2, border: `1px solid ${T.border}` } },
                React.createElement("button", { onClick: () => setRepeat(r => !r), className: "flex items-center gap-3 w-full" },
                    React.createElement("span", { className: "w-11 h-6 rounded-full relative shrink-0 transition-colors", style: { background: repeat ? T.purple : T.surf } },
                        React.createElement("span", { className: "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all", style: { left: repeat ? "22px" : "2px" } })),
                    React.createElement("div", { className: "flex-1 text-left" },
                        React.createElement("div", { className: "text-xs font-bold" }, "\u0E17\u0E33\u0E0B\u0E49\u0E33"),
                        React.createElement("div", { className: "text-[10px]", style: { color: T.muted } }, "\u0E40\u0E0A\u0E48\u0E19 \u0E40\u0E25\u0E48\u0E19\u0E23\u0E49\u0E32\u0E19\u0E40\u0E14\u0E34\u0E21\u0E17\u0E38\u0E01\u0E2A\u0E31\u0E1B\u0E14\u0E32\u0E2B\u0E4C"))),
                repeat && (React.createElement("div", { className: "mt-3 space-y-2.5" },
                    React.createElement("div", { className: "flex gap-1.5" }, [["day", "ทุกวัน"], ["week", "ทุกสัปดาห์"], ["month", "ทุกเดือน"]].map(([k, l]) => {
                        const on = repeatFreq === k;
                        return React.createElement("button", { key: k, onClick: () => setRepeatFreq(k), className: "flex-1 py-2 rounded-lg text-xs font-bold", style: { background: on ? T.purple : T.surf, color: on ? "#fff" : T.sub, border: `1px solid ${on ? T.purple : T.border}` } }, l);
                    })),
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement(Label, null, "\u0E08\u0E33\u0E19\u0E27\u0E19\u0E04\u0E23\u0E31\u0E49\u0E07"),
                        React.createElement("input", { type: "number", min: 2, max: 52, value: repeatCount, onChange: e => { const v = e.target.value; setRepeatCount(v === "" ? "" : Number(v)); }, onBlur: e => setRepeatCount(Math.max(2, Math.min(52, Number(e.target.value) || 2))), className: "w-20 px-3 py-2 rounded-lg text-sm outline-none", style: { background: T.surf, color: T.text, border: `1px solid ${T.border}` } })),
                    React.createElement("div", { className: "text-[10px]", style: { color: T.muted } },
                        "\u0E08\u0E30\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14 ",
                        repeatCount,
                        " \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23 (\u0E41\u0E01\u0E49/\u0E25\u0E1A\u0E17\u0E35\u0E2B\u0E25\u0E31\u0E07\u0E41\u0E22\u0E01\u0E17\u0E35\u0E25\u0E30\u0E2D\u0E31\u0E19\u0E44\u0E14\u0E49\u0E15\u0E32\u0E21\u0E1B\u0E01\u0E15\u0E34)"))))),
            (() => {
                const buildBase = () => {
                    const base = { ...f, income: Number(f.income) || 0 };
                    if (base.type !== "fitness") {
                        delete base.fitKind;
                        delete base.fitParts;
                        delete base.fitSport;
                        delete base.fitRun;
                    }
                    else if (base.fitKind !== "weight") {
                        base.fitParts = [];
                        if (base.fitSport !== "วิ่ง") {
                            delete base.fitRun;
                        }
                    }
                    else {
                        delete base.fitSport;
                        delete base.fitRun;
                    }
                    return base;
                };
                if (isEdit) {
                    return (React.createElement("div", { className: "space-y-2" },
                        React.createElement(SaveBtn, { disabled: !f.title.trim(), onClick: () => onSave(buildBase()) }, "\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E40\u0E09\u0E1E\u0E32\u0E30\u0E27\u0E31\u0E19\u0E19\u0E35\u0E49"),
                        onSaveSeries && (React.createElement("button", { disabled: !f.title.trim(), onClick: () => onSaveSeries(buildBase()), className: "w-full py-3 rounded-xl font-bold text-sm active:scale-[.98] disabled:opacity-40", style: { background: T.surf2, color: T.purple, border: `1px solid ${hex(T.purple, .5)}` } }, "\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E19\u0E35\u0E49 + \u0E17\u0E38\u0E01\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E43\u0E19\u0E2D\u0E19\u0E32\u0E04\u0E15 (\u0E0A\u0E37\u0E48\u0E2D\u0E40\u0E14\u0E35\u0E22\u0E27\u0E01\u0E31\u0E19)"))));
                }
                return (React.createElement(SaveBtn, { disabled: !f.title.trim(), onClick: () => {
                        const base = buildBase();
                        const cnt = Math.max(2, Math.min(52, Number(repeatCount) || 2));
                        if (repeat && cnt > 1) {
                            const baseDate = parseK(base.date);
                            const stepDate = (i) => { if (repeatFreq === "month") {
                                const d2 = new Date(baseDate);
                                d2.setMonth(d2.getMonth() + i);
                                return d2;
                            } return addDays(baseDate, (repeatFreq === "day" ? 1 : 7) * i); };
                            const list = [];
                            for (let i = 0; i < cnt; i++)
                                list.push({ ...base, date: dkey(stepDate(i)) });
                            onSave(list);
                        }
                        else {
                            onSave([base]);
                        }
                    } }, "\u0E40\u0E1E\u0E34\u0E48\u0E21 Event"));
            })(),
            isEdit && React.createElement("div", { className: "text-[10px] text-center mt-2", style: { color: T.muted } }, "\u0E41\u0E01\u0E49\u0E41\u0E25\u0E49\u0E27\u0E2D\u0E22\u0E48\u0E32\u0E25\u0E37\u0E21\u0E01\u0E14 \u201C\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E25\u0E07\u0E1B\u0E0F\u0E34\u0E17\u0E34\u0E19\u201D \u0E2D\u0E35\u0E01\u0E04\u0E23\u0E31\u0E49\u0E07\u0E16\u0E49\u0E32\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23\u0E2D\u0E31\u0E1B\u0E40\u0E14\u0E15\u0E41\u0E08\u0E49\u0E07\u0E40\u0E15\u0E37\u0E2D\u0E19\u0E43\u0E19\u0E40\u0E04\u0E23\u0E37\u0E48\u0E2D\u0E07"),
            isEdit && onDelete && (React.createElement("div", { className: "mt-4 pt-4 space-y-2", style: { borderTop: `1px solid ${T.border}` } },
                delConfirm === "one" ? (React.createElement("button", { onClick: onDelete, className: "w-full py-2.5 rounded-xl font-bold", style: { background: T.red, color: "#fff" } }, "\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E25\u0E1A\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E19\u0E35\u0E49")) : (React.createElement("button", { onClick: () => setDelConfirm("one"), className: "w-full py-2.5 rounded-xl font-bold text-sm", style: { background: T.surf2, color: T.red, border: `1px solid ${hex(T.red, .5)}` } }, "\u0E25\u0E1A\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E19\u0E35\u0E49")),
                onDeleteSeries && (delConfirm === "series" ? (React.createElement("button", { onClick: onDeleteSeries, className: "w-full py-2.5 rounded-xl font-bold", style: { background: T.red, color: "#fff" } }, "\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E25\u0E1A\u0E19\u0E35\u0E49 + \u0E17\u0E38\u0E01\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E43\u0E19\u0E2D\u0E19\u0E32\u0E04\u0E15 (\u0E0A\u0E37\u0E48\u0E2D\u0E40\u0E14\u0E35\u0E22\u0E27\u0E01\u0E31\u0E19)")) : (React.createElement("button", { onClick: () => setDelConfirm("series"), className: "w-full py-2 rounded-xl font-medium text-xs", style: { background: "transparent", color: T.muted, border: `1px dashed ${T.border}` } }, "\u0E25\u0E1A\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E19\u0E35\u0E49 + \u0E17\u0E38\u0E01\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E43\u0E19\u0E2D\u0E19\u0E32\u0E04\u0E15\u0E17\u0E35\u0E48\u0E0A\u0E37\u0E48\u0E2D\u0E40\u0E14\u0E35\u0E22\u0E27\u0E01\u0E31\u0E19 (\u0E40\u0E01\u0E47\u0E1A\u0E02\u0E2D\u0E07\u0E40\u0E01\u0E48\u0E32\u0E44\u0E27\u0E49)")))))));
    }
    const PER_PAGE = 10;
    const monthKey = (dk) => (dk || "").slice(0, 7);
    const addMonthKey = (mk, delta) => { const [y, m] = mk.split("-").map(Number); const d = new Date(y, m - 1 + delta, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };
    const monthLabel = (mk) => { const [y, m] = mk.split("-").map(Number); return `${TH_M[m - 1]} ${y}`; };
    const fmtBaht = (n) => `฿${Math.round(n).toLocaleString()}`;
    function toCSV(rows) {
        const esc = (v) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
        return rows.map(r => r.map(esc).join(",")).join("\r\n");
    }
    function downloadCSV(filename, rows) {
        const csv = "\uFEFF" + toCSV(rows);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 4000);
    }
    const shortDate = (dk) => { const d = parseK(dk); return `${d.getDate()} ${TH_M[d.getMonth()]}`; };
    const openMaps = (loc) => { if (!loc)
        return; window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`, "_blank", "noopener"); };
    const Pager = ({ page, setPage, total }) => {
        const pages = Math.max(1, Math.ceil(total / PER_PAGE));
        if (pages <= 1)
            return null;
        return (React.createElement("div", { className: "flex items-center justify-between pt-1" },
            React.createElement("button", { disabled: page <= 0, onClick: () => setPage(p => Math.max(0, p - 1)), className: "text-[11px] font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1", style: { background: T.surf2, color: page <= 0 ? T.muted : T.text, opacity: page <= 0 ? 0.4 : 1 } },
                React.createElement(ChevronLeft, { size: 13 }),
                " \u0E01\u0E48\u0E2D\u0E19\u0E2B\u0E19\u0E49\u0E32"),
            React.createElement("span", { className: "text-[11px]", style: { color: T.muted } },
                "\u0E2B\u0E19\u0E49\u0E32 ",
                page + 1,
                "/",
                pages),
            React.createElement("button", { disabled: page >= pages - 1, onClick: () => setPage(p => Math.min(pages - 1, p + 1)), className: "text-[11px] font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1", style: { background: T.surf2, color: page >= pages - 1 ? T.muted : T.text, opacity: page >= pages - 1 ? 0.4 : 1 } },
                "\u0E16\u0E31\u0E14\u0E44\u0E1B ",
                React.createElement(ChevronRight, { size: 13 }))));
    };
    function ReorderSheet({ title, items, onClose, onSave }) {
        const [list, setList] = useState(items);
        const move = (i, dir) => setList(l => { const arr = [...l]; const j = i + dir; if (j < 0 || j >= arr.length)
            return arr; [arr[i], arr[j]] = [arr[j], arr[i]]; return arr; });
        return (React.createElement(Sheet, { onClose: onClose, title: title },
            React.createElement("div", { className: "text-[11px] mb-3", style: { color: T.muted } }, "5 \u0E2D\u0E31\u0E19\u0E14\u0E31\u0E1A\u0E41\u0E23\u0E01 (\u0E41\u0E16\u0E1A\u0E40\u0E02\u0E35\u0E22\u0E27) \u0E08\u0E30\u0E42\u0E0A\u0E27\u0E4C\u0E40\u0E1B\u0E47\u0E19\u0E1B\u0E38\u0E48\u0E21\u0E25\u0E31\u0E14 \u2014 \u0E43\u0E0A\u0E49\u0E25\u0E39\u0E01\u0E28\u0E23\u0E22\u0E49\u0E32\u0E22\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E44\u0E14\u0E49"),
            React.createElement("div", { className: "space-y-1.5 mb-4" }, list.map((it, i) => (React.createElement("div", { key: it, className: "flex items-center gap-2 p-2 rounded-lg", style: { background: i < 5 ? hex(T.green, .1) : T.surf2, border: `1px solid ${i < 5 ? hex(T.green, .4) : T.border}` } },
                React.createElement("span", { className: "text-xs font-bold w-5 text-center shrink-0", style: { color: i < 5 ? T.green : T.muted } }, i + 1),
                React.createElement("span", { className: "flex-1 text-sm truncate" }, it),
                React.createElement("button", { onClick: () => move(i, -1), disabled: i === 0, "aria-label": "\u0E22\u0E49\u0E32\u0E22\u0E02\u0E36\u0E49\u0E19", className: "w-7 h-7 rounded-md flex items-center justify-center shrink-0", style: { color: T.sub, opacity: i === 0 ? 0.3 : 1 } },
                    React.createElement(ChevronUp, { size: 14 })),
                React.createElement("button", { onClick: () => move(i, 1), disabled: i === list.length - 1, "aria-label": "\u0E22\u0E49\u0E32\u0E22\u0E25\u0E07", className: "w-7 h-7 rounded-md flex items-center justify-center shrink-0", style: { color: T.sub, opacity: i === list.length - 1 ? 0.3 : 1 } },
                    React.createElement(ChevronDown, { size: 14 })))))),
            React.createElement(SaveBtn, { onClick: () => onSave(list) }, "\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E25\u0E33\u0E14\u0E31\u0E1A")));
    }
    function CatPicker({ label, color, options, value, onChange, onAdd, onReorder }) {
        const [adding, setAdding] = useState(false);
        const [nv, setNv] = useState("");
        const [reorderOpen, setReorderOpen] = useState(false);
        const shown = options.slice(0, 5);
        const rest = options.slice(5);
        return (React.createElement("div", { className: "mb-3" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement(Label, null, label),
                options.length > 5 && onReorder && React.createElement("button", { onClick: () => setReorderOpen(true), className: "text-[10px] font-bold mb-1.5", style: { color: T.blue } }, "\u0E08\u0E31\u0E14\u0E40\u0E23\u0E35\u0E22\u0E07")),
            React.createElement("div", { className: "flex gap-1.5 flex-wrap items-center" },
                shown.map(c => {
                    const on = value === c;
                    return React.createElement("button", { key: c, onClick: () => onChange(c), className: "px-2.5 py-1.5 rounded-lg text-xs font-medium", style: { background: on ? color : T.surf2, color: on ? "#000" : T.sub, border: `1px solid ${on ? color : T.border}` } }, c);
                }),
                adding ? (React.createElement("div", { className: "flex items-center gap-1" },
                    React.createElement("input", { autoFocus: true, value: nv, onChange: e => setNv(e.target.value), placeholder: "\u0E2B\u0E21\u0E27\u0E14\u0E43\u0E2B\u0E21\u0E48", className: "px-2 py-1.5 rounded-lg text-xs outline-none", style: { background: T.surf, color: T.text, border: `1px solid ${color}`, width: 100 } }),
                    React.createElement("button", { onClick: () => { if (nv.trim()) {
                            onAdd(nv.trim());
                            onChange(nv.trim());
                        } setNv(""); setAdding(false); }, className: "w-7 h-7 rounded-lg flex items-center justify-center", style: { background: hex(color, .16), color } },
                        React.createElement(Check, { size: 13 })))) : (React.createElement("button", { onClick: () => setAdding(true), className: "px-2.5 py-1.5 rounded-lg text-xs font-medium", style: { background: T.surf2, color: T.muted, border: `1px dashed ${T.border}` } }, "+ \u0E40\u0E1E\u0E34\u0E48\u0E21\u0E2B\u0E21\u0E27\u0E14")),
                rest.length > 0 && (React.createElement("select", { value: "", onChange: e => { if (e.target.value)
                        onChange(e.target.value); }, className: "px-2 py-1.5 rounded-lg text-xs outline-none", style: { background: T.surf2, color: T.muted, border: `1px dashed ${T.border}`, colorScheme: "dark", maxWidth: 110 } },
                    React.createElement("option", { value: "" }, "\u0E2B\u0E21\u0E27\u0E14\u0E2D\u0E37\u0E48\u0E19\u0E46\u2026"),
                    rest.map(c => React.createElement("option", { key: c, value: c }, c))))),
            reorderOpen && React.createElement(ReorderSheet, { title: `จัดเรียง: ${label}`, items: options, onClose: () => setReorderOpen(false), onSave: (newList) => { onReorder(newList); setReorderOpen(false); } })));
    }
    function AccPicker({ label, accounts, value, onChange, exclude }) {
        const list = accounts.filter(a => a.id !== exclude);
        return (React.createElement("div", { className: "mb-3" },
            React.createElement(Label, null, label),
            list.length === 0 ? React.createElement("div", { className: "text-xs p-2.5 rounded-lg", style: { background: T.surf2, color: T.muted } }, "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E1A\u0E31\u0E0D\u0E0A\u0E35 \u2014 \u0E44\u0E1B\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E17\u0E35\u0E48 Budget \u2192 \u0E1A\u0E31\u0E0D\u0E0A\u0E35 \u0E01\u0E48\u0E2D\u0E19") : (React.createElement("div", { className: "flex gap-1.5 flex-wrap" }, list.map(a => {
                const on = value === a.id;
                return React.createElement("button", { key: a.id, onClick: () => onChange(a.id), className: "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5", style: { background: on ? T.purple : T.surf2, color: on ? "#fff" : T.sub, border: `1px solid ${on ? T.purple : T.border}` } },
                    React.createElement(Wallet, { size: 11 }),
                    a.name);
            })))));
    }
    function ExpensePresetPicker({ presets, onPick, onAddPreset, onReorder }) {
        const [adding, setAdding] = useState(false);
        const [nv, setNv] = useState("");
        const [reorderOpen, setReorderOpen] = useState(false);
        const shown = presets.slice(0, 5);
        const rest = presets.slice(5);
        return (React.createElement("div", { className: "mb-3 -mt-1" },
            presets.length > 5 && (React.createElement("div", { className: "flex justify-end mb-1" },
                React.createElement("button", { onClick: () => setReorderOpen(true), className: "text-[10px] font-bold", style: { color: T.blue } }, "\u0E08\u0E31\u0E14\u0E40\u0E23\u0E35\u0E22\u0E07"))),
            React.createElement("div", { className: "flex gap-1.5 flex-wrap items-center" },
                shown.map(q => (React.createElement("button", { key: q, onClick: () => onPick(q), className: "text-[11px] px-2.5 py-1 rounded-lg", style: { background: T.surf2, color: T.sub, border: `1px solid ${T.border}` } }, q))),
                adding ? (React.createElement("div", { className: "flex items-center gap-1" },
                    React.createElement("input", { autoFocus: true, value: nv, onChange: e => setNv(e.target.value), placeholder: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E43\u0E2B\u0E21\u0E48", className: "px-2 py-1 rounded-lg text-[11px] outline-none", style: { background: T.surf, color: T.text, border: `1px solid ${T.blue}`, width: 100 } }),
                    React.createElement("button", { onClick: () => { if (nv.trim()) {
                            onAddPreset(nv.trim());
                        } setNv(""); setAdding(false); }, className: "w-6 h-6 rounded-lg flex items-center justify-center", style: { background: hex(T.blue, .16), color: T.blue } },
                        React.createElement(Check, { size: 11 })))) : (React.createElement("button", { onClick: () => setAdding(true), className: "text-[11px] px-2.5 py-1 rounded-lg", style: { background: T.surf2, color: T.muted, border: `1px dashed ${T.border}` } }, "+ \u0E40\u0E1E\u0E34\u0E48\u0E21")),
                rest.length > 0 && (React.createElement("select", { value: "", onChange: e => { if (e.target.value)
                        onPick(e.target.value); }, className: "text-[11px] px-2 py-1 rounded-lg outline-none", style: { background: T.surf2, color: T.muted, border: `1px dashed ${T.border}`, colorScheme: "dark", maxWidth: 100 } },
                    React.createElement("option", { value: "" }, "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E40\u0E01\u0E48\u0E32\u2026"),
                    rest.map(p => React.createElement("option", { key: p, value: p }, p))))),
            reorderOpen && React.createElement(ReorderSheet, { title: "\u0E08\u0E31\u0E14\u0E40\u0E23\u0E35\u0E22\u0E07\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E23\u0E32\u0E22\u0E08\u0E48\u0E32\u0E22", items: presets, onClose: () => setReorderOpen(false), onSave: (newList) => { onReorder(newList); setReorderOpen(false); } })));
    }
    function TxnModal({ onClose, onSave, accounts, txnCategories, setTxnCategories, studioMode = false, expensePresets, setExpensePresets }) {
        const [f, setF] = useState({ title: "", amount: "", kind: studioMode ? "out" : "out", date: TK, accountId: accounts[0]?.id || null, category: studioMode ? "ห้องซ้อม" : "", taxable: true, fromAccountId: accounts[0]?.id || null, toAccountId: accounts[1]?.id || accounts[0]?.id || null, transferNote: "" });
        const [transferOnward, setTransferOnward] = useState(false);
        const [onwardAccountId, setOnwardAccountId] = useState(accounts[1]?.id || null);
        const [onwardNote, setOnwardNote] = useState("");
        const quick = studioMode ? ["ซ่อมอุปกรณ์ห้องซ้อม", "ซื้อสายไฟ/อะไหล่", "ค่าทำความสะอาด", "ค่าไฟห้องซ้อม"] : ["ค่าไฟ", "ค่าน้ำ", "ค่าเช่า", "ซ่อมอุปกรณ์", "ซื้อของ"];
        const catKey = (kind) => kind === "in" ? "income" : "expense";
        const addCat = (kind, name) => setTxnCategories(c => ({ ...c, [catKey(kind)]: c[catKey(kind)].includes(name) ? c[catKey(kind)] : [...c[catKey(kind)], name] }));
        const isTransfer = !studioMode && f.kind === "transfer";
        const valid = isTransfer
            ? (f.fromAccountId && f.toAccountId && f.fromAccountId !== f.toAccountId && Number(f.amount) > 0)
            : (f.title.trim() && Number(f.amount) > 0 && f.accountId && (studioMode || f.category));
        return (React.createElement(Sheet, { onClose: onClose, title: studioMode ? "เพิ่มรายจ่ายห้องซ้อม" : "เพิ่มรายรับ-รายจ่าย" },
            !studioMode && (React.createElement("div", { className: "flex gap-1 p-1 rounded-xl mb-3", style: { background: T.surf2 } }, [["out", "รายจ่าย", T.red], ["in", "รายรับ", T.green], ["transfer", "โอนย้าย", T.cyan]].map(([k, l, c]) => {
                const on = f.kind === k;
                return React.createElement("button", { key: k, onClick: () => setF({ ...f, kind: k, category: "", taxable: true }), className: "flex-1 py-2 rounded-lg text-xs font-bold", style: { background: on ? c : "transparent", color: on ? (k === "in" ? "#000" : "#fff") : T.sub } }, l);
            }))),
            studioMode && (React.createElement("div", { className: "text-[11px] mb-3 px-1", style: { color: T.muted } }, "\u0E23\u0E32\u0E22\u0E08\u0E48\u0E32\u0E22\u0E19\u0E35\u0E49\u0E08\u0E30\u0E16\u0E39\u0E01\u0E41\u0E17\u0E47\u0E01\u0E40\u0E1B\u0E47\u0E19\u0E02\u0E2D\u0E07\u0E2B\u0E49\u0E2D\u0E07\u0E0B\u0E49\u0E2D\u0E21 \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E04\u0E33\u0E19\u0E27\u0E13\u0E2A\u0E38\u0E17\u0E18\u0E34\u0E2B\u0E49\u0E2D\u0E07\u0E0B\u0E49\u0E2D\u0E21\u0E41\u0E22\u0E01\u0E08\u0E32\u0E01\u0E23\u0E32\u0E22\u0E08\u0E48\u0E32\u0E22\u0E17\u0E31\u0E48\u0E27\u0E44\u0E1B")),
            isTransfer ? (React.createElement(React.Fragment, null,
                React.createElement(AccPicker, { label: "\u0E08\u0E32\u0E01\u0E1A\u0E31\u0E0D\u0E0A\u0E35", accounts: accounts, value: f.fromAccountId, onChange: v => setF({ ...f, fromAccountId: v }) }),
                React.createElement(AccPicker, { label: "\u0E44\u0E1B\u0E1A\u0E31\u0E0D\u0E0A\u0E35", accounts: accounts, value: f.toAccountId, onChange: v => setF({ ...f, toAccountId: v }), exclude: f.fromAccountId }),
                React.createElement(Input, { label: "\u0E08\u0E33\u0E19\u0E27\u0E19\u0E40\u0E07\u0E34\u0E19 \u0E3F", value: f.amount, onChange: v => setF({ ...f, amount: v }), placeholder: "0", type: "number" }),
                React.createElement(Input, { label: "\u0E42\u0E19\u0E49\u0E15 (\u0E44\u0E21\u0E48\u0E1A\u0E31\u0E07\u0E04\u0E31\u0E1A)", value: f.transferNote, onChange: v => setF({ ...f, transferNote: v }), placeholder: "\u0E40\u0E0A\u0E48\u0E19 \u0E42\u0E2D\u0E19\u0E04\u0E48\u0E32\u0E15\u0E31\u0E27\u0E21\u0E32\u0E43\u0E2B\u0E49\u0E41\u0E25\u0E49\u0E27" }),
                React.createElement("div", { className: "text-[10px] mb-3", style: { color: T.muted } }, "* \u0E01\u0E32\u0E23\u0E42\u0E2D\u0E19\u0E22\u0E49\u0E32\u0E22\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E15\u0E31\u0E27\u0E40\u0E2D\u0E07\u0E44\u0E21\u0E48\u0E19\u0E31\u0E1A\u0E40\u0E1B\u0E47\u0E19\u0E23\u0E32\u0E22\u0E23\u0E31\u0E1A/\u0E23\u0E32\u0E22\u0E08\u0E48\u0E32\u0E22 \u0E44\u0E21\u0E48\u0E01\u0E23\u0E30\u0E17\u0E1A\u0E22\u0E2D\u0E14\u0E2A\u0E23\u0E38\u0E1B\u0E20\u0E32\u0E29\u0E35"),
                React.createElement("div", { className: "mb-3 p-3 rounded-xl", style: { background: T.surf2, border: `1px solid ${T.border}` } },
                    React.createElement("button", { onClick: () => setTransferOnward(v => !v), className: "flex items-center gap-3 w-full" },
                        React.createElement("span", { className: "w-11 h-6 rounded-full relative shrink-0 transition-colors", style: { background: transferOnward ? T.cyan : T.surf } },
                            React.createElement("span", { className: "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all", style: { left: transferOnward ? "22px" : "2px" } })),
                        React.createElement("div", { className: "flex-1 text-left" },
                            React.createElement("div", { className: "text-xs font-bold" }, "\u0E42\u0E2D\u0E19\u0E15\u0E48\u0E2D\u0E17\u0E31\u0E19\u0E17\u0E35 (2 \u0E17\u0E2D\u0E14)"),
                            React.createElement("div", { className: "text-[10px]", style: { color: T.muted } }, "\u0E40\u0E0A\u0E48\u0E19 \u0E1D\u0E32\u0E01\u0E40\u0E07\u0E34\u0E19\u0E2A\u0E14\u0E40\u0E02\u0E49\u0E32 ttb \u0E41\u0E25\u0E49\u0E27\u0E42\u0E2D\u0E19\u0E15\u0E48\u0E2D\u0E44\u0E1B\u0E2D\u0E35\u0E01\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E40\u0E25\u0E22"))),
                    transferOnward && (React.createElement("div", { className: "mt-3 space-y-2.5" },
                        React.createElement(AccPicker, { label: "\u0E42\u0E2D\u0E19\u0E15\u0E48\u0E2D\u0E44\u0E1B\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E44\u0E2B\u0E19", accounts: accounts, value: onwardAccountId, onChange: setOnwardAccountId, exclude: f.toAccountId }),
                        React.createElement(Input, { label: "\u0E42\u0E19\u0E49\u0E15 (\u0E44\u0E21\u0E48\u0E1A\u0E31\u0E07\u0E04\u0E31\u0E1A)", value: onwardNote, onChange: setOnwardNote, placeholder: "\u0E40\u0E0A\u0E48\u0E19 \u0E42\u0E2D\u0E19\u0E04\u0E48\u0E32\u0E15\u0E31\u0E27\u0E21\u0E32\u0E43\u0E2B\u0E49\u0E41\u0E25\u0E49\u0E27" })))))) : (React.createElement(React.Fragment, null,
                React.createElement(Input, { label: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23", value: f.title, onChange: v => setF({ ...f, title: v }), placeholder: "\u0E40\u0E0A\u0E48\u0E19 \u0E04\u0E48\u0E32\u0E44\u0E1F\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E19\u0E35\u0E49" }),
                f.kind === "out" && studioMode && (React.createElement("div", { className: "flex gap-1.5 flex-wrap mb-3 -mt-1" }, quick.map(q => React.createElement("button", { key: q, onClick: () => setF({ ...f, title: q }), className: "text-[11px] px-2.5 py-1 rounded-lg", style: { background: T.surf2, color: T.sub, border: `1px solid ${T.border}` } }, q)))),
                f.kind === "out" && !studioMode && (React.createElement(ExpensePresetPicker, { presets: expensePresets, onPick: (q) => setF({ ...f, title: q }), onAddPreset: (name) => setExpensePresets(ps => ps.includes(name) ? ps : [...ps, name]), onReorder: setExpensePresets })),
                f.kind === "in" && (React.createElement("div", { className: "flex gap-1.5 flex-wrap mb-3 -mt-1" },
                    React.createElement("button", { onClick: () => setF({ ...f, title: "เพื่อนคืนเงิน", taxable: false }), className: "text-[11px] px-2.5 py-1 rounded-lg", style: { background: T.surf2, color: T.sub, border: `1px solid ${T.border}` } }, "\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E19\u0E04\u0E37\u0E19\u0E40\u0E07\u0E34\u0E19"),
                    React.createElement("button", { onClick: () => setF({ ...f, title: "เงินที่ออกให้ก่อนได้คืน", taxable: false }), className: "text-[11px] px-2.5 py-1 rounded-lg", style: { background: T.surf2, color: T.sub, border: `1px solid ${T.border}` } }, "\u0E2D\u0E2D\u0E01\u0E40\u0E07\u0E34\u0E19\u0E43\u0E2B\u0E49\u0E01\u0E48\u0E2D\u0E19-\u0E44\u0E14\u0E49\u0E04\u0E37\u0E19"))),
                React.createElement(Input, { label: "\u0E08\u0E33\u0E19\u0E27\u0E19\u0E40\u0E07\u0E34\u0E19 \u0E3F", value: f.amount, onChange: v => setF({ ...f, amount: v }), placeholder: "0", type: "number" }),
                React.createElement(AccPicker, { label: studioMode ? "จ่ายจากบัญชี" : "เข้า/ออกบัญชี", accounts: accounts, value: f.accountId, onChange: v => setF({ ...f, accountId: v }) }),
                !studioMode && React.createElement(CatPicker, { label: "\u0E2B\u0E21\u0E27\u0E14", color: f.kind === "in" ? T.green : T.red, options: txnCategories[catKey(f.kind)] || [], value: f.category, onChange: v => setF({ ...f, category: v }), onAdd: (n) => addCat(f.kind, n), onReorder: (newList) => setTxnCategories(c => ({ ...c, [catKey(f.kind)]: newList })) }),
                !studioMode && f.kind === "in" && (React.createElement("div", { className: "mb-3 p-3 rounded-xl", style: { background: T.surf2, border: `1px solid ${T.border}` } },
                    React.createElement("button", { onClick: () => setTransferOnward(v => !v), className: "flex items-center gap-3 w-full" },
                        React.createElement("span", { className: "w-11 h-6 rounded-full relative shrink-0 transition-colors", style: { background: transferOnward ? T.cyan : T.surf } },
                            React.createElement("span", { className: "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all", style: { left: transferOnward ? "22px" : "2px" } })),
                        React.createElement("div", { className: "flex-1 text-left" },
                            React.createElement("div", { className: "text-xs font-bold" }, "\u0E42\u0E2D\u0E19\u0E15\u0E48\u0E2D\u0E17\u0E31\u0E19\u0E17\u0E35"),
                            React.createElement("div", { className: "text-[10px]", style: { color: T.muted } }, "\u0E40\u0E07\u0E34\u0E19\u0E40\u0E02\u0E49\u0E32\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E19\u0E35\u0E49\u0E41\u0E25\u0E49\u0E27\u0E42\u0E2D\u0E19\u0E15\u0E48\u0E2D\u0E44\u0E1B\u0E2D\u0E35\u0E01\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E40\u0E25\u0E22"))),
                    transferOnward && (React.createElement("div", { className: "mt-3 space-y-2.5" },
                        React.createElement(AccPicker, { label: "\u0E42\u0E2D\u0E19\u0E15\u0E48\u0E2D\u0E44\u0E1B\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E44\u0E2B\u0E19", accounts: accounts, value: onwardAccountId, onChange: setOnwardAccountId, exclude: f.accountId }),
                        React.createElement(Input, { label: "\u0E42\u0E19\u0E49\u0E15 (\u0E44\u0E21\u0E48\u0E1A\u0E31\u0E07\u0E04\u0E31\u0E1A)", value: onwardNote, onChange: setOnwardNote, placeholder: "\u0E40\u0E0A\u0E48\u0E19 \u0E42\u0E2D\u0E19\u0E04\u0E48\u0E32\u0E15\u0E31\u0E27\u0E21\u0E32\u0E43\u0E2B\u0E49\u0E41\u0E25\u0E49\u0E27" }))))),
                !studioMode && f.kind === "in" && (React.createElement("div", { className: "mb-3 p-3 rounded-xl flex items-center gap-3", style: { background: T.surf2, border: `1px solid ${T.border}` } },
                    React.createElement("button", { onClick: () => setF({ ...f, taxable: !f.taxable }), className: "w-11 h-6 rounded-full relative shrink-0 transition-colors", style: { background: f.taxable ? T.green : T.surf } },
                        React.createElement("span", { className: "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all", style: { left: f.taxable ? "22px" : "2px" } })),
                    React.createElement("div", { className: "flex-1" },
                        React.createElement("div", { className: "text-xs font-bold" }, "\u0E19\u0E31\u0E1A\u0E40\u0E1B\u0E47\u0E19\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E20\u0E32\u0E29\u0E35"),
                        React.createElement("div", { className: "text-[10px]", style: { color: T.muted } }, f.taxable ? "รายได้จริงจากงาน — รวมในสรุปภาษี" : "เงินคืน/ยืม/ไม่ใช่รายได้ — ไม่รวมในสรุปภาษี")))))),
            React.createElement("div", { className: "mb-3" },
                React.createElement(Label, null, "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48"),
                React.createElement(DateInput, { value: f.date, onChange: v => setF({ ...f, date: v }) })),
            React.createElement(SaveBtn, { disabled: !valid, onClick: () => {
                    if (isTransfer) {
                        const list = [{ kind: "transfer", fromAccountId: f.fromAccountId, toAccountId: f.toAccountId, amount: Number(f.amount) || 0, date: f.date, title: f.transferNote.trim() || "โอนย้ายบัญชี" }];
                        if (transferOnward && onwardAccountId && onwardAccountId !== f.toAccountId) {
                            list.push({ kind: "transfer", fromAccountId: f.toAccountId, toAccountId: onwardAccountId, amount: Number(f.amount) || 0, date: f.date, title: onwardNote.trim() || "โอนต่อ" });
                        }
                        onSave(list);
                        return;
                    }
                    const list = [{ title: f.title.trim(), amount: Number(f.amount) || 0, kind: f.kind, date: f.date, accountId: f.accountId, category: studioMode ? "ห้องซ้อม" : f.category, taxable: f.kind === "in" ? f.taxable : true, studioExpense: studioMode || undefined }];
                    if (!studioMode && f.kind === "in" && transferOnward && onwardAccountId && onwardAccountId !== f.accountId) {
                        list.push({ kind: "transfer", fromAccountId: f.accountId, toAccountId: onwardAccountId, amount: Number(f.amount) || 0, date: f.date, title: onwardNote.trim() || "โอนต่อ" });
                    }
                    onSave(list);
                } }, "\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01")));
    }
    function PayMethodModal({ title, sub, accounts, heading = "เงินเข้าบัญชีไหน?", dateLabel = "วันที่ได้รับเงินจริง", dateCaption = "อาจไม่ตรงกับวันจอง — ใช้วันนี้เป็นค่าเริ่มต้น", initial, onClose, onPick, onUnpay }) {
        const [date, setDate] = useState((initial && initial.paidDate) || TK);
        return (React.createElement(Sheet, { onClose: onClose, title: heading },
            React.createElement("div", { className: "p-3 rounded-xl mb-3", style: { background: T.surf2 } },
                React.createElement("div", { className: "font-bold text-sm truncate" }, title),
                sub && React.createElement("div", { className: "text-[11px] mt-0.5", style: { color: T.muted } }, sub)),
            React.createElement("div", { className: "mb-3" },
                React.createElement(Label, null, dateLabel),
                React.createElement(DateInput, { value: date, onChange: setDate }),
                React.createElement("div", { className: "text-[10px] mt-1", style: { color: T.muted } }, dateCaption)),
            (!accounts || accounts.length === 0) ? (React.createElement("div", { className: "text-sm p-3 rounded-xl text-center", style: { background: T.surf2, color: T.muted } }, "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E1A\u0E31\u0E0D\u0E0A\u0E35 \u2014 \u0E44\u0E1B\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E17\u0E35\u0E48 Budget \u2192 \u0E1A\u0E31\u0E0D\u0E0A\u0E35 \u0E01\u0E48\u0E2D\u0E19")) : (React.createElement("div", { className: "grid grid-cols-2 gap-2" }, accounts.map(a => (React.createElement("button", { key: a.id, onClick: () => onPick(a.id, date), className: "py-4 rounded-xl font-extrabold text-sm active:scale-95 flex items-center justify-center gap-1.5", style: { background: hex(T.purple, .14), color: T.purple, border: `1px solid ${hex(T.purple, .5)}` } },
                React.createElement(Wallet, { size: 14 }),
                a.name))))),
            onUnpay && React.createElement("button", { onClick: onUnpay, className: "w-full py-2.5 rounded-xl font-bold mt-3", style: { background: hex(T.red, .14), color: T.red, border: `1px solid ${hex(T.red, .5)}` } }, "\u0E22\u0E01\u0E40\u0E25\u0E34\u0E01\u0E01\u0E32\u0E23\u0E23\u0E31\u0E1A\u0E40\u0E07\u0E34\u0E19 (\u0E01\u0E25\u0E31\u0E1A\u0E44\u0E1B\u0E04\u0E49\u0E32\u0E07\u0E08\u0E48\u0E32\u0E22)")));
    }
    const Section = ({ title, icon: Icon, dot, action, children }) => (React.createElement("div", null,
        React.createElement("div", { className: "flex items-center gap-2 mb-2 px-1" },
            Icon && React.createElement(Icon, { size: 15, style: { color: T.sub } }),
            dot && React.createElement("span", { className: "w-2.5 h-2.5 rounded-full", style: { background: dot } }),
            React.createElement("h2", { className: "text-sm font-bold tracking-wide", style: { color: T.sub } }, title),
            action && React.createElement("div", { className: "ml-auto" }, action)),
        children));
    const Stat = ({ label, value, color }) => (React.createElement(Glass, { className: "p-3" },
        React.createElement("div", { className: "text-[10px]", style: { color: T.muted } }, label),
        React.createElement("div", { className: "text-lg font-extrabold", style: { color: color || T.text } }, value)));
    const Empty = ({ text }) => (React.createElement(Glass, { className: "py-8 flex items-center justify-center" },
        React.createElement("span", { className: "text-xs", style: { color: T.muted } }, text)));
    const Label = ({ children }) => React.createElement("div", { className: "text-[11px] font-semibold mb-1", style: { color: T.sub } }, children);
    function Input({ label, value, onChange, placeholder, type = "text" }) {
        return React.createElement("div", { className: "mb-3" },
            React.createElement(Label, null, label),
            React.createElement("input", { type: type, value: value, onChange: e => onChange(e.target.value), placeholder: placeholder, className: "w-full px-3 py-2.5 rounded-xl text-sm outline-none", style: { background: T.surf2, color: T.text, border: `1px solid ${T.border}` } }));
    }
    function TimeInput({ value, onChange }) {
        return React.createElement("input", { type: "time", value: value, onChange: e => onChange(e.target.value), className: "w-full px-3 py-2.5 rounded-xl text-sm outline-none", style: { background: T.surf2, color: T.text, border: `1px solid ${T.border}` } });
    }
    function DateInput({ value, onChange }) {
        return React.createElement("input", { type: "date", value: value, onChange: e => onChange(e.target.value), className: "w-full px-3 py-2.5 rounded-xl text-sm outline-none", style: { background: T.surf2, color: T.text, border: `1px solid ${T.border}` } });
    }
    const SaveBtn = ({ disabled, onClick, children }) => (React.createElement("button", { disabled: disabled, onClick: onClick, className: "w-full py-3.5 rounded-xl font-bold active:scale-[.98] transition", style: { background: disabled ? T.border : T.green, color: disabled ? T.muted : "#000" } }, children));
    function Sheet({ title, onClose, children }) {
        return (React.createElement("div", { className: "fixed inset-0 z-40 flex items-end justify-center", style: { background: "rgba(0,0,0,.6)" }, onClick: onClose },
            React.createElement("div", { className: "w-full max-w-md rounded-t-3xl p-5 pb-7 max-h-[88vh] overflow-y-auto", style: { background: T.surf, border: `1px solid ${T.border}` }, onClick: e => e.stopPropagation() },
                React.createElement("div", { className: "flex items-center justify-between mb-4" },
                    React.createElement("h3", { className: "font-bold text-lg" }, title),
                    React.createElement("button", { onClick: onClose, className: "w-9 h-9 rounded-full flex items-center justify-center", style: { background: T.surf2 } },
                        React.createElement(X, { size: 18 }))),
                children)));
    }
