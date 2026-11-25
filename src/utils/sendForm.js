// إرسال النماذج، مع دعم ملفات وصل التبرع.
export async function sendForm(fields) {
    try {
        const body = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
            if (value == null) return;
            if (key === 'receipt' && value instanceof File) body.append('receipt', value);
            else body.append(key, String(value));
        });
        body.append('page', window.location.pathname);
        const r = await fetch('/feedback/send.php', { method: 'POST', body });
        const j = await r.json().catch(() => ({}));
        return r.ok && j.ok === 1;
    } catch {
        return false;
    }
}
