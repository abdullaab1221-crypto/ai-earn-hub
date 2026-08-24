# Depth-aware relative path conversion for GitHub Pages
# Converts href="/path/" to correct relative paths based on file depth

$repoDir = "C:\Users\FAIZAN COMPUTERS\ai-earn-hub"

# Known internal page paths (absolute)
$internalPaths = @(
    "/",
    "/about/",
    "/contact/",
    "/privacy-policy/",
    "/terms-of-service/",
    "/affiliate-disclosure/",
    "/cookie-policy/",
    "/ai-tools/",
    "/ai-tools/chatgpt/",
    "/ai-tools/jasper/",
    "/ai-tools/midjourney/",
    "/ai-tools/copy-ai/",
    "/ai-tools/murf/",
    "/ai-tools/copilot/",
    "/guides/",
    "/guides/chatgpt-beginners-guide/",
    "/guides/ai-content-creation/",
    "/guides/ai-tools-small-business/",
    "/blog/",
    "/tutorials/",
    "/ai-freelancing-2026-skills-beginners/",
    "/how-to-use-ai-to-make-money-online/",
    "/best-ai-tools-for-small-businesses-2026/",
    "/best-free-ai-tools-for-freelancers-2026/",
    "/best-free-ai-tools-for-students/",
    "/category/getting-started/",
    "/category/ai-tools/",
    "/category/guides/",
    "/category/student-resources/"
)

# Paths to REMOVE (WordPress-specific, not needed in static site)
$removePaths = @(
    "/feed/",
    "/comments/feed/",
    "/wp-json/",
    "/xmlrpc.php"
)

# File depth map: relative path from repo root -> depth
function Get-FileDepth {
    param([string]$relativePath)
    $parts = ($relativePath -replace '\\', '/') -split '/' | Where-Object { $_ -ne '' -and $_ -ne 'index.html' }
    return $parts.Count
}

# Convert absolute path to relative path based on depth
function Convert-ToRelative {
    param([string]$absPath, [int]$depth)
    
    if ($depth -eq 0) {
        return ".$absPath"
    } else {
        $prefix = ("../" * $depth)
        return "$prefix$($absPath.Substring(1))"
    }
}

# Get all HTML files (excluding recovery and static dirs)
$htmlFiles = Get-ChildItem "$repoDir\**\*.html" -Recurse | Where-Object {
    $_.FullName -notmatch "\\recovery\\" -and $_.FullName -notmatch "\\static\\"
}

$totalFilesModified = 0
$totalLinksFixed = 0

foreach ($file in $htmlFiles) {
    $relativePath = $file.FullName.Replace($repoDir, "").TrimStart("\").Replace("\", "/")
    $depth = Get-FileDepth -relativePath $relativePath
    
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $original = $content
    $linksFixed = 0
    
    # Convert internal page links: href="/path/" -> href="./path/" or "../path/"
    foreach ($path in $internalPaths) {
        $escapedPath = [regex]::Escape($path)
        $relativePathConverted = Convert-ToRelative -absPath $path -depth $depth
        
        # Double quotes
        $content = $content -replace "href=""$escapedPath""", "href=""$relativePathConverted"""
        # Single quotes
        $content = $content -replace "href='$path'", "href='$relativePathConverted'"
    }
    
    # Convert home link: href="/" -> href="./" or "../" etc
    $homeRelative = Convert-ToRelative -absPath "/" -depth $depth
    $content = $content -replace 'href="/"',"href=""$homeRelative"""
    $content = $content -replace "href='/'","href='$homeRelative'"
    
    # Remove WordPress-specific links (feeds, wp-json, xmlrpc, etc.)
    foreach ($path in $removePaths) {
        $escapedPath = [regex]::Escape($path)
        $content = $content -replace "<link[^>]*href=""[^""]*$escapedPath[^""]*""[^/]*/>", ""
        $content = $content -replace "<link[^>]*href='[^']*$path[^']*'[^/]*/>", ""
    }
    
    # Remove wp-json links
    $content = $content -replace '<link[^>]*href="[^"]*wp-json[^"]*"[^/]*/>', ''
    $content = $content -replace "<link[^>]*href='[^']*wp-json[^']*'[^/]*/>", ''
    
    # Remove xmlrpc links
    $content = $content -replace '<link[^>]*href="[^"]*xmlrpc[^"]*"[^/]*/>', ''
    
    # Remove ?p= links (WordPress permalinks)
    $content = $content -replace 'href="/\?p=\d+"', 'href="#"'
    
    # Remove /?p= links
    $content = $content -replace 'href="/\?p=[^"]*"', 'href="#"'
    
    # Remove comment-reply.js reference
    $content = $content -replace '<script[^>]*src="[^"]*comment-reply[^"]*"[^>]*></script>', ''
    
    # Remove /2026/08/ archive links (don't exist in static)
    $content = $content -replace 'href="/2026/08/"', 'href="#"'
    
    # Convert tag links to # (tags don't exist in static)
    $content = $content -replace 'href="/tag/[^"]*"', 'href="#"'
    
    # Convert category feed links
    $content = $content -replace 'href="/category/[^"]*/feed/"', 'href="#"'
    
    # Convert article feed links
    $content = $content -replace 'href="/[^"]*/feed/"', 'href="#"'
    
    # Convert #respond links (comment forms)
    $content = $content -replace 'href="/[^"]*#respond"', 'href="#"'
    
    # Convert background-image: url('/...') if any
    $content = $content -replace "background-image:\s*url\('/([^']*)'\)", {
        $absPath = "/" + $_.Groups[1].Value
        $relPath = Convert-ToRelative -absPath $absPath -depth $depth
        "background-image: url('$relPath')"
    }
    
    # Count changes
    if ($content -ne $original) {
        $linksFixed = ([regex]::Matches($original, 'href="/[^"]*"')).Count - ([regex]::Matches($content, 'href="/[^"]*"')).Count
        $totalLinksFixed += $linksFixed
        $totalFilesModified++
        
        $content | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
        Write-Output "FIXED: $relativePath (depth=$depth, ~$linksFixed links)"
    }
}

Write-Output ""
Write-Output "=== SUMMARY ==="
Write-Output "Files modified: $totalFilesModified"
Write-Output "Links fixed: ~$totalLinksFixed"
