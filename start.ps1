# Use Node 20
nvm use 20

# Go to project folder
cd "D:\KAAPAV\Final-Version\Meta-Ads\Kaapav-Meta-Ads-Strategist"

# Start dev server in background
Start-Process powershell -ArgumentList "npm run dev"

# Wait a bit for server to start
Start-Sleep -Seconds 4

# Open in Google Chrome
Start-Process "chrome.exe" "http://localhost:5174"
