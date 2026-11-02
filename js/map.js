/**
 * ERATLAS - Motor Cartográfico Vectorial Interactivo
 * Renderizado en SVG nativo basado en geometrías IGN
 */

import { formatNumber, formatPercent, formatDensity } from './data.js';

let svgElement = null;
let currentLayer = 'base';
let selectedDeptId = null;
let onSelectCallback = null;
let departmentsList = [];
let showLabels = true;

// Estado de Zoom y Pan
let zoomLevel = 1.0;
let panX = 0;
let panY = 0;
let isPanning = false;
let startPanX = 0;
let startPanY = 0;

const LAYER_CONFIG = {
  base: {
    id: 'base',
    title: 'División Departamental',
    unit: '17 Unidades Administrativas',
    legend: [
      { color: '#E2E8F0', label: 'Límites Departamentales IGN' }
    ],
    getColor: () => '#E2E8F0',
    getValueText: (dept) => `Cabecera: ${dept.cabecera}`
  },
  densidad: {
    id: 'densidad',
    title: 'Densidad Poblacional',
    unit: 'hab/km² (Censo 2022)',
    legend: [
      { color: '#E0F2FE', label: '< 6' },
      { color: '#BAE6FD', label: '6 - 12' },
      { color: '#38BDF8', label: '12 - 20' },
      { color: '#0284C7', label: '20 - 30' },
      { color: '#0369A1', label: '> 50' }
    ],
    getColor: (dept) => {
      const d = dept.densidad_hab_km2;
      if (d < 6) return '#E0F2FE';
      if (d < 12) return '#BAE6FD';
      if (d < 20) return '#38BDF8';
      if (d < 30) return '#0284C7';
      return '#0369A1';
    },
    getValueText: (dept) => `${formatDensity(dept.densidad_hab_km2)} (N° ${dept.posicion_ranking_densidad})`
  },
  poblacion: {
    id: 'poblacion',
    title: 'Población Absoluta',
    unit: 'habitantes (Censo 2022)',
    legend: [
      { color: '#E2E8F0', label: '< 25k' },
      { color: '#CBD5E1', label: '25k - 50k' },
      { color: '#94A3B8', label: '50k - 80k' },
      { color: '#64748B', label: '80k - 150k' },
      { color: '#1E293B', label: '> 150k' }
    ],
    getColor: (dept) => {
      const p = dept.poblacion_2022;
      if (p < 25000) return '#E2E8F0';
      if (p < 50000) return '#CBD5E1';
      if (p < 80000) return '#94A3B8';
      if (p < 150000) return '#64748B';
      return '#1E293B';
    },
    getValueText: (dept) => `${formatNumber(dept.poblacion_2022)} hab. (${dept.porcentaje_provincial}%)`
  },
  crecimiento: {
    id: 'crecimiento',
    title: 'Crecimiento Intercensal',
    unit: 'Variación % (2010 - 2022)',
    legend: [
      { color: '#FEF3C7', label: '< 12%' },
      { color: '#FDE68A', label: '12% - 14.5%' },
      { color: '#FBBF24', label: '14.5% - 16%' },
      { color: '#F59E0B', label: '16% - 19%' },
      { color: '#D97706', label: '> 19%' }
    ],
    getColor: (dept) => {
      const c = dept.variacion_2010_2022_pct;
      if (c < 12.0) return '#FEF3C7';
      if (c < 14.5) return '#FDE68A';
      if (c < 16.0) return '#FBBF24';
      if (c < 19.0) return '#F59E0B';
      return '#D97706';
    },
    getValueText: (dept) => `${formatPercent(dept.variacion_2010_2022_pct)} respecto a 2010`
  }
};

/**
 * Inicializa el mapa interactivo en el contenedor dado
 */
export function initMap(containerId, departments, mapConfig, onSelect) {
  departmentsList = departments;
  onSelectCallback = onSelect;

  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  // Crear elemento SVG
  const svgNS = 'http://www.w3.org/2000/svg';
  svgElement = document.createElementNS(svgNS, 'svg');
  svgElement.setAttribute('viewBox', mapConfig.viewBox);
  svgElement.setAttribute('class', 'interactive-map-svg');
  svgElement.setAttribute('id', 'entre-rios-svg');

  // Grupo transformable para Zoom y Pan
  const gMain = document.createElementNS(svgNS, 'g');
  gMain.setAttribute('id', 'map-main-group');

  // Grupo de Polígonos de Departamentos
  const gPolygons = document.createElementNS(svgNS, 'g');
  gPolygons.setAttribute('id', 'map-polygons-group');

  departments.forEach(dept => {
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', dept.svg_path);
    path.setAttribute('id', `poly-${dept.id}`);
    path.setAttribute('data-id', dept.id);
    path.setAttribute('data-name', dept.nombre);
    path.setAttribute('class', 'dept-polygon layer-base');
    path.setAttribute('fill', '#E2E8F0');

    // Eventos de interacción
    path.addEventListener('mouseenter', (e) => handleDeptHover(dept, e));
    path.addEventListener('mousemove', (e) => updateTooltipPos(e));
    path.addEventListener('mouseleave', () => handleDeptLeave());
    path.addEventListener('click', () => selectDepartment(dept.id, true));

    gPolygons.appendChild(path);
  });

  // Grupo de Etiquetas Textuales de Cabeceras/Departamentos
  const gLabels = document.createElementNS(svgNS, 'g');
  gLabels.setAttribute('id', 'map-labels-group');
  gLabels.setAttribute('class', 'dept-labels-group');

  departments.forEach(dept => {
    const text = document.createElementNS(svgNS, 'text');
    text.setAttribute('x', dept.centroid_x);
    text.setAttribute('y', dept.centroid_y);
    text.setAttribute('id', `label-${dept.id}`);
    text.setAttribute('class', 'dept-text-label');
    text.textContent = dept.nombre;
    gLabels.appendChild(text);
  });

  gMain.appendChild(gPolygons);
  gMain.appendChild(gLabels);
  svgElement.appendChild(gMain);
  container.appendChild(svgElement);

  // Inicializar eventos de Zoom y Pan
  initZoomPan(container, gMain);

  // Crear tooltip flotante
  initTooltip(container);

  // Renderizar la leyenda inicial
  updateLegend();
}

