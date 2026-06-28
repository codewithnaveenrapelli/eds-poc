export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const data = {};

  rows.forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    if (cells.length === 2) {
      const [keyCell, valCell] = cells;
      const key = keyCell.textContent.trim().toLowerCase();
      data[key] = valCell;
    }
  });

  const container = document.createElement('div');
  container.className = 'adc-cta-banner-container';

  if (data.title) {
    const title = document.createElement('div');
    title.className = 'adc-cta-banner-title';
    title.innerHTML = data.title.innerHTML;
    container.append(title);
  }

  if (data.description) {
    const desc = document.createElement('div');
    desc.className = 'adc-cta-banner-desc';
    desc.innerHTML = data.description.innerHTML;
    container.append(desc);
  }

  const links = block.querySelectorAll('a');
  if (links.length) {
    const btns = document.createElement('div');
    btns.className = 'adc-cta-banner-buttons';
    links.forEach((a) => {
      const btn = a.cloneNode(true);
      btn.className = 'adc-cta-banner-btn';
      btns.append(btn);
    });
    container.append(btns);
  }

  block.textContent = '';

  if (!container.children.length) {
    // Fallback: first row = title, second = desc, remaining = buttons
    const rowsCopy = [...rows];
    if (rowsCopy[0]) {
      const title = document.createElement('div');
      title.className = 'adc-cta-banner-title';
      title.innerHTML = rowsCopy[0].innerHTML;
      container.append(title);
    }
    if (rowsCopy[1]) {
      const desc = document.createElement('div');
      desc.className = 'adc-cta-banner-desc';
      desc.innerHTML = rowsCopy[1].innerHTML;
      container.append(desc);
    }
    if (rowsCopy.slice(2).length) {
      const btns = document.createElement('div');
      btns.className = 'adc-cta-banner-buttons';
      rowsCopy.slice(2).forEach((r) => {
        const a = r.querySelector('a');
        if (a) {
          const btn = a.cloneNode(true);
          btn.className = 'adc-cta-banner-btn';
          btns.append(btn);
        }
      });
      if (btns.children.length) container.append(btns);
    }
  }

  block.append(container);
}
