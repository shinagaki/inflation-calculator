<?php
/**
 * 動的 OG 画像生成スクリプト
 *
 * URL: /{year}/{currency}/{amount}.png?r={result}
 * クライアント側で計算済みの結果（日本円）をパラメータで受け取り、
 * OG 画像を GD で生成してキャッシュする。
 */

// ---------- 設定 ----------

define('CACHE_DIR', __DIR__ . '/cache');
define('FONT_DIR', __DIR__ . '/fonts');

define('FONT_BOLD', FONT_DIR . '/NotoSansJP-Bold.ttf');
define('FONT_BLACK', FONT_DIR . '/NotoSansJP-Black.ttf');

define('IMG_WIDTH', 1200);
define('IMG_HEIGHT', 630);

define('CURRENCY_LABELS', [
    'jpy' => '円',
    'usd' => 'ドル',
    'gbp' => 'ポンド',
    'eur' => 'ユーロ',
]);

define('YEAR_MIN', 1900);

// ---------- パラメータ検証 ----------

$year     = isset($_GET['year']) ? (int)$_GET['year'] : 0;
$currency = isset($_GET['currency']) ? strtolower($_GET['currency']) : '';
$amount   = isset($_GET['amount']) ? $_GET['amount'] : '';
$result   = isset($_GET['r']) ? (int)$_GET['r'] : 0;

if (!$year || !isset(CURRENCY_LABELS[$currency]) || !is_numeric($amount) || $amount <= 0 || $result <= 0) {
    http_response_code(400);
    exit('Bad Request');
}

$yearNow = (int)date('Y');
if ($year < YEAR_MIN || $year > $yearNow) {
    http_response_code(400);
    exit('Bad Request');
}

// ---------- キャッシュ確認 ----------

$dateKey = date('md');
$cacheSubDir = CACHE_DIR . "/{$year}/{$currency}";
$cacheFile = "{$cacheSubDir}/{$amount}_{$result}_{$dateKey}.png";

if (file_exists($cacheFile)) {
    header('Content-Type: image/png');
    header('Cache-Control: public, max-age=86400');
    readfile($cacheFile);
    exit;
}

// ---------- 金額フォーマット ----------

function formatResultJapanese(int $value): array {
    if ($value < 10000) {
        return ['main' => number_format($value), 'suffix' => '円'];
    }
    if ($value < 100000000) {
        $man = intdiv($value, 10000);
        $sen = intdiv($value % 10000, 1000);
        if ($sen > 0) {
            return ['main' => number_format($man) . "万{$sen}千", 'suffix' => '円'];
        }
        return ['main' => number_format($man), 'suffix' => '万円'];
    }
    if ($value < 1000000000000) {
        $oku = intdiv($value, 100000000);
        $man = intdiv($value % 100000000, 10000);
        if ($man > 0) {
            return ['main' => number_format($oku) . '億' . number_format($man), 'suffix' => '万円'];
        }
        return ['main' => number_format($oku), 'suffix' => '億円'];
    }
    $cho = intdiv($value, 1000000000000);
    $oku = intdiv($value % 1000000000000, 100000000);
    if ($oku > 0) {
        return ['main' => number_format($cho) . '兆' . number_format($oku), 'suffix' => '億円'];
    }
    return ['main' => number_format($cho), 'suffix' => '兆円'];
}

function formatInputAmount($amount, string $currency): string {
    $label = CURRENCY_LABELS[$currency];
    $num = (float)$amount;
    if ($num >= 1000000000000) return number_format($num / 1000000000000) . "兆{$label}";
    if ($num >= 100000000)     return number_format($num / 100000000) . "億{$label}";
    if ($num >= 10000)         return number_format($num / 10000) . "万{$label}";
    return number_format($num) . $label;
}

// ---------- テキスト準備 ----------

$formatted = formatResultJapanese($result);
$inputText = formatInputAmount($amount, $currency);
$yearText = "{$year}年の";

// ---------- サイズ決定 ----------

