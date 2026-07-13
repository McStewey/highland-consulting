const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');

if (menuButton && nav) {
  const navigationLabels = {
    'index.html': 'Capabilities',
    'about.html': 'Company',
    'insights.html': 'Intelligence',
    'contact.html': 'Engage Highland'
  };
  nav.querySelectorAll('a').forEach((link) => {
    const href = link.getAttribute('href');
    if (!navigationLabels[href]) return;
    const indicator = link.querySelector('span');
    if (indicator) link.firstChild.nodeValue = `${navigationLabels[href]} `;
    else link.textContent = navigationLabels[href];
  });

  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };

  menuButton.addEventListener('click', () => {
    const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(willOpen));
    document.body.classList.toggle('menu-open', willOpen);
  });

  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) closeMenu();
  });
}

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px' });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

document.querySelectorAll('[data-year]').forEach((item) => {
  item.textContent = new Date().getFullYear();
});

const filterButtons = document.querySelectorAll('[data-filter]');
const articles = document.querySelectorAll('[data-topic]');
filterButtons.forEach((button) => button.addEventListener('click', () => {
  filterButtons.forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  const filter = button.dataset.filter;
  articles.forEach((article) => {
    article.hidden = filter !== 'all' && article.dataset.topic !== filter;
  });
}));

const form = document.querySelector('#contact-form');
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get('name') || 'Website visitor';
    const organization = data.get('organization') || 'Not provided';
    const subject = `Highland Consulting inquiry - ${organization === 'Not provided' ? name : organization}`;
    const body = `Name: ${name}\nEmail: ${data.get('email')}\nOrganization: ${organization}\n\nWhat we are working through:\n${data.get('challenge')}`;
    window.location.href = `mailto:wade.stewart@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

const canvas = document.querySelector('#system-map');
if (canvas) {
  const context = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nodes = [
    { angle: -2.72, radius: 0.38, speed: 0.00005, label: 'STRUCTURE' },
    { angle: -1.82, radius: 0.43, speed: -0.00004, label: 'PROCESS' },
    { angle: -.74, radius: 0.37, speed: 0.000035, label: 'TECH' },
    { angle: .34, radius: 0.43, speed: -0.000045, label: 'PEOPLE' },
    { angle: 1.52, radius: 0.36, speed: 0.00004, label: 'REVENUE' },
    { angle: 2.48, radius: 0.42, speed: -0.000035, label: 'CAPITAL' }
  ];
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let frame = 0;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };

  const pointFor = (node, time) => {
    const shortSide = Math.min(width, height);
    const angle = node.angle + (reduceMotion ? 0 : time * node.speed);
    const xScale = width > height ? 1.42 : 1;
    return {
      x: width / 2 + Math.cos(angle) * shortSide * node.radius * xScale,
      y: height / 2 + Math.sin(angle) * shortSide * node.radius
    };
  };

  const draw = (time = 0) => {
    context.clearRect(0, 0, width, height);
    const center = { x: width / 2, y: height / 2 };
    const points = nodes.map((node) => pointFor(node, time));

    context.strokeStyle = 'rgba(77, 221, 248, .12)';
    context.lineWidth = 1;
    points.forEach((point, index) => {
      context.beginPath();
      context.moveTo(center.x, center.y);
      context.lineTo(point.x, point.y);
      context.stroke();

      const next = points[(index + 1) % points.length];
      context.beginPath();
      context.moveTo(point.x, point.y);
      context.lineTo(next.x, next.y);
      context.stroke();
    });

    points.forEach((point, index) => {
      const pulse = reduceMotion ? 1 : 1 + Math.sin(time * .002 + index) * .25;
      context.beginPath();
      context.fillStyle = index % 2 ? '#b7ff5f' : '#4dddf8';
      context.arc(point.x, point.y, 2.5 * pulse, 0, Math.PI * 2);
      context.fill();
      context.font = '500 7px "IBM Plex Mono", monospace';
      context.letterSpacing = '1px';
      context.fillStyle = 'rgba(178, 193, 202, .75)';
      context.textAlign = point.x < center.x ? 'right' : 'left';
      context.fillText(nodes[index].label, point.x + (point.x < center.x ? -9 : 9), point.y + 3);
    });

    if (!reduceMotion) frame = requestAnimationFrame(draw);
  };

  resize();
  draw(0);
  if (!reduceMotion) frame = requestAnimationFrame(draw);
  const resizeObserver = new ResizeObserver(() => {
    cancelAnimationFrame(frame);
    resize();
    draw(0);
    if (!reduceMotion) frame = requestAnimationFrame(draw);
  });
  resizeObserver.observe(canvas);
}
