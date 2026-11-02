/**
 * ERATLAS - Galería Territorial y Visor Editorial
 * Soporte para epígrafes editables y adición futura de fotografías
 */

let modalElement = null;

/**
 * Renderiza la grilla de la galería territorial
 */
export function initGallery(galleryItems) {
  const container = document.getElementById('gallery-items-grid');
  if (!container) return;

  container.innerHTML = '';

  galleryItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'gallery-card';

    card.innerHTML = `
      <div class="gallery-thumb-wrap" title="Clic para ampliar">
        <img class="gallery-img" src="${item.archivo_imagen}" alt="${item.titulo}" loading="lazy" />
      </div>
      <div class="gallery-body">
        <span class="gallery-category-badge">${item.categoria}</span>
        <h4 class="gallery-title">${item.titulo}</h4>
        <p class="gallery-caption">${item.epigrafe}</p>
        <span class="gallery-edit-hint">Epígrafe editable en data/entre-rios-data.json</span>
      </div>
    `;

    // Clic para abrir el modal
    card.querySelector('.gallery-thumb-wrap').addEventListener('click', () => {
      openGalleryModal(item);
    });

    container.appendChild(card);
  });

  initModal();
}

/**
 * Inicializa el elemento modal / lightbox
 */
function initModal() {
  modalElement = document.getElementById('gallery-modal');
  if (!modalElement) {
    modalElement = document.createElement('div');
    modalElement.className = 'gallery-modal';
    modalElement.id = 'gallery-modal';
    modalElement.innerHTML = `
      <div class="modal-content-box">
        <button class="modal-close-btn" id="modal-close-btn" aria-label="Cerrar modal">&times;</button>
        <div class="modal-image-holder">
          <img id="modal-img" src="" alt="" />
        </div>
        <div class="modal-caption-body">
          <span class="gallery-category-badge" id="modal-category"></span>
          <h3 class="gallery-title" id="modal-title" style="font-size: var(--text-md);"></h3>
          <p class="gallery-caption" id="modal-caption" style="font-size: var(--text-sm);"></p>
        </div>
      </div>
    `;
    document.body.appendChild(modalElement);
  }

  // Cerrar al hacer clic en el botón o fuera
  const closeBtn = document.getElementById('modal-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeGalleryModal);
  }

  modalElement.addEventListener('click', (e) => {
    if (e.target === modalElement) {
      closeGalleryModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalElement.classList.contains('is-open')) {
      closeGalleryModal();
    }
  });
}

/**
 * Abre el modal con el elemento seleccionado
 */
function openGalleryModal(item) {
  if (!modalElement) return;

  const img = document.getElementById('modal-img');
  const cat = document.getElementById('modal-category');
  const title = document.getElementById('modal-title');
  const caption = document.getElementById('modal-caption');

  if (img) {
    img.src = item.archivo_imagen;
    img.alt = item.titulo;
  }
  if (cat) cat.textContent = item.categoria;
  if (title) title.textContent = item.titulo;
  if (caption) caption.textContent = item.epigrafe;

  modalElement.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

/**
 * Cierra el modal
 */
function closeGalleryModal() {
  if (!modalElement) return;
  modalElement.classList.remove('is-open');
  document.body.style.overflow = '';
}
