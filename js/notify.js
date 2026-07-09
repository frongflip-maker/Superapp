"use strict";
    function normPrefs(p) {
        p = p || {};
        const num = (v, d) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
        return {
            event: { on: p.event ? p.event.on !== false : true, min: num(p.event && p.event.min, 15) },
            studio: { on: p.studio ? p.studio.on !== false : true, min: num(p.studio && p.studio.min, 30) },
            fitness: { on: p.fitness ? p.fitness.on !== false : true, min: num(p.fitness && p.fitness.min, 30) },
            budget: { on: p.budget ? p.budget.on !== false : true, delayDays: num(p.budget && p.budget.delayDays, 0) },
        };
    }
    function catOf(e) { return e.type === "studio" ? "studio" : e.type === "fitness" ? "fitness" : "event"; }
    const Notify = {
        normPrefs,
        defaultPrefs() { return normPrefs(null); },
        // In-app alert list (bell). Respects which categories are enabled.
        computeAlerts(events, bookings, prefs) {
            prefs = normPrefs(prefs);
            const now = Date.now();
            const alerts = [];
            (events || []).forEach(e => {
                if (!e.startTime || e.status === "done")
                    return;
                if (e.date < TK)
                    return;
                const cat = catOf(e);
                if (!prefs[cat].on)
                    return;
                const [H, M] = e.startTime.split(":").map(Number);
                const d = parseK(e.date);
                d.setHours(H, M, 0, 0);
                const diff = d.getTime() - now;
                if (diff > -30 * 60000 && diff <= 24 * 3600 * 1000) {
                    const et = EVENT_TYPES[e.type] || {};
                    const mins = Math.round(diff / 60000);
                    const when = diff <= 0 ? "กำลังจะถึง" : mins < 60 ? `อีก ${mins} นาที` : mins < 1440 ? `อีก ${Math.round(mins / 60)} ชม.` : shortDate(e.date);
                    alerts.push({ kind: "event", color: et.color || T.purple, title: e.title, sub: `${e.startTime}${e.location ? " · " + e.location : ""}`, when, ts: d.getTime() });
                }
            });
            if (prefs.budget.on) {
                (events || []).forEach(e => {
                    if (Number(e.income) > 0 && !e.paid && e.type !== "studio")
                        alerts.push({ kind: "money", color: T.orange, title: `ค้างรับ: ${e.title}`, sub: `฿${Number(e.income).toLocaleString()}`, when: shortDate(e.date), ts: parseK(e.date).getTime() });
                });
                (bookings || []).forEach(b => {
                    if (!b.paid) {
                        const amt = Number(b.totalPrice) || 0;
                        alerts.push({ kind: "money", color: T.orange, title: `ค้างรับ: ${b.bandName || "ห้องซ้อม"}`, sub: `฿${amt.toLocaleString()}`, when: shortDate(b.date || TK), ts: parseK(b.date || TK).getTime() });
                    }
                });
            }
            return alerts.sort((a, b) => a.ts - b.ts);
        },
        // Sync desired push reminders to Supabase for closed-app delivery.
        async syncReminders(events, bookings, prefs) {
            try {
                if (!sb || !Push.supported())
                    return;
                const sub = await Push.currentSubscription();
                if (!sub)
                    return;
                const { data: userData } = await sb.auth.getUser();
                const user = userData && userData.user;
                if (!user)
                    return;
                prefs = normPrefs(prefs);
                const now = Date.now();
                const horizon = now + 45 * 24 * 3600 * 1000;
                const desired = [];
                const keys = new Set();
                (events || []).forEach(e => {
                    if (!e.startTime || e.status === "done")
                        return;
                    const cat = catOf(e);
                    if (!prefs[cat].on)
                        return;
                    const min = Number(prefs[cat].min) || 15;
                    const [H, M] = e.startTime.split(":").map(Number);
                    const d = parseK(e.date);
                    d.setHours(H, M, 0, 0);
                    const fire = d.getTime() - min * 60000;
                    if (fire > now && fire < horizon) {
                        const key = `evt:${e.id}:${e.date}:${e.startTime}:${min}`;
                        keys.add(key);
                        desired.push({ event_id: key, fire_at: new Date(fire).toISOString(), title: `ใกล้ถึงเวลา: ${e.title}`, body: `${e.startTime}${e.location ? " · " + e.location : ""}` });
                    }
                });
                if (prefs.budget.on) {
                    const delay = (Number(prefs.budget.delayDays) || 0) * 86400000;
                    const mkMoney = (id, title, amt, dateK) => {
                        const base = parseK(dateK || TK);
                        base.setHours(9, 0, 0, 0);
                        let fire = base.getTime() + delay;
                        if (fire < now + 60000)
                            fire = now + 60000;
                        if (fire >= horizon)
                            return;
                        const key = `money:${id}`;
                        keys.add(key);
                        desired.push({ event_id: key, fire_at: new Date(fire).toISOString(), title: `เงินค้างรับ: ${title}`, body: `฿${(Number(amt) || 0).toLocaleString()}` });
                    };
                    (events || []).forEach(e => { if (Number(e.income) > 0 && !e.paid && e.type !== "studio")
                        mkMoney("e" + e.id, e.title, e.income, e.date); });
                    (bookings || []).forEach(b => { if (!b.paid)
                        mkMoney("b" + b.id, b.bandName || "ห้องซ้อม", b.totalPrice, b.date); });
                }
                // Remove unsent reminders that are no longer wanted (event deleted,
                // paid, rescheduled, or category turned off).
                const { data: existing } = await sb.from("event_reminders").select("id,event_id,sent").eq("user_id", user.id);
                const delIds = (existing || []).filter(r => !r.sent && !keys.has(r.event_id)).map(r => r.id);
                if (delIds.length)
                    await sb.from("event_reminders").delete().in("id", delIds);
                // Insert new ones; ignore rows that already exist (so already-sent
                // reminders are never resent).
                if (desired.length) {
                    const rows = desired.map(d => ({ user_id: user.id, ...d, sent: false }));
                    await sb.from("event_reminders").upsert(rows, { onConflict: "user_id,event_id", ignoreDuplicates: true });
                }
            }
            catch (e) {
                console.warn("syncReminders failed", e);
            }
        },
    };

    function BellButton({ count, onClick }) {
        return React.createElement("button", { onClick: onClick, "aria-label": "การแจ้งเตือน", className: "relative w-10 h-10 rounded-xl flex items-center justify-center active:scale-90", style: { background: hex(T.surf2, .9), border: `1px solid ${T.border}` } },
            React.createElement(Bell, { size: 17, style: { color: count > 0 ? T.gold : T.sub } }),
            count > 0 && React.createElement("span", { className: "absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-extrabold", style: { background: T.red, color: "#fff", boxShadow: `0 0 6px ${hex(T.red, .8)}` } }, count > 9 ? "9+" : count));
    }

    function NotificationCenter({ events, bookings, notifPrefs, onClose }) {
        const alerts = Notify.computeAlerts(events, bookings, notifPrefs);
        return React.createElement(Sheet, { onClose: onClose, title: "การแจ้งเตือน" },
            alerts.length === 0
                ? React.createElement(Empty, { text: "ยังไม่มีการแจ้งเตือน — event ที่กำลังจะมาและเงินค้างรับจะโผล่ที่นี่" })
                : React.createElement("div", { className: "space-y-2" }, alerts.map((a, i) => React.createElement("div", { key: i, className: "flex items-center gap-3 p-3 rounded-xl", style: { background: T.surf2, border: `1px solid ${hex(a.color, .35)}` } },
                    React.createElement("span", { className: "w-8 h-8 rounded-lg flex items-center justify-center shrink-0", style: { background: hex(a.color, .16) } }, a.kind === "money" ? React.createElement(Wallet, { size: 15, style: { color: a.color } }) : React.createElement(Clock, { size: 15, style: { color: a.color } })),
                    React.createElement("div", { className: "flex-1 min-w-0" },
                        React.createElement("div", { className: "text-sm font-bold truncate" }, a.title),
                        React.createElement("div", { className: "text-[11px]", style: { color: T.muted } }, a.sub)),
                    React.createElement("span", { className: "text-[10px] font-semibold shrink-0", style: { color: a.color } }, a.when)))));
    }
