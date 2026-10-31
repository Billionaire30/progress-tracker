# Cloudflare Tunnel Troubleshooting Guide

## Problem: Bad Gateway Error

The "Bad Gateway" error from Cloudflare tunnel means the tunnel is running but cannot connect to your local server.

## Root Cause Found

**The dev server was not running**. The Cloudflare tunnel was trying to connect to `localhost:3000` but there was no server there.

## Solution Steps

### 1. ✅ Verify Dev Server is Running

Run this command to check if the server is running:
```bash
netstat -ano | findstr :3000
```

If no output appears, the server is not running.

### 2. ✅ Start the Dev Server

```bash
cd "C:\Users\Anomaly\Desktop\Personal Projects\Progress Tracker"
npm run dev
```

The server should start and show:
```
▲ Next.js 16.4.3 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://100.112.31.210:3000
✓ Ready in XXXXms
```

### 3. ✅ Test Local Access

Open http://localhost:3000 in your browser. It should load the app.

### 4. ⚠️ Check Cloudflare Tunnel Configuration

Your Cloudflare tunnel needs to be configured to point to `http://localhost:3000`.

#### If using cloudflared CLI:

Check your tunnel configuration. It should look like:
```bash
cloudflared tunnel --url http://localhost:3000
```

Or if using a config file (`config.yml`):
```yaml
ingress:
  - hostname: blue-metals-processing-photographic.trycloudflare.com
    service: http://localhost:3000
  - service: http_status:404
```

#### If using Cloudflare Dashboard:

1. Go to Cloudflare Dashboard → Zero Trust → Networks → Tunnels
2. Click on your tunnel
3. Check the "Public Hostname" configuration
4. Ensure it points to: `http://localhost:3000`

### 5. ⚠️ Restart Cloudflare Tunnel

After starting the dev server, restart your Cloudflare tunnel:

```bash
# Stop existing tunnel (Ctrl+C)
# Start again
cloudflared tunnel --url http://localhost:3000
```

Or if using a named tunnel:
```bash
cloudflared tunnel run <tunnel-name>
```

### 6. ✅ Test Cloudflare Access

Open https://blue-metals-processing-photographic.trycloudflare.com (or the URL shown in tunnel output) in your browser.

## Common Issues and Solutions

### Issue: Error 1016 (Origin DNS Error)

**Important**: Error 1016 typically occurs with traditional Cloudflare DNS proxying, not with Cloudflare Tunnel. If you see this error with your tunnel setup, it's likely because the tunnel or dev server is not running properly.

**For detailed information about Error 1016**, see `CLOUDFLARE_ERROR_1016_GUIDE.md`

**Quick troubleshooting**:
1. Check if dev server is running: `netstat -ano | findstr :3000`
2. Check if cloudflared is running: `tasklist | findstr cloudflared`
3. Restart both services
4. See `CLOUDFLARE_ERROR_1016_GUIDE.md` for detailed information

### Issue: "Bad Gateway" persists after starting server

**Solution 1**: Check if the tunnel is pointing to the correct port
- Verify tunnel config uses `localhost:3000` not `localhost:80` or other port

**Solution 2**: Check firewall settings
- Windows Firewall might be blocking the connection
- Temporarily disable firewall to test
- Add exception for port 3000

**Solution 3**: Check if cloudflared is running
```bash
# Check if cloudflared process is running
tasklist | findstr cloudflared
```

### Issue: Tunnel connects but app shows errors

**Solution**: Clear browser cache and cookies
- Press Ctrl+Shift+Delete
- Clear cached images and files
- Reload the page

### Issue: "Connection refused" on tunnel

**Solution**: The dev server might have crashed
- Check the terminal where `npm run dev` is running
- Look for error messages
- Restart the dev server

## Verification Checklist

- [ ] Dev server is running (`npm run dev`)
- [ ] Server responds on http://localhost:3000
- [ ] Cloudflare tunnel is running
- [ ] Tunnel config points to `http://localhost:3000`
- [ ] No firewall blocking port 3000
- [ ] Browser cache cleared
- [ ] Tunnel URL accessible: https://blue-metals-processing-photographic.trycloudflare.com (or the URL shown in tunnel output)

## Automatic Setup Script

To ensure everything starts together, create a batch file:

**File**: `start-with-tunnel.bat`
```batch
@echo off
echo Starting Progress Tracker with Cloudflare Tunnel...

REM Start dev server in background
start "Progress Tracker" cmd /k "cd /d C:\Users\Anomaly\Desktop\Personal Projects\Progress Tracker && npm run dev"

REM Wait for server to start
timeout /t 5 /nobreak

REM Start Cloudflare tunnel
cloudflared tunnel --url http://localhost:3000

pause
```

## Current Status

✅ Dev server is now running on http://localhost:3000
✅ Local access is working
⚠️ Cloudflare tunnel needs to be restarted to connect to the running server

## Next Steps

1. **Keep the dev server running** (don't close the terminal)
2. **Restart your Cloudflare tunnel** to pick up the connection
3. **Test access** via https://surgeons-intellectual-transparent-roy.trycloudflare.com
4. If still failing, check the Cloudflare tunnel logs for specific errors
