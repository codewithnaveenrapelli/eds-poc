export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const label = rows[0]?.textContent.trim();
  const url = rows[1]?.textContent.trim();
  const variant = rows[2]?.textContent.trim() || 'primary';
  const newTab = rows[3]?.textContent.trim() === 'true';

  block.textContent = '';

  if (!label || !url) return;

  const a = document.createElement('a');
  a.href = url;
  a.className = `adc-button-link adc-button-link-${variant}`;
  a.textContent = label;
  if (newTab) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }

  block.append(a);
}
