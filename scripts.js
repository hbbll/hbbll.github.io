let qsnLines = [];
let ansLines = [];
const seenQuestions = new Set(); // <-- Track already notified questions

// Load qsn.txt
fetch('qsn.txt')
  .then(response => response.text())
  .then(data => {
    qsnLines = data.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  });

// Load ans.txt
fetch('ans.txt')
  .then(response => response.text())
  .then(data => {
    ansLines = data.split(/\r?\n/).map(line => line.trim());
  });

function sendNotification(title, message) {
  const options = {
    body: message,
    icon: 'kun.jpg' // or a full URL like 'https://example.com/logo.png'
  };

  if (document.hidden) return;

  if (Notification.permission === 'granted') {
    new Notification(title, options);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted' && !document.hidden) {
        new Notification(title, options);
      }
    });
  }
}


function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkQuestions() {
  const inputText = document.getElementById('textInput').value;
  const pattern = /\d+\..+?(?=\s\d+\.\s|$)/gs;
  const matches = inputText.match(pattern);
  if (!matches) return;

  for (const fragment of matches) {
    for (let i = 0; i < qsnLines.length; i++) {
      const q = qsnLines[i];
      if (q.length < 5 || !fragment.includes(q)) continue;

      const numMatch = fragment.match(/^(\d+)\./);
      const num = numMatch ? numMatch[1] : (i + 1);

      if (seenQuestions.has(num)) break; // <-- Skip if already seen

      const ans = ansLines[i] || 'no answer :(';
      sendNotification(`Kun.uz - O'zbekiston va dunyo yangiliklari`, `${num} - ` + ans);
      seenQuestions.add(num); // <-- Mark as seen
      await delay(400);
      break;
    }
  }
}
