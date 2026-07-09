"use strict";
    const VAPID_PUBLIC_KEY = "BFzySgmLqKeiUlprs50JeLdlgRFXupFCxu2LX5eb0DmAIns_NmrMmPwdnL8Gn-bKyxBsB-Ei7YESuJALruWEe-k";

    function urlBase64ToUint8Array(base64String) {
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
        const rawData = atob(base64);
        const out = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; i++)
            out[i] = rawData.charCodeAt(i);
        return out;
    }

    const Push = {
        supported() {
            return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
        },
        async registerSW() {
            if (!("serviceWorker" in navigator))
                return null;
            return navigator.serviceWorker.register("sw.js");
        },
        async permission() {
            if (!("Notification" in window))
                return "unsupported";
            return Notification.permission;
        },
        async currentSubscription() {
            if (!this.supported())
                return null;
            const reg = await navigator.serviceWorker.ready.catch(() => null);
            if (!reg)
                return null;
            return reg.pushManager.getSubscription();
        },
        async subscribe() {
            if (!this.supported())
                throw new Error("อุปกรณ์/เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน (iOS ต้อง Add to Home Screen ก่อนถึงจะใช้ได้)");
            if (!sb)
                throw new Error("ยังไม่ได้ล็อกอิน");
            const { data: userData } = await sb.auth.getUser();
            const user = userData && userData.user;
            if (!user)
                throw new Error("ยังไม่ได้ล็อกอิน");
            const perm = await Notification.requestPermission();
            if (perm !== "granted")
                throw new Error("ไม่ได้รับอนุญาตแจ้งเตือน");
            await this.registerSW();
            const reg = await navigator.serviceWorker.ready;
            let sub = await reg.pushManager.getSubscription();
            if (!sub) {
                sub = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
                });
            }
            const json = sub.toJSON();
            const { error } = await sb.from("push_subscriptions").upsert({
                user_id: user.id,
                endpoint: json.endpoint,
                p256dh: json.keys.p256dh,
                auth: json.keys.auth,
            }, { onConflict: "endpoint" });
            if (error)
                throw error;
            return sub;
        },
        async unsubscribe() {
            const sub = await this.currentSubscription();
            if (sub) {
                if (sb)
                    await sb.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
                await sub.unsubscribe();
            }
        },
        async sendTest() {
            if (!sb)
                throw new Error("ยังไม่ได้ล็อกอิน");
            const { data, error } = await sb.functions.invoke("send-push", {
                body: { title: "Discipline OS", body: "ทดสอบแจ้งเตือน — ถ้าเห็นข้อความนี้แปลว่าใช้งานได้แล้ว 🎉" },
            });
            if (error)
                throw error;
            return data;
        },
    };
    if (Push.supported())
        Push.registerSW().catch(() => { });
