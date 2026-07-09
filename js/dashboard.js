"use strict";
    function Dashboard(props) {
        const { events, workouts } = props;
        const row = Array.from({ length: 7 }, (_, i) => {
            const dt = addDays(today, -6 + i);
            const k = dkey(dt);
            const evs = events.filter(e => e.date === k);
            return {
                dn: TH_D[dt.getDay()],
                done: evs.filter(e => e.status === "done").length,
                total: evs.length,
                trained: workouts.some(w => w.date === k),
                vol: workouts.filter(w => w.date === k).reduce((sum, w) => sum + (w.exercises || []).reduce((s2, e) => s2 + (e.sets || []).reduce((s3, st) => s3 + (Number(st.reps) || 0) * (Number(st.weight) || 0), 0), 0), 0),
            };
        });
        const doneSum = row.reduce((s, x) => s + x.done, 0);
        const totalSum = row.reduce((s, x) => s + x.total, 0);
        const trainCount = row.filter(x => x.trained).length;
        const volArr = row.map(x => x.vol);
        const volSum = volArr.reduce((a, b) => a + b, 0);
        const maxVol = Math.max(1, ...volArr);
        const tEvents = events.filter(e => e.date === TK);
        const doneItems = tEvents.filter(e => e.status === "done").length;
        const totItems = tEvents.length;
        const pctToday = totItems ? Math.round(doneItems / totItems * 100) : 0;
        const R = 52, C = 2 * Math.PI * R, dash = C * (1 - pctToday / 100);
        const ringC = pctToday >= 100 ? T.green : pctToday >= 50 ? T.purple : T.blue;
        return (React.createElement("div", { className: "px-4 pt-5 space-y-4" },
            React.createElement("h1", { className: "text-2xl font-extrabold" }, "Dashboard"),
            React.createElement(Glass, { className: "p-4", glowColor: ringC },
                React.createElement("div", { className: "flex items-center gap-4" },
                    React.createElement("div", { className: "relative shrink-0", style: { width: 132, height: 132 } },
                        React.createElement("svg", { width: "132", height: "132", viewBox: "0 0 132 132", style: { transform: "rotate(-90deg)" } },
                            React.createElement("circle", { cx: "66", cy: "66", r: R, fill: "none", stroke: T.surf2, strokeWidth: "11" }),
                            React.createElement("circle", { cx: "66", cy: "66", r: R, fill: "none", stroke: ringC, strokeWidth: "11", strokeLinecap: "round", strokeDasharray: C, strokeDashoffset: dash, style: { transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 6px ${hex(ringC, .7)})` } })),
                        React.createElement("div", { className: "absolute inset-0 flex flex-col items-center justify-center" },
                            React.createElement("span", { className: "text-[34px] font-extrabold leading-none", style: { color: ringC } },
                                pctToday,
                                React.createElement("span", { className: "text-lg" }, "%")),
                            React.createElement("span", { className: "text-[9px] font-bold tracking-wider mt-1", style: { color: T.muted } }, "\u0E27\u0E31\u0E19\u0E19\u0E35\u0E49\u0E40\u0E2A\u0E23\u0E47\u0E08"))),
                    React.createElement("div", { className: "flex-1 min-w-0" },
                        React.createElement("div", { className: "text-xs", style: { color: T.muted } }, "\u0E07\u0E32\u0E19\u0E17\u0E35\u0E48\u0E17\u0E33\u0E40\u0E2A\u0E23\u0E47\u0E08\u0E27\u0E31\u0E19\u0E19\u0E35\u0E49"),
                        React.createElement("div", { className: "text-2xl font-extrabold mt-0.5" },
                            doneItems,
                            React.createElement("span", { className: "text-base font-bold", style: { color: T.muted } },
                                "/",
                                totItems,
                                " \u0E07\u0E32\u0E19")),
                        React.createElement("div", { className: "mt-2 space-y-1" },
                            React.createElement("div", { className: "flex items-center justify-between text-[11px]" },
                                React.createElement("span", { style: { color: T.sub } }, "\u0E07\u0E32\u0E19 (Timeline)"),
                                React.createElement("span", { className: "font-bold", style: { color: T.blue } },
                                    tEvents.filter(e => e.status === "done").length,
                                    "/",
                                    tEvents.length)),
                            React.createElement("div", { className: "flex items-center justify-between text-[11px]" },
                                React.createElement("span", { style: { color: T.sub } }, "\u0E40\u0E17\u0E23\u0E19\u0E2A\u0E31\u0E1B\u0E14\u0E32\u0E2B\u0E4C\u0E19\u0E35\u0E49"),
                                React.createElement("span", { className: "font-bold", style: { color: T.cyan } },
                                    trainCount,
                                    "/7 \u0E27\u0E31\u0E19")))))),
            React.createElement("div", { className: "grid grid-cols-3 gap-2.5" }, [["\u0E07\u0E32\u0E19\u0E40\u0E2A\u0E23\u0E47\u0E08 7d", `${doneSum}/${totalSum}`, "", T.blue, Check], ["\u0E40\u0E17\u0E23\u0E19 7d", `${trainCount}/7`, "\u0E27\u0E31\u0E19", T.green, Dumbbell], ["Volume 7d", volSum >= 1000 ? (volSum / 1000).toFixed(1) + "k" : `${volSum}`, "kg", T.cyan, TrendingUp]].map(([lab, val, unit, c, Ic], i) => (React.createElement(Glass, { key: i, className: "p-3 text-center" },
                React.createElement("div", { className: "w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1.5", style: { background: hex(c, .16) } },
                    React.createElement(Ic, { size: 15, style: { color: c } })),
                React.createElement("div", { className: "text-lg font-extrabold leading-none" },
                    val,
                    React.createElement("span", { className: "text-[10px] font-bold ml-0.5", style: { color: T.muted } }, unit)),
                React.createElement("div", { className: "text-[10px] mt-1", style: { color: T.muted } }, lab))))),
            React.createElement(Glass, { className: "p-4" },
                React.createElement("div", { className: "flex items-center gap-2 mb-3" },
                    React.createElement(TrendingUp, { size: 15, style: { color: T.green } }),
                    React.createElement("span", { className: "text-sm font-bold" }, "Volume \u0E01\u0E32\u0E23\u0E22\u0E01 (kg)"),
                    React.createElement("span", { className: "text-[10px] ml-auto", style: { color: T.muted } },
                        "\u0E23\u0E27\u0E21 ",
                        volSum.toLocaleString(),
                        " kg")),
                React.createElement("div", { className: "flex items-end justify-between gap-1.5", style: { height: 90 } }, row.map((x, i) => (React.createElement("div", { key: i, className: "flex-1 flex flex-col items-center gap-1 h-full justify-end" },
                    React.createElement("span", { className: "text-[8px] font-bold", style: { color: x.vol ? T.green : T.muted } }, x.vol ? (x.vol >= 1000 ? (x.vol / 1000).toFixed(1) + "k" : x.vol) : "\u2013"),
                    React.createElement("div", { className: "w-full rounded-t-md", style: { height: `${x.vol ? Math.max(6, (x.vol / maxVol) * 100) : 4}%`, background: x.vol ? T.green : T.border, boxShadow: x.vol ? `0 0 6px ${hex(T.green, .4)}` : "none" } }),
                    React.createElement("span", { className: "text-[9px]", style: { color: T.muted } }, x.dn))))),
                React.createElement("div", { className: "text-[9px] text-center mt-1.5", style: { color: T.muted } }, "\u03A3 \u0E04\u0E23\u0E31\u0E49\u0E07 \u00D7 \u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01 \u0E08\u0E32\u0E01\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E01\u0E32\u0E23\u0E40\u0E25\u0E48\u0E19\u0E08\u0E23\u0E34\u0E07")),
            React.createElement(Glass, { className: "p-4" },
                React.createElement("div", { className: "text-sm font-bold mb-3" }, "\u0E07\u0E32\u0E19\u0E40\u0E2A\u0E23\u0E47\u0E08\u0E23\u0E32\u0E22\u0E27\u0E31\u0E19"),
                React.createElement("div", { className: "flex items-end justify-between gap-1.5", style: { height: 90 } }, row.map((x, i) => {
                    const mx = Math.max(1, ...row.map(r2 => r2.total));
                    return (React.createElement("div", { key: i, className: "flex-1 flex flex-col items-center gap-1 h-full justify-end" },
                        React.createElement("span", { className: "text-[8px] font-bold", style: { color: x.total ? T.blue : T.muted } }, x.total ? `${x.done}/${x.total}` : "\u2013"),
                        React.createElement("div", { className: "w-full rounded-t-md", style: { height: `${x.total ? Math.max(6, (x.done / mx) * 100) : 4}%`, background: x.done ? T.blue : T.border } }),
                        React.createElement("span", { className: "text-[9px]", style: { color: T.muted } }, x.dn)));
                }))),
            React.createElement("div", { className: "text-[10px] text-center pb-2", style: { color: T.muted } }, "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E23\u0E34\u0E07\u0E08\u0E32\u0E01 event \u00B7 workout log \u0E43\u0E19 7 \u0E27\u0E31\u0E19\u0E25\u0E48\u0E32\u0E2A\u0E38\u0E14")));
    }
