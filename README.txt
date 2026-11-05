TEJA SUN TECH SOLAR ENQUIRY — SETUP

Included:
- index.html: customer-facing responsive form
- Code.gs: Google Apps Script backend for Google Sheet + email notification
- SETUP_TELUGU.txt: Telugu setup steps

SETUP:
1. Sign in to the Google account that should own the leads sheet.
2. Open https://script.google.com/ and create a New project.
3. Replace the editor code with the contents of Code.gs. Save.
4. Select function setup and click Run. Approve Google permissions.
5. Open the execution log and copy LEADS_SHEET_URL. This is your private Sheet.
6. Deploy > New deployment > Web app.
7. Execute as: Me. Who has access: Anyone. Deploy and authorize.
8. Copy the Web App URL ending in /exec.
9. In index.html replace PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE with that URL.
10. Upload index.html to Netlify or another HTTPS static host. Use its public URL in Instagram Bio.
11. Test with your own mobile number. Confirm both a new Sheet row and an email to naduentertainments@gmail.com before publishing.

IMPORTANT:
- Keep the Google Sheet private; share only with authorized people.
- Apps Script sends mail from the Google account that deployed it. Google sending quotas apply.
- Same mobile number is blocked for another submission within 24 hours (basic duplicate guard).
- Honeypot and validation reduce simple spam but do not guarantee genuine identity. No SMS OTP or CAPTCHA is included.
- A 10-digit number check does not prove the number belongs to the submitter.
- Get Teja Sun Tech's approval for the brand, service area, wording, data collection, and contact consent before publishing.
- No savings, subsidy, warranty, price, or installation guarantees are claimed.
