"use strict";
    const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL"; // TODO: ใส่ Project URL จาก Supabase (Settings > API)
    const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY"; // TODO: ใส่ anon public key จาก Supabase (Settings > API)
    const sb = (SUPABASE_URL.startsWith("http") && window.supabase)
        ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
        : null;
    const Auth = {
        ready() { return !!sb; },
        signInWithGoogle() {
            if (!sb)
                return Promise.reject(new Error("ยังไม่ได้ตั้งค่า Supabase (ดู js/auth.js)"));
            return sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin + window.location.pathname } });
        },
        signOut() { return sb ? sb.auth.signOut() : Promise.resolve(); },
        async getSession() {
            if (!sb)
                return null;
            const { data } = await sb.auth.getSession();
            return data.session || null;
        },
        onChange(cb) {
            if (!sb)
                return () => { };
            const { data } = sb.auth.onAuthStateChange((_event, session) => cb(session));
            return () => data.subscription.unsubscribe();
        },
    };
    function LoginScreen({ error }) {
        const [busy, setBusy] = useState(false);
        const [err, setErr] = useState(error || "");
        const doLogin = async () => {
            setErr("");
            setBusy(true);
            try {
                await Auth.signInWithGoogle();
            }
            catch (e) {
                setErr((e && e.message) || "เข้าสู่ระบบไม่สำเร็จ");
                setBusy(false);
            }
        };
        return (React.createElement("div", { className: "min-h-screen w-full flex items-center justify-center px-6", style: { background: T.bg, color: T.text, fontFamily: "system-ui,-apple-system,sans-serif" } },
            React.createElement("div", { className: "w-full max-w-sm text-center" },
                React.createElement("div", { className: "text-2xl font-extrabold mb-1", style: { color: T.text } }, "Discipline OS"),
                React.createElement("div", { className: "text-xs mb-8", style: { color: T.muted } }, "เข้าสู่ระบบด้วย Google เพื่อใช้งาน"),
                React.createElement("button", { onClick: doLogin, disabled: busy, className: "w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[.98] disabled:opacity-60", style: { background: "#fff", color: "#000" } },
                    React.createElement("svg", { width: 18, height: 18, viewBox: "0 0 48 48" },
                        React.createElement("path", { fill: "#FFC107", d: "M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.1 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-4.5z" }),
                        React.createElement("path", { fill: "#FF3D00", d: "M6.3 14.7l6.6 4.8C14.5 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.1 5.1 29.3 3 24 3 16.3 3 9.7 7.3 6.3 14.7z" }),
                        React.createElement("path", { fill: "#4CAF50", d: "M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36.4 26.7 37 24 37c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 40.6 16.2 45 24 45z" }),
                        React.createElement("path", { fill: "#1976D2", d: "M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C40.8 36 44 30.5 44 24c0-1.4-.1-2.7-.4-3.5z" })),
                    busy ? "กำลังเชื่อม…" : "เข้าสู่ระบบด้วย Google"),
                err && React.createElement("div", { className: "text-xs mt-3", style: { color: T.red } }, err),
                !Auth.ready() && React.createElement("div", { className: "text-[11px] mt-6 p-3 rounded-xl text-left", style: { background: T.surf2, color: T.muted, border: `1px solid ${T.border}` } }, "ยังไม่ได้ตั้งค่า SUPABASE_URL / SUPABASE_ANON_KEY ใน js/auth.js"))));
    }
