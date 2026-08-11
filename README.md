# ProfileQR client package

This package adds two generator modes:

- Online QR: publishes a complete profile package to GitHub using the GitHub Contents API.
- Offline QR: keeps the existing vCard-in-QR behavior.

## Online package created

For profile ID `john`:

profiles/john/
├── profile.json
├── contact.vcf
├── qr.png
└── profile-url.txt

The QR contains:

https://shamim4s.github.io/ProfileQR/profile.html?id=john

The public profile page loads:

profiles/john/profile.json

and provides a Save Contact button that downloads a vCard.

## GitHub token

Do NOT hard-code a GitHub token into HTML.

Create a fine-grained GitHub personal access token that has repository Contents read/write permission for the ProfileQR repository. Enter it into the Online QR form when publishing.

The token is used only in the current browser session. It is not stored in localStorage and is not uploaded as part of the profile package.

## GitHub Pages

Make sure GitHub Pages is enabled for the repository and serves the branch containing these files.

The expected public URL is:

https://shamim4s.github.io/ProfileQR/

If your repository or Pages URL is different, change the GitHub owner/repository fields and the generated URL will follow the current site URL.

## Files

- index.html
- admin.html
- profile.html
- style.css
- qrcode.min.js
