"use strict";
    const Notify = {
        // Build the in-app alert list from existing local data (no server needed).
        computeAlerts(events, bookings) {
            const now = Date.now();
            const alerts = [];
            (events || []).forEach(e => {
                if (!e.startTime || e.status === "done")
                    return;
                if (e.date < TK)
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
            (events || []).forEach(e => {
                if (Number(e.income) > 0 && !e.paid && e.type !== "studio") {
                    alerts.push({ kind: "money", color: T.orange, title: `ค้างรับ: ${e.title}`, sub: `฿${Number(e.income).toLocaleString()}`, when: shortDate(e.date), ts: parseK(e.date).getTime() });
                }
            });
            (bookings || []).forEach(b => {
                if (!b.paid) {
                    const amt = Number(b.totalPrice) || 0;
                    alerts.push({ kind: "money", color: T.orange, title: `ค้างรับ: ${b.bandName || "ห้องซ้อม"}`, sub: `฿${amt.toLocaleString()}`, when: shortDate(b.date || TK), ts: parseK(b.date || TK).getTime() });
                }
            });
            return alerts.sort((a, b) => a.ts - b.ts);
        },
        // Push future event reminders up to Supabase so the server can deliver
        // them even when the app is closed. Safe no-op if not subscribed.
        async syncReminders(events, minutes, enabled) {
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
                await sb.from("event_reminders").delete().eq("user_id", user.id).eq("sent", false);
                if (!enabled)
                    return;
                const now = Date.now();
                const horizon = now + 45 * 24 * 3600 * 1000;
                const lead = (Number(minutes) || 15) * 60000;
                const rows = [];
                (events || []).forEach(e => {
                    if (!e.startTime || e.status === "done")
                        return;
                    const [H, M] = e.startTime.split(":").map(Number);
                    const d = parseK(e.date);
                    d.setHours(H, M, 0, 0);
                    const fire = d.getTime() - lead;
                    if (fire > now && fire < horizon) {
                        rows.push({
                            user_id: user.id,
                            event_id: String(e.id),
                            fire_at: new Date(fire).toISOString(),
                            title: `ใกล้ถึงเวลา: ${e.title}`,
                            body: `${e.startTime}${e.location ? " · " + e.location : ""}`,
                            sent: false,
                        });
                    }
                });
                if (rows.length)
                    await sb.from("event_reminders").insert(rows);
            }
            catch (e) {
                // Non-fatal: reminders are best-effort. Console for debugging.
                console.warn("syncReminders failed", e);
            }
        },
    };

    function BellButton({ count, onClick }) {
        return React.createElement("button", { onClick: onClick, "aria-label": "การแจ้งเตือน", className: "relative w-10 h-10 rounded-xl flex items-center justify-center active:scale-90", style: { background: hex(T.surf2, .9), border: `1px solid ${T.border}` } },
            React.createElement(Bell, { size: 17, style: { color: count > 0 ? T.gold : T.sub } }),
            count > 0 && React.createElement("span", { className: "absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-extrabold", style: { background: T.red, color: "#fff", boxShadow: `0 0 6px ${hex(T.red, .8)}` } }, count > 9 ? "9+" : count));
    }

    function NotificationCenter({ events, bookings, onClose }) {
        const alerts = Notify.computeAlerts(events, bookings);
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
