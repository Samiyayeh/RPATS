import React, { createContext, useContext, useState } from 'react';
import {
  AssessmentDocket,
  AssessmentProblemTicket,
  AssessmentRollRow,
  BlgfPinReservation,
  CertificationRequest,
  LandImprovementLink,
  LegacyArchiveRecord,
  LienAnnotationRecord,
  MappedParcelGeometry,
  OcularInspectionRequest,
  OfficeRole,
  PropertyClassification,
  SmvNoticeRevision,
  SmvRateEntry,
  SyncToast,
  UserPersona
} from '../types/rpatis';
import {
  INITIAL_ASSESSMENT_ROLL,
  INITIAL_DOCKETS,
  USER_PERSONAS
} from '../data/mockData';

interface RpatisContextType {
  // Authentication & Role State
  currentUser: UserPersona | null;
  authenticateStaff: (employeeId: string, password: string) => { ok: boolean; error?: string };
  loginAsRole: (role: OfficeRole) => void;
  logout: () => void;
  switchPersona: (role: OfficeRole) => void;

  // Shared Inter-Office Reactive State
  dockets: AssessmentDocket[];
  assessmentRoll: AssessmentRollRow[];
  activeDocketId: string;
  setActiveDocketId: (id: string) => void;

  // Inter-Office Actions
  createOrUpdateDocket: (docket: AssessmentDocket) => void;
  endorseDocketsToCapitol: (docketIds: string[]) => void;
  forwardDocketToSignoff: (docketId: string) => void;
  flagDocketDeficiency: (docketId: string, reason: string) => void;
  approveAndIssueCis: (docketId: string, sha256Hash: string, cisSerial: string) => void;
  recordTreasuryPayment: (
    tdNo: string,
    payorName: string,
    amountPaid: number,
    orNo: string,
    clearanceNo: string
  ) => void;

  // Frontline Assessor Services State (Services 1–5 & 11)
  certifications: CertificationRequest[];
  lienAnnotations: LienAnnotationRecord[];
  ocularRequests: OcularInspectionRequest[];
  problemTickets: AssessmentProblemTicket[];
  legacyRecords: LegacyArchiveRecord[];
  smvRates: SmvRateEntry[];
  activeSmvNotice: { ref: string; effectiveDate: string };
  smvRevisions: SmvNoticeRevision[];
  pinReservations: BlgfPinReservation[];
  improvementLinks: LandImprovementLink[];
  customParcelGeometries: MappedParcelGeometry[];
  reserveBlgfPin: (
    entry: Omit<BlgfPinReservation, 'id' | 'reservedBy' | 'reservedAt'>
  ) => BlgfPinReservation;
  linkImprovementToLand: (
    entry: Omit<LandImprovementLink, 'id' | 'linkedAt'>
  ) => LandImprovementLink;
  saveParcelGeometry: (
    geo: Omit<MappedParcelGeometry, 'plottedBy' | 'plottedAt'>
  ) => void;
  issueCertification: (cert: Omit<CertificationRequest, 'id' | 'issuedAt' | 'status'>) => CertificationRequest;
  recordLienAnnotation: (lien: Omit<LienAnnotationRecord, 'id' | 'recordedAt' | 'status'>) => void;
  scheduleOcularInspection: (req: Omit<OcularInspectionRequest, 'id' | 'status'>) => void;
  markOcularVerified: (id: string) => void;
  logAssessmentProblem: (ticket: Omit<AssessmentProblemTicket, 'id' | 'loggedAt' | 'status'>) => void;
  resolveAssessmentProblem: (id: string, resolutionNotes: string) => void;
  resubmitFlaggedDocket: (docketId: string, correctiveNote: string) => void;
  addLegacyRecord: (rec: Omit<LegacyArchiveRecord, 'id'>) => LegacyArchiveRecord;
  migrateLegacyToModern: (legacyId: string, docket: AssessmentDocket) => void;
  updateSmvFromNotice: (payload: {
    targetId?: string;
    category: PropertyClassification;
    subclass: string;
    description: string;
    zones: string;
    rate: number;
    level: number;
    noticeRef: string;
    effectiveDate: string;
    remarks: string;
  }) => void;

