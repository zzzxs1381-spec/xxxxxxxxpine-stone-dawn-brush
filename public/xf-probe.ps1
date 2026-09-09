# XFreedom probe for Windows. Not a VPN. Sends evidence only.
# Server re-classifies from evidence.
param(
  [Parameter(Mandatory = $true)][string]$Url,
  [Parameter(Mandatory = $true)][string]$Token
)

function Tcp-Check([string]$HostName, [int]$Port) {
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  try {
    $c = New-Object System.Net.Sockets.TcpClient
    $iar = $c.BeginConnect($HostName, $Port, $null, $null)
    $ok = $iar.AsyncWaitHandle.WaitOne(3000, $false)
    if (-not $ok) { throw "timeout" }
    $c.EndConnect($iar)
    $c.Close()
    $sw.Stop()
    return @{ check = "tcp:${HostName}:${Port}"; result = "ok"; ms = [int]$sw.ElapsedMilliseconds }
  } catch {
    $sw.Stop()
    $msg = $_.Exception.Message
    $detail = $msg.Substring(0, [Math]::Min(80, $msg.Length))
    return @{ check = "tcp:${HostName}:${Port}"; result = "fail"; ms = [int]$sw.ElapsedMilliseconds; detail = $detail }
  }
}

function Udp-Dns {
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  $udp = $null
  try {
    $udp = New-Object System.Net.Sockets.UdpClient
    $udp.Client.ReceiveTimeout = 2500
    $payload = [byte[]]@(0x00,0x01,0x01,0x00,0x00,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x07,0x65,0x78,0x61,0x6d,0x70,0x6c,0x65,0x03,0x63,0x6f,0x6d,0x00,0x00,0x01,0x00,0x01)
    [void]$udp.Send($payload, $payload.Length, "1.1.1.1", 53)
    $ep = New-Object System.Net.IPEndPoint ([System.Net.IPAddress]::Any, 0)
    $data = $udp.Receive([ref]$ep)
    $sw.Stop()
    return @{ check = "udp-dns"; result = $(if ($data.Length -gt 0) { "ok" } else { "fail" }); ms = [int]$sw.ElapsedMilliseconds; detail = "$($data.Length)b" }
  } catch {
    $sw.Stop()
    return @{ check = "udp-dns"; result = "fail"; ms = [int]$sw.ElapsedMilliseconds }
  } finally {
    if ($udp) { $udp.Close() }
  }
}

function Https-Check {
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  try {
    $resp = Invoke-WebRequest -Uri "https://cloudflare.com/cdn-cgi/trace" -UseBasicParsing -TimeoutSec 5
    $sw.Stop()
    $captive = ($resp.Content -match "<html") -and ($resp.Content -notmatch "fl=")
    return @{ check = "https"; result = $(if ($captive) { "captive" } elseif ($resp.StatusCode -eq 200) { "ok" } else { "fail" }); ms = [int]$sw.ElapsedMilliseconds; detail = "cloudflare trace" }
  } catch {
    $sw.Stop()
    return @{ check = "https"; result = "fail"; ms = [int]$sw.ElapsedMilliseconds }
  }
}

function Origin-Rtt([string]$Base) {
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  try {
    $resp = Invoke-WebRequest -Uri ($Base.TrimEnd("/") + "/api/agent/health") -UseBasicParsing -TimeoutSec 5
    $sw.Stop()
    return @{ check = "origin-rtt"; result = $(if ($resp.StatusCode -lt 300) { "ok" } else { "fail" }); ms = [int]$sw.ElapsedMilliseconds }
  } catch {
    $sw.Stop()
    return @{ check = "origin-rtt"; result = "fail"; ms = [int]$sw.ElapsedMilliseconds }
  }
}

function Dns-Check {
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  try {
    $null = [System.Net.Dns]::GetHostAddresses("cloudflare.com")
    $sw.Stop()
    return @{ check = "dns"; result = "ok"; ms = [int]$sw.ElapsedMilliseconds }
  } catch {
    $sw.Stop()
    return @{ check = "dns"; result = "fail"; ms = [int]$sw.ElapsedMilliseconds }
  }
}

function Tls-Sni([string]$HostName) {
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  $tcp = $null
  try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $iar = $tcp.BeginConnect($HostName, 443, $null, $null)
    $ok = $iar.AsyncWaitHandle.WaitOne(4000, $false)
    if (-not $ok) { throw "timeout" }
    $tcp.EndConnect($iar)
    $ssl = New-Object System.Net.Security.SslStream($tcp.GetStream(), $false, ({ $true }))
    $ssl.AuthenticateAsClient($HostName)
    $sw.Stop()
    return @{ check = "tls-sni:$HostName"; result = "ok"; ms = [int]$sw.ElapsedMilliseconds; detail = "$($ssl.SslProtocol)" }
  } catch {
    $sw.Stop()
    $msg = $_.Exception.Message
    $detail = $msg.Substring(0, [Math]::Min(80, $msg.Length))
    return @{ check = "tls-sni:$HostName"; result = "fail"; ms = [int]$sw.ElapsedMilliseconds; detail = $detail }
  } finally {
    if ($tcp) { $tcp.Close() }
  }
}

$evidence = @()
$evidence += @{ check = "online"; result = "online" }
$evidence += Origin-Rtt $Url
$evidence += Tcp-Check "1.1.1.1" 443
$evidence += Tcp-Check "8.8.8.8" 53
$evidence += Tcp-Check "1.1.1.1" 80
$evidence += Udp-Dns
$https = Https-Check
$evidence += $https
$evidence += Tls-Sni "www.youtube.com"
$evidence += Tls-Sni "www.instagram.com"
$evidence += Tls-Sni "twitter.com"
$evidence += Dns-Check

$tcpOk = @($evidence | Where-Object { $_.check -like "tcp:*" -and $_.result -eq "ok" }).Count -gt 0
$udp = $evidence | Where-Object { $_.check -eq "udp-dns" } | Select-Object -First 1

$payloadObj = @{
  token = $Token
  platform = "win32"
  networkType = "agent"
  online = $true
  ipv4Ok = $tcpOk
  httpsOk = ($https.result -eq "ok")
  udpHint = $(if ($udp.result -eq "ok") { "ok" } else { "fail" })
  latencyMs = $https.ms
  evidence = $evidence
  fingerprintBucket = "agent:win32"
}
$payload = $payloadObj | ConvertTo-Json -Depth 6

$endpoint = $Url.TrimEnd("/") + "/api/agent/ingest"
Invoke-RestMethod -Method Post -Uri $endpoint -ContentType "application/json" -Body $payload -Headers @{ Authorization = "Bearer $Token" }
