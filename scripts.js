let qsnLines = [];
let ansLines = [];
const seenQuestions = new Set();  // Track already notified questions
let dataLoaded = false;           // Track if files loaded

// Normalize function: lowercase, remove punctuation, collapse spaces, remove
// repeated letters
function normalize(text) {
  return text.toLowerCase()
      .replace(/[^\w\s]/g, '')    // remove punctuation
      .replace(/\s+/g, ' ')       // collapse multiple spaces
      .replace(/(\w)\1+/g, '$1')  // reduce repeated letters
      .trim();
}

// Load both files and set dataLoaded when done
Promise
    .all([
      fetch('qsn.txt').then(r => r.text()), fetch('ans.txt').then(r => r.text())
    ])
    .then(([qsnData, ansData]) => {
      qsnLines = qsnData.split(/\r?\n/).map(line => normalize(line)).filter(Boolean);
      ansLines = ansData.split(/\r?\n/).map(line => line.trim());
      dataLoaded = true;
    })
    .catch(err => {
      console.error('Error loading question or answer files:', err);
    });

function sendNotification(title, message) {
  const options = {
    body: message,
    icon: 'kun.jpg'  // or full URL
  };
  if (Notification.permission === 'granted') {
    new Notification(title, options);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, options);
      }
    });
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkQuestions() {
  if (!dataLoaded) {
    console.warn('Data not loaded yet, please wait.');
    return;
  }

  const inputText = document.getElementById('textInput').value;
  const pattern = /\d+\..*?(?=\d+\.\s*|$)/gs;
  const matches = inputText.match(pattern);
  if (!matches) return;

  for (const fragmentRaw of matches) {
    const fragment = normalize(fragmentRaw.trim());

    for (let i = 0; i < qsnLines.length; i++) {
      const q = qsnLines[i];
      if (q.length < 5 || !fragment.includes(q)) continue;

      const numMatch = fragmentRaw.match(/^(\d+)\./);
      const num = numMatch ? numMatch[1] : (i + 1).toString();

      if (seenQuestions.has(num)) break;

      const ans = ansLines[i] || 'no answer :(';
      sendNotification( `Kun.uz - O'zbekiston va dunyo yangiliklari`, `${num} - ${ans}`);
      seenQuestions.add(num);
      await delay(5000); //5 sekund
      break;
    }
  }
}
