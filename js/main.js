document.addEventListener('DOMContentLoaded', () => {
  fetch('data/content.json?v=' + new Date().getTime())
    .then(response => response.json())
    .then(data => {
      populateContent(data);
    })
    .catch(error => console.error('Error loading content:', error));

  setupMobileMenu();
});

function populateContent(data) {
  const page = document.body.dataset.page || 'home';

  // --- Common Elements (Nav, Footer) ---

  // Nav
  document.getElementById('brand-name').textContent = data.nav.brand;
  const navLinksContainer = document.getElementById('nav-links');
  const mobileMenuContainer = document.getElementById('mobile');

  data.nav.links.forEach(link => {
    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.text;
    navLinksContainer.appendChild(a);

    const mobileA = a.cloneNode(true);
    mobileA.addEventListener('click', toggleMobile);
    mobileMenuContainer.appendChild(mobileA);
  });

  const cta = document.createElement('a');
  cta.className = 'cta';
  cta.href = data.nav.cta.href;
  cta.role = 'button';
  cta.textContent = data.nav.cta.text;
  navLinksContainer.appendChild(cta);

  const mobileCta = cta.cloneNode(true);
  mobileCta.style.margin = '12px';
  mobileCta.addEventListener('click', toggleMobile);
  mobileMenuContainer.appendChild(mobileCta);

  // Footer
  const footerContent = document.getElementById('footer-content');
  const footerLinks = data.footer.links.map(link => `<a href="${link.href}">${link.text}</a>`).join(' • ');
  footerContent.innerHTML = `
    <small>${data.footer.copyright}</small>
    <small>${footerLinks}</small>
  `;

  // CTA Band (Common if present)
  const ctaBand = document.getElementById('cta-band');
  if (ctaBand) {
    // Use page-specific CTA band data if available, otherwise fallback to common
    const ctaData = (page === 'about' && data.aboutPage.ctaBand) ? data.aboutPage.ctaBand : data.ctaBand;

    if (ctaData.form) {
      ctaBand.innerHTML = `
        <div>
          <h2 style="margin:0 0 6px">${ctaData.heading}</h2>
          <p style="margin:0;color:#E5E7EB">${ctaData.description}</p>
        </div>
        <form id="contact-form" action="${ctaData.form.action}" method="POST" class="contact-form">
          ${ctaData.form.fields.map(field => {
        if (field.type === 'textarea') {
          return `<textarea name="${field.name}" placeholder="${field.placeholder}" ${field.required ? 'required' : ''}></textarea>`;
        }
        return `<input type="${field.type}" name="${field.name}" placeholder="${field.placeholder}" ${field.required ? 'required' : ''}>`;
      }).join('')}
          <button type="submit" class="cta">${ctaData.form.submitText}</button>
        </form>
      `;
      const form = document.getElementById('contact-form');
      form.addEventListener('submit', handleFormSubmit);
    } else if (ctaData.cta) {
      ctaBand.innerHTML = `
        <div>
          <h2 style="margin:0 0 6px">${ctaData.heading}</h2>
          <p style="margin:0;color:#E5E7EB">${ctaData.description}</p>
        </div>
        <a class="cta" href="${ctaData.cta.href}" role="button" aria-label="Start audit booking">${ctaData.cta.text}</a>
      `;
    }
  }

  // --- Page Specific Content ---

  if (page === 'home') {
    // Meta
    document.title = data.meta.title;

    // Hero
    const heroContent = document.getElementById('hero-content');
    heroContent.innerHTML = `
      <h1>${data.hero.heading}</h1>
      <p>${data.hero.subheading}</p>
      <div class="actions">
        <a href="${data.hero.cta.href}" class="cta" role="button">${data.hero.cta.text}</a>
        <a href="${data.hero.secondaryCta.href}" class="ghost" role="button">${data.hero.secondaryCta.text}</a>
      </div>
    `;
    document.getElementById('hero-image').alt = data.hero.imageAlt;

    // Trust
    const trustStrip = document.getElementById('trust-strip');
    data.trust.forEach(item => {
      const small = document.createElement('small');
      small.textContent = item;
      trustStrip.appendChild(small);
    });

    // Services
    const servicesGrid = document.getElementById('services-grid');
    data.services.cards.forEach(card => {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <h3>${card.title}</h3>
        <p>${card.description}</p>
        <p class="arrow">${card.linkText}</p>
      `;
      servicesGrid.appendChild(div);
    });

    // Case Study
    const caseStudyContent = document.getElementById('case-study-content');
    caseStudyContent.innerHTML = `
      <h2 style="color:var(--navy);margin:0 0 8px">${data.caseStudy.heading}</h2>
      <p class="meta">${data.caseStudy.meta}</p>
      <h3 style="margin:10px 0 10px">${data.caseStudy.subheading}</h3>
      <p>${data.caseStudy.description}</p>
      <div style="margin-top:14px;display:flex;gap:12px;flex-wrap:wrap">
        <a class="cta" href="${data.caseStudy.cta.href}">${data.caseStudy.cta.text}</a>
        <a class="ghost" href="${data.caseStudy.secondaryCta.href}">${data.caseStudy.secondaryCta.text}</a>
      </div>
    `;
    document.getElementById('case-study-image').alt = data.caseStudy.imageAlt;

    // Service Teaser
    document.getElementById('teaser-heading').textContent = data.serviceTeaser.heading;
    const teaserGrid = document.getElementById('teaser-grid');
    data.serviceTeaser.cards.forEach(card => {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <h3>${card.title}</h3>
        <p>${card.description}</p>
      `;
      teaserGrid.appendChild(div);
    });

    // About (Home version)
    const aboutContent = document.getElementById('about-content');
    const aboutListItems = data.about.list.map(item => `<li>${item}</li>`).join('');

    // Create the badge HTML with the inline SVG for the hex icon
    const badgeHexIcon = `
      <svg class="badge-logo" viewBox="0 0 240 180" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
          <linearGradient id="swatch1" inkscape:swatch="solid">
            <stop style="stop-color:#000000;stop-opacity:0;" offset="0" id="stop1" />
          </linearGradient>
          <linearGradient inkscape:collect="always" xlink:href="#swatch1" id="linearGradient1" x1="12.325642" y1="42.688801" x2="73.051964" y2="42.688801" gradientUnits="userSpaceOnUse" />
          <linearGradient inkscape:collect="always" xlink:href="#swatch1" id="linearGradient1-0" x1="12.325642" y1="42.688801" x2="73.051964" y2="42.688801" gradientUnits="userSpaceOnUse" />
          <filter inkscape:collect="always" style="color-interpolation-filters:sRGB" id="filter1" x="-0.087159412" y="-0.075583489" width="1.1743188" height="1.151167">
            <feGaussianBlur inkscape:collect="always" stdDeviation="2.2053626" id="feGaussianBlur1" />
          </filter>
          <filter inkscape:collect="always" style="color-interpolation-filters:sRGB" id="filter2" x="-0.087159412" y="-0.075583489" width="1.1743188" height="1.151167">
            <feGaussianBlur inkscape:collect="always" stdDeviation="2.2053626" id="feGaussianBlur2" />
          </filter>
          <filter inkscape:collect="always" style="color-interpolation-filters:sRGB" id="filter3" x="-0.087159412" y="-0.075583489" width="1.1743188" height="1.151167">
            <feGaussianBlur inkscape:collect="always" stdDeviation="2.2053626" id="feGaussianBlur3" />
          </filter>
        </defs>
        <g inkscape:label="Layer 1" inkscape:groupmode="layer" id="layer1">
          <g id="g5" transform="translate(30.750715,-6.4699985)">
            <path sodipodi:type="star" style="opacity:0.85;fill:var(--pink);fill-opacity:0.960784;stroke-width:0.264583;filter:url(#filter3)" id="path8-5" inkscape:flatsided="true" sodipodi:sides="6" sodipodi:cx="42.688801" sodipodi:cy="42.688801" sodipodi:r1="35.013496" sodipodi:r2="21.350222" sodipodi:arg1="0.52127605" sodipodi:arg2="1.0448748" inkscape:rounded="0" inkscape:randomized="0" d="M 73.05196,60.125071 42.770127,77.702203 12.406969,60.265933 12.325642,25.252531 42.607474,7.6753989 72.970633,25.111669 Z" transform="matrix(1.4179815,0.00472855,-0.0034659,1.1138483,72.115312,74.185617)" inkscape:label="hex3-shadow" />
            <path sodipodi:type="star" style="opacity:0.85;mix-blend-mode:normal;fill:var(--blue);fill-opacity:0.968627;stroke-width:0.264583;filter:url(#filter2)" id="path7-3" inkscape:flatsided="true" sodipodi:sides="6" sodipodi:cx="42.688801" sodipodi:cy="42.688801" sodipodi:r1="35.013496" sodipodi:r2="21.350222" sodipodi:arg1="0.52127605" sodipodi:arg2="1.0448748" inkscape:rounded="0" inkscape:randomized="0" d="M 73.05196,60.125071 42.770127,77.702203 12.406969,60.265933 12.325642,25.252531 42.607474,7.6753989 72.970633,25.111669 Z" transform="matrix(1.4179815,0.00472855,-0.00346589,1.1138483,-14.384689,74.185617)" inkscape:label="hex2-shadow" />
            <path sodipodi:type="star" style="fill:var(--pink);fill-opacity:0.96;stroke-width:0.264583" id="path8" inkscape:flatsided="true" sodipodi:sides="6" sodipodi:cx="42.688801" sodipodi:cy="42.688801" sodipodi:r1="35.013496" sodipodi:r2="21.350222" sodipodi:arg1="0.52127605" sodipodi:arg2="1.0448748" inkscape:rounded="0" inkscape:randomized="0" d="M 73.05196,60.125071 42.770127,77.702203 12.406969,60.265933 12.325642,25.252531 42.607474,7.6753989 72.970633,25.111669 Z" transform="matrix(1.4179815,0.00472855,-0.0034659,1.1138483,76.86602,67.309297)" inkscape:label="hex-3" />
            <path sodipodi:type="star" style="fill:var(--blue);fill-opacity:0.97;stroke-width:0.264583" id="path7" inkscape:flatsided="true" sodipodi:sides="6" sodipodi:cx="42.688801" sodipodi:cy="42.688801" sodipodi:r1="35.013496" sodipodi:r2="21.350222" sodipodi:arg1="0.52127605" sodipodi:arg2="1.0448748" inkscape:rounded="0" inkscape:randomized="0" d="M 73.05196,60.125071 42.770127,77.702203 12.406969,60.265933 12.325642,25.252531 42.607474,7.6753989 72.970633,25.111669 Z" transform="matrix(1.4179815,0.00472855,-0.00346589,1.1138483,-9.633981,67.309297)" inkscape:label="hex-2" />
            <path sodipodi:type="star" style="fill:var(--navy);fill-opacity:0.968627;stroke:url(#linearGradient1-0);stroke-width:0;stroke-dasharray:none;filter:url(#filter1)" id="path1-8" inkscape:flatsided="true" sodipodi:sides="6" sodipodi:cx="42.688801" sodipodi:cy="42.688801" sodipodi:r1="35.013496" sodipodi:r2="21.350222" sodipodi:arg1="0.52127605" sodipodi:arg2="1.0448748" inkscape:rounded="0" inkscape:randomized="0" d="M 73.05196,60.125071 42.770127,77.702203 12.406969,60.265933 12.325642,25.252531 42.607474,7.6753989 72.970633,25.111669 Z" transform="matrix(-1.4179815,0.00472854,0.00346592,1.1138483,149.08326,30.085618)" inkscape:label="hex1-shadow" />
            <path sodipodi:type="star" style="fill:var(--navy);fill-opacity:0.97;stroke:url(#linearGradient1);stroke-width:0;stroke-dasharray:none" id="path1" inkscape:flatsided="true" sodipodi:sides="6" sodipodi:cx="42.688801" sodipodi:cy="42.688801" sodipodi:r1="35.013496" sodipodi:r2="21.350222" sodipodi:arg1="0.52127605" sodipodi:arg2="1.0448748" inkscape:rounded="0" inkscape:randomized="0" d="M 73.05196,60.125071 42.770127,77.702203 12.406969,60.265933 12.325642,25.252531 42.607474,7.6753989 72.970633,25.111669 Z" transform="matrix(-1.4179815,0.00472854,0.00346592,1.1138483,154.38397,17.189296)" inkscape:label="hex-1" />
          </g>
        </g>
      </svg>
    `;

    aboutContent.innerHTML = `
      <span class="badge" aria-label="Credibility badge">
        ${badgeHexIcon}
        ${data.about.badge}
      </span>
      <h2 style="color:var(--navy);margin:20px 0 10px">${data.about.heading}</h2>
      <p>${data.about.description}</p>
      <ul style="margin:12px 0 0 18px;line-height:1.7;color:#4B5563">
        ${aboutListItems}
      </ul>
    `;
    document.getElementById('about-image').alt = data.about.imageAlt;

  } else if (page === 'about') {
    const aboutData = data.aboutPage;
    document.title = aboutData.meta.title;

    // Hero
    const heroContent = document.getElementById('hero-content');
    heroContent.innerHTML = `
      <h1>${aboutData.hero.heading}</h1>
      <p>${aboutData.hero.subheading}</p>
      <div class="actions">
        <a href="${aboutData.hero.cta.href}" class="cta" role="button">${aboutData.hero.cta.text}</a>
        <a href="${aboutData.hero.secondaryCta.href}" class="ghost" role="button">${aboutData.hero.secondaryCta.text}</a>
      </div>
    `;
    document.getElementById('hero-image').alt = aboutData.hero.imageAlt;

    // Cred Strip
    const credStrip = document.getElementById('cred-strip');
    aboutData.cred.forEach(item => {
      const span = document.createElement('span');
      span.className = 'badge';
      span.textContent = item;
      credStrip.appendChild(span);
    });

    // Principles
    const principlesContent = document.getElementById('principles-content');
    const principlesCards = aboutData.story.principles.cards.map(card => `
      <div class="card">
        <h3>${card.title}</h3>
        <p class="muted">${card.description}</p>
      </div>
    `).join('');

    principlesContent.innerHTML = `
      <h2>${aboutData.story.principles.heading}</h2>
      <p class="lead">${aboutData.story.principles.lead}</p>
      <div class="grid3" style="margin-top:10px">
        ${principlesCards}
      </div>
    `;

    // Approach
    const approachContent = document.getElementById('approach-content');
    const approachSteps = aboutData.story.approach.steps.map(step => `<li>${step}</li>`).join('');
    approachContent.innerHTML = `
      <h2>${aboutData.story.approach.heading}</h2>
      <ol class="lead" style="padding-left:18px">
        ${approachSteps}
      </ol>
      <p class="muted">${aboutData.story.approach.footer}</p>
    `;

    // Timeline
    document.getElementById('timeline-heading').textContent = aboutData.timeline.heading;
    const timelineContent = document.getElementById('timeline-content');
    aboutData.timeline.items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'titem';
      div.innerHTML = item;
      timelineContent.appendChild(div);
    });

    // Tools
    document.getElementById('tools-heading').textContent = aboutData.tools.heading;
    const toolsContent = document.getElementById('tools-content');
    aboutData.tools.items.forEach(item => {
      const span = document.createElement('span');
      span.className = 'badge';
      span.style.background = '#fff';
      span.style.borderColor = '#E5E7EB';
      span.style.color = '#374151';
      span.textContent = item;
      toolsContent.appendChild(span);
    });

  } else if (page === 'portfolio') {
    const portfolioData = data.portfolioPage;
    document.title = portfolioData.meta.title;

    // Hero
    document.getElementById('hero-heading').textContent = portfolioData.hero.heading;
    document.getElementById('hero-subheading').textContent = portfolioData.hero.subheading;

    // Projects
    portfolioData.projects.forEach((project, index) => {
      const contentId = `project${index + 1}-content`;
      const container = document.getElementById(contentId);
      if (container) {
        const detailsList = project.details.map(detail => `<li>${detail}</li>`).join('');
        container.innerHTML = `
          <h2>${project.title}</h2>
          <ul>
            ${detailsList}
          </ul>
        `;
      }
    });
  }
}

function setupMobileMenu() {
  const btn = document.getElementById('hamb');
  btn.addEventListener('click', toggleMobile);
}

function toggleMobile() {
  const m = document.getElementById('mobile');
  const isVisible = m.style.display === 'block';
  m.style.display = isVisible ? 'none' : 'block';

  const btn = document.getElementById('hamb');
  btn.setAttribute('aria-expanded', !isVisible);
}

function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);

  // Basic validation
  const email = data.get('email');
  if (!email || !email.includes('@')) {
    alert('Please enter a valid email address.');
    return;
  }

  fetch(form.action, {
    method: form.method,
    body: data,
    headers: {
      'Accept': 'application/json'
    }
  }).then(response => {
    if (response.ok) {
      form.innerHTML = '<p style="color: white; font-weight: bold; text-align: center; padding: 20px;">Thanks for your request! We will be in touch shortly.</p>';
    } else {
      response.json().then(data => {
        if (Object.hasOwn(data, 'errors')) {
          alert(data["errors"].map(error => error["message"]).join(", "));
        } else {
          alert("Oops! There was a problem submitting your form");
        }
      })
    }
  }).catch(error => {
    alert("Oops! There was a problem submitting your form");
  });
}
