import json, math

# Load geojson
with open('data/departamentos-entre-rios.geojson', 'r', encoding='utf-8') as f:
    geojson = json.load(f)

min_lon = min(p[0] for feat in geojson['features'] for ring in feat['geometry']['coordinates'] for p in ring)
max_lon = max(p[0] for feat in geojson['features'] for ring in feat['geometry']['coordinates'] for p in ring)
min_lat = min(p[1] for feat in geojson['features'] for ring in feat['geometry']['coordinates'] for p in ring)
max_lat = max(p[1] for feat in geojson['features'] for ring in feat['geometry']['coordinates'] for p in ring)

mid_lat = (min_lat + max_lat) / 2
cos_factor = math.cos(math.radians(mid_lat))

target_height = 800
pad = 25
scale_y = (target_height - 2 * pad) / (max_lat - min_lat)
scale_x = scale_y * cos_factor
target_width = round((max_lon - min_lon) * scale_x + 2 * pad)

def project(lon, lat):
    x = pad + (lon - min_lon) * scale_x
    y = pad + (max_lat - lat) * scale_y
    return round(x, 2), round(y, 2)

svg_map = {}
for feat in geojson['features']:
    props = feat['properties']
    raw_name = props['departamento'].upper().strip()
    coords = feat['geometry']['coordinates']
    rings_svg = []
    all_pts = []
    for ring in coords:
        d_parts = []
        for i, pt in enumerate(ring):
            px, py = project(pt[0], pt[1])
            all_pts.append((px, py))
            if i == 0:
                d_parts.append(f"M{px},{py}")
            else:
                d_parts.append(f"L{px},{py}")
        d_parts.append("Z")
        rings_svg.append("".join(d_parts))
    path_d = " ".join(rings_svg)
    cx = round(sum(p[0] for p in all_pts) / len(all_pts), 1)
    cy = round(sum(p[1] for p in all_pts) / len(all_pts), 1)
    svg_map[raw_name] = {
        'path': path_d,
        'cx': cx,
        'cy': cy
    }

