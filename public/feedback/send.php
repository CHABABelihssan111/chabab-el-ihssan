<?php
// استقبال الملاحظات والاستمارات: يُحفظ كل شيء في ملف JSON على استضافتكم (بدون أي خدمة خارجية).
// الملف يُحفظ فوق public_html إن أمكن، وإلا داخل هذا المجلد (محمي بـ .htaccess).
header('Cache-Control: no-store');
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo '{"ok":0}'; exit; }

// حد الطلبات: 6 رسائل كل 10 دقائق لكل عنوان (يُخزَّن أثر مشفّر فقط)
$rl = sys_get_temp_dir() . '/cei-rl-fb-' . substr(hash('sha256', 'cei-fb:' . ($_SERVER['REMOTE_ADDR'] ?? 'x')), 0, 24);
$now = time();
$h = is_file($rl) ? json_decode((string)@file_get_contents($rl), true) : [];
$h = array_values(array_filter(is_array($h) ? $h : [], function ($t) use ($now) { return $t > $now - 600; }));
if (count($h) >= 6) { http_response_code(429); echo '{"ok":0,"err":"rate"}'; exit; }

// فخ للروبوتات: حقل مخفي يجب أن يبقى فارغاً
if (!empty($_POST['website'])) { echo '{"ok":1}'; exit; }

function cut($s, $n) { $s = trim((string)$s); $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $s); return mb_substr($s, 0, $n); }
$kind = (($_POST['kind'] ?? '') === 'form') ? 'form' : 'feedback';
$item = ['id' => bin2hex(random_bytes(6)), 'kind' => $kind, 'at' => date('Y-m-d H:i:s'), 'page' => cut($_POST['page'] ?? '', 80)];

if ($kind === 'feedback') {
    $item['name'] = cut($_POST['name'] ?? '', 80);
    $item['contact'] = cut($_POST['contact'] ?? '', 120);
    $item['type'] = cut($_POST['type'] ?? '', 30);
    $item['message'] = cut($_POST['message'] ?? '', 2000);
    if (mb_strlen($item['message']) < 3) { http_response_code(422); echo '{"ok":0,"err":"empty"}'; exit; }
} else {
    $item['type'] = in_array($_POST['type'] ?? '', ['donate', 'join', 'sadaqa'], true) ? $_POST['type'] : 'join';
    foreach (['name' => 80, 'phone' => 30, 'email' => 120, 'wilaya' => 60, 'amount' => 30, 'project' => 80, 'skills' => 200, 'note' => 1500] as $k => $n) $item[$k] = cut($_POST[$k] ?? '', $n);
    if (mb_strlen($item['name']) < 2 || mb_strlen($item['phone']) < 6) { http_response_code(422); echo '{"ok":0,"err":"required"}'; exit; }
}

$file = (is_writable(dirname($_SERVER['DOCUMENT_ROOT'] ?? __DIR__)) ? dirname($_SERVER['DOCUMENT_ROOT']) : __DIR__) . '/cei-feedback.json';
$fp = @fopen($file, 'c+');
if (!$fp) { http_response_code(500); echo '{"ok":0,"err":"storage"}'; exit; }
flock($fp, LOCK_EX);
$d = json_decode(stream_get_contents($fp) ?: '[]', true);
if (!is_array($d)) $d = [];
array_unshift($d, $item);
$d = array_slice($d, 0, 3000);
ftruncate($fp, 0); rewind($fp);
fwrite($fp, json_encode($d, JSON_UNESCAPED_UNICODE));
fflush($fp); flock($fp, LOCK_UN); fclose($fp);

$h[] = $now; @file_put_contents($rl, json_encode($h), LOCK_EX);
echo '{"ok":1}';
