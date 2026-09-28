// Comprehensive Urban Water Distribution Network & Digital Twin Topology
// Features 4 District Metered Areas (DMAs), 28 pipeline segments, 18 junction/sensor nodes, 
// 12 boundary & isolation valves, and smart meter consumer zones.

export const DMA_ZONES = [
  {
    id: 'DMA-01',
    name: 'Sector A: Downtown Commercial & Civic Hub',
    color: '#06b6d4', // Cyan
    population: 48500,
    activeConnections: 3420,
    pipeLengthKm: 42.6,
    avgPressureBar: 3.8,
    targetNRWPercent: 9.5,
    currentNRWPercent: 11.2,
    baseDemandM3h: 380,
    elevationRangeM: '12 - 28m',
    criticalAssets: ['City General Hospital', 'Central Rail Station', 'Financial Plaza']
  },
  {
    id: 'DMA-02',
    name: 'Sector B: North Metro High-Density Residential',
    color: '#3b82f6', // Blue
    population: 82000,
    activeConnections: 8910,
    pipeLengthKm: 68.4,
    avgPressureBar: 4.2,
    targetNRWPercent: 12.0,
    currentNRWPercent: 18.7, // elevated due to recent micro-leaks
    baseDemandM3h: 620,
    elevationRangeM: '25 - 54m',
    criticalAssets: ['North Metro University', 'Olympic Sports Complex']
  },
  {
    id: 'DMA-03',
    name: 'Sector C: East Industrial Park & Logistics',
    color: '#8b5cf6', // Violet
    population: 19500,
    activeConnections: 1150,
    pipeLengthKm: 34.2,
    avgPressureBar: 4.8,
    targetNRWPercent: 8.0,
    currentNRWPercent: 9.1,
    baseDemandM3h: 510,
    elevationRangeM: '10 - 22m',
    criticalAssets: ['Advanced Tech Park', 'Pharmaceutical Plant', 'Freight Terminal']
  },
  {
    id: 'DMA-04',
    name: 'Sector D: Suburban Green Ridge & Hillside',
    color: '#10b981', // Emerald
    population: 34000,
    activeConnections: 4120,
    pipeLengthKm: 51.8,
    avgPressureBar: 3.5,
    targetNRWPercent: 10.0,
    currentNRWPercent: 14.3,
    baseDemandM3h: 290,
    elevationRangeM: '45 - 98m',
    criticalAssets: ['Hillside Pumping Cascade', 'Forest Ridge Reservoir']
  }
];

