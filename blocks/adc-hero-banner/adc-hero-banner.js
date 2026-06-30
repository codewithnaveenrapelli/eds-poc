// adc-hero-banner: flat block.
// 'classes' field (layout: left / centre / right) is applied to the block element
// by AEM as a CSS class — block.classList already contains it.
// Row 0: image (image + imageAlt field-collapsed into <picture><img alt="...">).
// Row 1: content cell (content_eyebrow, content_title, content_description,
//         content_cta1 + content_cta1Text, content_cta2 + content_cta2Text
//         all element-grouped into one cell, rendered in DOM order).
//
// Author canvas vs live delivery variants:
//   - image: <picture> on live; Remote Asset renders as <p><a href="/content/dam/..."> in canvas
//   - richtext fields: <p>/<h*> on live; <div> (possibly wrapping <p>) in canvas
//   - CTA links: bare <a> on live; <p><a href="..."> in canvas

/**
 * Extract text/HTML content from a cell that may be a raw element (<p>, <h*>)
 * or a richtext wrapper <div> whose actual content is a nested <p>/<h*>.
 */
function getInnerContent(el) {
  const inner = el.querySelector('p, h1, h2, h3, h4, h5, h6');
  return inner ? inner.innerHTML : el.innerHTML;
}

export default function decorate(block) {
  const [imageRow, contentRow] = [...block.querySelectorAll(':scope > div')];

  // Background image: <picture> on live delivery; Remote Asset <a> in canvas
  let imageEl = imageRow?.querySelector('picture');
  if (!imageEl) {
    const a = imageRow?.querySelector('a[href]');
    if (a) {
      const href = a.getAttribute('href') || '';
      if (href && (href.startsWith('/') || href.startsWith('http'))) {
        imageEl = document.createElement('img');
        imageEl.src = href;
        imageEl.alt = a.textContent.trim();
        imageEl.loading = 'lazy';
      }
    }
  }

  const contentCell = contentRow?.firstElementChild;

  block.innerHTML = '';

  if (imageEl) {
    const media = document.createElement('div');
    media.className = 'adc-hero-banner-media';
    media.append(imageEl);
    block.append(media);
  }

  const content = document.createElement('div');
  content.className = 'adc-hero-banner-content';

  if (contentCell) {
    // textIdx counts text-content fields seen so far (0=eyebrow, 1=title, 2+=description)
    let textIdx = 0;

    [...contentCell.children].forEach((child) => {
      const tag = child.tagName.toLowerCase();

      if (/^h[1-6]$/.test(tag)) {
        // Explicit heading authored in richtext → title
        textIdx = 2; // anything after an explicit heading is description
        const h = document.createElement('h2');
        h.className = 'adc-hero-banner-title';
        h.innerHTML = child.innerHTML;
        content.append(h);
        return;
      }

      // CTA detection: bare <a> (live) or <p>/<div> whose only direct child is <a> (canvas)
      const directAnchor = tag === 'a'
        ? child
        : child.querySelector(':scope > a[href]');
      const isCTA = !!directAnchor
        && (tag === 'a'
          || (child.children.length === 1 && child.children[0].tagName === 'A'));

      if (isCTA) {
        let actions = content.querySelector('.adc-hero-banner-actions');
        if (!actions) {
          actions = document.createElement('div');
          actions.className = 'adc-hero-banner-actions';
          content.append(actions);
        }
        const a = document.createElement('a');
        a.href = directAnchor.href || directAnchor.getAttribute('href') || '#';
        const isPrimary = actions.children.length === 0;
        a.className = `adc-hero-banner-cta ${isPrimary ? 'adc-hero-banner-cta-primary' : 'adc-hero-banner-cta-secondary'}`;
        a.textContent = directAnchor.textContent.trim();
        if (directAnchor.target) a.target = directAnchor.target;
        actions.append(a);
        return;
      }

      if (tag === 'p' || tag === 'div') {
        const innerHtml = getInnerContent(child);
        const idx = textIdx;
        textIdx += 1;

        if (idx === 0) {
          const p = document.createElement('p');
          p.className = 'adc-hero-banner-eyebrow';
          p.innerHTML = innerHtml;
          content.append(p);
        } else if (idx === 1) {
          const h = document.createElement('h2');
          h.className = 'adc-hero-banner-title';
          h.innerHTML = innerHtml;
          content.append(h);
        } else {
          const p = document.createElement('p');
          p.className = 'adc-hero-banner-desc';
          p.innerHTML = innerHtml;
          content.append(p);
        }
      }
    });
  }

  block.append(content);
}
