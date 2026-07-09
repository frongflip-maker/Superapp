"use strict";
    let _actx = null;
    function ensureAudio() { try {
        if (!_actx)
            _actx = new (window.AudioContext || window.webkitAudioContext)();
        if (_actx.state === "suspended")
            _actx.resume();
    }
    catch { } return _actx; }
    function countTick(n) {
        try {
            const ctx = ensureAudio();
            if (ctx) {
                const t = ctx.currentTime;
                const o = ctx.createOscillator(), g = ctx.createGain();
                o.type = "sine";
                o.frequency.value = n === 1 ? 1000 : n === 2 ? 800 : 620;
                o.connect(g);
                g.connect(ctx.destination);
                g.gain.setValueAtTime(0.0001, t);
                g.gain.exponentialRampToValueAtTime(0.35, t + 0.015);
                g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
                o.start(t);
                o.stop(t + 0.15);
            }
        }
        catch { }
        try {
            if (window.speechSynthesis) {
                const w = { 3: "three", 2: "two", 1: "one" }[n];
                if (w) {
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance(w);
                    u.lang = "en-US";
                    u.rate = 1.15;
                    u.volume = 1;
                    window.speechSynthesis.speak(u);
                }
            }
        }
        catch { }
        if (navigator.vibrate)
            navigator.vibrate(80);
    }
    function softTick() { try {
        const ctx = ensureAudio();
        if (!ctx)
            return;
        const t0 = ctx.currentTime;
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = 880;
        o.connect(g);
        g.connect(ctx.destination);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.15);
        o.start(t0);
        o.stop(t0 + 0.16);
    }
    catch { } }
    function beep() {
        try {
            const ctx = ensureAudio();
            if (!ctx)
                return;
            const t = ctx.currentTime;
            const ringBell = (t0) => {
                const partials = [1, 2.42, 3.9, 5.4];
                const gains = [0.9, 0.5, 0.28, 0.16];
                const fundamental = 660;
                partials.forEach((mult, idx) => {
                    const o = ctx.createOscillator(), g = ctx.createGain();
                    o.type = "sine";
                    o.frequency.setValueAtTime(fundamental * mult, t0);
                    g.gain.setValueAtTime(0.0001, t0);
                    g.gain.exponentialRampToValueAtTime(gains[idx], t0 + 0.008);
                    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.4);
                    o.connect(g);
                    g.connect(ctx.destination);
                    o.start(t0);
                    o.stop(t0 + 1.45);
                });
            };
            [0, 0.9, 1.8].forEach(off => ringBell(t + off));
            if (navigator.vibrate)
                navigator.vibrate([120, 200, 120, 200, 120]);
        }
        catch { }
    }
    function useRestTimer() {
        const [total, setTotal] = useState(90);
        const [left, setLeft] = useState(90);
        const [running, setRunning] = useState(false);
        const ref = React.useRef(null);
        useEffect(() => {
            if (!running)
                return;
            ref.current = setInterval(() => { setLeft(l => { if (l <= 1) {
                clearInterval(ref.current);
                setRunning(false);
                beep();
                return 0;
            } const nl = l - 1; if (nl <= 3)
                countTick(nl); return nl; }); }, 1000);
            return () => { if (ref.current)
                clearInterval(ref.current); };
        }, [running]);
        const pick = (s) => { setTotal(s); setLeft(s); setRunning(false); };
        const start = () => { ensureAudio(); if (left <= 0)
            setLeft(total); setRunning(true); };
        const pause = () => setRunning(false);
        const adj = (d) => { setLeft(l => Math.max(0, l + d)); setTotal(t => Math.max(5, t + d)); };
        const restart = (s) => { ensureAudio(); const dur = typeof s === "number" ? s : total; setTotal(dur); setLeft(dur); setRunning(true); };
        return { total, left, running, setRunning, pick, start, pause, adj, restart };
    }
    const NumBox = ({ value, onChange, suffix, w = 54 }) => (React.createElement("input", { type: "number", inputMode: "numeric", value: value, onChange: e => onChange(e.target.value), className: "px-2 py-1.5 rounded-lg text-sm font-bold text-center outline-none", style: { background: T.surf, color: T.text, border: `1px solid ${T.border}`, width: w } }));
    function WorkoutLog({ view = "today", workouts, updateWorkouts, events, exPresets, setExPresets, workoutPresets }) {
        const t = useRestTimer();
        const [restOv, setRestOv] = useState(false);
        const [finOpen, setFinOpen] = useState(false);
        const startRest = (sec) => { t.restart(sec); setRestOv(true); };
        const skipRest = () => { t.pause(); setRestOv(false); };
        useEffect(() => { if (restOv && !t.running && t.left <= 0) {
            const id = setTimeout(() => setRestOv(false), 4000);
            return () => clearTimeout(id);
        } }, [restOv, t.running, t.left]);
        const [activeId, setActiveId] = useState(null);
        const [exName, setExName] = useState("");
        const [openEx, setOpenEx] = useState({});
        const [confirmDelS, setConfirmDelS] = useState(false);
        const upsert = (sess) => updateWorkouts(ws => { const i = ws.findIndex(w => w.id === sess.id); if (i < 0)
            return [...ws, sess]; const c = [...ws]; c[i] = sess; return c; });
        const delSession = (id) => updateWorkouts(ws => ws.filter(w => w.id !== id));
        const sorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date))
            .filter(w => view === "history" ? w.date !== TK : w.date === TK);
        const active = workouts.find(w => w.id === activeId);
        const [nowMs, setNowMs] = useState(Date.now());
        useEffect(() => { if (active && active.startedAt && !active.endedAt) {
            const id = setInterval(() => setNowMs(Date.now()), 1000);
            return () => clearInterval(id);
        } }, [active && active.startedAt, active && active.endedAt]);
        const fmtElapsed = (ms) => { const s2 = Math.max(0, Math.floor(ms / 1000)); const h = Math.floor(s2 / 3600), m = Math.floor((s2 % 3600) / 60), sec = s2 % 60; return h ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}` : `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`; };
        const lastFor = (name, curDate, curId) => {
            const key = (name || "").trim().toLowerCase();
            const cands = workouts.filter(w => w.id !== curId && w.date <= curDate).sort((a, b) => b.date.localeCompare(a.date));
            for (const w of cands) {
                const ex = (w.exercises || []).find(e => (e.name || "").trim().toLowerCase() === key);
                if (ex)
                    return { date: w.date, sets: ex.sets || [] };
            }
            return null;
        };
        const setsSummary = (sets) => (sets || []).map(s => `${s.reps || 0}${s.weight ? "×" + s.weight : ""}`).join(", ");
        const newSession = () => {
            const fitEv = (events || []).find(e => e.date === TK && e.type === "fitness");
            let title = "", linkedEventId = null;
            if (fitEv) {
                linkedEventId = fitEv.id;
                title = (fitEv.fitKind === "weight" && (fitEv.fitParts || []).length) ? fitEv.fitParts.join("+") : (fitEv.title || "").replace(/^(GYM|SPORTS|เวท|กีฬา):?\s*/, "") || fitEv.title;
            }
            const s = { id: uid(), date: TK, title, linkedEventId, exercises: [] };
            upsert(s);
            setActiveId(s.id);
            setConfirmDelS(false);
        };
        const linkUp = (idx) => { const exs = active.exercises; if (idx <= 0)
            return; const gid = exs[idx - 1].ss || uid(); upsert({ ...active, exercises: exs.map((e, j) => j === idx ? { ...e, ss: gid } : j === idx - 1 ? { ...e, ss: gid } : e) }); };
        const unlinkEx = (idx) => upsert({ ...active, exercises: active.exercises.map((e, j) => j === idx ? { ...e, ss: null } : e) });
        const moveEx = (idx, dir) => { const j = idx + dir; if (!active || j < 0 || j >= active.exercises.length)
            return; const c = [...active.exercises]; const [x] = c.splice(idx, 1); c.splice(j, 0, x); upsert({ ...active, exercises: c }); };
        const addExercise = () => {
            if (!exName.trim() || !active)
                return;
            const prev = lastFor(exName, active.date, active.id);
            const sets = prev && prev.sets.length ? prev.sets.map(s => ({ reps: s.reps, weight: s.weight })) : [{ reps: 12, weight: "" }];
            const ex = { id: uid(), name: exName.trim(), sets };
            upsert({ ...active, exercises: [...active.exercises, ex] });
            setOpenEx(o => ({ ...o, [ex.id]: true }));
            setExName("");
        };
        const patchEx = (exId, fn) => upsert({ ...active, exercises: active.exercises.map(e => e.id === exId ? fn(e) : e) });
        const delEx = (exId) => upsert({ ...active, exercises: active.exercises.filter(e => e.id !== exId) });
        const savePreset = (ex) => { if (exPresets.some(p => p.name.toLowerCase() === (ex.name || "").toLowerCase())) {
            setExPresets(ps => ps.map(p => p.name.toLowerCase() === ex.name.toLowerCase() ? { ...p, sets: ex.sets.map(s => ({ reps: s.reps, weight: s.weight })) } : p));
        }
        else {
            setExPresets(ps => [...ps, { id: uid(), name: ex.name, sets: ex.sets.map(s => ({ reps: s.reps, weight: s.weight })) }]);
        } };
        const delPreset = (id) => setExPresets(ps => ps.filter(p => p.id !== id));
        const addFromPreset = (p) => { const ex = { id: uid(), name: p.name, sets: p.sets.map(s => ({ reps: s.reps, weight: s.weight })) }; upsert({ ...active, exercises: [...active.exercises, ex] }); setOpenEx(o => ({ ...o, [ex.id]: true })); };
        const applyWorkoutPreset = (p) => {
            const exs = p.items.map(it => {
                const rests = it.sets.map(s => s.rest ?? it.rest ?? null);
                const uniform = rests.every(r => r === rests[0]) ? rests[0] : null;
                return { id: uid(), name: it.name, rest: uniform,
                    target: it.sets.map(s => ({ reps: s.reps, weight: s.weight })),
                    sets: it.sets.map((s, i2) => ({ reps: s.reps, weight: s.weight, rest: rests[i2] })) };
            });
            upsert({ ...active, title: active.title || p.name, exercises: [...active.exercises, ...exs] });
        };
        const startSet = (exId, i) => upsert({ ...active, exercises: active.exercises.map(e => ({ ...e, sets: e.sets.map((s, j) => (e.id === exId && j === i) ? { ...s, st: "active" } : (s.st === "active" ? { ...s, st: undefined } : s)) })) });
        const doneSet = (exId, i, inSS) => {
            const exIdx = active.exercises.findIndex(e2 => e2.id === exId);
            if (exIdx < 0)
                return;
            const remaining = active.exercises.reduce((n, e2) => n + e2.sets.filter((st2, j) => !(e2.id === exId && j === i) && st2.st !== "done").length, 0);
            const exercises = active.exercises.map(e2 => ({ ...e2, sets: e2.sets.map(s => ({ ...s })) }));
            exercises[exIdx].sets[i].st = "done";
            exercises.forEach(e2 => e2.sets.forEach(s => { if (s.st === "active")
                s.st = undefined; }));
            let placed = false;
            let placedExId = null;
            const tryPlace = (e2, fromIdx) => { const k = e2.sets.findIndex((s, j) => j >= fromIdx && s.st !== "done"); if (k >= 0) {
                e2.sets[k].st = "active";
                placed = true;
                placedExId = e2.id;
            } };
            tryPlace(exercises[exIdx], 0);
            for (let k = exIdx + 1; k < exercises.length && !placed; k++)
                tryPlace(exercises[k], 0);
            for (let k = 0; k < exIdx && !placed; k++)
                tryPlace(exercises[k], 0);
            upsert({ ...active, exercises });
            if (placedExId)
                setOpenEx(o => placedExId === exId ? { ...o, [placedExId]: true } : { [placedExId]: true });
            if (remaining <= 0) {
                setFinOpen(true);
                return;
            }
            if (!inSS) {
                const ex = active.exercises[exIdx];
                const r = (ex.sets[i] && ex.sets[i].rest) || ex.rest;
                startRest(r || undefined);
            }
        };
        const undoSet = (exId, i) => patchEx(exId, e => ({ ...e, sets: e.sets.map((s, j) => j === i ? { ...s, st: undefined } : s) }));
        if (!active) {
            return (React.createElement("div", { className: "space-y-2" },
                view !== "history" && React.createElement("button", { onClick: newSession, className: "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[.98]", style: { background: T.green, color: "#000" } },
                    React.createElement(Plus, { size: 17 }),
                    " \u0E40\u0E23\u0E34\u0E48\u0E21\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E01\u0E32\u0E23\u0E40\u0E25\u0E48\u0E19\u0E27\u0E31\u0E19\u0E19\u0E35\u0E49"),
                sorted.length === 0 ? React.createElement(Empty, { text: view === "history" ? "ยังไม่มีประวัติการเล่นก่อนหน้า" : "ยังไม่มีบันทึกวันนี้ — กดเริ่มบันทึกด้านบน" }) : sorted.map(w => (React.createElement(Glass, { key: w.id, className: "p-3 flex items-center gap-3 active:scale-[.99]", onClick: () => setActiveId(w.id), style: { cursor: "pointer" } },
                    React.createElement("div", { className: "w-11 text-center shrink-0" },
                        React.createElement("div", { className: "text-[9px]", style: { color: T.muted } }, TH_D[parseK(w.date).getDay()]),
                        React.createElement("div", { className: "text-base font-bold leading-none" }, parseK(w.date).getDate()),
                        React.createElement("div", { className: "text-[9px]", style: { color: T.muted } }, TH_M[parseK(w.date).getMonth()])),
                    React.createElement("div", { className: "flex-1 min-w-0" },
                        React.createElement("div", { className: "font-semibold text-sm truncate" }, w.title || "(ไม่มีชื่อ)"),
                        React.createElement("div", { className: "text-[10px]", style: { color: T.muted } },
                            (w.exercises || []).length,
                            " \u0E17\u0E48\u0E32 \u00B7 ",
                            (w.exercises || []).reduce((n, e) => n + (e.sets || []).length, 0),
                            " \u0E40\u0E0B\u0E47\u0E15",
                            w.durationMin ? ` · ⏱ ${w.durationMin} นาที` : "")),
                    React.createElement(ChevronRight, { size: 16, style: { color: T.muted } }))))));
        }
        const linkedEv = active.linkedEventId ? (events || []).find(e => e.id === active.linkedEventId) : null;
        const renderExCard = (ex, idx, inSS) => {
            const prev = lastFor(ex.name, active.date, active.id);
            const isOpen = !!openEx[ex.id];
            const grouped = ex.ss && idx > 0 && active.exercises[idx - 1].ss === ex.ss;
            const allDone = ex.sets.length > 0 && ex.sets.every(sx => sx.st === "done");
            return (React.createElement(Glass, { key: ex.id, className: "p-0 overflow-hidden" },
                React.createElement("div", { className: "w-full p-3 flex items-center gap-2", style: { background: allDone ? hex(T.green, .09) : "transparent" } },
                    React.createElement("button", { onClick: () => setOpenEx(o => ({ ...o, [ex.id]: !o[ex.id] })), className: "flex items-center gap-2 flex-1 min-w-0 text-left" },
                        allDone
                            ? React.createElement("span", { className: "w-5 h-5 rounded-full flex items-center justify-center shrink-0", style: { background: T.green } },
                                React.createElement(Check, { size: 13, color: "#000" }))
                            : React.createElement(Dumbbell, { size: 15, style: { color: T.green }, className: "shrink-0" }),
                        React.createElement("div", { className: "flex-1 min-w-0" },
                            React.createElement("div", { className: "font-bold text-sm truncate", style: { color: allDone ? T.green : T.text } }, ex.name),
                            React.createElement("div", { className: "text-[10px]", style: { color: T.muted } },
                                ex.sets.length,
                                " \u0E40\u0E0B\u0E47\u0E15 \u00B7 ",
                                setsSummary(ex.sets) || "—",
                                ex.rest ? ` · พัก ${ex.rest}s` : "",
                                ex.target ? " · มีเป้า" : ""))),
                    React.createElement("div", { className: "flex flex-col shrink-0" },
                        React.createElement("button", { onClick: () => moveEx(idx, -1), disabled: idx === 0, "aria-label": "\u0E40\u0E25\u0E37\u0E48\u0E2D\u0E19\u0E02\u0E36\u0E49\u0E19", className: "w-6 h-4 flex items-center justify-center", style: { color: idx === 0 ? hex(T.muted, .3) : T.muted } },
                            React.createElement(ChevronUp, { size: 13 })),
                        React.createElement("button", { onClick: () => moveEx(idx, 1), disabled: idx === active.exercises.length - 1, "aria-label": "\u0E40\u0E25\u0E37\u0E48\u0E2D\u0E19\u0E25\u0E07", className: "w-6 h-4 flex items-center justify-center", style: { color: idx === active.exercises.length - 1 ? hex(T.muted, .3) : T.muted } },
                            React.createElement(ChevronDown, { size: 13 }))),
                    idx > 0 && React.createElement("button", { onClick: () => grouped ? unlinkEx(idx) : linkUp(idx), "aria-label": "superset", title: "\u0E23\u0E27\u0E21/\u0E41\u0E22\u0E01 superset \u0E01\u0E31\u0E1A\u0E17\u0E48\u0E32\u0E1A\u0E19", className: "w-7 h-7 rounded-lg flex items-center justify-center shrink-0", style: { color: grouped ? T.violet : T.muted, background: grouped ? hex(T.violet, .16) : "transparent" } },
                        React.createElement(Repeat, { size: 14 })),
                    React.createElement("button", { onClick: () => setOpenEx(o => ({ ...o, [ex.id]: !o[ex.id] })), className: "w-7 h-7 flex items-center justify-center shrink-0" },
                        React.createElement(ChevronDown, { size: 16, style: { color: T.muted, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" } }))),
                isOpen && (React.createElement("div", { className: "px-3 pb-3" },
                    prev && React.createElement("div", { className: "text-[10px] mb-2 px-2 py-1.5 rounded-lg", style: { background: hex(T.blue, .1), color: T.blue } },
                        "\u0E04\u0E23\u0E31\u0E49\u0E07\u0E01\u0E48\u0E2D\u0E19 (",
                        shortDate(prev.date),
                        "): ",
                        setsSummary(prev.sets)),
                    React.createElement("div", { className: "space-y-1.5" }, ex.sets.map((st, i) => {
                        const A = st.st === "active", D = st.st === "done";
                        return (React.createElement("div", { key: i, className: "flex items-center gap-2 px-1.5 py-1 rounded-lg", style: { background: A ? hex(T.green, .14) : "transparent", border: `1px solid ${A ? hex(T.green, .6) : "transparent"}`, opacity: D ? 0.55 : 1 } },
                            React.createElement("span", { className: "w-10 text-[11px] font-semibold shrink-0", style: { color: A ? T.green : T.sub, textDecoration: D ? "line-through" : "none" } },
                                "\u0E40\u0E0B\u0E47\u0E15 ",
                                i + 1),
                            React.createElement(NumBox, { value: st.reps, onChange: v => patchEx(ex.id, e => ({ ...e, sets: e.sets.map((s, j) => j === i ? { ...s, reps: v === "" ? "" : Number(v) } : s) })) }),
                            React.createElement("span", { className: "text-[11px]", style: { color: T.muted } }, "\u00D7"),
                            React.createElement(NumBox, { value: st.weight === "" ? "" : wDisplay(st.weight, ex.unit || "kg"), onChange: v => { const kgVal = v === "" ? "" : wToKg(v, ex.unit || "kg"); patchEx(ex.id, e => ({ ...e, sets: e.sets.map((s, j) => j === i ? { ...s, weight: kgVal } : s) })); } }),
                            React.createElement("button", { onClick: () => patchEx(ex.id, e => ({ ...e, unit: (e.unit || "kg") === "kg" ? "lbs" : "kg" })), "aria-label": "\u0E2A\u0E25\u0E31\u0E1A\u0E2B\u0E19\u0E48\u0E27\u0E22\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01", className: "text-[11px] font-bold px-1.5 py-0.5 rounded shrink-0", style: { color: T.blue, background: hex(T.blue, .14) } }, ex.unit || "kg"),
                            ex.target && ex.target[i] && (() => {
                                const tg = ex.target[i];
                                const aw = Number(st.weight) || 0, tw = Number(tg.weight) || 0;
                                const diff = aw && tw ? (aw > tw ? 1 : aw < tw ? -1 : 0) : 0;
                                return React.createElement("span", { className: "text-[9px] shrink-0", style: { color: diff > 0 ? T.green : diff < 0 ? T.red : T.muted } },
                                    "\u0E40\u0E1B\u0E49\u0E32 ",
                                    tg.reps,
                                    "\u00D7",
                                    wDisplay(tw, ex.unit || "kg"),
                                    diff > 0 ? " ▲" : diff < 0 ? " ▼" : "");
                            })(),
                            React.createElement("div", { className: "ml-auto flex items-center gap-1 shrink-0" },
                                D ? (React.createElement("button", { onClick: () => undoSet(ex.id, i), "aria-label": "\u0E22\u0E01\u0E40\u0E25\u0E34\u0E01\u0E40\u0E2A\u0E23\u0E47\u0E08", className: "w-8 h-8 rounded-lg flex items-center justify-center", style: { background: hex(T.green, .2), color: T.green } },
                                    React.createElement(Check, { size: 15 }))) : A ? (React.createElement("button", { onClick: () => doneSet(ex.id, i, inSS), className: "px-2.5 h-8 rounded-lg text-[11px] font-bold flex items-center gap-1", style: { background: T.green, color: "#000" } },
                                    React.createElement(Check, { size: 13 }),
                                    " \u0E40\u0E2A\u0E23\u0E47\u0E08")) : (React.createElement("button", { onClick: () => startSet(ex.id, i), "aria-label": "\u0E40\u0E23\u0E34\u0E48\u0E21\u0E40\u0E0B\u0E47\u0E15\u0E19\u0E35\u0E49", className: "w-8 h-8 rounded-lg flex items-center justify-center", style: { background: T.surf, color: T.sub, border: `1px solid ${T.border}` } },
                                    React.createElement(Play, { size: 13 }))),
                                React.createElement("button", { onClick: () => patchEx(ex.id, e => ({ ...e, sets: e.sets.filter((_, j) => j !== i) })), className: "w-7 h-7 rounded-lg flex items-center justify-center", style: { color: T.muted } },
                                    React.createElement(Minus, { size: 14 })))));
                    })),
                    React.createElement("div", { className: "flex gap-2 mt-2" },
                        React.createElement("button", { onClick: () => patchEx(ex.id, e => ({ ...e, sets: [...e.sets, { reps: (e.sets[e.sets.length - 1] || {}).reps ?? 12, weight: (e.sets[e.sets.length - 1] || {}).weight ?? "" }] })), className: "flex-1 py-2 rounded-lg text-xs font-bold", style: { background: hex(T.green, .16), color: T.green } }, "+ \u0E40\u0E1E\u0E34\u0E48\u0E21\u0E40\u0E0B\u0E47\u0E15"),
                        React.createElement("button", { onClick: () => { savePreset(ex); }, className: "px-3 py-2 rounded-lg text-xs font-bold", style: { background: hex(T.gold, .16), color: T.gold } }, "\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01 preset"),
                        !inSS && React.createElement("button", { onClick: () => startRest(ex.rest || undefined), className: "px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1", style: { background: hex(T.cyan, .16), color: T.cyan } },
                            React.createElement(Timer, { size: 13 }),
                            " \u0E1E\u0E31\u0E01",
                            ex.rest ? ` ${ex.rest}s` : ""),
                        React.createElement("button", { onClick: () => delEx(ex.id), className: "px-2.5 py-2 rounded-lg text-xs font-bold", style: { background: T.surf2, color: T.red, border: `1px solid ${hex(T.red, .4)}` } },
                            React.createElement(Trash2, { size: 13 })))))));
        };
        const blocks = [];
        active.exercises.forEach((ex, idx) => { const last = blocks[blocks.length - 1]; if (ex.ss && last && last.ss === ex.ss) {
            last.items.push({ ex, idx });
        }
        else {
            blocks.push({ ss: ex.ss || null, items: [{ ex, idx }] });
        } });
        const playMin = Number(active.playMin) || 1;
        const setRestOf = (ex, i2) => Number((ex.sets[i2] && ex.sets[i2].rest) ?? ex.rest) || 90;
        const estMin = Math.round(blocks.reduce((sec, blk) => {
            if (blk.items.length > 1) {
                const lastEx = blk.items[blk.items.length - 1].ex;
                const rounds = Math.max(...blk.items.map(({ ex }) => ex.sets.length));
                blk.items.forEach(({ ex }) => { sec += ex.sets.length * playMin * 60; });
                for (let r = 0; r < rounds; r++)
                    sec += setRestOf(lastEx, Math.min(r, lastEx.sets.length - 1));
                return sec;
            }
            const ex = blk.items[0].ex;
            sec += ex.sets.length * playMin * 60;
            ex.sets.forEach((_, i2) => { sec += setRestOf(ex, i2); });
            return sec;
        }, 0) / 60);
        return (React.createElement("div", { className: "space-y-3" },
            React.createElement("div", { className: "flex items-center gap-2" },
                React.createElement("button", { onClick: () => setActiveId(null), className: "w-8 h-8 rounded-lg flex items-center justify-center", style: { background: T.surf2 } },
                    React.createElement(ChevronLeft, { size: 16 })),
                React.createElement("input", { value: active.title, onChange: e => upsert({ ...active, title: e.target.value }), placeholder: "\u0E0A\u0E37\u0E48\u0E2D\u0E27\u0E31\u0E19 \u0E40\u0E0A\u0E48\u0E19 \u0E2B\u0E25\u0E31\u0E07+\u0E44\u0E1A\u0E40\u0E0B\u0E47\u0E1A", className: "flex-1 px-3 py-2 rounded-xl text-sm font-bold outline-none", style: { background: T.surf, color: T.text, border: `1px solid ${T.border}` } }),
                confirmDelS ? (React.createElement("button", { onClick: () => { delSession(active.id); setActiveId(null); }, className: "text-[10px] font-bold px-2 py-2 rounded-lg", style: { background: T.red, color: "#fff" } }, "\u0E25\u0E1A?")) : (React.createElement("button", { onClick: () => setConfirmDelS(true), className: "w-8 h-8 rounded-lg flex items-center justify-center", style: { color: T.muted } },
                    React.createElement(Trash2, { size: 15 })))),
            React.createElement("div", { className: "flex items-center gap-2 flex-wrap" },
                React.createElement("div", { className: "text-[10px]", style: { color: T.muted } }, shortDate(active.date)),
                linkedEv && React.createElement("span", { className: "text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1", style: { background: hex(T.green, .16), color: T.green } },
                    React.createElement(Dumbbell, { size: 10 }),
                    " \u0E25\u0E34\u0E07\u0E01\u0E4C: ",
                    linkedEv.title)),
            (workoutPresets || []).length > 0 && (React.createElement("div", { className: "flex gap-1.5 flex-wrap items-center" },
                React.createElement("span", { className: "text-[10px]", style: { color: T.muted } }, "\u0E42\u0E2B\u0E25\u0E14\u0E0A\u0E38\u0E14:"),
                workoutPresets.map(p => (React.createElement("button", { key: p.id, onClick: () => applyWorkoutPreset(p), className: "px-2.5 py-1.5 rounded-lg text-[11px] font-bold", style: { background: hex(T.violet, .14), color: T.violet, border: `1px solid ${hex(T.violet, .5)}` } },
                    p.name,
                    " \u00B7 ",
                    p.items.length,
                    "\u0E17\u0E48\u0E32"))))),
            !active.startedAt ? (React.createElement("button", { onClick: () => {
                    softTick();
                    const firstIdx = active.exercises.findIndex(e => e.sets.some(s => s.st !== "done"));
                    let exercises = active.exercises;
                    if (firstIdx >= 0) {
                        const firstSetIdx = active.exercises[firstIdx].sets.findIndex(s => s.st !== "done");
                        exercises = active.exercises.map((e, j) => ({ ...e, sets: e.sets.map((s, k) => (j === firstIdx && k === firstSetIdx) ? { ...s, st: "active" } : { ...s, st: s.st === "active" ? undefined : s.st }) }));
                        setOpenEx(o => ({ ...o, [exercises[firstIdx].id]: true }));
                    }
                    upsert({ ...active, startedAt: Date.now(), exercises });
                }, className: "w-full py-3.5 rounded-xl font-extrabold flex items-center justify-center gap-2 active:scale-[.98]", style: { background: T.green, color: "#000", boxShadow: glow(T.green) } },
                React.createElement(Play, { size: 18 }),
                " START SESSION")) : (React.createElement("div", { className: "flex items-center gap-2.5 p-2.5 rounded-xl", style: { background: hex(T.green, .1), border: `1px solid ${hex(T.green, .45)}` } },
                React.createElement("span", { className: "w-2 h-2 rounded-full shrink-0", style: { background: active.endedAt ? T.muted : T.green, boxShadow: active.endedAt ? "none" : `0 0 8px ${T.green}` } }),
                React.createElement("span", { className: "text-xs font-bold", style: { color: active.endedAt ? T.muted : T.green } }, active.endedAt ? "จบแล้ว" : "กำลังเล่น"),
                React.createElement("span", { className: "text-2xl font-extrabold tabular-nums ml-auto", style: { color: active.endedAt ? T.sub : T.green } }, fmtElapsed((active.endedAt || nowMs) - active.startedAt)))),
            active.exercises.length > 0 && (React.createElement("div", { className: "flex items-center gap-2 flex-wrap p-2.5 rounded-xl", style: { background: T.surf2, border: `1px solid ${T.border}` } },
                React.createElement(Timer, { size: 13, style: { color: T.cyan } }),
                React.createElement("span", { className: "text-[11px]", style: { color: T.sub } }, "\u0E40\u0E27\u0E25\u0E32\u0E40\u0E25\u0E48\u0E19/\u0E40\u0E0B\u0E47\u0E15"),
                React.createElement(NumBox, { value: active.playMin ?? 1, onChange: v => upsert({ ...active, playMin: v === "" ? "" : Number(v) }), w: 46 }),
                React.createElement("span", { className: "text-[11px]", style: { color: T.sub } }, "\u0E19\u0E32\u0E17\u0E35"),
                React.createElement("span", { className: "text-[11px] ml-auto", style: { color: T.muted } },
                    "\u0E17\u0E31\u0E49\u0E07 session \u2248 ",
                    React.createElement("b", { style: { color: T.cyan } },
                        estMin,
                        " \u0E19\u0E32\u0E17\u0E35")))),
            active.exercises.length === 0 && React.createElement(Empty, { text: "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E17\u0E48\u0E32 \u2014 \u0E40\u0E1E\u0E34\u0E48\u0E21\u0E14\u0E49\u0E32\u0E19\u0E25\u0E48\u0E32\u0E07" }),
            blocks.map((blk, bi) => blk.items.length > 1 ? (React.createElement("div", { key: "ss" + bi, className: "p-2 rounded-2xl space-y-2", style: { border: `1px dashed ${hex(T.violet, .6)}` } },
                React.createElement("div", { className: "flex items-center gap-1.5 px-1" },
                    React.createElement(Repeat, { size: 13, style: { color: T.violet } }),
                    React.createElement("span", { className: "text-[11px] font-extrabold tracking-wide", style: { color: T.violet } }, "SUPERSET"),
                    React.createElement("span", { className: "text-[10px]", style: { color: T.muted } }, "\u0E40\u0E25\u0E48\u0E19\u0E23\u0E27\u0E14\u0E44\u0E21\u0E48\u0E1E\u0E31\u0E01\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E17\u0E48\u0E32")),
                blk.items.map(({ ex, idx }) => renderExCard(ex, idx, true)),
                React.createElement("button", { onClick: () => startRest(blk.items[blk.items.length - 1].ex.rest || undefined), className: "w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5", style: { background: hex(T.cyan, .16), color: T.cyan, border: `1px solid ${hex(T.cyan, .5)}` } },
                    React.createElement(Timer, { size: 14 }),
                    " \u0E08\u0E1A\u0E23\u0E2D\u0E1A superset \u2192 \u0E40\u0E23\u0E34\u0E48\u0E21\u0E1E\u0E31\u0E01"))) : renderExCard(blk.items[0].ex, blk.items[0].idx, false)),
            exPresets.length > 0 && (React.createElement("div", null,
                React.createElement("div", { className: "text-[10px] mb-1", style: { color: T.muted } }, "Preset \u0E17\u0E48\u0E32 (\u0E41\u0E15\u0E30\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E40\u0E1E\u0E34\u0E48\u0E21 \u00B7 \u0E01\u0E14 \u00D7 \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E25\u0E1A preset)"),
                React.createElement("div", { className: "flex gap-1.5 flex-wrap" }, exPresets.map(p => (React.createElement("span", { key: p.id, className: "inline-flex items-center rounded-lg overflow-hidden", style: { border: `1px solid ${hex(T.gold, .5)}` } },
                    React.createElement("button", { onClick: () => addFromPreset(p), className: "px-2.5 py-1.5 text-[11px] font-bold", style: { background: hex(T.gold, .14), color: T.gold } },
                        p.name,
                        " ",
                        React.createElement("span", { style: { color: T.muted } },
                            "\u00B7",
                            p.sets.length,
                            "\u0E40\u0E0B\u0E47\u0E15")),
                    React.createElement("button", { onClick: () => delPreset(p.id), "aria-label": `ลบ preset ${p.name}`, className: "px-1.5 py-1.5 text-[11px]", style: { background: T.surf2, color: T.muted } }, "\u00D7"))))))),
            React.createElement("div", { className: "flex gap-2" },
                React.createElement("input", { value: exName, onChange: e => setExName(e.target.value), onKeyDown: e => { if (e.key === "Enter")
                        addExercise(); }, placeholder: "\u0E0A\u0E37\u0E48\u0E2D\u0E17\u0E48\u0E32 \u0E40\u0E0A\u0E48\u0E19 Bent Over Row", className: "flex-1 px-3 py-2.5 rounded-xl text-sm outline-none", style: { background: T.surf, color: T.text, border: `1px solid ${T.border}` } }),
                React.createElement("button", { onClick: addExercise, disabled: !exName.trim(), className: "px-4 rounded-xl font-bold", style: { background: exName.trim() ? T.green : T.surf2, color: exName.trim() ? "#000" : T.muted } }, "\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E17\u0E48\u0E32")),
            React.createElement("div", { className: "text-[10px] text-center", style: { color: T.muted } }, "\u0E1B\u0E38\u0E48\u0E21 \u27F3 \u0E17\u0E35\u0E48\u0E17\u0E48\u0E32 = \u0E23\u0E27\u0E21\u0E40\u0E1B\u0E47\u0E19 superset \u0E01\u0E31\u0E1A\u0E17\u0E48\u0E32\u0E14\u0E49\u0E32\u0E19\u0E1A\u0E19 \u00B7 \u2191\u2193 \u0E40\u0E25\u0E37\u0E48\u0E2D\u0E19\u0E2A\u0E25\u0E31\u0E1A\u0E15\u0E33\u0E41\u0E2B\u0E19\u0E48\u0E07\u0E17\u0E48\u0E32"),
            restOv && (() => {
                const c = t.left <= 0 ? T.green : t.left <= 5 ? T.red : T.cyan;
                const mm = String(Math.floor(t.left / 60)).padStart(2, "0"), ss = String(t.left % 60).padStart(2, "0");
                return (React.createElement("div", { className: "fixed left-3 right-3 z-50", style: { bottom: "calc(92px + env(safe-area-inset-bottom))" } },
                    React.createElement(Glass, { className: "p-3", glowColor: c, style: { border: `1px solid ${hex(c, .65)}`, background: "rgba(10,13,22,.97)" } }, t.left > 0 ? (React.createElement("div", { className: "space-y-2" },
                        React.createElement("div", { className: "flex items-center gap-2.5" },
                            React.createElement(Timer, { size: 18, style: { color: c }, className: "shrink-0" }),
                            React.createElement("div", { className: "text-3xl font-extrabold tabular-nums shrink-0", style: { color: c } },
                                mm,
                                ":",
                                ss),
                            React.createElement("div", { className: "flex-1 h-1.5 rounded-full overflow-hidden", style: { background: T.surf2 } },
                                React.createElement("div", { style: { width: `${t.total ? (t.left / t.total) * 100 : 0}%`, height: "100%", background: c, transition: "width 1s linear" } })),
                            React.createElement("button", { onClick: skipRest, className: "px-2.5 py-1.5 rounded-lg text-[11px] font-bold shrink-0", style: { background: hex(T.red, .16), color: T.red } }, "\u0E02\u0E49\u0E32\u0E21")),
                        React.createElement("div", { className: "flex items-center gap-1.5" }, [[-15, "-15"], [-5, "-5"], [5, "+5"], [15, "+15"]].map(([d, l]) => React.createElement("button", { key: l, onClick: () => t.adj(d), className: "flex-1 py-1.5 rounded-lg text-[11px] font-bold", style: { background: T.surf2, color: T.sub } }, l))))) : (React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement("span", { className: "text-lg" }, "\uD83D\uDCAA"),
                        React.createElement("span", { className: "font-bold text-sm flex-1" }, "\u0E04\u0E23\u0E1A\u0E40\u0E27\u0E25\u0E32\u0E1E\u0E31\u0E01 \u2014 \u0E25\u0E38\u0E22\u0E40\u0E0B\u0E47\u0E15\u0E15\u0E48\u0E2D\u0E44\u0E1B!"),
                        React.createElement("button", { onClick: () => setRestOv(false), className: "px-3 py-1.5 rounded-lg text-xs font-bold", style: { background: T.green, color: "#000" } }, "\u0E44\u0E1B\u0E15\u0E48\u0E2D"))))));
            })(),
            finOpen && (() => {
                const durMin = active.startedAt ? Math.max(1, Math.round(((active.endedAt || Date.now()) - active.startedAt) / 60000)) : null;
                const totalSets = active.exercises.reduce((n, e) => n + e.sets.length, 0);
                const doneSets = active.exercises.reduce((n, e) => n + e.sets.filter(sx => sx.st === "done").length, 0);
                const vol = active.exercises.reduce((n, e) => n + e.sets.reduce((m, sx) => m + (Number(sx.reps) || 0) * (Number(sx.weight) || 0), 0), 0);
                return (React.createElement(Sheet, { onClose: () => setFinOpen(false), title: "\u0E04\u0E23\u0E1A\u0E17\u0E38\u0E01\u0E40\u0E0B\u0E47\u0E15\u0E41\u0E25\u0E49\u0E27 \uD83C\uDF89" },
                    React.createElement("div", { className: "text-sm font-bold mb-2" },
                        active.title || "Session นี้",
                        " \u2014 \u0E2A\u0E23\u0E38\u0E1B\u0E1C\u0E25"),
                    React.createElement("div", { className: "grid grid-cols-2 gap-2 mb-3" },
                        React.createElement(Stat, { label: "\u0E40\u0E27\u0E25\u0E32\u0E40\u0E25\u0E48\u0E19\u0E08\u0E23\u0E34\u0E07", value: durMin ? `${durMin} นาที` : "— (ไม่ได้กด Start)", color: T.green }),
                        React.createElement(Stat, { label: "\u0E17\u0E48\u0E32", value: `${active.exercises.length} ท่า`, color: T.violet }),
                        React.createElement(Stat, { label: "\u0E40\u0E0B\u0E47\u0E15", value: `${doneSets}/${totalSets}`, color: T.blue }),
                        React.createElement(Stat, { label: "Volume \u0E23\u0E27\u0E21", value: `${vol.toLocaleString()} kg`, color: T.gold })),
                    React.createElement("button", { onClick: () => { const end = Date.now(); upsert({ ...active, endedAt: end, durationMin: active.startedAt ? Math.max(1, Math.round((end - active.startedAt) / 60000)) : null }); setFinOpen(false); setActiveId(null); }, className: "w-full py-3 rounded-xl font-bold mb-2", style: { background: T.green, color: "#000" } }, "\u2713 \u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01 & \u0E08\u0E1A session"),
                    React.createElement("button", { onClick: () => setFinOpen(false), className: "w-full py-3 rounded-xl font-bold", style: { background: T.surf2, color: T.sub, border: `1px solid ${T.border}` } }, "+ \u0E40\u0E25\u0E48\u0E19/\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E17\u0E48\u0E32\u0E15\u0E48\u0E2D")));
            })()));
    }

    const NUTRI_FIELDS = [["cal", "Calories", "kcal"], ["protein", "Protein", "g"], ["carb", "Carb", "g"], ["fat", "Fat", "g"], ["sugar", "Sugar", "g"], ["sodium", "Sodium", "mg"], ["chol", "Cholesterol", "mg"]];
    function Nutrition({ nutrition, setNutrition, nutriTargets, setNutriTargets }) {
        const [editT, setEditT] = useState(false);
        const [nd, setNd] = useState(TK);
        const d2 = parseK(nd);
        const day = nutrition[nd] || {};
        const setVal = (k, v) => setNutrition(n => ({ ...n, [nd]: { ...(n[nd] || {}), [k]: v === "" ? "" : Number(v) } }));
        const setTgt = (k, v) => setNutriTargets(t => ({ ...t, [k]: v === "" ? "" : Number(v) }));
        return (React.createElement("div", { className: "space-y-2" },
            React.createElement("div", { className: "flex items-center justify-between p-1.5 rounded-xl", style: { background: T.surf2, border: `1px solid ${T.border}` } },
                React.createElement("button", { onClick: () => setNd(dkey(addDays(d2, -1))), "aria-label": "\u0E27\u0E31\u0E19\u0E01\u0E48\u0E2D\u0E19\u0E2B\u0E19\u0E49\u0E32", className: "w-9 h-9 flex items-center justify-center active:scale-90" },
                    React.createElement(ChevronLeft, { size: 18, style: { color: T.sub } })),
                React.createElement("div", { className: "text-center" },
                    React.createElement("div", { className: "text-sm font-extrabold" },
                        EN_D[d2.getDay()],
                        " ",
                        d2.getDate(),
                        " ",
                        React.createElement("span", { className: "font-bold", style: { color: T.sub } }, EN_M[d2.getMonth()])),
                    nd !== TK && React.createElement("button", { onClick: () => setNd(TK), className: "text-[10px] font-bold", style: { color: T.gold } }, "\u2190 \u0E01\u0E25\u0E31\u0E1A\u0E27\u0E31\u0E19\u0E19\u0E35\u0E49")),
                React.createElement("button", { onClick: () => setNd(dkey(addDays(d2, 1))), disabled: nd >= TK, "aria-label": "\u0E27\u0E31\u0E19\u0E16\u0E31\u0E14\u0E44\u0E1B", className: "w-9 h-9 flex items-center justify-center active:scale-90", style: { opacity: nd >= TK ? 0.25 : 1 } },
                    React.createElement(ChevronRight, { size: 18, style: { color: T.sub } }))),
            React.createElement("div", null,
                React.createElement("div", { className: "flex gap-1 items-end", style: { height: 50 } }, Array.from({ length: 7 }, (_, i) => {
                    const dt = addDays(today, -6 + i);
                    const k = dkey(dt);
                    const dd = nutrition[k] || {};
                    const cal = Number(dd.cal) || 0, pro = Number(dd.protein) || 0;
                    const calT = Number(nutriTargets.cal) || 0, proT = Number(nutriTargets.protein) || 0;
                    const calPct = calT ? Math.min(1, cal / calT) : 0, proPct = proT ? Math.min(1, pro / proT) : 0;
                    const calOver = calT && cal > calT;
                    const selD = k === nd;
                    return (React.createElement("button", { key: k, onClick: () => setNd(k), className: "flex-1 flex flex-col items-center gap-0.5 h-full justify-end active:scale-95" },
                        React.createElement("div", { className: "w-full h-full flex items-end justify-center gap-[2px]" },
                            React.createElement("div", { className: "rounded-t-md", style: { width: "42%", height: `${cal ? Math.max(10, calPct * 100) : 5}%`, background: calOver ? T.red : cal ? T.gold : T.border, opacity: selD ? 1 : .5, boxShadow: selD && cal ? `0 0 6px ${hex(calOver ? T.red : T.gold, .6)}` : "none" } }),
                            React.createElement("div", { className: "rounded-t-md", style: { width: "42%", height: `${pro ? Math.max(10, proPct * 100) : 5}%`, background: pro ? T.green : T.border, opacity: selD ? 1 : .5, boxShadow: selD && pro ? `0 0 6px ${hex(T.green, .6)}` : "none" } })),
                        React.createElement("span", { className: "text-[8px] font-bold", style: { color: selD ? T.gold : T.muted } }, dt.getDate())));
                })),
                React.createElement("div", { className: "text-[9px] text-center mt-0.5", style: { color: T.muted } },
                    React.createElement("span", { style: { color: T.gold } }, "\u25A0"),
                    " kcal \u00B7 ",
                    React.createElement("span", { style: { color: T.green } }, "\u25A0"),
                    " protein \u00B7 \u0E41\u0E14\u0E07 = kcal \u0E40\u0E01\u0E34\u0E19 target \u00B7 \u0E41\u0E15\u0E30\u0E41\u0E17\u0E48\u0E07\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E40\u0E1B\u0E34\u0E14\u0E27\u0E31\u0E19\u0E19\u0E31\u0E49\u0E19")),
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("span", { className: "text-[11px]", style: { color: T.muted } }, nd === TK ? "กรอกสะสมของวันนี้ · เทียบ target" : "ข้อมูลย้อนหลัง — แก้ไขได้"),
                React.createElement("button", { onClick: () => setEditT(e => !e), className: "text-[11px] font-bold px-2.5 py-1.5 rounded-lg", style: { background: editT ? T.gold : T.surf2, color: editT ? "#000" : T.sub, border: `1px solid ${editT ? T.gold : T.border}` } }, editT ? "เสร็จสิ้น" : "ตั้ง Target")),
            NUTRI_FIELDS.map(([k, label, unit]) => {
                const v = Number(day[k]) || 0;
                const tg = Number(nutriTargets[k]) || 0;
                const pct = tg > 0 ? Math.min(1, v / tg) : 0;
                const over = tg > 0 && v > tg;
                const barC = over ? T.red : pct >= 1 ? T.green : k === "cal" ? T.gold : T.green;
                return (React.createElement("div", { key: k, className: "p-2.5 rounded-xl", style: { background: T.surf2, border: `1px solid ${over ? hex(T.red, .5) : T.border}` } },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement("span", { className: "text-xs font-bold w-24 shrink-0", style: { color: T.text } }, label),
                        React.createElement(NumBox, { value: day[k] ?? "", onChange: v2 => setVal(k, v2), w: 70 }),
                        React.createElement("span", { className: "text-[10px]", style: { color: T.muted } },
                            "/ ",
                            editT
                                ? React.createElement(NumBox, { value: nutriTargets[k] ?? "", onChange: v2 => setTgt(k, v2), w: 62 })
                                : React.createElement("b", { style: { color: T.sub } }, tg || "—"),
                            " ",
                            unit),
                        React.createElement("span", { className: "ml-auto text-[10px] font-bold", style: { color: over ? T.red : pct >= 1 ? T.green : T.muted } }, tg ? Math.round((v / tg) * 100) + "%" : "")),
                    tg > 0 && React.createElement("div", { className: "h-1 rounded-full mt-1.5 overflow-hidden", style: { background: T.surf } },
                        React.createElement("div", { style: { width: `${Math.min(100, (v / tg) * 100)}%`, height: "100%", background: barC } }))));
            }),
            React.createElement("div", { className: "text-[10px] text-center", style: { color: T.muted } }, "Sodium/Cholesterol \u0E2B\u0E19\u0E48\u0E27\u0E22\u0E40\u0E1B\u0E47\u0E19 mg \u0E15\u0E32\u0E21\u0E09\u0E25\u0E32\u0E01\u0E42\u0E20\u0E0A\u0E19\u0E32\u0E01\u0E32\u0E23 \u00B7 \u0E40\u0E01\u0E34\u0E19 target \u0E41\u0E16\u0E1A\u0E08\u0E30\u0E40\u0E1B\u0E47\u0E19\u0E2A\u0E35\u0E41\u0E14\u0E07")));
    }
    function ProgressChart({ workouts }) {
        const names = useMemo(() => {
            const m = {};
            workouts.forEach(w => (w.exercises || []).forEach(e => { const k = (e.name || "").trim(); if (k)
                m[k] = (m[k] || 0) + 1; }));
            return Object.entries(m).sort((a, b) => b[1] - a[1]).map(x => x[0]);
        }, [workouts]);
        const [sel, setSel] = useState(names[0] || "");
        const pick = names.includes(sel) ? sel : (names[0] || "");
        const series = useMemo(() => {
            if (!pick)
                return [];
            const rows = [];
            workouts.filter(w => (w.exercises || []).some(e => (e.name || "").trim() === pick))
                .forEach(w => { const ex = w.exercises.find(e => (e.name || "").trim() === pick); const wts = (ex.sets || []).map(s => Number(s.weight) || 0); const mx = Math.max(0, ...wts); rows.push({ date: w.date, weight: mx }); });
            return rows.sort((a, b) => a.date.localeCompare(b.date));
        }, [workouts, pick]);
        if (names.length === 0)
            return React.createElement(Empty, { text: "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 \u2014 \u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E01\u0E32\u0E23\u0E40\u0E25\u0E48\u0E19\u0E01\u0E48\u0E2D\u0E19 \u0E41\u0E25\u0E49\u0E27\u0E01\u0E23\u0E32\u0E1F\u0E08\u0E30\u0E02\u0E36\u0E49\u0E19\u0E40\u0E2D\u0E07" });
        const W = 300, H = 140, padL = 32, padB = 22, padT = 10, padR = 8;
        const maxW = Math.max(1, ...series.map(s => s.weight));
        const minW = 0;
        const n = series.length;
        const xAt = (i) => padL + (n <= 1 ? 0 : (i / (n - 1)) * (W - padL - padR));
        const yAt = (v) => padT + (1 - (v - minW) / (maxW - minW || 1)) * (H - padT - padB);
        const linePts = series.map((s, i) => `${xAt(i)},${yAt(s.weight)}`).join(" ");
        const first = series[0]?.weight || 0, last = series[series.length - 1]?.weight || 0;
        const delta = last - first;
        return (React.createElement("div", { className: "space-y-3" },
            React.createElement("div", { className: "flex gap-1.5 flex-wrap" }, names.slice(0, 12).map(nm => {
                const on = nm === pick;
                return React.createElement("button", { key: nm, onClick: () => setSel(nm), className: "px-2.5 py-1.5 rounded-lg text-[11px] font-semibold", style: { background: on ? T.blue : T.surf2, color: on ? "#000" : T.sub, border: `1px solid ${on ? T.blue : T.border}` } }, nm);
            })),
            series.length < 2 ? (React.createElement(Empty, { text: "\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E49\u0E2D\u0E22 2 \u0E04\u0E23\u0E31\u0E49\u0E07\u0E02\u0E2D\u0E07\u0E17\u0E48\u0E32\u0E19\u0E35\u0E49\u0E16\u0E36\u0E07\u0E08\u0E30\u0E40\u0E2B\u0E47\u0E19\u0E40\u0E2A\u0E49\u0E19\u0E01\u0E23\u0E32\u0E1F" })) : (React.createElement(Glass, { className: "p-3" },
                React.createElement("div", { className: "flex items-baseline gap-2 mb-1" },
                    React.createElement("span", { className: "text-2xl font-extrabold", style: { color: T.blue } },
                        last,
                        " kg"),
                    React.createElement("span", { className: "text-xs font-bold", style: { color: delta >= 0 ? T.green : T.red } },
                        delta >= 0 ? "▲ +" : "▼ ",
                        Math.abs(delta),
                        " kg"),
                    React.createElement("span", { className: "text-[10px] ml-auto", style: { color: T.muted } },
                        n,
                        " \u0E04\u0E23\u0E31\u0E49\u0E07")),
                React.createElement("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%", style: { display: "block" } },
                    [0, 0.5, 1].map((f, i) => {
                        const y = padT + f * (H - padT - padB);
                        const val = Math.round(maxW - (f * (maxW - minW)));
                        return React.createElement("g", { key: i },
                            React.createElement("line", { x1: padL, y1: y, x2: W - padR, y2: y, stroke: hex(T.border, .8), strokeWidth: "1" }),
                            React.createElement("text", { x: "2", y: y + 3, fontSize: "8", fill: T.muted }, val));
                    }),
                    React.createElement("polyline", { points: linePts, fill: "none", stroke: T.blue, strokeWidth: "2.5", strokeLinejoin: "round", strokeLinecap: "round" }),
                    series.map((s, i) => React.createElement("circle", { key: i, cx: xAt(i), cy: yAt(s.weight), r: "3", fill: T.blue })),
                    series.map((s, i) => {
                        if (n > 6 && i % 2 === 1 && i !== n - 1)
                            return null;
                        return React.createElement("text", { key: "t" + i, x: xAt(i), y: H - 8, fontSize: "7.5", fill: T.muted, textAnchor: "middle" },
                            parseK(s.date).getDate(),
                            "/",
                            parseK(s.date).getMonth() + 1);
                    })),
                React.createElement("div", { className: "text-[10px] text-center mt-1", style: { color: T.muted } },
                    "\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01\u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14\u0E15\u0E48\u0E2D\u0E04\u0E23\u0E31\u0E49\u0E07 \u00B7 \u0E17\u0E48\u0E32: ",
                    pick)))));
    }
    function WorkoutPresetModal({ onClose, onSave, initial }) {
        const [name, setName] = useState(initial ? initial.name : "");
        const mkSet = (prev) => prev ? { ...prev } : { reps: 12, weight: "", rest: 90 };
        const [items, setItems] = useState(() => initial
            ? initial.items.map(it => ({ name: it.name, muscle: it.muscle || PRESET_MUSCLE_GROUPS[0], sets: it.sets.map(st => ({ reps: st.reps, weight: st.weight, rest: (st.rest ?? it.rest ?? 90) })) }))
            : [{ name: "", muscle: PRESET_MUSCLE_GROUPS[0], sets: [mkSet(), mkSet(), mkSet()] }]);
        const patch = (i, p) => setItems(xs => xs.map((x, j) => j === i ? { ...x, ...p } : x));
        const patchSet = (i, si, p) => setItems(xs => xs.map((x, j) => j === i ? { ...x, sets: x.sets.map((st, k) => k === si ? { ...st, ...p } : st) } : x));
        const addSet = (i) => setItems(xs => xs.map((x, j) => j === i ? { ...x, sets: [...x.sets, mkSet(x.sets[x.sets.length - 1])] } : x));
        const delSet = (i, si) => setItems(xs => xs.map((x, j) => j === i ? { ...x, sets: x.sets.filter((_, k) => k !== si) } : x));
        const moveItem = (i, dir) => setItems(xs => { const j = i + dir; if (j < 0 || j >= xs.length)
            return xs; const c = [...xs]; const [x] = c.splice(i, 1); c.splice(j, 0, x); return c; });
        const valid = name.trim() && items.some(x => x.name.trim() && x.sets.length);
        const save = () => {
            const its = items.filter(x => x.name.trim() && x.sets.length).map(x => ({ name: x.name.trim(), muscle: x.muscle || PRESET_MUSCLE_GROUPS[0],
                sets: x.sets.map(st => ({ reps: Number(st.reps) || 0, weight: st.weight === "" ? "" : Number(st.weight), rest: Number(st.rest) || null })) }));
            onSave({ id: (initial && initial.id) || uid(), name: name.trim(), items: its });
        };
        const COLW = 62;
        return (React.createElement(Sheet, { onClose: onClose, title: initial ? "แก้ไข Preset ชุดท่า" : "สร้าง Preset ชุดท่า" },
            React.createElement(Input, { label: "\u0E0A\u0E37\u0E48\u0E2D\u0E0A\u0E38\u0E14 (\u0E40\u0E0A\u0E48\u0E19 \u0E2D\u0E01, \u0E2B\u0E25\u0E31\u0E07+\u0E44\u0E1A\u0E40\u0E0B\u0E47\u0E1A)", value: name, onChange: setName, placeholder: "\u0E2D\u0E01" }),
            React.createElement("div", { className: "space-y-2 mb-3" },
                items.map((x, i) => (React.createElement("div", { key: i, className: "p-3 rounded-xl space-y-2", style: { background: T.surf2, border: `1px solid ${T.border}` } },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement("input", { value: x.name, onChange: e => patch(i, { name: e.target.value }), placeholder: `ท่าที่ ${i + 1} เช่น Bench Press`, className: "flex-1 px-2.5 py-2 rounded-lg text-sm outline-none min-w-0", style: { background: T.surf, color: T.text, border: `1px solid ${T.border}` } }),
                        React.createElement("select", { value: x.muscle || PRESET_MUSCLE_GROUPS[0], onChange: e => patch(i, { muscle: e.target.value }), "aria-label": "Muscle group", className: "px-1.5 py-2 rounded-lg text-[11px] font-medium outline-none shrink-0", style: { background: T.surf, color: T.text, border: `1px solid ${T.border}`, width: 128, colorScheme: "dark" } }, PRESET_MUSCLE_GROUPS.map(m => React.createElement("option", { key: m, value: m }, m))),
                        React.createElement("div", { className: "flex flex-col shrink-0" },
                            React.createElement("button", { onClick: () => moveItem(i, -1), disabled: i === 0, "aria-label": "\u0E40\u0E25\u0E37\u0E48\u0E2D\u0E19\u0E02\u0E36\u0E49\u0E19", className: "w-6 h-4 flex items-center justify-center", style: { color: i === 0 ? hex(T.muted, .3) : T.muted } },
                                React.createElement(ChevronUp, { size: 13 })),
                            React.createElement("button", { onClick: () => moveItem(i, 1), disabled: i === items.length - 1, "aria-label": "\u0E40\u0E25\u0E37\u0E48\u0E2D\u0E19\u0E25\u0E07", className: "w-6 h-4 flex items-center justify-center", style: { color: i === items.length - 1 ? hex(T.muted, .3) : T.muted } },
                                React.createElement(ChevronDown, { size: 13 }))),
                        items.length > 1 && React.createElement("button", { onClick: () => setItems(xs => xs.filter((_, j) => j !== i)), "aria-label": "\u0E25\u0E1A\u0E17\u0E48\u0E32", className: "w-7 h-7 rounded-lg flex items-center justify-center shrink-0", style: { color: T.red } },
                            React.createElement(Trash2, { size: 14 }))),
                    React.createElement("div", { className: "flex items-center gap-2 px-1", style: { color: T.muted } },
                        React.createElement("span", { className: "text-[9px] font-semibold shrink-0", style: { width: 34, textAlign: "center" } }, "\u0E40\u0E0B\u0E15"),
                        React.createElement("span", { className: "text-[9px] shrink-0", style: { width: COLW, textAlign: "center" } }, "\u0E04\u0E23\u0E31\u0E49\u0E07"),
                        React.createElement("span", { className: "text-[9px] shrink-0", style: { width: COLW, textAlign: "center" } }, "kg"),
                        React.createElement("span", { className: "text-[9px] shrink-0", style: { width: COLW, textAlign: "center" } }, "\u0E1E\u0E31\u0E01(\u0E27\u0E34)"),
                        React.createElement("span", { className: "shrink-0", style: { width: 28 } })),
                    x.sets.map((st, si) => (React.createElement("div", { key: si, className: "flex items-center gap-2 px-1" },
                        React.createElement("span", { className: "text-sm font-extrabold text-center shrink-0", style: { color: T.text, width: 34 } }, si + 1),
                        React.createElement(NumBox, { value: st.reps, onChange: v => patchSet(i, si, { reps: v }), w: COLW }),
                        React.createElement(NumBox, { value: st.weight, onChange: v => patchSet(i, si, { weight: v }), w: COLW }),
                        React.createElement(NumBox, { value: st.rest, onChange: v => patchSet(i, si, { rest: v }), w: COLW }),
                        x.sets.length > 1 ? React.createElement("button", { onClick: () => delSet(i, si), "aria-label": "\u0E25\u0E1A\u0E40\u0E0B\u0E47\u0E15", className: "w-7 h-7 rounded-md flex items-center justify-center shrink-0", style: { color: T.muted } },
                            React.createElement(Minus, { size: 13 })) : React.createElement("span", { className: "shrink-0", style: { width: 28 } })))),
                    React.createElement("button", { onClick: () => addSet(i), className: "w-full py-1.5 rounded-lg text-[11px] font-bold", style: { background: hex(T.green, .12), color: T.green } }, "+ \u0E40\u0E1E\u0E34\u0E48\u0E21\u0E40\u0E0B\u0E47\u0E15 (\u0E04\u0E31\u0E14\u0E25\u0E2D\u0E01\u0E40\u0E0B\u0E47\u0E15\u0E25\u0E48\u0E32\u0E2A\u0E38\u0E14)")))),
                React.createElement("button", { onClick: () => setItems(xs => [...xs, { name: "", muscle: PRESET_MUSCLE_GROUPS[0], sets: [mkSet(), mkSet(), mkSet()] }]), className: "w-full py-2 rounded-lg text-xs font-bold", style: { background: hex(T.violet, .14), color: T.violet, border: `1px dashed ${hex(T.violet, .5)}` } }, "+ \u0E40\u0E1E\u0E34\u0E48\u0E21\u0E17\u0E48\u0E32")),
            React.createElement(SaveBtn, { disabled: !valid, onClick: save }, initial ? "บันทึกการแก้ไข" : "บันทึก Preset")));
    }
    const TH_DAY_FULL = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"];
    const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
    function Fitness(props) {
        const { fitnessSplit, saveFitnessSplit, fitnessStartDay, setFitnessStartDay, fitnessConfirmed, confirmFitnessWeek, events, workouts, updateWorkouts, nutrition, setNutrition, nutriTargets, setNutriTargets, exPresets, setExPresets, workoutPresets, setWorkoutPresets } = props;
        const [wpOpen, setWpOpen] = useState(false);
        const [wpEdit, setWpEdit] = useState(null);
        const [wpDel, setWpDel] = useState(null);
        const FIT_SUBS = ["today", "history", "nutrition", "preset", "week"];
        const [sub, setSubRaw] = useState(() => { try {
            const v = localStorage.getItem("dos_fit_sub");
            return FIT_SUBS.includes(v) ? v : "today";
        }
        catch {
            return "today";
        } });
        const setSub = (k) => { setSubRaw(k); try {
            localStorage.setItem("dos_fit_sub", k);
        }
        catch { } };
        const [draft, setDraft] = useState(() => fitnessSplit || {});
        const [editing, setEditing] = useState(false);
        const todayD = parseK(TK);
        const diff = (todayD.getDay() - fitnessStartDay + 7) % 7;
        const weekStart = addDays(todayD, -diff);
        const weekKey = dkey(weekStart);
        const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
        const confirmed = !!fitnessConfirmed[weekKey];
        const planTitle = (plan) => plan.kind === "weight" ? `GYM: ${(plan.parts || []).join("+") || "เต็มตัว"}` : `SPORTS${plan.sport ? ": " + plan.sport : ""}`;
        const genEvents = () => weekDates.map(wd => {
            const plan = (fitnessSplit || {})[wd.getDay()];
            if (!plan || plan.kind === "rest" || !plan.kind)
                return null;
            return { title: planTitle(plan), type: "fitness", date: dkey(wd), startTime: "18:00", endTime: "19:00", location: "", energyCost: 3, income: 0, fitKind: plan.kind, fitParts: plan.parts || [], fitSport: plan.sport || "", fromFitness: true };
        }).filter(Boolean);
        const planDaysCount = WEEK_ORDER.filter(d => { const p = (fitnessSplit || {})[d]; return p && p.kind && p.kind !== "rest"; }).length;
        const setDay = (d, patch) => setDraft(s => ({ ...s, [d]: { ...(s[d] || { kind: "rest", parts: [] }), ...patch } }));
        const togPart = (d, p) => setDraft(s => { const cur = s[d] || { kind: "weight", parts: [] }; const parts = cur.parts || []; return { ...s, [d]: { ...cur, parts: parts.includes(p) ? parts.filter(x => x !== p) : [...parts, p] } }; });
        return (React.createElement("div", { className: "px-4 pt-5 space-y-4" },
            React.createElement("div", { className: "flex items-end justify-between" },
                React.createElement("h1", { className: "text-2xl font-extrabold" }, "Fitness"),
                React.createElement("div", { className: "text-sm font-extrabold", style: { color: T.purple, textShadow: `0 0 8px ${hex(T.purple, .6)}` } },
                    EN_D[today.getDay()],
                    " ",
                    React.createElement("span", { style: { color: "#fff" } }, today.getDate()),
                    " ",
                    React.createElement("span", { className: "font-bold", style: { color: T.sub } }, EN_M[today.getMonth()]))),
            React.createElement("div", { className: "flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4", style: { scrollbarWidth: "none" } }, [["today", Dumbbell, "บันทึกวันนี้"], ["history", History, "ประวัติ"], ["nutrition", Flame, "โภชนาการ"], ["preset", LayersIcon, "Preset ชุดท่า"], ["week", CalendarDays, "ตารางสัปดาห์"]].map(([k, Ic, l]) => {
                const on = sub === k;
                return React.createElement("button", { key: k, onClick: () => setSub(k), className: "px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 active:scale-95 flex items-center gap-1.5", style: { background: on ? T.green : T.surf, color: on ? "#000" : T.sub, border: `1px solid ${on ? T.green : T.border}` } },
                    React.createElement(Ic, { size: 13 }),
                    l);
            })),
            sub === "nutrition" && (React.createElement(Glass, { className: "p-4" },
                React.createElement("div", { className: "text-sm font-bold mb-3", style: { color: T.gold } }, "\u0E42\u0E20\u0E0A\u0E19\u0E32\u0E01\u0E32\u0E23"),
                React.createElement(Nutrition, { nutrition: nutrition, setNutrition: setNutrition, nutriTargets: nutriTargets, setNutriTargets: setNutriTargets }))),
            sub === "preset" && (React.createElement("div", { className: "space-y-2" },
                workoutPresets.length === 0 ? React.createElement("div", { className: "text-[11px]", style: { color: T.muted } }, "\u0E15\u0E31\u0E49\u0E07\u0E0A\u0E38\u0E14\u0E17\u0E48\u0E32\u0E25\u0E48\u0E27\u0E07\u0E2B\u0E19\u0E49\u0E32 \u0E40\u0E0A\u0E48\u0E19 \"\u0E2D\u0E01\" \u0E43\u0E2A\u0E48\u0E17\u0E48\u0E32/\u0E40\u0E0B\u0E47\u0E15/\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01/\u0E40\u0E27\u0E25\u0E32\u0E1E\u0E31\u0E01 \u2014 \u0E27\u0E31\u0E19\u0E40\u0E25\u0E48\u0E19\u0E08\u0E23\u0E34\u0E07\u0E01\u0E14 \"\u0E42\u0E2B\u0E25\u0E14\u0E0A\u0E38\u0E14\" \u0E43\u0E19\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E01\u0E32\u0E23\u0E40\u0E25\u0E48\u0E19 \u0E04\u0E48\u0E32\u0E17\u0E35\u0E48\u0E15\u0E31\u0E49\u0E07\u0E08\u0E30\u0E01\u0E25\u0E32\u0E22\u0E40\u0E1B\u0E47\u0E19 \"\u0E40\u0E1B\u0E49\u0E32\" \u0E43\u0E2B\u0E49\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E01\u0E31\u0E1A\u0E17\u0E35\u0E48\u0E17\u0E33\u0E44\u0E14\u0E49\u0E08\u0E23\u0E34\u0E07")
                    : workoutPresets.map(p => (React.createElement(Glass, { key: p.id, className: "p-3 flex items-center gap-2" },
                        React.createElement("div", { className: "flex-1 min-w-0" },
                            React.createElement("div", { className: "font-bold text-sm truncate" }, p.name),
                            React.createElement("div", { className: "text-[10px] truncate", style: { color: T.muted } }, p.items.map(x => x.name).join(", "))),
                        React.createElement("button", { onClick: () => setWpEdit(p), "aria-label": "\u0E41\u0E01\u0E49\u0E44\u0E02 preset", className: "w-8 h-8 rounded-lg flex items-center justify-center shrink-0", style: { color: T.blue } },
                            React.createElement(Pencil, { size: 14 })),
                        wpDel === p.id
                            ? React.createElement("button", { onClick: () => { setWorkoutPresets(ps => ps.filter(x => x.id !== p.id)); setWpDel(null); }, className: "text-[11px] font-bold px-2.5 py-2 rounded-lg shrink-0 active:scale-95", style: { background: T.red, color: "#fff" } }, "\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E25\u0E1A")
                            : React.createElement("button", { onClick: () => setWpDel(p.id), className: "w-8 h-8 rounded-lg flex items-center justify-center shrink-0", style: { color: T.muted } },
                                React.createElement(Trash2, { size: 14 }))))),
                React.createElement("button", { onClick: () => setWpOpen(true), className: "w-full py-2.5 rounded-xl text-xs font-bold", style: { background: hex(T.violet, .14), color: T.violet, border: `1px dashed ${hex(T.violet, .5)}` } }, "+ \u0E2A\u0E23\u0E49\u0E32\u0E07 Preset \u0E0A\u0E38\u0E14\u0E17\u0E48\u0E32"))),
            (sub === "today" || sub === "history") && (React.createElement(WorkoutLog, { view: sub, workouts: workouts, updateWorkouts: updateWorkouts, events: events, exPresets: exPresets, setExPresets: setExPresets, workoutPresets: workoutPresets })),
            sub === "history" && (React.createElement(Glass, { className: "p-4" },
                React.createElement("div", { className: "text-sm font-bold mb-2", style: { color: T.blue } }, "\u0E01\u0E23\u0E32\u0E1F\u0E04\u0E27\u0E32\u0E21\u0E01\u0E49\u0E32\u0E27\u0E2B\u0E19\u0E49\u0E32 (\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01)"),
                React.createElement(ProgressChart, { workouts: workouts }))),
            sub === "week" && (React.createElement(React.Fragment, null,
                React.createElement(Glass, { className: "p-4" },
                    React.createElement("div", { className: "flex items-center justify-between mb-1" },
                        React.createElement("span", { className: "font-bold text-sm" },
                            "\u0E2A\u0E31\u0E1B\u0E14\u0E32\u0E2B\u0E4C\u0E19\u0E35\u0E49 \u00B7 \u0E40\u0E23\u0E34\u0E48\u0E21",
                            TH_DAY_FULL[fitnessStartDay],
                            " ",
                            shortDate(weekKey)),
                        confirmed ? React.createElement(Pill, { color: T.green, solid: true },
                            React.createElement(Check, { size: 11 }),
                            " \u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E41\u0E25\u0E49\u0E27") : React.createElement(Pill, { color: T.blue }, "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19")),
                    React.createElement("div", { className: "space-y-1.5 mt-2" }, weekDates.map(wd => {
                        const plan = (fitnessSplit || {})[wd.getDay()];
                        const isRest = !plan || !plan.kind || plan.kind === "rest";
                        const isToday = dkey(wd) === TK;
                        return (React.createElement("div", { key: dkey(wd), className: "flex items-center gap-2 text-xs" },
                            React.createElement("span", { className: "w-14 shrink-0 font-semibold", style: { color: isToday ? T.green : T.sub } }, TH_DAY_FULL[wd.getDay()]),
                            React.createElement("span", { className: "flex-1", style: { color: isRest ? T.muted : T.text } }, isRest ? "REST DAY" : planTitle(plan))));
                    })),
                    planDaysCount === 0
                        ? React.createElement("div", { className: "text-[11px] mt-3 text-center", style: { color: T.muted } }, "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E15\u0E32\u0E23\u0E32\u0E07 \u2014 \u0E01\u0E14 \u201C\u0E15\u0E31\u0E49\u0E07/\u0E41\u0E01\u0E49\u0E15\u0E32\u0E23\u0E32\u0E07\u201D \u0E14\u0E49\u0E32\u0E19\u0E25\u0E48\u0E32\u0E07")
                        : confirmed
                            ? React.createElement("div", { className: "text-[11px] mt-3 text-center", style: { color: T.green } },
                                "\u0E2A\u0E23\u0E49\u0E32\u0E07 ",
                                planDaysCount,
                                " \u0E27\u0E31\u0E19\u0E40\u0E02\u0E49\u0E32 Calendar \u0E41\u0E25\u0E49\u0E27 \u2713")
                            : React.createElement("button", { onClick: () => confirmFitnessWeek(weekKey, genEvents()), className: "w-full mt-3 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[.98]", style: { background: T.green, color: "#000" } },
                                React.createElement(Check, { size: 16 }),
                                " \u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E15\u0E32\u0E23\u0E32\u0E07\u0E40\u0E2B\u0E21\u0E37\u0E2D\u0E19\u0E40\u0E14\u0E34\u0E21 \u2192 \u0E2A\u0E23\u0E49\u0E32\u0E07 ",
                                planDaysCount,
                                " \u0E27\u0E31\u0E19\u0E40\u0E02\u0E49\u0E32 Calendar"),
                    React.createElement("div", { className: "text-[10px] mt-2 text-center", style: { color: T.muted } }, "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E23\u0E48\u0E32\u0E07\u0E01\u0E32\u0E22\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E19\u0E49\u0E2D\u0E22 \u0E40\u0E25\u0E37\u0E48\u0E2D\u0E19/\u0E41\u0E01\u0E49\u0E40\u0E27\u0E25\u0E32\u0E44\u0E14\u0E49\u0E40\u0E2D\u0E07\u0E43\u0E19\u0E2B\u0E19\u0E49\u0E32 Calendar (\u0E1B\u0E38\u0E48\u0E21 \u270E)")),
                !editing ? (React.createElement("button", { onClick: () => { setDraft(fitnessSplit || {}); setEditing(true); }, className: "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[.98]", style: { background: T.surf2, color: T.green, border: `1px solid ${hex(T.green, .5)}` } },
                    React.createElement(Pencil, { size: 15 }),
                    " \u0E15\u0E31\u0E49\u0E07/\u0E41\u0E01\u0E49\u0E15\u0E32\u0E23\u0E32\u0E07\u0E1B\u0E23\u0E30\u0E08\u0E33\u0E2A\u0E31\u0E1B\u0E14\u0E32\u0E2B\u0E4C")) : (React.createElement(Glass, { className: "p-4" },
                    React.createElement("div", { className: "flex items-center justify-between mb-2" },
                        React.createElement("span", { className: "font-bold text-sm" }, "\u0E15\u0E31\u0E49\u0E07\u0E15\u0E32\u0E23\u0E32\u0E07\u0E1B\u0E23\u0E30\u0E08\u0E33 (\u0E0B\u0E49\u0E33\u0E17\u0E38\u0E01\u0E2A\u0E31\u0E1B\u0E14\u0E32\u0E2B\u0E4C)")),
                    React.createElement("div", { className: "mb-3" },
                        React.createElement(Label, null, "\u0E27\u0E31\u0E19\u0E40\u0E23\u0E34\u0E48\u0E21\u0E2A\u0E31\u0E1B\u0E14\u0E32\u0E2B\u0E4C"),
                        React.createElement("div", { className: "flex gap-1 flex-wrap" }, WEEK_ORDER.map(d => {
                            const on = fitnessStartDay === d;
                            return React.createElement("button", { key: d, onClick: () => setFitnessStartDay(d), className: "px-2 py-1 rounded-lg text-[11px] font-bold", style: { background: on ? T.purple : T.surf2, color: on ? "#fff" : T.sub } }, TH_D[d]);
                        }))),
                    React.createElement("div", { className: "space-y-2" }, WEEK_ORDER.map(d => {
                        const cur = draft[d] || { kind: "rest", parts: [] };
                        return (React.createElement("div", { key: d, className: "p-2.5 rounded-xl", style: { background: T.surf2, border: `1px solid ${T.border}` } },
                            React.createElement("div", { className: "flex items-center gap-2 mb-1.5" },
                                React.createElement("span", { className: "w-14 text-xs font-bold", style: { color: T.sub } }, TH_DAY_FULL[d]),
                                React.createElement("div", { className: "flex gap-1 flex-1" }, [["rest", "REST DAY"], ["weight", "GYM"], ["sport", "SPORTS"]].map(([k, l]) => {
                                    const on = cur.kind === k;
                                    return React.createElement("button", { key: k, onClick: () => setDay(d, { kind: k }), className: "flex-1 py-1.5 rounded-lg text-[10px] font-bold", style: { background: on ? (k === "rest" ? T.slate : T.green) : "transparent", color: on ? (k === "rest" ? "#fff" : "#000") : T.sub, border: `1px solid ${on ? (k === "rest" ? T.slate : T.green) : T.border}` } }, l);
                                }))),
                            cur.kind === "weight" && (React.createElement("div", { className: "flex gap-1 flex-wrap pl-16" }, [...MUSCLE_PARTS, ...GYM_STYLES].map(p => {
                                const on = (cur.parts || []).includes(p);
                                const isStyle = GYM_STYLES.includes(p);
                                return React.createElement("button", { key: p, onClick: () => togPart(d, p), className: "px-2 py-1 rounded-lg text-[10px] font-medium", style: { background: on ? (isStyle ? T.cyan : T.green) : T.surf, color: on ? "#000" : T.sub, border: `1px solid ${on ? (isStyle ? T.cyan : T.green) : T.border}` } },
                                    on ? "✓" : "",
                                    p);
                            }))),
                            cur.kind === "sport" && (React.createElement("div", { className: "flex gap-1 flex-wrap pl-16" }, SPORT_LIST.map(sp => {
                                const on = cur.sport === sp;
                                return React.createElement("button", { key: sp, onClick: () => setDay(d, { sport: sp }), className: "px-2 py-1 rounded-lg text-[10px] font-medium", style: { background: on ? T.green : T.surf, color: on ? "#000" : T.sub, border: `1px solid ${on ? T.green : T.border}` } },
                                    on ? "✓" : "",
                                    sp);
                            })))));
                    })),
                    React.createElement("div", { className: "flex gap-2 mt-3" },
                        React.createElement("button", { onClick: () => { saveFitnessSplit(draft); setEditing(false); }, className: "flex-1 py-2.5 rounded-xl font-bold", style: { background: T.green, color: "#000" } }, "\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E15\u0E32\u0E23\u0E32\u0E07"),
                        React.createElement("button", { onClick: () => setEditing(false), className: "flex-1 py-2.5 rounded-xl font-bold", style: { background: T.surf2, color: T.sub, border: `1px solid ${T.border}` } }, "\u0E22\u0E01\u0E40\u0E25\u0E34\u0E01")))))),
            (wpOpen || wpEdit) && React.createElement(WorkoutPresetModal, { initial: wpEdit, onClose: () => { setWpOpen(false); setWpEdit(null); }, onSave: (p) => { setWorkoutPresets(ps => ps.some(x => x.id === p.id) ? ps.map(x => x.id === p.id ? p : x) : [...ps, p]); setWpOpen(false); setWpEdit(null); } }),
            sub === "week" && React.createElement("div", { className: "text-[10px] text-center pb-2", style: { color: T.muted } }, "\u0E15\u0E32\u0E23\u0E32\u0E07\u0E19\u0E35\u0E49\u0E0B\u0E49\u0E33\u0E17\u0E38\u0E01\u0E2A\u0E31\u0E1B\u0E14\u0E32\u0E2B\u0E4C\u0E42\u0E14\u0E22\u0E44\u0E21\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E25\u0E48\u0E27\u0E07\u0E2B\u0E19\u0E49\u0E32 \u2014 \u0E1E\u0E2D\u0E16\u0E36\u0E07\u0E2A\u0E31\u0E1B\u0E14\u0E32\u0E2B\u0E4C\u0E43\u0E2B\u0E21\u0E48\u0E21\u0E32\u0E01\u0E14\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E2A\u0E23\u0E49\u0E32\u0E07 event \u0E08\u0E23\u0E34\u0E07\u0E40\u0E02\u0E49\u0E32 Calendar")));
    }
