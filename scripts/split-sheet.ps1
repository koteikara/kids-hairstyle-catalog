# Split a sheet of drawings placed left to right into separate PNGs on a 10:11 canvas.
# Usage (Windows PowerShell):
#   powershell -ExecutionPolicy Bypass -File scripts/split-sheet.ps1 -src img/styles/twoblock-sheet.png -outDir img/styles -prefix twoblock
# Output: <prefix>-<name>.png for each name in -names (default: front,side,back). Same size, same scale, same height.
# Fade comparison sheet (4 levels): -prefix back -names "0,1,2,3" -> back-0.png ... back-3.png
# Background padding uses the color of the top-left pixel of the source.
param([string]$src, [string]$outDir, [string]$prefix, [string]$names = "front,side,back")
$nameList = @($names.Split(",") | ForEach-Object { $_.Trim() })
$n = $nameList.Count
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase
$ErrorActionPreference = 'Stop'

$src = (Resolve-Path $src).Path; $outDir = (Resolve-Path $outDir).Path
$s = [System.IO.File]::OpenRead($src)
$dec = [System.Windows.Media.Imaging.BitmapDecoder]::Create($s, 'PreservePixelFormat', 'OnLoad')
$bmp = New-Object System.Windows.Media.Imaging.FormatConvertedBitmap($dec.Frames[0], [System.Windows.Media.PixelFormats]::Bgra32, $null, 0)
$s.Close()
$w = $bmp.PixelWidth; $h = $bmp.PixelHeight; $stride = $w * 4
$px = New-Object byte[] ($stride * $h)
$bmp.CopyPixels($px, $stride, 0)

$colDark = New-Object int[] $w
$isDark = { param($i) ($px[$i] + $px[$i + 1] + $px[$i + 2]) -lt 600 }
for ($y = 0; $y -lt $h; $y += 2) {
  $row = $y * $stride
  for ($x = 0; $x -lt $w; $x++) {
    $i = $row + $x * 4
    if (($px[$i] + $px[$i + 1] + $px[$i + 2]) -lt 600) { $colDark[$x]++ }
  }
}
$segs = @(); $inSeg = $false; $start = 0
for ($x = 0; $x -lt $w; $x++) {
  $on = $colDark[$x] -gt 1
  if ($on -and -not $inSeg) { $inSeg = $true; $start = $x }
  if (-not $on -and $inSeg) { $inSeg = $false; if ($x - $start -gt 40) { $segs += ,@($start, $x) } }
}
if ($inSeg) { $segs += ,@($start, $w) }
"segments: " + (($segs | ForEach-Object { "$($_[0])-$($_[1])" }) -join ', ')

while ($segs.Count -gt $n) {
  $minGap = [int]::MaxValue; $mi = 0
  for ($k = 0; $k -lt $segs.Count - 1; $k++) { $g = $segs[$k + 1][0] - $segs[$k][1]; if ($g -lt $minGap) { $minGap = $g; $mi = $k } }
  $merged = @($segs[$mi][0], $segs[$mi + 1][1])
  $new = @(); for ($k = 0; $k -lt $segs.Count; $k++) { if ($k -eq $mi) { $new += ,$merged } elseif ($k -ne $mi + 1) { $new += ,$segs[$k] } }
  $segs = $new
}
if ($segs.Count -ne $n) { throw "could not split into $n drawings: $($segs.Count)" }

$maxW = ($segs | ForEach-Object { $_[1] - $_[0] } | Measure-Object -Maximum).Maximum
$pad = 24
$cw = [Math]::Max($maxW + $pad * 2, [Math]::Ceiling(($h) * 10 / 11))
$ch = [Math]::Ceiling($cw * 11 / 10)
for ($k = 0; $k -lt $n; $k++) {
  $x0 = $segs[$k][0]; $x1 = $segs[$k][1]; $sw = $x1 - $x0
  $out = New-Object byte[] ($cw * 4 * $ch)
  for ($i = 0; $i -lt $out.Length; $i += 4) { $out[$i] = $px[8]; $out[$i + 1] = $px[9]; $out[$i + 2] = $px[10]; $out[$i + 3] = 255 }
  $ox = [int](($cw - $sw) / 2); $oy = [int](($ch - $h) / 2)
  for ($y = 0; $y -lt $h; $y++) {
    [Array]::Copy($px, $y * $stride + $x0 * 4, $out, ($y + $oy) * $cw * 4 + $ox * 4, $sw * 4)
  }
  $bs = [System.Windows.Media.Imaging.BitmapSource]::Create($cw, $ch, 96, 96, [System.Windows.Media.PixelFormats]::Bgra32, $null, $out, $cw * 4)
  $enc = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
  $enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($bs))
  $path = Join-Path $outDir "$prefix-$($nameList[$k]).png"
  $fs = [System.IO.File]::Create($path); $enc.Save($fs); $fs.Close()
  "$path  ${cw}x${ch}  (source x $x0-$x1)"
}
