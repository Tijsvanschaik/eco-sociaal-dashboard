# Re-encodes UTF-16 LE files to UTF-8 (no BOM).
# Workaround for tools that write UTF-16 on Windows. Run from repo root:
#   powershell -ExecutionPolicy Bypass -File scripts/fix-encoding.ps1

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$exclude = @('.git','node_modules','.next','playwright-report','test-results')

Get-ChildItem -Recurse -File -Force | Where-Object {
  $p = $_.FullName
  -not ($exclude | Where-Object { $p -match ('\\' + [regex]::Escape($_) + '(\\|$)') })
} | ForEach-Object {
  $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
  if ($bytes.Length -lt 2) { return }
  $hasBom = ($bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE)
  $looksUtf16 = $hasBom -or ($bytes[1] -eq 0x00 -and $bytes[0] -ne 0x00)
  if (-not $looksUtf16) { return }

  $enc = [System.Text.Encoding]::Unicode
  $start = if ($hasBom) { 2 } else { 0 }
  $text = $enc.GetString($bytes, $start, $bytes.Length - $start)
  [System.IO.File]::WriteAllText($_.FullName, $text, $utf8NoBom)
  Write-Host ('converted ' + $_.FullName)
}
