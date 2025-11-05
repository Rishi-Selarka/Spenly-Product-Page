# Asset Download Instructions

## Step 1: Download Assets from Apple Marketing Tools

Visit: https://toolbox.marketingtools.apple.com/en-us/app-store/in/app/6747989825

## Step 2: Download These Assets

### Required:
1. **App Store Badge (White)**
   - Go to "Badges and Lockups" section
   - Select "White" badge
   - Select language: "en-us" (or your preferred language)
   - Click "Download Badges"
   - Save as: `public/assets/app-store/badge-white.png`

2. **App Icon**
   - Go to "App Icon" section
   - Click "Download Artwork"
   - Save as: `public/assets/app-icon/app-icon.png`

### Optional (for marketing):
- Square Post (1080x1080)
- Story Post (1080x1920)
- QR Code

## Step 3: File Structure

After downloading, your structure should look like:

```
public/
  assets/
    app-store/
      badge-white.png    ← Download from Apple Marketing Tools
      badge-black.png    ← Optional: black version
    app-icon/
      app-icon.png       ← Download from Apple Marketing Tools
    mock111.jpg          ← Already exists
```

## Step 4: Verify

Once files are in place, the app will automatically use them instead of external URLs.

## Note

If badge file doesn't exist, the code will fallback to Apple's official badge URL.

