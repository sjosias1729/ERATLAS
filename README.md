# ERATLAS — Atlas Interactivo de Entre Ríos

**ERATLAS** es una aplicación web interactiva dedicada a la exploración y el análisis de la geografía humana, la demografía, los asentamientos y las actividades socioeconómicas de la provincia de Entre Ríos, Argentina.

El elemento central del sitio es un mapa vectorial interactivo basado en las geometrías oficiales del Instituto Geográfico Nacional (IGN).

---

## 1. Identidad y Enfoque Temático

- **Identidad:** ERATLAS — Atlas Interactivo de Entre Ríos
- **Áreas temáticas:**
  - **Población y distribución territorial:** volumen de habitantes, densidad departamental y series intercensales (2001, 2010 y 2022).
  - **Asentamientos humanos:** ciudades cabeceras, comunas y distribución urbana y rural.
  - **Organización territorial:** los 17 departamentos, ejes fluviales de los ríos Paraná y Uruguay, el área central y el Delta.
  - **Actividades económicas:** cuencas productivas avícola, citrícola, arrocera, forestal, lechera, portuaria, ganadera y turística.

---

## 2. Fuentes Oficiales

La información estadística y cartográfica proviene de organismos públicos:

1. **INDEC (Instituto Nacional de Estadística y Censos):**
   - Censo Nacional de Población, Hogares y Viviendas 2022. Resultados definitivos de Entre Ríos (población total: 1.415.097 habitantes; superficie continental: 78.384 km²; densidad media: 18,2 hab/km²).
   - [Resultados Definitivos Censo 2022 Entre Ríos](https://censo.gob.ar/index.php/datos_definitivos_entre_rios/)
2. **DGEC (Dirección General de Estadística y Censos de Entre Ríos):**
   - Series intercensales 2001 y 2010 por departamento.
   - [Portal DGEC Entre Ríos](https://www.entrerios.gov.ar/dgec/)
3. **IGN (Instituto Geográfico Nacional):**
   - Geometrías vectoriales oficiales de unidades territoriales departamentales.
   - [Capas SIG Oficiales y Límites Departamentales IGN](https://www.ign.gob.ar/NuestrasActividades/InformacionGeoespacial/CapasSIG)

---

## 3. Estructura de Archivos

```
ERAtlas/
├── index.html                           # Estructura principal de la aplicación
├── README.md                            # Documentación técnica
├── css/
│   ├── variables.css                    # Variables de diseño y paleta
│   ├── layout.css                       # Disposición y estructura de navegación
│   ├── map.css                          # Estilos del mapa vectorial y controles
│   ├── cards.css                        # Ficha departamental
│   ├── charts.css                       # Gráficos demográficos
│   └── gallery.css                      # Cuencas productivas y galería
├── js/
│   └── app.js                           # Controlador principal y motor de eventos
├── data/
│   ├── dataset.js                       # Dataset integrado para ejecución directa
│   ├── entre-rios-data.json             # Dataset estructurado en formato JSON
│   └── departamentos-entre-rios.geojson # Geometrías oficiales IGN
└── assets/
    └── icons                            # Iconos
```

## 4. Actualización de Contenidos

- **Modificación de indicadores o textos:** Puede editarse el archivo `data/dataset.js` o `data/entre-rios-data.json`.
