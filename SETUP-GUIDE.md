# 💬 The Hangout app: setup guide

This turns The Hangout into a real app that anyone can use with just an email address. No claude.ai account is needed.

**What you need:** a computer, about 30 minutes, and a Google account (for Firebase) and a GitHub account (for the website). If you're under 13, ask a parent to do the account parts with you.

**Cost:** $0. Firebase's free plan doesn't need a credit card.

---

## Part 1: Make your free Firebase project (about 10 minutes)

Firebase stores everyone's accounts, chats and friend lists.

1. Go to **console.firebase.google.com** and sign in with a Google account.
2. Click **Create a project** (or **Add project**).
   - Name it `the-hangout` (or anything you like) and click **Continue**.
   - **Turn off** Google Analytics (you don't need it), then click **Create project**.
3. **Turn on email sign-in:**
   - In the left menu, click **Build → Authentication → Get started**.
   - Click **Email/Password**, switch on the **first** toggle (Email/Password), and click **Save**.
4. **Make the database:**
   - In the left menu, click **Build → Firestore Database → Create database**.
   - Pick a location close to you (for Canada, `northamerica-northeast1 (Montréal)` is good) and click **Next**.
   - Choose **Start in production mode** and click **Create**.
5. **Add the security rules** (this keeps people's chats private):
   - In Firestore, click the **Rules** tab.
   - Delete everything in the box.
   - Open the file **firestore.rules**, copy **all** of it, and paste it into the box.
   - Click **Publish**. If it shows a red error, tell me exactly what it says.
6. **Get your app's settings:**
   - Click the ⚙️ gear next to **Project Overview**, then **Project settings**.
   - Scroll down to **Your apps** and click the **`</>`** (Web) button.
   - Nickname: `Hangout website`. **Don't** tick Firebase Hosting. Click **Register app**.
   - You'll see some code with `const firebaseConfig = { ... }`. **Keep this page open**, because you'll need it in Part 2.

---

## Part 2: Put the app on GitHub (about 10 minutes)

1. Go to **github.com** and sign in (or sign up).
2. Click **+** (top right) → **New repository**.
   - Name: `the-hangout`. Choose **Public**. Tick **Add a README file**. Click **Create repository**.
3. Click **Add file → Upload files**, then drag in **all** these files from the folder I gave you:
   `index.html`, `app.js`, `config.js`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`
   Then click **Commit changes**.
4. **Paste your Firebase settings into config.js:**
   - In your repo, click **config.js**, then the ✏️ pencil (Edit) button.
   - Replace the part between `{` and `}` with the values from the Firebase page you kept open (`apiKey`, `authDomain`, `projectId`, and so on).
   - Keep the first words `export const firebaseConfig =` exactly as they are.
   - Click **Commit changes**.
5. **Turn on the website:**
   - Click **Settings** (in your repo) → **Pages** (left menu).
   - Source: **Deploy from a branch**. Branch: **main**, folder **/ (root)**. Click **Save**.
   - Wait 1–2 minutes, then refresh. You'll see **"Your site is live at https://YOURNAME.github.io/the-hangout/"**.

---

## Part 3: Connect them (about 2 minutes)

Google sign-in services only work on websites you approve.

1. Back in Firebase, go to **Authentication → Settings → Authorized domains**.
2. Click **Add domain** and type `YOURNAME.github.io` (your GitHub username, without `https://` and without `/the-hangout`).
3. Click **Add**.

---

## Part 4: Try it! 🎉

1. Open your site link: `https://YOURNAME.github.io/the-hangout/`
2. Tap **Sign up**, enter your email and a password, and pick your name and **@username**.
3. Check your email for the "verify your email" message (look in spam too).
4. **Install it like an app:**
   - **Android (Chrome):** tap **Install** in the app, or the ⋮ menu → **Install app**.
   - **iPhone/iPad (Safari):** tap the **Share** button ⬆️ → **Add to Home Screen**.
   - **Computer (Chrome or Edge):** click the install icon at the right end of the address bar.
5. Go to the **Me** tab and tap **🔔 Turn on notifications**.
6. Send your friends the link (the **Friends** tab has a **📋 Copy invite** button). They sign up, then add you by your @username!

---

## Updating the app later

When I send you new files, go to your GitHub repo → **Add file → Upload files**, drag in the new files (**not** config.js, unless I say so, because yours has your settings in it), and click **Commit changes**. The app updates within a few minutes.

---

## Good to know

- **Notifications** work while the app is open, minimized or in another tab. If the app is fully closed, alerts can't arrive. That would need a paid Firebase plan, which we can add later.
- **iPhone/iPad notifications** only work after you install the app with **Add to Home Screen** and open it from the home screen.
- **Video calls** open in **Jitsi Meet** (free). Whoever starts a call signs in on Jitsi once (Google, GitHub or Facebook); everyone else just joins.
- **Free limits:** about 50,000 reads and 20,000 writes per day. That's plenty for a friend group. If you ever go over, the app pauses until the next day. You'll never be charged without a card on file.
- **Safety:** only add people you know. You can 🚫 block someone from their profile. Never share your password.

## Something not working?

| What you see | What to do |
|---|---|
| "Almost ready!" page | config.js still has the placeholder. Redo Part 2, step 4. |
| Sign up says something went wrong | Check Part 1 step 3 (Email/Password turned on) and Part 3 (authorized domain). |
| "You're not allowed to do that" | The rules weren't published. Redo Part 1, step 5. |
| Old version still showing | Close the app fully and reopen it, or refresh twice. |
| No verify email | Look in spam/junk. Tap **Send again** at the top of the app. |
