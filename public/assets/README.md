# Spenly App Assets

This directory contains assets downloaded from Apple Marketing Tools.

## Asset Organization

### App Store Badges
Place downloaded badges in: `public/assets/app-store/`

**Available badges from Apple Marketing Tools:**
- Black badge (recommended for light backgrounds)
- White badge (recommended for dark backgrounds)
- Various language options

**Recommended files:**
- `badge-black.svg` or `badge-black.png`
- `badge-white.svg` or `badge-white.png`

### App Icon
Place app icon in: `public/assets/app-icon/`

**File name:** `app-icon.png` or `app-icon.jpg`

### Other Marketing Assets
- Square Post (1080x1080)
- Story Post (1080x1920)
- Banner Ads
- QR Code

## How to Download

1. Visit: https://toolbox.marketingtools.apple.com/en-us/app-store/in/app/6747989825
2. Download the assets you need
3. Place them in the appropriate folders above
4. Update component imports if filenames differ

## Current Usage

- **App Store Badge**: Used in `src/components/Hero.jsx`
- **App Icon**: Can be used in `src/components/Header.jsx` or favicon

