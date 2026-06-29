// adc-cards: container block.
// Parent config rows (1 cell): section title text or column count ("2"/"3"/"4").
// Card-item child rows (4 cells): [classes-text | image | logo | content-group].
//   Cell 0: variant text (classes field value: "logo", "information", etc. or empty)
//   Cell 1: card image  (image + imageAlt field-collapsed into <picture>)
//   Cell 2: logo image  (logo  + logoAlt  field-collapsed into <picture>)
//   Cell 3: content     (content_title, content_description, content_cta+ctaText grouped)

const CLICKABLE_TYPES = new Set(['clickable-card', 'support']);

function buildCard(cells) {
  const variant = cells[0]?.textContent.trim() || 'default';
  const imageCell = cells[1];
  const logoCell = cells[2];
  const contentCell = cells[3]?.firstElementChild;

  const card = document.createElement('div');
  card.className = `adc-card-item${variant ? ` ${variant}` : ''}`;

  const inner = document.createElement('div');
  inner.className = 'adc-card-inner';

  const media = document.createElement('div');
  media.className = 'adc-card-media';

  const picture = imageCell?.querySelector('picture');
  if (picture) {
    const wrap = document.createElement('div');
    wrap.className = 'adc-card-img';
    wrap.append(picture.closest('picture') || picture);
    media.append(wrap);
  }

  const logoPicture = logoCell?.querySelector('picture');
  if (logoPicture) {
    const wrap = document.createElement('div');
    wrap.className = 'adc-card-logo-img';
    wrap.append(logoPicture.closest('picture') || logoPicture);
    media.append(wrap);
  }

  if (media.children.length) inner.append(media);

  const body = document.createElement('div');
  body.className = 'adc-card-body';

  const heading = contentCell?.querySelector('h1,h2,h3,h4,h5,h6');
  const desc = contentCell?.querySelector('p');
  const cta = contentCell?.querySelector('a');

  if (heading) {
    const h = document.createElement('h3');
    h.className = 'adc-card-title';
    h.innerHTML = heading.innerHTML;
    body.append(h);
  }

  if (desc) {
    const p = document.createElement('p');
    p.className = 'adc-card-desc';
    p.innerHTML = desc.innerHTML;
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
      cardRows.push(cells);
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

  cardRows.forEach((cells) => grid.append(buildCard(cells)));

  wrap.append(grid);
  block.append(wrap);
}
