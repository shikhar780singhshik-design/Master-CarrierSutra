# Master Carriersutra

Study planner and AI study buddy for Class 6 to 10. A cartoon tutor walks around the page, speaks your language, asks you questions and cheers when you do well.

## Run it on your computer
1. Install Node.js 18 or newer from nodejs.org.
2. Copy `.env.example` to a new file named `.env`. Type your Anthropic key after `ANTHROPIC_API_KEY=` and any long random text after `SESSION_SECRET=`.
3. Open this folder in VS Code. Press **F5** (it is set up to start the server), or open a terminal and run `npm start`.
4. Open **http://localhost:3000**.

Nothing needs installing with npm. The project has no packages.

### Using VS Code "Go Live"
Live Server only shows web pages. Keep the server running (step 3) and then click Go Live on `public/index.html`. The page finds the server on port 3000 by itself. If the server is off, the login screen tells you.

## Putting it on the internet
1. Put the folder on GitHub (the `.gitignore` already keeps `.env` and `data/` out).
2. Create a Web Service on Render, Railway or Fly.io from that repository. Start command: `npm start`. (A `Dockerfile` is included if the host prefers one.)
3. Add the same settings as `.env` in the host's environment variables, plus `NODE_ENV=production` and `TRUST_PROXY=1`.
4. Attach a persistent disk and keep `data/` on it. Otherwise accounts vanish whenever the host restarts. For many users, move the data into Postgres.
5. Connect your own domain in the host's settings. HTTPS is added for you.

## Voices (how every language gets spoken)
A browser can only speak with voices installed on the device, and most devices only have English and Hindi. Marathi, Bengali, Gujarati, Punjabi, Tamil, Telugu, Kannada, Malayalam and Odia are spoken only if the **server** has a cloud voice. Pick one:
- **Google** (`GOOGLE_TTS_API_KEY`): in Google Cloud create a project, **enable billing** (the free monthly allowance still applies), turn on "Cloud Text-to-Speech API", then create an API key. Google has no Odia voice.
- **Microsoft Azure** (`AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION`): create a "Speech" resource (it has a free tier) and copy its key and region, for example `centralindia`. Azure covers all eleven languages including Odia.
- **Quick test only** (`FREE_TEST_VOICE=1`): needs no key and lets you hear every language on your own computer. It uses an unofficial web address, so do not rely on it for a real launch.
You can set several. The server tries them in that order.

**How to see what works:** when the server starts it prints a line for every language, such as `mr-IN  OK` or `mr-IN  FAILED  <reason>`. Read the reason, fix it, and restart. In the app, the chat panel shows a line like "Voice: cloud voice, Marathi", and the **Test voice** button speaks a sample sentence in the chosen language. If you see "No Marathi voice on this device", the server is not using a cloud voice yet. The most common causes are a missing key, an API that is not enabled, billing not turned on, or a profile created before the server was running (sign out and make a new one).

## Study plan, notes and settings
- **Study plan:** the student can add, tick off and remove their own sessions, or choose the buddy's plan, their own, or both.
- **Notes:** "Board notes" asks the AI to search official sites (NCERT, the board website, DIKSHA) for the student's board and class, rewrites them in simple words and lists the links used. "Add starter notes" does this for every subject. Students can also write, edit and delete their own notes.
- **Settings** (above Log out): profile, buddy character, name, language, jokes, voice and speed, four themes, text size, calm mode, daily goal, change PIN or parent password, download data, sign out everywhere, delete account.

## Lecture videos
Paste a YouTube or Vimeo link, or a direct `.mp4` link, in the Lectures page. It plays inside the app. Other sites open in a new tab.

## How the project is organised
Every part of the app has its own file, named after what it does. Files are small and joined in a fixed order.

