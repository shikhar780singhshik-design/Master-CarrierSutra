# Study guide: how Master Carriersutra works

## The big picture
```
Browser (public/)                          Server (server.js + server/)
index.html + css/*.css + js/**/*.js  <-->  accounts, progress, AI, Google voice
```
The browser draws everything. The server stores progress, talks to Claude and Google, and keeps the secret keys safe. The page never sees your keys.

## One file for each job
Open `README.md` for the full table of files. The idea: if you want to change the login page, open `public/js/screens/login.js`. If you want to change how the buddy walks, open `public/js/buddy/buddy-movement.js`. Nothing else needs to change.

## How the front end files join together
There is no build step. `public/index.html` lists every script in order, and the browser runs them one after another. They share one set of names, so a function written in one file can be used in the next.
1. `core/`: the data lists, the app state, small helpers, and the AI client.
2. `characters/`: languages and the four cartoon characters.
3. `buddy/`: the study buddy (state, voice, drawing, chat, movement).
4. `screens/`: one file per screen (login, dashboard, study plan, lectures, notes, tests, focus timer, portfolio, parent voice, settings, legal) and the layout that shows them.
5. `main.js`: starts the app. It must stay last.
If you add a new file, add its `<script>` line to `index.html` before `main.js`, after any file it depends on at start-up.

## How the back end files join together
Each file in `server/` has `require` lines at the top (what it uses) and `module.exports` at the bottom (what it shares). `server/routes/index.js` joins the route files into one table. `server.js` creates the server and uses that table.

## Reading a screen
Each screen is a function that returns HTML text (for example `dashboardScreen()`). `render()` in `screens/layout.js` draws the right one. Buttons call functions by name, for example `onclick="goTo('quiz')"`.

## Small changes you can try
- **New language**: add a line to `LANGUAGES` (`characters/languages.js`) and its code to `SPEECH_LANGUAGES` (`server/voices.js`).
- **New character**: add a drawing to `CHARACTERS` and a name to `CHARACTER_NAMES` (`characters/characters.js`), then raise the limit in `cleanProfile` (`server/validation.js`).
- **More quiz questions**: add rows to `BANK` (`core/data-lists.js`).
- **How the buddy behaves and jokes**: edit `buddyInstructions` (`buddy/buddy-chat.js`).
- **Colours and themes**: `public/css/themes-and-settings.css`.
- **Another video site**: add a rule in `embedFor` (`screens/lectures.js`) and allow its address in `frame-src` (`server/http-utils.js`).

## Checking your changes
Run `npm test`. It loads the same files as the browser, opens every screen, tries the plan, notes and settings actions, and checks that every button points to a real function. A typo shows up as a clear message.

## Safety notes
See `SECURITY.md`.