/**
 * Aplica una capa coroplética temática
 */
export function setLayer(layerKey) {
  if (!LAYER_CONFIG[layerKey]) return;
  currentLayer = layerKey;

  const cfg = LAYER_CONFIG[layerKey];
  departmentsList.forEach(dept => {
    const poly = document.getElementById(`poly-${dept.id}`);
    if (poly) {
      poly.setAttribute('fill', cfg.getColor(dept));
    }
  });

  updateLegend();
}

/**
 * Selecciona visualmente un departamento
 */
export function selectDepartment(deptId, triggerCallback = false) {
  if (!deptId) return;
  selectedDeptId = deptId.toLowerCase().trim();

  // Actualizar clases de polígonos
  departmentsList.forEach(dept => {
    const poly = document.getElementById(`poly-${dept.id}`);
    const label = document.getElementById(`label-${dept.id}`);
    if (poly) {
      if (dept.id === selectedDeptId) {
        poly.classList.add('is-selected');
        // Elevar elemento al tope de su grupo SVG
        poly.parentNode.appendChild(poly);
        if (label) {
          label.classList.remove('is-dimmed');
          label.parentNode.appendChild(label);
        }
      } else {
        poly.classList.remove('is-selected');
        if (label) label.classList.add('is-dimmed');
      }
    }
  });

  if (triggerCallback && onSelectCallback) {
    onSelectCallback(selectedDeptId);
  }
}

/**
 * Restablece la selección (muestra todos los departamentos)
 */
export function clearSelection() {
  selectedDeptId = null;
  departmentsList.forEach(dept => {
    const poly = document.getElementById(`poly-${dept.id}`);
    const label = document.getElementById(`label-${dept.id}`);
    if (poly) poly.classList.remove('is-selected');
    if (label) label.classList.remove('is-dimmed');
  });
}

/**
 * Alterna la visualización de etiquetas
 */
export function toggleLabels() {
  showLabels = !showLabels;
  const labelsGroup = document.getElementById('map-labels-group');
  if (labelsGroup) {
    labelsGroup.style.display = showLabels ? 'block' : 'none';
  }
  return showLabels;
}

/**
 * Controles de Zoom y Pan
 */
function initZoomPan(container, gMain) {
  function applyTransform() {
    gMain.setAttribute('transform', `translate(${panX}, ${panY}) scale(${zoomLevel})`);
  }

  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newZoom = Math.min(Math.max(zoomLevel * zoomFactor, 0.9), 3.5);
    zoomLevel = newZoom;
    applyTransform();
  }, { passive: false });

  container.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isPanning = true;
    startPanX = e.clientX - panX;
    startPanY = e.clientY - panY;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    panX = e.clientX - startPanX;
    panY = e.clientY - startPanY;
    applyTransform();
  });

  window.addEventListener('mouseup', () => {
    isPanning = false;
  });

  // Exportar controles para botones de UI
  window.mapZoomIn = () => {
    zoomLevel = Math.min(zoomLevel * 1.25, 3.5);
    applyTransform();
  };

  window.mapZoomOut = () => {
    zoomLevel = Math.max(zoomLevel * 0.8, 0.9);
    applyTransform();
  };

  window.mapResetView = () => {
    zoomLevel = 1.0;
    panX = 0;
    panY = 0;
    applyTransform();
    clearSelection();
  };
}

/**
 * Tooltip Flotante
 */
let tooltipEl = null;

function initTooltip(container) {
  tooltipEl = document.createElement('div');
  tooltipEl.className = 'map-tooltip';
  tooltipEl.id = 'map-tooltip';
  container.appendChild(tooltipEl);
}

function handleDeptHover(dept, e) {
  if (!tooltipEl) return;
  const cfg = LAYER_CONFIG[currentLayer];
  const valText = cfg.getValueText(dept);

  tooltipEl.innerHTML = `
    <div class="tooltip-dept-name">${dept.nombre}</div>
    <div class="tooltip-dept-val">${valText}</div>
  `;
  tooltipEl.classList.add('is-visible');
  updateTooltipPos(e);
}

function updateTooltipPos(e) {
  if (!tooltipEl) return;
  const container = tooltipEl.parentElement;
  const rect = container.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  tooltipEl.style.left = `${x}px`;
  tooltipEl.style.top = `${y}px`;
}

function handleDeptLeave() {
  if (tooltipEl) {
    tooltipEl.classList.remove('is-visible');
  }
}

/**
 * Actualiza la leyenda en la UI
 */
function updateLegend() {
  const legendWrap = document.getElementById('map-legend-container');
  if (!legendWrap) return;

  const cfg = LAYER_CONFIG[currentLayer];
  let html = `
    <div class="legend-title-wrap">
      <span class="legend-title">${cfg.title}</span>
      <span class="legend-unit">${cfg.unit}</span>
    </div>
    <div class="legend-ramp">
  `;

  cfg.legend.forEach(item => {
    html += `
      <div class="legend-step" title="${item.label}">
        <div class="legend-color-box" style="background-color: ${item.color};"></div>
        <span class="legend-step-label">${item.label}</span>
      </div>
    `;
  });

  html += `</div>`;
  legendWrap.innerHTML = html;
}
