#requires -Version 7.0
# Normalize every text file in the repo to UTF-8 (no BOM).
# Detects UTF-16 LE / BE (with or without BOM) and rewrites as UTF-8.
# Leaves pure ASCII / UTF-8 files untouched.

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)

$textExtensions = @(
    '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
    '.json', '.jsonc',
    '.md', '.mdx', '.mdc',
    '.sql', '.yml', '.yaml', '.toml', '.txt',
    '.ps1', '.psm1',
    '.html', '.htm', '.css', '.scss',
    '.svg', '.xml',
    '.gitignore', '.gitattributes'
)

$excludeDirs = @('node_modules', '.next', '.git', 'dist', 'build', '.turbo', 'coverage', '.vercel', 'out')

function Test-TextFile {
    param([System.IO.FileInfo]$File)
    $name = $File.Name
    $ext  = $File.Extension.ToLowerInvariant()
    if ($textExtensions -contains $ext) { return $true }
    # Dotfiles like `.env`, `.env.local`, `.env.example`, `.eslintrc`, etc.
    if ($name -like '.env*')      { return $true }
    if ($name -like '.eslint*')   { return $true }
    if ($name -like '.prettier*') { return $true }
    if ($name -like '.editorconfig') { return $true }
    return $false
}

function Test-LooksUtf16 {
    param([byte[]]$Bytes)
    if ($Bytes.Length -lt 4) { return @{ IsUtf16 = $false } }
    if ($Bytes[0] -eq 0xFF -and $Bytes[1] -eq 0xFE) { return @{ IsUtf16 = $true; BigEndian = $false; HasBom = $true } }
    if ($Bytes[0] -eq 0xFE -and $Bytes[1] -eq 0xFF) { return @{ IsUtf16 = $true; BigEndian = $true;  HasBom = $true } }

    # Heuristic: many zero bytes at odd indexes => UTF-16 LE no BOM
    $sample = [Math]::Min(2048, $Bytes.Length)
    $zerosOdd  = 0; $zerosEven = 0; $totalPairs = 0
    for ($i = 0; $i + 1 -lt $sample; $i += 2) {
        $totalPairs++
        if ($Bytes[$i]     -eq 0) { $zerosEven++ }
        if ($Bytes[$i + 1] -eq 0) { $zerosOdd++  }
    }
    if ($totalPairs -eq 0) { return @{ IsUtf16 = $false } }
    $ratioOdd  = $zerosOdd  / $totalPairs
    $ratioEven = $zerosEven / $totalPairs
    if ($ratioOdd -gt 0.30 -and $ratioEven -lt 0.05) {
        return @{ IsUtf16 = $true; BigEndian = $false; HasBom = $false }
    }
    if ($ratioEven -gt 0.30 -and $ratioOdd -lt 0.05) {
        return @{ IsUtf16 = $true; BigEndian = $true;  HasBom = $false }
    }
    return @{ IsUtf16 = $false }
}

$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$converted = New-Object System.Collections.Generic.List[string]
$kept      = 0
$bomStripped = New-Object System.Collections.Generic.List[string]

$files = Get-ChildItem -Recurse -File | Where-Object {
    $path = $_.FullName
    foreach ($dir in $excludeDirs) {
        if ($path -match ('[\\/]' + [Regex]::Escape($dir) + '([\\/]|$)')) { return $false }
    }
    Test-TextFile -File $_
}

foreach ($f in $files) {
    $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
    if ($bytes.Length -eq 0) { $kept++; continue }

    $detection = Test-LooksUtf16 -Bytes $bytes

    if ($detection.IsUtf16) {
        $enc = if ($detection.BigEndian) { [System.Text.Encoding]::BigEndianUnicode } else { [System.Text.Encoding]::Unicode }
        $start = if ($detection.HasBom) { 2 } else { 0 }
        $text = $enc.GetString($bytes, $start, $bytes.Length - $start)
        [System.IO.File]::WriteAllText($f.FullName, $text, $utf8NoBom)
        $converted.Add($f.FullName.Substring((Get-Location).Path.Length + 1))
        continue
    }

    # UTF-8 BOM (EF BB BF) -> strip BOM, keep content as UTF-8 NoBOM.
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        $text = [System.Text.Encoding]::UTF8.GetString($bytes, 3, $bytes.Length - 3)
        [System.IO.File]::WriteAllText($f.FullName, $text, $utf8NoBom)
        $bomStripped.Add($f.FullName.Substring((Get-Location).Path.Length + 1))
        continue
    }

    $kept++
}

Write-Host ""
Write-Host ("Converted UTF-16 -> UTF-8 NoBOM: {0}" -f $converted.Count)
foreach ($c in $converted) { Write-Host "  $c" }
Write-Host ""
Write-Host ("Stripped UTF-8 BOM: {0}" -f $bomStripped.Count)
foreach ($c in $bomStripped) { Write-Host "  $c" }
Write-Host ""
Write-Host ("Left untouched (already UTF-8 / binary-ish): {0}" -f $kept)
