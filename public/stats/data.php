<?php
// قراءة الإحصائيات — محمية بالكود (يتحقق منه الخادم).
header('Cache-Control: no-store');
header('Content-Type: application/json; charset=utf-8');
$code = $_POST['code'] ?? $_GET['code'] ?? '';
if (!hash_equals('2008', (string)$code)) { sleep(1); http_response_code(403); echo '{"error":"forbidden"}'; exit; }
$file = (is_writable(dirname($_SERVER['DOCUMENT_ROOT'] ?? __DIR__)) ? dirname($_SERVER['DOCUMENT_ROOT']) : __DIR__) . '/cei-stats.json';
$d = is_file($file) ? json_decode(file_get_contents($file), true) : [];
echo json_encode(['days' => is_array($d) ? $d : new stdClass(), 'today' => date('Y-m-d')]);
