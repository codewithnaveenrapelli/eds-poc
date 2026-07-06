export default function decorate(block) {
  const rows = [...block.children];

  rows.forEach((row) => {
    const cols = [...row.children];

    const imageCell = cols[0];
    const titleCell = cols[1];
    const descCell = cols[2];
    const ctaTextCell = cols[3];
    const ctaLinkCell = cols[4];
    const ctaTargetCell = cols[5];

    const picture = imageCell?.querySelector('picture');
    const title = titleCell?.textContent.trim() || '';
    const description = descCell?.textContent.trim() || '';
    const ctaText = ctaTextCell?.textContent.trim() || '';
    const ctaLink = ctaLinkCell?.textContent.trim() || '';
    const ctaTarget = ctaTargetCell?.textContent.trim() || '_self';

    const article = document.createElement('article');
    article.className = 'card';

    const card = document.createElement('div');
    card.className = 'card--default card__v2';

    const wrapper = document.createElement('section');
    wrapper.className = 'card__wrapper';

    const media = document.createElement('div');
    media.className = 'card__media';
    if (picture) {
      const mediaPrimary = document.createElement('div');
      mediaPrimary.className = 'cmp-image--primary';
      mediaPrimary.append(picture);
      media.append(mediaPrimary);
    }

    const body = document.createElement('div');
    body.className = 'card__body';

    if (title) {
      const heading = document.createElement('h4');
      heading.className = 'card__title';
      heading.textContent = title;
      body.append(heading);
    }

    if (description) {
      const desc = document.createElement('p');
      desc.className = 'card__description body-default';
      desc.textContent = description;
      body.append(desc);
    }

    if (ctaText && ctaLink) {
      const linkWrapper = document.createElement('div');
      linkWrapper.className = 'link__wrapper';

      const action = document.createElement('div');
      action.className = 'action-0 link';

      const cmpLink = document.createElement('div');
      cmpLink.className = 'cmp-link';

      const link = document.createElement('a');
      link.className = 'cmp-button link__text';
      link.href = ctaLink;
      link.target = ctaTarget;

      const linkText = document.createElement('span');
      linkText.className = 'link__inner-text';
      linkText.textContent = ctaText;

      link.append(linkText);
      if (ctaTarget === '_blank') {
        link.rel = 'noopener noreferrer';
      }

      cmpLink.append(link);
      action.append(cmpLink);
      linkWrapper.append(action);
      body.append(linkWrapper);
    }

    wrapper.append(media, body);
    card.append(wrapper);
    article.append(card);
    row.replaceWith(article);
  });
}
