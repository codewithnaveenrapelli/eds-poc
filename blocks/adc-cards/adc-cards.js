import { moveInstrumentation } from '../../scripts/scripts.js';

// adc-cards: container block.
// Parent config rows (1 cell): section title text or column count ("2"/"3"/"4").
// Card-item children use resourceType block/v1/block/item — fields render as cells in
// a single row (not a nested block element). Cell structure per card:
//   cells[0]: variant text  (classes field → text cell for block/item children)
//   cells[1]: card image    (image + imageAlt field-collapsed into <picture>)
//   cells[2]: logo image    (logo  + logoAlt  field-collapsed into <picture>)
//   cells[3]: content group (content_title, content_description, content_cta+ctaText)

const CLICKABLE_TYPES = new Set(['clickable-card', 'support']);

function buildCard(row, cells) {
  const variant = cells[0]?.textContent.trim() || '';
  const imageCell = cells[1];
  const logoCell = cells[2];
  const contentCell = cells[3]?.firstElementChild;

  // Detect image/logo by <picture> as fallback when cells shift (e.g. empty logo)
  const picture = imageCell?.querySelector('picture');
  const logoPicture = logoCell?.querySelector('picture');

  const card = document.createElement('div');
  card.className = `adc-card-item${variant ? ` ${variant}` : ''}`;
  // Move UE instrumentation (data-aue-*) from the original row to the card element
  // so Universal Editor can still track and select this card item after decoration.
  moveInstrumentation(row, card);

  const inner = document.createElement('div');
  inner.className = 'adc-card-inner';

  const media = document.createElement('div');
  media.className = 'adc-card-media';

  if (picture) {
    const wrap = document.createElement('div');
    wrap.className = 'adc-card-img';
    wrap.append(picture);
    media.append(wrap);
  }

  if (logoPicture) {
    const wrap = document.createElement('div');
    wrap.className = 'adc-card-logo-img';
    wrap.append(logoPicture);
    media.append(wrap);
  }

  if (media.children.length) inner.append(media);

  const body = document.createElement('div');
  body.className = 'adc-card-body';

  // content_title and content_description are richtext fields — they produce <p> elements
  // (not headings), so parse by position: first non-link = title, second = description.
  const contentChildren = [...(contentCell?.children || [])];
  const cta = contentChildren.find((el) => el.tagName === 'A');
  const textEls = contentChildren.filter((el) => el.tagName !== 'A');

  if (textEls[0]) {
    const h = document.createElement('h3');
    h.className = 'adc-card-title';
    h.innerHTML = textEls[0].innerHTML;
    body.append(h);
  }

  if (textEls[1]) {
    const p = document.createElement('p');
    p.className = 'adc-card-desc';
    p.innerHTML = textEls[1].innerHTML;
    body.append(p);
  }

  inner.append(body);

  if (CLICKABLE_TYPES.has(variant) && cta) {
    const a = document.createElement('a');
    a.href = cta.href;
    a.className = 'adc-card-link-wrap';
    if (cta.target === '_blank') {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    a.append(inner);
    card.append(a);
  } else {
    if (cta) {
      const actions = document.createElement('div');
      actions.className = 'adc-card-actions';
      const a = document.createElement('a');
      a.href = cta.href;
      a.className = 'adc-card-action-primary';
      a.textContent = cta.textContent.trim();
      if (cta.target === '_blank') {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      actions.append(a);
      body.append(actions);
    }
    card.append(inner);
  }

  return card;
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  let sectionTitle = '';
  let cols = '3';
  const cardRows = [];

  rows.forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    if (cells.length === 1) {
      const val = cells[0].textContent.trim();
      if (/^[234]$/.test(val)) {
        cols = val;
      } else if (val) {
        sectionTitle = val;
      }
    } else if (cells.length >= 3) {
      cardRows.push({ row, cells });
    }
  });

  block.innerHTML = '';

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
  grid.style.setProperty('--adc-cards-cols', cols);

  cardRows.forEach(({ row, cells }) => grid.append(buildCard(row, cells)));

  wrap.append(grid);
  block.append(wrap);
}
