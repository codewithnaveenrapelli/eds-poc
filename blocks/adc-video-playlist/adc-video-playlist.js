function getVideoEmbed(url) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  if (url.match(/\.(mp4|webm|ogg)$/i)) return url;
  if (url.includes('/embed')) return url;
  return null;
}

function buildPlayer(item) {
  const wrap = document.createElement('div');
  wrap.className = 'adc-playlist-video';
  if (item.embedUrl) {
    const iframe = document.createElement('iframe');
    iframe.src = item.embedUrl;
    iframe.title = item.title;
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('allow', 'autoplay; encrypted-media');
    wrap.append(iframe);
  } else if (item.thumbnail) {
    const img = document.createElement('img');
    img.src = item.thumbnail;
    img.alt = item.title;
    wrap.append(img);
  } else {
    const msg = document.createElement('div');
    msg.className = 'adc-playlist-no-video';
    msg.textContent = item.title;
    wrap.append(msg);
  }
  return wrap;
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  const videos = rows.map((row, idx) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    const img = cells.map((c) => c.querySelector('img')).find(Boolean);
    const link = cells.map((c) => c.querySelector('a')).find(Boolean);
    const headings = cells.flatMap((c) => [...c.querySelectorAll('h1,h2,h3,h4,h5,h6')]);
    const paras = cells.flatMap((c) => [...c.querySelectorAll('p')]).filter(
      (p) => !p.querySelector('img') && !p.querySelector('a'),
    );
    const title = headings[0]?.textContent.trim()
      || paras[0]?.textContent.trim()
      || cells[0]?.textContent.trim()
      || `Video ${idx + 1}`;
    const rawUrl = link?.href || '';
    const embedUrl = getVideoEmbed(rawUrl);
    const thumbnail = img?.src || '';
    const caption = paras[1]?.textContent.trim() || '';
    return {
      title, embedUrl, thumbnail, caption,
    };
  });

  const container = document.createElement('div');
  container.className = 'adc-playlist';

  const mainArea = document.createElement('div');
  mainArea.className = 'adc-playlist-main';

  const mainTitle = document.createElement('p');
  mainTitle.className = 'adc-playlist-main-title';
  mainTitle.textContent = videos[0]?.title || '';

  let mainPlayer = buildPlayer(videos[0] || { title: '' });

  const mainCaption = document.createElement('p');
  mainCaption.className = 'adc-playlist-caption';
  mainCaption.textContent = videos[0]?.caption || '';

  mainArea.append(mainTitle, mainPlayer, mainCaption);

  const sidebar = document.createElement('div');
  sidebar.className = 'adc-playlist-sidebar';

  videos.forEach((video, idx) => {
    const item = document.createElement('div');
    item.className = `adc-playlist-item${idx === 0 ? ' adc-playlist-item-active' : ''}`;
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');

    const thumb = document.createElement('div');
    thumb.className = 'adc-playlist-thumb';
    if (video.thumbnail) {
      const tImg = document.createElement('img');
      tImg.src = video.thumbnail;
      tImg.alt = video.title;
      tImg.loading = 'lazy';
      thumb.append(tImg);
    } else {
      const ph = document.createElement('div');
      ph.className = 'adc-playlist-thumb-placeholder';
      thumb.append(ph);
    }
    const playIcon = document.createElement('span');
    playIcon.className = 'adc-playlist-play-icon';
    playIcon.setAttribute('aria-hidden', 'true');
    playIcon.textContent = '▶';
    thumb.append(playIcon);

    const info = document.createElement('div');
    info.className = 'adc-playlist-item-info';

    const itemTitle = document.createElement('p');
    itemTitle.className = 'adc-playlist-item-title';
    itemTitle.textContent = video.title;
    info.append(itemTitle);

    if (video.caption) {
      const cap = document.createElement('p');
      cap.className = 'adc-playlist-item-caption';
      cap.textContent = video.caption;
      info.append(cap);
    }

    item.append(thumb, info);

    const activate = () => {
      sidebar.querySelectorAll('.adc-playlist-item').forEach((el) => {
        el.classList.remove('adc-playlist-item-active');
      });
      item.classList.add('adc-playlist-item-active');
      mainTitle.textContent = video.title;
      const newPlayer = buildPlayer(video);
      mainPlayer.replaceWith(newPlayer);
      mainPlayer = newPlayer;
      mainCaption.textContent = video.caption || '';
    };

    item.addEventListener('click', activate);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') activate();
    });
    sidebar.append(item);
  });

  container.append(mainArea, sidebar);
  block.textContent = '';
  block.append(container);
}
