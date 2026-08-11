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


## ProfileQR v5 — GitHub Actions publishing

Online publishing no longer places a GitHub token in `admin.html`.

The repository includes:

- `.github/workflows/profile-publisher.yml`
- `.github/workflows/profileqr-verify.yml`

The publisher uses the repository's automatic `GITHUB_TOKEN` with `contents: write` and `issues: write` permissions. GitHub creates this token for each workflow job; it is not exposed to GitHub Pages JavaScript.

### Important first-time GitHub setting

In the repository:

1. Open **Settings → Actions → General**.
2. Under **Workflow permissions**, select **Read and write permissions**.
3. Save.
4. Make sure GitHub Actions is enabled.

The publisher always writes to the `master` branch.

### Online publishing flow

1. User fills the Online QR form.
2. `admin.html` creates the profile data, contact vCard and QR image locally.
3. The page opens a pre-filled GitHub Issue labeled `profileqr-publish`.
4. User submits that issue.
5. `profile-publisher.yml` runs.
6. The workflow validates the request.
7. The workflow uses `GITHUB_TOKEN` to create/update:
   `profiles/<profile-id>/profile.json`
   `profiles/<profile-id>/contact.vcf`
   `profiles/<profile-id>/qr.png`
   `profiles/<profile-id>/profile-url.txt`
8. The workflow commits the changes to `master`.
9. The workflow closes the issue.

### Security note

GitHub Pages itself cannot safely read a repository `GITHUB_TOKEN`. GitHub creates `GITHUB_TOKEN` inside the Actions job and scopes it to the repository. This package therefore never embeds that token in client-side JavaScript.

The issue-based handoff is used because an unauthenticated GitHub Pages browser cannot securely call GitHub's authenticated workflow-dispatch APIs without some credential. The user must click **Submit new issue** in GitHub; after that, the repository-side workflow performs the privileged write.
