"use strict";
    const DRIVE_CLIENT_ID = "131799493461-df32kq5vdlbbkqg7n4r761kkea358l33.apps.googleusercontent.com";
    const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email";
    const DRIVE_FILENAME = "discipline-os-backup.json";
    const drive = {
        _tc: null,
        ready() { return typeof window !== "undefined" && window.google && window.google.accounts && window.google.accounts.oauth2; },
        connect(silent) {
            return new Promise((resolve, reject) => {
                if (!this.ready()) {
                    reject(new Error("Google ยังไม่พร้อม — ต้องเปิดบนเว็บจริง (GitHub Pages) ไม่ใช่ preview"));
                    return;
                }
                this._tc = window.google.accounts.oauth2.initTokenClient({
                    client_id: DRIVE_CLIENT_ID, scope: DRIVE_SCOPE,
                    callback: (resp) => { if (resp && resp.access_token)
                        resolve(resp.access_token);
                    else
                        reject(new Error("ไม่ได้รับสิทธิ์")); },
                    error_callback: (err) => reject(err || new Error("เชื่อมไม่สำเร็จ")),
                });
                this._tc.requestAccessToken({ prompt: silent ? "" : "consent" });
            });
        },
        async userEmail(token) {
            try {
                const r = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", { headers: { Authorization: "Bearer " + token } });
                if (!r.ok)
                    return "";
                const d = await r.json();
                return d.email || "";
            }
            catch {
                return "";
            }
        },
        async findFile(token) {
            const q = encodeURIComponent(`name='${DRIVE_FILENAME}' and trashed=false`);
            const r = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&spaces=drive&fields=files(id,modifiedTime)&pageSize=1`, { headers: { Authorization: "Bearer " + token } });
            if (!r.ok)
                throw new Error("ค้นหาไฟล์ไม่สำเร็จ (" + r.status + ")");
            const d = await r.json();
            return (d.files && d.files[0]) || null;
        },
        async createFile(token) {
            const r = await fetch("https://www.googleapis.com/drive/v3/files", { method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify({ name: DRIVE_FILENAME, mimeType: "application/json" }) });
            if (!r.ok)
                throw new Error("สร้างไฟล์ไม่สำเร็จ (" + r.status + ")");
            const d = await r.json();
            return d.id;
        },
        async writeMedia(token, fileId, obj) {
            const r = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, { method: "PATCH", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify(obj) });
            if (!r.ok) {
                const e = new Error("บันทึกไฟล์ไม่สำเร็จ (" + r.status + ")");
                e.status = r.status;
                throw e;
            }
            return true;
        },
        async read(token, fileId) {
            const r = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, { headers: { Authorization: "Bearer " + token } });
            if (!r.ok) {
                const e = new Error("อ่านไฟล์ไม่สำเร็จ (" + r.status + ")");
                e.status = r.status;
                throw e;
            }
            return r.json();
        },
    };

function SettingsSheet(props) {
    const { driveToken, driveEmail, connectDrive, disconnectDrive, saveToDrive, loadFromDrive,
        autoSync, setAutoSync, driveMsg, dataMsg, exportData, importData, confirmClear,
        setConfirmClear, clearAllData, setSettingsOpen, setDataMsg } = props;
    return (React.createElement(Sheet, { onClose: () => { setSettingsOpen(false); setDataMsg(""); setConfirmClear(false); }, title: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 & \u0E41\u0E1A\u0E47\u0E01\u0E2D\u0E31\u0E1E" },
                    React.createElement(Glass, { className: "p-3 mb-3 flex items-start gap-2" },
                        React.createElement(Cloud, { size: 16, style: { color: T.green }, className: "mt-0.5 shrink-0" }),
                        React.createElement("div", { className: "text-xs", style: { color: T.sub } },
                            "\u0E40\u0E0B\u0E1F\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34\u0E25\u0E07\u0E40\u0E04\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E19\u0E35\u0E49\u0E17\u0E38\u0E01\u0E01\u0E32\u0E23\u0E01\u0E14 (localStorage) \u2014 \u0E40\u0E1B\u0E34\u0E14\u0E43\u0E2B\u0E21\u0E48\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E04\u0E49\u0E32\u0E07\u0E40\u0E2D\u0E07 ",
                            React.createElement("span", { style: { color: T.muted } }, "\u00B7 \u0E43\u0E19\u0E2B\u0E19\u0E49\u0E32 preview \u0E19\u0E35\u0E49\u0E22\u0E31\u0E07\u0E23\u0E35\u0E40\u0E0B\u0E47\u0E15 \u0E40\u0E1E\u0E23\u0E32\u0E30 sandbox \u0E1B\u0E34\u0E14 storage \u0E41\u0E15\u0E48\u0E1A\u0E19\u0E40\u0E27\u0E47\u0E1A\u0E08\u0E23\u0E34\u0E07\u0E04\u0E49\u0E32\u0E07\u0E16\u0E32\u0E27\u0E23"))),
                    React.createElement(Label, null, "\u0E1A\u0E31\u0E0D\u0E0A\u0E35 Google \u00B7 \u0E0B\u0E34\u0E07\u0E04\u0E4C\u0E02\u0E36\u0E49\u0E19 Drive"),
                    !driveToken ? (React.createElement("button", { onClick: connectDrive, className: "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[.98] mb-1", style: { background: "#fff", color: "#000" } },
                        React.createElement(Cloud, { size: 16 }),
                        " \u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A\u0E14\u0E49\u0E27\u0E22 Google")) : (React.createElement("div", { className: "space-y-2 mb-1" },
                        React.createElement("div", { className: "flex items-center justify-between p-2.5 rounded-xl", style: { background: T.surf2, border: `1px solid ${hex(T.green, .4)}` } },
                            React.createElement("div", { className: "flex items-center gap-2 min-w-0" },
                                React.createElement("span", { className: "w-7 h-7 rounded-full flex items-center justify-center shrink-0", style: { background: hex(T.green, .16) } },
                                    React.createElement(Check, { size: 14, style: { color: T.green } })),
                                React.createElement("div", { className: "min-w-0" },
                                    React.createElement("div", { className: "text-[10px]", style: { color: T.muted } }, "\u0E25\u0E47\u0E2D\u0E01\u0E2D\u0E34\u0E19\u0E41\u0E25\u0E49\u0E27"),
                                    React.createElement("div", { className: "text-xs font-semibold truncate" }, driveEmail || "บัญชี Google"))),
                            React.createElement("button", { onClick: disconnectDrive, "aria-label": "\u0E2D\u0E2D\u0E01\u0E08\u0E32\u0E01\u0E23\u0E30\u0E1A\u0E1A", className: "w-8 h-8 rounded-lg flex items-center justify-center shrink-0", style: { color: T.muted } },
                                React.createElement(LogOut, { size: 15 }))),
                        React.createElement("div", { className: "flex gap-2" },
                            React.createElement("button", { onClick: () => saveToDrive(false), className: "flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 active:scale-[.98]", style: { background: T.green, color: "#000" } },
                                React.createElement(Cloud, { size: 15 }),
                                " Save \u0E02\u0E36\u0E49\u0E19 Drive"),
                            React.createElement("button", { onClick: loadFromDrive, className: "flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 active:scale-[.98]", style: { background: T.surf2, color: T.text, border: `1px solid ${T.border}` } },
                                React.createElement(Download, { size: 15 }),
                                " \u0E42\u0E2B\u0E25\u0E14\u0E08\u0E32\u0E01 Drive")),
                        React.createElement("button", { onClick: () => setAutoSync(a => !a), className: "w-full flex items-center justify-between p-2.5 rounded-xl active:scale-[.99]", style: { background: T.surf2, border: `1px solid ${autoSync ? hex(T.green, .4) : T.border}` } },
                            React.createElement("span", { className: "text-xs font-semibold", style: { color: autoSync ? T.green : T.sub } }, "\u0E0B\u0E34\u0E07\u0E04\u0E4C\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34 (\u0E2B\u0E25\u0E31\u0E07\u0E41\u0E01\u0E49 ~6 \u0E27\u0E34)"),
                            React.createElement("span", { className: "w-9 h-5 rounded-full flex items-center px-0.5 transition", style: { background: autoSync ? T.green : T.border, justifyContent: autoSync ? "flex-end" : "flex-start" } },
                                React.createElement("span", { className: "w-4 h-4 rounded-full", style: { background: "#fff" } }))))),
                    driveMsg && React.createElement("div", { className: "text-[11px] mt-1.5 px-1", style: { color: driveMsg.includes("ไม่สำเร็จ") || driveMsg.includes("หมดอายุ") ? T.red : T.muted } }, driveMsg),
                    React.createElement("div", { className: "text-[10px] mt-1 px-1", style: { color: T.muted } },
                        "\u0E44\u0E1F\u0E25\u0E4C\u0E40\u0E14\u0E35\u0E22\u0E27 ",
                        React.createElement("span", { style: { color: T.sub } }, "discipline-os-backup.json"),
                        " \u00B7 \u0E17\u0E31\u0E1A\u0E01\u0E31\u0E19\u0E41\u0E1A\u0E1A last-write-wins \u00B7 \u0E43\u0E0A\u0E49\u0E44\u0E14\u0E49\u0E1A\u0E19\u0E40\u0E27\u0E47\u0E1A\u0E08\u0E23\u0E34\u0E07 (GitHub Pages) \u0E40\u0E17\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19"),
                    React.createElement("div", { className: "mt-4" }),
                    React.createElement(Label, null, "\u0E2A\u0E33\u0E23\u0E2D\u0E07/\u0E22\u0E49\u0E32\u0E22\u0E40\u0E04\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E41\u0E1A\u0E1A\u0E44\u0E1F\u0E25\u0E4C (offline)"),
                    React.createElement("div", { className: "flex gap-2 mb-1" },
                        React.createElement("button", { onClick: exportData, className: "flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[.98]", style: { background: T.blue, color: "#000" } },
                            React.createElement(Download, { size: 16 }),
                            " Export JSON"),
                        React.createElement("label", { className: "flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[.98] cursor-pointer", style: { background: T.surf2, color: T.text, border: `1px solid ${T.border}` } },
                            React.createElement(Upload, { size: 16 }),
                            " Import",
                            React.createElement("input", { type: "file", accept: "application/json,.json", className: "hidden", onChange: e => { if (e.target.files[0])
                                    importData(e.target.files[0]); } }))),
                    dataMsg && React.createElement("div", { className: "text-xs mt-2 px-1", style: { color: T.green } }, dataMsg),
                    React.createElement("div", { className: "mt-4 mb-1" },
                        React.createElement(Label, null, "\u0E41\u0E08\u0E49\u0E07\u0E40\u0E15\u0E37\u0E2D\u0E19 (\u0E1C\u0E48\u0E32\u0E19\u0E1B\u0E0F\u0E34\u0E17\u0E34\u0E19\u0E40\u0E04\u0E23\u0E37\u0E48\u0E2D\u0E07)")),
                    React.createElement("div", { className: "p-3 rounded-xl", style: { border: `1px solid ${T.border}`, background: T.surf2 } },
                        React.createElement("div", { className: "text-[11px] leading-relaxed", style: { color: T.sub } },
                            "\u0E43\u0E19\u0E2B\u0E19\u0E49\u0E32 ",
                            React.createElement("span", { style: { color: T.purple, fontWeight: 700 } }, "Calendar"),
                            " \u0E01\u0E14 ",
                            React.createElement("span", { style: { color: T.green, fontWeight: 700 } }, "\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E25\u0E07\u0E1B\u0E0F\u0E34\u0E17\u0E34\u0E19"),
                            " \u0E17\u0E35\u0E48 event (\u0E2B\u0E23\u0E37\u0E2D\u0E1B\u0E38\u0E48\u0E21 \u201C\u0E1B\u0E0F\u0E34\u0E17\u0E34\u0E19\u0E27\u0E31\u0E19\u0E19\u0E35\u0E49/\u0E2A\u0E31\u0E1B\u0E14\u0E32\u0E2B\u0E4C\u201D) \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E2A\u0E48\u0E07\u0E40\u0E02\u0E49\u0E32\u0E1B\u0E0F\u0E34\u0E17\u0E34\u0E19\u0E40\u0E04\u0E23\u0E37\u0E48\u0E2D\u0E07 \u2014 Apple Calendar \u0E08\u0E30\u0E40\u0E15\u0E37\u0E2D\u0E19\u0E43\u0E2B\u0E49\u0E41\u0E1A\u0E1A native \u0E25\u0E48\u0E27\u0E07\u0E2B\u0E19\u0E49\u0E32 ",
                            ICS_ALARM_MIN,
                            " \u0E19\u0E32\u0E17\u0E35 \u0E17\u0E33\u0E07\u0E32\u0E19\u0E41\u0E21\u0E49\u0E1B\u0E34\u0E14\u0E41\u0E2D\u0E1B \u0E44\u0E21\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21 Google")),
                    React.createElement("div", { className: "mt-5 p-3 rounded-xl", style: { border: `1px dashed ${hex(T.red, .5)}` } },
                        React.createElement("div", { className: "text-xs font-bold mb-1", style: { color: T.red } }, "\u0E25\u0E49\u0E32\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14 (\u0E40\u0E23\u0E34\u0E48\u0E21\u0E43\u0E2B\u0E21\u0E48)"),
                        React.createElement("div", { className: "text-[11px] mb-2", style: { color: T.muted } }, "\u0E25\u0E1A event / \u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07 / \u0E23\u0E32\u0E22\u0E23\u0E31\u0E1A-\u0E08\u0E48\u0E32\u0E22 / workout / \u0E42\u0E20\u0E0A\u0E19\u0E32\u0E01\u0E32\u0E23 \u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14\u0E43\u0E19\u0E40\u0E04\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E19\u0E35\u0E49 \u0E40\u0E23\u0E34\u0E48\u0E21\u0E08\u0E32\u0E01\u0E28\u0E39\u0E19\u0E22\u0E4C \u2014 \u0E01\u0E14 Export \u0E2B\u0E23\u0E37\u0E2D Save \u0E02\u0E36\u0E49\u0E19 Drive \u0E01\u0E48\u0E2D\u0E19\u0E16\u0E49\u0E32\u0E2D\u0E22\u0E32\u0E01\u0E40\u0E01\u0E47\u0E1A\u0E44\u0E27\u0E49"),
                        confirmClear ? (React.createElement("div", { className: "flex gap-2" },
                            React.createElement("button", { onClick: () => { clearAllData(); setConfirmClear(false); }, className: "flex-1 py-2.5 rounded-xl font-bold", style: { background: T.red, color: "#fff" } }, "\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E25\u0E49\u0E32\u0E07\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14"),
                            React.createElement("button", { onClick: () => setConfirmClear(false), className: "flex-1 py-2.5 rounded-xl font-bold", style: { background: T.surf2, color: T.sub, border: `1px solid ${T.border}` } }, "\u0E22\u0E01\u0E40\u0E25\u0E34\u0E01"))) : (React.createElement("button", { onClick: () => setConfirmClear(true), className: "w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2", style: { background: hex(T.red, .14), color: T.red, border: `1px solid ${hex(T.red, .5)}` } },
                            React.createElement(Trash2, { size: 15 }),
                            " \u0E25\u0E49\u0E32\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14")))));
}