if ($result >= 100000000) {
    $sizeAmountFrom = 60; $sizeAmountTo = 80; $sizeSuffix = 48; $sizePrefix = 42;
} elseif ($result >= 10000000) {
    $sizeAmountFrom = 64; $sizeAmountTo = 96; $sizeSuffix = 56; $sizePrefix = 48;
} else {
    $sizeAmountFrom = 72; $sizeAmountTo = 110; $sizeSuffix = 64; $sizePrefix = 56;
}

// ---------- 画像生成 ----------

$img = imagecreatetruecolor(IMG_WIDTH, IMG_HEIGHT);

// 色定義
$bgColor    = imagecolorallocate($img, 0x0f, 0x0f, 0x23);
$goldColor  = imagecolorallocate($img, 0xff, 0xd7, 0x00);
$whiteColor = imagecolorallocate($img, 0xe0, 0xe0, 0xe0);
$grayColor  = imagecolorallocate($img, 0xcc, 0xcc, 0xcc);
$dimColor   = imagecolorallocate($img, 0x66, 0x66, 0x66);
$siteColor  = imagecolorallocate($img, 0x55, 0x55, 0x55);

imagefill($img, 0, 0, $bgColor);

// テキスト中央揃えヘルパー
function centerText($img, float $size, string $font, string $text, int $y, $color): void {
    $box = imagettfbbox($size, 0, $font, $text);
    $textWidth = $box[2] - $box[0];
    $x = (IMG_WIDTH - $textWidth) / 2;
    imagettftext($img, $size, 0, (int)$x, $y, $color, $font, $text);
}

// 結果テキスト中央揃え（prefix + main + suffix を結合して配置）
function centerResultText($img, array $formatted, int $y, $color,
    float $sizePrefix, float $sizeMain, float $sizeSuffix): void
{
    $prefixText = '約 ';
    $mainText = $formatted['main'];
    $suffixText = $formatted['suffix'];

    $boxP = imagettfbbox($sizePrefix, 0, FONT_BOLD, $prefixText);
    $boxM = imagettfbbox($sizeMain, 0, FONT_BLACK, $mainText);
    $boxS = imagettfbbox($sizeSuffix, 0, FONT_BOLD, $suffixText);

    $widthP = $boxP[2] - $boxP[0];
    $widthM = $boxM[2] - $boxM[0];
    $widthS = $boxS[2] - $boxS[0];
    $totalWidth = $widthP + $widthM + $widthS;

    $x = (IMG_WIDTH - $totalWidth) / 2;

    imagettftext($img, $sizePrefix, 0, (int)$x, $y, $color, FONT_BOLD, $prefixText);
    $x += $widthP;
    imagettftext($img, $sizeMain, 0, (int)$x, $y, $color, FONT_BLACK, $mainText);
    $x += $widthM;
    imagettftext($img, $sizeSuffix, 0, (int)$x, $y, $color, FONT_BOLD, $suffixText);
}

// レイアウト描画
$centerY = IMG_HEIGHT / 2;

// 年ラベル
centerText($img, 30, FONT_BOLD, $yearText, (int)($centerY - 130), $grayColor);

// 入力金額
centerText($img, $sizeAmountFrom * 0.7, FONT_BLACK, $inputText, (int)($centerY - 65), $whiteColor);

// 矢印
centerText($img, 22, FONT_BOLD, '▼ 現在の価値', (int)($centerY - 15), $goldColor);

// 結果金額
centerResultText($img, $formatted, (int)($centerY + 70), $goldColor,
    $sizePrefix * 0.65, $sizeAmountTo * 0.65, $sizeSuffix * 0.65);

// 日付注釈
$dateLabel = date('n月j日') . '時点のレートで計算';
centerText($img, 13, FONT_BOLD, $dateLabel, (int)($centerY + 105), $dimColor);

// サイト名
centerText($img, 16, FONT_BOLD, '今いくら imaikura.creco.net', IMG_HEIGHT - 25, $siteColor);

// ---------- 出力・キャッシュ ----------

if (!is_dir($cacheSubDir)) {
    mkdir($cacheSubDir, 0755, true);
}
imagepng($img, $cacheFile, 6);
imagedestroy($img);

header('Content-Type: image/png');
header('Cache-Control: public, max-age=86400');
readfile($cacheFile);
