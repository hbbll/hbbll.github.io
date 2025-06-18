document.addEventListener('DOMContentLoaded', () => {
    const leftPane = document.getElementById('left-pane');
    const rightPane = document.getElementById('right-pane');
    const qsnContent = document.getElementById('qsn-content');
    const ansContent = document.getElementById('ans-content');

    const processText = (text, contentElement, showLineNumbers = true) => {
        const lines = text.split('\n');
        const html = lines.map((line, index) => {
            const lineNumber = String(index + 1).padStart(4, ' ');
            const lineContent = showLineNumbers ? `${lineNumber} ${line}` : line;
            return `<div data-line-number="${index + 1}">${lineContent}</div>`;
        }).join('');
        contentElement.innerHTML = html;
    };

    const setupHighlighting = () => {
        const lines = document.querySelectorAll('#qsn-content div, #ans-content div');

        lines.forEach(line => {
            line.addEventListener('mouseover', () => {
                const lineNumber = line.dataset.lineNumber;
                if (!lineNumber) return;
                document.querySelectorAll(`[data-line-number="${lineNumber}"]`).forEach(el => el.classList.add('highlight'));
            });
            line.addEventListener('mouseout', () => {
                const lineNumber = line.dataset.lineNumber;
                if (!lineNumber) return;
                document.querySelectorAll(`[data-line-number="${lineNumber}"]`).forEach(el => el.classList.remove('highlight'));
            });
        });
    };

    Promise.all([
        fetch('qsn.txt').then(res => res.text()),
        fetch('ans.txt').then(res => res.text())
    ]).then(([qsnText, ansText]) => {
        processText(qsnText, qsnContent, true);
        processText(ansText, ansContent, false);
        setupHighlighting();
    });

    let isSyncingLeft = false;
    let isSyncingRight = false;

    leftPane.addEventListener('scroll', function() {
      if (isSyncingLeft) {
        isSyncingLeft = false;
        return;
      }
      isSyncingRight = true;
      rightPane.scrollTop = this.scrollTop;
    });

    rightPane.addEventListener('scroll', function() {
      if (isSyncingRight) {
        isSyncingRight = false;
        return;
      }
      isSyncingLeft = true;
      leftPane.scrollTop = this.scrollTop;
    });

    document.body.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});
