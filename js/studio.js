"use strict";
    function Collapse({ title, icon: Icon, count, color, children, defaultOpen }) {
        const [open, setOpen] = useState(!!defaultOpen);
        const c = color || T.purple;
        return (React.createElement("div", null,
            React.createElement("button", { onClick: () => setOpen(o => !o), className: "w-full flex items-center gap-2 p-3 rounded-xl active:scale-[.99]", style: { background: T.surf, border: `1px solid ${open ? hex(c, .5) : T.border}` } },
                Icon && React.createElement(Icon, { size: 16, style: { color: c } }),
                React.createElement("span", { className: "font-bold text-sm" }, title),
                React.createElement("span", { className: "text-[11px] font-bold px-2 py-0.5 rounded-full", style: { background: hex(c, .16), color: c } }, count),
                React.createElement(ChevronDown, { size: 16, style: { color: T.muted, marginLeft: "auto", transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" } })),
            open && React.createElement("div", { className: "mt-2 space-y-2" }, children)));
    }
    function Studio(props) {
        const [payBk, setPayBk] = useState(null);
        const S_SUBS = ["overview", "booking", "bands", "finance"];
        const [sub, setSubRaw] = useState(() => { try {
            const v = localStorage.getItem("dos_studio_sub");
            return S_SUBS.includes(v) ? v : "overview";
        }
        catch {
            return "overview";
        } });
        const setSub = (k) => { setSubRaw(k); try {
            localStorage.setItem("dos_studio_sub", k);
        }
        catch { } };
        const { bookings, addBooking, loyaltyBase, resetLoyalty, togglePaid, markBookingPaid, toggleBookingDone, delBooking, delBand, transactions, addTxn, delTxn, capital, updateCapital, accounts, setAccounts, txnCategories, setTxnCategories } = props;
        const [open, setOpen] = useState(false);
        const [txnOpen, setTxnOpen] = useState(false);
        const [histBand, setHistBand] = useState(null);
        const [capEdit, setCapEdit] = useState(false);
        const [capVal, setCapVal] = useState(String(capital));
        useEffect(() => { setCapVal(String(capital)); }, [capital]);
        const [finMode, setFinMode] = useState("total");
        const [finMonth, setFinMonth] = useState(monthKey(TK));
        const inScope = (dk) => finMode === "total" ? true : monthKey(dk) === finMonth;
        const [bandPage, setBandPage] = useState(0);
        const [bookPage, setBookPage] = useState(0);
        const [txnPage, setTxnPage] = useState(0);
        const [delBandC, setDelBandC] = useState(null);
        const [delBookC, setDelBookC] = useState(null);
        const incomeBookings = bookings.filter(b => b.paid && inScope(b.date)).reduce((s, b) => s + b.totalPrice, 0);
        const studioExpenseSum = transactions.filter(t => t.kind === "out" && t.studioExpense && inScope(t.date)).reduce((s, t) => s + Number(t.amount || 0), 0);
        const income = incomeBookings;
        const expense = studioExpenseSum;
        const net = income - expense;
        const allNet = bookings.filter(b => b.paid).reduce((s, b) => s + b.totalPrice, 0)
            + transactions.reduce((s, t) => s + (t.kind === "in" ? 1 : -1) * Number(t.amount || 0), 0);
        const balance = capital + allNet;
        const payInfo = (b) => b.paid ? { label: "จ่ายครบ", color: T.green }
            : (b.deposit > 0 ? { label: `มัดจำ ฿${b.deposit.toLocaleString()} · ค้าง ฿${(b.totalPrice - b.deposit).toLocaleString()}`, color: T.orange }
                : { label: "ยังไม่จ่าย", color: T.red });
        const groups = useMemo(() => {
            const m = {};
            bookings.forEach(b => { var _a; (m[_a = b.bandName] ?? (m[_a] = [])).push(b); });
            return Object.entries(m).map(([band, list]) => {
                const allHours = list.reduce((s, b) => s + hoursBetween(b.startTime, b.endTime), 0);
                const paidHours = list.filter(b => b.paid).reduce((s, b) => s + hoursBetween(b.startTime, b.endTime), 0);
                const base = loyaltyBase[band] || 0;
                const tally = Math.max(0, paidHours - base);
                const sortedList = [...list].sort((a, b) => b.date.localeCompare(a.date));
                return { band, list: sortedList, lastDate: sortedList[0]?.date,
                    allHours, paidHours, tally, free: Math.floor(tally / 5), prog: tally % 5, sessions: list.length };
            }).sort((a, b) => b.allHours - a.allHours);
        }, [bookings, loyaltyBase]);
        const histGroup = groups.find(g => g.band === histBand);
        const bandSlice = groups.slice(bandPage * PER_PAGE, (bandPage + 1) * PER_PAGE);
        const sortedBookings = useMemo(() => [...bookings].sort((a, b) => {
            const aDone = (a.done ?? (a.bookingStatus === "Completed")) && a.paid, bDone = (b.done ?? (b.bookingStatus === "Completed")) && b.paid;
            if (aDone !== bDone)
                return aDone ? 1 : -1;
            return b.date.localeCompare(a.date);
        }), [bookings]);
        const bookSlice = sortedBookings.slice(bookPage * PER_PAGE, (bookPage + 1) * PER_PAGE);
        const studioTxns = useMemo(() => transactions.filter(t => t.studioExpense), [transactions]);
        const sortedTxns = useMemo(() => [...studioTxns].sort((a, b) => b.date.localeCompare(a.date)), [studioTxns]);
        const txnSlice = sortedTxns.slice(txnPage * PER_PAGE, (txnPage + 1) * PER_PAGE);
        const netColor = net >= 0 ? T.green : T.red;
        return (React.createElement("div", { className: "px-4 pt-5 space-y-4" },
            React.createElement("h1", { className: "text-2xl font-extrabold" }, "Studio"),
            React.createElement("div", { className: "flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4", style: { scrollbarWidth: "none" } }, [["overview", BarChart3, "ภาพรวม"], ["booking", History, "การจอง"], ["bands", Gift, "วง/ลูกค้า"], ["finance", Wallet, "รายรับ-จ่าย"]].map(([k, Ic, l]) => {
                const on = sub === k;
                return React.createElement("button", { key: k, onClick: () => setSub(k), className: "px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 active:scale-95 flex items-center gap-1.5", style: { background: on ? T.purple : T.surf, color: on ? "#fff" : T.sub, border: `1px solid ${on ? T.purple : T.border}` } },
                    React.createElement(Ic, { size: 13 }),
                    l);
            })),
            (sub === "overview" || sub === "finance") && (React.createElement(React.Fragment, null,
                React.createElement(Glass, { className: "p-4", glowColor: T.purple },
                    React.createElement("div", { className: "flex items-center gap-1 p-1 rounded-xl mb-3", style: { background: T.surf2 } }, [["total", "รวมทั้งหมด"], ["month", "รายเดือน"]].map(([k, l]) => {
                        const on = finMode === k;
                        return React.createElement("button", { key: k, onClick: () => setFinMode(k), className: "flex-1 py-1.5 rounded-lg text-xs font-bold", style: { background: on ? T.purple : "transparent", color: on ? "#fff" : T.sub } }, l);
                    })),
                    finMode === "month" && (React.createElement("div", { className: "flex items-center justify-between mb-3" },
                        React.createElement("button", { onClick: () => setFinMonth(m => addMonthKey(m, -1)), className: "w-8 h-8 rounded-lg flex items-center justify-center", style: { background: T.surf2 } },
                            React.createElement(ChevronLeft, { size: 16 })),
                        React.createElement("span", { className: "text-sm font-bold" }, monthLabel(finMonth)),
                        React.createElement("button", { onClick: () => setFinMonth(m => addMonthKey(m, 1)), className: "w-8 h-8 rounded-lg flex items-center justify-center", style: { background: T.surf2 } },
                            React.createElement(ChevronRight, { size: 16 })))),
                    React.createElement("div", { className: "grid grid-cols-3 gap-2" },
                        React.createElement("div", null,
                            React.createElement("div", { className: "text-[10px]", style: { color: T.muted } }, "\u0E23\u0E32\u0E22\u0E23\u0E31\u0E1A\u0E2B\u0E49\u0E2D\u0E07\u0E0B\u0E49\u0E2D\u0E21"),
                            React.createElement("div", { className: "text-base font-extrabold flex items-center gap-1", style: { color: T.green } },
                                React.createElement(TrendingUp, { size: 13 }),
                                fmtBaht(income))),
                        React.createElement("div", null,
                            React.createElement("div", { className: "text-[10px]", style: { color: T.muted } }, "\u0E23\u0E32\u0E22\u0E08\u0E48\u0E32\u0E22\u0E2B\u0E49\u0E2D\u0E07\u0E0B\u0E49\u0E2D\u0E21"),
                            React.createElement("div", { className: "text-base font-extrabold flex items-center gap-1", style: { color: T.red } },
                                React.createElement(TrendingDown, { size: 13 }),
                                fmtBaht(expense))),
                        React.createElement("div", null,
                            React.createElement("div", { className: "text-[10px]", style: { color: T.muted } }, "\u0E2A\u0E38\u0E17\u0E18\u0E34"),
                            React.createElement("div", { className: "text-base font-extrabold", style: { color: netColor } },
                                net >= 0 ? "" : "-",
                                fmtBaht(Math.abs(net))))),
                    React.createElement("div", { className: "text-[10px] mt-1.5", style: { color: T.muted } }, "* \u0E40\u0E09\u0E1E\u0E32\u0E30\u0E23\u0E32\u0E22\u0E08\u0E48\u0E32\u0E22\u0E17\u0E35\u0E48\u0E41\u0E17\u0E47\u0E01\u0E27\u0E48\u0E32\u0E40\u0E1B\u0E47\u0E19\u0E02\u0E2D\u0E07\u0E2B\u0E49\u0E2D\u0E07\u0E0B\u0E49\u0E2D\u0E21 \u2014 \u0E23\u0E32\u0E22\u0E23\u0E31\u0E1A-\u0E08\u0E48\u0E32\u0E22\u0E17\u0E31\u0E48\u0E27\u0E44\u0E1B (\u0E1A\u0E49\u0E32\u0E19/\u0E2A\u0E48\u0E27\u0E19\u0E15\u0E31\u0E27) \u0E14\u0E39\u0E17\u0E35\u0E48 Budget"),
                    React.createElement("div", { className: "mt-3 pt-3 flex items-center justify-between", style: { borderTop: `1px solid ${T.border}` } },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(Wallet, { size: 14, style: { color: T.gold } }),
                            React.createElement("span", { className: "text-[11px]", style: { color: T.sub } }, "\u0E40\u0E07\u0E34\u0E19\u0E15\u0E49\u0E19"),
                            capEdit ? (React.createElement("input", { autoFocus: true, type: "number", value: capVal, onChange: e => setCapVal(e.target.value), onBlur: () => { updateCapital(capVal); setCapEdit(false); }, onKeyDown: e => { if (e.key === "Enter") {
                                    updateCapital(capVal);
                                    setCapEdit(false);
                                } }, className: "w-24 px-2 py-1 rounded-lg text-sm outline-none", style: { background: T.surf2, color: T.text, border: `1px solid ${T.gold}` } })) : (React.createElement("button", { onClick: () => setCapEdit(true), className: "text-sm font-bold flex items-center gap-1", style: { color: T.text } },
                                fmtBaht(capital),
                                " ",
                                React.createElement(Pencil, { size: 11, style: { color: T.muted } })))),
                        React.createElement("div", { className: "text-right" },
                            React.createElement("div", { className: "text-[10px]", style: { color: T.muted } }, "\u0E22\u0E2D\u0E14\u0E04\u0E07\u0E40\u0E2B\u0E25\u0E37\u0E2D"),
                            React.createElement("div", { className: "text-lg font-extrabold", style: { color: balance >= 0 ? T.gold : T.red } }, fmtBaht(balance)))),
                    finMode === "month" && React.createElement("div", { className: "text-[10px] mt-2", style: { color: T.muted } }, "* \u0E22\u0E2D\u0E14\u0E04\u0E07\u0E40\u0E2B\u0E25\u0E37\u0E2D\u0E23\u0E27\u0E21\u0E17\u0E38\u0E01\u0E40\u0E14\u0E37\u0E2D\u0E19 (\u0E40\u0E07\u0E34\u0E19\u0E15\u0E49\u0E19 + \u0E2A\u0E38\u0E17\u0E18\u0E34\u0E2A\u0E30\u0E2A\u0E21) \u2014 \u0E15\u0E31\u0E27\u0E40\u0E25\u0E02\u0E23\u0E32\u0E22\u0E23\u0E31\u0E1A/\u0E08\u0E48\u0E32\u0E22/\u0E2A\u0E38\u0E17\u0E18\u0E34\u0E14\u0E49\u0E32\u0E19\u0E1A\u0E19\u0E04\u0E37\u0E2D\u0E02\u0E2D\u0E07\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E17\u0E35\u0E48\u0E40\u0E25\u0E37\u0E2D\u0E01")))),
            React.createElement("div", { className: "flex gap-2" },
                (sub === "overview" || sub === "booking") && React.createElement("button", { onClick: () => setOpen(true), className: "flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[.98]", style: { background: T.purple, color: "#fff", boxShadow: glow(T.purple) } },
                    React.createElement(Plus, { size: 17 }),
                    " \u0E08\u0E2D\u0E07\u0E2B\u0E49\u0E2D\u0E07"),
                (sub === "overview" || sub === "finance") && React.createElement("button", { onClick: () => setTxnOpen(true), className: "flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[.98]", style: { background: T.surf2, color: T.red, border: `1px solid ${hex(T.red, .5)}` } },
                    React.createElement(TrendingDown, { size: 17 }),
                    " \u0E23\u0E32\u0E22\u0E08\u0E48\u0E32\u0E22\u0E2B\u0E49\u0E2D\u0E07\u0E0B\u0E49\u0E2D\u0E21")),
            sub === "bands" && (React.createElement(Collapse, { title: "\u0E27\u0E07 & \u0E0A\u0E31\u0E48\u0E27\u0E42\u0E21\u0E07\u0E2A\u0E30\u0E2A\u0E21", icon: Gift, count: groups.length, color: T.gold, defaultOpen: true },
                groups.length === 0 ? React.createElement(Empty, { text: "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E27\u0E07 \u2014 \u0E40\u0E23\u0E34\u0E48\u0E21\u0E08\u0E32\u0E01\u0E08\u0E2D\u0E07\u0E2B\u0E49\u0E2D\u0E07" }) : bandSlice.map(g => (React.createElement(Glass, { key: g.band, className: "p-3", glowColor: g.free > 0 ? T.gold : undefined },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement("button", { onClick: () => setHistBand(g.band), className: "flex items-center gap-2 min-w-0 flex-1" },
                            React.createElement(Speaker, { size: 15, style: { color: T.purple } }),
                            React.createElement("span", { className: "font-bold truncate" }, g.band),
                            React.createElement(ChevronRight, { size: 13, style: { color: T.muted } })),
                        g.free > 0 && React.createElement(Pill, { color: T.gold, solid: true },
                            React.createElement(Gift, { size: 11 }),
                            " \u0E1F\u0E23\u0E35 ",
                            g.free),
                        React.createElement("button", { onClick: () => resetLoyalty(g.band, g.paidHours), "aria-label": "\u0E23\u0E35\u0E40\u0E0B\u0E47\u0E15\u0E2A\u0E30\u0E2A\u0E21", className: "w-7 h-7 rounded-lg flex items-center justify-center shrink-0", style: { color: T.cyan } },
                            React.createElement(RotateCcw, { size: 13 })),
                        delBandC === g.band ? (React.createElement("button", { onClick: () => { delBand(g.band); setDelBandC(null); setBandPage(0); }, className: "text-[10px] font-bold px-2 py-1 rounded-lg shrink-0", style: { background: T.red, color: "#fff" } }, "\u0E25\u0E1A\u0E27\u0E07?")) : (React.createElement("button", { onClick: () => setDelBandC(g.band), "aria-label": "\u0E25\u0E1A\u0E27\u0E07", className: "w-7 h-7 rounded-lg flex items-center justify-center shrink-0", style: { color: T.muted } },
                            React.createElement(Trash2, { size: 13 })))),
                    React.createElement("div", { className: "mt-2.5" },
                        React.createElement("div", { className: "flex justify-between text-[10px] mb-1" },
                            React.createElement("span", { style: { color: T.sub } },
                                "\u0E2A\u0E30\u0E2A\u0E21 ",
                                g.tally,
                                " \u0E0A\u0E21."),
                            React.createElement("span", { style: { color: T.muted } },
                                g.prog,
                                "/5 \u2192 \u0E2D\u0E35\u0E01 ",
                                5 - g.prog,
                                " \u0E1F\u0E23\u0E35 1")),
                        React.createElement("div", { className: "flex gap-1" }, Array.from({ length: 5 }).map((_, i) => React.createElement("div", { key: i, className: "flex-1 h-2 rounded-full", style: { background: i < g.prog ? T.gold : T.surf2, boxShadow: i < g.prog ? `0 0 6px ${hex(T.gold, .5)}` : "none" } })))),
                    React.createElement("div", { className: "flex items-center justify-between mt-2 text-[10px]", style: { color: T.muted } },
                        React.createElement("span", null,
                            g.sessions,
                            " \u0E04\u0E23\u0E31\u0E49\u0E07 \u00B7 \u0E08\u0E48\u0E32\u0E22\u0E04\u0E23\u0E1A ",
                            g.paidHours,
                            "/",
                            g.allHours,
                            " \u0E0A\u0E21."),
                        g.lastDate && React.createElement("span", null,
                            "\u0E25\u0E48\u0E32\u0E2A\u0E38\u0E14 ",
                            shortDate(g.lastDate)))))),
                React.createElement(Pager, { page: bandPage, setPage: setBandPage, total: groups.length }))),
            sub === "booking" && (React.createElement(React.Fragment, null,
                React.createElement("button", { onClick: () => {
                        const rows = [["วันที่", "วง/ลูกค้า", "เริ่ม", "จบ", "ชั่วโมง", "ราคา", "บัญชี", "สถานะ"]];
                        [...bookings].sort((a, b) => a.date.localeCompare(b.date)).forEach(b => rows.push([
                            b.date, b.bandName, b.startTime, b.endTime, hoursBetween(b.startTime, b.endTime), b.totalPrice,
                            accounts.find(a => a.id === b.accountId)?.name || "", b.paid ? "จ่ายแล้ว" : "ค้างจ่าย",
                        ]));
                        downloadCSV(`studio_การจอง_${TK}.csv`, rows);
                    }, className: "w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold active:scale-[.98]", style: { background: T.surf2, color: T.blue, border: `1px solid ${hex(T.blue, .5)}` } },
                    React.createElement(Download, { size: 13 }),
                    " Export \u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07 \u0E40\u0E1B\u0E47\u0E19 CSV"),
                React.createElement(Collapse, { title: "\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07", icon: History, count: bookings.length, color: T.blue, defaultOpen: true },
                    bookings.length === 0 ? React.createElement(Empty, { text: "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07" }) : (() => {
                        let lastMonth = null;
                        const out = [];
                        bookSlice.forEach(b => {
                            const dt = parseK(b.date);
                            const mk = dt.getFullYear() + "-" + dt.getMonth();
                            if (mk !== lastMonth) {
                                lastMonth = mk;
                                out.push(React.createElement("div", { key: "mh-" + mk, className: "text-[11px] font-bold px-1 pt-1 pb-0.5", style: { color: T.muted } },
                                    TH_M[dt.getMonth()],
                                    " ",
                                    dt.getFullYear() + 543));
                            }
                            const future = b.date > TK;
                            const isToday = b.date === TK;
                            const pi = payInfo(b);
                            const bkDone = b.done ?? (b.bookingStatus === "Completed");
                            const archived = bkDone && b.paid;
                            out.push(React.createElement(Glass, { key: b.id, className: "p-3", style: { opacity: archived ? 0.55 : 1 }, glowColor: !b.paid && !future ? T.orange : undefined },
                                React.createElement("div", { className: "flex items-center gap-2.5" },
                                    React.createElement("div", { className: "w-11 text-center shrink-0" },
                                        React.createElement("div", { className: "text-[9px]", style: { color: T.muted } }, TH_D[dt.getDay()]),
                                        React.createElement("div", { className: "text-base font-bold leading-none", style: { color: isToday ? T.green : T.text } }, dt.getDate()),
                                        React.createElement("div", { className: "text-[9px]", style: { color: T.muted } }, TH_M[dt.getMonth()])),
                                    React.createElement("div", { className: "flex-1 min-w-0" },
                                        React.createElement("div", { className: "flex items-center gap-1.5" },
                                            React.createElement("span", { className: "font-bold text-sm truncate" }, b.bandName),
                                            future && React.createElement(Pill, { color: T.blue }, "\u0E08\u0E30\u0E16\u0E36\u0E07")),
                                        React.createElement("div", { className: "text-[10px] mt-0.5", style: { color: T.muted } },
                                            b.startTime,
                                            "\u2013",
                                            b.endTime,
                                            " \u00B7 ",
                                            hoursBetween(b.startTime, b.endTime),
                                            "h \u00B7 ",
                                            React.createElement("span", { style: { color: pi.color } }, pi.label)),
                                        b.paid && (React.createElement("div", { className: "flex items-center gap-1 mt-1" },
                                            React.createElement("span", { className: "text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5", style: { background: hex(T.purple, .14), color: T.purple } },
                                                React.createElement(Wallet, { size: 8 }),
                                                accounts.find(a => a.id === b.accountId)?.name || "ยังไม่ระบุบัญชี"),
                                            React.createElement("button", { onClick: () => setPayBk(b), "aria-label": "\u0E41\u0E01\u0E49\u0E44\u0E02\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E23\u0E31\u0E1A\u0E40\u0E07\u0E34\u0E19", className: "w-5 h-5 rounded-md flex items-center justify-center shrink-0", style: { color: T.blue } },
                                                React.createElement(Pencil, { size: 10 }))))),
                                    React.createElement("span", { className: "text-base font-extrabold shrink-0", style: { color: T.gold } },
                                        "\u0E3F",
                                        b.totalPrice.toLocaleString())),
                                React.createElement("div", { className: "flex items-center gap-1.5 mt-2.5 pt-2.5", style: { borderTop: `1px solid ${T.border}` } },
                                    React.createElement("button", { onClick: () => toggleBookingDone(b.id), className: "flex items-center gap-1.5 flex-1 justify-center py-1.5 rounded-lg text-[11px] font-semibold", style: { background: bkDone ? hex(T.green, .16) : T.surf2, color: bkDone ? T.green : T.sub } },
                                        React.createElement("span", { className: "w-4 h-4 rounded flex items-center justify-center", style: { background: bkDone ? T.green : "transparent", border: `1.5px solid ${bkDone ? T.green : T.border}` } }, bkDone && React.createElement(Check, { size: 11, color: "#000" })),
                                        "\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08"),
                                    React.createElement("button", { onClick: () => b.paid ? togglePaid(b.id) : setPayBk(b), className: "flex items-center gap-1.5 flex-1 justify-center py-1.5 rounded-lg text-[11px] font-semibold", style: { background: b.paid ? hex(T.green, .16) : T.surf2, color: b.paid ? T.green : T.sub } },
                                        React.createElement("span", { className: "w-4 h-4 rounded flex items-center justify-center", style: { background: b.paid ? T.green : "transparent", border: `1.5px solid ${b.paid ? T.green : T.border}` } }, b.paid && React.createElement(Check, { size: 11, color: "#000" })),
                                        "\u0E08\u0E48\u0E32\u0E22\u0E41\u0E25\u0E49\u0E27"),
                                    delBookC === b.id ? (React.createElement("button", { onClick: () => { delBooking(b.id); setDelBookC(null); }, className: "text-[10px] font-bold px-2.5 py-1.5 rounded-lg", style: { background: T.red, color: "#fff" } }, "\u0E25\u0E1A?")) : (React.createElement("button", { onClick: () => setDelBookC(b.id), "aria-label": "\u0E25\u0E1A\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07", className: "w-8 h-8 rounded-lg flex items-center justify-center shrink-0", style: { color: T.muted } },
                                        React.createElement(Trash2, { size: 14 }))))));
                        });
                        return out;
                    })(),
                    React.createElement(Pager, { page: bookPage, setPage: setBookPage, total: bookings.length })))),
            sub === "finance" && (React.createElement(React.Fragment, null,
                React.createElement("button", { onClick: () => {
                        const rows = [["วันที่", "รายการ", "บัญชี", "จำนวนเงิน"]];
                        [...studioTxns].sort((a, b) => a.date.localeCompare(b.date)).forEach(t => {
                            const accNm = (id) => accounts.find(a => a.id === id)?.name || "";
                            rows.push([t.date, t.title, accNm(t.accountId), t.amount]);
                        });
                        downloadCSV(`studio_รายจ่ายห้องซ้อม_${TK}.csv`, rows);
                    }, className: "w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold active:scale-[.98]", style: { background: T.surf2, color: T.cyan, border: `1px solid ${hex(T.cyan, .5)}` } },
                    React.createElement(Download, { size: 13 }),
                    " Export \u0E23\u0E32\u0E22\u0E08\u0E48\u0E32\u0E22\u0E2B\u0E49\u0E2D\u0E07\u0E0B\u0E49\u0E2D\u0E21 \u0E40\u0E1B\u0E47\u0E19 CSV"),
                React.createElement(Collapse, { title: "\u0E23\u0E32\u0E22\u0E08\u0E48\u0E32\u0E22\u0E2B\u0E49\u0E2D\u0E07\u0E0B\u0E49\u0E2D\u0E21", icon: Wallet, count: studioTxns.length, color: T.cyan, defaultOpen: true },
                    studioTxns.length === 0 ? React.createElement(Empty, { text: "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E23\u0E32\u0E22\u0E08\u0E48\u0E32\u0E22\u0E2B\u0E49\u0E2D\u0E07\u0E0B\u0E49\u0E2D\u0E21 \u2014 \u0E40\u0E1E\u0E34\u0E48\u0E21\u0E08\u0E32\u0E01\u0E1B\u0E38\u0E48\u0E21\u0E14\u0E49\u0E32\u0E19\u0E25\u0E48\u0E32\u0E07 \u0E40\u0E0A\u0E48\u0E19 \u0E04\u0E48\u0E32\u0E0B\u0E48\u0E2D\u0E21\u0E2D\u0E38\u0E1B\u0E01\u0E23\u0E13\u0E4C" }) : txnSlice.map(t => {
                        const isTr = t.kind === "transfer";
                        const out = t.kind === "out";
                        const accName = (id) => accounts.find(a => a.id === id)?.name || "—";
                        return (React.createElement(Glass, { key: t.id, className: "p-3 flex items-center gap-3" },
                            React.createElement("div", { className: "w-11 text-center shrink-0" },
                                React.createElement("div", { className: "text-[9px]", style: { color: T.muted } }, TH_D[parseK(t.date).getDay()]),
                                React.createElement("div", { className: "text-base font-bold leading-none" }, parseK(t.date).getDate()),
                                React.createElement("div", { className: "text-[9px]", style: { color: T.muted } }, TH_M[parseK(t.date).getMonth()])),
                            React.createElement("div", { className: "flex-1 min-w-0" },
                                React.createElement("div", { className: "font-semibold text-sm truncate" }, t.title),
                                isTr ? (React.createElement("div", { className: "text-[10px] flex items-center gap-1", style: { color: T.cyan } },
                                    React.createElement(Wallet, { size: 10 }),
                                    accName(t.fromAccountId),
                                    " \u2192 ",
                                    accName(t.toAccountId))) : (React.createElement("div", { className: "text-[10px] flex items-center gap-1.5 flex-wrap", style: { color: out ? T.red : T.green } },
                                    React.createElement("span", null,
                                        out ? "รายจ่าย" : "รายรับ",
                                        " \u00B7 ",
                                        t.category || "—"),
                                    React.createElement("span", { style: { color: T.muted } },
                                        "\u00B7 ",
                                        accName(t.accountId)),
                                    t.kind === "in" && t.taxable === false && React.createElement("span", { className: "text-[9px] font-bold px-1.5 py-0.5 rounded-full", style: { background: hex(T.muted, .16), color: T.muted } }, "\u0E44\u0E21\u0E48\u0E19\u0E31\u0E1A\u0E20\u0E32\u0E29\u0E35")))),
                            React.createElement("span", { className: "font-extrabold shrink-0", style: { color: isTr ? T.cyan : out ? T.red : T.green } },
                                isTr ? "⇄" : out ? "−" : "+",
                                "\u0E3F",
                                Number(t.amount).toLocaleString()),
                            React.createElement("button", { onClick: () => delTxn(t.id), "aria-label": "\u0E25\u0E1A\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23", className: "w-7 h-7 rounded-lg flex items-center justify-center shrink-0", style: { color: T.muted } },
                                React.createElement(Trash2, { size: 13 }))));
                    }),
                    React.createElement(Pager, { page: txnPage, setPage: setTxnPage, total: studioTxns.length })))),
            payBk && React.createElement(PayMethodModal, { accounts: accounts, initial: payBk, title: "ห้องซ้อม: " + payBk.bandName, sub: shortDate(payBk.date) + " · ฿" + Number(payBk.totalPrice).toLocaleString(), onClose: () => setPayBk(null), onPick: (accId, paidDate) => { markBookingPaid(payBk.id, accId, paidDate); setPayBk(null); } }),
            open && React.createElement(BookingModal, { onClose: () => setOpen(false), onSave: (b) => { addBooking(b); setOpen(false); } }),
            txnOpen && React.createElement(TxnModal, { studioMode: true, accounts: accounts, txnCategories: txnCategories, setTxnCategories: setTxnCategories, onClose: () => setTxnOpen(false), onSave: (list) => { list.forEach(addTxn); setTxnOpen(false); } }),
            histBand && histGroup && (React.createElement(Sheet, { onClose: () => setHistBand(null), title: `ประวัติ · ${histBand}` },
                React.createElement("div", { className: "grid grid-cols-3 gap-2 mb-3" },
                    React.createElement(Stat, { label: "\u0E21\u0E32\u0E0B\u0E49\u0E2D\u0E21", value: `${histGroup.sessions} ครั้ง`, color: T.purple }),
                    React.createElement(Stat, { label: "\u0E0A\u0E21.\u0E23\u0E27\u0E21", value: `${histGroup.allHours}`, color: T.blue }),
                    React.createElement(Stat, { label: "\u0E1F\u0E23\u0E35\u0E2A\u0E30\u0E2A\u0E21", value: `${histGroup.free} ชม.`, color: T.gold })),
                React.createElement("div", { className: "space-y-2" }, histGroup.list.map(b => {
                    const dt = parseK(b.date);
                    const future = b.date > TK;
                    const pi = payInfo(b);
                    return (React.createElement(Glass, { key: b.id, className: "p-3 flex items-center gap-3", style: { opacity: future ? 0.85 : 1 } },
                        React.createElement("div", { className: "w-11 text-center shrink-0" },
                            React.createElement("div", { className: "text-[9px]", style: { color: T.muted } }, TH_D[dt.getDay()]),
                            React.createElement("div", { className: "text-base font-bold leading-none" }, dt.getDate()),
                            React.createElement("div", { className: "text-[9px]", style: { color: T.muted } }, TH_M[dt.getMonth()])),
                        React.createElement("div", { className: "flex-1 min-w-0" },
                            React.createElement("div", { className: "text-sm font-semibold" },
                                b.startTime,
                                "\u2013",
                                b.endTime,
                                " \u00B7 ",
                                hoursBetween(b.startTime, b.endTime),
                                "h \u00B7 \u0E3F",
                                b.totalPrice.toLocaleString()),
                            React.createElement("div", { className: "text-[10px]", style: { color: pi.color } },
                                future ? "จะถึง · " : "",
                                pi.label)),
                        React.createElement("button", { onClick: () => b.paid ? togglePaid(b.id) : setPayBk(b), "aria-label": "\u0E08\u0E48\u0E32\u0E22\u0E04\u0E23\u0E1A", className: "w-7 h-7 rounded-md flex items-center justify-center shrink-0 active:scale-90", style: { background: b.paid ? T.green : "transparent", border: `2px solid ${b.paid ? T.green : T.border}` } }, b.paid && React.createElement(Check, { size: 14, color: "#000" }))));
                }))))));
    }

    function BookingModal({ onClose, onSave }) {
        const [f, setF] = useState({ bandName: "", date: TK, startTime: "18:00", endTime: "20:00", ratePerHour: 250, deposit: "", paid: false, bookingStatus: "Scheduled", note: "" });
        const hrs = hoursBetween(f.startTime, f.endTime);
        const total = Math.round(hrs * f.ratePerHour);
        const dep = Number(f.deposit) || 0;
        const future = f.date > TK;
        const RATE_PRESETS = [250, 200, 400, 500];
        return (React.createElement(Sheet, { onClose: onClose, title: "\u0E08\u0E2D\u0E07\u0E2B\u0E49\u0E2D\u0E07\u0E0B\u0E49\u0E2D\u0E21" },
            React.createElement(Input, { label: "\u0E0A\u0E37\u0E48\u0E2D\u0E27\u0E07 / \u0E25\u0E39\u0E01\u0E04\u0E49\u0E32", value: f.bandName, onChange: v => setF({ ...f, bandName: v }), placeholder: "\u0E40\u0E0A\u0E48\u0E19 \u0E27\u0E07 ABC" }),
            React.createElement("div", { className: "mb-3" },
                React.createElement(Label, null,
                    "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48 ",
                    future && React.createElement("span", { style: { color: T.blue } }, "\u00B7 \u0E08\u0E2D\u0E07\u0E25\u0E48\u0E27\u0E07\u0E2B\u0E19\u0E49\u0E32")),
                React.createElement(DateInput, { value: f.date, onChange: v => setF({ ...f, date: v }) })),
            React.createElement("div", { className: "flex gap-2 mb-3" },
                React.createElement("div", { className: "flex-1" },
                    React.createElement(Label, null, "\u0E40\u0E23\u0E34\u0E48\u0E21"),
                    React.createElement(TimeInput, { value: f.startTime, onChange: v => setF({ ...f, startTime: v }) })),
                React.createElement("div", { className: "flex-1" },
                    React.createElement(Label, null, "\u0E08\u0E1A"),
                    React.createElement(TimeInput, { value: f.endTime, onChange: v => setF({ ...f, endTime: v }) }))),
            React.createElement("div", { className: "mb-1" },
                React.createElement(Label, null, "\u0E40\u0E23\u0E17 \u0E3F/\u0E0A\u0E31\u0E48\u0E27\u0E42\u0E21\u0E07")),
            React.createElement("div", { className: "flex gap-1.5 mb-2" }, RATE_PRESETS.map(r => {
                const on = Number(f.ratePerHour) === r;
                return React.createElement("button", { key: r, onClick: () => setF({ ...f, ratePerHour: r }), className: "flex-1 py-2 rounded-lg text-sm font-bold", style: { background: on ? T.purple : T.surf2, color: on ? "#fff" : T.sub, border: `1px solid ${on ? T.purple : T.border}` } }, r);
            })),
            React.createElement("div", { className: "flex gap-2" },
                React.createElement("div", { className: "flex-1" },
                    React.createElement(Input, { label: "\u0E2B\u0E23\u0E37\u0E2D\u0E1E\u0E34\u0E21\u0E1E\u0E4C\u0E40\u0E2D\u0E07 \u0E3F/\u0E0A\u0E21.", value: f.ratePerHour, onChange: v => setF({ ...f, ratePerHour: Number(v) || 0 }), type: "number" })),
                React.createElement("div", { className: "flex-1" },
                    React.createElement(Input, { label: "\u0E21\u0E31\u0E14\u0E08\u0E33 \u0E3F (optional)", value: f.deposit, onChange: v => setF({ ...f, deposit: v }), placeholder: "0", type: "number" }))),
            React.createElement(Glass, { className: "p-3 mb-3" },
                React.createElement("div", { className: "flex items-center justify-between" },
                    React.createElement("span", { className: "text-sm", style: { color: T.sub } },
                        hrs,
                        " \u0E0A\u0E21. \u00D7 \u0E3F",
                        f.ratePerHour),
                    React.createElement("span", { className: "text-xl font-extrabold", style: { color: T.gold } },
                        "\u0E3F",
                        total.toLocaleString())),
                dep > 0 && !f.paid && React.createElement("div", { className: "flex items-center justify-between mt-1.5 text-[11px]" },
                    React.createElement("span", { style: { color: T.orange } },
                        "\u0E21\u0E31\u0E14\u0E08\u0E33 \u0E3F",
                        dep.toLocaleString()),
                    React.createElement("span", { style: { color: T.muted } },
                        "\u0E04\u0E49\u0E32\u0E07 \u0E3F",
                        (total - dep).toLocaleString()))),
            React.createElement("button", { onClick: () => setF({ ...f, paid: !f.paid }), className: "w-full mb-3 p-3 rounded-xl flex items-center gap-3 active:scale-[.99]", style: { background: T.surf2, border: `1px solid ${f.paid ? T.green : T.border}` } },
                React.createElement("span", { className: "w-6 h-6 rounded-md flex items-center justify-center shrink-0", style: { background: f.paid ? T.green : "transparent", border: `2px solid ${f.paid ? T.green : T.border}` } }, f.paid && React.createElement(Check, { size: 15, color: "#000" })),
                React.createElement("span", { className: "text-sm font-semibold", style: { color: f.paid ? T.green : T.sub } }, "\u0E08\u0E48\u0E32\u0E22\u0E04\u0E23\u0E1A\u0E41\u0E25\u0E49\u0E27"),
                React.createElement("span", { className: "text-[10px] ml-auto", style: { color: T.muted } }, "\u0E15\u0E34\u0E4A\u0E01\u0E17\u0E35\u0E2B\u0E25\u0E31\u0E07\u0E01\u0E47\u0E44\u0E14\u0E49")),
            React.createElement(SaveBtn, { disabled: !f.bandName.trim(), onClick: () => onSave({ ...f, deposit: dep, totalPrice: total }) }, "\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01 + \u0E2A\u0E23\u0E49\u0E32\u0E07\u0E01\u0E34\u0E08\u0E01\u0E23\u0E23\u0E21"),
            React.createElement("div", { className: "text-[10px] text-center mt-2", style: { color: T.muted } }, "\u0E0A\u0E31\u0E48\u0E27\u0E42\u0E21\u0E07\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E30\u0E2A\u0E21 (5 \u0E1F\u0E23\u0E35 1) \u0E40\u0E09\u0E1E\u0E32\u0E30\u0E40\u0E21\u0E37\u0E48\u0E2D \u201C\u0E08\u0E48\u0E32\u0E22\u0E04\u0E23\u0E1A\u201D")));
    }