**Back end** (`server.js` starts everything and joins the files in `server/`):
| File | What it does |
| --- | --- |
| `server.js` | The server starts here. |
| `server/config.js` | Settings read from .env and the environment. |
| `server/storage.js` | The tiny database: accounts and progress kept in one JSON file. |
| `server/security.js` | Passwords, login tokens, rate limits and account lockouts. |
| `server/http-utils.js` | Small helpers for requests and replies, plus the security headers. |
| `server/validation.js` | Checks and cleans everything the browser sends before it is saved. |
| `server/tutor.js` | Asking Claude to answer students, with web search. |
| `server/voices.js` | Turning the buddy's replies into speech with Google, Azure or the test voice. |
| `server/static-files.js` | Serving the website files safely. |
| `server/routes/health.js` | Routes: Is the server up, and which features are switched on. |
| `server/routes/sign-in-and-sign-up.js` | Routes: Creating accounts and signing in. |
| `server/routes/progress.js` | Routes: Loading and saving a student's progress. |
| `server/routes/account-settings.js` | Routes: Changing the PIN or password, signing out everywhere, deleting an account. |
| `server/routes/study-buddy.js` | Routes: The AI tutor and the spoken voice. |
| `server/routes/index.js` | Joins every route file into one table. |

**Front end** (`public/index.html` loads every file below, in this order):
| File | What it does |
| --- | --- |
| `public/js/core/data-lists.js` | Study data: subjects, backup quiz questions and career ideas. |
| `public/js/core/app-state.js` | The app's memory: the state object, saving and loading, and where the server is. |
| `public/js/core/helpers.js` | Small tools used everywhere: finding elements, safe text, averages, dates, XP and streaks. |
| `public/js/core/ai-client.js` | Talks to the AI through the server, and translates the buddy's own lines. |
| `public/js/characters/languages.js` | The languages the buddy can speak. |
| `public/js/characters/characters.js` | The logo, the four cartoon characters and the night scenes, all drawn in code. |
| `public/js/buddy/buddy-state.js` | What the study buddy is doing right now. |
| `public/js/buddy/buddy-voice.js` | How the buddy speaks: cloud voice first, device voice as a backup. |
| `public/js/buddy/buddy-drawing.js` | Drawing the buddy, its speech bubble and the chat panel. |
| `public/js/buddy/buddy-chat.js` | The buddy's personality, and sending and receiving chat messages. |
| `public/js/buddy/buddy-movement.js` | The buddy walking around the page and asking questions on its own. |
| `public/js/screens/layout.js` | The app shell: sidebar, switching screens and page animation. |
| `public/js/screens/login.js` | Sign up, sign in, parent access and logging out. |
| `public/js/screens/legal.js` | Privacy Policy and Terms and Conditions pages. |
| `public/js/screens/dashboard.js` | The dashboard. |
| `public/js/screens/study-plan.js` | The study plan: the buddy's plan and the student's own sessions. |
| `public/js/screens/lectures.js` | Lecture videos that play inside the app. |
| `public/js/screens/notes.js` | Notes: board notes from the web, your own notes, and AI written notes. |
| `public/js/screens/tests.js` | Daily, weekly and monthly tests. |
| `public/js/screens/focus-timer.js` | The 25 minute focus timer. |
| `public/js/screens/portfolio.js` | The career portfolio. |
| `public/js/screens/parent-voice.js` | The parent's spoken summary and questions about the child. |
| `public/js/screens/settings.js` | Settings: profile, buddy, themes, study goals, account and privacy. |
| `public/js/main.js` | Starts the app. This file loads last. |

**Styles** (loaded in this order, so later files win):
| File | What it does |
| --- | --- |
| `public/css/base.css` | Colours, fonts, buttons and inputs. |
| `public/css/layout.css` | Page layout: sidebar, main area, banner and footer. |
| `public/css/components.css` | Cards, tags, bars, tables, tabs and charts. |
| `public/css/login.css` | The login screen. |
| `public/css/study-buddy.css` | The cartoon buddy, its chat panel and the character picker. |
| `public/css/motion.css` |  |
| `public/css/lecture-player.css` |  |
| `public/css/themes-and-settings.css` |  |

Other files: `tests/smoke.js` (run `npm test`), `.env.example`, `Dockerfile`, `SECURITY.md`, `STUDY_GUIDE.md`.

## Security
See `SECURITY.md`.

## More reading
`STUDY_GUIDE.md` explains how the code works and how to change it.
