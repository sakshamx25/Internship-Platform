// Roast My Resume — frontend logic (projects.html only)
// Sends the uploaded file to the Netlify Function, which calls Claude server-side.

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('roast-form');
  if (!form) return; // not on this page

  const fileInput = document.getElementById('resume-file');
  const submitBtn = document.getElementById('roast-submit');
  const terminal = document.getElementById('roast-terminal');
  const errorBox = document.getElementById('roast-error');
  const resultBox = document.getElementById('roast-result');
  const feedbackText = document.getElementById('roast-feedback-text');
  const roastCard = document.getElementById('roast-card');
  const roastAgainBtn = document.getElementById('roast-again');

  function setTerminal(lines) {
    terminal.innerHTML = lines.map(l => `<div class="line" style="color:${l.color || 'var(--code-text)'};">${l.text}</div>`).join('');
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]); // strip data: prefix
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';

    const file = fileInput.files[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(file.type)) {
      errorBox.textContent = 'Please upload a PDF or DOCX file.';
      errorBox.style.display = 'block';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      errorBox.textContent = 'File is too large — please keep it under 5MB.';
      errorBox.style.display = 'block';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Analyzing...';
    setTerminal([
      { text: `$ upload ${file.name}` },
      { text: '→ extracting text...', color: 'var(--code-sky)' },
      { text: '→ sending to AI reviewer...', color: 'var(--code-sky)' }
    ]);

    try {
      const fileBase64 = await fileToBase64(file);

      const res = await fetch('/.netlify/functions/roast-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64,
          fileType: file.type,
          fileName: file.name
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      setTerminal([
        { text: `$ upload ${file.name}` },
        { text: '✓ feedback ready', color: 'var(--code-accent)' }
      ]);

      feedbackText.textContent = data.feedback;
      roastCard.style.display = 'none';
      resultBox.style.display = 'block';
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
      errorBox.textContent = err.message || 'Something went wrong — please try again.';
      errorBox.style.display = 'block';
      setTerminal([
        { text: `$ upload ${file.name}` },
        { text: '✗ failed — see error below', color: '#F06A6A' }
      ]);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Roast My Resume';
    }
  });

  if (roastAgainBtn) {
    roastAgainBtn.addEventListener('click', () => {
      form.reset();
      resultBox.style.display = 'none';
      roastCard.style.display = 'grid';
      setTerminal([
        { text: '$ waiting for upload...' },
        { text: '// honest, not harsh', color: '#5C6E82' }
      ]);
      roastCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
});
