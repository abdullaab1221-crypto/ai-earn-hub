# Fix asset paths for inner pages
# Changes href="assets/..." to href="../assets/..." (depth 1) or "../../assets/..." (depth 2)

$repoDir = "C:\Users\FAIZAN COMPUTERS\ai-earn-hub"

$htmlFiles = Get-ChildItem "$repoDir\**\*.html" -Recurse | Where-Object {
    $_.FullName -notmatch "\\recovery\\" -and $_.FullName -notmatch "\\static\\"
}

$totalFixed = 0

foreach ($file in $htmlFiles) {
    $relPath = $file.FullName.Replace($repoDir, "").TrimStart("\").Replace("\", "/")
    
    # Calculate depth
    if ($relPath -eq "index.html") {
        $depth = 0
    } else {
        $parts = ($relPath -replace '/index.html$', '') -split '/'
        $depth = $parts.Count
    }
    
    # Homepage at root doesn't need fixing (assets/... resolves correctly from root)
    if ($depth -eq 0) { continue }
    
    # Calculate prefix
    $prefix = "../" * $depth
    
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $original = $content
    
    # Fix CSS paths: href="assets/css/..." -> href="../assets/css/..."
    $content = $content -replace 'href="assets/', "href=""$prefix assets/"
    
    # Fix JS paths: src="assets/js/..." -> src="../assets/js/..."
    $content = $content -replace 'src="assets/', "src=""$prefix assets/"
    
    # Fix image paths: src="assets/images/..." -> src="../assets/images/..."
    # Already covered by the two replacements above
    
    # Fix background-image: url('assets/...') -> url('../assets/...')
    $content = $content -replace "url\('assets/", "url('$prefix assets/"
    
    # Fix favicon/icon paths (in <head>)
    # Already covered by href="assets/..." replacement
    
    if ($content -ne $original) {
        $changes = 0
        if ($original -match 'href="assets/') { $changes += ([regex]::Matches($original, 'href="assets/')).Count }
        if ($original -match 'src="assets/') { $changes += ([regex]::Matches($original, 'src="assets/')).Count }
        if ($original -match "url\('assets/") { $changes += ([regex]::Matches($original, "url\('assets/")).Count }
        
        $content | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
        $totalFixed += $changes
        Write-Output "FIXED: $relPath (depth=$depth, prefix=$prefix, ~$changes refs)"
    }
}

Write-Output ""
Write-Output "Total asset refs fixed: ~$totalFixed"
