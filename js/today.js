"use strict";
    function Today(props) {
        const { sel, setSel, todayEvents, addEvent, editEvent, openSettings, exportEventICS } = props;
        const d = parseK(sel);
        const [addEvOpen, setAddEvOpen] = useState(false);
        const [editEv, setEditEv] = useState(null);
        const [nowTick, setNowTick] = useState(Date.now());
        useEffect(() => { const id = setInterval(() => setNowTick(Date.now()), 30000); return () => clearInterval(id); }, []);
        const nowMin = (() => { const n = new Date(nowTick); return n.getHours() * 60 + n.getMinutes(); })();
        const timed = sel === TK ? todayEvents.filter(e => e.status !== "done" && e.startTime).map(e => ({ e, s: toMin(e.startTime), en: toMin(e.endTime || e.startTime) })) : [];
        const ongoing = timed.find(x => x.s <= nowMin && nowMin < x.en);
        const nextUp = timed.filter(x => x.s > nowMin).sort((a, b) => a.s - b.s)[0];
        const fmtDur = (m) => m >= 60 ? `${Math.floor(m / 60)} ชม. ${m % 60} นาที` : `${m} นาที`;
        return (React.createElement("div", { className: "px-4 pt-5 space-y-4" },
            React.createElement("div", { className: "flex items-center" },
                React.createElement("div", { className: "text-[10px] font-semibold tracking-widest uppercase", style: { color: T.muted } }, "Command Center")),
            (() => {
                const totI = todayEvents.length;
                const doneI = todayEvents.filter(e => e.status === "done").length;
                const pct = totI ? Math.round(doneI / totI * 100) : 0;
                const R = 34, C = 2 * Math.PI * R, dash = C * (1 - pct / 100);
                const rc = pct >= 100 ? T.green : pct >= 50 ? T.purple : T.blue;
                return (React.createElement(Glass, { className: "p-0 overflow-hidden relative", glowColor: T.purple },
                    React.createElement("div", { className: "absolute left-0 top-0 bottom-0 w-1.5", style: { background: `linear-gradient(${T.purple}, ${T.blue})` } }),
                    React.createElement("div", { className: "flex items-center", style: { background: `linear-gradient(120deg, ${hex(T.purple, .28)}, ${hex(T.blue, .1)} 60%, transparent)` } },
                        React.createElement("button", { onClick: () => setSel(dkey(addDays(d, -1))), "aria-label": "\u0E27\u0E31\u0E19\u0E01\u0E48\u0E2D\u0E19\u0E2B\u0E19\u0E49\u0E32", className: "self-stretch px-3 shrink-0 flex items-center active:scale-90 ml-1.5" },
                            React.createElement(ChevronLeft, { size: 18, style: { color: T.muted } })),
                        React.createElement("div", { className: "flex-1 flex items-center gap-3 py-4 min-w-0" },
                            React.createElement("div", { className: "flex-1 min-w-0" },
                                React.createElement("div", { className: "flex items-center gap-1.5" },
                                    React.createElement("div", { className: "text-[11px] font-extrabold tracking-[0.3em]", style: { color: T.purple, textShadow: `0 0 10px ${hex(T.purple, .8)}` } }, EN_D[d.getDay()]),
                                    sel !== TK && React.createElement("button", { onClick: () => setSel(TK), className: "text-[10px] font-bold px-2 py-1 rounded-full", style: { background: hex(T.gold, .16), color: T.gold } }, "\u0E27\u0E31\u0E19\u0E19\u0E35\u0E49")),
                                React.createElement("div", { className: "leading-none mt-2" },
                                    React.createElement("span", { className: "text-[46px] font-extrabold align-middle tabular-nums", style: { color: "#fff", textShadow: `0 0 16px ${hex(T.purple, .85)}, 0 2px 3px rgba(0,0,0,.6)` } }, String(d.getDate()).padStart(2, "0")),
                                    React.createElement("span", { className: "text-xl font-bold ml-2 align-middle", style: { color: T.sub } }, EN_M[d.getMonth()])),
                                React.createElement("div", { className: "text-[11px] mt-1.5", style: { color: T.muted } },
                                    todayEvents.length,
                                    " \u0E07\u0E32\u0E19")),
                            React.createElement("div", { className: "relative shrink-0", style: { width: 88, height: 88 } },
                                React.createElement("svg", { width: "88", height: "88", viewBox: "0 0 88 88", style: { transform: "rotate(-90deg)" } },
                                    React.createElement("circle", { cx: "44", cy: "44", r: R, fill: "none", stroke: T.surf2, strokeWidth: "7" }),
                                    React.createElement("circle", { cx: "44", cy: "44", r: R, fill: "none", stroke: rc, strokeWidth: "7", strokeLinecap: "round", strokeDasharray: C, strokeDashoffset: dash, style: { transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 5px ${hex(rc, .7)})` } })),
                                React.createElement("div", { className: "absolute inset-0 flex flex-col items-center justify-center" },
                                    React.createElement("span", { className: "text-xl font-extrabold leading-none", style: { color: rc } },
                                        pct,
                                        React.createElement("span", { className: "text-[11px]" }, "%")),
                                    React.createElement("span", { className: "text-[8px] font-bold tracking-wide mt-0.5", style: { color: T.muted } }, "\u0E27\u0E31\u0E19\u0E19\u0E35\u0E49\u0E40\u0E2A\u0E23\u0E47\u0E08")))),
                        React.createElement("button", { onClick: () => setSel(dkey(addDays(d, 1))), "aria-label": "\u0E27\u0E31\u0E19\u0E16\u0E31\u0E14\u0E44\u0E1B", className: "self-stretch px-3 shrink-0 flex items-center active:scale-90" },
                            React.createElement(ChevronRight, { size: 18, style: { color: T.muted } })))));
            })(),
            (() => {
                const spent = todayEvents.reduce((s, e) => s + (Number(e.energyCost) || 0), 0);
                const lv = spent <= 4 ? { t: "เบา", c: T.green, msg: "วันนี้โปร่ง รับงานเพิ่มได้สบาย" } : spent <= 8 ? { t: "กลาง", c: T.gold, msg: "กำลังพอดี เผื่อแรงไว้บ้าง" } : { t: "แน่น", c: T.red, msg: "วันนี้อัดแน่น — เลื่อนของที่เลื่อนได้ พักให้พอ" };
                return (React.createElement(Glass, { className: "px-4 py-3 flex items-center gap-3" },
                    React.createElement(Battery, { size: 16, style: { color: lv.c } }),
                    React.createElement("div", { className: "flex-1 min-w-0" },
                        React.createElement("span", { className: "font-bold text-sm" },
                            "\u0E27\u0E31\u0E19\u0E19\u0E35\u0E49: ",
                            React.createElement("span", { style: { color: lv.c } }, lv.t)),
                        React.createElement("div", { className: "text-[11px]", style: { color: T.muted } }, lv.msg)),
                    React.createElement("span", { className: "text-[10px] shrink-0", style: { color: T.muted } },
                        todayEvents.length,
                        " \u0E07\u0E32\u0E19")));
            })(),
            (ongoing || nextUp) && (() => {
                const cur = ongoing || nextUp;
                const ET = EVENT_TYPES[cur.e.type];
                const isNow = !!ongoing;
                const mins = isNow ? cur.en - nowMin : cur.s - nowMin;
                return (React.createElement(Glass, { className: "p-4", glowColor: ET.color, style: { border: `1px solid ${hex(ET.color, .55)}` } },
                    React.createElement("div", { className: "flex items-center gap-2 mb-1.5" },
                        React.createElement("span", { className: "w-2 h-2 rounded-full", style: { background: ET.color, boxShadow: `0 0 8px ${ET.color}` } }),
                        React.createElement("span", { className: "text-[10px] font-extrabold tracking-widest uppercase", style: { color: ET.color } }, isNow ? "กำลังดำเนินอยู่" : "ถัดไป"),
                        React.createElement("span", { className: "text-[11px] tabular-nums ml-auto font-bold", style: { color: T.sub } },
                            cur.e.startTime,
                            "\u2013",
                            cur.e.endTime)),
                    React.createElement("div", { className: "text-xl font-extrabold truncate" }, cur.e.title),
                    React.createElement("div", { className: "flex items-center gap-2 mt-1 flex-wrap" },
                        React.createElement("span", { className: "inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full", style: { background: hex(ET.color, .16), color: ET.color } },
                            React.createElement(ET.Icon, { size: 10 }),
                            ET.label),
                        cur.e.location && React.createElement("button", { onClick: () => openMaps(cur.e.location), className: "inline-flex items-center gap-0.5 text-[10px] font-semibold", style: { color: T.blue } },
                            React.createElement(MapPin, { size: 11 }),
                            cur.e.location)),
                    React.createElement("div", { className: "mt-2.5 flex items-baseline gap-1.5" },
                        React.createElement("span", { className: "text-[11px]", style: { color: T.muted } }, isNow ? "จะจบในอีก" : "เริ่มในอีก"),
                        React.createElement("span", { className: "text-2xl font-extrabold tabular-nums", style: { color: ET.color } }, fmtDur(Math.max(0, mins))))));
            })(),
            React.createElement(Section, { title: "Timeline", icon: Clock, action: React.createElement("button", { onClick: () => setAddEvOpen(true), className: "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold active:scale-95", style: { background: T.purple, color: "#fff" } },
                    React.createElement(Plus, { size: 13 }),
                    " \u0E40\u0E1E\u0E34\u0E48\u0E21") }, todayEvents.length === 0 ? React.createElement(Empty, { text: "\u0E27\u0E31\u0E19\u0E19\u0E35\u0E49\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E2D\u0E35\u0E40\u0E27\u0E19\u0E15\u0E4C \u2014 \u0E01\u0E14 \u201C+ \u0E40\u0E1E\u0E34\u0E48\u0E21\u201D \u0E21\u0E38\u0E21\u0E02\u0E27\u0E32\u0E1A\u0E19\u0E44\u0E14\u0E49\u0E40\u0E25\u0E22" }) :
                React.createElement("div", null, todayEvents.map((e, ei) => {
                    const ET = EVENT_TYPES[e.type];
                    const done = e.status === "done";
                    const lastRow = ei === todayEvents.length - 1;
                    return (React.createElement("div", { key: e.id, className: "flex gap-2.5" },
                        React.createElement("div", { className: "flex flex-col items-center shrink-0 pt-3", style: { width: 50 } },
                            React.createElement("div", { className: "text-sm font-extrabold tabular-nums leading-none", style: { color: done ? T.muted : T.text } }, e.startTime || "—"),
                            React.createElement("div", { className: "text-[11px] font-semibold tabular-nums mt-1", style: { color: done ? T.muted : T.sub } }, e.endTime || ""),
                            React.createElement("div", { className: "w-3 h-3 rounded-full mt-1.5 shrink-0", style: { background: done ? T.surf2 : ET.color, border: `2px solid ${ET.color}`, boxShadow: done ? "none" : `0 0 8px ${hex(ET.color, .8)}` } }),
                            !lastRow && React.createElement("div", { className: "w-0.5 flex-1 my-0.5 rounded-full", style: { background: `linear-gradient(${hex(ET.color, .55)}, ${hex(T.border, .6)})`, minHeight: 14 } })),
                        React.createElement(Glass, { className: "flex-1 p-3 mb-2.5", glowColor: done ? undefined : ET.color, style: { opacity: done ? 0.55 : 1, border: `1px solid ${done ? T.border : hex(ET.color, .45)}` } },
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement("div", { className: "flex-1 min-w-0" },
                                    React.createElement("div", { className: "font-bold text-[15px] truncate", style: { textDecoration: done ? "line-through" : "none" } }, e.title),
                                    React.createElement("div", { className: "flex items-center gap-1.5 mt-1 flex-wrap" },
                                        React.createElement("span", { className: "inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full", style: { background: hex(ET.color, .16), color: ET.color } },
                                            React.createElement(ET.Icon, { size: 10 }),
                                            ET.label),
                                        e.income > 0 && React.createElement("span", { className: "text-[10px] font-bold", style: { color: T.gold } },
                                            "\u0E3F",
                                            Number(e.income).toLocaleString()),
                                        e.location && React.createElement("button", { onClick: () => openMaps(e.location), className: "inline-flex items-center gap-0.5 text-[10px] font-semibold", style: { color: T.blue } },
                                            React.createElement(MapPin, { size: 11 }),
                                            e.location),
                                        Number(e.income) > 0 && e.type !== "studio" && React.createElement("button", { onClick: () => props.toggleEventPaid(e.id), className: "inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full", style: { background: e.paid ? hex(T.green, .16) : hex(T.orange, .16), color: e.paid ? T.green : T.orange } }, e.paid ? React.createElement(React.Fragment, null,
                                            React.createElement(Check, { size: 10 }),
                                            " \u0E23\u0E31\u0E1A\u0E41\u0E25\u0E49\u0E27") : "ยังไม่รับเงิน"))),
                                React.createElement("div", { className: "flex flex-col gap-1.5 shrink-0" },
                                    React.createElement("button", { onClick: () => props.toggleEvent(e.id), "aria-label": "\u0E17\u0E33\u0E40\u0E2A\u0E23\u0E47\u0E08", className: "w-8 h-8 rounded-lg flex items-center justify-center active:scale-90", style: { background: done ? ET.color : "transparent", border: `2px solid ${done ? ET.color : T.border}` } }, done && React.createElement(Check, { size: 15, color: "#000" })),
                                    e.startTime && React.createElement("button", { onClick: () => exportEventICS(e), "aria-label": e.icsAdded ? "อยู่ในปฏิทินเครื่องแล้ว" : "เพิ่มลงปฏิทินเครื่อง", className: "w-8 h-8 rounded-lg flex items-center justify-center active:scale-90", style: { background: e.icsAdded ? T.green : hex(T.green, .14), color: e.icsAdded ? "#000" : T.green, border: e.icsAdded ? "none" : `1px dashed ${hex(T.green, .5)}` } }, e.icsAdded ? React.createElement(Check, { size: 14 }) : React.createElement(CalendarPlus, { size: 14 })),
                                    React.createElement("button", { onClick: () => setEditEv(e), "aria-label": "\u0E41\u0E01\u0E49\u0E44\u0E02 event", className: "w-8 h-8 rounded-lg flex items-center justify-center active:scale-90", style: { background: T.surf2, color: T.sub, border: `1px solid ${T.border}` } },
                                        React.createElement(Pencil, { size: 13 })))))));
                }))),
            addEvOpen && React.createElement(EventModal, { txnCategories: props.txnCategories, defaultDate: sel, onClose: () => setAddEvOpen(false), onSave: (evs) => { evs.forEach(addEvent); setAddEvOpen(false); } }),
            editEv && React.createElement(EventModal, { txnCategories: props.txnCategories, mode: "edit", initial: editEv, onClose: () => setEditEv(null), onSave: (patch) => { editEvent(editEv.id, patch); setEditEv(null); }, onSaveSeries: (patch) => { props.editEventSeries(editEv.title, editEv.date, patch); setEditEv(null); }, onDelete: () => { props.delEvent(editEv.id); setEditEv(null); }, onDeleteSeries: () => { props.delEventSeries(editEv.title, editEv.date); setEditEv(null); } })));
    }