export const NETWORK_NODES = [
  // Primary Sources & Pumping Stations
  { id: 'RES-01', name: 'Clearwater Central Reservoir & WTP', type: 'reservoir', dma: 'DMA-01', x: 180, y: 140, capacityM3: 45000, currentLevelPct: 87, headPressureBar: 5.8 },
  { id: 'RES-02', name: 'Forest Ridge Elevated Reservoir', type: 'reservoir', dma: 'DMA-04', x: 820, y: 160, capacityM3: 28000, currentLevelPct: 74, headPressureBar: 6.2 },
  { id: 'PUMP-01', name: 'Main Booster Pump Station 1', type: 'pump', dma: 'DMA-01', x: 260, y: 220, flowRatingM3h: 1200, status: 'RUNNING', kwPower: 145 },
  { id: 'PUMP-02', name: 'Hillside Booster Station 2', type: 'pump', dma: 'DMA-04', x: 740, y: 240, flowRatingM3h: 800, status: 'RUNNING', kwPower: 92 },

  // Key Pressure Reducing Valves (PRVs) & Inflow Meters
  { id: 'PRV-01', name: 'DMA-01 Inflow PRV & MagFlow', type: 'prv', dma: 'DMA-01', x: 340, y: 300, setPressureBar: 3.8, valveOpeningPct: 72 },
  { id: 'PRV-02', name: 'DMA-02 Pressure Regulator', type: 'prv', dma: 'DMA-02', x: 500, y: 180, setPressureBar: 4.2, valveOpeningPct: 65 },
  { id: 'PRV-03', name: 'DMA-03 Industrial PRV', type: 'prv', dma: 'DMA-03', x: 440, y: 460, setPressureBar: 4.8, valveOpeningPct: 80 },

  // Main Urban Junctions & Sensor Clusters
  { id: 'J-101', name: 'Downtown Central Square Node', type: 'junction', dma: 'DMA-01', x: 300, y: 380, elevationM: 16, sensorInstalled: 'PS-101 (Pressure) + AC-101 (Acoustic)' },
  { id: 'J-102', name: 'Civic Center Crossway', type: 'junction', dma: 'DMA-01', x: 220, y: 450, elevationM: 14, sensorInstalled: 'PS-102 (Pressure)' },
  { id: 'J-103', name: 'Financial District Terminal', type: 'junction', dma: 'DMA-01', x: 360, y: 490, elevationM: 18, sensorInstalled: 'AC-102 (Acoustic)' },
  
  { id: 'J-201', name: 'North Metro Interchange', type: 'junction', dma: 'DMA-02', x: 520, y: 280, elevationM: 32, sensorInstalled: 'PS-201 (Pressure) + FM-201 (Flow)' },
  { id: 'J-202', name: 'University Campus Gate Junction', type: 'junction', dma: 'DMA-02', x: 620, y: 220, elevationM: 38, sensorInstalled: 'AC-201 (Acoustic)' },
  { id: 'J-203', name: 'North Residential Boulevard', type: 'junction', dma: 'DMA-02', x: 660, y: 350, elevationM: 45, sensorInstalled: 'PS-202 (Pressure) + AC-202 (Acoustic)' },
  { id: 'J-204', name: 'Metro East Crossing', type: 'junction', dma: 'DMA-02', x: 550, y: 410, elevationM: 36, sensorInstalled: 'PS-203 (Pressure)' },

  { id: 'J-301', name: 'Tech Park Main Branch', type: 'junction', dma: 'DMA-03', x: 400, y: 560, elevationM: 14, sensorInstalled: 'PS-301 (Pressure) + FM-301 (Flow)' },
  { id: 'J-302', name: 'Pharma Zone Feeder', type: 'junction', dma: 'DMA-03', x: 530, y: 580, elevationM: 12, sensorInstalled: 'AC-301 (Acoustic)' },
  { id: 'J-303', name: 'Freight Terminal Loop', type: 'junction', dma: 'DMA-03', x: 610, y: 520, elevationM: 15, sensorInstalled: 'PS-302 (Pressure)' },

  { id: 'J-401', name: 'Hillside Ascent Junction', type: 'junction', dma: 'DMA-04', x: 760, y: 340, elevationM: 62, sensorInstalled: 'PS-401 (Pressure)' },
  { id: 'J-402', name: 'Green Ridge Summit Node', type: 'junction', dma: 'DMA-04', x: 860, y: 300, elevationM: 88, sensorInstalled: 'AC-401 (Acoustic) + PS-402 (Pressure)' },
  { id: 'J-403', name: 'South Hill Crest', type: 'junction', dma: 'DMA-04', x: 800, y: 450, elevationM: 78, sensorInstalled: 'PS-403 (Pressure)' }
];

