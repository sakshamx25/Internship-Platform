# HunarIntern

**Forge your ambition.**

HunarIntern is a static website for a virtual internship platform, offering structured, mentor-led internships across Web Development, Data Science, AI, UI/UX, Cloud Computing, and Digital Marketing. Built with plain HTML/CSS/JavaScript and a serverless backend for its AI-powered resume tool.

🔗 **Live site:** https://tutorials.hunarintern.workers.dev/

---

## ✨ Features

- **Internship Domains** — browsable, searchable, filterable domain cards with an embedded Google Form for registration
- **Developer Tools** — a suite of free in-browser tools:
  - Roast My Resume (AI-powered feedback via Claude API)
  - HTML / CSS / JS formatters
  - HTML/CSS/JS live playground
  - Online JavaScript compiler with console output
  - JSON formatter
- **Services** page and **Projects** showcase
- **Certificate verification** link-out
- **Contact form** wired to Google Sheets via Apps Script
- Fully responsive, animated UI (page-load transitions, hover effects, scroll reveals, marquees)
- No frontend framework — vanilla HTML/CSS/JS throughout

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (custom properties, no framework) |
| Interactivity | Vanilla JavaScript |
| Fonts | Space Grotesk, Inter, IBM Plex Mono (Google Fonts) |
| Serverless backend | Netlify Functions (Node.js) |
| AI feature | Anthropic Claude API (Roast My Resume) |
| Form storage | Google Sheets + Apps Script |

---

## 📁 Project Structure

```
hunarintern-site/
├── index.html              # Home
├── internship.html         # Internship domains + registration
├── projects.html           # Projects showcase
├── tools.html              # Developer Tools
├── services.html           # Services
├── about.html               # About Us
├── contact.html             # Contact
├── terms.html                # Terms & Conditions
├── assets/
│   ├── css/style.css       # All site styling
│   ├── js/
│   │   ├── main.js         # Shared site interactivity
│   │   ├── roast.js        # Roast My Resume frontend logic
│   │   └── tools.js        # Developer Tools logic
│   └── img/                # Images, logos, authority badges
├── netlify/
│   └── functions/
│       └── roast-resume.js # Serverless function (Claude API + file parsing)
├── package.json             # Node dependencies for the Netlify function
├── netlify.toml              # Netlify build/functions config
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (for the Netlify Functions dependencies)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/) (for local testing of serverless functions)

### Local Setup

```bash
# Clone the repo
git clone https://github.com/sakshamx25/Internship-Platform.git
cd Internship-Platform

# Install function dependencies
npm install

# Create a .env file with your API key (never commit this file)
echo "ANTHROPIC_API_KEY=your_key_here" > .env

# Run locally with Netlify CLI (serves static files + functions together)
netlify dev
```

Then open the local URL Netlify CLI prints (usually `http://localhost:8888`).

> **Note:** Opening the HTML files directly or via a plain static server (e.g. VS Code Live Server) will **not** run the Roast My Resume feature, since it depends on the Netlify Function backend. Use `netlify dev` for full functionality.

---

## 🔒 Environment Variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API key used by the Roast My Resume function |

Never commit your `.env` file — it's excluded via `.gitignore`.
