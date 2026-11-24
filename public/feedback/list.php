<?php
// قراءة / حذف الرسائل — محمي بنفس كود الإحصائيات (يتحقق منه الخادم).
header('Cache-Control: no-store');
header('Content-Type: application/json; charset=utf-8');

$HASH = 'f7577a42ddd9f4f1929a858f1ad4180d9fb332b99e6cb9a799e895993e3263a5'; // نفس بصمة كود الإحصائيات
$ext = dirname($_SERVER['DOCUMENT_ROOT'] ?? __DIR__) . '/cei-stats-code.txt';
if (is_file($ext)) { $x = strtolower(trim((string)@file_get_contents($ext))); if (preg_match('/^[a-f0-9]{64}$/', $x)) $HASH = $x; }

$rl = sys_get_temp_dir() . '/cei-rl-fblist-' . substr(hash('sha256', 'cei-rl:' . ($_SERVER['REMOTE_ADDR'] ?? 'x')), 0, 24);
$now = time();
$f = is_file($rl) ? json_decode((string)@file_get_contents($rl), true) : [];
$f = array_values(array_filter(is_array($f) ? $f : [], function ($t) use ($now) { return $t > $now - 600; }));
if (count($f) >= 8) { http_response_code(429); echo '{"error":"too_many_attempts"}'; exit; }

$code = (string)($_POST['code'] ?? '');
if (!hash_equals($HASH, hash('sha256', 'cei-stats-v1:' . $code))) {
    $f[] = $now; @file_put_contents($rl, json_encode($f), LOCK_EX);
    sleep(1); http_response_code(403); echo '{"error":"forbidden"}'; exit;
}

$file = '';
foreach (array_unique([dirname($_SERVER['DOCUMENT_ROOT'] ?? __DIR__) . '/cei-feedback.json', __DIR__ . '/cei-feedback.json', rtrim(sys_get_temp_dir(), '/') . '/cei-feedback.json']) as $cand) {
    if (is_file($cand)) { $file = $cand; break; }
}
$d = $file !== '' ? json_decode((string)@file_get_contents($file), true) : [];
if (!is_array($d)) $d = [];

$del = (string)($_POST['delete'] ?? '');
$seen = (string)($_POST['seen'] ?? '');   // id أو "all"
$val = (($_POST['val'] ?? '1') === '0') ? 0 : 1;
$dirty = false;
if ($file !== '' && $del !== '' && preg_match('/^[a-f0-9]{12}$/', $del)) {
    $d = array_values(array_filter($d, function ($i) use ($del) { return ($i['id'] ?? '') !== $del; }));
    $dirty = true;
}
if ($file !== '' && $seen !== '' && ($seen === 'all' || preg_match('/^[a-f0-9]{12}$/', $seen))) {
    foreach ($d as &$i) { if ($seen === 'all' || ($i['id'] ?? '') === $seen) $i['seen'] = $val; }
    unset($i); $dirty = true;
}
if ($dirty) file_put_contents($file, json_encode($d, JSON_UNESCAPED_UNICODE), LOCK_EX);
echo json_encode(['items' => $d], JSON_UNESCAPED_UNICODE);
