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


## Token
The GitHub settings section is removed. On the first Online QR publish, the browser asks for the token once and stores it locally. To clear it, open the browser console and run `ProfileQR.clearGithubToken()`. A client-side token cannot be truly secret on a public static page; use a server-side API if other people will publish profiles.


## New features
- Automatic 6-character Profile ID with manual override.
- Edit Existing Profile search by ID/slug, phone number, or name.
- Company, About, Additional Information.
- LinkedIn, WeChat, Facebook, Instagram, X, TikTok and YouTube social fields with profile icons.
- Online edits update the existing `profiles/<id>/` files on the `master` branch.
