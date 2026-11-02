import os

placeholders = {
    'rio_uruguay_puerto.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E2E8F0"/>
      <stop offset="100%" stop-color="#CBD5E1"/>
    </linearGradient>
    <linearGradient id="water1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0284C7"/>
      <stop offset="100%" stop-color="#0369A1"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#sky1)"/>
  <!-- Horizon & River -->
  <rect y="280" width="800" height="220" fill="url(#water1)"/>
  <!-- Distant Coastline -->
  <path d="M0,280 Q200,270 400,280 T800,275 L800,300 L0,300 Z" fill="#94A3B8" opacity="0.6"/>
  <!-- Port Cranes and Silos -->
  <rect x="80" y="200" width="50" height="80" fill="#475569"/>
  <rect x="140" y="180" width="45" height="100" fill="#334155"/>
  <rect x="195" y="210" width="40" height="70" fill="#475569"/>
  <!-- Crane 1 -->
  <line x1="280" y1="280" x2="310" y2="140" stroke="#0F172A" stroke-width="4"/>
  <line x1="310" y1="140" x2="380" y2="120" stroke="#0F172A" stroke-width="3"/>
  <line x1="310" y1="140" x2="270" y2="160" stroke="#0F172A" stroke-width="2"/>
  <line x1="360" y1="126" x2="360" y2="200" stroke="#0F172A" stroke-width="1.5" stroke-dasharray="4,2"/>
  <!-- Cargo vessel silhouette -->
  <polygon points="460,290 480,260 680,260 720,290" fill="#1E293B"/>
  <rect x="520" y="240" width="120" height="20" fill="#DC2626"/>
  <rect x="630" y="220" width="40" height="40" fill="#F8FAFC"/>
  <!-- Water ripples -->
  <line x1="100" y1="340" x2="240" y2="340" stroke="#38BDF8" stroke-width="2" opacity="0.5"/>
  <line x1="300" y1="370" x2="520" y2="370" stroke="#38BDF8" stroke-width="2" opacity="0.4"/>
  <line x1="160" y1="420" x2="420" y2="420" stroke="#38BDF8" stroke-width="2" opacity="0.5"/>
  <!-- Technical Overlay Label -->
  <rect x="25" y="25" width="220" height="32" rx="4" fill="#0F172A" opacity="0.85"/>
  <text x="35" y="46" font-family="monospace" font-size="12" fill="#38BDF8" letter-spacing="1">PUERTO ULTRAMAR · RÍO URUGUAY</text>
</svg>''',

    'palmar_colon.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FED7AA"/>
      <stop offset="60%" stop-color="#FFEDD5"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
    <linearGradient id="ground2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#84CC16"/>
      <stop offset="100%" stop-color="#4D7C0F"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#sky2)"/>
  <!-- Sun -->
  <circle cx="400" cy="220" r="70" fill="#FDBA74" opacity="0.6"/>
  <!-- Savanna Hills -->
  <path d="M0,320 Q200,290 400,320 T800,310 L800,500 L0,500 Z" fill="#65A30D" opacity="0.7"/>
  <path d="M0,360 Q300,330 600,360 T800,350 L800,500 L0,500 Z" fill="url(#ground2)"/>
  <!-- Yatay Palm 1 -->
  <path d="M180,420 Q185,250 190,160" stroke="#78350F" stroke-width="7" fill="none"/>
  <!-- Palm Fronds -->
  <path d="M190,160 Q140,110 90,150" stroke="#15803D" stroke-width="4" fill="none"/>
  <path d="M190,160 Q210,100 240,130" stroke="#15803D" stroke-width="4" fill="none"/>
  <path d="M190,160 Q180,90 160,110" stroke="#16A34A" stroke-width="4" fill="none"/>
  <path d="M190,160 Q240,120 280,160" stroke="#15803D" stroke-width="4" fill="none"/>
  <path d="M190,160 Q150,140 120,180" stroke="#16A34A" stroke-width="4" fill="none"/>
  <!-- Yatay Palm 2 (center background) -->
  <path d="M420,380 Q415,280 410,210" stroke="#78350F" stroke-width="5" fill="none"/>
  <path d="M410,210 Q370,170 340,200" stroke="#166534" stroke-width="3" fill="none"/>
  <path d="M410,210 Q430,160 460,190" stroke="#166534" stroke-width="3" fill="none"/>
  <path d="M410,210 Q400,150 390,170" stroke="#15803D" stroke-width="3" fill="none"/>
  <path d="M410,210 Q440,180 470,220" stroke="#166534" stroke-width="3" fill="none"/>
  <!-- Yatay Palm 3 (right foreground) -->
  <path d="M620,440 Q615,260 610,140" stroke="#78350F" stroke-width="8" fill="none"/>
  <path d="M610,140 Q550,80 500,120" stroke="#15803D" stroke-width="5" fill="none"/>
  <path d="M610,140 Q640,70 680,100" stroke="#15803D" stroke-width="5" fill="none"/>
  <path d="M610,140 Q600,60 570,80" stroke="#16A34A" stroke-width="4" fill="none"/>
  <path d="M610,140 Q670,100 720,140" stroke="#15803D" stroke-width="5" fill="none"/>
  <!-- Grass tufts -->
  <path d="M80,450 L90,430 L100,450 M95,450 L105,425 L115,450" stroke="#365314" stroke-width="2"/>
  <path d="M300,460 L310,440 L320,460 M315,460 L325,435 L335,460" stroke="#365314" stroke-width="2"/>
  <!-- Technical Overlay Label -->
  <rect x="25" y="25" width="220" height="32" rx="4" fill="#0F172A" opacity="0.85"/>
  <text x="35" y="46" font-family="monospace" font-size="12" fill="#4ADE80" letter-spacing="1">PARQUE NACIONAL · EL PALMAR</text>
</svg>''',

    'barrancas_parana.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="sky3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E0F2FE"/>
      <stop offset="100%" stop-color="#BAE6FD"/>
    </linearGradient>
    <linearGradient id="bluff" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#78716C"/>
      <stop offset="40%" stop-color="#A8A29E"/>
      <stop offset="100%" stop-color="#57534E"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#sky3)"/>
  <!-- Broad Paraná River Flow -->
  <path d="M0,280 C200,260 500,290 800,270 L800,500 L0,500 Z" fill="#0284C7"/>
  <!-- Low delta islands in river -->
  <ellipse cx="280" cy="360" rx="140" ry="25" fill="#15803D" opacity="0.85"/>
  <ellipse cx="600" cy="330" rx="110" ry="18" fill="#166534" opacity="0.85"/>
  <!-- High Cliffs / Barrancas on Left -->
  <path d="M0,80 L220,110 L260,180 L230,240 L280,310 L0,320 Z" fill="url(#bluff)"/>
  <!-- Geological Stratification lines -->
  <path d="M0,130 Q120,140 240,160" stroke="#44403C" stroke-width="2" fill="none"/>
  <path d="M0,175 Q110,185 235,210" stroke="#44403C" stroke-width="2.5" fill="none"/>
  <path d="M0,225 Q130,230 250,265" stroke="#292524" stroke-width="3" fill="none"/>
  <!-- Vegetation on top edge -->
  <path d="M0,80 Q40,70 80,82 Q120,72 160,85 Q200,75 220,110" stroke="#166534" stroke-width="8" fill="none"/>
  <!-- River barge / grain transporter -->
  <polygon points="420,410 440,395 560,395 580,410" fill="#334155"/>
  <rect x="460" y="380" width="80" height="15" fill="#DC2626"/>
  <rect x="535" y="365" width="20" height="20" fill="#F8FAFC"/>
  <!-- Ripples -->
  <line x1="380" y1="440" x2="620" y2="440" stroke="#7DD3FC" stroke-width="2" opacity="0.6"/>
  <!-- Technical Overlay Label -->
  <rect x="25" y="25" width="220" height="32" rx="4" fill="#0F172A" opacity="0.85"/>
  <text x="35" y="46" font-family="monospace" font-size="12" fill="#7DD3FC" letter-spacing="1">BARRANCAS · RÍO PARANÁ</text>
</svg>''',

    'quintas_citricolas.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="sky4" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#EFF6FF"/>
      <stop offset="100%" stop-color="#DBEAFE"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#sky4)"/>
  <!-- Rolling orchard grounds -->
  <rect y="220" width="800" height="280" fill="#FEF08A" opacity="0.4"/>
  <!-- Perspective Orchard Rows -->
  <line x1="400" y1="220" x2="50" y2="500" stroke="#A16207" stroke-width="4"/>
  <line x1="400" y1="220" x2="220" y2="500" stroke="#A16207" stroke-width="4"/>
  <line x1="400" y1="220" x2="400" y2="500" stroke="#A16207" stroke-width="4"/>
  <line x1="400" y1="220" x2="580" y2="500" stroke="#A16207" stroke-width="4"/>
  <line x1="400" y1="220" x2="750" y2="500" stroke="#A16207" stroke-width="4"/>
  <!-- Citrus Trees Row Left (Foreground to background) -->
  <circle cx="100" cy="440" r="45" fill="#15803D"/>
  <circle cx="95" cy="435" r="7" fill="#F97316"/>
  <circle cx="115" cy="450" r="7" fill="#EA580C"/>
  <circle cx="85" cy="455" r="6" fill="#F97316"/>
  
  <circle cx="170" cy="370" r="35" fill="#166534"/>
  <circle cx="165" cy="365" r="5" fill="#F97316"/>
  <circle cx="180" cy="375" r="5" fill="#EA580C"/>
  
  <circle cx="230" cy="310" r="28" fill="#15803D"/>
  <circle cx="280" cy="265" r="20" fill="#166534"/>
  <circle cx="330" cy="235" r="14" fill="#15803D"/>
  <!-- Citrus Trees Row Right -->
  <circle cx="700" cy="440" r="45" fill="#15803D"/>
  <circle cx="695" cy="435" r="7" fill="#F97316"/>
  <circle cx="715" cy="450" r="7" fill="#EA580C"/>
  <circle cx="685" cy="455" r="6" fill="#F97316"/>

  <circle cx="630" cy="370" r="35" fill="#166534"/>
  <circle cx="570" cy="310" r="28" fill="#15803D"/>
  <circle cx="520" cy="265" r="20" fill="#166534"/>
  <circle cx="470" cy="235" r="14" fill="#15803D"/>
  <!-- Packing Shed in Background -->
  <polygon points="360,210 400,185 440,210" fill="#DC2626"/>
  <rect x="365" y="210" width="70" height="25" fill="#94A3B8"/>
  <!-- Technical Overlay Label -->
  <rect x="25" y="25" width="220" height="32" rx="4" fill="#0F172A" opacity="0.85"/>
  <text x="35" y="46" font-family="monospace" font-size="12" fill="#FB923C" letter-spacing="1">CUENCA CITRÍCOLA · CONCORDIA</text>
</svg>''',

    'delta_ibicuy.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="sky5" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E2E8F0"/>
      <stop offset="100%" stop-color="#CBD5E1"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#sky5)"/>
  <!-- Water Maze -->
  <rect y="240" width="800" height="260" fill="#0369A1"/>
  <!-- Delta Islets -->
  <path d="M-50,300 C150,280 250,360 450,320 C650,280 750,340 850,300 L850,500 L-50,500 Z" fill="#15803D" opacity="0.8"/>
  <path d="M100,420 C300,380 400,440 700,410 L700,500 L100,500 Z" fill="#166534"/>
  <!-- Stilt House (Palafito) -->
  <rect x="180" y="260" width="70" height="50" fill="#B45309"/>
  <polygon points="175,260 215,230 255,260" fill="#78350F"/>
  <!-- Stilts/Pilotes -->
  <line x1="190" y1="310" x2="190" y2="350" stroke="#451A03" stroke-width="4"/>
  <line x1="215" y1="310" x2="215" y2="355" stroke="#451A03" stroke-width="4"/>
  <line x1="240" y1="310" x2="240" y2="350" stroke="#451A03" stroke-width="4"/>
  <line x1="170" y1="320" x2="260" y2="320" stroke="#451A03" stroke-width="3"/>
  <!-- Wooden Boat (Lancha) -->
  <polygon points="280,365 330,365 320,380 290,380" fill="#F8FAFC"/>
  <!-- Willows / Sauces y álamos -->
  <path d="M540,360 Q545,280 550,210" stroke="#78350F" stroke-width="6" fill="none"/>
  <ellipse cx="550" cy="200" rx="40" ry="60" fill="#22C55E" opacity="0.8"/>
  <path d="M620,380 Q625,300 630,230" stroke="#78350F" stroke-width="6" fill="none"/>
  <ellipse cx="630" cy="220" rx="35" ry="55" fill="#16A34A" opacity="0.8"/>
  <!-- Reeds / Juncales -->
  <path d="M40,370 L50,330 M45,370 L55,320 M50,370 L65,335" stroke="#4D7C0F" stroke-width="3"/>
  <path d="M420,450 L430,410 M425,450 L435,400 M430,450 L445,415" stroke="#4D7C0F" stroke-width="3"/>
  <!-- Technical Overlay Label -->
  <rect x="25" y="25" width="220" height="32" rx="4" fill="#0F172A" opacity="0.85"/>
  <text x="35" y="46" font-family="monospace" font-size="12" fill="#38BDF8" letter-spacing="1">DELTA E ISLAS · IBICUY</text>
</svg>''',

    'molinos_arroz.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="sky6" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F1F5F9"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#sky6)"/>
  <!-- Ground and Paddy fields -->
  <rect y="260" width="800" height="240" fill="#E2E8F0"/>
  <!-- Irrigated Rice Terraces -->
  <polygon points="0,320 800,290 800,340 0,370" fill="#86EFAC" opacity="0.6"/>
  <polygon points="0,380 800,350 800,430 0,460" fill="#4ADE80" opacity="0.5"/>
  <!-- Rice Silos Battery -->
  <rect x="220" y="160" width="60" height="120" rx="5" fill="#94A3B8"/>
  <path d="M220,160 Q250,130 280,160 Z" fill="#64748B"/>
  
  <rect x="295" y="150" width="70" height="130" rx="5" fill="#CBD5E1"/>
  <path d="M295,150 Q330,115 365,150 Z" fill="#94A3B8"/>

  <rect x="380" y="160" width="60" height="120" rx="5" fill="#94A3B8"/>
  <path d="M380,160 Q410,130 440,160 Z" fill="#64748B"/>

  <!-- Conveyor Bridges and Elevator -->
  <rect x="460" y="120" width="30" height="160" fill="#334155"/>
  <line x1="220" y1="170" x2="475" y2="135" stroke="#0F172A" stroke-width="4"/>
  <!-- Mill Industrial Facility Building -->
  <rect x="490" y="190" width="120" height="90" fill="#475569"/>
  <polygon points="485,190 550,165 615,190" fill="#1E293B"/>
  <rect x="520" y="240" width="25" height="40" fill="#0F172A"/>
  <!-- Transport Truck -->
  <rect x="120" y="270" width="55" height="25" fill="#DC2626"/>
  <circle cx="132" cy="295" r="6" fill="#0F172A"/>
  <circle cx="160" cy="295" r="6" fill="#0F172A"/>
  <!-- Technical Overlay Label -->
  <rect x="25" y="25" width="220" height="32" rx="4" fill="#0F172A" opacity="0.85"/>
  <text x="35" y="46" font-family="monospace" font-size="12" fill="#22C55E" letter-spacing="1">COMPLEJO ARROCERO · SAN SALVADOR</text>
</svg>'''
}

for filename, content in placeholders.items():
    path = os.path.join('assets', 'images', filename)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip())
    print(f'Created {path}')
