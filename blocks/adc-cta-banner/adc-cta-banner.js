function buildData(block) {
  const data = {};
  block.querySelectorAll(':scope > div').forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    if (cells.length === 2) {
      const [keyCell, valCell] = cells;
      const key = keyCell.textContent.trim().toLowerCase();
      data[key] = valCell;
    }
  });
  return data;
}

export default function decorate(block) {
  const data = buildData(block);
  const variant = data.variant?.textContent.trim() || 'yellow';
  block.classList.add(`variant-${variant}`);
  block.textContent = '';

  const container = document.createElement('div');
  container.className = 'adc-cta-banner-container';

  if (data.title?.innerHTML.trim()) {
    const h = document.createElement('div');
    h.className = 'adc-cta-banner-title';
    h.innerHTML = data.title.innerHTML;
    container.append(h);
  }

  if (data.description?.innerHTML.trim()) {
    const d = document.createElement('div');
    d.className = 'adc-cta-banner-desc';
    d.innerHTML = data.description.innerHTML;
    container.append(d);
  }

  const cta1Label = data.cta1label?.textContent.trim();
  const cta1Url = data.cta1url?.textContent.trim();
  const cta2Label = data.cta2label?.textContent.trim();
  const cta2Url = data.cta2url?.textContent.trim();
  const hasCta = (cta1Label && cta1Url) || (cta2Label && cta2Url);

  if (hasCta) {
    const btns = document.createElement('div');
    btns.className = 'adc-cta-banner-buttons';
    if (cta1Label && cta1Url) {
      const a = document.createElement('a');
      a.href = cta1Url;
      a.textContent = cta1Label;
      a.className = 'adc-cta-banner-btn adc-cta-banner-btn-primary';
      btns.append(a);
    }
    if (cta2Label && cta2Url) {
      const a = document.createElement('a');
      a.href = cta2Url;
      a.textContent = cta2Label;
      a.className = 'adc-cta-banner-btn adc-cta-banner-btn-secondary';
      btns.append(a);
    }
    container.append(btns);
  }

  block.append(container);
}
