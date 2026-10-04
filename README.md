# OpenMind prototype

**Learning that listens, looks and asks back.** A working prototype of OpenMind and Vivi, the Socratic learning buddy, built for the Reliance T.U.P XII elimination round by Team Marketing Masterminds.

Plain HTML, CSS and JavaScript. No build step, no framework. Works offline once loaded.

**What's in it:** a child app (Vivi chat with voice and video call, Learn, 13 brain games including Chess Coach, Speak up, Feelings, Revise, My buddy) and a full parent app (Home, Insights, Activity, Toy Hub, Store, Settings). A bar at the top of every screen switches between child and parent, English and Hindi, phone and desktop view, and light, dark or automatic theme.

## What's inside

| Path | What it is |
|---|---|
| `index.html` | The app shell |
| `css/styles.css` | All styles |
| `js/content.js` | Lessons, debates, stories, scenarios. Edit content here. |
| `js/vivi.js` | Vivi's avatar, animation, voice in and out, copy-cat recorder |
| `js/engine.js` | The Socratic conversation engine (offline), plus the live-AI hook |
| `js/games.js` | The 8 brain games |
| `js/app.js` | Screens, child and parent sides, storage |
| `api/chat.js` | Optional Vercel function that connects live AI (Claude) |
| `api/tts.js` | Optional Vercel function for a natural voice (Sarvam Bulbul or OpenAI) |
| `docs/OpenMind_App_Blueprint.md` | Full feature list, research and demo script |

## Run it locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

Camera and microphone need `localhost` or `https`, so open it through a server, not by double-clicking the file.

## Deploy on Vercel (5 minutes)

1. Push this folder to a new GitHub repository (the files at the top level, not inside another folder).
2. On vercel.com, choose **Add New → Project**, import the repo, keep every default (Framework preset: **Other**), and click **Deploy**.
3. That's it. The app is live and works fully offline with the built-in lessons.

### Gemini (live AI + natural voice)

The **📶 Online / ✈️ Offline** button in the top bar decides: Online sends conversations to Gemini and uses the Gemini voice; Offline uses only the built-in lessons and the device voice.


With `GEMINI_API_KEY` set in Vercel (Settings → Environment Variables), then **Redeploy**:
- **Chat:** questions outside the built-in lessons stream from Gemini (`api/chat.js`, model `gemini-2.5-flash`), using Vivi's ask-don't-tell persona. Live AI switches on automatically; parents can turn it off in Settings.
- **Voice:** Vivi speaks with Gemini TTS (`api/tts.js`, model `gemini-2.5-flash-preview-tts`, voice `Puck`).
- Optional variables: `GEMINI_MODEL`, `GEMINI_TTS_MODEL`, `GEMINI_VOICE`.
- Check it works: Parent → Settings shows "Connected to Gemini" and "Natural Indian voice is on (Gemini)". Press **Test voice**.

### Give Vivi a natural human voice (recommended)

Without a key, Vivi uses the most natural voice already on the device (Edge's "Natural" voices and Google's voices are picked first). For a clear, human-sounding Indian voice in English and Hinglish:

1. Get a key from Sarvam AI (dashboard.sarvam.ai). Sarvam's Bulbul voices are built for Indian accents and mixed Hindi-English.
2. In Vercel, add the environment variable `SARVAM_API_KEY`. Optional: `SARVAM_SPEAKER` (Vivi's voice, default `anushka`).
3. Redeploy. The parent dashboard will say "Natural Indian voice is on (Sarvam)". Press **Test voice** to hear it.

Alternative: add `OPENAI_API_KEY` instead, and Vivi uses OpenAI's voice with a warm-tutor style. If both are set, Sarvam is used.

Parents can also pick a specific device voice under **Vivi's voice** in settings.

### Turn on live AI (optional)

1. In Vercel, open **Project → Settings → Environment Variables**.
2. Add `ANTHROPIC_API_KEY` with your key. Optionally add `CLAUDE_MODEL` (default: `claude-haiku-4-5-20251001`).
3. Redeploy.
4. In the app, open the parent dashboard and tick **Use live AI**. It shows "(connected)" when the key works.

With live AI on, anything outside the built-in lessons goes to the model with a child-safe Socratic system prompt (see `api/chat.js`). The key never reaches the browser.

## Best browser

- **Chrome or Edge** on a laptop, Android tablet or iPad give the full experience, including voice input.
- Safari works for everything; voice input there depends on the iOS version.
- Hindi voice output needs a Hindi voice on the device. Chrome includes one.

## For the presentation

Open the parent app, go to **Settings** and click **Load demo week** so the dashboard shows a realistic week. In **Talk to Vivi**, tap any starter and then keep tapping the suggested replies to walk through a whole conversation without typing. **Demo conversation** plays a scripted English conversation (always offline), and **New conversation** starts fresh.

The parent app asks a simple times-table question. For the demo you can tap **Skip for now**. Use **📱 Mobile** in the top bar to show the phone experience on a laptop screen.

## Privacy

All data is stored in the browser on this device (localStorage). Nothing is sent anywhere unless a parent switches on live AI, and then only the conversation text is sent, with no name or contact details.