dept_details = [
    {
        'id': 'parana',
        'raw_name': 'PARANA',
        'nombre': 'Paraná',
        'cabecera': 'Paraná',
        'codigo_ign': '30084',
        'poblacion_2022': 391696,
        'poblacion_2010': 339930,
        'poblacion_2001': 319614,
        'superficie_km2': 5107.7,
        'densidad_hab_km2': 76.7,
        'variacion_2010_2022_pct': 15.2,
        'porcentaje_provincial': 27.68,
        'urbano_pct': 92.5,
        'rural_pct': 7.5,
        'posicion_ranking_poblacion': 1,
        'posicion_ranking_densidad': 1,
        'localidades': ['Paraná', 'Oro Verde', 'San Benito', 'Colonia Avellaneda', 'Crespo', 'Viale', 'María Grande', 'Cerrito', 'Hasenkamp', 'Seguí', 'Hernandarias', 'Villa Urquiza'],
        'perfil_asentamiento': 'Fuerte primacía del Área Metropolitana Gran Paraná (Paraná, Oro Verde, San Benito, Colonia Avellaneda) como principal polo administrativo, de servicios y universitario provincial. Hacia el este y norte se extiende una densa trama de colonias agrícolas y ciudades intermedias agroindustriales (Crespo, Viale, María Grande).',
        'actividades_principales': ['Administración Pública', 'Educación Superior e I+D', 'Avicultura y Agroindustria (Crespo)', 'Industria Farmacéutica y Metalmecánica', 'Agricultura de Granos (Soja, Maíz, Trigo)', 'Turismo de Convenciones y Cultural'],
        'detalle_economico': 'Combina la mayor concentración de servicios de la provincia con la pujanza agroindustrial de Crespo (epicentro avícola y alimentario) y una red de cooperativas agrícolas de escala nacional.',
        'dato_territorial': 'Sede de la capital provincial sobre las barrancas del río Paraná. Conectada a la ciudad de Santa Fe a través del histórico Túnel Subfluvial Raúl Uranga - Carlos Sylvestre Begnis inaugurado en 1969.'
    },
    {
        'id': 'concordia',
        'raw_name': 'CONCORDIA',
        'nombre': 'Concordia',
        'cabecera': 'Concordia',
        'codigo_ign': '30015',
        'poblacion_2022': 198802,
        'poblacion_2010': 170033,
        'poblacion_2001': 157291,
        'superficie_km2': 3277.6,
        'densidad_hab_km2': 60.7,
        'variacion_2010_2022_pct': 16.9,
        'porcentaje_provincial': 14.05,
        'urbano_pct': 91.0,
        'rural_pct': 9.0,
        'posicion_ranking_poblacion': 2,
        'posicion_ranking_densidad': 2,
        'localidades': ['Concordia', 'La Criolla', 'Los Charrúas', 'Puerto Yeruá', 'Colonia Ayuí', 'Estación Yuquerí', 'Calabacilla'],
        'perfil_asentamiento': 'Intensa concentración urbana en la cabecera departamental (segunda urbe más poblada de la provincia) emplazada a orillas del río Uruguay, complementada por un cinturón periurbano de colonias frutícolas y forestales articuladas sobre la Autovía Nacional 14.',
        'actividades_principales': ['Citricultura (Naranja y Mandarina)', 'Foresto-Industria (Aserraderos de Pino y Eucalipto)', 'Arándanos y Berries', 'Energía Hidroeléctrica (Complejo Salto Grande)', 'Turismo Termal y Pesca Deportiva'],
        'detalle_economico': 'Epicentro de la cuenca citrícola y foresto-industrial del río Uruguay. Cuenta con plantas empacadoras de exportación, industrias de jugos concentrados y la mayor potencia hidroeléctrica mesopotámica.',
        'dato_territorial': 'Frontera internacional con la República Oriental del Uruguay (Salto), conectada mediante el coronamiento ferrovial de la Represa Binacional de Salto Grande.'
    },
    {
        'id': 'gualeguaychu',
        'raw_name': 'GUALEGUAYCHU',
        'nombre': 'Gualeguaychú',
        'cabecera': 'Gualeguaychú',
        'codigo_ign': '30056',
        'poblacion_2022': 126147,
        'poblacion_2010': 109461,
        'poblacion_2001': 101350,
        'superficie_km2': 7530.9,
        'densidad_hab_km2': 16.8,
        'variacion_2010_2022_pct': 15.2,
        'porcentaje_provincial': 8.91,
        'urbano_pct': 88.5,
        'rural_pct': 11.5,
        'posicion_ranking_poblacion': 3,
        'posicion_ranking_densidad': 9,
        'localidades': ['Gualeguaychú', 'Pueblo General Belgrano', 'Urdinarrain', 'Larroque', 'Gilbert', 'Aldea San Antonio', 'Enrique Carbó'],
        'perfil_asentamiento': 'Estructura bipolar entre el gran centro urbano ribereño de Gualeguaychú y Pueblo General Belgrano, y un interior rural vertebrado por ciudades agrícolas medianas (Urdinarrain, Larroque) y colonias de inmigración europea (aldeas alemanas del Volga).',
        'actividades_principales': ['Parque Industrial (Química, Alimentos, Metalmecánica)', 'Turismo Masivo (Carnaval del País, Termas, Playas)', 'Avicultura Integrada', 'Agricultura de Granos (Soja, Maíz, Trigo)', 'Ganadería Bovina'],
        'detalle_economico': 'Tercer polo poblacional y uno de los mayores parques industriales de la Mesopotamia, articulado con un sector de servicios turísticos de relevancia nacional.',
        'dato_territorial': 'Segundo departamento más extenso de la provincia (7.530,9 km²). Limita al este con el río Uruguay y alberga el Puente Internacional Libertador General San Martín (hacia Fray Bentos, Uruguay).'
    },
    {
        'id': 'uruguay',
        'raw_name': 'URUGUAY',
        'nombre': 'Uruguay',
        'cabecera': 'Concepción del Uruguay',
        'codigo_ign': '30098',
        'poblacion_2022': 116356,
        'poblacion_2010': 100728,
        'poblacion_2001': 94070,
        'superficie_km2': 5126.8,
        'densidad_hab_km2': 22.7,
        'variacion_2010_2022_pct': 15.5,
        'porcentaje_provincial': 8.22,
        'urbano_pct': 87.0,
        'rural_pct': 13.0,
        'posicion_ranking_poblacion': 4,
        'posicion_ranking_densidad': 5,
        'localidades': ['Concepción del Uruguay', 'Basavilbaso', 'Caseros', 'Santa Anita', 'Pronunciamiento', 'Herrera', 'Colonia Elía', 'San Justo'],
        'perfil_asentamiento': 'Organización policéntrica de alta integración: cabecera portuaria-universitaria en Concepción del Uruguay y un histórico núcleo ferroviario-cooperativo en Basavilbaso, con activas comunas agrícolas intermedias (Caseros, Santa Anita).',
        'actividades_principales': ['Epicentro de la Industria Avícola (Faena y Exportación)', 'Puerto de Ultramar sobre el Río Uruguay', 'Polo Universitario Regional (UNER, UTN, UADER, UCU)', 'Industria Naval y Metalúrgica', 'Turismo Histórico y Balneario'],
        'detalle_economico': 'Lidera la cadena de valor de carne avícola del país, combinada con actividad portuaria de ultramar y una elevada concentración de oferta de educación técnica y superior.',
        'dato_territorial': 'Reconocida como Capital Histórica de Entre Ríos. En su territorio se ubica el Palacio San José (residencia de Justo José de Urquiza) y el Colegio del Uruguay (fundado en 1849).'
    },
    {
        'id': 'federacion',
        'raw_name': 'FEDERACION',
        'nombre': 'Federación',
        'cabecera': 'Federación',
        'codigo_ign': '30028',
        'poblacion_2022': 78691,
        'poblacion_2010': 68736,
        'poblacion_2001': 60204,
        'superficie_km2': 3771.4,
        'densidad_hab_km2': 20.9,
        'variacion_2010_2022_pct': 14.5,
        'porcentaje_provincial': 5.56,
        'urbano_pct': 83.0,
        'rural_pct': 17.0,
        'posicion_ranking_poblacion': 5,
        'posicion_ranking_densidad': 6,
        'localidades': ['Chajarí', 'Federación', 'Villa del Rosario', 'Santa Ana', 'San Jaime de la Frontera', 'Los Conquistadores'],
        'perfil_asentamiento': 'Configuración singular en la que Chajarí ejerce como el principal motor demográfico, comercial y manufacturero, mientras que la ciudad de Federación funciona como cabecera institucional y polo turístico de aguas termales a orillas del embalse.',
        'actividades_principales': ['Citricultura Intensiva (Mandarinas y Naranjas)', 'Aserraderos e Industria de la Madera (Eucalipto)', 'Turismo Termal y Náutico en el Lago Salto Grande', 'Ganadería Bovina del Norte'],
        'detalle_economico': 'Primer polo de transformación maderera de la provincia (aserraderos de eucalipto) y área de vanguardia en citricultura familiar tecnificada con más de 1.500 quintas activas.',
        'dato_territorial': 'La primitiva ciudad de Federación fue sumergida en 1979 por la creación del embalse de Salto Grande; la actual Nueva Federación fue construida enteramente desde cero sobre cotas altas.'
    },
    {
        'id': 'la-paz',
        'raw_name': 'LA PAZ',
        'nombre': 'La Paz',
        'cabecera': 'La Paz',
        'codigo_ign': '30070',
        'poblacion_2022': 75407,
        'poblacion_2010': 66903,
        'poblacion_2001': 66158,
        'superficie_km2': 6636.3,
        'densidad_hab_km2': 11.4,
        'variacion_2010_2022_pct': 12.7,
        'porcentaje_provincial': 5.33,
        'urbano_pct': 78.5,
        'rural_pct': 21.5,
        'posicion_ranking_poblacion': 6,
        'posicion_ranking_densidad': 12,
        'localidades': ['La Paz', 'Santa Elena', 'Bovril', 'San Gustavo', 'Piedras Blancas', 'Alcaraz', 'Sir Leonard'],
        'perfil_asentamiento': 'Poblaciones asentadas sobre las imponentes barrancas sedimentarias del río Paraná (La Paz, Santa Elena) conviviendo con localidades agrícolas y ganaderas del interior asociadas a la Ruta Nacional 12 y ramales ferroviarios.',
        'actividades_principales': ['Ganadería Bovina de Cría en Pastizales y Monte', 'Agricultura de Secano (Soja, Maíz, Sorgo)', 'Minería de Yeso y Canteras (Piedras Blancas)', 'Frigorífico Cárnico y Pesca Fluvial', 'Turismo Termal y Pesca Deportiva'],
        'detalle_economico': 'Economía de matriz primaria diversificada: gran rodeo vacuno sobre pastizales naturales, explotación de canteras de yeso de valor constructivo nacional y tradición pesquera de río.',
        'dato_territorial': 'Posee un amplio frente fluvial sobre el río Paraná con pronunciadas barrancas geológicas e islas que sustentan una rica biodiversidad acuática y la Fiesta Nacional del Surubí.'
    },
    {
        'id': 'colon',
        'raw_name': 'COLON',
        'nombre': 'Colón',
        'cabecera': 'Colón',
        'codigo_ign': '30008',
        'poblacion_2022': 75305,
        'poblacion_2010': 62160,
        'poblacion_2001': 52718,
        'superficie_km2': 2760.9,
        'densidad_hab_km2': 27.3,
        'variacion_2010_2022_pct': 21.1,
        'porcentaje_provincial': 5.32,
        'urbano_pct': 89.2,
        'rural_pct': 10.8,
        'posicion_ranking_poblacion': 7,
        'posicion_ranking_densidad': 3,
        'localidades': ['Colón', 'San José', 'Villa Elisa', 'Ubajay', 'Pueblo Liebig', 'Arroyo Barú', 'La Clarita'],
        'perfil_asentamiento': 'Micro-región integrada de alta densidad lineal sobre la costa del río Uruguay (Colón - San José - Liebig), con un próspero cordón mediterráneo articulado por Villa Elisa y colonias agrícolas centenarias.',
        'actividades_principales': ['Turismo Receptivo (Termas de Colón, San José y Villa Elisa)', 'Avicultura Integrada y Frigoríficos de Aves', 'Industria Maderera de Eucalipto', 'Producción de Nuez Pecán y Arroz', 'Patrimonio Histórico y Parques Nacionales'],
        'detalle_economico': 'Tercer departamento de mayor densidad poblacional y principal destino de turismo termal y estival de la costa oriental, con fuerte complementariedad avícola y forestal.',
        'dato_territorial': 'Alberga el Parque Nacional El Palmar (8.200 ha de palmeras yatay) y Pueblo Liebig, testimonio histórico del complejo fabril británico de carnes procesadas del siglo XIX y XX.'
    },
    {
        'id': 'gualeguay',
        'raw_name': 'GUALEGUAY',
        'nombre': 'Gualeguay',
        'cabecera': 'Gualeguay',
        'codigo_ign': '30049',
        'poblacion_2022': 57303,
        'poblacion_2010': 51883,
        'poblacion_2001': 48147,
        'superficie_km2': 6610.1,
        'densidad_hab_km2': 8.7,
        'variacion_2010_2022_pct': 10.4,
        'porcentaje_provincial': 4.05,
        'urbano_pct': 84.0,
        'rural_pct': 16.0,
        'posicion_ranking_poblacion': 8,
        'posicion_ranking_densidad': 10,
        'localidades': ['Gualeguay', 'General Galarza', 'Puerto Ruiz', 'Aldea Asunción', 'Distrito Sexto'],
        'perfil_asentamiento': 'Fuerte concentración urbana en la ciudad cabecera a orillas del río homónimo; el resto del departamento presenta un poblamiento disperso organizado en estancias y distritos rurales sobre planicies aluviales.',
        'actividades_principales': ['Ganadería Bovina (Cría, Invernada y Feedlots)', 'Frigoríficos Vacunos y Avícolas', 'Agricultura de Granos (Soja, Maíz, Trigo)', 'Industria Aceitera y Harinera', 'Puerto Fluvial de Cabotaje (Puerto Ruiz)'],
        'detalle_economico': 'Especialización en ganadería de ciclo completo e invernada sobre campos de excelente aptitud pastoril, articulada con industrias de faena vacuna y cerealeras.',
        'dato_territorial': 'Territorio de suave ondulación que desagua en el delta inferior del Paraná. Histórica cuna literaria entrerriana (poetas Juan L. Ortiz, Carlos Mastronardi y pintor Cesáreo B. de Quirós).'
    },
    {
        'id': 'villaguay',
        'raw_name': 'VILLAGUAY',
        'nombre': 'Villaguay',
        'cabecera': 'Villaguay',
        'codigo_ign': '30113',
        'poblacion_2022': 55796,
        'poblacion_2010': 48965,
        'poblacion_2001': 48416,
        'superficie_km2': 6578.3,
        'densidad_hab_km2': 8.5,
        'variacion_2010_2022_pct': 14.0,
        'porcentaje_provincial': 3.94,
        'urbano_pct': 80.0,
        'rural_pct': 20.0,
        'posicion_ranking_poblacion': 9,
        'posicion_ranking_densidad': 11,
        'localidades': ['Villaguay', 'Villa Clara', 'Villa Domínguez', 'Jubileo', 'Paso de la Laguna', 'Ingeniero Sajaroff'],
        'perfil_asentamiento': 'Localización estratégica en el centro geográfico provincial. Cabecera como polo comercial y administrativo, articulada con las históricas colonias agrícolas de la inmigración judía (Colonia Clara).',
        'actividades_principales': ['Ganadería Vacuna de Ciclo Completo', 'Cultivo y Molinería de Arroz', 'Avicultura de Engorde', 'Agricultura Extensiva (Soja, Lino, Sorgo)', 'Encrucijada Logística Vial (RN 18 y RN 130)'],
        'detalle_economico': 'Zona de transición agroecológica entre la agricultura de secano del oeste y los arrozales bajo riego del este, reforzada por su función de nodo de transporte de cargas transversal.',
        'dato_territorial': 'Conocido como el "Corazón de Entre Ríos", articula los flujos este-oeste entre las costas de los ríos Paraná y Uruguay a través de la Ruta Nacional 18.'
    },
    {
        'id': 'diamante',
        'raw_name': 'DIAMANTE',
        'nombre': 'Diamante',
        'cabecera': 'Diamante',
        'codigo_ign': '30021',
        'poblacion_2022': 53595,
        'poblacion_2010': 46361,
        'poblacion_2001': 44095,
        'superficie_km2': 2678.3,
        'densidad_hab_km2': 20.0,
        'variacion_2010_2022_pct': 15.6,
        'porcentaje_provincial': 3.79,
        'urbano_pct': 82.5,
        'rural_pct': 17.5,
        'posicion_ranking_poblacion': 10,
        'posicion_ranking_densidad': 7,
        'localidades': ['Diamante', 'General Ramírez', 'Valle María', 'Villa Libertador San Martín', 'Aldea Brasilera', 'Strobel', 'Aldea Protestante', 'Aldea Spatzenkutter'],
        'perfil_asentamiento': 'Trama socioterritorial única integrada por la constelación de aldeas de inmigrantes alemanes del Volga fundadas en 1878, la pujante urbe agrocooperativa de General Ramírez y el centro médico-académico de Villa Libertador San Martín.',
        'actividades_principales': ['Puerto Cerealero de Ultramar (Puerto Diamante)', 'Agricultura de Granos de Alta Productividad', 'Cooperativismo Agrario y Acopio', 'Servicios Médicos y Educación Universitaria', 'Conservación Ambiental en Parque Nacional Pre-Delta'],
        'detalle_economico': 'Fuerte arraigo cooperativo y alta productividad agrícola por hectárea, potenciado por la salida de ultramar de granos sobre el canal navegable del Paraná.',
        'dato_territorial': 'Contiene el Parque Nacional Pre-Delta (2.608 ha), que protege el ecosistema de islas sedimentarias, lagunas y albardones del Delta Superior del río Paraná.'
    },
    {
        'id': 'nogoya',
        'raw_name': 'NOGOYA',
        'nombre': 'Nogoyá',
        'cabecera': 'Nogoyá',
        'codigo_ign': '30077',
        'poblacion_2022': 43195,
        'poblacion_2010': 39026,
        'poblacion_2001': 38840,
        'superficie_km2': 4378.6,
        'densidad_hab_km2': 9.9,
        'variacion_2010_2022_pct': 10.7,
        'porcentaje_provincial': 3.05,
        'urbano_pct': 81.0,
        'rural_pct': 19.0,
        'posicion_ranking_poblacion': 11,
        'posicion_ranking_densidad': 13,
        'localidades': ['Nogoyá', 'Lucas González', 'Hernández', 'Aranguren', 'Don Cristóbal Segunda', 'Betbeder', 'Febre'],
        'perfil_asentamiento': 'Rosario de pueblos y comunas agropecuarias alineadas sobre el corredor de la Ruta Nacional 12 y las antiguas vías del Ferrocarril Central Entrerriano, articuladas en torno a cuencas tamberas.',
        'actividades_principales': ['Núcleo de la Cuenca Lechera Provincial (Quesos y Leche en Polvo)', 'Agricultura de Secano (Soja, Trigo, Maíz, Lino Histórico)', 'Ganadería Bovina', 'Molinos Harineros e Industria Láctea'],
        'detalle_economico': 'Reconocida oficialmente como Capital Provincial de la Lechería por concentrar industrias queseras y tamberas de escala exportadora.',
        'dato_territorial': 'Paisaje de cuchillas suaves y onduladas con suelos brunos de aptitud agrícola mixta, atravesado por el arroyo Nogoyá.'
    },
    {
        'id': 'victoria',
        'raw_name': 'VICTORIA',
        'nombre': 'Victoria',
        'cabecera': 'Victoria',
        'codigo_ign': '30105',
        'poblacion_2022': 40652,
        'poblacion_2010': 35767,
        'poblacion_2001': 34097,
        'superficie_km2': 6638.9,
        'densidad_hab_km2': 6.1,
        'variacion_2010_2022_pct': 13.7,
        'porcentaje_provincial': 2.87,
        'urbano_pct': 85.5,
        'rural_pct': 14.5,
        'posicion_ranking_poblacion': 12,
        'posicion_ranking_densidad': 14,
        'localidades': ['Victoria', 'Rincón del Doll', 'Antelo', 'Molino Doll', 'Laguna del Pescado', 'Chilcas'],
        'perfil_asentamiento': 'Fuerte polarización urbana en la ciudad de Victoria (la "Ciudad de las Siete Colinas") en las barrancas occidentales; hacia el sur y sudoeste se extiende un inmenso territorio insular prácticamente despoblado.',
        'actividades_principales': ['Conectividad Bioceánica (Puente Rosario-Victoria)', 'Ganadería de Islas (Pastoreo Aluvial)', 'Pesca Comercial y Artesanal de Río', 'Turismo Receptivo de Fin de Semana y Termas', 'Agricultura en Terrazas Altas'],
        'detalle_economico': 'Evolución acelerada de su sector de servicios y turismo tras la inauguración de la conexión física con el Gran Rosario en 2003.',
        'dato_territorial': 'Más del 50% de la superficie departamental la integran islas y humedales del Delta del Paraná bajo un régimen hidrológico de crecidas y bajantes periódicas.'
    },
    {
        'id': 'tala',
        'raw_name': 'TALA',
        'nombre': 'Tala',
        'cabecera': 'Rosario del Tala',
        'codigo_ign': '30091',
        'poblacion_2022': 31309,
        'poblacion_2010': 25665,
        'poblacion_2001': 25892,
        'superficie_km2': 2643.2,
        'densidad_hab_km2': 11.8,
        'variacion_2010_2022_pct': 22.0,
        'porcentaje_provincial': 2.21,
        'urbano_pct': 77.0,
        'rural_pct': 23.0,
        'posicion_ranking_poblacion': 13,
        'posicion_ranking_densidad': 8,
        'localidades': ['Rosario del Tala', 'Maciá', 'Gobernador Mansilla', 'Gobernador Sola', 'Altamirano Sur', 'Durazno'],
        'perfil_asentamiento': 'Distribución equilibrada en ciudades intermedias a lo largo de la cuenca media del río Gualeguay, con fuerte identidad productiva por localidad (apicultura en Maciá, servicios en Rosario del Tala).',
        'actividades_principales': ['Apicultura de Escala Nacional e Internacional (Maciá)', 'Lechería y Queserías', 'Agricultura de Cereales y Oleaginosas', 'Avicultura y Ganadería Vacuna'],
        'detalle_economico': 'Maciá es la Capital Nacional de la Apicultura y sede de la mayor muestra apícola del Mercosur. El departamento registró el mayor crecimiento censal relativo del interior (+22%).',
        'dato_territorial': 'El río Gualeguay recorre longitudinalmente el departamento, vertebrando balnearios naturales, montes en galería y tierras de pastoreo.'
    },
    {
        'id': 'federal',
        'raw_name': 'FEDERAL',
        'nombre': 'Federal',
        'cabecera': 'Federal',
        'codigo_ign': '30035',
        'poblacion_2022': 29667,
        'poblacion_2010': 25863,
        'poblacion_2001': 25055,
        'superficie_km2': 5212.2,
        'densidad_hab_km2': 5.7,
        'variacion_2010_2022_pct': 14.7,
        'porcentaje_provincial': 2.09,
        'urbano_pct': 72.0,
        'rural_pct': 28.0,
        'posicion_ranking_poblacion': 14,
        'posicion_ranking_densidad': 15,
        'localidades': ['Federal', 'Conscripto Bernardi', 'Sauce de Luna', 'Nueva Vizcaya', 'El Cimarrón'],
        'perfil_asentamiento': 'Cabecera urbana central que nuclea servicios en un territorio de muy baja densidad, caracterizado por chacras ganaderas y poblados rurales dispersos en el monte del Espinal.',
        'actividades_principales': ['Ganadería Bovina Extensiva de Cría', 'Aprovechamiento Forestal de Monte Nativo (Ñandubay)', 'Artesanía Criolla en Cuchillería y Cuero', 'Festival Nacional del Chamamé'],
        'detalle_economico': 'Especialización en rodeo de cría bovina sobre campos rústicos y producción artesanal con reconocimiento nacional en platería y soguería tradicional.',
        'dato_territorial': 'Corazón de la histórica Selva de Montiel, emblemática ecorregión de bosques xerófilos de ñandubay, espinillo y algarrobo de enorme valor ecológico y folclórico.'
    },
    {
        'id': 'san-salvador',
        'raw_name': 'SAN SALVADOR',
        'nombre': 'San Salvador',
        'cabecera': 'San Salvador',
        'codigo_ign': '30088',
        'poblacion_2022': 20854,
        'poblacion_2010': 17357,
        'poblacion_2001': 16118,
        'superficie_km2': 1330.8,
        'densidad_hab_km2': 15.7,
        'variacion_2010_2022_pct': 20.1,
        'porcentaje_provincial': 1.47,
        'urbano_pct': 88.0,
        'rural_pct': 12.0,
        'posicion_ranking_poblacion': 15,
        'posicion_ranking_densidad': 9,
        'localidades': ['San Salvador', 'General Campos', 'San Ernesto', 'Colonia Baylina'],
        'perfil_asentamiento': 'Departamento más joven de la provincia (creado en 1995 por Ley Provincial N° 8980). Población concentrada en un eje urbano lineal a lo largo de la Ruta Nacional 18 y el ferrocarril.',
        'actividades_principales': ['Capital Nacional del Arroz (Molinos e Industrias de Secado)', 'Metalmecánica Ligera de Implementos Agrícolas', 'Cultivo de Arroz Bajo Riego', 'Agricultura de Soja y Sorgo'],
        'detalle_economico': 'Concentra el polo molinero arrocero más tecnificado del Cono Sur, exportando arroz pulido y elaborado a múltiples continentes.',
        'dato_territorial': 'Es el departamento de menor superficie de la provincia (1.330,8 km²), con una densidad agroindustrial notablemente concentrada.'
    },
    {
        'id': 'feliciano',
        'raw_name': 'FELICIANO',
        'nombre': 'Feliciano',
        'cabecera': 'San José de Feliciano',
        'codigo_ign': '30042',
        'poblacion_2022': 16803,
        'poblacion_2010': 15079,
        'poblacion_2001': 14584,
        'superficie_km2': 3171.3,
        'densidad_hab_km2': 5.3,
        'variacion_2010_2022_pct': 11.4,
        'porcentaje_provincial': 1.19,
        'urbano_pct': 68.0,
        'rural_pct': 32.0,
        'posicion_ranking_poblacion': 16,
        'posicion_ranking_densidad': 16,
        'localidades': ['San José de Feliciano', 'San Víctor', 'La Esmeralda', 'Distrito Manantiales', 'Chañar', 'Laguna Benítez'],
        'perfil_asentamiento': 'Territorio con la mayor proporción de población rural de Entre Ríos (32%); cabecera departamental de baja escala articulada con parajes y distritos de pequeños productores ganaderos.',
        'actividades_principales': ['Ganadería Bovina y Ovina Extensiva de Cría', 'Producción Textil y Artesanal Tradicional', 'Fiesta Provincial del Ternero Entrerriano', 'Agricultura de Secano Incipiente'],
        'detalle_economico': 'Economía orientada al rodeo vacuno de terneros para engorde en otras zonas de la provincia, caracterizada por la tenencia mixta de la tierra y labores de campo tradicionales.',
        'dato_territorial': 'Ubicado en el extremo septentrional de la provincia en el límite con Corrientes, surcado por los ríos Guayquiraró y Feliciano y esteros del norte.'
    },
    {
        'id': 'islas-del-ibicuy',
        'raw_name': 'ISLAS DEL IBICUY',
        'nombre': 'Islas del Ibicuy',
        'cabecera': 'Villa Paranacito',
        'codigo_ign': '30063',
        'poblacion_2022': 14000,
        'poblacion_2010': 12077,
        'poblacion_2001': 11498,
        'superficie_km2': 4930.5,
        'densidad_hab_km2': 2.8,
        'variacion_2010_2022_pct': 15.9,
        'porcentaje_provincial': 0.99,
        'urbano_pct': 65.0,
        'rural_pct': 35.0,
        'posicion_ranking_poblacion': 17,
        'posicion_ranking_densidad': 17,
        'localidades': ['Villa Paranacito', 'Ceibas', 'Ibicuy (Puerto Ibicuy)', 'Médanos', 'Ñancay', 'Mazaruca'],
        'perfil_asentamiento': 'Hábitat anfibio insular sin equivalente en la región: viviendas sobre pilotes a la vera de ríos y arroyos en Villa Paranacito con movilidad fluvial cotidiana, complementado por núcleos secos en el nudo vial de Ceibas y Médanos.',
        'actividades_principales': ['Minería de Arenas Silíceas para Fractura Hidráulica (Vaca Muerta)', 'Silvicultura de Maderas Blandas (Sauces y Álamos)', 'Ganadería de Islas y Apicultura de Delta', 'Puerto de Aguas Profundas (Puerto Ibicuy)', 'Turismo de Naturaleza'],
        'detalle_economico': 'Estratégico yacimiento de arenas silíceas de pureza mineral demandadas por la industria hidrocarburífera de Vaca Muerta, junto al puerto de ultramar natural de mayor calado de la cuenca.',
        'dato_territorial': 'Departamento con la menor densidad poblacional de Entre Ríos (2,8 hab/km²); su relieve y dinámica están definidos por el Delta del Paraná y el Complejo Zárate-Brazo Largo.'
    }
]

