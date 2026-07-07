function cell(row) {
  return row?.firstElementChild || row;
}

function text(row) {
  return cell(row)?.textContent?.trim() || '';
}

function html(row) {
  return cell(row)?.innerHTML?.trim() || text(row);
}

function asBool(value) {
  return String(value).trim().toLowerCase() === 'true';
}

function extractImageSource(imageCell) {
  if (!imageCell) return '';

  if (imageCell.tagName === 'IMG') {
    return imageCell.getAttribute('src') || '';
  }

  if (imageCell.tagName === 'PICTURE') {
    return imageCell.querySelector('img')?.getAttribute('src') || '';
  }

  const pictureImg = imageCell.querySelector('picture img');
  if (pictureImg) {
    return pictureImg.getAttribute('src') || '';
  }

  const img = imageCell.querySelector('img');
  if (img) {
    return img.getAttribute('src') || '';
  }

  const link = imageCell.querySelector('a');
  if (link) {
    const linkedImg = link.querySelector('img');
    if (linkedImg) {
      return linkedImg.getAttribute('src') || '';
    }

    const href = link.getAttribute('href') || '';
    if (href.startsWith('/') || href.startsWith('http') || href.startsWith('//')) {
      return href;
    }
  }

  const raw = imageCell.textContent?.trim() || '';
  if (raw.startsWith('/') || raw.startsWith('http') || raw.startsWith('//')) {
    return raw;
  }

  return '';
}

function createImage(src, alt, className = 'cmp-image__image') {
  if (!src) return null;

  const img = document.createElement('img');
  img.src = src;
  img.alt = alt || ' ';
  img.loading = 'lazy';
  img.className = className;
  return img;
}

function createLinkBlock(data) {
  const {
    linkText,
    linkUrl,
    linkAction,
    redirectConfirm,
    external,
    superscript,
    superscriptText,
    superscriptLink,
  } = data;

  if (!linkText || !linkUrl) {
    return null;
  }

  const linkWrapper = document.createElement('div');
  linkWrapper.className = 'link__wrapper';

  const actionWrap = document.createElement('div');
  actionWrap.className = 'action-0 link';

  const cmpLink = document.createElement('div');
  cmpLink.className = 'cmp-link';

  const anchor = document.createElement('a');
  anchor.className = 'cmp-button link__text';
  anchor.href = linkUrl;
  anchor.target = linkAction || '_self';
  anchor.setAttribute('data-redirect-confirm', redirectConfirm ? 'true' : 'false');
  anchor.setAttribute('data-cmp-clickable', 'true');

  if (anchor.target === '_blank') {
    anchor.rel = 'noopener';
  }

  if (redirectConfirm) {
    anchor.setAttribute('role', 'link');
    anchor.setAttribute('tabindex', '0');
    anchor.setAttribute('aria-haspopup', 'dialog');
  }

  const textSpan = document.createElement('span');
  textSpan.className = 'link__inner-text';
  textSpan.textContent = linkText;
  anchor.append(textSpan);

  cmpLink.append(anchor);

  if (superscript && superscriptText) {
    if (superscriptLink) {
      const supLink = document.createElement('a');
      supLink.className = 'link__sup';
      supLink.href = superscriptLink;
      supLink.target = '_blank';
      supLink.rel = 'noopener';
      const supTag = document.createElement('sup');
      supTag.textContent = superscriptText;
      supLink.append(supTag);
      cmpLink.append(supLink);
    } else {
      const supTag = document.createElement('sup');
      supTag.className = 'link__sup';
      supTag.textContent = superscriptText;
      cmpLink.append(supTag);
    }
  }

  if ((linkAction === '_blank' || linkAction === '_self') && external) {
    const icon = document.createElement('span');
    icon.className = 'abt-icon abt-icon-arrow-up-right';
    cmpLink.append(icon);
  }

  actionWrap.append(cmpLink);
  linkWrapper.append(actionWrap);
  return linkWrapper;
}

function getVariantFromBlock(block) {
  return [...block.classList].find((cls) => [
    'default',
    'logo',
    'information',
    'support',
    'patient-story',
    'clickable-card',
  ].includes(cls)) || 'default';
}

