<?php
header('Content-Type: application/json; charset=utf-8'); header('Cache-Control: no-store');
$root = dirname($_SERVER['DOCUMENT_ROOT'] ?? __DIR__);
function store_path($name){ global $root; foreach([$root.'/'.$name,__DIR__.'/'.$name] as $p){ if((!file_exists($p)&&is_writable(dirname($p)))||(file_exists($p)&&is_writable($p))) return $p; } return false; }
function read_data($p,$fallback){$v=is_file($p)?json_decode((string)file_get_contents($p),true):null;return is_array($v)?$v:$fallback;}
$statePath=store_path('cei-donation-settings.json'); if(!$statePath){http_response_code(500);echo'{"ok":0}';exit;}
$state=read_data($statePath,['open'=>true]);
if($_SERVER['REQUEST_METHOD']==='GET'){echo json_encode(['open'=>($state['open']??true)===true]);exit;}
$code=(string)($_POST['code']??''); $hash='f7577a42ddd9f4f1929a858f1ad4180d9fb332b99e6cb9a799e895993e3263a5'; $ext=$root.'/cei-stats-code.txt'; if(is_file($ext)&&preg_match('/^[a-f0-9]{64}$/i',trim((string)file_get_contents($ext))))$hash=strtolower(trim((string)file_get_contents($ext)));
$admin=hash_equals($hash,hash('sha256','cei-stats-v1:'.$code));
if(($_POST['action']??'')==='status' && $admin){echo json_encode(['ok'=>1,'open'=>($state['open']??true)===true]);exit;}
if(($_POST['action']??'')==='toggle' && $admin){$state['open']=($_POST['open']??'0')==='1';file_put_contents($statePath,json_encode($state),LOCK_EX);echo json_encode(['ok'=>1,'open'=>$state['open']]);exit;}
if(($_POST['action']??'')==='list' && $admin){$p=store_path('cei-donations.json');echo json_encode(['ok'=>1,'items'=>read_data($p?:'',[])]);exit;}
if(($_POST['action']??'')==='delete' && $admin){$p=store_path('cei-donations.json');$items=read_data($p?:'',[]);$items=array_values(array_filter($items,fn($x)=>($x['id']??'')!==($_POST['id']??'')));if($p)file_put_contents($p,json_encode($items,JSON_UNESCAPED_UNICODE),LOCK_EX);echo'{"ok":1}';exit;}
if(($_POST['action']??'')!=='submit'){http_response_code(403);echo'{"ok":0}';exit;}
if(!($state['open']??true)){http_response_code(403);echo'{"ok":0,"closed":1}';exit;}
function clean($v,$n=180){return mb_substr(trim(strip_tags((string)$v)),0,$n);}
$name=clean($_POST['name']??'',100);$phone=clean($_POST['phone']??'',35);$amount=clean($_POST['amount']??'',30);$campaign=clean($_POST['project']??'',180);$bank=clean($_POST['bank']??'',180);
if(mb_strlen($name)<2||mb_strlen($phone)<6||!is_numeric(str_replace([',',' '],'',$amount))||$campaign===''||$bank===''){http_response_code(422);echo'{"ok":0,"err":"fields"}';exit;}
$f=$_FILES['receipt']??null;if(!$f||$f['error']!==UPLOAD_ERR_OK||$f['size']>8*1024*1024){http_response_code(422);echo'{"ok":0,"err":"receipt"}';exit;}
$mime=(new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);$exts=['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp','image/heic'=>'heic','image/heif'=>'heif'];if(!isset($exts[$mime])){http_response_code(415);echo'{"ok":0,"err":"image"}';exit;}
$dir=__DIR__.'/receipts';if(!is_dir($dir))@mkdir($dir,0755,true);$file=bin2hex(random_bytes(12)).'.'.$exts[$mime];if(!move_uploaded_file($f['tmp_name'],$dir.'/'.$file)){http_response_code(500);echo'{"ok":0,"err":"upload"}';exit;}
$item=['id'=>bin2hex(random_bytes(6)),'at'=>date('Y-m-d H:i:s'),'name'=>$name,'phone'=>$phone,'amount'=>$amount,'campaign'=>$campaign,'bank'=>$bank,'receipt'=>'/feedback/receipts/'.$file];
$p=store_path('cei-donations.json');if(!$p){@unlink($dir.'/'.$file);http_response_code(500);echo'{"ok":0}';exit;}$fp=fopen($p,'c+');flock($fp,LOCK_EX);$items=json_decode(stream_get_contents($fp)?:'[]',true);if(!is_array($items))$items=[];array_unshift($items,$item);$items=array_slice($items,0,5000);ftruncate($fp,0);rewind($fp);fwrite($fp,json_encode($items,JSON_UNESCAPED_UNICODE));fflush($fp);flock($fp,LOCK_UN);fclose($fp);echo'{"ok":1}';
