// adc-hero-banner: flat block.
// 'classes' field (layout: left / centre / right) is applied to the block element
// by AEM as a CSS class — block.classList already contains it.
// Row 0: image (image + imageAlt field-collapsed into <picture><img alt="...">).
// Row 1: content cell (content_eyebrow, content_title, content_description,
//         content_cta1 + content_cta1Text, content_cta2 + content_cta2Text
//         all element-grouped into one cell, rendered in DOM order).

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  // eslint-disable-next-line no-console
  console.log('[adc-hero-banner] rows:', rows.length, rows.map((r, i) => `row${i}: cells=${r.querySelectorAll(':scope > div').length} tags=[${[...r.querySelectorAll(':scope > div')].map((c) => c.firstElementChild?.tagName || 'TEXT').join(',')}]`));
  const [imageRow, contentRow] = rows;

  const imageCell = imageRow?.firstElementChild;
  // eslint-disable-next-line no-console
  console.log('[adc-hero-banner] imageCell firstChild:', imageCell?.firstElementChild?.tagName, '| contentRow exists:', !!contentRow, '| contentCell children tags:', [...(contentRow?.firstElementChild?.children || [])].map((c) => c.tagName).join(','));
  const picture = imageRow?.querySelector('picture');
  const contentCell = contentRow?.firstElementChild;

  block.innerHTML = '';

  if (picture) {
    const media = document.createElement('div');
    media.className = 'adc-hero-banner-media';
    media.append(picture.closest('picture') || picture);
    block.append(media);
  }

  const content = document.createElement('div');
  content.className = 'adc-hero-banner-content';

  if (contentCell) {
    // Iterate children in order: eyebrow <p>, heading, description <p>s, CTA <a>s
    let seenHeading = false;
    [...contentCell.children].forEach((child) => {
      const tag = child.tagName.toLowerCase();
      if (/^h[1-6]$/.test(tag)) {
        seenHeading = true;
        const h = document.createElement('h2');
        h.className = 'adc-hero-banner-title';
        h.innerHTML = child.innerHTML;
        content.append(h);
      } else if (tag === 'p' && !seenHeading) {
        const p = document.createElement('p');
        p.className = 'adc-hero-banner-eyebrow';
        p.innerHTML = child.innerHTML;
        content.append(p);
      } else if (tag === 'p') {
        const p = document.createElement('p');
        p.className = 'adc-hero-banner-desc';
        p.innerHTML = child.innerHTML;
        content.append(p);
      } else if (tag === 'a') {
        // First CTA creates the actions wrapper; subsequent ones append to it
        let actions = content.querySelector('.adc-hero-banner-actions');
        if (!actions) {
          actions = document.createElement('div');
          actions.className = 'adc-hero-banner-actions';
          content.append(actions);
        }
        const a = document.createElement('a');
        a.href = child.href;
        const isPrimary = actions.children.length === 0;
        a.className = `adc-hero-banner-cta ${isPrimary ? 'adc-hero-banner-cta-primary' : 'adc-hero-banner-cta-secondary'}`;
        a.textContent = child.textContent.trim();
        if (child.target) a.target = child.target;
        actions.append(a);
      }
    });
  }

  block.append(content);
}
