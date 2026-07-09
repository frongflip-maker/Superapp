"use strict";
    const CAL_VIEWS = [["day", "วัน"], ["week", "สัปดาห์"], ["month", "เดือน"]];
    function Calendar(props) {
        const { sel, setSel, events, addEvent, editEvent, toggleEvent, toggleEventPaid, delEvent, exportEventICS, exportDayICS, exportWeekICS } = props;
        const d = parseK(sel);
        const [view, setView] = useState("day");
        const [open, setOpen] = useState(false);
        const [editEv, setEditEv] = useState(null);
        const [confirmDel, setConfirmDel] = useState(null);
        const week = useMemo(() => { const s = addDays(d, -d.getDay()); return Array.from({ length: 7 }, (_, i) => addDays(s, i)); }, [sel]);
        const dayEvents = events.filter(e => e.date === sel).sort((a, b) => toMin(a.startTime) - toMin(b.startTime));
        const countOn = (k) => events.filter(e => e.date === k).length;
        const step = (dir) => {
            if (view === "month") {
                const nd = new Date(d.getFullYear(), d.getMonth() + dir, 1);
                setSel(dkey(nd));
            }
            else {
                setSel(dkey(addDays(d, dir * (view === "week" ? 7 : 1))));
            }
        };
        const headerLabel = view === "month" ? `${TH_M[d.getMonth()]} ${d.getFullYear()}`
            : view === "week" ? `${week[0].getDate()} ${TH_M[week[0].getMonth()]} – ${week[6].getDate()} ${TH_M[week[6].getMonth()]}`
                : `${TH_D[d.getDay()]} ${d.getDate()} ${TH_M[d.getMonth()]} ${d.getFullYear()}`;
        const monthCells = useMemo(() => {
            const first = new Date(d.getFullYear(), d.getMonth(), 1);
            const lead = first.getDay();
            const days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
            const cells = [];
            for (let i = 0; i < lead; i++)
                cells.push(null);
            for (let dd = 1; dd <= days; dd++)
                cells.push(new Date(d.getFullYear(), d.getMonth(), dd));
            while (cells.length % 7 !== 0)
                cells.push(null);
            return cells;
        }, [sel]);
        const onAdd = (es) => { es.forEach(addEvent); setOpen(false); };
        const onEdit = (patch) => { editEvent(editEv.id, patch); setEditEv(null); };
        const EventRow = (e) => {
            const ET = EVENT_TYPES[e.type] || EVENT_TYPES.other;
            const done = e.status === "done";
            return (React.createElement(Glass, { key: e.id, className: "p-3", style: { borderLeft: `3px solid ${ET.color}`, opacity: done ? 0.6 : 1 } },
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement("button", { onClick: () => toggleEvent(e.id), className: "w-6 h-6 rounded-md flex items-center justify-center shrink-0", style: { background: done ? ET.color : "transparent", border: `2px solid ${done ? ET.color : T.border}` } }, done && React.createElement(Check, { size: 14, color: "#000" })),
                    React.createElement("div", { className: "flex-1 min-w-0" },
                        React.createElement("div", { className: "font-semibold text-sm truncate" }, e.title),
                        React.createElement("div", { className: "flex items-center gap-1.5 mt-0.5 flex-wrap" },
                            React.createElement(ET.Icon, { size: 11, style: { color: ET.color } }),
                            React.createElement("span", { className: "text-[10px]", style: { color: T.muted } },
                                e.startTime ? `${e.startTime}–${e.endTime} · ` : "",
                                ET.label,
                                e.income ? ` · ฿${e.income}` : ""),
                            e.location && React.createElement("button", { onClick: () => openMaps(e.location), className: "inline-flex items-center gap-0.5 text-[10px] font-semibold", style: { color: T.blue } },
                                React.createElement(MapPin, { size: 11 }),
                                e.location),
                            Number(e.income) > 0 && e.type !== "studio" && (React.createElement("button", { onClick: () => toggleEventPaid(e.id), className: "inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full", style: { background: e.paid ? hex(T.green, .16) : hex(T.orange, .16), color: e.paid ? T.green : T.orange } }, e.paid ? React.createElement(React.Fragment, null,
                                React.createElement(Check, { size: 10 }),
                                " \u0E23\u0E31\u0E1A\u0E41\u0E25\u0E49\u0E27") : "ยังไม่รับเงิน")))),
                    React.createElement("div", { className: "flex items-center gap-1 shrink-0" },
                        e.startTime && React.createElement("button", { onClick: () => exportEventICS(e), "aria-label": e.icsAdded ? "อยู่ในปฏิทินเครื่องแล้ว" : "เพิ่มลงปฏิทินเครื่อง", className: "w-7 h-7 rounded-lg flex items-center justify-center", style: { color: e.icsAdded ? "#000" : T.green, background: e.icsAdded ? T.green : "transparent" } }, e.icsAdded ? React.createElement(Check, { size: 13 }) : React.createElement(CalendarPlus, { size: 15 })),
                        React.createElement("button", { onClick: () => setEditEv(e), "aria-label": "\u0E41\u0E01\u0E49\u0E44\u0E02 event", className: "w-7 h-7 rounded-lg flex items-center justify-center", style: { color: T.blue } },
                            React.createElement(Pencil, { size: 14 })),
                        confirmDel === e.id ? (React.createElement("button", { onClick: () => { delEvent(e.id); setConfirmDel(null); }, className: "text-[10px] font-bold px-2 py-1 rounded-lg", style: { background: T.red, color: "#fff" } }, "\u0E25\u0E1A?")) : (React.createElement("button", { onClick: () => setConfirmDel(e.id), "aria-label": "\u0E25\u0E1A event", className: "w-7 h-7 rounded-lg flex items-center justify-center", style: { color: T.muted } },
                            React.createElement(Trash2, { size: 14 })))))));
        };
        return (React.createElement("div", { className: "px-4 pt-5 space-y-4" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("h1", { className: "text-2xl font-extrabold" }, "Calendar"),
                React.createElement("div", { className: "flex gap-1.5" },
                    React.createElement("button", { onClick: () => exportDayICS(sel), className: "text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 active:scale-95", style: { background: hex(T.green, .14), color: T.green, border: `1px solid ${hex(T.green, .4)}` } },
                        React.createElement(CalendarPlus, { size: 12 }),
                        " \u0E27\u0E31\u0E19\u0E19\u0E35\u0E49"),
                    React.createElement("button", { onClick: () => exportWeekICS(week), className: "text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 active:scale-95", style: { background: hex(T.green, .14), color: T.green, border: `1px solid ${hex(T.green, .4)}` } },
                        React.createElement(CalendarPlus, { size: 12 }),
                        " \u0E2A\u0E31\u0E1B\u0E14\u0E32\u0E2B\u0E4C"))),
            React.createElement("div", { className: "flex gap-1 p-1 rounded-xl", style: { background: T.surf, border: `1px solid ${T.border}` } }, CAL_VIEWS.map(([k, label]) => {
                const on = view === k;
                return React.createElement("button", { key: k, onClick: () => setView(k), className: "flex-1 py-2 rounded-lg text-xs font-bold transition", style: { background: on ? T.purple : "transparent", color: on ? "#fff" : T.sub, boxShadow: on ? glow(T.purple, .25) : "none" } }, label);
            })),
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("button", { onClick: () => step(-1), "aria-label": "\u0E01\u0E48\u0E2D\u0E19\u0E2B\u0E19\u0E49\u0E32", className: "w-9 h-9 rounded-xl flex items-center justify-center active:scale-95", style: { background: T.surf, border: `1px solid ${T.border}` } },
                    React.createElement(ChevronLeft, { size: 18 })),
                React.createElement("button", { onClick: () => setSel(dkey(new Date())), className: "text-sm font-bold px-3 py-1.5 rounded-lg", style: { color: T.text } }, headerLabel),
                React.createElement("button", { onClick: () => step(1), "aria-label": "\u0E16\u0E31\u0E14\u0E44\u0E1B", className: "w-9 h-9 rounded-xl flex items-center justify-center active:scale-95", style: { background: T.surf, border: `1px solid ${T.border}` } },
                    React.createElement(ChevronRight, { size: 18 }))),
            view !== "month" && (React.createElement("div", { className: "flex gap-1.5" }, week.map(wd => {
                const k = dkey(wd);
                const on = k === sel;
                const n = countOn(k);
                return (React.createElement("button", { key: k, onClick: () => setSel(k), className: "flex-1 py-2 rounded-xl flex flex-col items-center gap-1 transition", style: { background: on ? T.purple : T.surf, border: `1px solid ${on ? T.purple : T.border}`, boxShadow: on ? glow(T.purple) : "none" } },
                    React.createElement("span", { className: "text-[9px]", style: { color: on ? "#fff" : T.muted } }, TH_D[wd.getDay()]),
                    React.createElement("span", { className: "text-base font-bold", style: { color: on ? "#fff" : T.text } }, wd.getDate()),
                    React.createElement("span", { className: "w-1 h-1 rounded-full", style: { background: n ? (on ? "#fff" : T.purple) : "transparent" } })));
            }))),
            React.createElement("button", { onClick: () => setOpen(true), className: "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[.98]", style: { background: T.purple, color: "#fff", boxShadow: glow(T.purple) } },
                React.createElement(Plus, { size: 18 }),
                " \u0E40\u0E1E\u0E34\u0E48\u0E21 Event"),
            view === "month" && (React.createElement("div", null,
                React.createElement("div", { className: "grid grid-cols-7 gap-1 mb-1" }, TH_D.map((wd, i) => React.createElement("div", { key: i, className: "text-center text-[10px] font-semibold py-1", style: { color: T.muted } }, wd))),
                React.createElement("div", { className: "grid grid-cols-7 gap-1" }, monthCells.map((cell, i) => {
                    if (!cell)
                        return React.createElement("div", { key: i, className: "aspect-square" });
                    const k = dkey(cell);
                    const on = k === sel;
                    const isToday = k === dkey(new Date());
                    const n = countOn(k);
                    return (React.createElement("button", { key: i, onClick: () => { setSel(k); setView("day"); }, className: "aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 transition active:scale-95", style: { background: on ? T.purple : T.surf, border: `1px solid ${on ? T.purple : isToday ? hex(T.gold, .6) : T.border}` } },
                        React.createElement("span", { className: "text-xs font-bold", style: { color: on ? "#fff" : isToday ? T.gold : T.text } }, cell.getDate()),
                        n > 0 && React.createElement("span", { className: "text-[8px] font-bold px-1 rounded-full", style: { background: on ? "rgba(255,255,255,.25)" : hex(T.purple, .2), color: on ? "#fff" : T.purple } }, n)));
                })),
                React.createElement("div", { className: "text-[10px] text-center mt-3", style: { color: T.muted } }, "\u0E41\u0E15\u0E30\u0E27\u0E31\u0E19\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E14\u0E39\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14 \u00B7 \u0E15\u0E31\u0E27\u0E40\u0E25\u0E02 = \u0E08\u0E33\u0E19\u0E27\u0E19 event \u0E27\u0E31\u0E19\u0E19\u0E31\u0E49\u0E19"))),
            view === "day" && (React.createElement("div", { className: "space-y-2" }, dayEvents.length === 0 ? React.createElement(Empty, { text: "\u0E27\u0E31\u0E19\u0E19\u0E35\u0E49\u0E27\u0E48\u0E32\u0E07 \u2014 \u0E40\u0E1E\u0E34\u0E48\u0E21 Event \u0E2B\u0E23\u0E37\u0E2D\u0E1E\u0E31\u0E01\u0E01\u0E47\u0E44\u0E14\u0E49" }) : dayEvents.map(EventRow))),
            view === "week" && (React.createElement("div", { className: "space-y-3" }, week.map(wd => {
                const k = dkey(wd);
                const evs = events.filter(e => e.date === k).sort((a, b) => toMin(a.startTime) - toMin(b.startTime));
                const on = k === sel;
                return (React.createElement("div", { key: k },
                    React.createElement("button", { onClick: () => { setSel(k); setView("day"); }, className: "flex items-center gap-2 mb-1.5 w-full text-left" },
                        React.createElement("span", { className: "text-xs font-bold", style: { color: on ? T.purple : T.sub } },
                            TH_D[wd.getDay()],
                            " ",
                            wd.getDate(),
                            " ",
                            TH_M[wd.getMonth()]),
                        React.createElement("span", { className: "h-px flex-1", style: { background: T.border } }),
                        React.createElement("span", { className: "text-[10px]", style: { color: T.muted } }, evs.length ? `${evs.length} รายการ` : "ว่าง")),
                    evs.length > 0 && React.createElement("div", { className: "space-y-2" }, evs.map(EventRow))));
            }))),
            open && React.createElement(EventModal, { txnCategories: props.txnCategories, mode: "add", defaultDate: sel, onClose: () => setOpen(false), onSave: onAdd }),
            editEv && React.createElement(EventModal, { txnCategories: props.txnCategories, mode: "edit", initial: editEv, onClose: () => setEditEv(null), onSave: onEdit, onSaveSeries: (patch) => { props.editEventSeries(editEv.title, editEv.date, patch); setEditEv(null); }, onDelete: () => { delEvent(editEv.id); setEditEv(null); }, onDeleteSeries: () => { props.delEventSeries(editEv.title, editEv.date); setEditEv(null); } })));
    }
