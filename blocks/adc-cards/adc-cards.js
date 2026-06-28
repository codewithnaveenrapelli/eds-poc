// adc-cards is a CONTAINER block.
// The first two rows are optional config: row[0]=sectionTitle, row[1]=columns.
// All remaining rows are card items (from adc-card-item children in UE).
// Each card row: cells[0]=image, cells[1]=imageAlt, cells[2]=title,
//               cells[3]=desc, cells[4]=ctaLabel, cells[5]=ctaUrl

function extractImage(imageCell, altText) {
  if (!imageCell) return null;
  const pic = imageCell.querySelector('picture');
  if (pic) { if (altText) { const img = pic.querySelector('img'); if (img) img.alt = altText; } return pic; }
  const img = imageCell.querySelector('img');
  if (img) { if (altText) img.alt = altText; return img; }
  const src = imageCell.textContent.trim();
  if (src && (src.startsWith('/') || src.startsWith('http'))) {
    const el = document.createElement('img');
    el.src = src;
    el.alt = altText || '';
    el.loading = 'lazy';
    return el;
  }
  return null;
}

function buildCard(cells) {
  const card = document.createElement('div');
  card.className = 'adc-cards-card';

  const altText = cells[1]?.textContent.trim() || '';
  const picEl = extractImage(cells[0], altText);
  if (picEl) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'adc-cards-card-img';
    const imgNode = picEl.closest ? (picEl.closest('picture') || picEl) : picEl;
    imgWrap.append(imgNode);
    card.append(imgWrap);
  }

  const body = document.createElement('div');
  body.className = 'adc-cards-card-body';

  const title = cells[2]?.textContent.trim();
  if (title) {
    const h = document.createElement('h3');
    h.className = 'adc-cards-card-title';
    h.textContent = title;
    body.append(h);
  }

  const desc = cells[3]?.textContent.trim();
  if (desc) {
    const p = document.createElement('p');
    p.className = 'adc-cards-card-desc';
    p.textContent = desc;
    body.append(p);
  }

  const ctaLabel = cells[4]?.textContent.trim();
  const ctaUrl = cells[5]?.textContent.trim();
  if (ctaLabel && ctaUrl) {
    const a = document.createElement('a');
    a.href = ctaUrl;
    a.className = 'adc-cards-card-link';
    a.textContent = ctaLabel;
    body.append(a);
  }

  card.append(body);
  return card;
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  // First row may be section title (only one cell, no picture)
  let startIdx = 0;
  let sectionTitle = '';
  let columns = 3;

  const firstCells = [...rows[0].querySelectorAll(':scope > div')];
  const firstSrc = firstCells[0]?.textContent.trim() || '';
  const hasPicture = !!(firstCells[0]?.querySelector('picture, img')
    || (firstSrc.startsWith('/') || firstSrc.startsWith('http')));
  const isConfig = !hasPicture && firstCells.length <= 2;

  if (isConfig) {
    sectionTitle = firstCells[0]?.textContent.trim() || '';
    const colText = firstCells[1]?.textContent.trim();
    if (colText && !Number.isNaN(parseInt(colText, 10))) {
      columns = parseInt(colText, 10);
    }
    startIdx = 1;
    // check if second row is also config (columns)
    if (rows[1]) {
      const r1 = [...rows[1].querySelectorAll(':scope > div')];
      const r1Src = r1[0]?.textContent.trim() || '';
      const r1HasImg = !!(r1[0]?.querySelector('picture, img')
        || r1Src.startsWith('/') || r1Src.startsWith('http'));
      if (!r1HasImg && r1.length <= 1) {
        const colVal = r1[0]?.textContent.trim();
        if (colVal && !Number.isNaN(parseInt(colVal, 10))) {
          columns = parseInt(colVal, 10);
        }
        startIdx = 2;
      }
    }
  }

  const wrap = document.createElement('div');
  wrap.className = 'adc-cards-wrap';

  if (sectionTitle) {
    const h = document.createElement('h2');
    h.className = 'adc-cards-section-title';
    h.textContent = sectionTitle;
    wrap.append(h);
  }

  const grid = document.createElement('div');
  grid.className = 'adc-cards-grid';
  grid.style.setProperty('--adc-cards-cols', columns);

  rows.slice(startIdx).forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    grid.append(buildCard(cells));
  });

  wrap.append(grid);
  block.textContent = '';
  block.append(wrap);
}
