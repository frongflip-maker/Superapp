"use strict";
    function FixedCostForm({ initial, onSave }) {
        const isEdit = !!initial.id;
        const [name, setName] = useState(initial.name || "");
        const [amount, setAmount] = useState(initial.amount || "");
        const [kind, setKind] = useState(initial.kind || "recurring");
        const [installmentTotal, setInstallmentTotal] = useState(initial.installmentTotal || 12);
        const [installmentPaid, setInstallmentPaid] = useState(initial.installmentPaid || 0);
        const valid = name.trim() && Number(amount) > 0 && (kind !== "installment" || Number(installmentTotal) > 0);
        return (React.createElement(React.Fragment, null,
            React.createElement(Input, { label: "\u0E0A\u0E37\u0E48\u0E2D\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23", value: name, onChange: setName, placeholder: "\u0E40\u0E0A\u0E48\u0E19 \u0E04\u0E48\u0E32\u0E40\u0E0A\u0E48\u0E32\u0E1A\u0E49\u0E32\u0E19, \u0E1C\u0E48\u0E2D\u0E19\u0E42\u0E17\u0E23\u0E28\u0E31\u0E1E\u0E17\u0E4C" }),
            React.createElement(Input, { label: "\u0E08\u0E33\u0E19\u0E27\u0E19\u0E40\u0E07\u0E34\u0E19 \u0E3F / \u0E40\u0E14\u0E37\u0E2D\u0E19", value: amount, onChange: setAmount, placeholder: "0", type: "number" }),
            React.createElement("div", { className: "mb-3" },
                React.createElement(Label, null, "\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17"),
                React.createElement("div", { className: "flex gap-1.5" }, [["recurring", "ทุกเดือน (ไม่มีกำหนด)"], ["installment", "ผ่อนชำระ (มีจำนวนงวด)"]].map(([k, l]) => {
                    const on = kind === k;
                    return React.createElement("button", { key: k, onClick: () => setKind(k), className: "flex-1 py-2 rounded-lg text-xs font-bold", style: { background: on ? T.orange : T.surf2, color: on ? "#000" : T.sub, border: `1px solid ${on ? T.orange : T.border}` } }, l);
                }))),
            kind === "installment" && (React.createElement("div", { className: "flex gap-2 mb-3" },
                React.createElement("div", { className: "flex-1" },
                    React.createElement(Label, null, "\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14\u0E01\u0E35\u0E48\u0E07\u0E27\u0E14"),
                    React.createElement("input", { type: "number", min: 1, value: installmentTotal, onChange: e => setInstallmentTotal(e.target.value === "" ? "" : Number(e.target.value)), onBlur: e => setInstallmentTotal(Math.max(1, Number(e.target.value) || 1)), className: "w-full px-3 py-2.5 rounded-xl text-sm outline-none", style: { background: T.surf, color: T.text, border: `1px solid ${T.border}` } })),
                React.createElement("div", { className: "flex-1" },
                    React.createElement(Label, null, "\u0E08\u0E48\u0E32\u0E22\u0E44\u0E1B\u0E41\u0E25\u0E49\u0E27\u0E01\u0E35\u0E48\u0E07\u0E27\u0E14"),
                    React.createElement("input", { type: "number", min: 0, value: installmentPaid, onChange: e => setInstallmentPaid(e.target.value === "" ? "" : Number(e.target.value)), onBlur: e => setInstallmentPaid(Math.max(0, Number(e.target.value) || 0)), className: "w-full px-3 py-2.5 rounded-xl text-sm outline-none", style: { background: T.surf, color: T.text, border: `1px solid ${T.border}` } })))),
            React.createElement(SaveBtn, { disabled: !valid, onClick: () => onSave({
                    id: initial.id || uid(), name: name.trim(), amount: Number(amount) || 0, kind,
                    installmentTotal: kind === "installment" ? Math.max(1, Number(installmentTotal) || 1) : null,
                    installmentPaid: kind === "installment" ? Math.min(Number(installmentTotal) || 1, Number(installmentPaid) || 0) : 0,
                    paidMonths: initial.paidMonths || {}, lastAccountId: initial.lastAccountId || null,
                }) }, isEdit ? "บันทึกการแก้ไข" : "เพิ่มค่าใช้จ่ายประจำ")));
    }

    function Budget(props) {
        const { events, bookings, transactions, toggleEventPaid, togglePaid, markBookingPaid, editEvent, accounts, setAccounts, txnCategories, setTxnCategories, addTxn, fixedCosts, setFixedCosts, expensePresets, setExpensePresets } = props;
        const [mode, setMode] = useState("total");
        const [mk, setMk] = useState(monthKey(TK));
        const [showDue, setShowDue] = useState(true);
        const [recvItem, setRecvItem] = useState(null);
        const [editRecv, setEditRecv] = useState(null);
        const [editAcc, setEditAcc] = useState(null);
        const [expAccFilter, setExpAccFilter] = useState("all");
        const [expTypeFilter, setExpTypeFilter] = useState("all");
        const [showAccounts, setShowAccounts] = useState(false);
        const [txFilter, setTxFilter] = useState("all");
        const [ledgerPage, setLedgerPage] = useState(0);
        const [txnOpen, setTxnOpen] = useState(false);
        const [fcModal, setFcModal] = useState(null);
        const [payFc, setPayFc] = useState(null);
        const [delFc, setDelFc] = useState(null);
        const [cfSel, setCfSel] = useState(null);
        const inScope = (dk) => mode === "total" ? true : monthKey(dk) === mk;
        const items = useMemo(() => {
            const evs = events.filter(e => Number(e.income) > 0 && e.type !== "studio")
                .map(e => ({ key: "e" + e.id, kind: "event", id: e.id, date: (e.paid && e.paidDate) ? e.paidDate : e.date, workDate: e.date, title: e.title, amount: Number(e.income), tip: Number(e.tip) || 0, accountId: e.accountId || null, tipAccountId: e.tipAccountId || e.accountId || null, category: e.category || "งานสอน", paid: !!e.paid }));
            const bks = bookings.filter(b => Number(b.totalPrice) > 0)
                .map(b => ({ key: "b" + b.id, kind: "booking", id: b.id, date: (b.paid && b.paidDate) ? b.paidDate : b.date, workDate: b.date, title: "ห้องซ้อม: " + b.bandName, amount: b.totalPrice, tip: 0, accountId: b.accountId || null, tipAccountId: null, category: "ห้องซ้อม", paid: !!b.paid }));
            const txs = transactions.filter(t => t.kind === "in")
                .map(t => ({ key: "t" + t.id, kind: "txn", id: t.id, date: t.date, workDate: t.date, title: t.title, amount: Number(t.amount || 0), tip: 0, accountId: t.accountId || null, tipAccountId: null, category: t.category || "อื่นๆ", paid: true }));
            return [...evs, ...bks, ...txs];
        }, [events, bookings, transactions]);
        const scoped = items.filter(i => inScope(i.date));
        const received = scoped.filter(i => i.paid);
        const due = items.filter(i => !i.paid).sort((a, b) => a.date.localeCompare(b.date));
        const receivedSum = received.reduce((s, i) => s + i.amount + i.tip, 0);
        const dueSum = due.reduce((s, i) => s + i.amount, 0);
        const expenseSum = transactions.filter(t => t.kind === "out" && inScope(t.date)).reduce((s, t) => s + (Number(t.amount) || 0), 0);
        const netSum = receivedSum - expenseSum;
        const sumKind = (k) => received.filter(i => i.kind === k).reduce((s, i) => s + i.amount, 0);
        const tipsSum = received.reduce((s, i) => s + i.tip, 0);
        const [payBk, setPayBk] = useState(null);
        const [payBkEdit, setPayBkEdit] = useState(null);
        const B_SUBS = ["summary", "due", "fixed", "export"];
        const [sub, setSubRaw] = useState(() => { try {
            const v = localStorage.getItem("dos_budget_sub");
            return B_SUBS.includes(v) ? v : "summary";
        }
        catch {
            return "summary";
        } });
        const setSub = (k) => { setSubRaw(k); try {
            localStorage.setItem("dos_budget_sub", k);
        }
        catch { } };
        const tickDue = (it) => { if (it.kind === "event")
            setRecvItem(it);
        else if (it.kind === "booking")
            setPayBk(it); };
        const srcTag = (k) => k === "event" ? { t: "งาน/Event", c: T.purple } : k === "booking" ? { t: "ห้องซ้อม", c: T.blue } : { t: "รายรับอื่น", c: T.cyan };
        const methodTag = (m) => m === "cash" ? { t: "เงินสด", c: T.gold } : m === "transfer" ? { t: "โอน", c: T.cyan } : null;
        return (React.createElement("div", { className: "px-4 pt-5 space-y-4" },
            React.createElement("h1", { className: "text-2xl font-extrabold" }, "Budget"),
            React.createElement("div", { className: "flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4", style: { scrollbarWidth: "none" } }, [["summary", BarChart3, "สรุป"], ["due", AlertCircle, "ค้างรับ"], ["fixed", Repeat, "ค่าใช้จ่ายประจำ"], ["export", Download, "Export"]].map(([k, Ic, l]) => {
                const on = sub === k;
                return React.createElement("button", { key: k, onClick: () => setSub(k), className: "px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 active:scale-95 flex items-center gap-1.5", style: { background: on ? T.green : T.surf, color: on ? "#000" : T.sub, border: `1px solid ${on ? T.green : T.border}` } },
                    React.createElement(Ic, { size: 13 }),
                    l);
            })),
            sub === "summary" && (React.createElement(React.Fragment, null,
                React.createElement("button", { onClick: () => setTxnOpen(true), className: "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[.98]", style: { background: T.green, color: "#000", boxShadow: glow(T.green) } },
                    React.createElement(Plus, { size: 17 }),
                    " \u0E40\u0E1E\u0E34\u0E48\u0E21\u0E23\u0E32\u0E22\u0E23\u0E31\u0E1A-\u0E23\u0E32\u0E22\u0E08\u0E48\u0E32\u0E22"),
                (() => {
                    const balanceOf = (accId) => {
                        let bal = accounts.find(a => a.id === accId)?.startBalance || 0;
                        events.filter(e => e.paid && e.accountId === accId).forEach(e => bal += Number(e.income) || 0);
                        events.filter(e => e.paid && e.tipAccountId === accId).forEach(e => bal += Number(e.tip) || 0);
                        bookings.filter(b => b.paid && b.accountId === accId).forEach(b => bal += Number(b.totalPrice) || 0);
                        transactions.forEach(t => {
                            if (t.kind === "in" && t.accountId === accId)
                                bal += Number(t.amount) || 0;
                            else if (t.kind === "out" && t.accountId === accId)
                                bal -= Number(t.amount) || 0;
                            else if (t.kind === "transfer") {
                                if (t.fromAccountId === accId)
                                    bal -= Number(t.amount) || 0;
                                if (t.toAccountId === accId)
                                    bal += Number(t.amount) || 0;
                            }
                        });
                        return bal;
                    };
                    const totalAll = accounts.reduce((s, a) => s + balanceOf(a.id), 0);
                    return (React.createElement(React.Fragment, null,
                        React.createElement(Glass, { className: "p-0 overflow-hidden", glowColor: T.purple },
                            React.createElement("button", { onClick: () => setShowAccounts(s => !s), className: "w-full flex items-center justify-between p-4 active:scale-[.99]" },
                                React.createElement("div", { className: "text-left" },
                                    React.createElement("div", { className: "text-[11px]", style: { color: T.muted } }, "\u0E22\u0E2D\u0E14\u0E23\u0E27\u0E21\u0E17\u0E38\u0E01\u0E1A\u0E31\u0E0D\u0E0A\u0E35"),
                                    React.createElement("div", { className: "text-3xl font-extrabold", style: { color: totalAll >= 0 ? T.purple : T.red } }, fmtBaht(totalAll))),
                                React.createElement("div", { className: "flex items-center gap-1.5 shrink-0", style: { color: T.muted } },
                                    React.createElement("span", { className: "text-[11px] font-semibold" },
                                        accounts.length,
                                        " \u0E1A\u0E31\u0E0D\u0E0A\u0E35"),
                                    React.createElement(ChevronDown, { size: 18, style: { transform: showAccounts ? "rotate(180deg)" : "none", transition: "transform .2s" } }))),
                            showAccounts && (React.createElement("div", { className: "px-4 pb-4", style: { borderTop: `1px solid ${T.border}` } },
                                accounts.length === 0 ? React.createElement(Empty, { text: "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E1A\u0E31\u0E0D\u0E0A\u0E35 \u2014 \u0E40\u0E1E\u0E34\u0E48\u0E21\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E41\u0E23\u0E01\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13" }) : (React.createElement("div", { className: "mt-1" }, accounts.map((a, i) => {
                                    const bal = balanceOf(a.id);
                                    return (React.createElement("div", { key: a.id, className: "flex items-center gap-3 py-3", style: { borderTop: i > 0 ? `1px solid ${T.border}` : "none" } },
                                        React.createElement("div", { className: "w-9 h-9 rounded-xl flex items-center justify-center shrink-0", style: { background: hex(T.purple, .16) } },
                                            React.createElement(Wallet, { size: 15, style: { color: T.purple } })),
                                        React.createElement("div", { className: "flex-1 min-w-0" },
                                            React.createElement("div", { className: "font-bold text-sm truncate" }, a.name),
                                            React.createElement("div", { className: "text-[10px]", style: { color: T.muted } },
                                                "\u0E40\u0E23\u0E34\u0E48\u0E21\u0E15\u0E49\u0E19 \u0E3F",
                                                Number(a.startBalance || 0).toLocaleString())),
                                        React.createElement("span", { className: "text-base font-extrabold shrink-0", style: { color: bal >= 0 ? T.text : T.red } }, fmtBaht(bal)),
                                        React.createElement("button", { onClick: () => setEditAcc(a), "aria-label": "\u0E41\u0E01\u0E49\u0E44\u0E02\u0E1A\u0E31\u0E0D\u0E0A\u0E35", className: "w-8 h-8 rounded-lg flex items-center justify-center shrink-0", style: { color: T.blue } },
                                            React.createElement(Pencil, { size: 14 }))));
                                }))),
                                React.createElement("button", { onClick: () => setEditAcc({ id: null, name: "", startBalance: 0 }), className: "w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[.98] mt-2", style: { background: T.surf2, color: T.purple, border: `1px dashed ${hex(T.purple, .5)}` } },
                                    React.createElement(Plus, { size: 15 }),
                                    " \u0E40\u0E1E\u0E34\u0E48\u0E21\u0E1A\u0E31\u0E0D\u0E0A\u0E35"))))));
                })(),
                React.createElement(Glass, { className: "p-4", glowColor: T.green },
                    React.createElement("div", { className: "flex items-center gap-1 p-1 rounded-xl mb-3", style: { background: T.surf2 } }, [["total", "รวมทั้งหมด"], ["month", "รายเดือน"]].map(([k, l]) => {
                        const on = mode === k;
                        return React.createElement("button", { key: k, onClick: () => setMode(k), className: "flex-1 py-1.5 rounded-lg text-xs font-bold", style: { background: on ? T.green : "transparent", color: on ? "#000" : T.sub } }, l);
                    })),
                    mode === "month" && (React.createElement("div", { className: "flex items-center justify-between mb-3" },
                        React.createElement("button", { onClick: () => setMk(m => addMonthKey(m, -1)), className: "w-8 h-8 rounded-lg flex items-center justify-center", style: { background: T.surf2 } },
                            React.createElement(ChevronLeft, { size: 16 })),
                        React.createElement("span", { className: "text-sm font-bold" }, monthLabel(mk)),
                        React.createElement("button", { onClick: () => setMk(m => addMonthKey(m, 1)), className: "w-8 h-8 rounded-lg flex items-center justify-center", style: { background: T.surf2 } },
                            React.createElement(ChevronRight, { size: 16 })))),
                    React.createElement("div", { className: "grid grid-cols-3 gap-2 mb-3" }, [["\u0E23\u0E32\u0E22\u0E23\u0E31\u0E1A", receivedSum, T.green, TrendingUp], ["\u0E23\u0E32\u0E22\u0E08\u0E48\u0E32\u0E22", expenseSum, T.red, TrendingDown], ["\u0E04\u0E07\u0E40\u0E2B\u0E25\u0E37\u0E2D\u0E2A\u0E38\u0E17\u0E18\u0E34", netSum, netSum >= 0 ? T.green : T.red, Wallet]].map(([lab, val, c, Ic]) => (React.createElement("div", { key: lab, className: "p-2.5 rounded-xl", style: { background: T.surf2, border: `1px solid ${T.border}` } },
                        React.createElement("div", { className: "flex items-center gap-1 mb-1", style: { color: c } },
                            React.createElement(Ic, { size: 12 }),
                            React.createElement("span", { className: "text-[10px] font-semibold" }, lab)),
                        React.createElement("div", { className: "text-sm font-extrabold", style: { color: c } },
                            val < 0 ? "−" : "",
                            fmtBaht(Math.abs(val)))))))),
                    (() => {
                        const hasData = receivedSum > 0 || expenseSum > 0;
                        const ratio = receivedSum > 0 ? Math.round((expenseSum / receivedSum) * 100) : (expenseSum > 0 ? Infinity : 0);
                        const barPct = Math.min(100, ratio === Infinity ? 100 : ratio);
                        const tier = ratio <= 30 ? { c: T.green, msg: "\uD83C\uDF89 \u0E22\u0E2D\u0E14\u0E40\u0E22\u0E35\u0E48\u0E22\u0E21! \u0E04\u0E38\u0E21\u0E23\u0E32\u0E22\u0E08\u0E48\u0E32\u0E22\u0E44\u0E14\u0E49\u0E14\u0E35\u0E40\u0E22\u0E35\u0E48\u0E22\u0E21" }
                            : ratio <= 70 ? { c: T.green, msg: "\uD83D\uDC4D \u0E23\u0E30\u0E14\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49\u0E08\u0E48\u0E32\u0E22\u0E1B\u0E01\u0E15\u0E34\u0E41\u0E25\u0E30\u0E1B\u0E25\u0E2D\u0E14\u0E20\u0E31\u0E22" }
                                : ratio <= 100 ? { c: T.gold, msg: "\u26A0\uFE0F \u0E40\u0E23\u0E34\u0E48\u0E21\u0E15\u0E36\u0E07\u0E21\u0E37\u0E2D! \u0E23\u0E32\u0E22\u0E08\u0E48\u0E32\u0E22\u0E04\u0E48\u0E2D\u0E19\u0E02\u0E49\u0E32\u0E07\u0E2A\u0E39\u0E07\u0E40\u0E01\u0E37\u0E2D\u0E1A\u0E40\u0E17\u0E48\u0E32\u0E23\u0E32\u0E22\u0E23\u0E31\u0E1A" }
                                    : { c: T.red, msg: "\uD83D\uDEA8 \u0E23\u0E32\u0E22\u0E08\u0E48\u0E32\u0E22\u0E23\u0E27\u0E21\u0E2A\u0E38\u0E17\u0E18\u0E34\u0E2A\u0E39\u0E07\u0E01\u0E27\u0E48\u0E32\u0E23\u0E32\u0E22\u0E23\u0E31\u0E1A\u0E41\u0E25\u0E49\u0E27" };
                        return (React.createElement("div", { className: "p-3 rounded-xl", style: { background: T.surf2, border: `1px solid ${T.border}` } },
                            React.createElement("div", { className: "flex items-center justify-between mb-1.5" },
                                React.createElement("span", { className: "text-xs font-bold" }, "\u0E2A\u0E31\u0E14\u0E2A\u0E48\u0E27\u0E19\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49\u0E08\u0E48\u0E32\u0E22 (Spend Ratio)"),
                                React.createElement("span", { className: "text-xs font-extrabold", style: { color: hasData ? tier.c : T.muted } }, ratio === Infinity ? "\u2014" : `${ratio}%`, " \u0E02\u0E2D\u0E07\u0E23\u0E32\u0E22\u0E23\u0E31\u0E1A")),
                            React.createElement("div", { className: "h-1.5 rounded-full overflow-hidden", style: { background: T.border } },
                                React.createElement("div", { style: { width: `${barPct}%`, height: "100%", background: hasData ? tier.c : T.border } })),
                            React.createElement("div", { className: "text-[10px] mt-1.5", style: { color: hasData ? tier.c : T.muted } }, hasData ? tier.msg : "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E01\u0E32\u0E23\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E23\u0E32\u0E22\u0E08\u0E48\u0E32\u0E22\u0E43\u0E19\u0E01\u0E25\u0E38\u0E48\u0E21\u0E19\u0E35\u0E49")));
                    })(),
                    React.createElement("div", { className: "flex items-center justify-between mt-3 pt-3 mb-1.5", style: { borderTop: `1px solid ${hex(T.border, .7)}` } },
                        React.createElement("span", { className: "text-xs font-bold" }, "\u0E22\u0E2D\u0E14\u0E41\u0E22\u0E01\u0E15\u0E32\u0E21\u0E2B\u0E21\u0E27\u0E14\u0E23\u0E32\u0E22\u0E23\u0E31\u0E1A"),
                        React.createElement("span", { className: "text-[11px] font-bold", style: { color: dueSum > 0 ? T.orange : T.muted } },
                            "\u0E04\u0E49\u0E32\u0E07\u0E23\u0E31\u0E1A\u0E23\u0E27\u0E21 ",
                            fmtBaht(dueSum))),
                    React.createElement("div", { className: "grid grid-cols-2 gap-1.5" }, [["งาน/Event", sumKind("event"), T.purple], ["ห้องซ้อม", sumKind("booking"), T.blue], ["รายรับอื่น", sumKind("txn"), T.cyan], ["Tips", tipsSum, T.gold]].map(([l, v, c]) => (React.createElement("div", { key: l, className: "flex items-center justify-between px-2.5 py-2 rounded-lg", style: { background: T.surf2 } },
                        React.createElement("span", { className: "text-[10px] font-semibold", style: { color: T.sub } }, l),
                        React.createElement("span", { className: "text-xs font-extrabold", style: { color: v > 0 ? c : T.muted } },
                            "\u0E3F",
                            Number(v).toLocaleString()))))),
                (() => {
                    const cfMonths = Array.from({ length: 6 }, (_, i) => addMonthKey(monthKey(TK), i - 5));
                    const cfData = cfMonths.map(mk2 => {
                        const inc = items.filter(it => it.paid && monthKey(it.date) === mk2).reduce((s, it) => s + it.amount + it.tip, 0);
                        const exp = transactions.filter(t => t.kind === "out" && monthKey(t.date) === mk2).reduce((s, t) => s + (Number(t.amount) || 0), 0);
                        return { mk: mk2, inc, exp, net: inc - exp };
                    });
                    const maxVal = Math.max(1, ...cfData.map(x => Math.max(x.inc, x.exp)));
                    const anyData = cfData.some(x => x.inc !== 0 || x.exp !== 0);
                    const selMk = cfSel && cfMonths.includes(cfSel) ? cfSel : cfMonths[cfMonths.length - 1];
                    const selData = cfData.find(x => x.mk === selMk);
                    return (React.createElement(Glass, { className: "p-4" },
                        React.createElement("div", { className: "flex items-center justify-between mb-1" },
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement(BarChart3, { size: 15, style: { color: T.blue } }),
                                React.createElement("span", { className: "font-bold text-sm" }, "\u0E1B\u0E23\u0E30\u0E27\u0E31\u0E15\u0E34\u0E01\u0E23\u0E30\u0E41\u0E2A\u0E40\u0E07\u0E34\u0E19\u0E2A\u0E14 (\u0E22\u0E49\u0E2D\u0E19\u0E2B\u0E25\u0E31\u0E07 6 \u0E40\u0E14\u0E37\u0E2D\u0E19)")),
                            React.createElement("span", { className: "text-[9px] flex items-center gap-1.5", style: { color: T.muted } },
                                React.createElement("span", { style: { color: T.green } }, "\u25A0"),
                                " \u0E23\u0E32\u0E22\u0E23\u0E31\u0E1A \u00B7 ",
                                React.createElement("span", { style: { color: T.red } }, "\u25A0"),
                                " \u0E23\u0E32\u0E22\u0E08\u0E48\u0E32\u0E22")),
                        anyData ? (React.createElement("div", { className: "flex items-end justify-between gap-1.5 mt-2", style: { height: 90 } }, cfData.map((x, i) => {
                            const on = x.mk === selMk;
                            return (React.createElement("button", { key: i, onClick: () => setCfSel(x.mk), className: "flex-1 flex flex-col items-center gap-1 h-full justify-end active:scale-95" },
                                React.createElement("div", { className: "w-full h-full flex items-end justify-center gap-[2px]" },
                                    React.createElement("div", { className: "rounded-t-md", style: { width: "42%", height: `${x.inc ? Math.max(6, (x.inc / maxVal) * 100) : 3}%`, background: T.green, opacity: on ? 1 : .45, boxShadow: on && x.inc ? `0 0 6px ${hex(T.green, .6)}` : "none" } }),
                                    React.createElement("div", { className: "rounded-t-md", style: { width: "42%", height: `${x.exp ? Math.max(6, (x.exp / maxVal) * 100) : 3}%`, background: T.red, opacity: on ? 1 : .45, boxShadow: on && x.exp ? `0 0 6px ${hex(T.red, .6)}` : "none" } })),
                                React.createElement("span", { className: "text-[9px] font-bold", style: { color: on ? T.text : T.muted } }, monthLabel(x.mk).split(" ")[0])));
                        }))) : (React.createElement("div", { className: "h-[90px] flex items-center justify-center text-[11px]", style: { color: T.muted } }, "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E22\u0E49\u0E2D\u0E19\u0E2B\u0E25\u0E31\u0E07")),
                        selData && (React.createElement("div", { className: "flex items-center justify-between mt-3 pt-2.5 px-1", style: { borderTop: `1px solid ${hex(T.border, .7)}` } },
                            React.createElement("span", { className: "text-[11px] font-bold", style: { color: T.sub } }, monthLabel(selMk)),
                            React.createElement("div", { className: "flex items-center gap-2.5 text-[11px]" },
                                React.createElement("span", { style: { color: T.green } },
                                    "\u0E23\u0E31\u0E1A ",
                                    fmtBaht(selData.inc)),
                                React.createElement("span", { style: { color: T.red } },
                                    "\u0E08\u0E48\u0E32\u0E22 ",
                                    fmtBaht(selData.exp)),
                                React.createElement("span", { className: "font-bold", style: { color: selData.net >= 0 ? T.green : T.red } },
                                    selData.net >= 0 ? "+" : "\u2212",
                                    fmtBaht(Math.abs(selData.net))))))));
                })(),
                (() => {

                    return (React.createElement(React.Fragment, null,
                        (() => {
                            const accName = (id) => accounts.find(a => a.id === id)?.name || "—";
                            let ledger = [];
                            events.filter(e => e.paid).forEach(e => {
                                const ed = e.paidDate || e.date;
                                if (e.tip > 0 && e.tipCombined) {
                                    ledger.push({ id: "e" + e.id, date: ed, title: e.title + " (รวมทิป)", amount: (Number(e.income) || 0) + (Number(e.tip) || 0), dir: "in", accountId: e.accountId, tag: e.category || "งานสอน", tagC: T.purple, kind: "event", raw: e });
                                }
                                else {
                                    ledger.push({ id: "e" + e.id, date: ed, title: e.title, amount: Number(e.income) || 0, dir: "in", accountId: e.accountId, tag: e.category || "งานสอน", tagC: T.purple, kind: "event", raw: e });
                                    if (e.tip > 0 && e.tipAccountId)
                                        ledger.push({ id: "et" + e.id, date: ed, title: e.title + " (Tips)", amount: Number(e.tip) || 0, dir: "in", accountId: e.tipAccountId, tag: "Tips", tagC: T.gold, kind: "event", raw: e });
                                }
                            });
                            bookings.filter(b => b.paid).forEach(b => ledger.push({ id: "b" + b.id, date: b.paidDate || b.date, title: "ห้องซ้อม: " + b.bandName, amount: Number(b.totalPrice) || 0, dir: "in", accountId: b.accountId, tag: "ห้องซ้อม", tagC: T.blue, kind: "booking", raw: b }));
                            transactions.forEach(t => {
                                if (t.kind === "transfer") {
                                    ledger.push({ id: "tf-out" + t.id, date: t.date, title: t.title + " → " + accName(t.toAccountId), amount: Number(t.amount) || 0, dir: "out", accountId: t.fromAccountId, tag: "โอนย้าย", tagC: T.cyan });
                                    ledger.push({ id: "tf-in" + t.id, date: t.date, title: t.title + " ← " + accName(t.fromAccountId), amount: Number(t.amount) || 0, dir: "in", accountId: t.toAccountId, tag: "โอนย้าย", tagC: T.cyan });
                                }
                                else {
                                    ledger.push({ id: "t" + t.id, date: t.date, title: t.title, amount: Number(t.amount) || 0, dir: t.kind, accountId: t.accountId, tag: t.category || "อื่นๆ", tagC: t.kind === "in" ? T.green : T.red });
                                }
                            });
                            const filtered = txFilter === "all" ? ledger : ledger.filter(l => l.accountId === txFilter);
                            const sorted = filtered.sort((a, b) => b.date.localeCompare(a.date));
                            const slice = sorted.slice(ledgerPage * PER_PAGE, (ledgerPage + 1) * PER_PAGE);
                            return (React.createElement(Glass, { className: "p-4" },
                                React.createElement("div", { className: "flex items-center gap-2 mb-3" },
                                    React.createElement(History, { size: 15, style: { color: T.sub } }),
                                    React.createElement("span", { className: "font-bold text-sm" }, "\u0E18\u0E38\u0E23\u0E01\u0E23\u0E23\u0E21\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14")),
                                React.createElement("div", { className: "flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1", style: { scrollbarWidth: "none" } },
                                    React.createElement("button", { onClick: () => { setTxFilter("all"); setLedgerPage(0); }, className: "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0", style: { background: txFilter === "all" ? T.purple : T.surf2, color: txFilter === "all" ? "#fff" : T.sub, border: `1px solid ${txFilter === "all" ? T.purple : T.border}` } }, "\u0E17\u0E38\u0E01\u0E1A\u0E31\u0E0D\u0E0A\u0E35"),
                                    accounts.map(a => (React.createElement("button", { key: a.id, onClick: () => { setTxFilter(a.id); setLedgerPage(0); }, className: "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0", style: { background: txFilter === a.id ? T.purple : T.surf2, color: txFilter === a.id ? "#fff" : T.sub, border: `1px solid ${txFilter === a.id ? T.purple : T.border}` } }, a.name)))),
                                slice.length === 0 ? React.createElement(Empty, { text: "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E18\u0E38\u0E23\u0E01\u0E23\u0E23\u0E21" }) : (React.createElement("div", { className: "space-y-1.5 mt-1" }, slice.map(l => {
                                    const dt = parseK(l.date);
                                    return (React.createElement("div", { key: l.id, className: "flex items-center gap-2.5 py-1.5" },
                                        React.createElement("div", { className: "w-9 text-center shrink-0" },
                                            React.createElement("div", { className: "text-sm font-bold leading-none" }, dt.getDate()),
                                            React.createElement("div", { className: "text-[8px]", style: { color: T.muted } }, TH_M[dt.getMonth()])),
                                        React.createElement("div", { className: "flex-1 min-w-0" },
                                            React.createElement("div", { className: "text-xs font-semibold truncate" }, l.title),
                                            React.createElement("div", { className: "flex items-center gap-1 mt-0.5" },
                                                React.createElement("span", { className: "text-[9px] font-bold px-1.5 py-0.5 rounded-full", style: { background: hex(l.tagC, .16), color: l.tagC } }, l.tag),
                                                txFilter === "all" && React.createElement("span", { className: "text-[9px]", style: { color: T.muted } }, accName(l.accountId)))),
                                        React.createElement("span", { className: "text-sm font-extrabold shrink-0", style: { color: l.dir === "in" ? T.green : T.red } },
                                            l.dir === "in" ? "+" : "−",
                                            "\u0E3F",
                                            l.amount.toLocaleString()),
                                        l.kind === "event" && React.createElement("button", { onClick: () => setEditRecv(l.raw), "aria-label": "\u0E41\u0E01\u0E49\u0E44\u0E02\u0E01\u0E32\u0E23\u0E23\u0E31\u0E1A\u0E40\u0E07\u0E34\u0E19", className: "w-7 h-7 rounded-lg flex items-center justify-center shrink-0", style: { color: T.blue } },
                                            React.createElement(Pencil, { size: 12 })),
                                        l.kind === "booking" && React.createElement("button", { onClick: () => setPayBkEdit(l.raw), "aria-label": "\u0E41\u0E01\u0E49\u0E44\u0E02\u0E01\u0E32\u0E23\u0E23\u0E31\u0E1A\u0E40\u0E07\u0E34\u0E19", className: "w-7 h-7 rounded-lg flex items-center justify-center shrink-0", style: { color: T.blue } },
                                            React.createElement(Pencil, { size: 12 }))));
                                }))),
                                sorted.length > 0 && React.createElement(Pager, { page: ledgerPage, setPage: setLedgerPage, total: sorted.length })));
                        })(),
                        React.createElement(Glass, { className: "p-4", glowColor: T.gold },
                            React.createElement("div", { className: "flex items-center gap-2 mb-2" },
                                React.createElement(TrendingUp, { size: 15, style: { color: T.gold } }),
                                React.createElement("span", { className: "font-bold text-sm" },
                                    "\u0E2A\u0E23\u0E38\u0E1B\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E20\u0E32\u0E29\u0E35 \u00B7 \u0E1B\u0E35 ",
                                    parseK(TK).getFullYear() + 543)),
                            (() => {
                                const yr = String(parseK(TK).getFullYear());
                                const inYear = (d) => d && d.slice(0, 4) === yr;
                                const byCat = {};
                                events.filter(e => e.paid && inYear(e.paidDate || e.date) && e.type !== "studio").forEach(e => { const c = e.category || "งานสอน"; byCat[c] = (byCat[c] || 0) + (Number(e.income) || 0); });
                                bookings.filter(b => b.paid && inYear(b.paidDate || b.date)).forEach(b => { byCat["ห้องซ้อม"] = (byCat["ห้องซ้อม"] || 0) + (Number(b.totalPrice) || 0); });
                                transactions.filter(t => t.kind === "in" && t.taxable !== false && inYear(t.date)).forEach(t => { const c = t.category || "อื่นๆ"; byCat[c] = (byCat[c] || 0) + (Number(t.amount) || 0); });
                                const entries = Object.entries(byCat);
                                const total = entries.reduce((s, [, v]) => s + v, 0);
                                return entries.length === 0 ? React.createElement(Empty, { text: "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E23\u0E32\u0E22\u0E23\u0E31\u0E1A\u0E1B\u0E35\u0E19\u0E35\u0E49" }) : (React.createElement(React.Fragment, null,
                                    React.createElement("div", { className: "space-y-1.5 mb-2" }, entries.map(([c, v]) => (React.createElement("div", { key: c, className: "flex items-center justify-between text-xs" },
                                        React.createElement("span", { style: { color: T.sub } }, c),
                                        React.createElement("span", { className: "font-bold", style: { color: T.text } },
                                            "\u0E3F",
                                            v.toLocaleString()))))),
                                    React.createElement("div", { className: "flex items-center justify-between pt-2", style: { borderTop: `1px solid ${T.border}` } },
                                        React.createElement("span", { className: "text-sm font-bold" }, "\u0E23\u0E27\u0E21\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49\u0E17\u0E31\u0E49\u0E07\u0E1B\u0E35"),
                                        React.createElement("span", { className: "text-lg font-extrabold", style: { color: T.gold } },
                                            "\u0E3F",
                                            total.toLocaleString()))));
                            })(),
                            React.createElement("div", { className: "text-[10px] mt-2", style: { color: T.muted } }, "* \u0E22\u0E2D\u0E14\u0E19\u0E35\u0E49\u0E44\u0E21\u0E48\u0E23\u0E27\u0E21\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E42\u0E2D\u0E19\u0E22\u0E49\u0E32\u0E22\u0E1A\u0E31\u0E0D\u0E0A\u0E35 \u2014 \u0E40\u0E1B\u0E47\u0E19\u0E10\u0E32\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E23\u0E30\u0E1A\u0E1A\u0E04\u0E33\u0E19\u0E27\u0E13\u0E20\u0E32\u0E29\u0E35\u0E17\u0E35\u0E48\u0E08\u0E30\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E43\u0E19\u0E2D\u0E19\u0E32\u0E04\u0E15 \u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E22\u0E2D\u0E14\u0E20\u0E32\u0E29\u0E35\u0E17\u0E35\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E08\u0E48\u0E32\u0E22\u0E08\u0E23\u0E34\u0E07"))));
                })())),
            sub === "due" && (React.createElement(React.Fragment, null,
                React.createElement("button", { onClick: () => {
                        const rows = [["วันที่", "ประเภท", "รายการ", "จำนวนเงิน"]];
                        due.forEach(i => rows.push([i.date, srcTag(i.kind).t, i.title, i.amount]));
                        downloadCSV(`budget_ค้างรับ_${TK}.csv`, rows);
                    }, className: "w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold active:scale-[.98]", style: { background: T.surf2, color: T.orange, border: `1px solid ${hex(T.orange, .5)}` } },
                    React.createElement(Download, { size: 13 }),
                    " Export \u0E04\u0E49\u0E32\u0E07\u0E23\u0E31\u0E1A \u0E40\u0E1B\u0E47\u0E19 CSV"),
                React.createElement("button", { onClick: () => setShowDue(s => !s), className: "w-full flex items-center gap-2 p-3 rounded-xl active:scale-[.99]", style: { background: T.surf, border: `1px solid ${due.length ? hex(T.orange, .5) : T.border}` } },
                    React.createElement(AlertCircle, { size: 16, style: { color: due.length ? T.orange : T.muted } }),
                    React.createElement("span", { className: "font-bold text-sm" }, "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E04\u0E49\u0E32\u0E07\u0E08\u0E48\u0E32\u0E22"),
                    React.createElement("span", { className: "text-[11px] font-bold px-2 py-0.5 rounded-full", style: { background: hex(T.orange, .16), color: T.orange } },
                        due.length,
                        " \u00B7 \u0E3F",
                        dueSum.toLocaleString()),
                    React.createElement(ChevronDown, { size: 16, style: { color: T.muted, marginLeft: "auto", transform: showDue ? "rotate(180deg)" : "none", transition: "transform .2s" } })),
                showDue && (React.createElement("div", { className: "space-y-2" }, due.length === 0 ? React.createElement(Empty, { text: "\u0E44\u0E21\u0E48\u0E21\u0E35\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E04\u0E49\u0E32\u0E07 \u2014 \u0E40\u0E01\u0E47\u0E1A\u0E40\u0E07\u0E34\u0E19\u0E04\u0E23\u0E1A\u0E17\u0E38\u0E01\u0E07\u0E32\u0E19 \uD83C\uDF89" }) : due.map(it => {
                    const dt = parseK(it.date);
                    const tag = srcTag(it.kind);
                    const overdue = it.date < TK;
                    return (React.createElement(Glass, { key: it.key, className: "p-3 flex items-center gap-3", glowColor: overdue ? T.orange : undefined },
                        React.createElement("div", { className: "w-11 text-center shrink-0" },
                            React.createElement("div", { className: "text-[9px]", style: { color: T.muted } }, TH_D[dt.getDay()]),
                            React.createElement("div", { className: "text-base font-bold leading-none", style: { color: overdue ? T.orange : T.text } }, dt.getDate()),
                            React.createElement("div", { className: "text-[9px]", style: { color: T.muted } }, TH_M[dt.getMonth()])),
                        React.createElement("div", { className: "flex-1 min-w-0" },
                            React.createElement("div", { className: "font-semibold text-sm truncate" }, it.title),
                            React.createElement("div", { className: "flex items-center gap-1.5 mt-0.5" },
                                React.createElement("span", { className: "text-[9px] font-bold px-1.5 py-0.5 rounded-full", style: { background: hex(tag.c, .16), color: tag.c } }, tag.t),
                                overdue && React.createElement("span", { className: "text-[9px]", style: { color: T.orange } }, "\u0E40\u0E25\u0E22\u0E01\u0E33\u0E2B\u0E19\u0E14"))),
                        React.createElement("span", { className: "font-extrabold shrink-0", style: { color: T.gold } },
                            "\u0E3F",
                            it.amount.toLocaleString()),
                        it.kind !== "txn" && (React.createElement("div", { className: "flex flex-col items-center gap-0.5 shrink-0" },
                            React.createElement("button", { onClick: () => tickDue(it), "aria-label": "\u0E15\u0E34\u0E4A\u0E01\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E23\u0E31\u0E1A\u0E40\u0E07\u0E34\u0E19", className: "w-7 h-7 rounded-md flex items-center justify-center active:scale-90", style: { background: "transparent", border: `2px solid ${hex(T.green, .6)}` } }),
                            React.createElement("span", { className: "text-[8px]", style: { color: T.muted } }, "\u0E23\u0E31\u0E1A\u0E40\u0E07\u0E34\u0E19")))));
                }))))),
            sub === "fixed" && (React.createElement(React.Fragment, null, (() => {
                const mk = monthKey(TK);
                const active = (fixedCosts || []).filter(fc => fc.kind !== "installment" || (fc.installmentPaid || 0) < fc.installmentTotal);
                const done = (fixedCosts || []).filter(fc => fc.kind === "installment" && (fc.installmentPaid || 0) >= fc.installmentTotal);
                const monthlyTotal = active.reduce((s, fc) => s + Number(fc.amount || 0), 0);
                const paidThisMonth = active.filter(fc => fc.paidMonths?.[mk]).reduce((s, fc) => s + Number(fc.amount || 0), 0);
                return (React.createElement(React.Fragment, null,
                    React.createElement(Glass, { className: "p-4", glowColor: T.orange },
                        React.createElement("div", { className: "text-[11px]", style: { color: T.muted } }, "\u0E23\u0E27\u0E21\u0E04\u0E48\u0E32\u0E43\u0E0A\u0E49\u0E08\u0E48\u0E32\u0E22\u0E1B\u0E23\u0E30\u0E08\u0E33 / \u0E40\u0E14\u0E37\u0E2D\u0E19"),
                        React.createElement("div", { className: "text-2xl font-extrabold", style: { color: T.orange } }, fmtBaht(monthlyTotal)),
                        (() => {
                            const pct = monthlyTotal > 0 ? Math.min(100, Math.round((paidThisMonth / monthlyTotal) * 100)) : 0;
                            const allPaid = monthlyTotal > 0 && paidThisMonth >= monthlyTotal;
                            return (React.createElement("div", { className: "mt-2.5" },
                                React.createElement("div", { className: "flex items-center justify-between mb-1" },
                                    React.createElement("span", { className: "text-[11px]", style: { color: T.muted } },
                                        "\u0E08\u0E48\u0E32\u0E22\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E19\u0E35\u0E49\u0E41\u0E25\u0E49\u0E27 ",
                                        fmtBaht(paidThisMonth),
                                        " / ",
                                        fmtBaht(monthlyTotal)),
                                    React.createElement("span", { className: "text-[11px] font-extrabold", style: { color: allPaid ? T.green : T.orange } }, pct, "%")),
                                React.createElement("div", { className: "h-1.5 rounded-full overflow-hidden", style: { background: T.border } },
                                    React.createElement("div", { style: { width: `${pct}%`, height: "100%", background: allPaid ? T.green : T.orange } })),
                                React.createElement("div", { className: "text-[10px] mt-1.5 font-semibold", style: { color: allPaid ? T.green : T.muted } }, monthlyTotal === 0 ? "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E04\u0E48\u0E32\u0E43\u0E0A\u0E49\u0E08\u0E48\u0E32\u0E22\u0E1B\u0E23\u0E30\u0E08\u0E33" : allPaid ? "\uD83C\uDF89 \u0E08\u0E48\u0E32\u0E22\u0E04\u0E23\u0E1A\u0E17\u0E38\u0E01\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E19\u0E35\u0E49\u0E41\u0E25\u0E49\u0E27 \u0E40\u0E22\u0E35\u0E48\u0E22\u0E21\u0E21\u0E32\u0E01!" : `\u0E40\u0E2B\u0E25\u0E37\u0E2D\u0E2D\u0E35\u0E01 ${fmtBaht(monthlyTotal - paidThisMonth)} \u0E17\u0E35\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E08\u0E48\u0E32\u0E22\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E19\u0E35\u0E49`)));
                        })()),
                    React.createElement("div", { className: "space-y-2" },
                        active.length === 0 && React.createElement(Empty, { text: "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E04\u0E48\u0E32\u0E43\u0E0A\u0E49\u0E08\u0E48\u0E32\u0E22\u0E1B\u0E23\u0E30\u0E08\u0E33 \u2014 \u0E40\u0E1E\u0E34\u0E48\u0E21\u0E04\u0E48\u0E32\u0E40\u0E0A\u0E48\u0E32 \u0E04\u0E48\u0E32\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E2A\u0E21\u0E32\u0E0A\u0E34\u0E01 \u0E2B\u0E23\u0E37\u0E2D\u0E02\u0E2D\u0E07\u0E17\u0E35\u0E48\u0E1C\u0E48\u0E2D\u0E19\u0E44\u0E14\u0E49" }),
                        active.map(fc => {
                            const paid = !!fc.paidMonths?.[mk];
                            const isInstallment = fc.kind === "installment";
                            return (React.createElement(Glass, { key: fc.id, className: "p-3.5" },
                                React.createElement("div", { className: "flex items-center gap-2.5" },
                                    React.createElement("div", { className: "w-10 h-10 rounded-xl flex items-center justify-center shrink-0", style: { background: hex(T.orange, .16) } },
                                        React.createElement(Repeat, { size: 16, style: { color: T.orange } })),
                                    React.createElement("div", { className: "flex-1 min-w-0" },
                                        React.createElement("div", { className: "font-bold text-sm truncate" }, fc.name),
                                        React.createElement("div", { className: "text-[10px] mt-0.5", style: { color: T.muted } },
                                            fmtBaht(fc.amount),
                                            "/\u0E40\u0E14\u0E37\u0E2D\u0E19 ",
                                            isInstallment && React.createElement("span", null,
                                                " \u00B7 \u0E1C\u0E48\u0E2D\u0E19 ",
                                                fc.installmentPaid || 0,
                                                "/",
                                                fc.installmentTotal,
                                                " \u0E07\u0E27\u0E14"),
                                            paid && accounts.find(a => a.id === fc.lastAccountId) && React.createElement("span", null,
                                                " \u00B7 ",
                                                accounts.find(a => a.id === fc.lastAccountId)?.name))),
                                    React.createElement("button", { onClick: () => setFcModal(fc), "aria-label": "\u0E41\u0E01\u0E49\u0E44\u0E02", className: "w-7 h-7 rounded-lg flex items-center justify-center shrink-0", style: { color: T.blue } },
                                        React.createElement(Pencil, { size: 13 })),
                                    delFc === fc.id ? (React.createElement("button", { onClick: () => { setFixedCosts(fs => fs.filter(x => x.id !== fc.id)); setDelFc(null); }, className: "text-[10px] font-bold px-2 py-1.5 rounded-lg shrink-0", style: { background: T.red, color: "#fff" } }, "\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E25\u0E1A")) : (React.createElement("button", { onClick: () => setDelFc(fc.id), "aria-label": "\u0E25\u0E1A", className: "w-7 h-7 rounded-lg flex items-center justify-center shrink-0", style: { color: T.muted } },
                                        React.createElement(Trash2, { size: 13 })))),
                                isInstallment && React.createElement("div", { className: "h-1 rounded-full overflow-hidden mt-2.5", style: { background: T.border } },
                                    React.createElement("div", { style: { width: `${Math.min(100, Math.round(((fc.installmentPaid || 0) / fc.installmentTotal) * 100))}%`, height: "100%", background: T.gold } })),
                                React.createElement("button", { onClick: () => !paid && setPayFc(fc), disabled: paid, className: "w-full mt-2.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5", style: { background: paid ? hex(T.green, .16) : hex(T.orange, .14), color: paid ? T.green : T.orange, border: `1px solid ${paid ? "transparent" : hex(T.orange, .4)}` } }, paid ? React.createElement(React.Fragment, null,
                                    React.createElement(Check, { size: 13 }),
                                    " \u0E08\u0E48\u0E32\u0E22\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E19\u0E35\u0E49\u0E41\u0E25\u0E49\u0E27") : "จ่ายเดือนนี้")));
                        })),
                    React.createElement("button", { onClick: () => setFcModal({}), className: "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[.98]", style: { background: T.surf2, color: T.orange, border: `1px dashed ${hex(T.orange, .5)}` } },
                        React.createElement(Plus, { size: 16 }),
                        " \u0E40\u0E1E\u0E34\u0E48\u0E21\u0E04\u0E48\u0E32\u0E43\u0E0A\u0E49\u0E08\u0E48\u0E32\u0E22\u0E1B\u0E23\u0E30\u0E08\u0E33"),
                    done.length > 0 && (React.createElement(Section, { title: `ผ่อนครบแล้ว (${done.length})`, icon: Check, dot: T.muted },
                        React.createElement("div", { className: "space-y-2" }, done.map(fc => (React.createElement(Glass, { key: fc.id, className: "p-3 flex items-center gap-2.5", style: { opacity: .6 } },
                            React.createElement("span", { className: "flex-1 text-sm truncate" }, fc.name),
                            React.createElement("span", { className: "text-[10px] font-bold px-2 py-1 rounded-full", style: { background: hex(T.green, .14), color: T.green } },
                                "\u0E1C\u0E48\u0E2D\u0E19\u0E04\u0E23\u0E1A ",
                                fc.installmentTotal,
                                " \u0E07\u0E27\u0E14"),
                            React.createElement("button", { onClick: () => setFixedCosts(fs => fs.filter(x => x.id !== fc.id)), "aria-label": "\u0E25\u0E1A", className: "w-7 h-7 rounded-lg flex items-center justify-center shrink-0", style: { color: T.muted } },
                                React.createElement(Trash2, { size: 13 }))))))))));
            })())),
            sub === "export" && (React.createElement(Glass, { className: "p-4" },
                React.createElement("div", { className: "mb-4" },
                    React.createElement(Label, null, "\u0E01\u0E23\u0E2D\u0E07\u0E15\u0E32\u0E21\u0E1A\u0E31\u0E0D\u0E0A\u0E35"),
                    React.createElement("select", { value: expAccFilter, onChange: e => setExpAccFilter(e.target.value), className: "w-full px-3 py-2.5 rounded-xl text-sm outline-none", style: { background: T.surf, color: T.text, border: `1px solid ${T.border}`, colorScheme: "dark" } },
                        React.createElement("option", { value: "all" }, "\u0E17\u0E38\u0E01\u0E1A\u0E31\u0E0D\u0E0A\u0E35"),
                        accounts.map(a => React.createElement("option", { key: a.id, value: a.id }, a.name)))),
                React.createElement("div", { className: "mb-4" },
                    React.createElement(Label, null, "\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E17\u0E35\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23"),
                    React.createElement("div", { className: "flex gap-1.5 flex-wrap" }, [["all", "ทั้งหมด"], ["in", "เฉพาะรายรับ"], ["out", "เฉพาะรายจ่าย"], ["tax", "เฉพาะที่นับภาษี"]].map(([k, l]) => {
                        const on = expTypeFilter === k;
                        return React.createElement("button", { key: k, onClick: () => setExpTypeFilter(k), className: "px-3 py-2 rounded-lg text-xs font-bold", style: { background: on ? T.green : T.surf2, color: on ? "#000" : T.sub, border: `1px solid ${on ? T.green : T.border}` } }, l);
                    }))),
                React.createElement("button", { onClick: () => {
                        const accName = (id) => accounts.find(a => a.id === id)?.name || "ไม่ระบุ";
                        const matchAcc = (id) => expAccFilter === "all" || id === expAccFilter;
                        let rows = [];
                        if (expTypeFilter === "all" || expTypeFilter === "in" || expTypeFilter === "tax") {
                            events.filter(e => e.paid && e.type !== "studio").forEach(e => {
                                const ed = e.paidDate || e.date;
                                if (e.tip > 0 && e.tipCombined) {
                                    if (matchAcc(e.accountId))
                                        rows.push([ed, "งาน/Event", e.title + " (รวมทิป)", e.category || "งานสอน", accName(e.accountId), "รายรับ", (Number(e.income) || 0) + (Number(e.tip) || 0)]);
                                }
                                else {
                                    if (matchAcc(e.accountId))
                                        rows.push([ed, "งาน/Event", e.title, e.category || "งานสอน", accName(e.accountId), "รายรับ", e.income]);
                                    if (e.tip > 0 && e.tipAccountId && matchAcc(e.tipAccountId))
                                        rows.push([ed, "งาน/Event (Tips)", e.title, "Tips", accName(e.tipAccountId), "รายรับ", e.tip]);
                                }
                            });
                            bookings.filter(b => b.paid).forEach(b => { if (matchAcc(b.accountId))
                                rows.push([b.paidDate || b.date, "ห้องซ้อม", b.bandName, "ห้องซ้อม", accName(b.accountId), "รายรับ", b.totalPrice]); });
                            transactions.filter(t => t.kind === "in").forEach(t => {
                                if (expTypeFilter === "tax" && t.taxable === false)
                                    return;
                                if (matchAcc(t.accountId))
                                    rows.push([t.date, "รายรับอื่น", t.title, t.category || "", accName(t.accountId), "รายรับ", t.amount]);
                            });
                        }
                        if (expTypeFilter === "all" || expTypeFilter === "out") {
                            transactions.filter(t => t.kind === "out").forEach(t => {
                                if (matchAcc(t.accountId))
                                    rows.push([t.date, t.studioExpense ? "ห้องซ้อม (รายจ่าย)" : "รายจ่าย", t.title, t.category || "", accName(t.accountId), "รายจ่าย", t.amount]);
                            });
                        }
                        if (expTypeFilter === "all") {
                            transactions.filter(t => t.kind === "transfer").forEach(t => {
                                if (expAccFilter === "all" || t.fromAccountId === expAccFilter || t.toAccountId === expAccFilter)
                                    rows.push([t.date, "โอนย้าย", t.title, "-", accName(t.fromAccountId) + " → " + accName(t.toAccountId), "โอนย้าย", t.amount]);
                            });
                        }
                        rows.sort((a, b) => String(a[0]).localeCompare(String(b[0])));
                        const accLabel = expAccFilter === "all" ? "ทุกบัญชี" : accName(expAccFilter);
                        const typeLabel = { all: "ทั้งหมด", in: "รายรับ", out: "รายจ่าย", tax: "เฉพาะภาษี" }[expTypeFilter];
                        downloadCSV(`export_${accLabel}_${typeLabel}_${TK}.csv`, [["วันที่", "แหล่งที่มา", "รายการ", "หมวด", "บัญชี", "ทิศทาง", "จำนวนเงิน"], ...rows]);
                    }, className: "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[.98]", style: { background: T.green, color: "#000", boxShadow: glow(T.green) } },
                    React.createElement(Download, { size: 17 }),
                    " Export CSV"),
                React.createElement("div", { className: "text-[10px] mt-3", style: { color: T.muted } }, "\u0E15\u0E31\u0E27\u0E01\u0E23\u0E2D\u0E07\u0E19\u0E35\u0E49\u0E04\u0E23\u0E2D\u0E1A\u0E04\u0E25\u0E38\u0E21\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E17\u0E35\u0E48\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E43\u0E2B\u0E21\u0E48\u0E43\u0E19\u0E2D\u0E19\u0E32\u0E04\u0E15\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34 \u2014 \u0E44\u0E21\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E15\u0E31\u0E49\u0E07\u0E04\u0E48\u0E32\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E17\u0E35\u0E2B\u0E25\u0E31\u0E07"))),
            fcModal && (React.createElement(Sheet, { onClose: () => setFcModal(null), title: fcModal.id ? "แก้ไขค่าใช้จ่ายประจำ" : "เพิ่มค่าใช้จ่ายประจำ" },
                React.createElement(FixedCostForm, { initial: fcModal, onSave: (val) => { setFixedCosts(fs => fs.some(x => x.id === val.id) ? fs.map(x => x.id === val.id ? val : x) : [...fs, val]); setFcModal(null); } }))),
            payFc && React.createElement(PayMethodModal, { accounts: accounts, heading: "\u0E08\u0E48\u0E32\u0E22\u0E08\u0E32\u0E01\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E44\u0E2B\u0E19?", dateLabel: "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E08\u0E48\u0E32\u0E22\u0E40\u0E07\u0E34\u0E19\u0E08\u0E23\u0E34\u0E07", dateCaption: "\u0E43\u0E0A\u0E49\u0E27\u0E31\u0E19\u0E19\u0E35\u0E49\u0E40\u0E1B\u0E47\u0E19\u0E04\u0E48\u0E32\u0E40\u0E23\u0E34\u0E48\u0E21\u0E15\u0E49\u0E19 \u2014 \u0E16\u0E49\u0E32\u0E08\u0E48\u0E32\u0E22\u0E27\u0E31\u0E19\u0E2D\u0E37\u0E48\u0E19\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E44\u0E14\u0E49", title: payFc.name, sub: fmtBaht(payFc.amount) + " · จ่ายเดือนนี้", onClose: () => setPayFc(null), onPick: (accId, paidDate) => {
                    const d = paidDate || TK;
                    addTxn({ title: payFc.name, amount: Number(payFc.amount) || 0, kind: "out", date: d, accountId: accId, category: "ค่าใช้จ่ายประจำ" });
                    setFixedCosts(fs => fs.map(x => x.id === payFc.id ? { ...x, lastAccountId: accId, paidMonths: { ...(x.paidMonths || {}), [monthKey(d)]: true }, installmentPaid: x.kind === "installment" ? Math.min(x.installmentTotal, (x.installmentPaid || 0) + 1) : x.installmentPaid } : x));
                    setPayFc(null);
                } }),
            editAcc && (React.createElement(Sheet, { onClose: () => setEditAcc(null), title: editAcc.id ? "แก้ไขบัญชี" : "เพิ่มบัญชี" },
                React.createElement(Input, { label: "\u0E0A\u0E37\u0E48\u0E2D\u0E1A\u0E31\u0E0D\u0E0A\u0E35", value: editAcc.name, onChange: v => setEditAcc({ ...editAcc, name: v }), placeholder: "\u0E40\u0E0A\u0E48\u0E19 \u0E01\u0E2A\u0E34\u0E01\u0E23\u0E44\u0E17\u0E22, \u0E40\u0E07\u0E34\u0E19\u0E2A\u0E14" }),
                React.createElement(Input, { label: "\u0E22\u0E2D\u0E14\u0E40\u0E23\u0E34\u0E48\u0E21\u0E15\u0E49\u0E19 \u0E3F", value: String(editAcc.startBalance ?? 0), onChange: v => setEditAcc({ ...editAcc, startBalance: v }), placeholder: "0", type: "number" }),
                React.createElement(SaveBtn, { disabled: !editAcc.name.trim(), onClick: () => {
                        const val = { id: editAcc.id || uid(), name: editAcc.name.trim(), startBalance: Number(editAcc.startBalance) || 0 };
                        setAccounts(as => as.some(a => a.id === val.id) ? as.map(a => a.id === val.id ? val : a) : [...as, val]);
                        setEditAcc(null);
                    } }, editAcc.id ? "บันทึกการแก้ไข" : "เพิ่มบัญชี"),
                editAcc.id && React.createElement("button", { onClick: () => { setAccounts(as => as.filter(a => a.id !== editAcc.id)); setEditAcc(null); }, className: "w-full py-2.5 rounded-xl font-bold mt-2", style: { background: hex(T.red, .14), color: T.red, border: `1px solid ${hex(T.red, .5)}` } }, "\u0E25\u0E1A\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E19\u0E35\u0E49"))),
            txnOpen && React.createElement(TxnModal, { accounts: accounts, txnCategories: txnCategories, setTxnCategories: setTxnCategories, expensePresets: expensePresets, setExpensePresets: setExpensePresets, onClose: () => setTxnOpen(false), onSave: (list) => { list.forEach(addTxn); setTxnOpen(false); } }),
            payBk && React.createElement(PayMethodModal, { accounts: accounts, initial: payBk, title: payBk.title, sub: shortDate(payBk.date) + " · ฿" + Number(payBk.amount).toLocaleString(), onClose: () => setPayBk(null), onPick: (accId, paidDate) => { markBookingPaid(payBk.id, accId, paidDate); setPayBk(null); } }),
            payBkEdit && React.createElement(PayMethodModal, { accounts: accounts, initial: payBkEdit, title: payBkEdit.title, sub: shortDate(payBkEdit.date) + " · ฿" + Number(payBkEdit.amount).toLocaleString() + (payBkEdit.accountId ? (" · เดิม: " + (accounts.find(a => a.id === payBkEdit.accountId)?.name || "—")) : " · ยังไม่ระบุบัญชี"), onClose: () => setPayBkEdit(null), onPick: (accId, paidDate) => { markBookingPaid(payBkEdit.id, accId, paidDate); setPayBkEdit(null); }, onUnpay: () => { togglePaid(payBkEdit.id); setPayBkEdit(null); } }),
            recvItem && React.createElement(ReceiveModal, { item: recvItem, accounts: accounts, onClose: () => setRecvItem(null), onConfirm: (tip, accountId, tipAccountId, tipCombined, paidDate) => { editEvent(recvItem.id, { paid: true, tip: Number(tip) || 0, accountId, tipAccountId, tipCombined, paidDate }); setRecvItem(null); } }),
            editRecv && React.createElement(ReceiveModal, { item: editRecv, accounts: accounts, initial: { tip: editRecv.tip, accountId: editRecv.accountId, tipAccountId: editRecv.tipAccountId, tipCombined: editRecv.tipCombined, paidDate: editRecv.paidDate || editRecv.date }, onUnpay: () => { editEvent(editRecv.id, { paid: false }); setEditRecv(null); }, onClose: () => setEditRecv(null), onConfirm: (tip, accountId, tipAccountId, tipCombined, paidDate) => { editEvent(editRecv.id, { tip: Number(tip) || 0, accountId, tipAccountId, tipCombined, paidDate }); setEditRecv(null); } }),
            React.createElement("div", { className: "text-[10px] text-center pb-2", style: { color: T.muted } }, "\u0E23\u0E27\u0E21\u0E23\u0E32\u0E22\u0E23\u0E31\u0E1A\u0E08\u0E32\u0E01\u0E07\u0E32\u0E19/Event \u00B7 \u0E2B\u0E49\u0E2D\u0E07\u0E0B\u0E49\u0E2D\u0E21 \u00B7 \u0E23\u0E32\u0E22\u0E23\u0E31\u0E1A\u0E2D\u0E37\u0E48\u0E19 \u2014 \u0E15\u0E34\u0E4A\u0E01\u0E0A\u0E48\u0E2D\u0E07\u0E27\u0E48\u0E32\u0E07\u0E17\u0E35\u0E48\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E04\u0E49\u0E32\u0E07\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E23\u0E31\u0E1A\u0E40\u0E07\u0E34\u0E19 (\u0E07\u0E32\u0E19/Event \u0E43\u0E2A\u0E48 Tips + \u0E40\u0E25\u0E37\u0E2D\u0E01\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E44\u0E14\u0E49)")));
    }

    function ReceiveModal({ item, initial, accounts, onClose, onConfirm, onUnpay }) {
        const [tip, setTip] = useState(initial && initial.tip ? String(initial.tip) : "");
        const [accountId, setAccountId] = useState((initial && initial.accountId) || accounts[0]?.id || null);
        const [tipCombined, setTipCombined] = useState(initial ? (initial.tipCombined ?? (!initial.tipAccountId || initial.tipAccountId === initial.accountId)) : true);
        const [tipAccountId, setTipAccountId] = useState((initial && initial.tipAccountId) || null);
        const [recvDate, setRecvDate] = useState((initial && initial.paidDate) || TK);
        const hasTip = Number(tip) > 0;
        const total = (item.amount || 0) + (Number(tip) || 0);
        const ABtns = ({ val, set }) => (React.createElement("div", { className: "flex gap-1.5 flex-wrap" }, accounts.map(a => {
            const on = val === a.id;
            return React.createElement("button", { key: a.id, onClick: () => set(a.id), className: "px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1", style: { background: on ? T.green : T.surf2, color: on ? "#000" : T.sub, border: `1px solid ${on ? T.green : T.border}` } },
                React.createElement(Wallet, { size: 11 }),
                a.name);
        })));
        return (React.createElement(Sheet, { onClose: onClose, title: initial ? "แก้ไขการรับเงิน" : "ยืนยันรับเงิน" },
            React.createElement("div", { className: "p-3 rounded-xl mb-3", style: { background: T.surf2 } },
                React.createElement("div", { className: "font-bold text-sm truncate" }, item.title),
                React.createElement("div", { className: "text-[11px] mt-0.5", style: { color: T.muted } },
                    shortDate(item.date),
                    " \u00B7 \u0E04\u0E48\u0E32\u0E15\u0E31\u0E27 \u0E3F",
                    Number(item.amount).toLocaleString())),
            React.createElement("div", { className: "mb-3" },
                React.createElement(Label, null, "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A\u0E40\u0E07\u0E34\u0E19\u0E08\u0E23\u0E34\u0E07"),
                React.createElement(DateInput, { value: recvDate, onChange: setRecvDate }),
                React.createElement("div", { className: "text-[10px] mt-1", style: { color: T.muted } }, "\u0E27\u0E31\u0E19\u0E17\u0E33\u0E07\u0E32\u0E19\u0E01\u0E31\u0E1A\u0E27\u0E31\u0E19\u0E23\u0E31\u0E1A\u0E40\u0E07\u0E34\u0E19\u0E2D\u0E32\u0E08\u0E44\u0E21\u0E48\u0E15\u0E23\u0E07\u0E01\u0E31\u0E19 \u2014 \u0E27\u0E31\u0E19\u0E19\u0E35\u0E49\u0E08\u0E30\u0E16\u0E39\u0E01\u0E43\u0E0A\u0E49\u0E43\u0E19 statement/\u0E01\u0E23\u0E32\u0E1F\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14")),
            accounts.length === 0 ? (React.createElement("div", { className: "text-sm p-3 rounded-xl text-center mb-3", style: { background: T.surf2, color: T.muted } }, "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E1A\u0E31\u0E0D\u0E0A\u0E35 \u2014 \u0E44\u0E1B\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E17\u0E35\u0E48 Budget \u2192 \u0E1A\u0E31\u0E0D\u0E0A\u0E35 \u0E01\u0E48\u0E2D\u0E19")) : (React.createElement("div", { className: "mb-3" },
                React.createElement(Label, null, "\u0E04\u0E48\u0E32\u0E15\u0E31\u0E27\u0E40\u0E02\u0E49\u0E32\u0E1A\u0E31\u0E0D\u0E0A\u0E35"),
                React.createElement(ABtns, { val: accountId, set: setAccountId }))),
            React.createElement(Input, { label: "Tips \u0E3F (\u0E16\u0E49\u0E32\u0E21\u0E35)", value: tip, onChange: setTip, placeholder: "0", type: "number" }),
            hasTip && accounts.length > 0 && (React.createElement(React.Fragment, null,
                React.createElement("div", { className: "mb-3" },
                    React.createElement(Label, null, "\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A\u0E22\u0E31\u0E07\u0E44\u0E07?"),
                    React.createElement("div", { className: "flex gap-1.5" }, [[true, "รวมยอดเดียว"], [false, "แยก 2 รายการ"]].map(([v, l]) => {
                        const on = tipCombined === v;
                        return React.createElement("button", { key: String(v), onClick: () => setTipCombined(v), className: "flex-1 py-2 rounded-lg text-xs font-bold", style: { background: on ? T.green : T.surf2, color: on ? "#000" : T.sub, border: `1px solid ${on ? T.green : T.border}` } }, l);
                    })),
                    React.createElement("div", { className: "text-[10px] mt-1", style: { color: T.muted } }, tipCombined ? `โอนทีเดียว ฿${total.toLocaleString()} — ตรงกับสเตทเมนต์ที่มี 1 รายการ` : "โอนแยกกันคนละครั้ง — ตรงกับสเตทเมนต์ที่มี 2 รายการ")),
                !tipCombined && (React.createElement("div", { className: "mb-3" },
                    React.createElement(Label, null, "Tips \u0E40\u0E02\u0E49\u0E32\u0E1A\u0E31\u0E0D\u0E0A\u0E35"),
                    React.createElement(ABtns, { val: tipAccountId || accountId, set: setTipAccountId }))))),
            React.createElement("div", { className: "flex items-center justify-between px-1 mb-3" },
                React.createElement("span", { className: "text-xs", style: { color: T.muted } }, "\u0E23\u0E27\u0E21\u0E23\u0E31\u0E1A\u0E08\u0E23\u0E34\u0E07"),
                React.createElement("span", { className: "text-xl font-extrabold", style: { color: T.green } },
                    "\u0E3F",
                    total.toLocaleString())),
            React.createElement(SaveBtn, { disabled: accounts.length > 0 && !accountId, onClick: () => onConfirm(tip, accountId, hasTip ? (tipCombined ? accountId : (tipAccountId || accountId)) : null, hasTip ? tipCombined : true, recvDate) }, initial ? "บันทึกการแก้ไข ✓" : "ยืนยันรับเงิน ✓"),
            onUnpay && React.createElement("button", { onClick: onUnpay, className: "w-full py-2.5 rounded-xl font-bold mt-2", style: { background: hex(T.red, .14), color: T.red, border: `1px solid ${hex(T.red, .5)}` } }, "\u0E22\u0E01\u0E40\u0E25\u0E34\u0E01\u0E01\u0E32\u0E23\u0E23\u0E31\u0E1A\u0E40\u0E07\u0E34\u0E19 (\u0E01\u0E25\u0E31\u0E1A\u0E44\u0E1B\u0E04\u0E49\u0E32\u0E07\u0E08\u0E48\u0E32\u0E22)")));
    }
