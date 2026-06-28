function buildCard(cells) {
  const card = document.createElement('div');
  card.className = 'adc-carousel-card';

  const img = cells.map((c) => c.querySelector('img')).find(Boolean);
  if (img) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'adc-carousel-card-img';
    const pic = img.closest('picture') || img;
    imgWrap.append(pic.cloneNode(true));
    card.append(imgWrap);
  }

  const body = document.createElement('div');
  body.className = 'adc-carousel-card-body';

  const heading = cells.flatMap((c) => [...c.querySelectorAll('h1,h2,h3,h4,h5,h6')])[0];
  if (heading) {
    const title = document.createElement('p');
    title.className = 'adc-carousel-card-title';
    title.textContent = heading.textContent.trim();
    body.append(title);
  }

  const paras = cells.flatMap((c) => [...c.querySelectorAll('p')]).filter(
    (p) => !p.querySelector('img') && !p.querySelector('a'),
  );
  paras.forEach((p) => {
    const desc = document.createElement('p');
    desc.className = 'adc-carousel-card-desc';
    desc.textContent = p.textContent.trim();
    body.append(desc);
  });

  const link = cells.flatMap((c) => [...c.querySelectorAll('a')]).find(Boolean);
  if (link) {
    const a = link.cloneNode(true);
    a.className = 'adc-carousel-card-link';
    body.append(a);
  }

  card.append(body);
  return card;
}

function renderCarousel(block, cards) {
  const wrapper = document.createElement('div');
  wrapper.className = 'adc-carousel-wrapper';

  const track = document.createElement('div');
  track.className = 'adc-carousel-track';

  cards.forEach((cardEl) => {
    const item = document.createElement('div');
    item.className = 'adc-carousel-item';
    item.append(cardEl);
    track.append(item);
  });

  wrapper.append(track);

  const perScreen = parseInt(
    getComputedStyle(block).getPropertyValue('--cards-per-screen') || '3',
    10,
  );
  const total = cards.length;
  let current = 0;

  const goTo = (idx) => {
    current = Math.max(0, Math.min(idx, total - perScreen));
    track.style.transform = `translateX(-${(current / total) * 100}%)`;
    block.querySelectorAll('.adc-carousel-dot').forEach((d, i) => {
      d.classList.toggle('adc-carousel-dot-active', i === current);
    });
  };

  const prev = document.createElement('button');
  prev.className = 'adc-carousel-btn adc-carousel-btn-prev';
  prev.type = 'button';
  prev.setAttribute('aria-label', 'Previous');
  prev.innerHTML = '&#8249;';
  prev.addEventListener('click', () => goTo(current - 1));

  const next = document.createElement('button');
  next.className = 'adc-carousel-btn adc-carousel-btn-next';
  next.type = 'button';
  next.setAttribute('aria-label', 'Next');
  next.innerHTML = '&#8250;';
  next.addEventListener('click', () => goTo(current + 1));

  const dots = document.createElement('div');
  dots.className = 'adc-carousel-dots';

  for (let i = 0; i < total; i += 1) {
    const dot = document.createElement('button');
    dot.className = `adc-carousel-dot${i === 0 ? ' adc-carousel-dot-active' : ''}`;
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to card ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dots.append(dot);
  }

  block.textContent = '';
  block.append(prev, wrapper, next, dots);
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  const cards = rows.map((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    return buildCard(cells);
  });

  renderCarousel(block, cards);
}
