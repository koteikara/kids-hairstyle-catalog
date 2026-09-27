# Put style illustrations of one view side by side in a single PNG, to check that similar styles can be told apart.
# Usage (Windows PowerShell):
#   powershell -ExecutionPolicy Bypass -File scripts/montage-styles.ps1 -view front -out compare-front.png
#   powershell -ExecutionPolicy Bypass -File scripts/montage-styles.ps1 -view side -ids "sports,twoblock,buzz" -out sports-side.png
# -view : front / side / back
# -ids  : comma separated style ids (default: all styles). Images are read from img/styles/<id>-<view>.png
param([string]$view = "front", [string]$ids = "sports,buzz,twoblock,natural,mash,upbang,softmohi,centerpart,longmash,sidepart", [string]$out = "montage.png", [int]$cols = 5)
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName WindowsBase
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$list = @($ids.Split(",") | ForEach-Object { $_.Trim() })
$cols = [Math]::Min($cols, $list.Count)
$w = 300; $h = 330; $lab = 34
$rows = [Math]::Ceiling($list.Count / $cols)
$dv = New-Object System.Windows.Media.DrawingVisual
$dc = $dv.RenderOpen()
$dc.DrawRectangle([System.Windows.Media.Brushes]::White, $null, (New-Object System.Windows.Rect(0, 0, ($cols * $w), ($rows * ($h + $lab)))))
$face = New-Object System.Windows.Media.Typeface('Segoe UI')
for ($i = 0; $i -lt $list.Count; $i++) {
  $x = ($i % $cols) * $w; $y = [Math]::Floor($i / $cols) * ($h + $lab)
  $path = Join-Path $root ("img/styles/" + $list[$i] + "-" + $view + ".png")
  if (Test-Path $path) {
    $bmp = New-Object System.Windows.Media.Imaging.BitmapImage
    $bmp.BeginInit(); $bmp.UriSource = New-Object System.Uri($path); $bmp.CacheOption = 'OnLoad'; $bmp.EndInit()
    $dc.DrawImage($bmp, (New-Object System.Windows.Rect($x, ($y + $lab), $w, $h)))
  }
  $txt = New-Object System.Windows.Media.FormattedText($list[$i], [System.Globalization.CultureInfo]::InvariantCulture, 'LeftToRight', $face, 20, [System.Windows.Media.Brushes]::Black, 1.0)
  $dc.DrawText($txt, (New-Object System.Windows.Point(($x + 8), ($y + 6))))
  $dc.DrawRectangle($null, (New-Object System.Windows.Media.Pen([System.Windows.Media.Brushes]::LightGray, 1)), (New-Object System.Windows.Rect($x, $y, $w, ($h + $lab))))
}
$dc.Close()
$rtb = New-Object System.Windows.Media.Imaging.RenderTargetBitmap(($cols * $w), ($rows * ($h + $lab)), 96, 96, [System.Windows.Media.PixelFormats]::Pbgra32)
$rtb.Render($dv)
$enc = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
$enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($rtb))
$fs = [System.IO.File]::Create($out); $enc.Save($fs); $fs.Close()
"saved $out"
