/**
 * Interactive Letter Hover Effects
 * Splits title text into individual character spans that scale up smoothly on hover
 * No neon glowing or brightening — pure kinetic scaling
 */

export function initTitleHovers() {
  const titles = document.querySelectorAll('.title-hover');

  titles.forEach(title => {
    splitTextNodes(title);
  });
}

function splitTextNodes(el) {
  const childNodes = Array.from(el.childNodes);
  
  childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue;
      if (!text) return;
      
      const fragment = document.createDocumentFragment();
      const tokens = text.match(/\S+|\s+/g) || [];
      
      tokens.forEach(token => {
        if (/^\s+$/.test(token)) {
          fragment.appendChild(document.createTextNode(token));
        } else {
          const wordSpan = document.createElement('span');
          wordSpan.className = 'word-span';
          wordSpan.style.display = 'inline-block';
          wordSpan.style.whiteSpace = 'nowrap';
          
          for (let char of token) {
            const span = document.createElement('span');
            span.className = 'char-span';
            span.textContent = char;
            wordSpan.appendChild(span);
          }
          fragment.appendChild(wordSpan);
        }
      });
      
      node.replaceWith(fragment);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE' && !node.classList.contains('word-span')) {
        splitTextNodes(node);
      }
    }
  });
}
