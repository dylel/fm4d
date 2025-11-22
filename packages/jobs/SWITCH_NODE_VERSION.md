# Installing nvm-windows on Windows

## Option 1: Install nvm-windows (Recommended)

1. **Download nvm-windows:**
   - Go to: https://github.com/coreybutler/nvm-windows/releases
   - Download the latest `nvm-setup.exe` installer

2. **Run the installer** and follow the prompts

3. **Restart your terminal/PowerShell** after installation

4. **Install Node.js v20:**
   ```powershell
   nvm install 20.11.0
   nvm use 20.11.0
   ```

5. **Verify:**
   ```powershell
   node --version  # Should show v20.11.0
   ```

6. **Reinstall dependencies:**
   ```powershell
   pnpm install
   ```

## Option 2: Manual Node.js Installation

If you prefer not to use nvm-windows:

1. Download Node.js v20 LTS from: https://nodejs.org/
2. Install it (this will replace your current Node.js v24)
3. Restart terminal
4. Run `pnpm install`

## Option 3: Use fnm (Fast Node Manager) - Alternative

fnm is a faster alternative that works in PowerShell:

```powershell
# Install fnm via winget or scoop
winget install Schniz.fnm

# Or via PowerShell
iwr https://fnm.vercel.app/install.ps1 -useb | iex

# Then use it
fnm install 20
fnm use 20
```