export const PIPELINE_SEGMENTS = [
  // Primary Transmission Trunks
  { id: 'P-01', from: 'RES-01', to: 'PUMP-01', dma: 'DMA-01', lengthM: 620, diameterMm: 600, material: 'Ductile Iron', installedYear: 2014, baseFlowM3h: 1150, basePressureDropBar: 0.15, soilType: 'Sandy Loam', cFactor: 130, riskScore: 18 },
  { id: 'P-02', from: 'PUMP-01', to: 'PRV-01', dma: 'DMA-01', lengthM: 950, diameterMm: 500, material: 'Ductile Iron', installedYear: 2012, baseFlowM3h: 750, basePressureDropBar: 0.28, soilType: 'Clay (Corrosive)', cFactor: 125, riskScore: 32 },
  { id: 'P-03', from: 'PUMP-01', to: 'PRV-02', dma: 'DMA-02', lengthM: 1420, diameterMm: 500, material: 'Cast Iron', installedYear: 1998, baseFlowM3h: 680, basePressureDropBar: 0.42, soilType: 'Clay (Corrosive)', cFactor: 100, riskScore: 68 }, // Aging pipeline
  { id: 'P-04', from: 'RES-02', to: 'PUMP-02', dma: 'DMA-04', lengthM: 840, diameterMm: 450, material: 'Ductile Iron', installedYear: 2016, baseFlowM3h: 720, basePressureDropBar: 0.20, soilType: 'Gravelly Sand', cFactor: 135, riskScore: 14 },

  // Sector A (Downtown) Distribution
  { id: 'P-101', from: 'PRV-01', to: 'J-101', dma: 'DMA-01', lengthM: 580, diameterMm: 350, material: 'Ductile Iron', installedYear: 2008, baseFlowM3h: 380, basePressureDropBar: 0.18, soilType: 'Urban Fill', cFactor: 120, riskScore: 28 },
  { id: 'P-102', from: 'J-101', to: 'J-102', dma: 'DMA-01', lengthM: 640, diameterMm: 250, material: 'Cast Iron', installedYear: 1992, baseFlowM3h: 180, basePressureDropBar: 0.25, soilType: 'Clay (Corrosive)', cFactor: 95, riskScore: 74 }, // High risk
  { id: 'P-103', from: 'J-101', to: 'J-103', dma: 'DMA-01', lengthM: 710, diameterMm: 250, material: 'Ductile Iron', installedYear: 2010, baseFlowM3h: 160, basePressureDropBar: 0.22, soilType: 'Urban Fill', cFactor: 120, riskScore: 24 },
  { id: 'P-104', from: 'J-102', to: 'J-103', dma: 'DMA-01', lengthM: 520, diameterMm: 200, material: 'HDPE', installedYear: 2020, baseFlowM3h: 90, basePressureDropBar: 0.12, soilType: 'Sandy Loam', cFactor: 140, riskScore: 10 },

  // Sector B (North Metro) Distribution - Leak prone
  { id: 'P-201', from: 'PRV-02', to: 'J-201', dma: 'DMA-02', lengthM: 880, diameterMm: 400, material: 'Cast Iron', installedYear: 1995, baseFlowM3h: 620, basePressureDropBar: 0.35, soilType: 'Clay (Corrosive)', cFactor: 98, riskScore: 82 }, // High Risk
  { id: 'P-202', from: 'J-201', to: 'J-202', dma: 'DMA-02', lengthM: 740, diameterMm: 300, material: 'Ductile Iron', installedYear: 2005, baseFlowM3h: 310, basePressureDropBar: 0.26, soilType: 'Urban Fill', cFactor: 115, riskScore: 42 },
  { id: 'P-203', from: 'J-202', to: 'J-203', dma: 'DMA-02', lengthM: 920, diameterMm: 250, material: 'Asbestos Cement', installedYear: 1989, baseFlowM3h: 240, basePressureDropBar: 0.38, soilType: 'Clay (Corrosive)', cFactor: 90, riskScore: 89 }, // Critical asset
  { id: 'P-204', from: 'J-201', to: 'J-204', dma: 'DMA-02', lengthM: 810, diameterMm: 300, material: 'Ductile Iron', installedYear: 2007, baseFlowM3h: 280, basePressureDropBar: 0.24, soilType: 'Sandy Loam', cFactor: 120, riskScore: 35 },
  { id: 'P-205', from: 'J-204', to: 'J-203', dma: 'DMA-02', lengthM: 690, diameterMm: 200, material: 'HDPE', installedYear: 2018, baseFlowM3h: 110, basePressureDropBar: 0.14, soilType: 'Sandy Loam', cFactor: 140, riskScore: 12 },

  // Sector C (Industrial East)
  { id: 'P-301', from: 'PRV-01', to: 'PRV-03', dma: 'DMA-03', lengthM: 1100, diameterMm: 450, material: 'Steel (Welded)', installedYear: 2015, baseFlowM3h: 530, basePressureDropBar: 0.30, soilType: 'Sandy Loam', cFactor: 130, riskScore: 22 },
  { id: 'P-302', from: 'PRV-03', to: 'J-301', dma: 'DMA-03', lengthM: 650, diameterMm: 350, material: 'Ductile Iron', installedYear: 2011, baseFlowM3h: 360, basePressureDropBar: 0.21, soilType: 'Urban Fill', cFactor: 125, riskScore: 26 },
  { id: 'P-303', from: 'J-301', to: 'J-302', dma: 'DMA-03', lengthM: 780, diameterMm: 300, material: 'Ductile Iron', installedYear: 2013, baseFlowM3h: 220, basePressureDropBar: 0.20, soilType: 'Sandy Loam', cFactor: 125, riskScore: 20 },
  { id: 'P-304', from: 'J-302', to: 'J-303', dma: 'DMA-03', lengthM: 830, diameterMm: 250, material: 'Cast Iron', installedYear: 2001, baseFlowM3h: 140, basePressureDropBar: 0.29, soilType: 'Clay (Corrosive)', cFactor: 105, riskScore: 56 },
  { id: 'P-305', from: 'J-204', to: 'J-303', dma: 'DMA-03', lengthM: 920, diameterMm: 250, material: 'Ductile Iron', installedYear: 2009, baseFlowM3h: 120, basePressureDropBar: 0.22, soilType: 'Urban Fill', cFactor: 120, riskScore: 31 },

  // Sector D (Suburban Hillside)
  { id: 'P-401', from: 'PUMP-02', to: 'J-401', dma: 'DMA-04', lengthM: 720, diameterMm: 350, material: 'Ductile Iron', installedYear: 2017, baseFlowM3h: 390, basePressureDropBar: 0.25, soilType: 'Rocky / Silt', cFactor: 135, riskScore: 16 },
  { id: 'P-402', from: 'J-401', to: 'J-402', dma: 'DMA-04', lengthM: 880, diameterMm: 250, material: 'HDPE', installedYear: 2019, baseFlowM3h: 210, basePressureDropBar: 0.32, soilType: 'Rocky / Silt', cFactor: 140, riskScore: 11 },
  { id: 'P-403', from: 'J-401', to: 'J-403', dma: 'DMA-04', lengthM: 940, diameterMm: 250, material: 'Cast Iron', installedYear: 1996, baseFlowM3h: 170, basePressureDropBar: 0.36, soilType: 'Clay (Corrosive)', cFactor: 98, riskScore: 78 }, // High Risk
  { id: 'P-404', from: 'J-402', to: 'J-403', dma: 'DMA-04', lengthM: 670, diameterMm: 200, material: 'Ductile Iron', installedYear: 2006, baseFlowM3h: 80, basePressureDropBar: 0.18, soilType: 'Rocky / Silt', cFactor: 120, riskScore: 38 },
  { id: 'P-405', from: 'J-203', to: 'J-401', dma: 'DMA-04', lengthM: 1050, diameterMm: 300, material: 'Ductile Iron', installedYear: 2008, baseFlowM3h: 190, basePressureDropBar: 0.34, soilType: 'Sandy Loam', cFactor: 120, riskScore: 34 }
];

