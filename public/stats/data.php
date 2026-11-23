<?php
// قراءة الإحصائيات — محمية بالكود (يتحقق منه الخادم).
// الكود لم يعد مكتوباً صريحاً: يُقارَن بصمته SHA-256 (الكود الحالي ما زال هو نفسه فلا يتغيّر شيء عندكم).
// لتغيير الكود بدون لمس GitHub: أنشئوا ملفاً خارج public_html اسمه cei-stats-code.txt فيه سطر واحد:
//   sha256("cei-stats-v1:" . الكود_الجديد)   (يتغلّب على القيمة الافتراضية أدناه)
header('Cache-Control: no-store');
header('Content-Type: application/json; charset=utf-8');

$HASH = 'f7577a42ddd9f4f1929a858f1ad4180d9fb332b99e6cb9a799e895993e3263a5';
$ext = dirname($_SERVER['DOCUMENT_ROOT'] ?? __DIR__) . '/cei-stats-code.txt';
if (is_file($ext)) { $h = strtolower(trim((string)@file_get_contents($ext))); if (preg_match('/^[a-f0-9]{64}$/', $h)) $HASH = $h; }

// --- حدّ المحاولات الخاطئة: 8 محاولات كل 10 دقائق لكل عنوان (المحاولات الصحيحة لا تُحسب). لا يُخزَّن الـ IP نفسه.
$rl = sys_get_temp_dir() . '/cei-rl-data-' . substr(hash('sha256', 'cei-rl:' . ($_SERVER['REMOTE_ADDR'] ?? 'x')), 0, 24);
$now = time();
$fails = is_file($rl) ? json_decode((string)@file_get_contents($rl), true) : [];
$fails = array_values(array_filter(is_array($fails) ? $fails : [], function ($t) use ($now) { return $t > $now - 600; }));
if (count($fails) >= 8) { http_response_code(429); echo '{"error":"too_many_attempts"}'; exit; }

$code = (string)($_POST['code'] ?? $_GET['code'] ?? '');
if (!hash_equals($HASH, hash('sha256', 'cei-stats-v1:' . $code))) {
    $fails[] = $now;
    @file_put_contents($rl, json_encode($fails), LOCK_EX);
    sleep(1); http_response_code(403); echo '{"error":"forbidden"}'; exit;
}
$file = (is_writable(dirname($_SERVER['DOCUMENT_ROOT'] ?? __DIR__)) ? dirname($_SERVER['DOCUMENT_ROOT']) : __DIR__) . '/cei-stats.json';
$d = is_file($file) ? json_decode(file_get_contents($file), true) : [];
echo json_encode(['days' => is_array($d) ? $d : new stdClass(), 'today' => date('Y-m-d')]);
