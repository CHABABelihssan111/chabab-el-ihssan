<?php
// عدّاد زيارات بسيط بدون كوكيز وبدون تخزين IP — يحفظ فقط أعداداً يومية.
header('Cache-Control: no-store');
header('Content-Type: application/json; charset=utf-8');
$ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
if ($ua === '' || preg_match('/bot|crawl|spider|slurp|preview|monitor|curl|wget|headless/i', $ua)) { echo '{"ok":0}'; exit; }

// --- حدّ الطلبات: 250 طلب/دقيقة لكل عنوان (كريم لأن شبكات الهاتف تتشارك عنواناً واحداً). لا يُخزَّن الـ IP نفسه بل بصمته فقط.
// إن تعذّرت الكتابة في المجلد المؤقت يستمر العدّاد بشكل عادي (لا يتعطل شيء).
$rl = sys_get_temp_dir() . '/cei-rl-hit-' . substr(hash('sha256', 'cei-rl:' . ($_SERVER['REMOTE_ADDR'] ?? 'x')), 0, 24);
$now = time();
$hits = is_file($rl) ? json_decode((string)@file_get_contents($rl), true) : [];
$hits = array_values(array_filter(is_array($hits) ? $hits : [], function ($t) use ($now) { return $t > $now - 60; }));
if (count($hits) >= 250) { http_response_code(429); echo '{"ok":0}'; exit; }
$hits[] = $now;
@file_put_contents($rl, json_encode($hits), LOCK_EX);

$file = (is_writable(dirname($_SERVER['DOCUMENT_ROOT'] ?? __DIR__)) ? dirname($_SERVER['DOCUMENT_ROOT']) : __DIR__) . '/cei-stats.json';
$day = date('Y-m-d');
$P = $_POST + $_GET;
$visit = (($P['v'] ?? '0') === '1');

function clean($s, $n = 60) { $s = strtolower(trim((string)$s)); $s = preg_replace('/[^a-z0-9\-_.\/\x{0600}-\x{06FF}]/u', '', $s); return mb_substr($s, 0, $n); }
function bump(&$d, $day, $map, $key, $by = 1) {
    if ($key === '' || $key === null) return;
    if (!isset($d[$day][$map])) $d[$day][$map] = [];
    if (!isset($d[$day][$map][$key]) && count($d[$day][$map]) >= 80) return; // حماية من التضخم
    $d[$day][$map][$key] = ($d[$day][$map][$key] ?? 0) + $by;
}

// --- تصنيف المصدر: وسم الرابط (?src=) ← متصفح التطبيق ← الـ referrer ← مباشر
$known = ['facebook' => 'facebook', 'fb' => 'facebook', 'l.facebook' => 'facebook', 'lm.facebook' => 'facebook', 'instagram' => 'instagram', 'l.instagram' => 'instagram', 'ig' => 'instagram',
  'whatsapp' => 'whatsapp', 'wa' => 'whatsapp', 'wa.me' => 'whatsapp', 'api.whatsapp' => 'whatsapp', 'tiktok' => 'tiktok', 'youtube' => 'youtube', 'youtu.be' => 'youtube',
  't.co' => 'twitter', 'twitter' => 'twitter', 'x.com' => 'twitter', 'x' => 'twitter', 'telegram' => 'telegram', 't.me' => 'telegram', 'snapchat' => 'snapchat',
  'linkedin' => 'linkedin', 'lnkd.in' => 'linkedin', 'pinterest' => 'pinterest', 'messenger' => 'messenger', 'google' => 'google', 'bing' => 'bing', 'yahoo' => 'yahoo',
  'duckduckgo' => 'duckduckgo', 'yandex' => 'yandex', 'reddit' => 'reddit', 'threads' => 'threads'];