export const ISOLATION_VALVES = [
  { id: 'V-01', name: 'Main Intake Gate Valve V-01', location: 'P-01', pipeId: 'P-01', x: 220, y: 180, status: 'OPEN', actuatorType: 'Motorized SCADA' },
  { id: 'V-02', name: 'PRV-01 Upstream Isolation V-02', location: 'P-02', pipeId: 'P-02', x: 300, y: 260, status: 'OPEN', actuatorType: 'Motorized SCADA' },
  { id: 'V-03', name: 'Sector B North Trunk Valve V-03', location: 'P-03', pipeId: 'P-03', x: 380, y: 200, status: 'OPEN', actuatorType: 'Motorized SCADA' },
  { id: 'V-101', name: 'Downtown Loop Isolation V-101', location: 'P-102', pipeId: 'P-102', x: 260, y: 415, status: 'OPEN', actuatorType: 'Manual Handwheel' },
  { id: 'V-201', name: 'North Metro Interconnect V-201', location: 'P-201', pipeId: 'P-201', x: 510, y: 230, status: 'OPEN', actuatorType: 'Motorized SCADA' },
  { id: 'V-202', name: 'University Boulevard Isolation V-202', location: 'P-203', pipeId: 'P-203', x: 640, y: 285, status: 'OPEN', actuatorType: 'Motorized SCADA' },
  { id: 'V-203', name: 'North-East Crossway Valve V-203', location: 'P-205', pipeId: 'P-205', x: 605, y: 380, status: 'OPEN', actuatorType: 'Manual Handwheel' },
  { id: 'V-301', name: 'Tech Park Feeder Valve V-301', location: 'P-302', pipeId: 'P-302', x: 420, y: 510, status: 'OPEN', actuatorType: 'Motorized SCADA' },
  { id: 'V-302', name: 'Industrial Boundary Valve V-302', location: 'P-305', pipeId: 'P-305', x: 580, y: 465, status: 'OPEN', actuatorType: 'Manual Handwheel' },
  { id: 'V-401', name: 'Hillside Booster Isolation V-401', location: 'P-401', pipeId: 'P-401', x: 750, y: 290, status: 'OPEN', actuatorType: 'Motorized SCADA' },
  { id: 'V-402', name: 'Ridge Summit Boundary V-402', location: 'P-403', pipeId: 'P-403', x: 780, y: 395, status: 'OPEN', actuatorType: 'Manual Handwheel' }
];

