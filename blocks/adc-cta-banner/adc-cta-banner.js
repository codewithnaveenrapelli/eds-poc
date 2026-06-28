// adc-cta-banner is a CONTAINER block.
// Config row (1 cell): variant
// adc-hero-text child (2 cells): richtext content + type (title/description)
// adc-button child (4 cells): label + url + variant + newTab

const CTA_VARIANTS = ['yellow', 'grey', 'dark'];

export default function decorate(block) {
  const allRows = [...block.querySelectorAll(':scope > div')];

  let variant = 'yellow';
  const textItems = [];
  const ctaItems = [];

  allRows.forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];

    if (cells.length === 1) {
      const text = cells[0].textContent.trim().toLowerCase();
      if (CTA_VARIANTS.includes(text)) variant = text;
    } else if (cells.length === 2) {
      const [contentCell, typeCell] = cells;
      const type = typeCell.textContent.trim().toLowerCase() || 'description';
      textItems.push({
        content: contentCell, type,
      });
    } else if (cells.length >= 3) {
      const [labelCell, urlCell] = cells;
      const label = labelCell.textContent.trim();
      const url = urlCell.textContent.trim();
      const btnVariant = cells[2]?.textContent.trim() || 'primary';
      const newTab = cells[3]?.textContent.trim() === 'true';
      if (label && url) {
        ctaItems.push({
          label, url, variant: btnVariant, newTab,
        });
      }
    }
  });

  block.classList.add(variant);
  block.textContent = '';

  const inner = document.createElement('div');
  inner.className = 'adc-cta-banner-container';

  textItems.forEach(({ content, type }) => {
    if (type === 'title') {
      const h = document.createElement('h2');
      h.className = 'adc-cta-banner-title';
      h.innerHTML = content.innerHTML;
      inner.append(h);
    } else {
      const p = document.createElement('p');
      p.className = 'adc-cta-banner-desc';
      p.innerHTML = content.innerHTML;
      inner.append(p);
    }
  });

  if (ctaItems.length) {
    const btns = document.createElement('div');
    btns.className = 'adc-cta-banner-buttons';
    ctaItems.forEach(({ label, url, newTab }) => {
      const a = document.createElement('a');
      a.href = url;
      a.className = 'adc-cta-banner-btn';
      a.textContent = label;
      if (newTab) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      btns.append(a);
    });
    inner.append(btns);
  }

  block.append(inner);
}
