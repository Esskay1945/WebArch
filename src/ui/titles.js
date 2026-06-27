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
      for (let char of text) {
        if (char === ' ' || char === '\n' || char === '\t') {
          fragment.appendChild(document.createTextNode(char));
        } else {
          const span = document.createElement('span');
          span.className = 'char-span';
          span.textContent = char;
          fragment.appendChild(span);
        }
      }
      node.replaceWith(fragment);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Don't recursively split script or style tags if any exist
      if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
        splitTextNodes(node);
      }
    }
  });
}
