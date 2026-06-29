// adc-cards is a CONTAINER block.
// Config rows (1 cell each): sectionTitle and/or columns (2/3/4).
// Card-item rows: each is a nested container (adc-card-item) whose
//   first child div has its own sub-divs — detected by hasSubRows().
// Rendering of each card-item is delegated to adc-card-item.js.

import decorateCardItem from '../adc-card-item/adc-card-item.js';

// A card-item row has nested sub-rows: row > div > div (at least one level deep)
function hasSubRows(row) {
  return !!row.firstElementChild?.querySelector(':scope > div');
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  let sectionTitle = '';
  let columns = 3;
  const cardRows = [];

  rows.forEach((row) => {
    if (hasSubRows(row)) {
      cardRows.push(row);
    } else {
      // Config row: single cell with a text value
      const [firstCell] = row.querySelectorAll(':scope > div');
      if (!firstCell) return;
      const val = firstCell.textContent.trim();
      if (['2', '3', '4'].includes(val)) {
        columns = parseInt(val, 10);
      } else if (val) {
        sectionTitle = val;
      }
    }
  });

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

  cardRows.forEach((row) => {
    decorateCardItem(row);
    row.classList.add('adc-card-item');
    grid.append(row);
  });

  wrap.append(grid);
  block.textContent = '';
  block.append(wrap);
}
