'use strict';

(function site() {
  const main = document.querySelector('main');
  const nav = document.querySelector('#navegacion');
  const menu = document.querySelector('.menu-toggle');
  const shopNav = document.querySelector('.shop-nav');
  const lightbox = document.querySelector('#lightbox');
  const backTop = document.querySelector('.back-top');
  const money = new Intl.NumberFormat('es-CR', {style: 'currency', currency: 'CRC', maximumFractionDigits: 0});
  const assets = (name) => `assets/${name}.jpg`;
  const email = 'info@sagazcoffee.com';
  const products = [
    ['Caja Edición Especial', 6500, 6500],
    ['Finca VOO Catuai Tueste Medio', 7000, 7000],
    ['Geisha Black Honey', 7500, 7500],
    ['Sagaz Coffee Candy Natural 500 g', 7000, 7800],
    ['Sagaz Coffee Clásico molido', 1900, 7400, 'Café convencional'],
    ['Sagaz Coffee Premium Tueste Medio', 3500, 13100],
    ['Sagaz Coffee Premium Tueste Oscuro', 3500, 13100],
    ['Sagaz Coffee Tradicional molido', 1700, 6500, 'Café convencional']
  ].map(([name, min, max, category = 'Café especial'], id) => ({name, min, max, category, id}));

  const gallery = (prefix, labels) => labels.map((label, i) => ({file: `${prefix}-${i}`, label}));
  const riverGallery = gallery('rio', [
    'Cerezas en secado', 'Vista aérea del cafetal', 'Detalle de granos', 'Recolección en el cafetal', 'Rama con frutos maduros',
    'Flores de café', 'Floración del cafetal', 'Plantas de café', 'Cerezas recién recolectadas', 'Café en proceso natural'
  ]);
  const vooGallery = gallery('voo', [
    'Cafetales de Finca Voo', 'Zona arbolada de la finca', 'Flores del cafetal', 'Vista del valle',
    'Recorrido por la finca', 'Ladera sembrada de café', 'Montañas de la Zona de Los Santos', 'Ramas de cafeto'
  ]);
  const facilities = [
    'Secado de café bajo techo', 'Camas de secado al aire libre', 'Patio de secado', 'Camas elevadas junto al beneficio',
    'Área de procesamiento', 'Maquinaria del beneficio'
  ].map((label, i) => ({file: `planta-${i + 1}`, label}));
  const processes = gallery('proceso', ['Semi washed', 'Red Honey', 'Black Honey', 'Natural', 'Candy Natural', 'Natural anaeróbico']);
  const awards = [
    {
      file: 'voo-2026', label: 'Familia Solís Cordero en la premiación de 2026', title: 'Séptimo lugar Experimental Cup of Excellence 2026',
      text: 'La Finca Voo obtuvo el séptimo lugar en la categoría Experimental en Taza de la Excelencia Costa Rica 2026, con una puntuación de 89.39 pts.', variety: 'Catuaí', process: 'Candy Natural'
    },
    {
      file: 'voo-2025', label: 'Equipo de Finca Voo con sus reconocimientos', title: 'Primer lugar Experimental Cup of Excellence 2025',
      text: 'La Finca Voo obtuvo por segundo año consecutivo el primer lugar en la categoría Experimental en Taza de la Excelencia Costa Rica 2025, con una puntuación de 90.47 pts.', variety: 'Catuaí', process: 'Candy Natural'
    },
    {
      file: 'voo-2024', label: 'Premiación de Finca Voo en 2024', title: 'Primer lugar Experimental Cup of Excellence 2024',
      text: 'La Finca Voo obtuvo el primer lugar en la categoría Experimental en Taza de la Excelencia Costa Rica 2024, con una puntuación de 91.19 pts.', variety: 'Catuaí', process: 'Candy Natural'
    },
    {
      file: 'voo-2023', label: 'Familia en el cafetal con el trofeo de 2023', title: 'Segundo lugar Cup of Excellence 2023',
      text: 'La Finca Voo obtuvo el segundo lugar en Taza de la Excelencia Costa Rica 2023, con una puntuación de 91 pts.', variety: 'Catuaí', process: 'Natural'
    }
  ];
  const riverAwards = [{
    file: 'rio-premio', label: 'Familia Solís Cordero en Taza de la Excelencia Costa Rica 2026', title: 'Primer lugar Lavados Cup of Excellence 2026',
    text: 'La Finca Río Blanco obtuvo el primer lugar en la categoría Lavados en Taza de la Excelencia Costa Rica 2026, con una puntuación de 91.36 pts.', variety: 'Java', note: 'Por tercer año consecutivo, Café Solís & Cordero obtuvo un primer lugar con alguna de sus fincas.'
  }];
  let groups = [];
  let activeGroup = [];
  let activePhoto = 0;
  let returnFocus;
  let cart = [];
  try {
    const saved = JSON.parse(localStorage.getItem('sagaz-cart') || '[]');
    if (Array.isArray(saved)) cart = saved.filter((line) => line && products[line.id] && Number.isInteger(line.quantity) && line.quantity > 0);
  } catch {
    // The cart still works in memory when local storage is unavailable.
  }

  function photo(item, group, index, caption = false) {
    return `<button class="photo" type="button" data-gallery="${group}" data-photo="${index}" aria-label="Ampliar: ${item.label}">
      <img src="${assets(item.file)}" alt="${item.label}" loading="lazy">
      ${caption ? `<span>${item.label}</span>` : ''}
    </button>`;
  }

  function photoGrid(items, columns, classes = '') {
    const group = groups.push(items) - 1;
    return `<div class="photos ${classes}" style="--columns:${columns}">${items.map((item, i) => photo(item, group, i)).join('')}</div>`;
  }

  function awardRows(items) {
    const group = groups.push(items) - 1;
    return `<section class="wide awards"><div class="section-intro"><h2>Reconocimientos</h2></div>${items.map((item, i) => `<article class="award">
      <div class="award-copy"><h3>${item.title}</h3><p>${item.text}</p><dl class="award-details">
        <div><dt>Variedad</dt><dd>${item.variety}</dd></div>
        ${item.process ? `<div><dt>Proceso</dt><dd>${item.process}</dd></div>` : ''}
      </dl>${item.note ? `<p class="award-note">${item.note}</p>` : ''}</div>
      ${photo(item, group, i)}
    </article>`).join('')}</section>`;
  }

  function farm(kind) {
    const river = kind === 'rio';
    const name = river ? 'Finca Río Blanco' : 'Finca Voo';
    const intro = river
      ? 'La Finca Río Blanco fue adquirida por la familia Solís Cordero en el año 2022. La familia participa en el cultivo, la cosecha, el procesamiento y la comercialización del café, con un manejo orientado a la conservación del suelo.'
      : 'La Finca Voo está ubicada en Copey de Dota, en la Zona de Los Santos, una de las mejores regiones productoras de café en el mundo. Sus condiciones de terroir permiten producir cafés con notas únicas y diferentes.';
    const highlights = river ? `
      <dl class="rio-highlights">
        <div><dt>Altitud</dt><dd>1.950 m s. n. m.</dd></div>
        <div><dt>Variedades</dt><dd>Java, Catuaí y Geisha</dd></div>
      </dl>
      <button class="button rio-gallery-link" type="button" data-farm-gallery>Explorar la galería <span aria-hidden="true">↓</span></button>` : '';
    const cover = river ? `
      <figure class="rio-hero-media">
        <img class="rio-landscape" src="${assets('rio-1')}" alt="Vista aérea de los cafetales de Río Blanco">
        <img class="rio-harvest" src="${assets('rio-8')}" alt="Cerezas de café recién recolectadas">
      </figure>` : `
      <img class="farm-cover" src="${assets('voo-6')}" alt="Vista de los cafetales de ${name}">`;
    return `<section class="narrow farm-hero ${kind}">
      <div class="story-copy">
        <p class="story-kicker">Copey de Dota · Zona de Los Santos</p>
        <h1 class="story-heading">${name}</h1>
        <p>${intro}</p>${highlights}
      </div>
      ${cover}

    </section>${awardRows(river ? riverAwards : awards)}
    <section class="narrow farm-gallery"><div class="section-intro"><h2 tabindex="-1">Galería de la finca</h2></div>${photoGrid(river ? riverGallery : vooGallery, river ? 5 : 4)}</section>`;
  }

  function company() {
    const group = groups.push(processes) - 1;
    return `<section class="wide story-hero">
      <div class="story-copy">
        <p class="story-kicker">Café de especialidad · Zona de Los Santos</p>
        <h1 class="story-heading">Café Solís &amp; Cordero</h1>
        <p>Producimos, procesamos y comercializamos café de especialidad de la Zona de Los Santos. Seleccionamos la fruta y cuidamos cada etapa para que cada lote conserve su propio perfil.</p>
        <div class="story-links"><a href="#procesos">Ver los procesos</a><a href="#finca-voo">Conocer Finca Voo</a></div>
      </div>
      <figure class="story-collage">
        <img src="${assets('planta-2')}" alt="Camas de secado de café al aire libre">
        <img class="story-inset" src="${assets('planta-1')}" alt="Café secándose bajo techo">
      </figure>
    </section>
    <section class="narrow company-facilities">
      <div class="section-intro"><h2>El beneficio por dentro</h2><p>Las instalaciones permiten procesar hasta 10.000 fanegas por vía húmeda y seca, desde el despulpado hasta el acondicionamiento para exportación.</p></div>
      ${photoGrid(facilities, 3, 'facilities')}
    </section>
    <section class="process-section" id="procesos">
      <div class="wide">
        <div class="section-intro"><h2>Procesos del café</h2><p>Explore los seis procesos que usamos para desarrollar distintos perfiles de taza.</p></div>
        <div class="process-grid">${processes.map((item, i) => photo(item, group, i, true)).join('')}</div>
      </div>
    </section>`;
  }

  function price(product) {
    return product.min === product.max ? money.format(product.min) : `${money.format(product.min)} – ${money.format(product.max)}`;
  }

  function productGrid(items) {
    return `<div class="products">${items.map((item) => `<article class="product">
      <a class="product-image" href="#producto-${item.id}" aria-label="${item.name}"><img src="${assets(`cafe-${item.id}`)}" alt="${item.name}" loading="lazy"></a>
      <small>${item.category}</small><h2><a href="#producto-${item.id}">${item.name}</a></h2>
      <p class="price">${price(item)}</p>
      ${item.id === 0
        ? `<button class="button dark" type="button" data-add="${item.id}">Añadir al carrito</button>`
        : `<a class="button dark" href="#producto-${item.id}">Seleccionar opciones</a>`}
    </article>`).join('')}</div>`;
  }

  function shop() {
    return `<section class="narrow shop-view">
      <div class="shop-heading"><h1 class="shop-title">Tienda Sagaz Coffee</h1>
      <p class="shop-intro">Potencializamos las características del café de una manera singular, realizando cada proceso con las técnicas y cuidados necesarios para disfrutar de uno de los mejores cafés del mundo.</p></div>
      <div class="shop-controls"><span>Mostrando los ${products.length} resultados</span>
        <select id="sort" aria-label="Ordenar productos"><option value="default">Orden original</option><option value="asc">Precio de menor a mayor</option><option value="desc">Precio de mayor a menor</option><option value="name">Nombre de A a Z</option></select>
      </div>
      <div id="results">${productGrid(products)}</div>
    </section>`;
  }

  function productView(item) {
    return `<section class="narrow product-detail">
      <img src="${assets(`cafe-${item.id}`)}" alt="${item.name}">
      <div><a href="#tienda">← Volver a la tienda</a><h1>${item.name}</h1>
        <p>${item.category}</p><p class="price">${price(item)}</p>
        <form class="order-form" data-product="${item.id}">
          ${item.min !== item.max ? '<p>La presentación y el precio se confirman al consultar el pedido.</p>' : ''}
          <label>Cantidad<input name="quantity" type="number" value="1" min="1" max="99" required></label>
          <button class="button dark" type="submit">Añadir al carrito</button>
        </form>
      </div>
    </section>`;
  }

  function cartContent(checkout) {
    if (!cart.length) return `<section class="narrow cart-page"><h1 class="visually-hidden">${checkout ? 'Finalizar compra' : 'Carrito'}</h1>
      <p class="message">Tu carrito está vacío.</p><a class="button" href="#tienda">Volver a la tienda</a></section>`;
    const minimum = cart.reduce((sum, entry) => sum + products[entry.id].min * entry.quantity, 0);
    const maximum = cart.reduce((sum, entry) => sum + products[entry.id].max * entry.quantity, 0);
    const total = minimum === maximum ? money.format(minimum) : `${money.format(minimum)} – ${money.format(maximum)}`;
    const lines = cart.map((entry) => {
      const item = products[entry.id];
      return `<div class="cart-line"><a href="#producto-${item.id}">${item.name}</a><span>${price(item)} por unidad</span>
        ${checkout ? `<span>Cantidad: ${entry.quantity}</span>` : `<input type="number" min="1" max="99" value="${entry.quantity}" data-quantity="${item.id}" aria-label="Cantidad de ${item.name}"><button type="button" data-remove="${item.id}" aria-label="Quitar ${item.name}">Quitar</button>`}
      </div>`;
    }).join('');
    return `<section class="narrow cart-page"><h1>${checkout ? 'Finalizar compra' : 'Carrito'}</h1>${lines}
      <p class="cart-total"><strong>Subtotal estimado</strong> ${total}</p>
      ${checkout ? `<p>Envíe la consulta por correo para confirmar disponibilidad, presentación, envío y pago.</p>
        <form class="order-form" id="order"><label>Nombre<input name="name" autocomplete="name" required></label>
        <label>Correo electrónico<input name="email" type="email" autocomplete="email" required></label>
        <button class="button" type="submit">Preparar consulta por correo</button></form>`
        : '<div class="actions"><a class="button" href="#finalizar-compra">Finalizar compra</a><a href="#tienda">Seguir comprando</a></div>'}
    </section>`;
  }

  const views = {
    inicio: ['Inicio', () => document.querySelector('#home').innerHTML],
    'cafe-solis-cordero': ['Café Solís & Cordero', company],
    procesos: ['Procesos del café', company],
    'finca-voo': ['Finca Voo', () => farm('voo')],
    'finca-rio-blanco': ['Finca Río Blanco', () => farm('rio')],
    tienda: ['Tienda', shop],
    carrito: ['Carrito', () => cartContent(false)],
    'finalizar-compra': ['Finalizar compra', () => cartContent(true)],
    contactenos: ['Contáctenos', () => `<section class="narrow contact-hero"><h1 class="contact-title">Contáctenos</h1><p>Consultas sobre nuestros cafés, pedidos y visitas.</p></section>`]
  };
  let currentPage = '';
  function closeMenu() {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    shopNav.open = false;
  }

  function render(focus = false) {
    const requested = location.hash.slice(1);
    if (requested === 'contenido' && currentPage) return;
    if (requested === 'manifiesto' && currentPage === 'inicio') return;
    const match = requested.match(/^producto-(\d)$/);
    const item = match ? products[Number(match[1])] : undefined;
    const page = item || Object.hasOwn(views, requested) ? requested : 'inicio';
    const [title, view] = item ? [item.name, () => productView(item)] : views[page];
    groups = [];
    currentPage = page;
    main.innerHTML = view();
    main.classList.toggle('editorial-home', page === 'inicio');
    document.title = `${title} | Sagaz Coffee`;
    nav.querySelectorAll('a').forEach((link) => {
      const active = link.hash === `#${page === 'procesos' ? 'cafe-solis-cordero' : page}`;
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    shopNav.classList.toggle('active', Boolean(item) || ['tienda', 'carrito', 'finalizar-compra'].includes(page));
    closeMenu();
    if (focus) main.focus({preventScroll: true});
    if (page === 'procesos') document.querySelector('#procesos')?.scrollIntoView();
    else if (requested === 'manifiesto') document.querySelector('#manifiesto')?.scrollIntoView();
    else window.scrollTo(0, 0);
  }

  function saveCart() {
    try {
      localStorage.setItem('sagaz-cart', JSON.stringify(cart));
    } catch {
      // Keep the current cart in memory.
    }
    const quantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.querySelector('#cart-count');
    badge.textContent = quantity || '';
    badge.hidden = quantity === 0;
  }

  function addProduct(id, quantity) {
    const line = cart.find((entry) => entry.id === id);
    if (line) line.quantity = Math.min(99, line.quantity + quantity);
    else cart.push({id, quantity});
    saveCart();
    location.hash = '#carrito';
  }

  function displayPhoto(index) {
    activePhoto = (index + activeGroup.length) % activeGroup.length;
    const selected = activeGroup[activePhoto];
    const picture = lightbox.querySelector('img');
    picture.src = assets(selected.file);
    picture.alt = selected.label;
    lightbox.querySelector('#photo-caption').textContent = selected.label;
    lightbox.querySelector('#photo-count').textContent = `${activePhoto + 1} / ${activeGroup.length}`;
    for (const button of lightbox.querySelectorAll('[data-action]:not([data-action="close"])')) button.hidden = activeGroup.length === 1;
  }

  main.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-farm-gallery')) {
      const heading = main.querySelector('.farm-gallery h2');
      heading.focus({preventScroll: true});
      heading.scrollIntoView({block: 'start'});
      return;
    }
    if (button.hasAttribute('data-shop')) { location.hash = '#tienda'; return; }
    const {gallery, photo, add, remove} = button.dataset;
    if (gallery !== undefined) {
      activeGroup = groups[Number(gallery)];
      returnFocus = button;
      displayPhoto(Number(photo));
      lightbox.showModal();
    }
    if (add !== undefined) addProduct(Number(add), 1);
    if (remove !== undefined) {
      cart = cart.filter((entry) => entry.id !== Number(remove));
      saveCart();
      render(true);
    }
  });

  main.addEventListener('change', (event) => {
    const field = event.target;
    if (field.id === 'sort') {
      const sorted = [...products];
      if (field.value === 'asc') sorted.sort((a, b) => a.min - b.min);
      if (field.value === 'desc') sorted.sort((a, b) => b.min - a.min);
      if (field.value === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name, 'es'));
      document.querySelector('#results').innerHTML = productGrid(sorted);
    }
    if (field.dataset.quantity !== undefined) {
      const item = cart.find((entry) => entry.id === Number(field.dataset.quantity));
      if (!field.checkValidity() || !field.valueAsNumber) {
        field.value = item.quantity;
        return;
      }
      item.quantity = field.valueAsNumber;
      saveCart();
      const scrollY = window.scrollY;
      render();
      const replacement = main.querySelector(`[data-quantity="${item.id}"]`);
      replacement.focus({preventScroll: true});
      window.scrollTo(0, scrollY);
    }
  });

  main.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target;
    const values = new FormData(form);
    if (form.dataset.product !== undefined) addProduct(Number(form.dataset.product), Number(values.get('quantity')));
    if (form.id === 'order') {
      const order = cart.map((item) => `- ${item.quantity} × ${products[item.id].name}`).join('\n');
      const message = `Hola, me gustaría consultar por este pedido:\n\n${order}\n\nNombre: ${values.get('name')}\nCorreo: ${values.get('email')}`;
      window.location.href = `mailto:${email}?subject=Consulta%20de%20pedido%20Sagaz%20Coffee&body=${encodeURIComponent(message)}`;
    }
  });

  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target) && !menu.contains(event.target)) closeMenu();
    const link = event.target.closest('a');
    if (link && nav.contains(link) && link.hash === location.hash) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !lightbox.open) closeMenu();
    if (!lightbox.open) return;
    if (event.key === 'ArrowLeft') displayPhoto(activePhoto - 1);
    if (event.key === 'ArrowRight') displayPhoto(activePhoto + 1);
  });
  lightbox.addEventListener('click', (event) => {
    const action = event.target.dataset.action;
    if (event.target === lightbox || action === 'close') lightbox.close();
    if (action === 'previous') displayPhoto(activePhoto - 1);
    if (action === 'next') displayPhoto(activePhoto + 1);
  });
  lightbox.addEventListener('close', () => returnFocus?.focus());
  backTop.addEventListener('click', () => window.scrollTo(0, 0));
  window.addEventListener('scroll', () => { backTop.hidden = window.scrollY < 240; }, {passive: true});
  window.addEventListener('hashchange', () => render(true));
  saveCart();
  render();
})();