export const SMART_METERS_DATA = [
  {
    meterId: 'AMI-10024',
    accountHolder: 'Horizon Grand Hotel & Suites',
    category: 'Commercial',
    dma: 'DMA-01',
    address: '420 Civic Plaza, Downtown',
    pipeConnected: 'P-101',
    dailyAvgM3: 42.5,
    todayUsageM3: 44.1,
    anomalyStatus: 'NORMAL',
    anomalyConfidence: 0.05,
    description: 'Expected peak morning and evening occupancy consumption.',
    hourlyProfile24h: [0.8, 0.6, 0.5, 0.5, 0.9, 1.8, 3.2, 3.9, 3.4, 2.8, 2.5, 2.9, 2.7, 2.4, 2.2, 2.5, 2.9, 3.8, 4.1, 3.6, 2.4, 1.8, 1.2, 0.9]
  },
  {
    meterId: 'AMI-10089',
    accountHolder: 'Dr. Sarah Jenkins Residence',
    category: 'Residential',
    dma: 'DMA-01',
    address: '18 Elmwood Terrace, Sector A',
    pipeConnected: 'P-102',
    dailyAvgM3: 0.45,
    todayUsageM3: 2.85,
    anomalyStatus: 'CONTINUOUS_LEAK', // Toilet flapper leak
    anomalyConfidence: 0.94,
    description: 'Continuous 0.12 m³/h steady baseline flow detected during 01:00-05:00 AM sleeping hours. High probability of faulty internal cistern/flapper valve.',
    hourlyProfile24h: [0.12, 0.12, 0.11, 0.12, 0.13, 0.18, 0.24, 0.28, 0.15, 0.12, 0.12, 0.12, 0.14, 0.12, 0.12, 0.13, 0.17, 0.25, 0.22, 0.16, 0.13, 0.12, 0.12, 0.12]
  },
  {
    meterId: 'AMI-20412',
    accountHolder: 'Maplewood Luxury Condominiums (48 Units)',
    category: 'Residential',
    dma: 'DMA-02',
    address: '740 University Blvd, Sector B',
    pipeConnected: 'P-202',
    dailyAvgM3: 16.2,
    todayUsageM3: 15.8,
    anomalyStatus: 'NORMAL',
    anomalyConfidence: 0.08,
    description: 'Diurnal domestic consumption profile following standard double-peak pattern.',
    hourlyProfile24h: [0.2, 0.1, 0.1, 0.2, 0.4, 1.1, 1.9, 2.1, 1.4, 0.9, 0.8, 0.9, 0.8, 0.7, 0.8, 0.9, 1.3, 2.0, 2.2, 1.8, 1.1, 0.7, 0.4, 0.2]
  },
  {
    meterId: 'AMI-20984',
    accountHolder: 'Westlake Laundromat & Dry Clean',
    category: 'Commercial',
    dma: 'DMA-02',
    address: '124 North Market Way, Sector B',
    pipeConnected: 'P-203',
    dailyAvgM3: 14.8,
    todayUsageM3: 1.2,
    anomalyStatus: 'METER_TAMPERING_BYPASS', // Suspicious drop/bypass
    anomalyConfidence: 0.91,
    description: 'Uncharacteristic 92% sudden drop in metered volume during peak operating hours with zero registered flow while pressure remains nominal. Suspected mechanical bypass / tampering.',
    hourlyProfile24h: [0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.1, 0.1, 0.1, 0.0, 0.1, 0.1, 0.1, 0.1, 0.0, 0.1, 0.1, 0.1, 0.1, 0.0, 0.0, 0.0, 0.0]
  },
  {
    meterId: 'AMI-30115',
    accountHolder: 'BioChem Pharma Laboratories',
    category: 'Industrial',
    dma: 'DMA-03',
    address: '900 Biotech Avenue, Sector C',
    pipeConnected: 'P-302',
    dailyAvgM3: 110.0,
    todayUsageM3: 248.0,
    anomalyStatus: 'UNCHARACTERISTIC_SURGE', // Major plumbing rupture
    anomalyConfidence: 0.96,
    description: 'Massive uncharacteristic surge exceeding 3.5x standard historical 99th percentile envelope. Potential cooling tower valve overflow or private fire line breach.',
    hourlyProfile24h: [3.2, 3.1, 3.4, 3.2, 4.5, 8.2, 14.8, 18.5, 19.2, 18.9, 17.8, 18.2, 17.5, 18.1, 19.0, 18.6, 17.9, 18.4, 16.2, 12.1, 8.5, 6.2, 4.8, 3.8]
  },
  {
    meterId: 'AMI-30582',
    accountHolder: 'Apex Logistics Distribution Hub',
    category: 'Industrial',
    dma: 'DMA-03',
    address: '14 Freight Way, Sector C',
    pipeConnected: 'P-304',
    dailyAvgM3: 8.5,
    todayUsageM3: 8.9,
    anomalyStatus: 'NORMAL',
    anomalyConfidence: 0.04,
    description: 'Standard steady industrial facility baseline consumption.',
    hourlyProfile24h: [0.2, 0.2, 0.2, 0.2, 0.3, 0.5, 0.6, 0.6, 0.5, 0.5, 0.5, 0.5, 0.6, 0.5, 0.5, 0.5, 0.5, 0.5, 0.4, 0.3, 0.3, 0.2, 0.2, 0.2]
  },
  {
    meterId: 'AMI-40019',
    accountHolder: 'Green Ridge Golf & Country Club',
    category: 'Commercial',
    dma: 'DMA-04',
    address: '250 Hillside Parkway, Sector D',
    pipeConnected: 'P-402',
    dailyAvgM3: 58.0,
    todayUsageM3: 56.4,
    anomalyStatus: 'NORMAL',
    anomalyConfidence: 0.06,
    description: 'Scheduled automated turf irrigation cycle active during permitted nocturnal hours (02:00-05:00 AM).',
    hourlyProfile24h: [1.1, 1.2, 7.8, 9.4, 8.6, 3.2, 1.5, 1.2, 1.4, 1.6, 1.8, 1.9, 1.5, 1.4, 1.6, 1.8, 2.0, 2.2, 2.1, 1.8, 1.5, 1.4, 1.2, 1.0]
  },
  {
    meterId: 'AMI-40251',
    accountHolder: 'Sun Valley Community Pool & Park',
    category: 'Commercial',
    dma: 'DMA-04',
    address: '88 Summit Ridge Rd, Sector D',
    pipeConnected: 'P-403',
    dailyAvgM3: 6.2,
    todayUsageM3: -0.4,
    anomalyStatus: 'BACKFLOW_RISK', // Reverse flow detected
    anomalyConfidence: 0.88,
    description: 'Negative flow meter registration (-0.08 m³/h). Backflow check valve failure detected with potential water contamination hazard from booster back-pressure.',
    hourlyProfile24h: [-0.05, -0.08, -0.06, -0.04, 0.1, 0.4, 0.6, 0.8, 0.7, 0.6, 0.5, 0.6, 0.5, 0.4, 0.5, 0.6, 0.7, 0.8, 0.6, 0.4, 0.2, -0.02, -0.04, -0.05]
  }
];
