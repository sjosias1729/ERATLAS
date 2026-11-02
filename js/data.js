/**
 * ERATLAS - Gestor de Datos Oficiales y Consultas Territoriales
 * Separación estricta de datos y presentación
 */

let dataset = null;

/**
 * Carga el archivo de datos estructurados de Entre Ríos
 * @returns {Promise<Object>} Datos del proyecto
 */
export async function loadData() {
  if (dataset) return dataset;
  try {
    const response = await fetch('./data/entre-rios-data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    dataset = await response.json();
    return dataset;
  } catch (error) {
    console.error('Error cargando el archivo de datos entre-rios-data.json:', error);
    throw error;
  }
}

/**
 * Devuelve la información provincial consolidada
 */
export function getProvincia() {
  return dataset ? dataset.provincia : null;
}

/**
 * Devuelve la lista completa de los 17 departamentos
 */
export function getDepartamentos() {
  return dataset ? dataset.departamentos : [];
}

/**
 * Busca un departamento por su ID (slug)
 * @param {string} id 
 */
export function getDepartamentoById(id) {
  if (!dataset || !id) return null;
  const cleanId = id.toLowerCase().trim();
  return dataset.departamentos.find(d => d.id === cleanId) || null;
}

/**
 * Devuelve las 8 cuencas productivas
 */
export function getCuencasProductivas() {
  return dataset ? dataset.cuencas_productivas : [];
}

/**
 * Devuelve los ítems de la galería territorial
 */
export function getGaleria() {
  return dataset ? dataset.galeria : [];
}

/**
 * Devuelve los metadatos de proyección del mapa SVG
 */
export function getMapaConfig() {
  return dataset ? dataset.mapa_svg : null;
}

/**
 * Formateador de números con separador de miles
 * @param {number} num 
 * @returns {string}
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return 'S/D';
  return new Intl.NumberFormat('es-AR').format(num);
}

/**
 * Formateador de porcentajes
 * @param {number} val 
 * @param {number} decimals 
 * @returns {string}
 */
export function formatPercent(val, decimals = 1) {
  if (val === null || val === undefined) return 'S/D';
  return `${val > 0 ? '+' : ''}${val.toFixed(decimals)}%`;
}

/**
 * Formateador de densidad
 * @param {number} dens 
 * @returns {string}
 */
export function formatDensity(dens) {
  if (dens === null || dens === undefined) return 'S/D';
  return `${dens.toFixed(1).replace('.', ',')} hab/km²`;
}
