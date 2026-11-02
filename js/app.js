/**
 * ERATLAS - Aplicación Principal y Motor Cartográfico
 * Modo Claro / Modo Oscuro, Cartografía Regional y Datos Oficiales
 * Fuentes: INDEC Censo 2022 / DGEC Entre Ríos / IGN
 */

(function () {
  'use strict';

  // ============================================================================
  // ESTADO GLOBAL DE LA APLICACIÓN
  // ============================================================================
  let dataset = null;
  let currentLayer = 'base';
  let selectedDeptId = null;
  let showLabels = true;
  let currentRankingMetric = 'poblacion';

  // Estado de Zoom y Pan en el mapa
  let zoomLevel = 1.0;
  let panX = 0;
  let panY = 0;
  let isPanning = false;
  let startPanX = 0;
  let startPanY = 0;

  let svgElement = null;
  let gMainGroup = null;
  let tooltipElement = null;

  // ============================================================================
  // GESTIÓN DEL MODO OSCURO (THEME SWITCHER)
  // ============================================================================
  function isDarkMode() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function initTheme() {
    const urlParams = new URLSearchParams(window.location.search);
    const themeParam = urlParams.get('theme');
    const savedTheme = localStorage.getItem('eratlas-theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = themeParam || savedTheme || (prefersDark ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', initialTheme);

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleTheme);
    }
  }

  function toggleTheme() {
    const newTheme = isDarkMode() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('eratlas-theme', newTheme);

    // Re-aplicar colores de la capa activa en el mapa
    setLayer(currentLayer);
  }

  // ============================================================================
  // CONFIGURACIÓN DE CAPAS COROPLÉTICAS Y BASE REGIONAL
  // ============================================================================
  const LAYER_CONFIG = {
    base: {
      id: 'base',
      title: 'Regiones geográficas',
      unit: '5 áreas territoriales',
      getLegend: () => {
        const dark = isDarkMode();
        return [
          { color: dark ? '#0284C7' : '#7DD3FC', label: 'Costa Uruguay' },
          { color: dark ? '#C2410C' : '#FED7AA', label: 'Costa Paraná' },
          { color: dark ? '#047857' : '#BBF7D0', label: 'Centro' },
          { color: dark ? '#A16207' : '#FEF08A', label: 'Norte' },
          { color: dark ? '#0F766E' : '#99F6E4', label: 'Delta' }
        ];
      },
      getColor: (d) => {
        const dark = isDarkMode();
        switch (d.region) {
          case 'costa_uruguay': return dark ? '#0284C7' : '#7DD3FC';
          case 'costa_parana':  return dark ? '#C2410C' : '#FED7AA';
          case 'centro':        return dark ? '#047857' : '#BBF7D0';
          case 'norte':         return dark ? '#A16207' : '#FEF08A';
          case 'delta':         return dark ? '#0F766E' : '#99F6E4';
          default:              return dark ? '#334155' : '#E2E8F0';
        }
      },
      getValueText: (d) => `Capital: ${d.capital} · Región: ${d.region_nombre}`
    },
    densidad: {
      id: 'densidad',
      title: 'Densidad de población',
      unit: 'hab/km² (Censo 2022)',
      getLegend: () => {
        const dark = isDarkMode();
        return [
          { color: dark ? '#1E293B' : '#E0F2FE', label: '< 6' },
          { color: dark ? '#0369A1' : '#BAE6FD', label: '6 - 12' },
          { color: dark ? '#0284C7' : '#38BDF8', label: '12 - 20' },
          { color: dark ? '#38BDF8' : '#0284C7', label: '20 - 30' },
          { color: dark ? '#BAE6FD' : '#0369A1', label: '> 50' }
        ];
      },
      getColor: (d) => {
        const dark = isDarkMode();
        const val = d.densidad_hab_km2;
        if (val < 6)  return dark ? '#1E293B' : '#E0F2FE';
        if (val < 12) return dark ? '#0369A1' : '#BAE6FD';
        if (val < 20) return dark ? '#0284C7' : '#38BDF8';
        if (val < 30) return dark ? '#38BDF8' : '#0284C7';
        return dark ? '#BAE6FD' : '#0369A1';
      },
      getValueText: (d) => `${formatDensity(d.densidad_hab_km2)} (N° ${d.posicion_ranking_densidad} provincial)`
    },
    poblacion: {
      id: 'poblacion',
      title: 'Población total',
      unit: 'habitantes (Censo 2022)',
      getLegend: () => {
        const dark = isDarkMode();
        return [
          { color: dark ? '#1E293B' : '#E2E8F0', label: '< 25k' },
          { color: dark ? '#334155' : '#CBD5E1', label: '25k - 50k' },
          { color: dark ? '#475569' : '#94A3B8', label: '50k - 80k' },
          { color: dark ? '#64748B' : '#64748B', label: '80k - 150k' },
          { color: dark ? '#94A3B8' : '#1E293B', label: '> 150k' }
        ];
      },
      getColor: (d) => {
        const dark = isDarkMode();
        const val = d.poblacion_2022;
        if (val < 25000)  return dark ? '#1E293B' : '#E2E8F0';
        if (val < 50000)  return dark ? '#334155' : '#CBD5E1';
        if (val < 80000)  return dark ? '#475569' : '#94A3B8';
        if (val < 150000) return dark ? '#64748B' : '#64748B';
        return dark ? '#94A3B8' : '#1E293B';
      },
      getValueText: (d) => `${formatNumber(d.poblacion_2022)} habitantes (${d.porcentaje_provincial}%)`
    },
    viviendas: {
      id: 'viviendas',
      title: 'Parque de viviendas particulares',
      unit: 'viviendas (Censo 2022)',
      getLegend: () => {
        const dark = isDarkMode();
        return [
          { color: dark ? '#064E3B' : '#D1FAE5', label: '< 15k' },
          { color: dark ? '#047857' : '#A7F3D0', label: '15k - 30k' },
          { color: dark ? '#059669' : '#6EE7B7', label: '30k - 45k' },
          { color: dark ? '#10B981' : '#34D399', label: '45k - 80k' },
          { color: dark ? '#6EE7B7' : '#059669', label: '> 80k' }
        ];
      },
      getColor: (d) => {
        const dark = isDarkMode();
        const val = d.viviendas_particulares;
        if (val < 15000) return dark ? '#064E3B' : '#D1FAE5';
        if (val < 30000) return dark ? '#047857' : '#A7F3D0';
        if (val < 45000) return dark ? '#059669' : '#6EE7B7';
        if (val < 80000) return dark ? '#10B981' : '#34D399';
        return dark ? '#6EE7B7' : '#059669';
      },
      getValueText: (d) => `${formatNumber(d.viviendas_particulares)} viviendas particulares (${d.personas_por_hogar} pers/hogar)`
    },
    crecimiento: {
      id: 'crecimiento',
      title: 'Variación intercensal',
      unit: 'Crecimiento porcentual 2010 - 2022',
      getLegend: () => {
        const dark = isDarkMode();
        return [
          { color: dark ? '#78350F' : '#FEF3C7', label: '< 12%' },
          { color: dark ? '#B45309' : '#FDE68A', label: '12% - 14.5%' },
          { color: dark ? '#D97706' : '#FBBF24', label: '14.5% - 16%' },
          { color: dark ? '#F59E0B' : '#F59E0B', label: '16% - 19%' },
          { color: dark ? '#FDE68A' : '#D97706', label: '> 19%' }
        ];
      },
      getColor: (d) => {
        const dark = isDarkMode();
        const val = d.variacion_2010_2022_pct;
        if (val < 12.0) return dark ? '#78350F' : '#FEF3C7';
        if (val < 14.5) return dark ? '#B45309' : '#FDE68A';
        if (val < 16.0) return dark ? '#D97706' : '#FBBF24';
        if (val < 19.0) return dark ? '#F59E0B' : '#F59E0B';
        return dark ? '#FDE68A' : '#D97706';
      },
      getValueText: (d) => `${formatPercent(d.variacion_2010_2022_pct)} respecto a 2010`
    }
  };

  // ============================================================================
  // UTILIDADES DE FORMATEO
  // ============================================================================
  function formatNumber(num) {
    if (num === null || num === undefined) return 'S/D';
    return new Intl.NumberFormat('es-AR').format(num);
  }

  function formatPercent(val, decimals = 1) {
    if (val === null || val === undefined) return 'S/D';
    return `${val > 0 ? '+' : ''}${val.toFixed(decimals)}%`;
  }

  function formatDensity(dens) {
    if (dens === null || dens === undefined) return 'S/D';
    return `${dens.toFixed(1).replace('.', ',')} hab/km²`;
  }

  // ============================================================================
  // CARGA DE DATOS
  // ============================================================================
  async function initializeData() {
    if (window.ERATLAS_DATA) {
      dataset = window.ERATLAS_DATA;
      return dataset;
    }
    try {
      const response = await fetch('./data/entre-rios-data.json');
      if (response.ok) {
        dataset = await response.json();
        return dataset;
      }
    } catch (e) {
      console.warn('Carga remota no disponible, usando dataset integrado:', e);
    }
    throw new Error('No fue posible cargar el dataset de Entre Ríos.');
  }

  // ============================================================================
  // INICIALIZACIÓN GENERAL AL CARGAR EL DOM
  // ============================================================================
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      // 0. Inicializar tema (modo claro / oscuro)
      initTheme();

      // 1. Cargar datos
      await initializeData();

      const provincia = dataset.provincia;
      const departamentos = dataset.departamentos;
      const mapaConfig = dataset.mapa_svg;

      // 2. Indicadores en portada
      renderHeroIndicators(provincia);

      // 3. Renderizar mapa SVG
      renderMap(departamentos, mapaConfig);

      // 4. Vincular controles del mapa
      bindMapControls(departamentos);

      // 5. Inicializar ficha técnica con el departamento Paraná
      updateDepartmentCard('parana');

      // 6. Inicializar gráficos demográficos
      renderRankingChart('poblacion');
      renderIntercensalChart(departamentos, provincia, 'parana');
      renderUrbanRuralChart(departamentos);
      renderAgePyramid(provincia);
      renderConcentrationCard(departamentos, provincia);
      bindChartControls(departamentos, provincia);

      // 7. Inicializar comparador de departamentos
      initDepartmentComparator(departamentos);

      // 8. Inicializar pestañas institucionales
      initAboutTabs();

      // 9. Inicializar navegación y scroll
      initNavigation();

      // 10. Comprobar capa inicial por parámetro de consulta (?layer=...)
      const urlParams = new URLSearchParams(window.location.search);
      const initialLayer = urlParams.get('layer');
      if (initialLayer && ['densidad', 'poblacion', 'viviendas', 'crecimiento', 'base'].includes(initialLayer)) {
        const btn = document.querySelector(`.layer-btn[data-layer="${initialLayer}"]`);
        if (btn) btn.click();
      }

    } catch (err) {
      console.error('Error durante la inicialización de ERATLAS:', err);
    }
  });

  // ============================================================================
  // 1. INDICADORES EN PORTADA
  // ============================================================================
  function renderHeroIndicators(provincia) {
    const elPop = document.getElementById('hero-stat-pop');
    const elSurf = document.getElementById('hero-stat-surface');
    const elDens = document.getElementById('hero-stat-density');
    const elDepts = document.getElementById('hero-stat-depts');

    if (elPop) elPop.textContent = formatNumber(provincia.poblacion_total_2022);
    if (elSurf) elSurf.textContent = `${formatNumber(Math.round(provincia.superficie_total_km2))} km²`;
    if (elDens) elDens.textContent = `${provincia.densidad_media_hab_km2.toString().replace('.', ',')} hab/km²`;
    if (elDepts) elDepts.textContent = provincia.total_departamentos;
  }

  // ============================================================================
  // 2. MOTOR DEL MAPA SVG INTERACTIVO
  // ============================================================================
  function renderMap(departamentos, mapaConfig) {
    const container = document.getElementById('map-svg-container');
    if (!container) return;

    // Preservar o asegurar la escala gráfica dentro del lienzo SVG
    const existingScale = container.querySelector('.map-scale-bar');
    container.innerHTML = '';

    const svgNS = 'http://www.w3.org/2000/svg';
    svgElement = document.createElementNS(svgNS, 'svg');
    svgElement.setAttribute('viewBox', mapaConfig.viewBox);
    svgElement.setAttribute('class', 'interactive-map-svg');
    svgElement.setAttribute('id', 'entre-rios-svg');

    gMainGroup = document.createElementNS(svgNS, 'g');
    gMainGroup.setAttribute('id', 'map-main-group');

    // Rótulos fluviales limítrofes (Río Paraná al oeste, Río Uruguay al este)
    const gRivers = document.createElementNS(svgNS, 'g');
    gRivers.setAttribute('id', 'map-rivers-group');

    const textParana = document.createElementNS(svgNS, 'text');
    textParana.setAttribute('x', '22');
    textParana.setAttribute('y', '420');
    textParana.setAttribute('transform', 'rotate(-90 22 420)');
    textParana.setAttribute('class', 'river-label-text');
    textParana.textContent = '← RÍO PARANÁ';
    gRivers.appendChild(textParana);

    const textUruguay = document.createElementNS(svgNS, 'text');
    textUruguay.setAttribute('x', '516');
    textUruguay.setAttribute('y', '380');
    textUruguay.setAttribute('transform', 'rotate(90 516 380)');
    textUruguay.setAttribute('class', 'river-label-text');
    textUruguay.textContent = 'RÍO URUGUAY →';
    gRivers.appendChild(textUruguay);

    // Grupo de polígonos
    const gPolygons = document.createElementNS(svgNS, 'g');
    gPolygons.setAttribute('id', 'map-polygons-group');

    departamentos.forEach(dept => {
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', dept.svg_path);
      path.setAttribute('id', `poly-${dept.id}`);
      path.setAttribute('data-id', dept.id);
      path.setAttribute('data-name', dept.nombre);
      path.setAttribute('class', 'dept-polygon');
      path.setAttribute('fill', LAYER_CONFIG.base.getColor(dept));

      path.addEventListener('mouseenter', (e) => handleDeptHover(dept, e));
      path.addEventListener('mousemove', (e) => updateTooltipPos(e));
      path.addEventListener('mouseleave', handleDeptLeave);
      path.addEventListener('click', () => selectDepartment(dept.id, true));

      gPolygons.appendChild(path);
    });

    // Grupo de etiquetas departamentales
    const gLabels = document.createElementNS(svgNS, 'g');
    gLabels.setAttribute('id', 'map-labels-group');
    gLabels.setAttribute('class', 'dept-labels-group');

    departamentos.forEach(dept => {
      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', dept.centroid_x);
      text.setAttribute('y', dept.centroid_y);
      text.setAttribute('id', `label-${dept.id}`);
      text.setAttribute('class', 'dept-text-label');
      text.textContent = dept.nombre;
      gLabels.appendChild(text);
    });

    gMainGroup.appendChild(gRivers);
    gMainGroup.appendChild(gPolygons);
    gMainGroup.appendChild(gLabels);
    svgElement.appendChild(gMainGroup);
    container.appendChild(svgElement);

    // Escala gráfica integrada en el lienzo
    if (existingScale) {
      container.appendChild(existingScale);
    } else {
      const scaleBar = document.createElement('div');
      scaleBar.className = 'map-scale-bar';
      scaleBar.setAttribute('aria-hidden', 'true');
      scaleBar.innerHTML = `
        <div class="scale-ticks"></div>
        <span>0 &nbsp; &nbsp; 30 &nbsp; &nbsp; 60 km</span>
      `;
      container.appendChild(scaleBar);
    }

    // Controles de zoom y arrastre
    initZoomPan(container, gMainGroup);

    // Tooltip
    initTooltip(container);

    // HUD Chip
    initHudChip(container);

    // Leyenda
    updateLegend();
  }

  function handleDeptHover(dept, e) {
    if (!tooltipElement) return;
    const cfg = LAYER_CONFIG[currentLayer];
    const valText = cfg.getValueText(dept);

    tooltipElement.innerHTML = `
      <div class="tooltip-dept-name">${dept.nombre}</div>
      <div class="tooltip-dept-val">${valText}</div>
    `;
    tooltipElement.classList.add('is-visible');
    updateTooltipPos(e);
  }

  function updateTooltipPos(e) {
    if (!tooltipElement) return;
    const container = tooltipElement.parentElement;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    tooltipElement.style.left = `${x}px`;
    tooltipElement.style.top = `${y}px`;
  }

  function handleDeptLeave() {
    if (tooltipElement) {
      tooltipElement.classList.remove('is-visible');
    }
  }

  function initTooltip(container) {
    tooltipElement = document.getElementById('map-tooltip');
    if (!tooltipElement) {
      tooltipElement = document.createElement('div');
      tooltipElement.className = 'map-tooltip';
      tooltipElement.id = 'map-tooltip';
      container.appendChild(tooltipElement);
    }
  }

  function initHudChip(container) {
    let hud = document.getElementById('map-hud-chip');
    if (!hud) {
      hud = document.createElement('div');
      hud.className = 'map-hud-chip';
      hud.id = 'map-hud-chip';
      hud.innerHTML = `
        <span class="hud-dept-text" id="hud-dept-title">Paraná</span>
        <span class="hud-metrics-text" id="hud-dept-stats">Capital: Paraná · 391.696 hab</span>
      `;
      container.appendChild(hud);
    }
  }

  function updateHudChip(dept) {
    const elTitle = document.getElementById('hud-dept-title');
    const elStats = document.getElementById('hud-dept-stats');
    if (elTitle) elTitle.textContent = dept.nombre;
    if (elStats) elStats.textContent = `Capital: ${dept.capital} · ${formatNumber(dept.poblacion_2022)} hab (${dept.porcentaje_provincial}%)`;
  }

  function initZoomPan(container, gMain) {
    function applyTransform() {
      gMain.setAttribute('transform', `translate(${panX}, ${panY}) scale(${zoomLevel})`);
    }

    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      zoomLevel = Math.min(Math.max(zoomLevel * zoomFactor, 0.9), 3.5);
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

  function setLayer(layerKey) {
    if (!LAYER_CONFIG[layerKey] || !dataset) return;
    currentLayer = layerKey;

    const cfg = LAYER_CONFIG[layerKey];
    dataset.departamentos.forEach(dept => {
      const poly = document.getElementById(`poly-${dept.id}`);
      if (poly) {
        poly.setAttribute('fill', cfg.getColor(dept));
      }
    });

    updateLegend();
  }

  function updateLegend() {
    const legendWrap = document.getElementById('map-legend-container');
    if (!legendWrap) return;

    const cfg = LAYER_CONFIG[currentLayer];
    const legendItems = cfg.getLegend();

    let html = `
      <div class="legend-title-wrap">
        <span class="legend-title">${cfg.title}</span>
        <span class="legend-unit">${cfg.unit}</span>
      </div>
      <div class="legend-ramp">
    `;

    legendItems.forEach(item => {
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

  // ============================================================================
  // 3. SELECCIÓN DE DEPARTAMENTO Y FICHA TÉCNICA
  // ============================================================================
  function selectDepartment(deptId, syncExternal = true) {
    if (!deptId || !dataset) return;
    selectedDeptId = deptId.toLowerCase().trim();

    dataset.departamentos.forEach(dept => {
      const poly = document.getElementById(`poly-${dept.id}`);
      const label = document.getElementById(`label-${dept.id}`);
      if (poly) {
        if (dept.id === selectedDeptId) {
          poly.classList.add('is-selected');
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

    updateDepartmentCard(selectedDeptId);

    const deptObj = dataset.departamentos.find(d => d.id === selectedDeptId);
    if (deptObj) {
      updateHudChip(deptObj);
    }

    if (syncExternal) {
      const select = document.getElementById('dept-search-select');
      if (select) select.value = selectedDeptId;
      // Actualiza el ranking sin saltar la ventana:
      highlightRankingItem(selectedDeptId);
    }
  }

  function clearSelection() {
    selectedDeptId = null;
    if (!dataset) return;
    dataset.departamentos.forEach(dept => {
      const poly = document.getElementById(`poly-${dept.id}`);
      const label = document.getElementById(`label-${dept.id}`);
      if (poly) poly.classList.remove('is-selected');
      if (label) label.classList.remove('is-dimmed');
    });

    const select = document.getElementById('dept-search-select');
    if (select) select.value = '';
    updateDepartmentCard('parana');

    const paranaObj = dataset.departamentos.find(d => d.id === 'parana');
    if (paranaObj) updateHudChip(paranaObj);
  }

  function updateDepartmentCard(deptId) {
    if (!dataset) return;
    const dept = dataset.departamentos.find(d => d.id === deptId);
    if (!dept) return;

    // Encabezado
    const elTitle = document.getElementById('card-dept-name');
    const elCapital = document.getElementById('card-dept-capital');
    const elRankPop = document.getElementById('card-rank-pop');
    const elRankDens = document.getElementById('card-rank-dens');

    if (elTitle) elTitle.textContent = dept.nombre;
    if (elCapital) elCapital.textContent = dept.capital;
    if (elRankPop) elRankPop.textContent = `N° ${dept.posicion_ranking_poblacion} en población`;
    if (elRankDens) elRankDens.textContent = `N° ${dept.posicion_ranking_densidad} en densidad`;

    // Métricas del Censo 2022
    const elPop = document.getElementById('card-val-pop');
    const elPopSub = document.getElementById('card-sub-pop');
    const elSurf = document.getElementById('card-val-surf');
    const elDens = document.getElementById('card-val-dens');
    const elGrowth = document.getElementById('card-val-growth');

    if (elPop) elPop.textContent = formatNumber(dept.poblacion_2022);
    if (elPopSub) elPopSub.textContent = `${dept.porcentaje_provincial}% de la provincia`;
    if (elSurf) elSurf.textContent = `${formatNumber(Math.round(dept.superficie_km2))} km²`;
    if (elDens) elDens.textContent = formatDensity(dept.densidad_hab_km2);
    if (elGrowth) elGrowth.textContent = formatPercent(dept.variacion_2010_2022_pct);

    // Mini-Barras Intercensales
    const maxPop = dept.poblacion_2022 * 1.05;
    const p01 = Math.round((dept.poblacion_2001 / maxPop) * 100);
    const p10 = Math.round((dept.poblacion_2010 / maxPop) * 100);
    const p22 = Math.round((dept.poblacion_2022 / maxPop) * 100);

    const b01 = document.getElementById('card-bar-2001');
    const b10 = document.getElementById('card-bar-2010');
    const b22 = document.getElementById('card-bar-2022');
    const n01 = document.getElementById('card-num-2001');
    const n10 = document.getElementById('card-num-2010');
    const n22 = document.getElementById('card-num-2022');

    if (b01) b01.style.width = `${p01}%`;
    if (b10) b10.style.width = `${p10}%`;
    if (b22) b22.style.width = `${p22}%`;
    if (n01) n01.textContent = formatNumber(dept.poblacion_2001);
    if (n10) n10.textContent = formatNumber(dept.poblacion_2010);
    if (n22) n22.textContent = formatNumber(dept.poblacion_2022);

    // Localidades
    const localCloud = document.getElementById('card-localidades-cloud');
    if (localCloud && dept.localidades) {
      localCloud.innerHTML = dept.localidades.map(loc => {
        const isCap = loc.toLowerCase().includes(dept.capital.toLowerCase()) || loc === dept.capital;
        return `<span class="localidad-chip ${isCap ? 'is-capital' : ''}">${loc}</span>`;
      }).join('');
    }

    // Perfil del asentamiento
    const elSettlement = document.getElementById('card-settlement-desc');
    if (elSettlement) elSettlement.textContent = dept.perfil_asentamiento;

    // Hogares y estructura habitacional Censo 2022
    const elViviendas = document.getElementById('card-val-viviendas');
    const elPph = document.getElementById('card-val-pph');
    const elUrbanPct = document.getElementById('card-val-urban-pct');
    const elEnvejecimiento = document.getElementById('card-val-envejecimiento');

    if (elViviendas) elViviendas.textContent = formatNumber(dept.viviendas_particulares);
    if (elPph) elPph.textContent = dept.personas_por_hogar ? dept.personas_por_hogar.toFixed(2).replace('.', ',') : 'S/D';
    if (elUrbanPct) elUrbanPct.textContent = dept.urbano_pct ? `${dept.urbano_pct}%` : 'S/D';
    if (elEnvejecimiento) elEnvejecimiento.textContent = dept.indice_envejecimiento ? `${dept.indice_envejecimiento.toFixed(1).replace('.', ',')}%` : 'S/D';

    // Información geográfica
    const elFact = document.getElementById('card-territorial-fact');
    if (elFact) elFact.textContent = dept.dato_territorial;
  }

  // ============================================================================
  // 4. VINCULACIÓN DE CONTROLES DEL MAPA
  // ============================================================================
  function bindMapControls(departamentos) {
    // Selector de capas
    const layerBtns = document.querySelectorAll('.layer-btn');
    layerBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        layerBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const layer = btn.getAttribute('data-layer');
        setLayer(layer);
      });
    });

    // Menú desplegable de departamentos (orden alfabético)
    const select = document.getElementById('dept-search-select');
    if (select) {
      select.innerHTML = '<option value="">Buscar departamento...</option>';
      const sorted = [...departamentos].sort((a, b) => a.nombre.localeCompare(b.nombre));
      sorted.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = `${d.nombre} — Capital: ${d.capital}`;
        select.appendChild(opt);
      });

      select.addEventListener('change', (e) => {
        if (e.target.value) {
          selectDepartment(e.target.value, false);
          highlightRankingItem(e.target.value);
        }
      });
    }

    // Botones de Zoom
    const btnZoomIn = document.getElementById('btn-zoom-in');
    const btnZoomOut = document.getElementById('btn-zoom-out');
    const btnReset = document.getElementById('btn-zoom-reset');
    const btnLabels = document.getElementById('btn-toggle-labels');

    if (btnZoomIn) btnZoomIn.addEventListener('click', () => window.mapZoomIn && window.mapZoomIn());
    if (btnZoomOut) btnZoomOut.addEventListener('click', () => window.mapZoomOut && window.mapZoomOut());
    if (btnReset) btnReset.addEventListener('click', () => window.mapResetView && window.mapResetView());

    if (btnLabels) {
      btnLabels.addEventListener('click', () => {
        showLabels = !showLabels;
        const labelsGroup = document.getElementById('map-labels-group');
        if (labelsGroup) {
          labelsGroup.style.display = showLabels ? 'block' : 'none';
        }
        btnLabels.style.opacity = showLabels ? '1' : '0.5';
      });
    }

    // Botones de la ficha
    const btnResetCard = document.getElementById('card-reset-dept');
    if (btnResetCard) {
      btnResetCard.addEventListener('click', clearSelection);
    }

    const btnJumpCharts = document.getElementById('card-jump-demografia');
    if (btnJumpCharts) {
      btnJumpCharts.addEventListener('click', () => {
        const demog = document.getElementById('demografia');
        if (demog) demog.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  // ============================================================================
  // 5. VISUALIZACIONES DEMOGRÁFICAS
  // ============================================================================
  function renderRankingChart(metric = 'poblacion') {
    const container = document.getElementById('ranking-chart-list');
    if (!container || !dataset) return;

    const depts = [...dataset.departamentos];
    if (metric === 'poblacion') {
      depts.sort((a, b) => b.poblacion_2022 - a.poblacion_2022);
    } else {
      depts.sort((a, b) => b.densidad_hab_km2 - a.densidad_hab_km2);
    }

    const maxVal = metric === 'poblacion' ? depts[0].poblacion_2022 : depts[0].densidad_hab_km2;

    let html = '';
    depts.forEach((dept, index) => {
      const val = metric === 'poblacion' ? dept.poblacion_2022 : dept.densidad_hab_km2;
      const pctWidth = Math.max((val / maxVal) * 100, 2);
      const displayVal = metric === 'poblacion' ? formatNumber(val) : `${val.toFixed(1)} hab/km²`;

      html += `
        <div class="ranking-item" data-id="${dept.id}" title="Seleccionar ${dept.nombre} en el mapa" style="cursor: pointer;">
          <span class="ranking-pos">${index + 1}</span>
          <span class="ranking-label">${dept.nombre}</span>
          <div class="ranking-bar-track">
            <div class="ranking-bar-fill" style="width: ${pctWidth.toFixed(1)}%;"></div>
          </div>
          <span class="ranking-val tabular-nums">${displayVal}</span>
        </div>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.ranking-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        if (id) {
          selectDepartment(id, true);
          const mapSec = document.getElementById('mapa');
          if (mapSec) mapSec.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // FUNCIÓN CORREGIDA: Sin scrollIntoView global para no desplazar la pantalla al hacer clic en el mapa
  function highlightRankingItem(deptId) {
    const container = document.getElementById('ranking-chart-list');
    if (!container) return;

    container.querySelectorAll('.ranking-item').forEach(el => {
      if (el.getAttribute('data-id') === deptId) {
        el.classList.add('is-selected');
        // Desplazamiento exclusivo dentro del scrollbar interno de la lista:
        const targetTop = el.offsetTop - container.offsetTop;
        container.scrollTo({ top: targetTop, behavior: 'smooth' });
      } else {
        el.classList.remove('is-selected');
      }
    });
  }

  function renderIntercensalChart(departments, provincia, targetId = 'provincia') {
    const container = document.getElementById('intercensal-chart-display');
    if (!container) return;

    let label = 'Total provincial de Entre Ríos';
    let p2001, p2010, p2022;

    if (targetId === 'provincia') {
      label = 'Total provincial de Entre Ríos';
      p2001 = provincia.poblacion_total_2001;
      p2010 = provincia.poblacion_total_2010;
      p2022 = provincia.poblacion_total_2022;
    } else {
      const dept = departments.find(d => d.id === targetId);
      if (!dept) return;
      label = `Departamento ${dept.nombre}`;
      p2001 = dept.poblacion_2001;
      p2010 = dept.poblacion_2010;
      p2022 = dept.poblacion_2022;
    }

    const varTotal = ((p2022 - p2001) / p2001) * 100;
    const varPeriodo = ((p2022 - p2010) / p2010) * 100;

    const maxVal = Math.max(p2001, p2010, p2022) * 1.15;
    const h2001 = ((p2001 / maxVal) * 100).toFixed(1);
    const h2010 = ((p2010 / maxVal) * 100).toFixed(1);
    const h2022 = ((p2022 / maxVal) * 100).toFixed(1);

    container.innerHTML = `
      <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: baseline;">
        <h4 style="font-size: var(--text-sm); font-weight: 700; color: var(--text-primary);">${label}</h4>
        <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--accent-delta); background: var(--accent-delta-light); padding: 2px 6px; border-radius: 2px;">
          ${formatPercent(varPeriodo)} entre 2010 y 2022
        </span>
      </div>

      <div style="display: flex; align-items: flex-end; justify-content: space-around; height: 180px; padding-bottom: 2rem; position: relative; border-bottom: 2px solid var(--border-default);">
        
        <div style="display: flex; flex-direction: column; align-items: center; width: 22%;">
          <span class="tabular-nums" style="font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px;">
            ${formatNumber(p2001)}
          </span>
          <div style="width: 100%; height: ${h2001 * 1.4}px; background-color: #94A3B8; border-radius: 3px 3px 0 0;"></div>
          <span style="position: absolute; bottom: 0.5rem; font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--text-secondary);">
            Censo 2001
          </span>
        </div>

        <div style="display: flex; flex-direction: column; align-items: center; width: 22%;">
          <span class="tabular-nums" style="font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px;">
            ${formatNumber(p2010)}
          </span>
          <div style="width: 100%; height: ${h2010 * 1.4}px; background-color: #64748B; border-radius: 3px 3px 0 0;"></div>
          <span style="position: absolute; bottom: 0.5rem; font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--text-secondary);">
            Censo 2010
          </span>
        </div>

        <div style="display: flex; flex-direction: column; align-items: center; width: 22%;">
          <span class="tabular-nums" style="font-size: 11px; font-weight: 700; color: var(--accent-river); margin-bottom: 6px;">
            ${formatNumber(p2022)}
          </span>
          <div style="width: 100%; height: ${h2022 * 1.4}px; background-color: var(--accent-river); border-radius: 3px 3px 0 0;"></div>
          <span style="position: absolute; bottom: 0.5rem; font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--accent-river);">
            Censo 2022
          </span>
        </div>

      </div>

      <div style="margin-top: 1rem; display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">
        <span>Variación acumulada 2001 - 2022: <strong>${formatPercent(varTotal)}</strong></span>
        <span>Fuente: INDEC / DGEC Entre Ríos</span>
      </div>
    `;
  }

  function renderUrbanRuralChart(departments) {
    const container = document.getElementById('urban-rural-chart-container');
    if (!container) return;

    const sorted = [...departments].sort((a, b) => b.urbano_pct - a.urbano_pct);

    let html = '';
    sorted.forEach(dept => {
      html += `
        <div class="urban-rural-item" title="${dept.nombre}: ${dept.urbano_pct}% urbana, ${dept.rural_pct}% rural">
          <span style="font-size: var(--text-xs); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${dept.nombre}
          </span>
          <div class="urban-rural-track">
            <div class="urban-fill" style="width: ${dept.urbano_pct}%;"></div>
            <div class="rural-fill" style="width: ${dept.rural_pct}%;"></div>
          </div>
          <span class="urban-rural-ratio tabular-nums">
            ${dept.urbano_pct}% / ${dept.rural_pct}%
          </span>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  function renderAgePyramid(provincia) {
    const container = document.getElementById('age-pyramid-container');
    if (!container || !provincia.piramide_etaria_2022) return;

    let html = '';
    provincia.piramide_etaria_2022.forEach(grupo => {
      html += `
        <div class="age-group-row">
          <div class="age-group-info">
            <span class="age-group-name">${grupo.grupo}</span>
            <span class="age-group-nums tabular-nums">
              <strong>${grupo.porcentaje}%</strong> · ~${formatNumber(grupo.poblacion_aprox)} habitantes
            </span>
          </div>
          <div class="age-bar-track">
            <div class="age-bar-fill" style="width: ${(grupo.porcentaje * 1.5).toFixed(1)}%;"></div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  function renderConcentrationCard(departments, provincia) {
    const container = document.getElementById('concentration-card-container');
    if (!container) return;

    const top4 = departments.slice(0, 4);
    const popTop4 = top4.reduce((acc, d) => acc + d.poblacion_2022, 0);
    const surfTop4 = top4.reduce((acc, d) => acc + d.superficie_km2, 0);
    const pctPop = ((popTop4 / provincia.poblacion_total_2022) * 100).toFixed(1);
    const pctSurf = ((surfTop4 / provincia.superficie_total_km2) * 100).toFixed(1);

    container.innerHTML = `
      <div class="concentration-box">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
          <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--accent-amber); text-transform: uppercase;">
            Concentración en 4 departamentos
          </span>
          <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">
            Ejes fluviales principales
          </span>
        </div>
        <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 0.35rem; line-height: 1.5;">
          Los departamentos de <strong>Paraná, Concordia, Gualeguaychú y Uruguay</strong> concentran el 58,8% de la población provincial en menos del 27% de la superficie territorial.
        </p>
        <div class="concentration-stats">
          <div class="stat-item">
            <span class="stat-label">Población en 4 departamentos</span>
            <span class="stat-value tabular-nums">${formatNumber(popTop4)}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Porcentaje provincial</span>
            <span class="stat-value tabular-nums" style="color: var(--accent-river);">${pctPop}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Superficie ocupada</span>
            <span class="stat-value tabular-nums">${pctSurf}%</span>
          </div>
        </div>
      </div>
    `;
  }

  function bindChartControls(departments, provincia) {
    const btnPop = document.getElementById('rank-btn-pop');
    const btnDens = document.getElementById('rank-btn-dens');

    if (btnPop && btnDens) {
      btnPop.addEventListener('click', () => {
        currentRankingMetric = 'poblacion';
        btnPop.classList.add('active');
        btnDens.classList.remove('active');
        renderRankingChart('poblacion');
      });

      btnDens.addEventListener('click', () => {
        currentRankingMetric = 'densidad';
        btnDens.classList.add('active');
        btnPop.classList.remove('active');
        renderRankingChart('densidad');
      });
    }

    const selectEvol = document.getElementById('evol-dept-select');
    if (selectEvol) {
      selectEvol.innerHTML = `<option value="provincia">Total provincial</option>`;
      departments.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = `Departamento ${d.nombre}`;
        selectEvol.appendChild(opt);
      });

      selectEvol.addEventListener('change', (e) => {
        renderIntercensalChart(departments, provincia, e.target.value);
      });
    }
  }

  // ============================================================================
  // 6. ASENTAMIENTOS, HOGARES Y COMPARADOR TERRITORIAL BILATERAL
  // ============================================================================
  let comparatorDeptA = 'parana';
  let comparatorDeptB = 'concordia';

  function initDepartmentComparator(departamentos) {
    const selectA = document.getElementById('comparator-select-a');
    const selectB = document.getElementById('comparator-select-b');
    if (!selectA || !selectB) return;

    const sorted = [...departamentos].sort((a, b) => a.nombre.localeCompare(b.nombre));

    selectA.innerHTML = '';
    selectB.innerHTML = '';

    sorted.forEach(d => {
      const optA = document.createElement('option');
      optA.value = d.id;
      optA.textContent = `${d.nombre} (Capital: ${d.capital})`;
      if (d.id === comparatorDeptA) optA.selected = true;
      selectA.appendChild(optA);

      const optB = document.createElement('option');
      optB.value = d.id;
      optB.textContent = `${d.nombre} (Capital: ${d.capital})`;
      if (d.id === comparatorDeptB) optB.selected = true;
      selectB.appendChild(optB);
    });

    selectA.addEventListener('change', (e) => {
      comparatorDeptA = e.target.value;
      renderComparator(comparatorDeptA, comparatorDeptB);
    });

    selectB.addEventListener('change', (e) => {
      comparatorDeptB = e.target.value;
      renderComparator(comparatorDeptA, comparatorDeptB);
    });

    renderComparator(comparatorDeptA, comparatorDeptB);
  }

  function renderComparator(idA, idB) {
    const container = document.getElementById('comparator-results-container');
    if (!container || !dataset) return;

    const deptA = dataset.departamentos.find(d => d.id === idA);
    const deptB = dataset.departamentos.find(d => d.id === idB);
    if (!deptA || !deptB) return;

    // Calcular proporciones comparativas para barras visuales relativas
    const popTotal = deptA.poblacion_2022 + deptB.poblacion_2022;
    const pctPopA = popTotal > 0 ? ((deptA.poblacion_2022 / popTotal) * 100).toFixed(1) : 50;
    const pctPopB = popTotal > 0 ? ((deptB.poblacion_2022 / popTotal) * 100).toFixed(1) : 50;

    const vivTotal = deptA.viviendas_particulares + deptB.viviendas_particulares;
    const pctVivA = vivTotal > 0 ? ((deptA.viviendas_particulares / vivTotal) * 100).toFixed(1) : 50;
    const pctVivB = vivTotal > 0 ? ((deptB.viviendas_particulares / vivTotal) * 100).toFixed(1) : 50;

    const surfTotal = deptA.superficie_km2 + deptB.superficie_km2;
    const pctSurfA = surfTotal > 0 ? ((deptA.superficie_km2 / surfTotal) * 100).toFixed(1) : 50;
    const pctSurfB = surfTotal > 0 ? ((deptB.superficie_km2 / surfTotal) * 100).toFixed(1) : 50;

    const densTotal = deptA.densidad_hab_km2 + deptB.densidad_hab_km2;
    const pctDensA = densTotal > 0 ? ((deptA.densidad_hab_km2 / densTotal) * 100).toFixed(1) : 50;
    const pctDensB = densTotal > 0 ? ((deptB.densidad_hab_km2 / densTotal) * 100).toFixed(1) : 50;

    const html = `
      <!-- Tarjetas principales de las dos unidades -->
      <div class="comparator-head-cards">
        <div class="comparator-head-card card-dept-a">
          <div class="comp-card-badge">Primer departamento</div>
          <h4 class="comp-dept-name">${deptA.nombre}</h4>
          <div class="comp-dept-meta">
            Capital: <strong>${deptA.capital}</strong> · Ubicación: <strong>${deptA.region_nombre}</strong>
          </div>
          <div style="margin-top: 0.25rem; font-size: 11px; color: var(--text-muted);">
            Tasa de urbanización: <strong>${deptA.urbano_pct}%</strong>
          </div>
        </div>

        <div class="comparator-head-card card-dept-b">
          <div class="comp-card-badge">Segundo departamento</div>
          <h4 class="comp-dept-name">${deptB.nombre}</h4>
          <div class="comp-dept-meta">
            Capital: <strong>${deptB.capital}</strong> · Ubicación: <strong>${deptB.region_nombre}</strong>
          </div>
          <div style="margin-top: 0.25rem; font-size: 11px; color: var(--text-muted);">
            Tasa de urbanización: <strong>${deptB.urbano_pct}%</strong>
          </div>
        </div>
      </div>

      <!-- Tabla y barras comparativas -->
      <div class="comparator-table-wrap">
        <table class="comparator-table" aria-label="Comparación de indicadores entre departamentos">
          <thead>
            <tr>
              <th scope="col" style="width: 28%;">Indicador (Censo 2022)</th>
              <th scope="col" style="width: 22%; color: var(--accent-river);">${deptA.nombre}</th>
              <th scope="col" style="width: 22%; color: var(--accent-amber);">${deptB.nombre}</th>
              <th scope="col" style="width: 28%;">Comparación relativa</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="comp-metric-label">Población total censada</td>
              <td class="comp-val-cell val-a">${formatNumber(deptA.poblacion_2022)} hab (${deptA.porcentaje_provincial}%)</td>
              <td class="comp-val-cell val-b">${formatNumber(deptB.poblacion_2022)} hab (${deptB.porcentaje_provincial}%)</td>
              <td class="comp-bar-cell">
                <div class="compare-bar-track" title="Población: ${deptA.nombre} ${pctPopA}% vs ${deptB.nombre} ${pctPopB}%">
                  <div class="compare-bar-fill-a" style="width: ${pctPopA}%;"></div>
                  <div class="compare-bar-fill-b" style="width: ${pctPopB}%;"></div>
                </div>
                <div class="compare-bar-legend">
                  <span>${pctPopA}%</span>
                  <span>${pctPopB}%</span>
                </div>
              </td>
            </tr>

            <tr>
              <td class="comp-metric-label">Viviendas particulares</td>
              <td class="comp-val-cell val-a">${formatNumber(deptA.viviendas_particulares)}</td>
              <td class="comp-val-cell val-b">${formatNumber(deptB.viviendas_particulares)}</td>
              <td class="comp-bar-cell">
                <div class="compare-bar-track" title="Viviendas: ${deptA.nombre} ${pctVivA}% vs ${deptB.nombre} ${pctVivB}%">
                  <div class="compare-bar-fill-a" style="width: ${pctVivA}%;"></div>
                  <div class="compare-bar-fill-b" style="width: ${pctVivB}%;"></div>
                </div>
                <div class="compare-bar-legend">
                  <span>${pctVivA}%</span>
                  <span>${pctVivB}%</span>
                </div>
              </td>
            </tr>

            <tr>
              <td class="comp-metric-label">Densidad de población</td>
              <td class="comp-val-cell val-a">${formatDensity(deptA.densidad_hab_km2)} (N° ${deptA.posicion_ranking_densidad})</td>
              <td class="comp-val-cell val-b">${formatDensity(deptB.densidad_hab_km2)} (N° ${deptB.posicion_ranking_densidad})</td>
              <td class="comp-bar-cell">
                <div class="compare-bar-track" title="Densidad relativa: ${deptA.nombre} ${pctDensA}% vs ${deptB.nombre} ${pctDensB}%">
                  <div class="compare-bar-fill-a" style="width: ${pctDensA}%;"></div>
                  <div class="compare-bar-fill-b" style="width: ${pctDensB}%;"></div>
                </div>
                <div class="compare-bar-legend">
                  <span>${pctDensA}%</span>
                  <span>${pctDensB}%</span>
                </div>
              </td>
            </tr>

            <tr>
              <td class="comp-metric-label">Superficie territorial</td>
              <td class="comp-val-cell">${formatNumber(Math.round(deptA.superficie_km2))} km²</td>
              <td class="comp-val-cell">${formatNumber(Math.round(deptB.superficie_km2))} km²</td>
              <td class="comp-bar-cell">
                <div class="compare-bar-track" title="Superficie: ${deptA.nombre} ${pctSurfA}% vs ${deptB.nombre} ${pctSurfB}%">
                  <div class="compare-bar-fill-a" style="width: ${pctSurfA}%;"></div>
                  <div class="compare-bar-fill-b" style="width: ${pctSurfB}%;"></div>
                </div>
                <div class="compare-bar-legend">
                  <span>${pctSurfA}%</span>
                  <span>${pctSurfB}%</span>
                </div>
              </td>
            </tr>

            <tr>
              <td class="comp-metric-label">Tamaño medio del hogar</td>
              <td class="comp-val-cell val-a">${deptA.personas_por_hogar.toFixed(2).replace('.', ',')} personas/hogar</td>
              <td class="comp-val-cell val-b">${deptB.personas_por_hogar.toFixed(2).replace('.', ',')} personas/hogar</td>
              <td class="comp-bar-cell" style="font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary);">
                ${deptA.personas_por_hogar < deptB.personas_por_hogar ? `Hogares más reducidos en ${deptA.nombre}` : (deptA.personas_por_hogar > deptB.personas_por_hogar ? `Hogares más reducidos en ${deptB.nombre}` : 'Promedios idénticos')}
              </td>
            </tr>

            <tr>
              <td class="comp-metric-label">Variación censal 2010 - 2022</td>
              <td class="comp-val-cell" style="color: var(--accent-delta);">${formatPercent(deptA.variacion_2010_2022_pct)}</td>
              <td class="comp-val-cell" style="color: var(--accent-delta);">${formatPercent(deptB.variacion_2010_2022_pct)}</td>
              <td class="comp-bar-cell" style="font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary);">
                ${deptA.variacion_2010_2022_pct > deptB.variacion_2010_2022_pct ? `Mayor ritmo relativo en ${deptA.nombre}` : `Mayor ritmo relativo en ${deptB.nombre}`}
              </td>
            </tr>

            <tr>
              <td class="comp-metric-label">Tasa de urbanización</td>
              <td class="comp-val-cell">${deptA.urbano_pct}% urbana (${deptA.rural_pct}% rural)</td>
              <td class="comp-val-cell">${deptB.urbano_pct}% urbana (${deptB.rural_pct}% rural)</td>
              <td class="comp-bar-cell" style="font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary);">
                ${deptA.urbano_pct > deptB.urbano_pct ? `Mayor concentración urbana en ${deptA.nombre}` : `Mayor dispersión rural en ${deptA.nombre}`}
              </td>
            </tr>

            <tr>
              <td class="comp-metric-label">Índice de envejecimiento</td>
              <td class="comp-val-cell">${deptA.indice_envejecimiento.toFixed(1).replace('.', ',')}%</td>
              <td class="comp-val-cell">${deptB.indice_envejecimiento.toFixed(1).replace('.', ',')}%</td>
              <td class="comp-bar-cell" style="font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary);">
                65+ años cada 100 de 0-14 años
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;
  }

  // ============================================================================
  // 7. PESTAÑAS INSTITUCIONALES
  // ============================================================================
  function initAboutTabs() {
    const tabBtns = document.querySelectorAll('.about-tab-btn');
    const panes = document.querySelectorAll('.about-tab-pane');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');

        tabBtns.forEach(b => b.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const activePane = document.getElementById(target);
        if (activePane) activePane.classList.add('active');
      });
    });
  }

  // ============================================================================
  // 8. NAVEGACIÓN Y ENLACES
  // ============================================================================
  function initNavigation() {
    const header = document.querySelector('.site-header');
    const links = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    const navMenu = document.getElementById('site-nav-menu');

    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('is-open');
      });

      links.forEach(l => {
        l.addEventListener('click', () => {
          navMenu.classList.remove('is-open');
        });
      });
    }

    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY;

      if (header) {
        if (scrollPos > 20) {
          header.classList.add('is-scrolled');
        } else {
          header.classList.remove('is-scrolled');
        }
      }

      let currentId = '';
      sections.forEach(sec => {
        const top = sec.offsetTop - 120;
        const height = sec.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentId = sec.getAttribute('id');
        }
      });

      if (currentId) {
        links.forEach(link => {
          if (link.getAttribute('href') === `#${currentId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    }, { passive: true });
  }

})();
