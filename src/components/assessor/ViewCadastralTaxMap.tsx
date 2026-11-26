import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  AlertTriangle,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  FileEdit,
  Hash,
  Layers,
  Link2,
  MapPin,
  Maximize2,
  PenTool,
  Plus,
  Satellite,
  Search,
  Square,
  Trash2,
  Undo2,
  X,
  Map as MapIcon
} from 'lucide-react';
import { useRpatis } from '../../context/RpatisContext';
import {
  AssessmentDocket,
  AssessmentProblemTicket,
  AssessmentRollRow,
  LandImprovementLink,
  PropertyClassification
} from '../../types/rpatis';
import { StatusChip } from '../common/StatusChip';

interface ViewCadastralTaxMapProps {
  onOpenPropertyInFaas?: (row: AssessmentRollRow) => void;
  onOpenDocketInFaas?: (docket: AssessmentDocket) => void;
}

type BasemapMode = 'street' | 'satellite' | 'light';
type CadastralToolkitTab = 'inspector' | 'pin' | 'improvements' | 'discrepancies';
type PlotMode = 'none' | 'new' | 'replot';
type DrawTool = 'polygon' | 'quickBox';

interface ParcelGpsGeometry {
  coords: [number, number][];
  lotCode: string;
}

function computePolygonAreaSqm(coords: [number, number][]): number {
  if (coords.length < 3) return 0;
  const avgLatRad =
    (coords.reduce((s, [lat]) => s + lat, 0) / coords.length) * (Math.PI / 180);
  const metersPerLat = 111132.92;
  const metersPerLng = 111412.84 * Math.cos(avgLatRad);
  const pts = coords.map(([lat, lng]) => [lng * metersPerLng, lat * metersPerLat]);
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.max(1, Math.round(Math.abs(sum) / 2));
}

function buildQuickBoxCoords(lat: number, lng: number): [number, number][] {
  const dLat = 0.00009;
  const dLng = 0.000115;
  return [
    [lat + dLat, lng - dLng],
    [lat + dLat, lng + dLng],
    [lat - dLat, lng + dLng],
    [lat - dLat, lng - dLng]
  ];
}

const PARCEL_USAGE_META: Record<string, { actualUsage: string; surveyBearing: string }> = {
  'TD-26-04912': {
    actualUsage: 'Single-Family Residential House & Lot',
    surveyBearing: 'N 14°22\' E, 28.40m (Cad. 544-D)'
  },
  'TD-26-0001': {
    actualUsage: 'Coastal Residential Compound',
    surveyBearing: 'N 42°10\' W, 24.00m (Cad. 544-D)'
  },
  'TD-26-0002': {
    actualUsage: 'Irrigated Riceland & Coconut Plantation',
    surveyBearing: 'S 78°05\' E, 145.50m (Cad. 544-D)'
  },
  'TD-26-0003': {
    actualUsage: '2-Storey Mixed Commercial Retail Arcade',
    surveyBearing: 'N 08°18\' E, 32.10m (Cad. 544-D)'
  },
  'TD-26-0004': {
    actualUsage: 'Residential Subdivision Interior Lot',
    surveyBearing: 'S 31°40\' W, 21.60m (Cad. 544-D)'
  },
  'TD-26-0005': {
    actualUsage: 'Agro-Industrial & Mixed Orchard Tract',
    surveyBearing: 'N 65°15\' E, 118.00m (Cad. 544-D)'
  },
  'TD-26-0006': {
    actualUsage: 'Residential Dwelling with Backyard Annex',
    surveyBearing: 'S 12°50\' E, 19.80m (Cad. 544-D)'
  },
  'TD-26-0007': {
    actualUsage: 'Highway Commercial Warehouse & Storefront',
    surveyBearing: 'N 27°33\' W, 38.00m (Cad. 544-D)'
  },
  'TD-26-0008': {
    actualUsage: 'Lowland Coconut & Rice Production Lot',
    surveyBearing: 'S 81°12\' W, 94.20m (Cad. 544-D)'
  }
};

const DEFAULT_USAGE_BY_CLASS: Record<PropertyClassification, string> = {
  Residential: 'Residential Dwelling Lot',
  Agricultural: 'Agricultural Crop & Grazing Land',
  Commercial: 'Commercial Enterprise / Retail Lot'
};

const PASACAO_BARANGAYS = [
  { code: '0001', name: 'Balogo' },
  { code: '0002', name: 'Caranan' },
  { code: '0003', name: 'Dalupaon' },
  { code: '0004', name: 'Odicon' },
  { code: '0005', name: 'Tinalmud' },
  { code: '0006', name: 'Macad' },
  { code: '0007', name: 'Cuco' },
  { code: '0008', name: 'Itulan' },
  { code: '0012', name: 'Sta. Rosa del Sur' }
];

function hasParcelTicketMatch(ticket: AssessmentProblemTicket, row: AssessmentRollRow): boolean {
  const ref = ticket.referenceNo.toLowerCase();
  const desc = ticket.description.toLowerCase();
  const td = row.tdNo.toLowerCase();
  const pin = row.pin.toLowerCase();
  return ref.includes(td) || ref.includes(pin) || desc.includes(td) || desc.includes(pin);
}

const TAX_MAP_STATUS_ORDER: Record<AssessmentRollRow['paymentStatus'], number> = {
  Unpaid: 1,
  Partial: 2,
  Paid: 3
};

// Real Pasacao, Camarines Sur barangay coordinates (Cad. 544-D, ~13.5168°N, 123.0425°E)
const PASACAO_CENTER: [number, number] = [13.5235, 123.0405];
const CARTO_BASEMAP_KEY =
  import.meta.env.VITE_CARTO_API_KEY || 'cb1_5grv_1_22ae2ca783a7f16b723146dc';

const PREDEFINED_PARCEL_COORDS: Record<string, ParcelGpsGeometry> = {
  'TD-26-04912': {
    // Brgy. Sta. Rosa del Sur (Poblacion core)
    coords: [
      [13.5179, 123.0414],
      [13.5179, 123.0436],
      [13.5161, 123.0436],
      [13.5161, 123.0414]
    ],
    lotCode: 'Lot 4102-B • Psd-05-01294'
  },
  'TD-26-0001': {
    // Brgy. Balogo (Residential coastal zone)
    coords: [
      [13.5248, 123.0372],
      [13.5248, 123.0394],
      [13.5231, 123.0394],
      [13.5231, 123.0372]
    ],
    lotCode: 'Lot 1104-A • Cad. 544-D'
  },
  'TD-26-0002': {
    // Brgy. Caranan (Large Agricultural tract)
    coords: [
      [13.5345, 123.0445],
      [13.5345, 123.0498],
      [13.5301, 123.0498],
      [13.5301, 123.0445]
    ],
    lotCode: 'Lot 3801 • Cad. 544-D'
  },
  'TD-26-0003': {
    // Brgy. Dalupaon (Commercial strip)
    coords: [
      [13.5125, 123.0508],
      [13.5125, 123.0536],
      [13.5101, 123.0536],
      [13.5101, 123.0508]
    ],
    lotCode: 'Lot 702-A • Dalupaon Strip'
  },
  'TD-26-0004': {
    // Brgy. Odicon (Residential interior)
    coords: [
      [13.5284, 123.0301],
      [13.5284, 123.0322],
      [13.5266, 123.0322],
      [13.5266, 123.0301]
    ],
    lotCode: 'Lot 2048-C • Cad. 544-D'
  },
  'TD-26-0005': {
    // Brgy. Tinalmud (Large Agricultural tract)
    coords: [
      [13.5388, 123.0195],
      [13.5388, 123.0244],
      [13.5348, 123.0244],
      [13.5348, 123.0195]
    ],
    lotCode: 'Lot 2914 • Cad. 544-D'
  },
  'TD-26-0006': {
    // Brgy. Macad (Residential east)
    coords: [
      [13.5229, 123.0488],
      [13.5229, 123.0512],
      [13.5209, 123.0512],
      [13.5209, 123.0488]
    ],
    lotCode: 'Lot 3312 • Cad. 544-D'
  },
  'TD-26-0007': {
    // Brgy. Cuco (Commercial highway corridor)
    coords: [
      [13.5204, 123.0352],
      [13.5204, 123.0374],
      [13.5186, 123.0374],
      [13.5186, 123.0352]
    ],
    lotCode: 'Lot 918 • Cuco Corridor'
  },
  'TD-26-0008': {
    // Brgy. Itulan (Large Agricultural tract)
    coords: [
      [13.5365, 123.0325],
      [13.5365, 123.0382],
      [13.5322, 123.0382],
      [13.5322, 123.0325]
    ],
    lotCode: 'Lot 5109 • Cad. 544-D'
  }
};

function getDynamicParcelCoords(slotIndex: number, tdNo: string): ParcelGpsGeometry {
  const col = slotIndex % 4;
  const row = Math.floor(slotIndex / 4);
  const baseLat = 13.5145 - row * 0.0024;
  const baseLng = 123.0445 + col * 0.0024;
  return {
    coords: [
      [baseLat, baseLng],
      [baseLat, baseLng + 0.0018],
      [baseLat - 0.0016, baseLng + 0.0018],
      [baseLat - 0.0016, baseLng]
    ],
    lotCode: `Registered Parcel (${tdNo})`
  };
}

function getCentroid(coords: [number, number][]): [number, number] {
  const sum = coords.reduce(
    (acc, [lat, lng]) => [acc[0] + lat, acc[1] + lng],
    [0, 0]
  );
  return [sum[0] / coords.length, sum[1] / coords.length];
}

