function cell(row) { return row?.firstElementChild || row; }

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const picEl = cell(rows[0])?.querySelector('picture, img');
  const caption = rows[2]?.textContent.trim();
  const linkUrl = rows[3]?.textContent.trim();
  const size = rows[4]?.textContent.trim() || 'full';

  block.textContent = '';
  block.classList.add(`size-${size}`);

  let content = document.createElement('div');
  content.className = 'adc-image-wrap';

  if (linkUrl && picEl) {
    const a = document.createElement('a');
    a.href = linkUrl;
    a.append(picEl.closest('picture') || picEl);
    content.append(a);
  } else if (picEl) {
    content.append(picEl.closest('picture') || picEl);
  }

  if (caption) {
    const fig = document.createElement('figure');
    fig.className = 'adc-image-figure';
    fig.append(content);
    const figCap = document.createElement('figcaption');
    figCap.className = 'adc-image-caption';
    figCap.textContent = caption;
    fig.append(figCap);
    content = fig;
  }

  block.append(content);
}
