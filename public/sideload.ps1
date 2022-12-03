

Function Test-CommandExists {
  Param(
    [Parameter(Mandatory = $true)]
    [string]$Command
  )
  $oldPreference = $ErrorActionPreference
  $ErrorActionPreference = 'Stop'
  try {
    Get-Command $Command -ErrorAction Stop | Out-Null
    $true
  }
  catch {
    $false
  }
  finally {
    $ErrorActionPreference = $oldPreference
  }
}

if (Test-CommandExists "npx") {
  $manifest = "$env:tmp\paste-hyperlink-in-manifest.xml"
  Invoke-WebRequest -Uri 'https://gray-sky-08c20320f.2.azurestaticapps.net/manifest.xml' -OutFile $manifest
  npx office-toolbox sideload -a excel -m $manifest
}
else {
  Write-Host -BackgroundColor Yello -ForegroundColor Black "npx not found."
  "Please install Node.js and try again."
  "https://nodejs.org/en/"
}