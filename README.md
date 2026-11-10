# WEAR ME: website files (front end)

These files are the whole website: the store customers see and the owner dashboard.
They are plain HTML, CSS and JavaScript. There is nothing to build or install.


| File | What it is |
|---|---|
| `index.html` | The store (welcome page, home, catalogue, sew with us, checkout, my orders, contact, legal pages, size guide). |
| `admin.html` | The owner dashboard (Sales, Finance, PR, Logistics, Customer Service, Legal). Not linked from the store. |
| `styles.css` | All the styling for both pages. Colours are at the top (`--brand`, `--accent`). |
| `app.js` | The store and dashboard code. |
| `api-client.js` | The connection to the server: database, uploads, admin login, downloads. |
| `config.js` | **The one file you edit**: the address of the server (`apiBase`). |
| `robots.txt` | Asks search engines to skip `admin.html`. |
| `README.md` | This file. |

## Connect it to the server

1. Set up the server from `2-server-files` (see its README) and note its address.
2. Open `config.js` and set `apiBase`:
   - Testing on your own computer: `"http://localhost:4000"`
   - Website and server on the same host (server has `SITE_DIR` set): `""`
   - Live, server on its own address: `"https://api.yourdomain.com"`
3. Upload these files to your web host (or let the server serve them).
4. Open `admin.html` once. The first time, it asks you to create the admin account (email and password).

Admin link: `https://yourdomain.com/admin.html`. Store link: `https://yourdomain.com/`.

On the server, set `ALLOWED_ORIGINS` to your website address(es) so only your site can use it.

## Try it on your computer

1. Start the server (`node server.js` inside `2-server-files`).
2. In this folder run `python3 -m http.server 5000` (or any static file server).
3. Open `http://localhost:5000/` for the store and `http://localhost:5000/admin.html` for the dashboard.

## How the two halves talk

`api-client.js` calls the server at `apiBase`. The store reads products and settings (public), and creates
orders and sewing requests. The dashboard logs in with a token that lasts 12 hours (kept in the browser tab only)
and can read and change everything. New orders show in the dashboard within a few seconds (`pollSeconds` in `config.js`).

## Things in this version that are still placeholders

- **Customer accounts** (sign up / log in on the store) are kept in the customer's own browser only. Google and Apple
  sign-in buttons are not connected. A customer's order history works by email address, so it only follows them
  on the same device or when they use the same email.
- **Payments**: the bank-transfer flow (copy account number, upload screenshot) works, and the owner marks the order Paid
  after checking the money. The card form is a demonstration (code 123456) and does not charge anything. Real card
  payments need a payment provider (for example Paystack or Flutterwave) connected through the server.
- **Legal pages and size guides** start with sample text. Replace them in the dashboard. Have a lawyer check the legal text.
- **Delivery tracking** is manual: the owner updates the status and a tracking note.
- Product pictures: 1200 x 1500 px (4:5), under 10 MB. Banner videos: MP4 or WebM, wide 8:3, under 15 seconds, under 20 MB.
  Model pictures: 3:4 portrait, under 10 MB.
