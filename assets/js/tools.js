// Developer Tools page — HTML/CSS/JS formatters, playground, JS compiler, JSON formatter
// All client-side, no server calls (except Roast My Resume, handled separately by roast.js)

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Shared helpers ---------- */
  function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = original; }, 1200);
    });
  }

  /* ---------- HTML Formatter (lightweight, rule-based) ---------- */
  function formatHTML(html) {
    let formatted = '';
    let indent = 0;
    const voidTags = ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'];
    html = html.trim().replace(/>\s*</g, '><');
    const tokens = html.split(/(<[^>]+>)/g).filter(t => t.trim() !== '');

    tokens.forEach(token => {
      if (token.startsWith('</')) {
        indent = Math.max(indent - 1, 0);
        formatted += '  '.repeat(indent) + token + '\n';
      } else if (token.startsWith('<')) {
        const tagName = (token.match(/<\/?([a-zA-Z0-9]+)/) || [,''])[1].toLowerCase();
        const selfClosing = token.endsWith('/>') || voidTags.includes(tagName);
        formatted += '  '.repeat(indent) + token + '\n';
        if (!selfClosing) indent++;
      } else {
        formatted += '  '.repeat(indent) + token.trim() + '\n';
      }
    });
    return formatted.trim();
  }

  const htmlIn = document.getElementById('html-in');
  const htmlOut = document.getElementById('html-out');
  const htmlFormatBtn = document.getElementById('html-format-btn');
  const htmlCopyBtn = document.getElementById('html-copy-btn');
  if (htmlFormatBtn) {
    htmlFormatBtn.addEventListener('click', () => {
      htmlOut.value = htmlIn.value.trim() ? formatHTML(htmlIn.value) : '';
    });
    htmlCopyBtn.addEventListener('click', () => copyToClipboard(htmlOut.value, htmlCopyBtn));
  }

  /* ---------- CSS Formatter ---------- */
  function formatCSS(css) {
    css = css.replace(/\s*{\s*/g, ' {\n  ').replace(/;\s*/g, ';\n  ').replace(/\s*}\s*/g, '\n}\n');
    css = css.split('\n').map(line => line.trim()).filter(l => l !== '').map(line => {
      if (line === '}') return line;
      if (line.endsWith('{')) return line;
      return '  ' + line;
    }).join('\n');
    return css.replace(/\n\s*}\n/g, '\n}\n\n').trim();
  }

  const cssIn = document.getElementById('css-in');
  const cssOut = document.getElementById('css-out');
  const cssFormatBtn = document.getElementById('css-format-btn');
  const cssCopyBtn = document.getElementById('css-copy-btn');
  if (cssFormatBtn) {
    cssFormatBtn.addEventListener('click', () => {
      cssOut.value = cssIn.value.trim() ? formatCSS(cssIn.value) : '';
    });
    cssCopyBtn.addEventListener('click', () => copyToClipboard(cssOut.value, cssCopyBtn));
  }

  /* ---------- JS Formatter (lightweight, rule-based) ---------- */
  function formatJS(js) {
    let indent = 0;
    let out = '';
    let i = 0;
    let inString = null;
    let buffer = '';

    function flush() {
      if (buffer.trim()) out += '  '.repeat(indent) + buffer.trim() + '\n';
      buffer = '';
    }

    while (i < js.length) {
      const ch = js[i];
      if (inString) {
        buffer += ch;
        if (ch === inString && js[i - 1] !== '\\') inString = null;
        i++; continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { inString = ch; buffer += ch; i++; continue; }
      if (ch === '{') { buffer += ' {'; flush(); indent++; i++; continue; }
      if (ch === '}') { flush(); indent = Math.max(indent - 1, 0); out += '  '.repeat(indent) + '}\n'; i++; continue; }
      if (ch === ';') { buffer += ';'; flush(); i++; continue; }
      if (ch === '\n') { flush(); i++; continue; }
      buffer += ch;
      i++;
    }
    flush();
    return out.replace(/\n{3,}/g, '\n\n').trim();
  }

  const jsIn = document.getElementById('js-in');
  const jsOut = document.getElementById('js-out');
  const jsFormatBtn = document.getElementById('js-format-btn');
  const jsCopyBtn = document.getElementById('js-copy-btn');
  if (jsFormatBtn) {
    jsFormatBtn.addEventListener('click', () => {
      jsOut.value = jsIn.value.trim() ? formatJS(jsIn.value) : '';
    });
    jsCopyBtn.addEventListener('click', () => copyToClipboard(jsOut.value, jsCopyBtn));
  }

  /* ---------- HTML/CSS/JS Playground ---------- */
  const pgHtml = document.getElementById('pg-html');
  const pgCss = document.getElementById('pg-css');
  const pgJs = document.getElementById('pg-js');
  const pgPreview = document.getElementById('pg-preview');
  const pgRunBtn = document.getElementById('pg-run-btn');

  function runPlayground() {
    if (!pgPreview) return;
    const doc = `<!DOCTYPE html><html><head><style>${pgCss.value}</style></head><body>${pgHtml.value}<script>${pgJs.value}<\/script></body></html>`;
    pgPreview.srcdoc = doc;
  }
  if (pgRunBtn) {
    pgRunBtn.addEventListener('click', runPlayground);
    runPlayground(); // initial render on load
  }

  /* ---------- Online Code Editor & Compiler (JavaScript) ---------- */
  const compIn = document.getElementById('comp-in');
  const compOut = document.getElementById('comp-out');
  const compRunBtn = document.getElementById('comp-run-btn');
  const compClearBtn = document.getElementById('comp-clear-btn');

  function appendConsoleLine(text, isError) {
    const line = document.createElement('div');
    line.className = 'tool-console-line' + (isError ? ' tool-console-error' : '');
    line.textContent = text;
    compOut.appendChild(line);
  }

  if (compRunBtn) {
    compRunBtn.addEventListener('click', () => {
      const originalLog = console.log;
      const originalError = console.error;
      console.log = (...args) => {
        appendConsoleLine(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      };
      console.error = (...args) => {
        appendConsoleLine(args.join(' '), true);
      };
      try {
        // eslint-disable-next-line no-new-func
        const runner = new Function(compIn.value);
        runner();
      } catch (err) {
        appendConsoleLine('Error: ' + err.message, true);
      } finally {
        console.log = originalLog;
        console.error = originalError;
      }
    });
  }
  if (compClearBtn) {
    compClearBtn.addEventListener('click', () => { compOut.innerHTML = ''; });
  }

  /* JSON Formatter */
  const jsonIn = document.getElementById('json-in');
  const jsonOut = document.getElementById('json-out');
  const jsonFormatBtn = document.getElementById('json-format-btn');
  const jsonCopyBtn = document.getElementById('json-copy-btn');
  const jsonError = document.getElementById('json-error');

  if (jsonFormatBtn) {
    jsonFormatBtn.addEventListener('click', () => {
      jsonError.style.display = 'none';
      try {
        const parsed = JSON.parse(jsonIn.value);
        jsonOut.value = JSON.stringify(parsed, null, 2);
      } catch (err) {
        jsonOut.value = '';
        jsonError.textContent = 'Invalid JSON: ' + err.message;
        jsonError.style.display = 'block';
      }
    });
    jsonCopyBtn.addEventListener('click', () => copyToClipboard(jsonOut.value, jsonCopyBtn));
  }

  /* ---------- Universal Code Editor (tool-compiler.html) ---------- */
  const langTrack = document.getElementById('lang-track');
  if (langTrack) {
    const LANGUAGES = [
      {
        id: 'html', label: 'HTML', badge: 'HTML', color: '#E34F26', mode: 'preview',
        sample: '<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <title>Hello</title>\n</head>\n<body>\n  <h1>Hello, HunarIntern!</h1>\n  <p>Edit this and click Run.</p>\n</body>\n</html>'
      },
      {
        id: 'css', label: 'CSS', badge: 'CSS', color: '#1B6FC9', mode: 'preview',
        sample: 'body{\n  font-family: sans-serif;\n  display:flex;\n  align-items:center;\n  justify-content:center;\n  min-height:100vh;\n  margin:0;\n  background:#0B1420;\n  color:#fff;\n}\nh1{ color:#1B6FC9; }'
      },
      {
        id: 'javascript', label: 'JavaScript', badge: 'JS', color: '#F0C419', mode: 'js',
        sample: "for (let i = 1; i <= 5; i++) {\n  console.log('Line', i);\n}"
      },
      {
        id: 'bootstrap4', label: 'Bootstrap 4', badge: 'B', color: '#7952B3', mode: 'preview',
        sample: '<div class="container py-5">\n  <h1>Hello, Bootstrap 4</h1>\n  <button class="btn btn-primary">Primary Button</button>\n</div>'
      },
      {
        id: 'php', label: 'PHP', badge: 'PHP', color: '#4F5B93', mode: 'server',
        sample: '<?php\n  echo "Hello, HunarIntern!";\n?>'
      },
      {
        id: 'python', label: 'Python', badge: 'PY', color: '#3776AB', mode: 'server',
        sample: 'print("Hello, HunarIntern!")'
      },
      {
        id: 'c', label: 'C', badge: 'C', color: '#5C6BC0', mode: 'server',
        sample: '#include <stdio.h>\n\nint main() {\n  printf("Hello, HunarIntern!\\n");\n  return 0;\n}'
      },
      {
        id: 'cpp', label: 'C++', badge: 'C++', color: '#00599C', mode: 'server',
        sample: '#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hello, HunarIntern!" << endl;\n  return 0;\n}'
      },
      {
        id: 'java', label: 'Java', badge: 'J', color: '#EA7E23', mode: 'server',
        sample: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, HunarIntern!");\n  }\n}'
      },
      {
        id: 'mysql', label: 'MySQL', badge: 'SQL', color: '#00618A', mode: 'server',
        sample: "SELECT * FROM students\nWHERE domain = 'Web Development'\nLIMIT 10;"
      }
    ];

    const editorInput = document.getElementById('editor-input');
    const outputConsole = document.getElementById('editor-output-console');
    const outputIframe = document.getElementById('editor-output-iframe');
    const outputMessage = document.getElementById('editor-output-message');
    const modeBadgePreview = document.getElementById('mode-badge-preview');
    const modeBadgeServer = document.getElementById('mode-badge-server');
    const unsupportedNote = document.getElementById('editor-unsupported-note');
    const langScrollLeft = document.getElementById('lang-scroll-left');
    const langScrollRight = document.getElementById('lang-scroll-right');

    let currentLang = LANGUAGES[0];

    function renderChips() {
      langTrack.innerHTML = '';
      LANGUAGES.forEach(lang => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'lang-chip' + (lang.id === currentLang.id ? ' active' : '');
        chip.dataset.lang = lang.id;
        chip.innerHTML = `<span class="lang-chip-icon" style="background:${lang.color};">${lang.badge}</span><span>${lang.label}</span>`;
        chip.addEventListener('click', () => selectLanguage(lang.id, true));
        langTrack.appendChild(chip);
      });
    }

    function resetOutput() {
      outputConsole.style.display = 'none';
      outputIframe.style.display = 'none';
      outputIframe.srcdoc = '';
      outputConsole.innerHTML = '';
      outputMessage.style.display = 'block';
      outputMessage.textContent = currentLang.mode === 'server'
        ? 'This language needs server-side execution — click Run to see details.'
        : 'Output will appear here...';
    }

    function selectLanguage(id, loadSample) {
      const lang = LANGUAGES.find(l => l.id === id);
      if (!lang) return;
      currentLang = lang;

      [...langTrack.children].forEach(chip => {
        chip.classList.toggle('active', chip.dataset.lang === id);
      });

      modeBadgePreview.classList.toggle('on', lang.mode === 'preview' || lang.mode === 'js');
      modeBadgeServer.classList.toggle('on', lang.mode === 'server');
      unsupportedNote.classList.toggle('show', lang.mode === 'server');

      if (loadSample) editorInput.value = lang.sample;
      resetOutput();
    }

    function appendConsoleLine(text, isError) {
      const line = document.createElement('div');
      line.className = 'tool-console-line' + (isError ? ' tool-console-error' : '');
      line.textContent = text;
      outputConsole.appendChild(line);
    }

    function runEditor() {
      if (currentLang.mode === 'preview') {
        outputMessage.style.display = 'none';
        outputConsole.style.display = 'none';
        outputIframe.style.display = 'block';

        let doc = editorInput.value;
        if (currentLang.id === 'css') {
          doc = `<!doctype html><html><head><style>${editorInput.value}</style></head><body><h1>Hello, HunarIntern!</h1><p>This preview box is running your CSS.</p></body></html>`;
        } else if (currentLang.id === 'bootstrap4') {
          doc = `<!doctype html><html><head><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/4.6.2/css/bootstrap.min.css"></head><body>${editorInput.value}</body></html>`;
        }
        outputIframe.srcdoc = doc;
        return;
      }

      if (currentLang.mode === 'js') {
        outputMessage.style.display = 'none';
        outputIframe.style.display = 'none';
        outputConsole.style.display = 'block';
        outputConsole.innerHTML = '';

        const originalLog = console.log;
        const originalError = console.error;
        console.log = (...args) => {
          appendConsoleLine(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        };
        console.error = (...args) => appendConsoleLine(args.join(' '), true);
        try {
          const runner = new Function(editorInput.value);
          runner();
        } catch (err) {
          appendConsoleLine('Error: ' + err.message, true);
        } finally {
          console.log = originalLog;
          console.error = originalError;
        }
        return;
      }

      // server mode — no backend available in this static, free tool
      outputConsole.style.display = 'none';
      outputIframe.style.display = 'none';
      outputMessage.style.display = 'block';
      outputMessage.textContent = `Running ${currentLang.label} needs server-side infrastructure. This free, browser-only editor can't execute it yet — copy your code above and run it in a local environment or a ${currentLang.label} online sandbox.`;
    }

    renderChips();
    selectLanguage('html', true);

    document.getElementById('editor-run-btn').addEventListener('click', runEditor);
    document.getElementById('editor-sample-btn').addEventListener('click', () => { editorInput.value = currentLang.sample; });
    document.getElementById('editor-clear-in-btn').addEventListener('click', () => { editorInput.value = ''; });
    document.getElementById('editor-copy-in-btn').addEventListener('click', (e) => copyToClipboard(editorInput.value, e.target));
    document.getElementById('editor-clear-out-btn').addEventListener('click', resetOutput);
    document.getElementById('editor-copy-out-btn').addEventListener('click', (e) => {
      const text = currentLang.mode === 'js' ? outputConsole.textContent : outputMessage.textContent;
      copyToClipboard(text, e.target);
    });

    if (langScrollLeft) langScrollLeft.addEventListener('click', () => langTrack.scrollBy({ left: -240, behavior: 'smooth' }));
    if (langScrollRight) langScrollRight.addEventListener('click', () => langTrack.scrollBy({ left: 240, behavior: 'smooth' }));

    document.querySelectorAll('.editor-hero-pill[data-lang]').forEach(pill => {
      pill.addEventListener('click', () => {
        selectLanguage(pill.dataset.lang, true);
        document.querySelector('.editor-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

});
