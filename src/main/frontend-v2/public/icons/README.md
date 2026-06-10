# PWA Icons

## Required icons:
Generate PNG files from the Sunbird Serve logo at these sizes:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png (iOS)
- icon-192x192.png (Android)
- icon-384x384.png
- icon-512x512.png
- icon-512x512-maskable.png (with safe zone padding)

## How to generate:

### Option 1: Online tool
Go to https://www.pwabuilder.com/imageGenerator
Upload your logo → download all sizes

### Option 2: From SVG (included)
Use the icon.svg in this folder as source:
```bash
# Using sharp/node
npx sharp-cli -i icon.svg -o icon-192x192.png resize 192 192
npx sharp-cli -i icon.svg -o icon-512x512.png resize 512 512
```

### Option 3: From existing logo
The Sunbird Serve logo is at: src/main/frontend/src/assets/sunbirdicon.png
Resize it to all required dimensions.

## Maskable icon:
The maskable icon needs extra padding (safe zone = inner 80% of the icon).
Use https://maskable.app/editor to test your maskable icon.

## Apple Touch Icon:
Place apple-touch-icon.png (180x180) in the public/ root folder.