function getParcelColors(
  row: AssessmentRollRow,
  mode: 'classification' | 'taxStatus'
): { fill: string; stroke: string } {
  if (mode === 'taxStatus') {
    if (row.paymentStatus === 'Paid') return { fill: '#10B981', stroke: '#047857' };
    if (row.paymentStatus === 'Partial') return { fill: '#F59E0B', stroke: '#B45309' };
    return { fill: '#EF4444', stroke: '#B91C1C' };
  }

  const clsMap: Record<PropertyClassification, { fill: string; stroke: string }> = {
    Residential: { fill: '#3B82F6', stroke: '#1D4ED8' },
    Agricultural: { fill: '#22C55E', stroke: '#15803D' },
    Commercial: { fill: '#F59E0B', stroke: '#B45309' }
  };
  return clsMap[row.classification];
}

export const ViewCadastralTaxMap: React.FC<ViewCadastralTaxMapProps> = ({
  onOpenPropertyInFaas,
  onOpenDocketInFaas
}) => {
  const {
    assessmentRoll,
    dockets,
    smvRates,
    createOrUpdateDocket,
    pinReservations,
    reserveBlgfPin,
    improvementLinks,
    linkImprovementToLand,
    customParcelGeometries,
    saveParcelGeometry,
    problemTickets,
    logAssessmentProblem,
    resolveAssessmentProblem,
    pushToast
  } = useRpatis();

  const sortedAll = [...assessmentRoll].sort((a, b) => {
    const diff =
      (TAX_MAP_STATUS_ORDER[a.paymentStatus] ?? 99) -
      (TAX_MAP_STATUS_ORDER[b.paymentStatus] ?? 99);
    return diff !== 0 ? diff : a.tdNo.localeCompare(b.tdNo, undefined, { numeric: true });
  });

  const [selectedTdNo, setSelectedTdNo] = useState<string>(sortedAll[0]?.tdNo || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [barangayFilter, setBarangayFilter] = useState('All');
  const [colorMode, setColorMode] = useState<'classification' | 'taxStatus'>('classification');
  const [basemap, setBasemap] = useState<BasemapMode>('street');
  const [showPinLabels, setShowPinLabels] = useState(true);
  const [rightTab, setRightTab] = useState<CadastralToolkitTab>('inspector');

  // Interactive Property Plotting State
  const [plotMode, setPlotMode] = useState<PlotMode>('none');
  const [drawTool, setDrawTool] = useState<DrawTool>('polygon');
  const [draftPoints, setDraftPoints] = useState<[number, number][]>([]);
  const [plotOwner, setPlotOwner] = useState('');
  const [plotBrgyCode, setPlotBrgyCode] = useState('');
  const [plotClassification, setPlotClassification] = useState<'' | PropertyClassification>('');
  const [plotAreaSqm, setPlotAreaSqm] = useState('');
  const [plotLotCode, setPlotLotCode] = useState('');
  const [plotActualUsage, setPlotActualUsage] = useState('');
  const [plotSecCode, setPlotSecCode] = useState('');
  const [plotParcelCode, setPlotParcelCode] = useState('');

  const resetPlotFlow = () => {
    setPlotMode('none');
    setDrawTool('polygon');
    setDraftPoints([]);
    setPlotOwner('');
    setPlotBrgyCode('');
    setPlotClassification('');
    setPlotAreaSqm('');
    setPlotLotCode('');
    setPlotActualUsage('');
    setPlotSecCode('');
    setPlotParcelCode('');
  };

  // BLGF Standardized PIN Generator (Prov-Mun-Brgy-Sec-Parcel-Bldg)
  const [provCode, setProvCode] = useState('024');
  const [munCode, setMunCode] = useState('18');
  const [pinBrgyCode, setPinBrgyCode] = useState('');
  const [pinSecCode, setPinSecCode] = useState('');
  const [pinParcelCode, setPinParcelCode] = useState('');
  const [pinBldgCode, setPinBldgCode] = useState('');

  // Improvement-to-Land Linkage Form (blank by default)
  const [impBldgCode, setImpBldgCode] = useState('');
  const [impStructureType, setImpStructureType] = useState<'' | LandImprovementLink['structureType']>('');
  const [impDescription, setImpDescription] = useState('');
  const [impFloorArea, setImpFloorArea] = useState('');
  const [impYearBuilt, setImpYearBuilt] = useState('');

  // Discrepancy Logger Form & Resolution Inputs (blank by default)
  const [discCategory, setDiscCategory] = useState<'' | AssessmentProblemTicket['category']>('');
  const [discDescription, setDiscDescription] = useState('');
  const [resolutionNotesMap, setResolutionNotesMap] = useState<Record<string, string>>({});

  const getParcelOpenDiscrepancies = (row: AssessmentRollRow) =>
    problemTickets.filter((t) => t.status === 'Open' && hasParcelTicketMatch(t, row));

  const getParcelAllDiscrepancies = (row: AssessmentRollRow) =>
    problemTickets.filter((t) => hasParcelTicketMatch(t, row));

  const getParcelImprovements = (row: AssessmentRollRow) =>
    improvementLinks.filter((l) => l.landTdNo === row.tdNo || l.landPin === row.pin);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const parcelLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const draftLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const cleanQuery = searchQuery.trim().toLowerCase();
  const normQuery = cleanQuery.replace(/[-\s]/g, '');

  const isRowMatched = (row: AssessmentRollRow) => {
    if (barangayFilter !== 'All' && row.barangay !== barangayFilter) return false;
    if (!cleanQuery) return true;
    return (
      row.tdNo.toLowerCase().includes(cleanQuery) ||
      row.tdNo.toLowerCase().replace(/[-\s]/g, '').includes(normQuery) ||
      row.pin.toLowerCase().includes(cleanQuery) ||
      row.pin.toLowerCase().replace(/[-\s]/g, '').includes(normQuery) ||
      row.ownerFull.toLowerCase().includes(cleanQuery) ||
      row.ownerMasked.toLowerCase().includes(cleanQuery) ||
      row.barangay.toLowerCase().includes(cleanQuery)
    );
  };

  // Combine official Assessment Roll rows + newly plotted Draft Dockets (Pending CIS)
  const plottedDraftEntries = dockets
    .filter(
      (d) =>
        !assessmentRoll.some((r) => r.tdNo === d.tdNo || r.pin === d.pin) &&
        customParcelGeometries.some(
          (g) => g.tdNo === d.tdNo || g.pin === d.pin || g.key === d.tdNo || g.key === d.pin
        )
    )
    .map((d) => {
      const cleanBrgy = d.barangay.replace(/^Brgy\.\s*/i, '').replace(/,\s*Pasacao$/i, '');
      const basicRpt = Math.round(d.assessedValue * 0.01);
      const sef = Math.round(d.assessedValue * 0.01);
      const row: AssessmentRollRow = {
        tdNo: d.tdNo,
        pin: d.pin,
        ownerMasked: d.ownerMasked,
        ownerFull: d.owner,
        barangay: cleanBrgy,
        classification: d.classification,
        areaSqm: d.areaSqm,
        unitValue: d.unitValue,
        marketValue: d.marketValue,
        assessmentLevel: d.assessmentLevel / 100,
        assessedValue: d.assessedValue,
        basicRpt,
        sef,
        totalTaxDue: basicRpt + sef,
        paymentStatus: 'Unpaid',
        orNo: '',
        source: 'Assessor Roll',
        syncTime: d.submittedAt
      };
      return { row, isDraft: true, docketRef: d };
    });

  const combinedSourceRows = [
    ...plottedDraftEntries,
    ...sortedAll.map((row) => ({ row, isDraft: false, docketRef: undefined as AssessmentDocket | undefined }))
  ];

  const uniqueBarangays = Array.from(
    new Set(combinedSourceRows.map((item) => item.row.barangay))
  ).sort((a, b) => a.localeCompare(b));

  let dynamicSlotCounter = 0;
  const mappedParcels = combinedSourceRows.map(({ row, isDraft, docketRef }) => {
    const customGeo = customParcelGeometries.find(
      (g) => (g.tdNo && g.tdNo === row.tdNo) || g.pin === row.pin || g.key === row.tdNo
    );
    const fixed = PREDEFINED_PARCEL_COORDS[row.tdNo];
    const geometry: ParcelGpsGeometry = customGeo
      ? { coords: customGeo.coords, lotCode: customGeo.lotCode }
      : fixed || getDynamicParcelCoords(dynamicSlotCounter++, row.tdNo);
    return {
      row,
      geometry,
      actualUsage: customGeo?.actualUsage,
      surveyBearing: customGeo?.surveyBearing,
      isDraft,
      docketRef,
      matched: isRowMatched(row)
    };
  });

  const matchedParcels = mappedParcels.filter((m) => m.matched).map((m) => m.row);
  const selectedParcel =
    matchedParcels.find((r) => r.tdNo === selectedTdNo) ||
    combinedSourceRows.find((item) => item.row.tdNo === selectedTdNo)?.row ||
    matchedParcels[0] ||
    combinedSourceRows[0]?.row;

  const selectedEntry = mappedParcels.find((m) => m.row.tdNo === selectedParcel?.tdNo);
  const selectedCentroid = selectedEntry ? getCentroid(selectedEntry.geometry.coords) : null;

  const totalAreaSqm = matchedParcels.reduce((sum, r) => sum + r.areaSqm, 0);
  const totalAssessed = matchedParcels.reduce((sum, r) => sum + r.assessedValue, 0);
  const unpaidOrPartialCount = matchedParcels.filter((r) => r.paymentStatus !== 'Paid').length;

  // 1. Initialize Leaflet Map once + ResizeObserver for collapsible sidebar support
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: PASACAO_CENTER,
      zoom: 14,
      zoomControl: true
    });

    tileLayerGroupRef.current = L.layerGroup().addTo(map);
    parcelLayerGroupRef.current = L.layerGroup().addTo(map);
    draftLayerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const resizeObs = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObs.observe(mapContainerRef.current);

    return () => {
      resizeObs.disconnect();
      map.remove();
      mapRef.current = null;
      tileLayerGroupRef.current = null;
      parcelLayerGroupRef.current = null;
      draftLayerGroupRef.current = null;
    };
  }, []);

  // 2. Switch real map tile layer (Street / Satellite / Minimal Light)
  useEffect(() => {
    const group = tileLayerGroupRef.current;
    if (!group) return;
    group.clearLayers();

    if (basemap === 'satellite') {
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics',
          maxZoom: 19
        }
      ).addTo(group);

      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19
        }
      ).addTo(group);
    } else if (basemap === 'light') {
      L.tileLayer(
        `https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${CARTO_BASEMAP_KEY}`,
        {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          maxZoom: 20
        }
      ).addTo(group);
    } else {
      L.tileLayer(
        `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${CARTO_BASEMAP_KEY}`,
        {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          maxZoom: 20
        }
      ).addTo(group);
    }
  }, [basemap]);

  // 3. Render & update interactive parcel polygons cleanly
  useEffect(() => {
    const parcelGroup = parcelLayerGroupRef.current;
    const map = mapRef.current;
    if (!parcelGroup || !map) return;

    parcelGroup.clearLayers();

    mappedParcels.forEach(({ row, geometry, matched, isDraft }) => {
      const isSelected = selectedParcel?.tdNo === row.tdNo;
      const colors = getParcelColors(row, colorMode);
      const openFlags = getParcelOpenDiscrepancies(row).length;
      const bldgCount = getParcelImprovements(row).length;

      const borderColor = isSelected
        ? '#0F172A'
        : openFlags > 0
        ? '#DC2626'
        : isDraft
        ? '#4F46E5'
        : colors.stroke;

      const polygon = L.polygon(geometry.coords, {
        interactive: plotMode === 'none',
        color: borderColor,
        weight: isSelected ? 4 : openFlags > 0 || isDraft ? 3 : 2,
        dashArray: openFlags > 0 || isDraft ? '6, 4' : undefined,
        fillColor: colors.fill,
        fillOpacity: !matched ? 0.12 : isSelected ? 0.62 : 0.42,
        opacity: matched ? 1 : 0.35
      });

      const badgeParts: string[] = [];
      if (isDraft) badgeParts.push('Pending CIS');
      if (bldgCount > 0) badgeParts.push(`${bldgCount} Bldg`);
      if (openFlags > 0) badgeParts.push(`${openFlags} Flag`);
      const badgeSuffix =
        badgeParts.length > 0
          ? `<div style="font-size:9px;font-weight:700;color:${
              openFlags > 0 ? '#B91C1C' : isDraft ? '#4338CA' : '#065F46'
            };margin-top:1px;">${badgeParts.join(' • ')}</div>`
          : '';

      if (showPinLabels && matched) {
        polygon.bindTooltip(
          `<div style="font-family:monospace;font-weight:700;font-size:11px;line-height:1.2;color:#0F172A;">
            ${row.tdNo}<br/><span style="font-weight:500;font-size:10px;color:#334155;">Brgy. ${row.barangay}</span>${badgeSuffix}
          </div>`,
          {
            permanent: true,
            direction: 'center',
            className: 'rpat-map-label'
          }
        );
      } else {
        const metaText = badgeParts.length > 0 ? ` [${badgeParts.join(', ')}]` : '';
        polygon.bindTooltip(
          `${row.tdNo} — ${row.ownerFull} (Brgy. ${row.barangay})${metaText}`,
          { sticky: true }
        );
      }

      polygon.on('click', () => {
        if (plotMode === 'none') {
          setSelectedTdNo(row.tdNo);
        }
      });

      polygon.addTo(parcelGroup);
      if (isSelected) {
        polygon.bringToFront();
      }
    });
  }, [
    assessmentRoll,
    dockets,
    customParcelGeometries,
    selectedParcel?.tdNo,
    colorMode,
    showPinLabels,
    searchQuery,
    barangayFilter,
    problemTickets,
    improvementLinks,
    plotMode
  ]);

  // 4. Interactive Map Click Capture for Plotting Boundaries
  useEffect(() => {
    const map = mapRef.current;
    const container = mapContainerRef.current;
    if (!map || !container) return;

    if (plotMode === 'none') {
      container.style.cursor = '';
      return;
    }

    container.style.cursor = 'crosshair';
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (drawTool === 'quickBox') {
        setDraftPoints(buildQuickBoxCoords(e.latlng.lat, e.latlng.lng));
      } else {
        setDraftPoints((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
      }
    };

    map.on('click', handleMapClick);
    return () => {
      container.style.cursor = '';
      map.off('click', handleMapClick);
    };
  }, [plotMode, drawTool]);

  // 5. Render Draft Vertices & Preview Polygon on Map
  useEffect(() => {
    const draftGroup = draftLayerGroupRef.current;
    if (!draftGroup) return;
    draftGroup.clearLayers();

    if (plotMode === 'none' || draftPoints.length === 0) return;

    draftPoints.forEach(([lat, lng], idx) => {
      const vertexIcon = L.divIcon({
        className: 'rpat-vertex-pin',
        html: `<div style="width:22px;height:22px;border-radius:9999px;background:#059669;color:#ffffff;font-family:monospace;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;border:2px solid #ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.35);">${
          idx + 1
        }</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });
      L.marker([lat, lng], { icon: vertexIcon, interactive: false }).addTo(draftGroup);
    });

    if (draftPoints.length === 2) {
      L.polyline(draftPoints, {
        color: '#059669',
        weight: 3,
        dashArray: '6, 4',
        interactive: false
      }).addTo(draftGroup);
    } else if (draftPoints.length >= 3) {
      const approxSqm = computePolygonAreaSqm(draftPoints);
      const previewPoly = L.polygon(draftPoints, {
        color: '#059669',
        weight: 3,
        dashArray: '6, 4',
        fillColor: '#10B981',
        fillOpacity: 0.35,
        interactive: false
      }).addTo(draftGroup);

      previewPoly.bindTooltip(`~${approxSqm.toLocaleString()} sqm`, {
        permanent: true,
        direction: 'center',
        className: 'rpat-map-label'
      });
    }
  }, [plotMode, draftPoints]);

  const handleFocusParcel = (row: AssessmentRollRow) => {
    setSelectedTdNo(row.tdNo);
    const entry = mappedParcels.find((m) => m.row.tdNo === row.tdNo);
    if (entry && mapRef.current) {
      mapRef.current.flyToBounds(L.latLngBounds(entry.geometry.coords), {
        padding: [70, 70],
        maxZoom: 17,
        duration: 0.6
      });
    }
  };

  const handleFitAllParcels = () => {
    const map = mapRef.current;
    if (!map) return;
    const targets = mappedParcels.filter((m) => m.matched);
    if (targets.length === 0) {
      map.setView(PASACAO_CENTER, 14);
      return;
    }
    const allPoints = targets.flatMap((t) => t.geometry.coords);
    map.flyToBounds(L.latLngBounds(allPoints), {
      padding: [40, 40],
      maxZoom: 16,
      duration: 0.6
    });
  };

  return (
    <div className="p-5 sm:p-6 space-y-5">
      {/* Top Header & Mode Toggles */}
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-slate-600">
            Municipal Assessor &gt; Cadastral Section &gt; GIS Tax Mapping &amp; Parcel Registry (Pasacao, CamSur)
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-0.5">
            Cadastral Land Parcel Registry &amp; Tax Mapping Visualizer
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-300 gap-1">
            <button
              type="button"
              onClick={() => setColorMode('classification')}
              className={`min-h-[38px] px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                colorMode === 'classification'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-800 hover:bg-slate-200'
              }`}
            >
              By Land Class
            </button>
            <button
              type="button"
              onClick={() => setColorMode('taxStatus')}
              className={`min-h-[38px] px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                colorMode === 'taxStatus'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-800 hover:bg-slate-200'
              }`}
            >
              By Tax Status
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (plotMode !== 'none') {
                resetPlotFlow();
              } else {
                setPlotMode('new');
                setDrawTool('polygon');
                setDraftPoints([]);
              }
            }}
            className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs ${
              plotMode !== 'none'
                ? 'bg-red-700 hover:bg-red-800 text-white'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            {plotMode !== 'none' ? (
              <>
                <X className="w-4 h-4" aria-hidden="true" />
                <span>Cancel Plot</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Plot New Parcel</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs">
          <div className="text-xs font-bold text-slate-600 uppercase">Mapped Parcels</div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
            {matchedParcels.length} Lots
          </div>
          <p className="text-xs text-slate-600 mt-1">
            {barangayFilter === 'All' ? 'Pasacao Municipal Cadastre' : `Brgy. ${barangayFilter}`}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs">
          <div className="text-xs font-bold text-slate-600 uppercase">Total Mapped Land Area</div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
            {totalAreaSqm.toLocaleString()} sqm
          </div>
          <p className="text-xs text-slate-600 mt-1">
            {(totalAreaSqm / 10000).toFixed(2)} hectares total
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs">
          <div className="text-xs font-bold text-slate-600 uppercase">Collectible Parcels</div>
          <div className="text-2xl font-extrabold text-red-700 font-mono mt-1">
            {unpaidOrPartialCount} Accounts
          </div>
          <p className="text-xs text-slate-600 mt-1">Unpaid / Partial tax status</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs">
          <div className="text-xs font-bold text-slate-600 uppercase">Mapped Assessed Value</div>
          <div className="text-2xl font-extrabold text-emerald-800 font-mono mt-1">
            ₱{totalAssessed.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-600 mt-1">Synced to RA 7160 roll</p>
        </div>
      </div>

      {/* Filter & Basemap Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-3 flex-1 min-w-[260px]">
          <div className="flex-1 min-w-[220px]">
            <label htmlFor="tax-map-search" className="block text-xs font-bold text-slate-800 mb-1">
              Find Parcel on Map (TD No., PIN, Owner, or Barangay)
            </label>
            <div className="relative">
              <Search
                className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                id="tax-map-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter TD No., PIN, Owner, or Barangay..."
                className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="w-full sm:w-48">
            <label htmlFor="tax-map-brgy" className="block text-xs font-bold text-slate-800 mb-1">
              Barangay Section
            </label>
            <select
              id="tax-map-brgy"
              value={barangayFilter}
              onChange={(e) => setBarangayFilter(e.target.value)}
              className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900"
            >
              <option value="All">All Barangays ({sortedAll.length})</option>
              {uniqueBarangays.map((b) => (
                <option key={b} value={b}>
                  Brgy. {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Basemap Switcher */}
          <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-300 gap-1">
            {[
              { id: 'street', label: 'Street', icon: MapIcon },
              { id: 'satellite', label: 'Satellite', icon: Satellite },
              { id: 'light', label: 'Minimal', icon: Layers }
            ].map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setBasemap(mode.id as BasemapMode)}
                  className={`min-h-[34px] px-2.5 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1.5 transition-colors ${
                    basemap === mode.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>

          <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={showPinLabels}
              onChange={(e) => setShowPinLabels(e.target.checked)}
              className="w-4 h-4 accent-slate-900 rounded"
            />
            <span>Parcel Labels</span>
          </label>

          <button
            type="button"
            onClick={handleFitAllParcels}
            className="min-h-[38px] px-3 py-1.5 border border-slate-400 bg-white hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-800 inline-flex items-center gap-1.5"
          >
            <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Fit All Parcels</span>
          </button>
        </div>
      </div>

      {/* Main Split: Real Leaflet Map (Left 8 cols) + Parcel Inspector & Registry (Right 4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <div className="xl:col-span-8 bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <MapIcon className="w-4 h-4 text-slate-700" aria-hidden="true" />
              <span>Pasacao, Camarines Sur — Live Georeferenced Tax Map</span>
            </div>
            <span className="font-mono text-slate-600">
              13.5168° N, 123.0425° E • Click any lot or zoom/pan freely
            </span>
          </div>

          {/* Interactive Plot Mode Banner */}
          {plotMode !== 'none' && (
            <div className="px-4 py-3 bg-emerald-950 text-white border-b border-emerald-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                <span>
                  {drawTool === 'polygon'
                    ? 'Trace Corners: Click 3+ corners around the lot on the map.'
                    : '1-Click Lot: Click anywhere on the map to drop a lot boundary.'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex bg-emerald-900 p-0.5 rounded-lg border border-emerald-700 gap-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setDrawTool('polygon');
                      setDraftPoints([]);
                    }}
                    className={`min-h-[32px] px-2.5 py-1 rounded text-[11px] font-bold inline-flex items-center gap-1 ${
                      drawTool === 'polygon'
                        ? 'bg-white text-emerald-950'
                        : 'text-emerald-100 hover:bg-emerald-800'
                    }`}
                  >
                    <PenTool className="w-3 h-3" aria-hidden="true" />
                    <span>Trace Corners</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDrawTool('quickBox');
                      setDraftPoints([]);
                    }}
                    className={`min-h-[32px] px-2.5 py-1 rounded text-[11px] font-bold inline-flex items-center gap-1 ${
                      drawTool === 'quickBox'
                        ? 'bg-white text-emerald-950'
                        : 'text-emerald-100 hover:bg-emerald-800'
                    }`}
                  >
                    <Square className="w-3 h-3" aria-hidden="true" />
                    <span>1-Click Lot</span>
                  </button>
                </div>

                <button
                  type="button"
                  disabled={draftPoints.length === 0}
                  onClick={() => setDraftPoints((prev) => prev.slice(0, -1))}
                  className="min-h-[32px] px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-40 text-white rounded text-[11px] font-bold inline-flex items-center gap-1"
                >
                  <Undo2 className="w-3 h-3" aria-hidden="true" />
                  <span>Undo Point</span>
                </button>

                <button
                  type="button"
                  disabled={draftPoints.length === 0}
                  onClick={() => setDraftPoints([])}
                  className="min-h-[32px] px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-40 text-white rounded text-[11px] font-bold inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" aria-hidden="true" />
                  <span>Clear</span>
                </button>

                <span className="px-2 py-1 rounded bg-emerald-900 border border-emerald-700 font-mono text-[11px] font-bold text-emerald-200">
                  {draftPoints.length} pts •{' '}
                  {draftPoints.length >= 3
                    ? `~${computePolygonAreaSqm(draftPoints).toLocaleString()} sqm`
                    : '0 sqm'}
                </span>
              </div>
            </div>
          )}

          {/* Isolated Map Canvas Container */}
          <div className="relative isolate z-0">
            <div
              ref={mapContainerRef}
              aria-label="Interactive GIS Map of Pasacao Real Property Parcels"
              className="w-full h-[520px] bg-slate-200"
            />
          </div>

          {/* Accessible Legend Bar */}
          <div className="px-4 py-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            {colorMode === 'classification' ? (
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-bold text-slate-700">Legend (RA 7160 Class):</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                  <span className="w-3.5 h-3.5 rounded bg-blue-500/45 border-2 border-blue-700 inline-block" />
                  Residential (20%)
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                  <span className="w-3.5 h-3.5 rounded bg-green-500/45 border-2 border-green-700 inline-block" />
                  Agricultural (40%)
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                  <span className="w-3.5 h-3.5 rounded bg-amber-500/45 border-2 border-amber-700 inline-block" />
                  Commercial (50%)
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-bold text-slate-700">Legend (RPT Tax Status):</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                  <span className="w-3.5 h-3.5 rounded bg-red-500/45 border-2 border-red-700 inline-block" />
                  Unpaid
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                  <span className="w-3.5 h-3.5 rounded bg-amber-500/45 border-2 border-amber-700 inline-block" />
                  Partial Payment
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-500/45 border-2 border-emerald-700 inline-block" />
                  Paid
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-600">
              <span>Dark Border = Active Parcel</span>
              <span className="inline-flex items-center gap-1.5 text-indigo-700 font-bold">
                <span className="w-3.5 h-3.5 rounded border-2 border-dashed border-indigo-600 inline-block" />
                Plotted Draft (Pending CIS)
              </span>
              <span className="inline-flex items-center gap-1.5 text-red-700 font-bold">
                <span className="w-3.5 h-3.5 rounded border-2 border-dashed border-red-600 inline-block" />
                Open Discrepancy Flag
              </span>
            </div>
          </div>
        </div>

        {/* Right: Guided Plot Mode Panel OR 4-Tab Cadastral Toolkit + Parcel Index */}
        <div className="xl:col-span-4 space-y-4">
          {plotMode === 'replot' && selectedParcel && (
            <div className="bg-white rounded-xl border-2 border-emerald-700 shadow-sm p-5 space-y-4 text-xs">
              <div className="border-b border-slate-200 pb-3">
                <div className="text-[11px] font-mono font-bold text-emerald-800">
                  RE-PLOT EXISTING PARCEL BOUNDARY
                </div>
                <h2 className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
                  {selectedParcel.tdNo}
                </h2>
                <div className="text-xs font-mono text-slate-700">PIN {selectedParcel.pin}</div>
                <div className="text-xs font-semibold text-slate-800 mt-1">
                  {selectedParcel.ownerFull} • Brgy. {selectedParcel.barangay}
                </div>
              </div>

              <div
                className={`p-3 rounded-lg border ${
                  draftPoints.length >= 3
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <div className="font-bold">
                  {draftPoints.length >= 3
                    ? `Updated Boundary Ready (${draftPoints.length} vertices)`
                    : `Click ${3 - draftPoints.length} more corner(s) on the map`}
                </div>
                <div className="font-mono mt-1">
                  Measured Polygon Area:{' '}
                  <strong>
                    {draftPoints.length >= 3
                      ? `~${computePolygonAreaSqm(draftPoints).toLocaleString()} sqm`
                      : 'Need at least 3 corners'}
                  </strong>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={draftPoints.length < 3}
                  onClick={() => {
                    const computedSqm = computePolygonAreaSqm(draftPoints);
                    saveParcelGeometry({
                      key: selectedParcel.tdNo,
                      tdNo: selectedParcel.tdNo,
                      pin: selectedParcel.pin,
                      coords: draftPoints,
                      lotCode:
                        selectedEntry?.geometry.lotCode ||
                        `Re-plotted Lot (${selectedParcel.tdNo})`,
                      actualUsage: selectedEntry?.actualUsage,
                      surveyBearing: selectedEntry?.surveyBearing,
                      computedAreaSqm: computedSqm
                    });
                    const updatedBounds = L.latLngBounds(draftPoints);
                    resetPlotFlow();
                    if (mapRef.current) {
                      mapRef.current.flyToBounds(updatedBounds, {
                        padding: [70, 70],
                        maxZoom: 17,
                        duration: 0.6
                      });
                    }
                  }}
                  className="w-full min-h-[42px] px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:text-slate-600 text-white rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" aria-hidden="true" />
                  <span>Save Updated Boundary</span>
                </button>

                <button
                  type="button"
                  onClick={resetPlotFlow}
                  className="w-full min-h-[40px] px-4 py-2 border border-slate-400 bg-white hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {plotMode === 'new' && (() => {
            const measuredSqm = computePolygonAreaSqm(draftPoints);
            const hasPolygon = draftPoints.length >= 3;
            const selectedBrgy = PASACAO_BARANGAYS.find((b) => b.code === plotBrgyCode);
            const cleanSec = plotSecCode.trim();
            const cleanParcel = plotParcelCode.trim();
            const canPreviewPin = Boolean(plotBrgyCode && cleanSec && cleanParcel);
            const newPin = canPreviewPin
              ? `024-18-${plotBrgyCode}-${cleanSec}-${cleanParcel}-0000`
              : '';
            const normPin = newPin.toLowerCase();
            const hasPinCollision =
              canPreviewPin &&
              (assessmentRoll.some((r) => r.pin.toLowerCase() === normPin) ||
                dockets.some((d) => d.pin.toLowerCase() === normPin) ||
                pinReservations.some((p) => p.pin.toLowerCase() === normPin));

            const matchedRate = plotClassification
              ? smvRates.find((r) => r.category === plotClassification) || {
                  subclass:
                    plotClassification === 'Residential'
                      ? 'R-1 (Residential First Class)'
                      : plotClassification === 'Agricultural'
                      ? 'Ag-1 (Irrigated Riceland)'
                      : 'C-1 (Commercial Strip)',
                  rate:
                    plotClassification === 'Residential'
                      ? 1200
                      : plotClassification === 'Agricultural'
                      ? 85
                      : 2500,
                  level:
                    plotClassification === 'Residential'
                      ? 20
                      : plotClassification === 'Agricultural'
                      ? 40
                      : 50
                }
              : null;

            const areaValueNum = Number(plotAreaSqm) || 0;
            const canSaveNewParcel =
              hasPolygon &&
              plotOwner.trim().length > 0 &&
              Boolean(plotBrgyCode) &&
              Boolean(plotClassification) &&
              areaValueNum > 0 &&
              canPreviewPin &&
              !hasPinCollision;

            const handleSaveNewPlottedProperty = (openInFaasAfter: boolean) => {
              if (!canSaveNewParcel || !plotClassification || !matchedRate) return;
              const nextNum = 852 + dockets.length;
              const newId = `PAS-2026-0${nextNum}`;
              const newTd = `TD-26-049${nextNum.toString().slice(-2)}`;
              const ownerClean = plotOwner.trim();
              const parts = ownerClean.split(' ');
              const ownerMasked =
                parts.length >= 2 ? `${parts[parts.length - 1]}, ${parts[0][0]}.` : ownerClean;
              const brgyName = selectedBrgy?.name || 'Pasacao';
              const marketValue = Math.round(areaValueNum * matchedRate.rate);
              const assessedValue = Math.round((marketValue * matchedRate.level) / 100);
              const lotLabel = plotLotCode.trim() || `Mapped Lot (${newTd})`;
              const usageText = plotActualUsage.trim();

              saveParcelGeometry({
                key: newTd,
                tdNo: newTd,
                pin: newPin,
                coords: draftPoints,
                lotCode: lotLabel,
                actualUsage: usageText || undefined,
                surveyBearing: 'Georeferenced via Tax Map Plotter (Cad. 544-D)',
                computedAreaSqm: measuredSqm
              });

              reserveBlgfPin({
                pin: newPin,
                provCode: '024',
                munCode: '18',
                brgyCode: plotBrgyCode,
                brgyName,
                secCode: cleanSec,
                parcelCode: cleanParcel,
                bldgCode: '0000',
                tdNo: newTd,
                remarks: 'Auto-reserved from Tax Map Plot New Parcel workflow'
              });

              const newDocket: AssessmentDocket = {
                id: newId,
                capitolId: `CAP-${newId}`,
                tdNo: newTd,
                pin: newPin,
                lgu: 'Pasacao',
                barangay: `Brgy. ${brgyName}, Pasacao`,
                lotNo: lotLabel,
                owner: ownerClean,
                ownerMasked,
                contact: '',
                transactionType: 'Discovery',
                classification: plotClassification,
                smvSubclass: matchedRate.subclass,
                areaSqm: areaValueNum,
                unitValue: matchedRate.rate,
                assessmentLevel: matchedRate.level,
                marketValue,
                assessedValue,
                status: 'Draft',
                submittedAt: 'March 18, 2026 • Just now',
                deficiencies: []
              };

              createOrUpdateDocket(newDocket);
              const savedBounds = L.latLngBounds(draftPoints);
              setSelectedTdNo(newTd);
              resetPlotFlow();
              setRightTab('inspector');

              if (openInFaasAfter && onOpenDocketInFaas) {
                onOpenDocketInFaas(newDocket);
              } else if (mapRef.current) {
                mapRef.current.flyToBounds(savedBounds, {
                  padding: [70, 70],
                  maxZoom: 17,
                  duration: 0.6
                });
              }
            };

            return (
              <div className="bg-white rounded-xl border-2 border-emerald-700 shadow-sm p-4 space-y-3.5 text-xs">
                <div className="border-b border-slate-200 pb-2.5 flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-mono font-bold text-emerald-800">
                      PLOT NEW REAL PROPERTY PARCEL
                    </div>
                    <h2 className="text-sm font-extrabold text-slate-900 mt-0.5">
                      Guided Tax Map Digitizer
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={resetPlotFlow}
                    aria-label="Close Plot New Parcel panel"
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                {/* Step 1 Status */}
                <div
                  className={`p-3 rounded-lg border ${
                    hasPolygon
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}
                >
                  <div className="font-bold">
                    Step 1 — Draw Lot Boundary on Map
                  </div>
                  <div className="mt-0.5">
                    {hasPolygon ? (
                      <span className="font-mono font-bold">
                        Boundary Ready (~{measuredSqm.toLocaleString()} sqm • {draftPoints.length} pts)
                      </span>
                    ) : (
                      <span>
                        Click 3+ corners on the map ({draftPoints.length}/3 placed), or switch to 1-Click Lot above.
                      </span>
                    )}
                  </div>
                </div>

                {/* Step 2 Form */}
                <div className="space-y-2.5">
                  <div className="font-bold text-slate-900">
                    Step 2 — Property &amp; BLGF PIN Details
                  </div>

                  <div>
                    <label htmlFor="plot-owner" className="block font-bold text-slate-800 mb-1">
                      Declared Owner
                    </label>
                    <input
                      id="plot-owner"
                      type="text"
                      value={plotOwner}
                      onChange={(e) => setPlotOwner(e.target.value)}
                      placeholder="e.g. Juan Dela Cruz"
                      className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-2.5 py-1.5 text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label htmlFor="plot-brgy" className="block font-bold text-slate-800 mb-1">
                        Barangay
                      </label>
                      <select
                        id="plot-brgy"
                        value={plotBrgyCode}
                        onChange={(e) => setPlotBrgyCode(e.target.value)}
                        className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-2 py-1.5 font-semibold text-slate-900"
                      >
                        <option value="">-- Select barangay --</option>
                        {PASACAO_BARANGAYS.map((b) => (
                          <option key={b.code} value={b.code}>
                            {b.code} — {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="plot-class" className="block font-bold text-slate-800 mb-1">
                        Classification
                      </label>
                      <select
                        id="plot-class"
                        value={plotClassification}
                        onChange={(e) =>
                          setPlotClassification(e.target.value as '' | PropertyClassification)
                        }
                        className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-2 py-1.5 font-semibold text-slate-900"
                      >
                        <option value="">-- Select classification --</option>
                        <option value="Residential">Residential</option>
                        <option value="Agricultural">Agricultural</option>
                        <option value="Commercial">Commercial</option>
                      </select>
                    </div>
                  </div>

                  {matchedRate && (
                    <div className="px-2.5 py-1.5 rounded bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700">
                      SMV: ₱{matchedRate.rate.toLocaleString()}/sqm • Assessment Level: {matchedRate.level}%
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <label htmlFor="plot-area" className="font-bold text-slate-800">
                        Land Area (sqm)
                      </label>
                      {hasPolygon && (
                        <button
                          type="button"
                          onClick={() => setPlotAreaSqm(String(measuredSqm))}
                          className="text-[11px] font-bold text-emerald-800 hover:underline"
                        >
                          Use Measured (~{measuredSqm.toLocaleString()} sqm)
                        </button>
                      )}
                    </div>
                    <input
                      id="plot-area"
                      type="number"
                      min={1}
                      value={plotAreaSqm}
                      onChange={(e) => setPlotAreaSqm(e.target.value)}
                      placeholder="Enter sqm or click Use Measured"
                      className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label htmlFor="plot-sec" className="block font-bold text-slate-800 mb-1">
                        Section (Sec)
                      </label>
                      <input
                        id="plot-sec"
                        type="text"
                        maxLength={4}
                        value={plotSecCode}
                        onChange={(e) => setPlotSecCode(e.target.value)}
                        placeholder="e.g. 005"
                        className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label htmlFor="plot-parcel" className="block font-bold text-slate-800 mb-1">
                        Parcel No.
                      </label>
                      <input
                        id="plot-parcel"
                        type="text"
                        maxLength={4}
                        value={plotParcelCode}
                        onChange={(e) => setPlotParcelCode(e.target.value)}
                        placeholder="e.g. 99"
                        className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div
                    className={`p-2.5 rounded-lg border text-[11px] font-mono ${
                      !canPreviewPin
                        ? 'bg-slate-50 border-slate-200 text-slate-600'
                        : hasPinCollision
                        ? 'bg-red-50 border-red-300 text-red-900'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    }`}
                  >
                    <div className="font-sans font-bold text-[10px] uppercase">
                      {!canPreviewPin
                        ? 'BLGF PIN Preview'
                        : hasPinCollision
                        ? 'PIN Collision Detected — Change Sec or Parcel No.'
                        : 'Unique BLGF PIN Ready'}
                    </div>
                    <div className="font-extrabold mt-0.5">
                      {canPreviewPin
                        ? newPin
                        : `024-18-${plotBrgyCode || '____'}-${cleanSec || '___'}-${cleanParcel || '__'}-0000`}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label htmlFor="plot-lot" className="block font-bold text-slate-800 mb-1">
                        Lot / Survey Ref
                      </label>
                      <input
                        id="plot-lot"
                        type="text"
                        value={plotLotCode}
                        onChange={(e) => setPlotLotCode(e.target.value)}
                        placeholder="e.g. Lot 4105-A"
                        className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-2.5 py-1.5 text-slate-900"
                      />
                    </div>
                    <div>
                      <label htmlFor="plot-usage" className="block font-bold text-slate-800 mb-1">
                        Actual Usage
                      </label>
                      <input
                        id="plot-usage"
                        type="text"
                        value={plotActualUsage}
                        onChange={(e) => setPlotActualUsage(e.target.value)}
                        placeholder="e.g. Vacant Lot"
                        className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-2.5 py-1.5 text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    disabled={!canSaveNewParcel}
                    onClick={() => handleSaveNewPlottedProperty(false)}
                    className="w-full min-h-[42px] px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:text-slate-600 text-white rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" aria-hidden="true" />
                    <span>Save Plotted Parcel to Map</span>
                  </button>

                  <button
                    type="button"
                    disabled={!canSaveNewParcel}
                    onClick={() => handleSaveNewPlottedProperty(true)}
                    className="w-full min-h-[40px] px-4 py-2 bg-slate-900 hover:bg-black disabled:bg-slate-200 disabled:text-slate-500 text-white rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5"
                  >
                    <FileEdit className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                    <span>Save &amp; Open in FAAS Appraisal</span>
                  </button>
                </div>
              </div>
            );
          })()}

          {plotMode === 'none' && (
            <>
              {/* Toolkit Tab Navigation */}
              <div
                role="tablist"
                aria-label="Cadastral Mapping Toolkit"
                className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-300"
              >
            {[
              { id: 'inspector', label: 'Inspector', icon: MapPin },
              { id: 'pin', label: 'BLGF PIN', icon: Hash },
              { id: 'improvements', label: 'Improvements', icon: Building2 },
              { id: 'discrepancies', label: 'Discrepancies', icon: AlertTriangle }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = rightTab === tab.id;
              const discBadge =
                tab.id === 'discrepancies' && selectedParcel
                  ? getParcelOpenDiscrepancies(selectedParcel).length
                  : 0;
              const impBadge =
                tab.id === 'improvements' && selectedParcel
                  ? getParcelImprovements(selectedParcel).length
                  : 0;
              const count = discBadge || impBadge;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setRightTab(tab.id as CadastralToolkitTab)}
                  className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
                        tab.id === 'discrepancies'
                          ? 'bg-red-600 text-white'
                          : isActive
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-300 text-slate-900'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: PARCEL INSPECTOR + SYNCED PARCEL INDEX */}
          {rightTab === 'inspector' && (
            <>
              {selectedParcel && (
                <div className="bg-white rounded-xl border-2 border-slate-900 shadow-sm p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <div className="text-[11px] font-mono font-bold text-slate-600">
                        SELECTED PARCEL INSPECTOR
                      </div>
                      <h2 className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
                        {selectedParcel.tdNo}
                      </h2>
                      <div className="text-xs font-mono text-slate-700">
                        PIN {selectedParcel.pin}
                      </div>
                      {selectedEntry?.geometry.lotCode && (
                        <div className="text-[11px] font-mono text-slate-600 mt-0.5">
                          {selectedEntry.geometry.lotCode}
                        </div>
                      )}
                    </div>
                    {selectedEntry?.isDraft ? (
                      <span className="px-2.5 py-1 rounded-full bg-indigo-100 border border-indigo-300 text-indigo-900 text-[11px] font-bold">
                        DRAFT — Pending CIS
                      </span>
                    ) : (
                      <StatusChip status={selectedParcel.paymentStatus} size="md" />
                    )}
                  </div>

                  {/* Quick Flags & Linked Structures Summary */}
                  {(() => {
                    const linkedBldgs = getParcelImprovements(selectedParcel);
                    const openFlags = getParcelOpenDiscrepancies(selectedParcel);
                    return (
                      (linkedBldgs.length > 0 || openFlags.length > 0) && (
                        <div className="flex flex-wrap gap-2 text-[11px]">
                          {linkedBldgs.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setRightTab('improvements')}
                              className="min-h-[30px] px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold inline-flex items-center gap-1.5 hover:bg-emerald-100"
                            >
                              <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>{linkedBldgs.length} Linked Improvement(s)</span>
                            </button>
                          )}
                          {openFlags.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setRightTab('discrepancies')}
                              className="min-h-[30px] px-2.5 py-1 rounded-md bg-red-50 border border-red-300 text-red-900 font-bold inline-flex items-center gap-1.5 hover:bg-red-100"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>{openFlags.length} Open Discrepancy Alert(s)</span>
                            </button>
                          )}
                        </div>
                      )
                    );
                  })()}

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="col-span-2">
                      <span className="text-slate-600 block font-semibold">Declared Owner</span>
                      <strong className="text-sm text-slate-900">{selectedParcel.ownerFull}</strong>
                    </div>

                    <div>
                      <span className="text-slate-600 block font-semibold">Barangay</span>
                      <strong className="text-slate-900">Brgy. {selectedParcel.barangay}</strong>
                    </div>

                    <div>
                      <span className="text-slate-600 block font-semibold">Classification</span>
                      <strong className="text-slate-900">
                        {selectedParcel.classification} (
                        {Math.round(selectedParcel.assessmentLevel * 100)}%)
                      </strong>
                    </div>

                    <div className="col-span-2">
                      <span className="text-slate-600 block font-semibold">
                        Actual Usage &amp; Survey Bearing
                      </span>
                      <strong className="text-slate-900 block">
                        {selectedEntry?.actualUsage ||
                          PARCEL_USAGE_META[selectedParcel.tdNo]?.actualUsage ||
                          DEFAULT_USAGE_BY_CLASS[selectedParcel.classification]}
                      </strong>
                      <span className="text-[11px] font-mono text-slate-600">
                        {selectedEntry?.surveyBearing ||
                          PARCEL_USAGE_META[selectedParcel.tdNo]?.surveyBearing ||
                          'Pasacao Municipal Cadastre (Cad. 544-D)'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-600 block font-semibold">Land Area &amp; SMV</span>
                      <strong className="font-mono text-slate-900">
                        {selectedParcel.areaSqm.toLocaleString()} sqm @ ₱
                        {selectedParcel.unitValue.toLocaleString()}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-600 block font-semibold">GPS Centroid</span>
                      <strong className="font-mono text-slate-900 text-[11px]">
                        {selectedCentroid
                          ? `${selectedCentroid[0].toFixed(4)}°N, ${selectedCentroid[1].toFixed(4)}°E`
                          : 'Pasacao GIS'}
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-600 block font-semibold">Market Value</span>
                      <strong className="font-mono text-slate-900">
                        ₱
                        {selectedParcel.marketValue.toLocaleString('en-PH', {
                          minimumFractionDigits: 2
                        })}
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-600 block font-semibold">Assessed Value</span>
                      <strong className="font-mono text-slate-900">
                        ₱
                        {selectedParcel.assessedValue.toLocaleString('en-PH', {
                          minimumFractionDigits: 2
                        })}
                      </strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-xs flex items-center justify-between">
                    <span className="font-semibold text-emerald-950">Annual RPT (2% Basic + SEF):</span>
                    <strong className="font-mono text-emerald-950">
                      ₱
                      {selectedParcel.totalTaxDue.toLocaleString('en-PH', {
                        minimumFractionDigits: 2
                      })}
                    </strong>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedEntry?.isDraft && selectedEntry.docketRef && onOpenDocketInFaas) {
                          onOpenDocketInFaas(selectedEntry.docketRef);
                        } else if (onOpenPropertyInFaas) {
                          onOpenPropertyInFaas(selectedParcel);
                        }
                      }}
                      className="w-full min-h-[42px] px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <FileEdit className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                      <span>Open Parcel in FAAS Appraisal Engine</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPlotMode('replot');
                        setDrawTool('polygon');
                        setDraftPoints([]);
                      }}
                      className="w-full min-h-[40px] px-4 py-2 border border-slate-400 bg-white hover:bg-slate-100 text-slate-900 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <PenTool className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                      <span>Re-Plot Lot Boundary on Map</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Synchronized Registry Quick-List */}
              <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-700" aria-hidden="true" />
                    <span>Parcel Index ({matchedParcels.length})</span>
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium">Click to zoom on map</span>
                </div>

                {matchedParcels.length === 0 ? (
                  <div className="p-5 text-center text-xs text-slate-600">
                    No mapped parcels match the current filter.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200 max-h-60 overflow-y-auto">
                    {matchedParcels.map((row) => {
                      const active = selectedParcel?.tdNo === row.tdNo;
                      const bldgs = getParcelImprovements(row).length;
                      const flags = getParcelOpenDiscrepancies(row).length;
                      return (
                        <button
                          key={row.tdNo}
                          type="button"
                          onClick={() => handleFocusParcel(row)}
                          className={`w-full text-left p-3 transition-colors border-l-4 ${
                            active
                              ? 'bg-slate-100 border-l-slate-900'
                              : 'bg-white hover:bg-slate-50 border-l-transparent'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-bold text-xs text-slate-900">
                              {row.tdNo}
                            </span>
                            <StatusChip status={row.paymentStatus} />
                          </div>
                          <div className="text-xs font-bold text-slate-900 mt-0.5">
                            {row.ownerFull}
                          </div>
                          <div className="text-[11px] font-mono text-slate-600 flex flex-wrap items-center gap-2 mt-0.5">
                            <span>
                              Brgy. {row.barangay} • {row.classification}
                            </span>
                            {mappedParcels.find((m) => m.row.tdNo === row.tdNo)?.isDraft && (
                              <span className="text-indigo-700 font-bold">
                                [Draft / Pending CIS]
                              </span>
                            )}
                            {bldgs > 0 && (
                              <span className="text-emerald-800 font-bold">
                                [{bldgs} Bldg]
                              </span>
                            )}
                            {flags > 0 && (
                              <span className="text-red-700 font-bold">
                                [{flags} Flag]
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 2: STANDARDIZED BLGF PIN GENERATOR */}
          {rightTab === 'pin' && (() => {
            const cleanProv = provCode.trim();
            const cleanMun = munCode.trim();
            const cleanBrgy = pinBrgyCode.trim();
            const cleanSec = pinSecCode.trim();
            const cleanParcel = pinParcelCode.trim();
            const cleanBldg = pinBldgCode.trim() || '0000';
            const canPreview =
              cleanProv.length > 0 &&
              cleanMun.length > 0 &&
              cleanBrgy.length > 0 &&
              cleanSec.length > 0 &&
              cleanParcel.length > 0;
            const generatedPin = canPreview
              ? `${cleanProv}-${cleanMun}-${cleanBrgy}-${cleanSec}-${cleanParcel}-${cleanBldg}`
              : '';
            const normGen = generatedPin.toLowerCase();
            const hasPinCollision =
              canPreview &&
              (assessmentRoll.some((r) => r.pin.toLowerCase() === normGen) ||
                dockets.some((d) => d.pin.toLowerCase() === normGen) ||
                pinReservations.some((p) => p.pin.toLowerCase() === normGen));
            const selectedBrgyObj = PASACAO_BARANGAYS.find((b) => b.code === cleanBrgy);

            return (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-slate-300 shadow-2xs p-4 space-y-3.5">
                  <div className="border-b border-slate-200 pb-2.5">
                    <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Hash className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                      <span>Standardized BLGF PIN Generator</span>
                    </h2>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Format: <code className="font-mono font-bold">Prov-Mun-Brgy-Sec-Parcel-Bldg</code> (RPTS Manual)
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <label htmlFor="blgf-prov" className="block font-bold text-slate-800 mb-1">
                        Province Code
                      </label>
                      <input
                        id="blgf-prov"
                        type="text"
                        maxLength={3}
                        value={provCode}
                        onChange={(e) => setProvCode(e.target.value)}
                        placeholder="024"
                        className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label htmlFor="blgf-mun" className="block font-bold text-slate-800 mb-1">
                        Municipality Code
                      </label>
                      <input
                        id="blgf-mun"
                        type="text"
                        maxLength={2}
                        value={munCode}
                        onChange={(e) => setMunCode(e.target.value)}
                        placeholder="18"
                        className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                      />
                    </div>

                    <div className="col-span-2">
                      <label htmlFor="blgf-brgy" className="block font-bold text-slate-800 mb-1">
                        Barangay Code
                      </label>
                      <select
                        id="blgf-brgy"
                        value={pinBrgyCode}
                        onChange={(e) => setPinBrgyCode(e.target.value)}
                        className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                      >
                        <option value="">-- Select barangay --</option>
                        {PASACAO_BARANGAYS.map((b) => (
                          <option key={b.code} value={b.code}>
                            {b.code} — {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="blgf-sec" className="block font-bold text-slate-800 mb-1">
                        Section (Sec)
                      </label>
                      <input
                        id="blgf-sec"
                        type="text"
                        maxLength={4}
                        value={pinSecCode}
                        onChange={(e) => setPinSecCode(e.target.value)}
                        placeholder="e.g. 005"
                        className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label htmlFor="blgf-parcel" className="block font-bold text-slate-800 mb-1">
                        Parcel No.
                      </label>
                      <input
                        id="blgf-parcel"
                        type="text"
                        maxLength={4}
                        value={pinParcelCode}
                        onChange={(e) => setPinParcelCode(e.target.value)}
                        placeholder="e.g. 22"
                        className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                      />
                    </div>

                    <div className="col-span-2">
                      <label htmlFor="blgf-bldg" className="block font-bold text-slate-800 mb-1">
                        Building / Improvement Code (optional)
                      </label>
                      <input
                        id="blgf-bldg"
                        type="text"
                        maxLength={4}
                        value={pinBldgCode}
                        onChange={(e) => setPinBldgCode(e.target.value)}
                        placeholder="Leave blank for Land-only (0000), or e.g. 1001"
                        className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Live PIN Preview & Duplicate Guard */}
                  <div
                    className={`p-3 rounded-lg border text-xs ${
                      !canPreview
                        ? 'bg-slate-50 border-slate-200 text-slate-600'
                        : hasPinCollision
                        ? 'bg-red-50 border-red-300 text-red-900'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider">
                          {!canPreview
                            ? 'Generated BLGF PIN Preview'
                            : hasPinCollision
                            ? 'Collision Detected — PIN Already Assigned'
                            : 'Unique BLGF PIN Ready'}
                        </div>
                        <div className="font-mono font-extrabold text-sm mt-0.5">
                          {canPreview ? generatedPin : '024-18-____-___-__-0000'}
                        </div>
                      </div>
                      {canPreview && !hasPinCollision && (
                        <button
                          type="button"
                          onClick={() => {
                            if (typeof navigator !== 'undefined' && navigator.clipboard) {
                              navigator.clipboard.writeText(generatedPin).catch(() => {});
                            }
                            pushToast('BLGF PIN Copied', `Copied ${generatedPin} to clipboard.`, 'info');
                          }}
                          aria-label="Copy generated BLGF PIN"
                          className="min-h-[36px] px-2.5 py-1 bg-white border border-emerald-400 hover:bg-emerald-100 rounded-md text-[11px] font-bold text-emerald-900 inline-flex items-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Copy</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!canPreview || hasPinCollision}
                    onClick={() => {
                      reserveBlgfPin({
                        pin: generatedPin,
                        provCode: cleanProv,
                        munCode: cleanMun,
                        brgyCode: cleanBrgy,
                        brgyName: selectedBrgyObj?.name || 'Pasacao',
                        secCode: cleanSec,
                        parcelCode: cleanParcel,
                        bldgCode: cleanBldg,
                        tdNo: selectedParcel?.tdNo,
                        remarks: 'Generated from Cadastral Tax Map BLGF PIN Tool'
                      });
                      setPinBrgyCode('');
                      setPinSecCode('');
                      setPinParcelCode('');
                      setPinBldgCode('');
                    }}
                    className="w-full min-h-[42px] px-4 py-2 bg-slate-900 hover:bg-black disabled:bg-slate-300 disabled:text-slate-600 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Reserve BLGF PIN
                  </button>
                </div>

                {/* Reserved BLGF PIN Log */}
                <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      Reserved BLGF PIN Log ({pinReservations.length})
                    </span>
                  </div>
                  {pinReservations.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-600">
                      No new BLGF PINs reserved yet in this session.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200 max-h-48 overflow-y-auto">
                      {pinReservations.map((res) => (
                        <div key={res.id} className="p-3 text-xs">
                          <div className="font-mono font-extrabold text-slate-900">{res.pin}</div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            Brgy. {res.brgyName} • {res.reservedAt}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* TAB 3: IMPROVEMENT-TO-LAND LINKAGE */}
          {rightTab === 'improvements' && (
            <div className="space-y-4">
              {selectedParcel && (
                <div className="bg-white rounded-xl border border-slate-300 shadow-2xs p-4 space-y-3.5">
                  <div className="border-b border-slate-200 pb-2.5">
                    <div className="text-[11px] font-mono font-bold text-slate-600">
                      PARENT LAND PARCEL
                    </div>
                    <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
                      <Link2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                      <span>
                        {selectedParcel.tdNo} ({selectedParcel.pin})
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Attach building/machinery appraisals via <code className="font-mono">&lt;LandPIN&gt;-&lt;BldgCode&gt;</code>
                    </p>
                  </div>

                  {/* Link New Improvement Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (
                        !impBldgCode.trim() ||
                        !impStructureType ||
                        !impDescription.trim() ||
                        !impFloorArea.trim() ||
                        !impYearBuilt.trim()
                      ) {
                        return;
                      }
                      const cleanBldg = impBldgCode.trim();
                      linkImprovementToLand({
                        landTdNo: selectedParcel.tdNo,
                        landPin: selectedParcel.pin,
                        bldgPin: `${selectedParcel.pin}-${cleanBldg}`,
                        bldgCode: cleanBldg,
                        structureType: impStructureType,
                        description: impDescription.trim(),
                        floorAreaSqm: Number(impFloorArea) || 0,
                        yearBuilt: impYearBuilt.trim()
                      });
                      setImpBldgCode('');
                      setImpStructureType('');
                      setImpDescription('');
                      setImpFloorArea('');
                      setImpYearBuilt('');
                    }}
                    className="space-y-2.5 text-xs"
                  >
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label htmlFor="imp-bldg-code" className="block font-bold text-slate-800 mb-1">
                          Bldg Code Suffix
                        </label>
                        <input
                          id="imp-bldg-code"
                          type="text"
                          maxLength={4}
                          required
                          value={impBldgCode}
                          onChange={(e) => setImpBldgCode(e.target.value)}
                          placeholder={`e.g. 100${getParcelImprovements(selectedParcel).length + 1}`}
                          className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                        />
                      </div>

                      <div>
                        <label htmlFor="imp-year" className="block font-bold text-slate-800 mb-1">
                          Year Constructed
                        </label>
                        <input
                          id="imp-year"
                          type="text"
                          maxLength={4}
                          required
                          value={impYearBuilt}
                          onChange={(e) => setImpYearBuilt(e.target.value)}
                          placeholder="e.g. 2024"
                          className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="imp-type" className="block font-bold text-slate-800 mb-1">
                        Structure / Improvement Type
                      </label>
                      <select
                        id="imp-type"
                        required
                        value={impStructureType}
                        onChange={(e) =>
                          setImpStructureType(e.target.value as '' | LandImprovementLink['structureType'])
                        }
                        className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-2.5 py-1.5 font-semibold text-slate-900"
                      >
                        <option value="">-- Select structure type --</option>
                        <option value="Residential Building">Residential Building</option>
                        <option value="Commercial Building">Commercial Building</option>
                        <option value="Industrial / Warehouse">Industrial / Warehouse</option>
                        <option value="Other Structure / Machinery">
                          Other Structure / Machinery
                        </option>
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="col-span-2">
                        <label htmlFor="imp-desc" className="block font-bold text-slate-800 mb-1">
                          Structure Description
                        </label>
                        <input
                          id="imp-desc"
                          type="text"
                          required
                          value={impDescription}
                          onChange={(e) => setImpDescription(e.target.value)}
                          placeholder="e.g. Concrete Extension Annex"
                          className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-2.5 py-1.5 text-slate-900"
                        />
                      </div>
                      <div>
                        <label htmlFor="imp-area" className="block font-bold text-slate-800 mb-1">
                          Floor (sqm)
                        </label>
                        <input
                          id="imp-area"
                          type="number"
                          min={1}
                          required
                          value={impFloorArea}
                          onChange={(e) => setImpFloorArea(e.target.value)}
                          placeholder="120"
                          className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full min-h-[42px] px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5"
                    >
                      <Link2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                      <span>Link Improvement to Land PIN</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Linked Structures List */}
              {selectedParcel && (
                <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      Linked Improvements ({getParcelImprovements(selectedParcel).length})
                    </span>
                    <span className="font-mono text-[11px] text-slate-600">
                      {selectedParcel.tdNo}
                    </span>
                  </div>
                  {getParcelImprovements(selectedParcel).length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-600">
                      No buildings or machinery linked to this land parcel yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200 max-h-56 overflow-y-auto">
                      {getParcelImprovements(selectedParcel).map((imp) => (
                        <div key={imp.id} className="p-3 text-xs space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-extrabold text-emerald-900">
                              {imp.bldgPin}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-[10px] font-bold text-slate-800">
                              Built {imp.yearBuilt}
                            </span>
                          </div>
                          <div className="font-bold text-slate-900">{imp.description}</div>
                          <div className="text-[11px] text-slate-600">
                            {imp.structureType} •{' '}
                            <span className="font-mono font-bold">
                              {imp.floorAreaSqm.toLocaleString()} sqm
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DISCREPANCY LOGGER (Synced with Problem & Deficiency Log) */}
          {rightTab === 'discrepancies' && (
            <div className="space-y-4">
              {selectedParcel && (
                <div className="bg-white rounded-xl border border-slate-300 shadow-2xs p-4 space-y-3.5">
                  <div className="border-b border-slate-200 pb-2.5">
                    <div className="text-[11px] font-mono font-bold text-red-700">
                      FIELD DISCREPANCY &amp; AUDIT LOGGER
                    </div>
                    <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
                      <AlertTriangle className="w-4 h-4 text-red-700" aria-hidden="true" />
                      <span>
                        Flag {selectedParcel.tdNo} ({selectedParcel.pin})
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Logs sync live with the Assessor&rsquo;s Problem &amp; Deficiency Log and highlight the lot in dashed red.
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!discCategory || !discDescription.trim()) return;
                      logAssessmentProblem({
                        referenceNo: `${selectedParcel.tdNo} (${selectedParcel.pin})`,
                        category: discCategory,
                        clientName: selectedParcel.ownerFull,
                        description: discDescription.trim()
                      });
                      setDiscCategory('');
                      setDiscDescription('');
                    }}
                    className="space-y-2.5 text-xs"
                  >
                    <div>
                      <label htmlFor="disc-cat" className="block font-bold text-slate-800 mb-1">
                        Discrepancy Category
                      </label>
                      <select
                        id="disc-cat"
                        required
                        value={discCategory}
                        onChange={(e) =>
                          setDiscCategory(e.target.value as '' | AssessmentProblemTicket['category'])
                        }
                        className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-2.5 py-1.5 font-semibold text-slate-900"
                      >
                        <option value="">-- Select discrepancy type --</option>
                        <option value="Unassessed Structure">Unassessed Structure</option>
                        <option value="Duplicate PIN / Boundary">Duplicate PIN / Boundary Conflict</option>
                        <option value="Usage / Class Mismatch">Actual Usage / Class Mismatch</option>
                        <option value="Ownership Correction">Ownership Correction</option>
                        <option value="Other Assessment Concern">Other Assessment Concern</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="disc-desc" className="block font-bold text-slate-800 mb-1">
                        Field Observation / Findings
                      </label>
                      <textarea
                        id="disc-desc"
                        rows={3}
                        required
                        value={discDescription}
                        onChange={(e) => setDiscDescription(e.target.value)}
                        placeholder="Describe unassessed structure, boundary overlap, or usage mismatch..."
                        className="w-full bg-white border border-slate-400 rounded-lg px-2.5 py-2 text-xs text-slate-900"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full min-h-[42px] px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Flag Parcel Discrepancy</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Parcel Discrepancy Queue */}
              {selectedParcel && (
                <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      Parcel Flags ({getParcelAllDiscrepancies(selectedParcel).length})
                    </span>
                    <span className="font-mono text-[11px] text-slate-600">
                      {selectedParcel.tdNo}
                    </span>
                  </div>

                  {getParcelAllDiscrepancies(selectedParcel).length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-600">
                      No discrepancy tickets logged for {selectedParcel.tdNo}.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200 max-h-64 overflow-y-auto">
                      {getParcelAllDiscrepancies(selectedParcel).map((ticket) => {
                        const resValue = resolutionNotesMap[ticket.id] || '';
                        return (
                          <div key={ticket.id} className="p-3 text-xs space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-slate-900">{ticket.category}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  ticket.status === 'Open'
                                    ? 'bg-red-100 text-red-900'
                                    : 'bg-emerald-100 text-emerald-900'
                                }`}
                              >
                                {ticket.status}
                              </span>
                            </div>
                            <p className="text-slate-700 leading-relaxed">{ticket.description}</p>
                            {ticket.status === 'Open' ? (
                              <div className="flex items-center gap-1.5 pt-1">
                                <input
                                  type="text"
                                  aria-label={`Resolution remarks for ${ticket.id}`}
                                  value={resValue}
                                  onChange={(e) =>
                                    setResolutionNotesMap((prev) => ({
                                      ...prev,
                                      [ticket.id]: e.target.value
                                    }))
                                  }
                                  placeholder="Resolution note..."
                                  className="flex-1 min-h-[36px] bg-white border border-slate-400 rounded-md px-2 py-1 text-[11px] text-slate-900"
                                />
                                <button
                                  type="button"
                                  disabled={!resValue.trim()}
                                  onClick={() => {
                                    resolveAssessmentProblem(ticket.id, resValue.trim());
                                    setResolutionNotesMap((prev) => {
                                      const next = { ...prev };
                                      delete next[ticket.id];
                                      return next;
                                    });
                                  }}
                                  className="min-h-[36px] px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:text-slate-600 text-white rounded-md text-[11px] font-bold inline-flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                                  <span>Resolve</span>
                                </button>
                              </div>
                            ) : (
                              ticket.resolutionNotes && (
                                <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900">
                                  <strong>Resolved:</strong> {ticket.resolutionNotes}
                                </div>
                              )
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