$tag = clean($P['s'] ?? '', 30);
$refHost = clean(preg_replace('/^www\./', '', (string)($P['r'] ?? '')), 80);
$src = '';
if ($tag !== '') $src = $known[$tag] ?? $tag;
if ($src === '') {
    if (preg_match('/FBAN|FBAV|FB_IAB/i', $ua)) $src = 'facebook';
    elseif (stripos($ua, 'Instagram') !== false) $src = 'instagram';
    elseif (stripos($ua, 'musical_ly') !== false || stripos($ua, 'TikTok') !== false || stripos($ua, 'BytedanceWebview') !== false) $src = 'tiktok';
    elseif (stripos($ua, 'Snapchat') !== false) $src = 'snapchat';
}
if ($src === '' && $refHost !== '') {
    foreach ($known as $k => $v) { if ($refHost === $k || strpos($refHost, $k . '.') === 0 || strpos($refHost, '.' . $k . '.') !== false || substr($refHost, -strlen($k) - 1) === '.' . $k) { $src = $v; break; } }
    if ($src === '') $src = ($refHost === clean($_SERVER['HTTP_HOST'] ?? '')) ? 'direct' : 'site:' . $refHost;
}
if ($src === '') $src = 'direct';

// --- جهاز / نظام / متصفح (من الـ User-Agent بدون تخزينه)
$dev = preg_match('/iPad|Tablet/i', $ua) ? 'tablet' : (preg_match('/Mobi|Android|iPhone/i', $ua) ? 'mobile' : 'desktop');
$os = preg_match('/Android/i', $ua) ? 'Android' : (preg_match('/iPhone|iPad|iOS/i', $ua) ? 'iOS' : (preg_match('/Windows/i', $ua) ? 'Windows' : (preg_match('/Mac OS/i', $ua) ? 'macOS' : (preg_match('/Linux/i', $ua) ? 'Linux' : 'other'))));
$br = preg_match('/FBAN|FBAV/i', $ua) ? 'Facebook app' : (stripos($ua, 'Instagram') !== false ? 'Instagram app' : (preg_match('/SamsungBrowser/i', $ua) ? 'Samsung' : (preg_match('/Edg/i', $ua) ? 'Edge' : (preg_match('/OPR|Opera/i', $ua) ? 'Opera' : (preg_match('/Firefox|FxiOS/i', $ua) ? 'Firefox' : (preg_match('/Chrome|CriOS/i', $ua) ? 'Chrome' : (preg_match('/Safari/i', $ua) ? 'Safari' : 'other')))))));
$lang = clean(substr((string)($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? ''), 0, 2), 2) ?: 'xx';
$page = clean($P['p'] ?? '/', 80) ?: '/';
$tz = clean($P['z'] ?? '', 40);
$sw = (int)($P['w'] ?? 0); $scr = $sw ? ($sw < 480 ? '<480' : ($sw < 768 ? '480-767' : ($sw < 1200 ? '768-1199' : '1200+'))) : '';
$isNew = (($P['n'] ?? '') === '1');
$dur = max(0, min(3600, (int)($P['t'] ?? 0)));
$campaign = clean($P['c'] ?? '', 40);

$fp = @fopen($file, 'c+');
if (!$fp) { echo '{"ok":0}'; exit; }
flock($fp, LOCK_EX);
$raw = stream_get_contents($fp);
$d = json_decode($raw ?: '{}', true);
if (!is_array($d)) $d = [];
if (!isset($d[$day])) $d[$day] = ['views' => 0, 'visits' => 0];

if ($dur > 0 && ($P['e'] ?? '') === '1') { // إشارة نهاية الجلسة: مدة البقاء فقط
    $d[$day]['dur'] = ($d[$day]['dur'] ?? 0) + $dur; $d[$day]['durn'] = ($d[$day]['durn'] ?? 0) + 1;
} else {
    $d[$day]['views']++;
    bump($d, $day, 'pg', $page);
    bump($d, $day, 'hr', date('G'));
    if ($visit) {
        $d[$day]['visits']++;
        bump($d, $day, 'src', $src);
        if ($refHost !== '') bump($d, $day, 'ref', $refHost);
        bump($d, $day, 'dev', $dev); bump($d, $day, 'os', $os);
        if ($tz) bump($d, $day, 'tz', $tz);
        bump($d, $day, $isNew ? 'new' : 'ret', 'n');
    }
}
ksort($d);
if (count($d) > 800) $d = array_slice($d, -800, null, true);
ftruncate($fp, 0); rewind($fp);
fwrite($fp, json_encode($d, JSON_UNESCAPED_UNICODE));
fflush($fp); flock($fp, LOCK_UN); fclose($fp);
echo '{"ok":1}';
