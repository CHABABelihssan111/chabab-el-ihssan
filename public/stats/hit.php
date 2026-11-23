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
$visit = (($_POST['v'] ?? $_GET['v'] ?? '0') === '1');
$fp = @fopen($file, 'c+');
if (!$fp) { echo '{"ok":0}'; exit; }
flock($fp, LOCK_EX);
$raw = stream_get_contents($fp);
$d = json_decode($raw ?: '{}', true);
if (!is_array($d)) $d = [];
if (!isset($d[$day])) $d[$day] = ['views' => 0, 'visits' => 0];
$d[$day]['views']++;
if ($visit) $d[$day]['visits']++;
ksort($d);
if (count($d) > 800) $d = array_slice($d, -800, null, true);
ftruncate($fp, 0); rewind($fp);
fwrite($fp, json_encode($d));
fflush($fp); flock($fp, LOCK_UN); fclose($fp);
echo '{"ok":1}';
