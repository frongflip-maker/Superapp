"use strict";
    const STORAGE_KEY = "discipline_os";
    const SCHEMA_VERSION = 1;
    const localAdapter = {
        load() { try {
            const s = localStorage.getItem(STORAGE_KEY);
            return s ? JSON.parse(s) : null;
        }
        catch {
            return null;
        } },
        save(d) { try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
        }
        catch { } },
    };
    const storage = localAdapter;
    function migrate(snap) {
        if (!snap || typeof snap !== "object")
            return null;
        const s = { ...snap };
        s.version ?? (s.version = 1);
        s.events ?? (s.events = []);
        s.bookings ?? (s.bookings = []);
        s.loyaltyBase ?? (s.loyaltyBase = {});
        s.bookings = s.bookings.map(b => { const paid = b.paid ?? (b.paymentStatus === "Paid"); const done = b.done ?? (b.bookingStatus === "Completed"); return { deposit: 0, ...b, paid, done }; });
        s.transactions ?? (s.transactions = []);
        s.capital ?? (s.capital = 0);
        s.workouts ?? (s.workouts = []);
        s.nutrition ?? (s.nutrition = {});
        s.nutriTargets ?? (s.nutriTargets = { cal: 2200, protein: 140, carb: 220, fat: 70, sugar: 40, sodium: 2000, chol: 300 });
        s.exPresets ?? (s.exPresets = []);
        s.workoutPresets ?? (s.workoutPresets = []);
        s.fitnessSplit ?? (s.fitnessSplit = null);
        s.fitnessStartDay ?? (s.fitnessStartDay = 1);
        s.fitnessConfirmed ?? (s.fitnessConfirmed = {});
        s.driveConnected ?? (s.driveConnected = false);
        s.driveFileId ?? (s.driveFileId = null);
        s.autoSync ?? (s.autoSync = true);
        if (!s.notifPrefs) {
            const min = typeof s.reminderMinutes === "number" ? s.reminderMinutes : 15;
            const on = s.remindersEnabled !== false;
            s.notifPrefs = { event: { on, min }, studio: { on: true, min: 30 }, fitness: { on: true, min: 30 }, budget: { on: true, delayDays: 0 } };
        }
        s.accounts ?? (s.accounts = []);
        s.fixedCosts ?? (s.fixedCosts = []);
        delete s.quests;
        delete s.questTemplates;
        delete s.activityTypes;
        delete s.customLibrary;
        delete s.deckHidden;
        delete s.whoop;
        delete s.reviews;
        delete s.baseExp;
        delete s.goals;
        s.expensePresets ?? (s.expensePresets = ["ค่าไฟ", "ค่าน้ำ", "ค่าเช่า", "ซ่อมอุปกรณ์", "ซื้อของ", "ค่าอินเทอร์เน็ต", "ค่าโทรศัพท์"]);
        s.txnCategories ?? (s.txnCategories = { income: ["งานสอน", "ห้องซ้อม", "ขายของ", "อื่นๆ"], expense: ["ค่าใช้จ่ายส่วนตัว", "อุปกรณ์/เครื่องดนตรี", "ค่าเช่า/บิล", "อื่นๆ"] });
        {
            const defIncome = ["งานสอน", "ห้องซ้อม", "ขายของ", "ดอกเบี้ย", "เงินปันผล/กำไรลงทุน", "งานเล่นดนตรี/รับงานแสดง", "อื่นๆ"];
            const defExpense = ["ค่าใช้จ่ายส่วนตัว", "อุปกรณ์/เครื่องดนตรี", "ค่าเช่า/บิล", "ค่าใช้จ่ายประจำ", "อื่นๆ"];
            if (!s.txnCategories.income || s.txnCategories.income.length === 0)
                s.txnCategories.income = [...defIncome];
            else
                defIncome.forEach(c => { if (!s.txnCategories.income.includes(c))
                    s.txnCategories.income.push(c); });
            if (!s.txnCategories.expense || s.txnCategories.expense.length === 0)
                s.txnCategories.expense = [...defExpense];
            else
                defExpense.forEach(c => { if (!s.txnCategories.expense.includes(c))
                    s.txnCategories.expense.push(c); });
        }
        {
            let cashId = s.accounts.find(a => a.name === "เงินสด")?.id;
            let unassignedId = s.accounts.find(a => a.name === "บัญชีที่ยังไม่ระบุ")?.id;
            const ensureCash = () => { if (!cashId) {
                cashId = uid();
                s.accounts.push({ id: cashId, name: "เงินสด", startBalance: 0 });
            } return cashId; };
            const ensureUnassigned = () => { if (!unassignedId) {
                unassignedId = uid();
                s.accounts.push({ id: unassignedId, name: "บัญชีที่ยังไม่ระบุ", startBalance: 0 });
            } return unassignedId; };
            const mapMethod = (m) => m === "cash" ? ensureCash() : m === "transfer" ? ensureUnassigned() : null;
            s.events = s.events.map(e => e.accountId !== undefined ? e : { ...e, accountId: mapMethod(e.payMethod), tipAccountId: mapMethod(e.tipMethod || e.payMethod) });
            s.bookings = s.bookings.map(b => b.accountId !== undefined ? b : { ...b, accountId: mapMethod(b.payMethod) });
            s.transactions = s.transactions.map(t => t.migratedAccount ? t : { ...t, kind: t.kind === "transfer" ? "transfer" : t.kind, accountId: t.accountId ?? ensureCash(), category: t.category ?? "อื่นๆ", migratedAccount: true });
        }
        return s;
    }
