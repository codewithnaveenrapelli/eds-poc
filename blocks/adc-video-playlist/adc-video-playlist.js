function getSourceUrl(block) {
  const fallback = '/blocks/adc-video-playlist/contract.v1.json';
  return block.dataset.source || fallback;
}

function resolveAssetUrl(url, source) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;

  if (source && /^https?:\/\//i.test(source) && url.startsWith('/')) {
    try {
      return `${new URL(source).origin}${url}`;
    } catch {
      return url;
    }
  }

  const aemOrigin = window.EDS_AEM_ORIGIN;
  if (aemOrigin && url.startsWith('/')) {
    return `${aemOrigin}${url}`;
  }

  return url;
}

async function fetchJson(source) {
  const response = await fetch(source, { credentials: 'include' });
  if (!response.ok) {
    throw new Error(`Failed to fetch video playlist data: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    const body = await response.text();
    const hint = body?.includes('<')
      ? 'Non-JSON response (likely login page/CORS/404).'
      : 'Non-JSON response.';
    throw new Error(`${hint} URL: ${source}`);
  }

  return response.json();
}

function toBool(value) {
  if (typeof value === 'boolean') return value;
  return String(value).toLowerCase() === 'true';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizeItem(item, source, index) {
  return {
    id: item.id || item.name || `video-${index}`,
    title: item.brightcoveTitle || item.videoTitle || `Video ${index + 1}`,
    caption: item.videoCaption || '',
    fallbackImage: resolveAssetUrl(item.fallBackImage || item.fallbackImage || '', source),
    imageAlt: item.alt || item.brightcoveTitle || item.videoTitle || `Video ${index + 1}`,
    type: item.videoType || (item.videoURL ? 'videoURL' : 'brightCove'),
    brightcove: {
      accountId: item.accountID || item.accountId || '',
      playerId: item.playerID || item.playerId || '',
      videoId: item.videoID || item.videoId || '',
    },
    videoUrl: item.videoURL || item.videoUrl || '',
    controls: {
      autoplayMobile: toBool(item.autoplayMobileView),
      autoplayDesktop: toBool(item.autoplayDesktopView),
      loop: toBool(item.loopOn),
      videoControls: toBool(item.videoControlOn),
      audioOn: toBool(item.audioControlOn),
    },
    transcriptEnabled: toBool(item.videoTranScriptText),
    ctaEnabled: toBool(item.enableBrightCoveCta),
  };
}

function normalizePayload(payload, source) {
  let rawItems = [];
  if (Array.isArray(payload.videoLinkItems)) {
    rawItems = payload.videoLinkItems;
  } else if (Array.isArray(payload.items)) {
    rawItems = payload.items;
  }

  return {
    title: payload.panelHeading || payload.title || 'Video Playlist',
    items: rawItems.map((item, index) => normalizeItem(item, source, index)),
  };
}

function brightcoveEmbedUrl(item) {
  const { accountId, playerId, videoId } = item.brightcove;
  if (!accountId || !playerId || !videoId) return '';
  return `https://players.brightcove.net/${accountId}/${playerId}_default/index.html?videoId=${videoId}`;
}

function renderEmbed(url, title) {
  if (!url) {
    return '<p>Video is not configured.</p>';
  }

  return `<iframe class="adc-video-playlist-player" src="${url}" title="${title}" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
}

function renderThumbPreview(item, title) {
  const embedUrl = item.type === 'videoURL' ? item.videoUrl : brightcoveEmbedUrl(item);
  if (!embedUrl) {
    return '';
  }

  return `<iframe class="adc-video-playlist-item-preview" src="${embedUrl}" title="${title}" loading="lazy" tabindex="-1" aria-hidden="true" allow="autoplay; fullscreen; picture-in-picture"></iframe>`;
}

function renderMain(item, isPlaying) {
  if (!item) {
    return '<p>No video items authored.</p>';
  }

  const escapedTitle = escapeHtml(item.title);
  const escapedCaption = escapeHtml(item.caption);
  const escapedAlt = escapeHtml(item.imageAlt || item.title);

  const embedUrl = item.type === 'videoURL' ? item.videoUrl : brightcoveEmbedUrl(item);
  const embed = renderEmbed(embedUrl, escapedTitle);

  const poster = item.fallbackImage
    ? `
      <button class="adc-video-playlist-main-poster" type="button" aria-label="Play ${escapedTitle}" data-embed-url="${escapeHtml(embedUrl)}" data-embed-title="${escapedTitle}">
        <img class="adc-video-playlist-main-fallback" src="${item.fallbackImage}" alt="${escapedAlt}" loading="lazy">
      </button>
    `
    : embed;

  return `
    <div class="adc-video-playlist-main-copy adc-video-playlist-main-copy-top">
      <h3>${escapedTitle}</h3>
    </div>
    <div class="adc-video-playlist-main-media">
      ${isPlaying ? embed : poster}
    </div>
    <div class="adc-video-playlist-main-copy">
      ${item.caption ? `<p>${escapedCaption}</p>` : ''}
    </div>
  `;
}

function renderListItem(item, index, isActive) {
  const escapedTitle = escapeHtml(item.title);
  const escapedCaption = escapeHtml(item.caption);
  const escapedAlt = escapeHtml(item.imageAlt || item.title);
  const thumbPreview = renderThumbPreview(item, escapedTitle);

  return `
    <button class="adc-video-playlist-item${isActive ? ' is-active' : ''}" data-index="${index}" type="button" aria-pressed="${isActive ? 'true' : 'false'}" aria-current="${isActive ? 'true' : 'false'}">
      <span class="adc-video-playlist-item-thumb${item.fallbackImage ? '' : ' adc-video-playlist-item-thumb-empty'}" data-preview-html="${escapeHtml(thumbPreview)}">
        ${item.fallbackImage ? `<img src="${item.fallbackImage}" alt="${escapedAlt}" loading="lazy">` : ''}
        ${item.fallbackImage ? '' : thumbPreview}
      </span>
      <span class="adc-video-playlist-item-copy">
        <strong>${escapedTitle}</strong>
        ${item.caption ? `<span>${escapedCaption}</span>` : ''}
      </span>
    </button>
  `;
}

function renderLayout(model, activeIndex, isPlaying) {
  const active = model.items[activeIndex] || model.items[0];
  return `
    <section class="adc-video-playlist-layout">
      <div class="adc-video-playlist-main">
        ${renderMain(active, isPlaying)}
      </div>
      <div class="adc-video-playlist-list" role="tablist" aria-label="${model.title}">
        ${model.items.map((item, i) => renderListItem(item, i, i === activeIndex)).join('')}
      </div>
    </section>
  `;
}

function updateActiveListState(block, activeIndex) {
  block.querySelectorAll('.adc-video-playlist-item').forEach((item, index) => {
    const isActive = index === activeIndex;
    item.classList.toggle('is-active', isActive);
    item.setAttribute('aria-pressed', String(isActive));
    item.setAttribute('aria-current', String(isActive));
  });
}

function wireImageFallbacks(block) {
  block.querySelectorAll('.adc-video-playlist-main-fallback, .adc-video-playlist-item img').forEach((img) => {
    img.addEventListener('error', () => {
      const thumb = img.closest('.adc-video-playlist-item-thumb');
      if (thumb) {
        thumb.classList.add('adc-video-playlist-item-thumb-empty');
        const { previewHtml } = thumb.dataset;
        if (previewHtml) {
          thumb.innerHTML = previewHtml;
          return;
        }
        img.remove();
        return;
      }

      const poster = img.closest('.adc-video-playlist-main-poster');
      if (poster) {
        const { embedUrl, embedTitle } = poster.dataset;
        const resolvedTitle = embedTitle || img.alt || 'Video';
        if (embedUrl) {
          poster.outerHTML = renderEmbed(embedUrl, resolvedTitle);
          return;
        }
        poster.classList.add('adc-video-playlist-main-poster-empty');
      }
    }, { once: true });
  });
}

function updateMain(block, model, activeIndex, isPlaying) {
  const active = model.items[activeIndex] || model.items[0];
  const main = block.querySelector('.adc-video-playlist-main');
  if (!main) {
    return;
  }

  main.innerHTML = renderMain(active, isPlaying);
  wireImageFallbacks(main);
}

export default async function decorate(block) {
  const source = getSourceUrl(block);
  if (!source) {
    block.innerHTML = '<p>Video playlist source is not configured.</p>';
    return;
  }

  try {
    const payload = await fetchJson(source);
    const model = normalizePayload(payload, source);

    if (!model.items.length) {
      block.innerHTML = '<p>No video items found in source payload.</p>';
      return;
    }

    let activeIndex = 0;
    let isPlaying = false;
    block.innerHTML = renderLayout(model, activeIndex, isPlaying);
    wireImageFallbacks(block);

    block.addEventListener('click', (event) => {
      const button = event.target.closest('.adc-video-playlist-item');
      if (button) {
        const nextIndex = Number(button.dataset.index || 0);
        if (Number.isNaN(nextIndex)) return;
        if (nextIndex === activeIndex) return;
        activeIndex = nextIndex;
        isPlaying = false;
        updateActiveListState(block, activeIndex);
        updateMain(block, model, activeIndex, isPlaying);
        return;
      }

      const playButton = event.target.closest('.adc-video-playlist-main-poster');
      if (playButton) {
        isPlaying = true;
        updateMain(block, model, activeIndex, isPlaying);
      }
    });
  } catch (error) {
    block.innerHTML = `<p>${error.message}</p>`;
  }
}