  // Accessible Live Notifications (WCAG R-02 aria-live="polite")
  toasts: SyncToast[];
  pushToast: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
  dismissToast: (id: string) => void;
}

const RpatisContext = createContext<RpatisContextType | undefined>(undefined);

export const RpatisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserPersona | null>(null);
  const [dockets, setDockets] = useState<AssessmentDocket[]>(INITIAL_DOCKETS);
  const [assessmentRoll, setAssessmentRoll] = useState<AssessmentRollRow[]>(INITIAL_ASSESSMENT_ROLL);
  const [activeDocketId, setActiveDocketId] = useState<string>('PAS-2026-0849');
  const [toasts, setToasts] = useState<SyncToast[]>([]);

  const [certifications, setCertifications] = useState<CertificationRequest[]>([
    {
      id: 'CERT-2026-0142',
      type: 'Certified True Copy of Tax Declaration',
      tdNo: 'TD-26-0001',
      pin: '041-01-001',
      requestorName: 'Juan M. Dela Cruz',
      purpose: 'Bank Loan & Title Verification',
      proofOfOwnershipVerified: true,
      spaVerified: true,
      treasuryOrNo: 'OR-7712301',
      feeAmount: 150,
      issuedAt: 'March 18, 2026 • 09:12 AM',
      status: 'Released'
    }
  ]);

  const [lienAnnotations, setLienAnnotations] = useState<LienAnnotationRecord[]>([
    {
      id: 'LIEN-2026-0038',
      action: 'Annotate Mortgage',
      tdNo: 'TD-26-0003',
      pin: '041-03-007',
      ownerName: 'Arturo C. Reyes',
      mortgageeBank: 'Land Bank of the Philippines — Naga Branch',
      noticeRefNo: 'REM-2026-00419',
      annotationOrNo: 'OR-7712302',
      recordedAt: 'March 17, 2026 • 02:30 PM',
      status: 'Annotated'
    }
  ]);

  const [ocularRequests, setOcularRequests] = useState<OcularInspectionRequest[]>([
    {
      id: 'OCU-2026-0019',
      requestorName: 'Lourdes M. Garcia',
      lotDescription: 'Unidentified Agricultural Parcel along Tinalmud Creek',
      barangay: 'Tinalmud',
      legalDocRef: 'Deed of Partition (1988) / Brgy. Certification',
      scheduledDate: 'March 19, 2026',
      assignedOfficer: 'Liza M. Bañares / Mun. Assessor',
      status: 'Scheduled (1-Day SLA)'
    }
  ]);

  const [problemTickets, setProblemTickets] = useState<AssessmentProblemTicket[]>([
    {
      id: 'PRB-2026-0011',
      referenceNo: 'TD-26-0004',
      category: 'Valuation Query',
      clientName: 'Roberto D. Bautista',
      description: 'Requested clarification on R-1 vs R-2 unit value classification for Odicon interior lot.',
      loggedAt: 'March 18, 2026 • 10:05 AM',
      status: 'Open'
    }
  ]);

  const [legacyRecords, setLegacyRecords] = useState<LegacyArchiveRecord[]>([
    {
      id: 'LEG-1949-0412',
      vintageTd: '1949-0412',
      revision: '1949 Foundation',
      owner: 'Don Mariano Dela Cruz (Deceased 1968)',
      lot: 'Cadastral Lot 4102 (Original Madre Lot), Pasacao',
      area: '1,800.00 sqm (Subdivided into 4 lots in 1972)',
      location: 'Vault Room B, Shelf 4, Binder 1949-A',
      transcription:
        'Lote original dividido en cuatro partes segun Escritura de Particion de Fecha 12 de Junio de 1972.',
      modernDraftTarget: 'PAS-2026-0849 • Juan M. Dela Cruz (Lot 4102-B, 450 sqm)'
    },
    {
      id: 'LEG-1967-1189',
      vintageTd: '1967-1189',
      revision: '1967 General Revision',
      owner: 'Fausto M. Asido',
      lot: 'Cadastral Lot 3891, Brgy. Caranan, Pasacao',
      area: '1,280.00 sqm',
      location: 'Vault Room A, Shelf 2, Binder 1967-08',
      transcription:
        'Original coastal agricultural lot reclassified along Caranan municipal highway.',
      modernDraftTarget: 'PAS-2026-0850 • Caranan Fishing Corp. (Lot 3891-C, 320 sqm)'
    }
  ]);

  const [smvRates, setSmvRates] = useState<SmvRateEntry[]>([
    {
      id: 'SMV-R1',
      category: 'Residential',
      subclass: 'R-1 (Residential First Class)',
      description: 'Paved concrete road frontage, complete water & power access',
      zones: 'Poblacion, Sta. Rosa del Sur, Balogo, Odicon',
      rate: 1200,
      level: 20,
      ordinanceRef: 'Provincial Ordinance No. 2024-08',
      effectiveDate: '2024-01-01'
    },
    {
      id: 'SMV-R2',
      category: 'Residential',
      subclass: 'R-2 (Residential Second Class)',
      description: 'Gravel road, interior access within 500m of main highway',
      zones: 'Macad, San Roque, Dalupaon',
      rate: 1000,
      level: 20,
      ordinanceRef: 'Provincial Ordinance No. 2024-08',
      effectiveDate: '2024-01-01'
    },
    {
      id: 'SMV-AG1',
      category: 'Agricultural',
      subclass: 'Ag-1 (Irrigated Riceland / Coconut)',
      description: 'Productive agricultural land under Section 218 RA 7160',
      zones: 'Caranan, Tinalmud, Itulan',
      rate: 85,
      level: 40,
      ordinanceRef: 'Provincial Ordinance No. 2024-08',
      effectiveDate: '2024-01-01'
    },
    {
      id: 'SMV-C1',
      category: 'Commercial',
      subclass: 'C-1 (Commercial First Class)',
      description: 'Primary commercial strip and municipal market perimeter',
      zones: 'Dalupaon Highway, Cuco, Poblacion Market',
      rate: 2500,
      level: 50,
      ordinanceRef: 'Provincial Ordinance No. 2024-08',
      effectiveDate: '2024-01-01'
    }
  ]);

  const [activeSmvNotice, setActiveSmvNotice] = useState<{ ref: string; effectiveDate: string }>({
    ref: 'Camarines Sur Provincial Ordinance No. 2024-08',
    effectiveDate: '2024-01-01'
  });

  const [smvRevisions, setSmvRevisions] = useState<SmvNoticeRevision[]>([]);
  const [pinReservations, setPinReservations] = useState<BlgfPinReservation[]>([]);
  const [improvementLinks, setImprovementLinks] = useState<LandImprovementLink[]>([
    {
      id: 'IMP-001',
      landTdNo: 'TD-26-04912',
      landPin: '024-18-0012-005-22',
      bldgPin: '024-18-0012-005-22-1001',
      bldgCode: '1001',
      structureType: 'Residential Building',
      description: 'Type III-A Concrete Bungalow',
      floorAreaSqm: 145,
      yearBuilt: '2019',
      linkedAt: 'March 12, 2026'
    },
    {
      id: 'IMP-002',
      landTdNo: 'TD-26-0003',
      landPin: '041-03-007',
      bldgPin: '041-03-007-1001',
      bldgCode: '1001',
      structureType: 'Commercial Building',
      description: '2-Storey Commercial Building',
      floorAreaSqm: 280,
      yearBuilt: '2021',
      linkedAt: 'March 14, 2026'
    }
  ]);
  const [customParcelGeometries, setCustomParcelGeometries] = useState<MappedParcelGeometry[]>([]);

  const pushToast = (
    title: string,
    message: string,
    type: 'success' | 'info' | 'warning' = 'success'
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const timestamp = new Date().toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit'
    });
    setToasts((prev) => [{ id, title, message, type, timestamp }, ...prev].slice(0, 3));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const authenticateStaff = (employeeId: string, password: string) => {
    const cleanedId = employeeId.trim().toUpperCase();
    if (!cleanedId || !password.trim()) {
      return { ok: false, error: 'Please enter both your assigned Employee ID and password.' };
    }
    const matched = Object.values(USER_PERSONAS).find(
      (p) => p.employeeId && p.employeeId.toUpperCase() === cleanedId
    );
    if (!matched) {
      return {
        ok: false,
        error:
          'Unrecognized Employee ID. Verify your assigned LGU ID or contact the Pasacao MIS Helpdesk.'
      };
    }
    setCurrentUser(matched);
    pushToast(
      'Session Authenticated',
      `Welcome, ${matched.name} — ${matched.departmentName}.`,
      'info'
    );
    return { ok: true };
  };

  const loginAsRole = (role: OfficeRole) => {
    const persona = USER_PERSONAS[role];
    if (persona) {
      setCurrentUser(persona);
      pushToast(
        'Authenticated Session Active',
        `Signed in as ${persona.name} (${persona.departmentName}).`,
        'info'
      );
    }
  };

  const switchPersona = (role: OfficeRole) => {
    const persona = USER_PERSONAS[role];
    if (persona) {
      setCurrentUser(persona);
      pushToast(
        'Active Role Switched',
        `Now viewing as ${persona.name} — ${persona.title}.`,
        'info'
      );
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const createOrUpdateDocket = (newDocket: AssessmentDocket) => {
    setDockets((prev) => {
      const exists = prev.some((d) => d.id === newDocket.id);
      if (exists) {
        return prev.map((d) => (d.id === newDocket.id ? newDocket : d));
      }
      return [newDocket, ...prev];
    });
    setActiveDocketId(newDocket.id);
    pushToast(
      'Appraisal Draft Saved',
      `Docket ${newDocket.id} (${newDocket.owner}) saved to Municipal Assessor register.`,
      'success'
    );
  };

  const endorseDocketsToCapitol = (docketIds: string[]) => {
    const nowStr = 'March 18, 2026 • Just now';
    setDockets((prev) =>
      prev.map((d) =>
        docketIds.includes(d.id)
          ? {
              ...d,
              status: 'Under Technical Review',
              transmittedAt: nowStr,
              examinerName: 'Engr. Roberto Villafuerte'
            }
          : d
      )
    );
    pushToast(
      'Dispatched to Provincial Capitol (Pili)',
      `${docketIds.length} encrypted docket(s) synchronized to Pili review queue (<1s).`,
      'success'
    );
  };

  const forwardDocketToSignoff = (docketId: string) => {
    setDockets((prev) =>
      prev.map((d) => (d.id === docketId ? { ...d, status: 'Ready for Sign-Off' } : d))
    );
    pushToast(
      'Forwarded for CIS Sign-Off',
      `Docket ${docketId} marked Ready for Sign-Off and queued for the Provincial Assessor.`,
      'info'
    );
  };

  const flagDocketDeficiency = (docketId: string, reason: string) => {
    const newNote = {
      id: `DEF-${Date.now()}`,
      date: 'March 18, 2026 • Just now',
      author: currentUser?.name || 'Engr. Roberto Villafuerte',
      role: currentUser?.title || 'Provincial Review Examiner',
      message: reason,
      resolved: false
    };
    setDockets((prev) =>
      prev.map((d) =>
        d.id === docketId
          ? {
              ...d,
              status: 'Flagged',
              deficiencies: [...d.deficiencies, newNote]
            }
          : d
      )
    );
    pushToast(
      'Deficiency Returned to LGU',
      `Docket ${docketId} returned to Pasacao Assessor with itemized deficiency notes.`,
      'warning'
    );
  };

  const approveAndIssueCis = (docketId: string, sha256Hash: string, cisSerial: string) => {
    const target = dockets.find((d) => d.id === docketId);
    setDockets((prev) =>
      prev.map((d) =>
        d.id === docketId
          ? {
              ...d,
              status: 'Approved',
              cisSerial,
              cisHash: sha256Hash
            }
          : d
      )
    );

    if (target) {
      setAssessmentRoll((prev) => {
        const exists = prev.some((r) => r.tdNo === target.tdNo || r.pin === target.pin);
        const basicRpt = Math.round(target.assessedValue * 0.01);
        const sef = Math.round(target.assessedValue * 0.01);
        const row: AssessmentRollRow = {
          tdNo: target.tdNo,
          pin: target.pin,
          ownerMasked: target.ownerMasked,
          ownerFull: target.owner,
          barangay: target.barangay.replace(/^Brgy\.\s*/i, '').replace(/,\s*Pasacao$/i, ''),
          classification: target.classification,
          areaSqm: target.areaSqm,
          unitValue: target.unitValue,
          marketValue: target.marketValue,
          assessmentLevel: target.assessmentLevel / 100,
          assessedValue: target.assessedValue,
          basicRpt,
          sef,
          totalTaxDue: basicRpt + sef,
          paymentStatus: 'Unpaid',
          orNo: '',
          source: 'Capitol CIS Approved',
          syncTime: 'Just now (Capitol Sync)'
        };
        if (exists) {
          return prev.map((r) => (r.tdNo === target.tdNo || r.pin === target.pin ? row : r));
        }
        return [row, ...prev];
      });
    }

    pushToast(
      'CIS Issued & Auto-Synced to Treasury',
      `${cisSerial} cryptographically signed (SHA-256) and dispatched to Pasacao Assessor & Treasury.`,
      'success'
    );
  };

  const recordTreasuryPayment = (
    tdNo: string,
    payorName: string,
    amountPaid: number,
    orNo: string,
    clearanceNo: string
  ) => {
    const nowStr = 'March 18, 2026 • Just now';
    setAssessmentRoll((prev) =>
      prev.map((r) =>
        r.tdNo === tdNo
          ? { ...r, paymentStatus: 'Paid', orNo, syncTime: 'Settled just now' }
          : r
      )
    );
    setDockets((prev) =>
      prev.map((d) =>
        d.tdNo === tdNo
          ? {
              ...d,
              status: 'Paid',
              orNo,
              taxClearanceNo: clearanceNo,
              paidAt: nowStr,
              amountPaid
            }
          : d
      )
    );
    pushToast(
      'Official Receipt & Tax Clearance Issued',
      `Settled PHP ${amountPaid.toLocaleString('en-PH', { minimumFractionDigits: 2 })} for ${payorName} (${orNo}).`,
      'success'
    );
  };

  const issueCertification = (
    cert: Omit<CertificationRequest, 'id' | 'issuedAt' | 'status'>
  ): CertificationRequest => {
    const created: CertificationRequest = {
      ...cert,
      id: `CERT-2026-${String(certifications.length + 143).padStart(4, '0')}`,
      issuedAt: 'March 18, 2026 • Just now',
      status: 'Released'
    };
    setCertifications((prev) => [created, ...prev]);
    pushToast(
      'Certification Issued',
      `${created.type} (${created.id}) released against Treasury ${created.treasuryOrNo}.`,
      'success'
    );
    return created;
  };

  const recordLienAnnotation = (
    lien: Omit<LienAnnotationRecord, 'id' | 'recordedAt' | 'status'>
  ) => {
    const created: LienAnnotationRecord = {
      ...lien,
      id: `LIEN-2026-${String(lienAnnotations.length + 39).padStart(4, '0')}`,
      recordedAt: 'March 18, 2026 • Just now',
      status: lien.action === 'Annotate Mortgage' ? 'Annotated' : 'Cancelled'
    };
    setLienAnnotations((prev) => [created, ...prev]);
    pushToast(
      `Mortgage ${created.status}`,
      `${created.action} recorded on ${created.tdNo} (${created.mortgageeBank}).`,
      'success'
    );
  };

  const scheduleOcularInspection = (req: Omit<OcularInspectionRequest, 'id' | 'status'>) => {
    const created: OcularInspectionRequest = {
      ...req,
      id: `OCU-2026-${String(ocularRequests.length + 20).padStart(4, '0')}`,
      status: 'Scheduled (1-Day SLA)'
    };
    setOcularRequests((prev) => [created, ...prev]);
    pushToast(
      'Ocular Inspection Scheduled',
      `Field verification (${created.id}) set for ${created.scheduledDate} in Brgy. ${created.barangay}.`,
      'info'
    );
  };

  const markOcularVerified = (id: string) => {
    setOcularRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Verified & Identified' } : r))
    );
    pushToast('Property Identified', `Ocular inspection ${id} completed and verified.`, 'success');
  };

  const logAssessmentProblem = (
    ticket: Omit<AssessmentProblemTicket, 'id' | 'loggedAt' | 'status'>
  ) => {
    const created: AssessmentProblemTicket = {
      ...ticket,
      id: `PRB-2026-${String(problemTickets.length + 12).padStart(4, '0')}`,
      loggedAt: 'March 18, 2026 • Just now',
      status: 'Open'
    };
    setProblemTickets((prev) => [created, ...prev]);
    pushToast('Assessment Concern Logged', `Ticket ${created.id} logged for resolution.`, 'info');
  };

  const resolveAssessmentProblem = (id: string, resolutionNotes: string) => {
    setProblemTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'Resolved', resolutionNotes } : t))
    );
    pushToast('Assessment Concern Resolved', `Ticket ${id} marked resolved.`, 'success');
  };

  const resubmitFlaggedDocket = (docketId: string, correctiveNote: string) => {
    const newNote = {
      id: `DEF-RES-${Date.now()}`,
      date: 'March 18, 2026 • Just now',
      author: currentUser?.name || 'Liza M. Bañares',
      role: currentUser?.title || 'Municipal Assessor Office (Pasacao)',
      message: `CORRECTIVE RE-UPLOAD: ${correctiveNote}`,
      resolved: true
    };
    setDockets((prev) =>
      prev.map((d) =>
        d.id === docketId
          ? {
              ...d,
              status: 'Under Technical Review',
              deficiencies: [...d.deficiencies, newNote]
            }
          : d
      )
    );
    pushToast(
      'Corrected Docket Resubmitted to Pili',
      `Docket ${docketId} returned to Provincial Capitol review queue with corrective upload.`,
      'success'
    );
  };

  const addLegacyRecord = (rec: Omit<LegacyArchiveRecord, 'id'>): LegacyArchiveRecord => {
    const created: LegacyArchiveRecord = {
      ...rec,
      id: `LEG-${Date.now()}`
    };
    setLegacyRecords((prev) => [created, ...prev]);
    pushToast(
      'Paper Ledger Digitized',
      `Vintage TD #${created.vintageTd} (${created.owner}) ingested into Historical Cadastre Vault.`,
      'success'
    );
    return created;
  };

  const migrateLegacyToModern = (legacyId: string, docket: AssessmentDocket) => {
    setDockets((prev) => {
      const exists = prev.some((d) => d.id === docket.id);
      return exists ? prev.map((d) => (d.id === docket.id ? docket : d)) : [docket, ...prev];
    });
    setActiveDocketId(docket.id);

    const basicRpt = Math.round(docket.assessedValue * 0.01);
    const sef = Math.round(docket.assessedValue * 0.01);
    const rollRow: AssessmentRollRow = {
      tdNo: docket.tdNo,
      pin: docket.pin,
      ownerMasked: docket.ownerMasked,
      ownerFull: docket.owner,
      barangay: docket.barangay.replace(/^Brgy\.\s*/i, '').replace(/,\s*Pasacao$/i, ''),
      classification: docket.classification,
      areaSqm: docket.areaSqm,
      unitValue: docket.unitValue,
      marketValue: docket.marketValue,
      assessmentLevel: docket.assessmentLevel / 100,
      assessedValue: docket.assessedValue,
      basicRpt,
      sef,
      totalTaxDue: basicRpt + sef,
      paymentStatus: 'Unpaid',
      orNo: '',
      source: 'Assessor Roll',
      syncTime: 'Migrated just now'
    };

    setAssessmentRoll((prev) => {
      const exists = prev.some((r) => r.tdNo === rollRow.tdNo || r.pin === rollRow.pin);
      return exists
        ? prev.map((r) => (r.tdNo === rollRow.tdNo || r.pin === rollRow.pin ? rollRow : r))
        : [rollRow, ...prev];
    });

    const summary = `${docket.id} (${docket.tdNo}) • ${docket.owner} (${docket.lotNo}, ${docket.areaSqm.toLocaleString()} sqm)`;
    setLegacyRecords((prev) =>
      prev.map((l) => (l.id === legacyId ? { ...l, modernDraftTarget: summary } : l))
    );

    pushToast(
      'Historical Record Transferred to Modern System',
      `Created ${docket.id} / ${docket.tdNo} in Assessment Roll & FAAS queue while preserving original ledger.`,
      'success'
    );
  };

  const updateSmvFromNotice = (payload: {
    targetId?: string;
    category: PropertyClassification;
    subclass: string;
    description: string;
    zones: string;
    rate: number;
    level: number;
    noticeRef: string;
    effectiveDate: string;
    remarks: string;
  }) => {
    const existing = payload.targetId ? smvRates.find((r) => r.id === payload.targetId) : undefined;
    const revEntry: SmvNoticeRevision = {
      id: `SMV-REV-${Date.now()}`,
      noticeRef: payload.noticeRef.trim(),
      effectiveDate: payload.effectiveDate,
      action: existing ? 'Rate Revised' : 'Sub-Class Added',
      subclass: existing ? existing.subclass : payload.subclass.trim(),
      previousRate: existing ? existing.rate : undefined,
      newRate: payload.rate,
      newLevel: payload.level,
      remarks: payload.remarks.trim() || 'Updated per Provincial Assessor SMV notice.',
      updatedBy: currentUser?.name || 'Municipal Assessor Office',
      updatedAt: 'March 18, 2026 • Just now'
    };

    if (existing) {
      setSmvRates((prev) =>
        prev.map((r) =>
          r.id === existing.id
            ? {
                ...r,
                rate: payload.rate,
                level: payload.level,
                zones: payload.zones.trim() || r.zones,
                description: payload.description.trim() || r.description,
                ordinanceRef: payload.noticeRef.trim(),
                effectiveDate: payload.effectiveDate
              }
            : r
        )
      );
    } else {
      const created: SmvRateEntry = {
        id: `SMV-${Date.now()}`,
        category: payload.category,
        subclass: payload.subclass.trim(),
        description: payload.description.trim() || 'Added under Provincial SMV Notice',
        zones: payload.zones.trim() || 'Pasacao Municipal Jurisdiction',
        rate: payload.rate,
        level: payload.level,
        ordinanceRef: payload.noticeRef.trim(),
        effectiveDate: payload.effectiveDate
      };
      setSmvRates((prev) => [...prev, created]);
    }

    setActiveSmvNotice({
      ref: payload.noticeRef.trim(),
      effectiveDate: payload.effectiveDate
    });
    setSmvRevisions((prev) => [revEntry, ...prev]);

    pushToast(
      'SMV Schedule Updated by Notice',
      `${revEntry.subclass} set to ₱${payload.rate.toLocaleString('en-PH')}/sqm (${payload.level}%) under ${payload.noticeRef.trim()}.`,
      'success'
    );
  };

  const reserveBlgfPin = (
    entry: Omit<BlgfPinReservation, 'id' | 'reservedBy' | 'reservedAt'>
  ): BlgfPinReservation => {
    const newEntry: BlgfPinReservation = {
      ...entry,
      id: `PIN-${Date.now()}`,
      reservedBy: currentUser?.name || 'Municipal Assessor Office',
      reservedAt: 'March 18, 2026 • Just now'
    };
    setPinReservations((prev) => [newEntry, ...prev]);
    pushToast(
      'BLGF PIN Reserved',
      `Registered standardized PIN ${newEntry.pin} (${newEntry.brgyName}) in Pasacao Cadastre Index.`,
      'success'
    );
    return newEntry;
  };

  const linkImprovementToLand = (
    entry: Omit<LandImprovementLink, 'id' | 'linkedAt'>
  ): LandImprovementLink => {
    const newLink: LandImprovementLink = {
      ...entry,
      id: `IMP-${Date.now()}`,
      linkedAt: 'March 18, 2026 • Just now'
    };
    setImprovementLinks((prev) => [newLink, ...prev]);
    pushToast(
      'Improvement Linked to Land PIN',
      `Linked ${newLink.structureType} (${newLink.bldgPin}) to ${newLink.landTdNo}.`,
      'success'
    );
    return newLink;
  };

  const saveParcelGeometry = (
    geo: Omit<MappedParcelGeometry, 'plottedBy' | 'plottedAt'>
  ) => {
    const saved: MappedParcelGeometry = {
      ...geo,
      plottedBy: currentUser?.name || 'Municipal Assessor Office',
      plottedAt: 'March 18, 2026 • Just now'
    };
    setCustomParcelGeometries((prev) => {
      const idx = prev.findIndex(
        (g) =>
          g.key === geo.key ||
          (geo.tdNo && g.tdNo === geo.tdNo) ||
          g.pin === geo.pin
      );
      if (idx >= 0) {
        return prev.map((g, i) => (i === idx ? saved : g));
      }
      return [saved, ...prev];
    });
    pushToast(
      'Parcel Boundary Mapped',
      `Saved ${geo.tdNo || geo.pin} polygon (~${geo.computedAreaSqm.toLocaleString()} sqm) to Cadastral Tax Map.`,
      'success'
    );
  };

  return (
    <RpatisContext.Provider
      value={{
        currentUser,
        authenticateStaff,
        loginAsRole,
        logout,
        switchPersona,
        dockets,
        assessmentRoll,
        activeDocketId,
        setActiveDocketId,
        createOrUpdateDocket,
        endorseDocketsToCapitol,
        forwardDocketToSignoff,
        flagDocketDeficiency,
        approveAndIssueCis,
        recordTreasuryPayment,
        certifications,
        lienAnnotations,
        ocularRequests,
        problemTickets,
        legacyRecords,
        smvRates,
        activeSmvNotice,
        smvRevisions,
        issueCertification,
        recordLienAnnotation,
        scheduleOcularInspection,
        markOcularVerified,
        logAssessmentProblem,
        resolveAssessmentProblem,
        resubmitFlaggedDocket,
        addLegacyRecord,
        migrateLegacyToModern,
        updateSmvFromNotice,
        pinReservations,
        improvementLinks,
        customParcelGeometries,
        reserveBlgfPin,
        linkImprovementToLand,
        saveParcelGeometry,
        toasts,
        pushToast,
        dismissToast
      }}
    >
      {children}
    </RpatisContext.Provider>
  );
};

export const useRpatis = () => {
  const ctx = useContext(RpatisContext);
  if (!ctx) throw new Error('useRpatis must be used inside RpatisProvider');
  return ctx;
};