function createCardScaffold(block, cardType, id, className) {
  const card = document.createElement('article');
  card.className = 'card';

  const cardRoot = document.createElement('div');
  cardRoot.className = `card--${cardType} card__v2`;
  cardRoot.setAttribute('data-js-component', 'card');

  const section = document.createElement('section');
  section.className = `card__wrapper${className ? ` ${className}` : ''}`;
  if (id) {
    section.id = id;
  }

  const media = document.createElement('div');
  media.className = 'card__media';

  const body = document.createElement('div');
  body.className = 'card__body';

  section.append(media);
  section.append(body);
  cardRoot.append(section);
  card.append(cardRoot);

  return {
    card,
    cardRoot,
    section,
    media,
    body,
  };
}

function getPrimaryLinkMeta(linkBlock) {
  const primary = linkBlock?.querySelector('.cmp-link .link__text, .link__text');
  if (!primary) {
    return null;
  }

  return {
    href: primary.getAttribute('href') || '',
    target: primary.getAttribute('target') || '_self',
    label: primary.textContent?.trim() || 'Card link',
  };
}

function decorateFromChildBlocks(block) {
  const childBlocks = [...block.children].filter((el) => {
    if (!el.classList?.contains('block')) {
      return false;
    }

    return el.classList.contains('adc-image')
      || el.classList.contains('adc-logo')
      || el.classList.contains('adc-inline-text-title')
      || el.classList.contains('adc-link')
      || el.classList.contains('text');
  });

  if (!childBlocks.length) {
    return false;
  }

  const cardType = getVariantFromBlock(block);
  const id = block.id || '';
  const className = '';

  const imageBlock = childBlocks.find((el) => el.classList.contains('adc-image'));
  const logoBlock = childBlocks.find((el) => el.classList.contains('adc-logo'));
  const titleBlock = childBlocks.find((el) => el.classList.contains('adc-inline-text-title'));
  const linkBlock = childBlocks.find((el) => el.classList.contains('adc-link'));
  const descBlock = childBlocks.find((el) => el.classList.contains('text'));

  const scaffold = createCardScaffold(block, cardType, id, className);

  if (imageBlock) {
    const imageWrap = document.createElement('div');
    imageWrap.className = 'cmp-image--primary';
    imageWrap.append(imageBlock);
    scaffold.media.append(imageWrap);
  }

  if (logoBlock && (cardType === 'default' || cardType === 'patient-story')) {
    const logoWrap = document.createElement('div');
    logoWrap.className = 'cmp_image--logo logo-comp';
    logoWrap.append(logoBlock);
    scaffold.media.append(logoWrap);
  }

  if (titleBlock) {
    const titleWrap = document.createElement('h4');
    titleWrap.className = 'card__title';
    titleWrap.append(titleBlock);
    scaffold.body.append(titleWrap);
  }

  if (descBlock) {
    descBlock.classList.add('card__description');
    if (cardType === 'support') {
      descBlock.classList.add('body-small');
    } else {
      descBlock.classList.add('body-default');
    }
    scaffold.body.append(descBlock);
  }

  if (cardType === 'support' || cardType === 'clickable-card') {
    const linkMeta = getPrimaryLinkMeta(linkBlock);
    const cardLink = document.createElement('a');
    cardLink.className = 'card__link';
    cardLink.setAttribute('aria-label', linkMeta?.label || 'Card link');
    if (linkMeta?.href) {
      cardLink.href = linkMeta.href;
      cardLink.target = linkMeta.target;
      if (linkMeta.target === '_blank') {
        cardLink.rel = 'noopener';
      }
    }

    scaffold.cardRoot.innerHTML = '';
    cardLink.append(scaffold.section);
    scaffold.cardRoot.append(cardLink);
  } else if (linkBlock) {
    const linkWrap = document.createElement('div');
    linkWrap.className = 'link__wrapper';
    linkWrap.append(linkBlock);
    scaffold.body.append(linkWrap);
  }

  block.replaceChildren(scaffold.card);
  return true;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .card')) {
    return;
  }

  if (decorateFromChildBlocks(block)) {
    return;
  }

  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) {
    return;
  }

  const cardType = text(rows[0]) || 'default';
  const id = text(rows[1]);
  const className = text(rows[2]);
  const imageSrc = extractImageSource(cell(rows[3]));
  const imageAlt = text(rows[4]);
  const logoSrc = extractImageSource(cell(rows[5]));
  const logoAlt = text(rows[6]);
  const titleHtml = html(rows[7]);
  const descriptionHtml = html(rows[8]);
  const cardLabel = text(rows[9]);
  const linkText = text(rows[10]);
  const linkUrl = text(rows[11]);
  const linkAction = text(rows[12]) || '_self';
  const external = asBool(text(rows[13]));
  const redirectConfirm = asBool(text(rows[14]));
  const superscript = asBool(text(rows[15]));
  const superscriptText = text(rows[16]);
  const superscriptLink = text(rows[17]);

  const resolvedTitleHtml = titleHtml || 'Card title';
  const resolvedDescriptionHtml = descriptionHtml || 'Card description';
  const resolvedLinkText = linkText || 'Learn more';

  block.textContent = '';

  const card = document.createElement('article');
  card.className = 'card';

  const cardRoot = document.createElement('div');
  cardRoot.className = `card--${cardType} card__v2`;
  cardRoot.setAttribute('data-js-component', 'card');

  const section = document.createElement('section');
  section.className = `card__wrapper${className ? ` ${className}` : ''}`;
  if (id) {
    section.id = id;
  }

  const media = document.createElement('div');
  media.className = 'card__media';

  const primaryImageWrap = document.createElement('div');
  primaryImageWrap.className = 'cmp-image--primary';
  const primaryImage = createImage(imageSrc, imageAlt, 'cmp-image__image card__image');
  if (primaryImage) {
    primaryImageWrap.append(primaryImage);
  } else {
    const mediaPlaceholder = document.createElement('div');
    mediaPlaceholder.className = 'card__placeholder card__placeholder--media';
    mediaPlaceholder.textContent = 'Card image';
    primaryImageWrap.append(mediaPlaceholder);
  }
  media.append(primaryImageWrap);

  if (cardType === 'support' && cardLabel) {
    const supportLabel = document.createElement('span');
    supportLabel.className = 'card__support-label--text label-default';
    supportLabel.textContent = cardLabel;
    media.append(supportLabel);
  }

  if (logoSrc && (cardType === 'default' || cardType === 'patient-story')) {
    const logoWrap = document.createElement('div');
    logoWrap.className = 'cmp_image--logo logo-comp';

    const logoCmp = document.createElement('div');
    logoCmp.className = 'cmp-image cmp-image--desktop';

    const logoImage = createImage(logoSrc, logoAlt, 'cmp-image__image');
    if (logoImage) {
      logoCmp.append(logoImage);
      logoWrap.append(logoCmp);
      media.append(logoWrap);
    }
  } else if (cardType === 'default' || cardType === 'patient-story') {
    const logoWrap = document.createElement('div');
    logoWrap.className = 'cmp_image--logo logo-comp';
    const logoPlaceholder = document.createElement('div');
    logoPlaceholder.className = 'card__placeholder card__placeholder--logo';
    logoPlaceholder.textContent = 'Card logo';
    logoWrap.append(logoPlaceholder);
    media.append(logoWrap);
  }

  const body = document.createElement('div');
  body.className = 'card__body';

  if (resolvedTitleHtml) {
    const title = document.createElement('h4');
    title.className = 'card__title';

    const inlineTitle = document.createElement('div');
    inlineTitle.className = 'title';

    const cmpTitle = document.createElement('div');
    cmpTitle.className = 'cmp-title';

    const textEl = document.createElement('span');
    textEl.className = 'cmp-title__text';
    textEl.innerHTML = resolvedTitleHtml;

    cmpTitle.append(textEl);
    inlineTitle.append(cmpTitle);
    title.append(inlineTitle);
    body.append(title);
  }

  if (resolvedDescriptionHtml) {
    const description = document.createElement('div');
    description.className = `card__description ${cardType === 'support' ? 'body-small' : 'body-default'}`;
    description.innerHTML = resolvedDescriptionHtml;
    body.append(description);
  }

  if (cardType !== 'support' && cardType !== 'clickable-card') {
    const linkBlock = createLinkBlock({
      linkText: resolvedLinkText,
      linkUrl,
      linkAction,
      redirectConfirm,
      external,
      superscript,
      superscriptText,
      superscriptLink,
    });
    if (linkBlock) {
      body.append(linkBlock);
    }
  }

  section.append(media);
  section.append(body);

  if (cardType === 'support' || cardType === 'clickable-card') {
    const cardLink = document.createElement('a');
    cardLink.className = 'card__link';
    cardLink.setAttribute('aria-label', resolvedTitleHtml.replace(/<[^>]+>/g, '').trim() || 'Card link');
    if (linkUrl) {
      cardLink.href = linkUrl;
      cardLink.target = linkAction || '_self';
      if (cardLink.target === '_blank') {
        cardLink.rel = 'noopener';
      }
    }
    cardLink.append(section);
    cardRoot.append(cardLink);
  } else {
    cardRoot.append(section);
  }

  card.append(cardRoot);
  block.append(card);
}
