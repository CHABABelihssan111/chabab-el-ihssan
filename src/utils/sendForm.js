// إرسال نموذج إلى الخادم (public/feedback/send.php). يعيد true عند النجاح.
export async function sendForm(fields) {
    try {
        const body = new URLSearchParams({ page: window.location.pathname, ...fields });
        const r = await fetch('/feedback/send.php', { method: 'POST', body });
        const j = await r.json().catch(() => ({}));
        return r.ok && j.ok === 1;
    } catch {
        return false;
    }
}
