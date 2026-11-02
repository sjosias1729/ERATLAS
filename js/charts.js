/**
 * ERATLAS - Visualizaciones Demográficas Interactivas
 * Gráficos comparativos basados en Censos Oficiales INDEC 2001, 2010 y 2022
 */

import { formatNumber, formatPercent, formatDensity } from './data.js';

let currentRankingMetric = 'poblacion';
let departmentsCache = [];
let onSelectCallback = null;

/**
 * Inicializa todos los gráficos de la sección demográfica
 */
export function initCharts(departments, provincia, onSelectDept) {
  departmentsCache = departments;
  onSelectCallback = onSelectDept;

  renderRankingChart(currentRankingMetric);
  renderIntercensalChart(departments, provincia, 'parana');
  renderUrbanRuralChart(departments);
  renderAgePyramid(provincia);
  renderConcentrationCard(departments, provincia);

  // Vincular conmutador de métrica de ranking
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

  // Vincular selector de departamento en evolución censal
  const selectEvol = document.getElementById('evol-dept-select');
  if (selectEvol) {
    selectEvol.innerHTML = `<option value="provincia">Total Provincial (Entre Ríos)</option>`;
    departments.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.id;
      opt.textContent = d.nombre;
      selectEvol.appendChild(opt);
    });

    selectEvol.addEventListener('change', (e) => {
      renderIntercensalChart(departments, provincia, e.target.value);
    });
  }
}

/**
 * 1. Ranking Departamental (Población o Densidad)
 */
export function renderRankingChart(metric = 'poblacion') {
  const container = document.getElementById('ranking-chart-list');
  if (!container) return;

  const depts = [...departmentsCache];
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

  // Interacción al hacer clic
  container.querySelectorAll('.ranking-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id');
      if (onSelectCallback && id) {
        onSelectCallback(id);
      }
    });
  });
}

/**
 * Resalta un departamento en el ranking
 */
export function highlightRankingItem(deptId) {
  const container = document.getElementById('ranking-chart-list');
  if (!container) return;

  container.querySelectorAll('.ranking-item').forEach(el => {
    if (el.getAttribute('data-id') === deptId) {
      el.classList.add('is-selected');
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      el.classList.remove('is-selected');
    }
  });
}

/**
 * 2. Evolución Demográfica Censal (2001 - 2010 - 2022)
 */
function renderIntercensalChart(departments, provincia, targetId = 'provincia') {
  const container = document.getElementById('intercensal-chart-display');
  if (!container) return;

  let label = 'Provincia de Entre Ríos';
  let p2001, p2010, p2022;

  if (targetId === 'provincia') {
    label = 'Total Provincial de Entre Ríos';
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

  const maxVal = Math.max(p2001, p2010, p2022) * 1.12;
  const h2001 = ((p2001 / maxVal) * 100).toFixed(1);
  const h2010 = ((p2010 / maxVal) * 100).toFixed(1);
  const h2022 = ((p2022 / maxVal) * 100).toFixed(1);

  container.innerHTML = `
    <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: baseline;">
      <h4 style="font-size: var(--text-sm); font-weight: 700; color: var(--text-primary);">${label}</h4>
      <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--accent-delta); background: var(--accent-delta-light); padding: 2px 6px; border-radius: 2px;">
        ${formatPercent(varPeriodo)} (2010-2022)
      </span>
    </div>

    <div style="display: flex; align-items: flex-end; justify-content: space-around; height: 180px; padding-bottom: 2rem; position: relative; border-bottom: 2px solid var(--border-default);">
      
      <!-- Columna 2001 -->
      <div style="display: flex; flex-direction: column; align-items: center; width: 22%;">
        <span class="tabular-nums" style="font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px;">
          ${formatNumber(p2001)}
        </span>
        <div style="width: 100%; height: ${h2001 * 1.4}px; background-color: #94A3B8; border-radius: 3px 3px 0 0; transition: height 0.4s ease;"></div>
        <span style="position: absolute; bottom: 0.5rem; font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--text-secondary);">
          Censo 2001
        </span>
      </div>

      <!-- Columna 2010 -->
      <div style="display: flex; flex-direction: column; align-items: center; width: 22%;">
        <span class="tabular-nums" style="font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px;">
          ${formatNumber(p2010)}
        </span>
        <div style="width: 100%; height: ${h2010 * 1.4}px; background-color: #64748B; border-radius: 3px 3px 0 0; transition: height 0.4s ease;"></div>
        <span style="position: absolute; bottom: 0.5rem; font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--text-secondary);">
          Censo 2010
        </span>
      </div>

      <!-- Columna 2022 -->
      <div style="display: flex; flex-direction: column; align-items: center; width: 22%;">
        <span class="tabular-nums" style="font-size: 11px; font-weight: 700; color: var(--accent-river-dark); margin-bottom: 6px;">
          ${formatNumber(p2022)}
        </span>
        <div style="width: 100%; height: ${h2022 * 1.4}px; background-color: #0284C7; border-radius: 3px 3px 0 0; transition: height 0.4s ease;"></div>
        <span style="position: absolute; bottom: 0.5rem; font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--accent-river-dark);">
          Censo 2022
        </span>
      </div>

    </div>

    <div style="margin-top: 1rem; display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">
      <span>Crecimiento 2001 - 2022: <strong>${formatPercent(varTotal)}</strong></span>
      <span>Fuente: INDEC / DGEC Entre Ríos</span>
    </div>
  `;
}

/**
 * 3. Gráfico de Proporción Urbana vs. Rural
 */
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

/**
 * 4. Estructura de Grupos Etarios (Censo 2022)
 */
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
            <strong>${grupo.porcentaje}%</strong> · ~${formatNumber(grupo.poblacion_aprox)} hab.
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

/**
 * 5. Tarjeta de Concentración Territorial
 */
function renderConcentrationCard(departments, provincia) {
  const container = document.getElementById('concentration-card-container');
  if (!container) return;

  const top4 = departments.slice(0, 4); // Paraná, Concordia, Gualeguaychú, Uruguay
  const popTop4 = top4.reduce((acc, d) => acc + d.poblacion_2022, 0);
  const surfTop4 = top4.reduce((acc, d) => acc + d.superficie_km2, 0);
  const pctPop = ((popTop4 / provincia.poblacion_total_2022) * 100).toFixed(1);
  const pctSurf = ((surfTop4 / provincia.superficie_total_km2) * 100).toFixed(1);

  container.innerHTML = `
    <div class="concentration-box">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
        <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--accent-amber); text-transform: uppercase;">
          Patrón de Concentración Bipolar
        </span>
        <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">
          4 de 17 Departamentos
        </span>
      </div>
      <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 0.35rem; line-height: 1.5;">
        Los departamentos costeros de <strong>Paraná, Concordia, Gualeguaychú y Uruguay</strong> concentran casi el 60% de la población provincial sobre las cuencas de los ríos Paraná y Uruguay.
      </p>
      <div class="concentration-stats">
        <div class="stat-item">
          <span class="stat-label">Población en 4 Deptos.</span>
          <span class="stat-value tabular-nums">${formatNumber(popTop4)}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">% Total Provincial</span>
          <span class="stat-value tabular-nums" style="color: var(--accent-river-dark);">${pctPop}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">% Superficie Ocupada</span>
          <span class="stat-value tabular-nums">${pctSurf}%</span>
        </div>
      </div>
    </div>
  `;
}
