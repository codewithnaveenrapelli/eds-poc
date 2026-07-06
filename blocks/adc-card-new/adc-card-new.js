export default function decorate(block) {
  const rows = [...block.children];

  rows.forEach((row) => {
    const cols = [...row.children];

    const imageCell = cols[0];
    const titleCell = cols[1];
    const descCell = cols[2];
    const ctaTextCell = cols[3];
    const ctaLinkCell = cols[4];

    const picture = imageCell.querySelector('picture');
    const title = titleCell.textContent.trim();
    const description = descCell.textContent.trim();
    const ctaText = ctaTextCell.textContent.trim();
    const ctaLink = ctaLinkCell.textContent.trim();

    const article = document.createElement('article');
    article.className = 'card';

    article.innerHTML = `
      <div class="card--default card__v2">
        <section class="card__wrapper">
          
          <div class="card__media">
            <div class="cmp-image--primary">
              ${picture ? picture.outerHTML : ''}
            </div>
          </div>

          <div class="card__body">
            <h4 class="card__title">${title}</h4>

            <div class="card__description body-default">
              ${description}
            </div>

            <div class="link__wrapper">
              <div class="action-0 link">
                <div class="cmp-link">
                  }"
                    class="cmp-button link__text"
                    target="_self">
                    <span class="link__inner-text">
                      ${ctaText}
                    </span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>
    `;

    row.replaceWith(article);
  });
}