# Inject SVG paths into departments
for d in dept_details:
    raw = d['raw_name']
    if raw in svg_map:
        d['svg_path'] = svg_map[raw]['path']
        d['centroid_x'] = svg_map[raw]['cx']
        d['centroid_y'] = svg_map[raw]['cy']
    else:
        print('MISSING SVG:', raw)

final_data = {
    'provincia': {
        'nombre': 'Entre Ríos',
        'pais': 'Argentina',
        'descriptor': 'Atlas Interactivo de Entre Ríos',
        'poblacion_total_2022': 1415097,
        'poblacion_departamentos_suma_2022': 1425578,
        'poblacion_total_2010': 1235994,
        'poblacion_total_2001': 1158147,
        'superficie_total_km2': 78383.7,
        'densidad_media_hab_km2': 18.2,
        'total_departamentos': 17,
        'viviendas_particulares': 554492,
        'viviendas_colectivas': 981,
        'variacion_intercensal_2010_2022_pct': 14.5,
        'fuentes': [
            {'nombre': 'INDEC', 'descripcion': 'Censo Nacional de Población, Hogares y Viviendas 2022. Resultados definitivos.', 'url': 'https://censo.gob.ar/index.php/datos_definitivos_entre_rios/'},
            {'nombre': 'DGEC Entre Ríos', 'descripcion': 'Dirección General de Estadística y Censos de la Provincia de Entre Ríos.', 'url': 'https://www.entrerios.gov.ar/dgec/'},
            {'nombre': 'IGN', 'descripcion': 'Instituto Geográfico Nacional - Capas SIG Oficiales y Límites Departamentales.', 'url': 'https://www.ign.gob.ar/NuestrasActividades/InformacionGeoespacial/CapasSIG'}
        ],
        'piramide_etaria_2022': [
            {'grupo': '0-14 años', 'porcentaje': 21.8, 'poblacion_aprox': 308500},
            {'grupo': '15-64 años', 'porcentaje': 64.6, 'poblacion_aprox': 914100},
            {'grupo': '65+ años', 'porcentaje': 13.6, 'poblacion_aprox': 192500}
        ],
        'distribucion_urbana_rural_historica': {
            'urbana_pct': 87.2,
            'rural_pct': 12.8,
            'nota': 'Consolidación del proceso de concentración urbana provincial en corredores fluviales'
        }
    },
    'mapa_svg': {
        'viewBox': f"0 0 {target_width} {target_height}",
        'width': target_width,
        'height': target_height
    },
    'departamentos': dept_details,
    'cuencas_productivas': [
        {
            'id': 'avicola',
            'nombre': 'Complejo y Cuenca Avícola',
            'departamentos_clave': ['uruguay', 'colon', 'gualeguaychu', 'parana', 'villaguay'],
            'descripcion': 'Entre Ríos concentra más del 50% de la faena y producción avícola nacional (carne y huevos), con fuerte integración vertical y plantas frigoríficas de exportación sobre el río Uruguay y en Crespo.'
        },
        {
            'id': 'citricola',
            'nombre': 'Cuenca Citrícola del Noreste',
            'departamentos_clave': ['concordia', 'federacion'],
            'descripcion': 'Principal polo citrícola de mandarinas y naranjas de la Argentina, con empacadoras, industrias de jugos y exportaciones en fresco a contraestación.'
        },
        {
            'id': 'arrocera',
            'nombre': 'Cuenca Arrocera Central',
            'departamentos_clave': ['san-salvador', 'villaguay', 'concordia', 'colon'],
            'descripcion': 'San Salvador es la Capital Nacional del Arroz. Concentra los principales molinos arroceros, silos y tecnología de riego que procesan la producción mesopotámica.'
        },
        {
            'id': 'foresto_industrial',
            'nombre': 'Cuenca Foresto-Industrial',
            'departamentos_clave': ['concordia', 'federacion', 'colon', 'islas-del-ibicuy'],
            'descripcion': 'Plantaciones de eucalipto y pino en la costa del Uruguay y salicáceas en el Delta; más de 300 aserraderos activos y producción de celulosa y tableros.'
        },
        {
            'id': 'lechera',
            'nombre': 'Cuenca Lechera y Agroindustrial',
            'departamentos_clave': ['nogoya', 'tala', 'parana', 'diamante'],
            'descripcion': 'Nogoyá y Tala articulan la cuenca láctea provincial con industrias de secado de leche, queserías de escala nacional e importante agricultura de granos de secano.'
        },
        {
            'id': 'portuaria_logistica',
            'nombre': 'Complejo Portuario y Logístico',
            'departamentos_clave': ['uruguay', 'diamante', 'islas-del-ibicuy', 'victoria', 'parana'],
            'descripcion': 'Puertos de ultramar y barcazas (Concepción del Uruguay, Diamante, Ibicuy) y enlaces estratégicos interprovinciales (Túnel Subfluvial, Puente Rosario-Victoria, Complejo Zárate-Brazo Largo).'
        },
        {
            'id': 'ganadera_espinal',
            'nombre': 'Ganadería del Espinal y Pastizales',
            'departamentos_clave': ['la-paz', 'federal', 'feliciano', 'villaguay', 'gualeguay'],
            'descripcion': 'Cría e invernada bovina y ovina extensiva en montes nativos de ñandubay y algarrobo y pastizales naturales de las llanuras del centro y norte provincial.'
        },
        {
            'id': 'turistico_termal',
            'nombre': 'Corredores Turísticos y Termales',
            'departamentos_clave': ['colon', 'concordia', 'federacion', 'gualeguaychu', 'victoria', 'parana'],
            'descripcion': 'Circuito de más de 15 complejos termales, turismo de playas de río sobre el Uruguay y el Paraná, turismo de carnavales y parques nacionales (El Palmar y Pre-Delta).'
        }
    ],
    'galeria': [
        {
            'id': 'rio-uruguay-costa',
            'titulo': 'Corredor del Río Uruguay y Complejos Portuarios',
            'epigrafe': 'El río Uruguay constituye una arteria estratégica para el comercio exterior de Entre Ríos. Alberga el puerto de ultramar de Concepción del Uruguay y una franja de localidades de intensa actividad turística, citrícola y avícola.',
            'categoria': 'Infraestructura y Ríos',
            'placeholder_tipo': 'port',
            'archivo_imagen': './assets/images/rio_uruguay_puerto.svg'
        },
        {
            'id': 'palmar-colon',
            'titulo': 'Parque Nacional El Palmar (Departamento Colón)',
            'epigrafe': 'Reserva ecológica creada para proteger una de las últimas concentraciones de palmera yatay (Butia yatay) del mundo, representativa del pastizal y sabana del espinal mesopotámico.',
            'categoria': 'Paisaje y Conservación',
            'placeholder_tipo': 'nature',
            'archivo_imagen': './assets/images/palmar_colon.svg'
        },
        {
            'id': 'barrancas-parana',
            'titulo': 'Barrancas y Frente Fluvial del Río Paraná',
            'epigrafe': 'El relieve costero occidental muestra marcadas barrancas sedimentarias donde se emplazan Paraná, Diamante y La Paz, puntos clave para la conectividad y el embarque de granos.',
            'categoria': 'Geografía Física',
            'placeholder_tipo': 'river',
            'archivo_imagen': './assets/images/barrancas_parana.svg'
        },
        {
            'id': 'cuenca-citricola',
            'titulo': 'Quintas Citrícolas de Concordia y Federación',
            'epigrafe': 'Plantaciones de cítricos dulces (mandarinas y naranjas) sobre terrazas del río Uruguay, estructurando un paisaje productivo de minifundios y plantas de empaque exportador.',
            'categoria': 'Producción y Campo',
            'placeholder_tipo': 'agriculture',
            'archivo_imagen': './assets/images/quintas_citricolas.svg'
        },
        {
            'id': 'delta-ibicuy',
            'titulo': 'Humedales e Islas del Delta Entrerriano (Ibicuy y Victoria)',
            'epigrafe': 'El sistema de islas y arroyos conforma una geografía dinámica y anfibia, adaptada a la ganadería de islas, la silvicultura de sauces y álamos y la extracción de arenas silíceas.',
            'categoria': 'Geografía Humana',
            'placeholder_tipo': 'wetland',
            'archivo_imagen': './assets/images/delta_ibicuy.svg'
        },
        {
            'id': 'molinos-san-salvador',
            'titulo': 'Complejo Agroindustrial Arrocero de San Salvador',
            'epigrafe': 'Instalaciones de secado, molienda y fraccionamiento de arroz en el centro entrerriano, donde confluye la cosecha irrigada de la cuenca central y oriental.',
            'categoria': 'Agroindustria',
            'placeholder_tipo': 'industry',
            'archivo_imagen': './assets/images/molinos_arroz.svg'
        }
    ]
}

with open('data/entre-rios-data.json', 'w', encoding='utf-8') as f:
    json.dump(final_data, f, ensure_ascii=False, indent=2)

print('SUCCESS: Generated data/entre-rios-data.json with all 17 departments!')
