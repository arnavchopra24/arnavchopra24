# Deal Journal: setup guide

This folder is your whole website. GitHub Pages hosts it for free, and you'll connect your own domain to it.
Setup takes about 20 minutes, plus waiting time for the domain.

---

## Part 1: Put the site online (free)

1. **Create a GitHub account** at github.com if you don't have one. Pick your username carefully, because it shows up in the backup address of your site (for example `arnavchopra.github.io`).

2. **Create a repository** (a project folder on GitHub).
   - Click **+** (top right) → **New repository**.
   - Repository name: type exactly `YOUR-USERNAME.github.io`, using your own GitHub username. This exact name makes the site work at the main address.
   - Set it to **Public**. Don't add a README. Click **Create repository**.

3. **Upload the files.**
   - On the new repository's page, click **uploading an existing file**.
   - Unzip `deal-journal.zip` on your computer and open the `deal-journal` folder.
   - Select **everything inside it** (`_config.yml`, `_includes`, `_layouts`, `assets`, `templates`, `index.html`, `about.html`, `scorecard.html`, `404.html`, `deals.json`, `README.md`) and drag it all onto the GitHub page. Drag the *contents*, not the outer folder.
   - Scroll down and click **Commit changes**.

4. **Turn on GitHub Pages.**
   - In the repository, go to **Settings** → **Pages** (left sidebar).
   - Under **Build and deployment** → **Source**, choose **Deploy from a branch**.
   - Branch: **main**, folder: **/ (root)** → **Save**.
   - Wait 1–2 minutes and refresh. GitHub will show "Your site is live at https://YOUR-USERNAME.github.io".

Your site is now online. It will say "The first analysis is being written" until you add a deal (Part 3).

---

## Part 2: Connect your own domain

### Get the free domain
1. Apply for the **GitHub Student Developer Pack** at education.github.com/pack using your @illinois.edu email. Approval can take a few days.
2. Once approved, find **Namecheap** in the pack and claim a free **.me** domain for one year (for example `arnavchopra.me`). After the first year you pay Namecheap's normal renewal price.

### Point the domain at GitHub
3. In Namecheap: **Domain List** → **Manage** (next to your domain) → **Advanced DNS** tab.
4. Delete any existing records under **Host Records** (Namecheap adds "parking page" records by default).
5. Add these records with **Add New Record**:

| Type | Host | Value |
|---|---|---|
| A Record | `@` | `185.199.108.153` |
| A Record | `@` | `185.199.109.153` |
| A Record | `@` | `185.199.110.153` |
| A Record | `@` | `185.199.111.153` |
| CNAME Record | `www` | `YOUR-USERNAME.github.io` |

6. Back on GitHub: **Settings** → **Pages** → **Custom domain** → type `arnavchopra.me` (your domain) → **Save**.
7. GitHub checks the DNS. This can take anywhere from a few minutes to a few hours. When it shows a green check, tick **Enforce HTTPS**. If that box is greyed out, come back later. It can take up to a day for the security certificate to be issued.

Your site now lives at your domain, and `YOUR-USERNAME.github.io` forwards there automatically.

---

## Part 3: Add a deal (every week)

1. Open the `templates` folder in your repository and pick one:
   - `new-deal-ma.md` for strategic acquisitions and sponsor / LBO deals
   - `new-deal-bank.md` for bank mergers
   - `new-deal-restructuring.md` for Chapter 11s and liability management deals
2. Open the template, click the **copy** icon (top right of the file view) to copy its contents.
3. Go back to the main page of the repository → **Add file** → **Create new file**.
4. In the name box, type `_deals/` and then the deal's name, for example `_deals/mars-kellanova.md`. (Typing the `/` creates the folder.)
5. Paste the template, fill it in, and write your analysis under each `##` heading.
6. Click **Commit changes**. The site updates in 1–2 minutes.

**Drafts:** set `published: false` at the top and the deal stays hidden until you change it to `true`.

**Editing later:** open the file in `_deals`, click the pencil icon, edit, and commit. Use this to add an update when a deal closes, or to fill in `verdict_today` when you revisit your call. That's what fills the Scorecard page.

**If the site doesn't update:** open the **Actions** tab in your repository. A red ✗ means a typo in the top section of the deal file. Click it to see the line number. The usual causes are:
- missing quotes around text that contains a colon
- a `"` inside quoted text
- a tab character instead of spaces

Fix the file and commit again. The live site keeps showing the last working version in the meantime.

---

## Part 4: Personalize

Open `_config.yml` → pencil icon:
- **LinkedIn:** remove the `#` at the start of the `linkedin:` line and paste your profile URL.
- **Resume:** upload your PDF into the `assets` folder (Add file → Upload files), then remove the `#` from the `resume:` line and make sure the file name matches.
- **Photo:** upload a square photo into `assets/img`, then remove the `#` from the `photo:` line. Until then, the About page shows your initials.
- **Email:** optional. Anything you put here is public.

The About page text is in `about.html`. Edit the paragraphs between the `<p>` and `</p>` tags.

---

## Useful extras

- **Share a filtered view:** filters are saved in the address bar, so you can link to `arnavchopra.me/?advisor=Evercore` to show only deals Evercore advised on.
- **Social previews:** links to the site and to each deal show a preview card with the deal name and your subtitle when pasted into LinkedIn, iMessage or email.
