let qsnLines = [];
let ansLines = [];

// Load qsn.txt
fetch('qsn.txt')
    .then(response => response.text())
    .then(data => qsnLines = data.split(/\r?\n/));

// Load ans.txt
fetch('ans.txt')
    .then(response => response.text())
    .then(data => ansLines = data.split(/\r?\n/));

function sendNotification(title, message) {
  if (Notification.permission === 'granted') {
    new Notification(title, {body: message});
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, {body: message});
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
      const q = qsnLines[i].trim();
      if (!q || q.length < 5) continue;

      if (fragment.includes(q)) {
        const numMatch = fragment.match(/^(\d+)\./);
        const num = numMatch ? numMatch[1] : (i + 1);
        const ans = ansLines[i] || '(no answer)';
        sendNotification(`Q${num}`, ans);
        await delay(10000);  // wait 15 seconds
        break;
      }
    }
  }
}