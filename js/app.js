"use strict";
try {
    function App() {
        const [tab, setTab] = useState("today");
        const [events, setEvents] = useState(seedEvents);
        const [bookings, setBookings] = useState(seedBookings);
        const [loyaltyBase, setLoyaltyBase] = useState({});
        const [transactions, setTransactions] = useState([]);
        const [capital, setCapital] = useState(0);
        const [workouts, setWorkouts] = useState([]);
        const [nutrition, setNutrition] = useState({});
        const [nutriTargets, setNutriTargets] = useState({ cal: 2200, protein: 140, carb: 220, fat: 70, sugar: 40, sodium: 2000, chol: 300 });
        const [exPresets, setExPresets] = useState([]);
        const [workoutPresets, setWorkoutPresets] = useState([]);
        const [fixedCosts, setFixedCosts] = useState([]);
        const [expensePresets, setExpensePresets] = useState(["ค่าไฟ", "ค่าน้ำ", "ค่าเช่า", "ซ่อมอุปกรณ์", "ซื้อของ", "ค่าอินเทอร์เน็ต", "ค่าโทรศัพท์"]);
        const [accounts, setAccounts] = useState([]);
        const [txnCategories, setTxnCategories] = useState({ income: [], expense: [] });
        const [fitnessSplit, setFitnessSplit] = useState(null);
        const [fitnessStartDay, setFitnessStartDay] = useState(1);
        const [fitnessConfirmed, setFitnessConfirmed] = useState({});
        const [sel, setSel] = useState(TK);
        const [loaded, setLoaded] = useState(false);
        const [settingsOpen, setSettingsOpen] = useState(false);
        const [confirmClear, setConfirmClear] = useState(false);
        const [dataMsg, setDataMsg] = useState("");
        const [toast, setToast] = useState(null);
        const fireToast = (text, kind = "ok") => { setToast({ text, kind }); setTimeout(() => setToast(null), 3200); };
        const [driveToken, setDriveToken] = useState(null);
        const [driveEmail, setDriveEmail] = useState("");
        const [driveConnected, setDriveConnected] = useState(false);
        const [driveFileId, setDriveFileId] = useState(null);
        const [autoSync, setAutoSync] = useState(true);
        const [syncReady, setSyncReady] = useState(false);
        const [syncState, setSyncState] = useState("idle");
        const [driveMsg, setDriveMsg] = useState("");
        const [lastSync, setLastSync] = useState(null);
        const syncTimer = React.useRef(null);
        const buildSnapshot = () => ({ version: SCHEMA_VERSION, savedAt: new Date().toISOString(), events, bookings, loyaltyBase, transactions, capital, workouts, nutrition, nutriTargets, exPresets, workoutPresets, accounts, txnCategories, fixedCosts, expensePresets, fitnessSplit, fitnessStartDay, fitnessConfirmed, driveConnected, driveFileId, autoSync });
        const applySnapshot = (s) => {
            if (!s)
                return;
            if (s.events)
                setEvents(s.events);
            if (s.bookings)
                setBookings(s.bookings);
            if (s.loyaltyBase)
                setLoyaltyBase(s.loyaltyBase);
            if (s.transactions)
                setTransactions(s.transactions);
            if (typeof s.capital === "number")
                setCapital(s.capital);
            if (s.workouts)
                setWorkouts(s.workouts);
            if (s.nutrition)
                setNutrition(s.nutrition);
            if (s.nutriTargets)
                setNutriTargets(s.nutriTargets);
            if (s.exPresets)
                setExPresets(s.exPresets);
            if (s.workoutPresets)
                setWorkoutPresets(s.workoutPresets);
            if (s.fixedCosts)
                setFixedCosts(s.fixedCosts);
            if (s.expensePresets)
                setExpensePresets(s.expensePresets);
            if (s.accounts)
                setAccounts(s.accounts);
            if (s.txnCategories)
                setTxnCategories(s.txnCategories);
            if (s.fitnessSplit !== undefined && s.fitnessSplit !== null)
                setFitnessSplit(s.fitnessSplit);
            if (typeof s.fitnessStartDay === "number")
                setFitnessStartDay(s.fitnessStartDay);
            if (s.fitnessConfirmed)
                setFitnessConfirmed(s.fitnessConfirmed);
            if (typeof s.driveConnected === "boolean")
                setDriveConnected(s.driveConnected);
            if (s.driveFileId)
                setDriveFileId(s.driveFileId);
            if (typeof s.autoSync === "boolean")
                setAutoSync(s.autoSync);
        };
        useEffect(() => { const s = migrate(storage.load()); if (s)
            applySnapshot(s); setLoaded(true); }, []);
        useEffect(() => { if (loaded)
            storage.save(buildSnapshot()); }, [loaded, events, bookings, loyaltyBase, transactions, capital, workouts, nutrition, nutriTargets, exPresets, workoutPresets, accounts, txnCategories, fixedCosts, expensePresets, fitnessSplit, fitnessStartDay, fitnessConfirmed, driveConnected, driveFileId, autoSync]);
        useEffect(() => {
            if (!loaded || !driveConnected || driveToken)
                return;
            let cancelled = false;
            (async () => {
                try {
                    const token = await drive.connect(true);
                    if (cancelled)
                        return;
                    setDriveToken(token);
                    drive.userEmail(token).then(em => { if (!cancelled && em)
                        setDriveEmail(em); });
                    if (!driveFileId) {
                        try {
                            const f = await drive.findFile(token);
                            if (!cancelled && f)
                                setDriveFileId(f.id);
                        }
                        catch { }
                    }
                }
                catch { }
            })();
            return () => { cancelled = true; };
        }, [loaded, driveConnected]);
        const exportData = () => {
            try {
                const blob = new Blob([JSON.stringify(buildSnapshot(), null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `discipline-os-${dkey(new Date())}.json`;
                a.click();
                URL.revokeObjectURL(url);
                setDataMsg("ดาวน์โหลดไฟล์แล้ว — อัปขึ้น Drive ได้เลย");
            }
            catch {
                setDataMsg("export ไม่สำเร็จในหน้านี้ (preview) — ใช้ได้บนเว็บจริง");
            }
        };
        const importData = (file) => {
            const r = new FileReader();
            r.onload = () => {
                try {
                    const s = migrate(JSON.parse(r.result));
                    if (s) {
                        applySnapshot(s);
                        setDataMsg("นำเข้าข้อมูลสำเร็จ ✓");
                    }
                    else
                        setDataMsg("ไฟล์ไม่ถูกต้อง");
                }
                catch {
                    setDataMsg("อ่านไฟล์ไม่ได้ — ตรวจว่าเป็นไฟล์ JSON ที่ export จากแอปนี้");
                }
            };
            r.readAsText(file);
        };
        const clearAllData = () => {
            setEvents([]);
            setBookings([]);
            setLoyaltyBase({});
            setTransactions([]);
            setCapital(0);
            setWorkouts([]);
            setFitnessSplit(null);
            setFitnessConfirmed({});
            setNutrition({});
            setExPresets([]);
            setWorkoutPresets([]);
            setAccounts([]);
            setTxnCategories({ income: ["งานสอน", "ห้องซ้อม", "ขายของ", "ดอกเบี้ย", "เงินปันผล/กำไรลงทุน", "งานเล่นดนตรี/รับงานแสดง", "อื่นๆ"], expense: ["ค่าใช้จ่ายส่วนตัว", "อุปกรณ์/เครื่องดนตรี", "ค่าเช่า/บิล", "อื่นๆ"] });
            setFixedCosts([]);
            setExpensePresets(["ค่าไฟ", "ค่าน้ำ", "ค่าเช่า", "ซ่อมอุปกรณ์", "ซื้อของ", "ค่าอินเทอร์เน็ต", "ค่าโทรศัพท์"]);
            setDataMsg("ล้างข้อมูลแล้ว — เริ่มจากศูนย์ ✓");
            fireToast("ล้างข้อมูลทั้งหมดแล้ว");
        };
        const ensureToken = async (silent) => {
            if (driveToken)
                return driveToken;
            const token = await drive.connect(silent);
            setDriveToken(token);
            drive.userEmail(token).then(em => { if (em)
                setDriveEmail(em); });
            return token;
        };
        const connectDrive = async () => {
            try {
                setDriveMsg("กำลังเชื่อม…");
                const token = await ensureToken(false);
                setDriveConnected(true);
                const em = await drive.userEmail(token);
                if (em)
                    setDriveEmail(em);
                let fid = driveFileId;
                if (!fid) {
                    const f = await drive.findFile(token);
                    if (f) {
                        fid = f.id;
                        setDriveFileId(f.id);
                    }
                }
                setDriveMsg(fid ? "เชื่อมแล้ว ✓ พบไฟล์สำรองบน Drive — กด “โหลดจาก Drive” เพื่อดึงมาใช้ หรือ “Save” เพื่อทับด้วยข้อมูลเครื่องนี้" : "เชื่อมแล้ว ✓ ยังไม่มีไฟล์สำรอง — กด “Save” เพื่อสร้างครั้งแรก");
            }
            catch (e) {
                setDriveMsg("เชื่อมไม่สำเร็จ: " + (e.message || e));
            }
        };
        const saveToDrive = async (silent) => {
            try {
                setSyncState("saving");
                if (!silent)
                    setDriveMsg("กำลังบันทึกขึ้น Drive…");
                const token = await ensureToken(true).catch(() => ensureToken(false));
                let fid = driveFileId;
                if (!fid) {
                    const f = await drive.findFile(token);
                    fid = f ? f.id : await drive.createFile(token);
                    setDriveFileId(fid);
                }
                await drive.writeMedia(token, fid, buildSnapshot());
                setSyncReady(true);
                setDriveConnected(true);
                setSyncState("saved");
                setLastSync(Date.now());
                if (!silent) {
                    setDriveMsg("บันทึกขึ้น Drive แล้ว ✓");
                    fireToast("บันทึกขึ้น Google Drive แล้ว");
                }
            }
            catch (e) {
                setSyncState("error");
                if (e && e.status === 401) {
                    setDriveToken(null);
                    setDriveMsg("เซสชันหมดอายุ — กดเชื่อม Google ใหม่");
                }
                else
                    setDriveMsg("บันทึกไม่สำเร็จ: " + (e.message || e));
                if (!silent)
                    fireToast("บันทึกขึ้น Drive ไม่สำเร็จ", "err");
            }
        };
        const loadFromDrive = async () => {
            try {
                setDriveMsg("กำลังโหลดจาก Drive…");
                const token = await ensureToken(false);
                let fid = driveFileId;
                if (!fid) {
                    const f = await drive.findFile(token);
                    if (!f) {
                        setDriveMsg("ไม่พบไฟล์สำรองบน Drive");
                        return;
                    }
                    fid = f.id;
                    setDriveFileId(f.id);
                }
                const data = await drive.read(token, fid);
                const s = migrate(data);
                if (s) {
                    applySnapshot(s);
                    setSyncReady(true);
                    setDriveConnected(true);
                    setDriveMsg("โหลดจาก Drive สำเร็จ ✓");
                    fireToast("ดึงข้อมูลจาก Drive แล้ว");
                }
                else
                    setDriveMsg("ไฟล์บน Drive อ่านไม่ได้");
            }
            catch (e) {
                setDriveMsg("โหลดไม่สำเร็จ: " + (e.message || e));
                fireToast("โหลดจาก Drive ไม่สำเร็จ", "err");
            }
        };
        const disconnectDrive = () => {
            setDriveToken(null);
            setDriveEmail("");
            setDriveConnected(false);
            setSyncReady(false);
            setSyncState("idle");
            setDriveMsg("ออกจากระบบแล้ว (ไฟล์บน Drive ยังอยู่)");
        };
        useEffect(() => {
            if (!loaded || !autoSync || !driveToken || !syncReady)
                return;
            if (syncTimer.current)
                clearTimeout(syncTimer.current);
            syncTimer.current = setTimeout(() => { saveToDrive(true); }, 6000);
            return () => { if (syncTimer.current)
                clearTimeout(syncTimer.current); };
        }, [events, bookings, loyaltyBase, transactions, capital, autoSync, driveToken, syncReady]);
        const allEvents = events;
        const todayEvents = useMemo(() => allEvents.filter(e => e.date === sel).sort((a, b) => toMin(a.startTime) - toMin(b.startTime)), [allEvents, sel]);
        const toggleEvent = (id) => setEvents(es => es.map(e => e.id === id ? { ...e, status: e.status === "done" ? "scheduled" : "done" } : e));
        const toggleEventPaid = (id) => setEvents(es => es.map(e => e.id === id ? { ...e, paid: !e.paid } : e));
        const confirmFitnessWeek = (weekKey, evs) => { setEvents(es => [...es, ...evs.map(e => ({ id: uid(), status: "scheduled", ...e }))]); setFitnessConfirmed(m => ({ ...m, [weekKey]: true })); };
        const saveFitnessSplit = (split) => setFitnessSplit(split);
        const exportEventICS = (e) => { downloadICS(`event-${e.date || dkey(new Date())}.ics`, [e]); setEvents(es => es.map(x => x.id === e.id ? { ...x, icsAdded: true } : x)); fireToast("กำลังเปิดปฏิทิน — กด “เพิ่ม” เพื่อรับแจ้งเตือน"); };
        const exportDayICS = (dateK) => {
            const list = events.filter(e => e.date === dateK && e.startTime);
            if (!list.length) {
                fireToast("วันนี้ไม่มี event ที่ตั้งเวลาไว้", "err");
                return;
            }
            downloadICS(`วันนี้-${dateK}.ics`, list);
            const ids = new Set(list.map(x => x.id));
            setEvents(es => es.map(x => ids.has(x.id) ? { ...x, icsAdded: true } : x));
            fireToast(`ส่ง ${list.length} event เข้าปฏิทินเครื่อง`);
        };
        const exportWeekICS = (weekDays) => {
            const keys = weekDays.map(dkey);
            const list = events.filter(e => keys.includes(e.date) && e.startTime);
            if (!list.length) {
                fireToast("สัปดาห์นี้ไม่มี event ที่ตั้งเวลาไว้", "err");
                return;
            }
            downloadICS(`สัปดาห์-${keys[0]}.ics`, list);
            const ids = new Set(list.map(x => x.id));
            setEvents(es => es.map(x => ids.has(x.id) ? { ...x, icsAdded: true } : x));
            fireToast(`ส่ง ${list.length} event เข้าปฏิทินเครื่อง`);
        };
        const addEvent = (e) => { setEvents(es => [...es, { id: uid(), status: "scheduled", date: sel, ...e }]); };
        const editEvent = (id, patch) => { setEvents(es => es.map(e => e.id === id ? { ...e, ...patch } : e)); };
        const editEventSeries = (origTitle, fromDate, patch) => { setEvents(es => es.map(e => (e.title === origTitle && e.date >= fromDate) ? { ...e, ...patch, date: e.date } : e)); };
        const delEvent = (id) => { setEvents(es => es.filter(e => e.id !== id)); };
        const delEventSeries = (title, fromDate) => { setEvents(es => es.filter(e => !(e.title === title && e.date >= fromDate))); };
        const addBooking = (b) => {
            setBookings(bs => [...bs, { id: uid(), ...b }]);
            setEvents(es => [...es, { id: uid(), title: `ห้องซ้อม: ${b.bandName}`, type: "studio", date: b.date, startTime: b.startTime, endTime: b.endTime, location: "Studio", energyCost: 1, status: "scheduled", income: b.totalPrice }]);
        };
        const resetLoyalty = (band, totalHours) => setLoyaltyBase(m => ({ ...m, [band]: totalHours }));
        const togglePaid = (id) => setBookings(bs => bs.map(b => b.id === id ? { ...b, paid: !b.paid } : b));
        const markBookingPaid = (id, accountId, paidDate) => setBookings(bs => bs.map(b => b.id === id ? { ...b, paid: true, accountId, paidDate: paidDate || TK } : b));
        const toggleBookingDone = (id) => setBookings(bs => bs.map(b => b.id === id ? { ...b, done: !b.done, bookingStatus: !b.done ? "Completed" : "Scheduled" } : b));
        const delBooking = (id) => setBookings(bs => bs.filter(b => b.id !== id));
        const delBand = (band) => { setBookings(bs => bs.filter(b => b.bandName !== band)); setLoyaltyBase(m => { const c = { ...m }; delete c[band]; return c; }); };
        const addTxn = (t) => setTransactions(ts => [...ts, { id: uid(), ...t }]);
        const delTxn = (id) => setTransactions(ts => ts.filter(t => t.id !== id));
        const updateCapital = (v) => setCapital(Number(v) || 0);
        const shared = { T, sel, setSel, events: allEvents, todayEvents, bookings,
            loyaltyBase, resetLoyalty, togglePaid, toggleBookingDone, delBooking, delBand,
            transactions, addTxn, delTxn, capital, updateCapital,
            exportEventICS, exportDayICS, exportWeekICS,
            fitnessSplit, saveFitnessSplit, fitnessStartDay, setFitnessStartDay, fitnessConfirmed, confirmFitnessWeek,
            workouts, updateWorkouts: setWorkouts,
            nutrition, setNutrition, nutriTargets, setNutriTargets, exPresets, setExPresets, workoutPresets, setWorkoutPresets, accounts, setAccounts, txnCategories, setTxnCategories, fixedCosts, setFixedCosts, expensePresets, setExpensePresets,
            toggleEvent, toggleEventPaid, delEvent, delEventSeries, editEvent, editEventSeries, addEvent, addBooking, markBookingPaid, openSettings: () => setSettingsOpen(true) };
        const settingsProps = { driveToken, driveEmail, connectDrive, disconnectDrive,
            saveToDrive, loadFromDrive, autoSync, setAutoSync, driveMsg, dataMsg,
            exportData, importData, confirmClear, setConfirmClear, clearAllData,
            setSettingsOpen, setDataMsg };
        const NAV = [["today", Home, "Today"], ["calendar", CalendarDays, "Calendar"], ["studio", Music, "Studio"], ["budget", Wallet, "Budget"], ["fitness", Dumbbell, "Fitness"], ["dashboard", BarChart3, "Dashboard"]];
        return (React.createElement("div", { style: { background: T.bg, color: T.text, fontFamily: "system-ui,-apple-system,sans-serif" }, className: "min-h-screen w-full flex justify-center" },
            React.createElement("div", { className: "fixed inset-0 pointer-events-none", style: { background: `radial-gradient(600px 300px at 80% -5%, ${hex(T.purple, .12)}, transparent 70%), radial-gradient(500px 300px at 0% 10%, ${hex(T.purple, .08)}, transparent 70%)` } }),
            React.createElement("div", { className: "w-full max-w-md flex flex-col min-h-screen relative" },
                React.createElement("button", { onClick: () => setSettingsOpen(true), className: "absolute left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full active:scale-95", style: { top: "calc(12px + env(safe-area-inset-top))", background: hex(T.surf, .9), border: `1px solid ${driveToken ? (syncState === "error" ? T.red : hex(T.green, .5)) : T.border}`, backdropFilter: "blur(6px)" } },
                    React.createElement(Cloud, { size: 13, style: { color: driveToken ? (syncState === "error" ? T.red : syncState === "saving" ? T.blue : T.green) : T.muted } }),
                    React.createElement("span", { className: "text-[10px] font-bold", style: { color: driveToken ? T.text : T.muted } }, !driveToken ? "ล็อกอิน" : syncState === "saving" ? "กำลังเซฟ…" : syncState === "error" ? "ผิดพลาด" : syncState === "saved" ? "ซิงค์แล้ว" : "Drive")),
                React.createElement("main", { className: "flex-1 pb-24" },
                    tab === "today" && React.createElement(Today, { ...shared }),
                    tab === "calendar" && React.createElement(Calendar, { ...shared }),
                    tab === "studio" && React.createElement(Studio, { ...shared }),
                    tab === "budget" && React.createElement(Budget, { ...shared }),
                    tab === "fitness" && React.createElement(Fitness, { ...shared }),
                    tab === "dashboard" && React.createElement(Dashboard, { ...shared })),
                toast && (React.createElement("div", { className: "fixed left-0 right-0 flex justify-center z-50 pointer-events-none", style: { bottom: 88 } },
                    React.createElement("div", { className: "mx-4 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-lg max-w-md", style: { background: toast.kind === "err" ? hex(T.red, .95) : hex(T.green, .95), color: toast.kind === "err" ? "#fff" : "#000", border: `1px solid ${toast.kind === "err" ? T.red : T.green}` } },
                        toast.kind === "err" ? React.createElement(AlertCircle, { size: 15 }) : React.createElement(Check, { size: 15 }),
                        React.createElement("span", null, toast.text)))),
                React.createElement("nav", { className: "fixed bottom-0 left-0 right-0 flex justify-center z-30", style: { paddingBottom: "env(safe-area-inset-bottom)" } },
                    React.createElement("div", { className: "w-full max-w-md px-3 pb-3 pt-2", style: { background: `linear-gradient(to top, ${T.bg}, ${hex(T.bg, .85)} 70%, transparent)` } },
                        React.createElement("div", { className: "flex items-center justify-around rounded-2xl py-1.5", style: { background: hex(T.surf, .9), border: `1px solid ${T.border}`, backdropFilter: "blur(8px)" } }, NAV.map(([id, Icon, label]) => {
                            const on = tab === id;
                            return (React.createElement("button", { key: id, onClick: () => setTab(id), "aria-label": label, className: "flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-xl transition active:scale-90" },
                                React.createElement(Icon, { size: 20, style: { color: on ? T.purple : T.muted, filter: on ? `drop-shadow(0 0 6px ${hex(T.purple, .7)})` : "none" } }),
                                on && React.createElement("span", { className: "text-[9px] font-semibold", style: { color: T.text } }, label)));
                        })))),
                                settingsOpen && React.createElement(SettingsSheet, settingsProps))));
    }
    document.getElementById("boot").style.display = "none";
    createRoot(document.getElementById("root")).render(React.createElement(App, null));
}
catch (err) {
    showErr("APP ERROR:\n" + (err && err.stack ? err.stack : err));
}
