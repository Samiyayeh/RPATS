export type OfficeRole =
  | 'assessor_clerk'
  | 'assessor_chief'
  | 'capitol_examiner'
  | 'capitol_approver'
  | 'treasury_cashier'
  | 'citizen';

export type DepartmentId = 'assessor' | 'capitol' | 'treasury' | 'citizen';

export interface UserPersona {
  id: OfficeRole;
  name: string;
  title: string;
  department: DepartmentId;
  departmentName: string;
  officeLocation: string;
  employeeId?: string;
  email: string;
  avatarInitials: string;
  permissions: string[];
  description: string;
}

export type PropertyClassification = 'Residential' | 'Agricultural' | 'Commercial';

export type MachineryClassification = 'Agricultural' | 'Residential' | 'Commercial / Industrial';

export type DocketStatus =
  | 'Draft'
  | 'Needs Signature'
  | 'At Capitol'
  | 'Under Technical Review'
  | 'Ready for Sign-Off'
  | 'Flagged'
  | 'Approved'
  | 'Paid';

export interface BuildingSubComponent {
  structuralType: string;
  floorAreaSqm: number;
  yearBuilt: number;
  depreciationPercent: number;
  unitCostPerSqm: number;
}

export interface PermanentStructureComponent {
  structureType: string;
  description: string;
  areaOrUnits: number;
  yearBuilt: number;
  replacementCost: number;
  depreciationPercent: number;
  assessmentLevel: number;
}

export interface MachineryComponent {
  description: string;
  brandModel: string;
  machineryClass: MachineryClassification;
  acquisitionCost: number;
  yearAcquired: number;
  depreciationPercent: number;
  assessmentLevel: number;
}

export interface DeficiencyNote {
  id: string;
  date: string;
  author: string;
  role: string;
  message: string;
  resolved: boolean;
}

export interface AssessmentDocket {
  id: string;
  capitolId: string;
  tdNo: string;
  pin: string;
  lgu: string;
  barangay: string;
  lotNo: string;
  owner: string;
  ownerMasked: string;
  contact: string;
  transactionType: 'Discovery' | 'Transfer' | 'Reassessment' | 'Cancellation';
  classification: PropertyClassification;
  smvSubclass: string;
  areaSqm: number;
  unitValue: number;
  assessmentLevel: number; // 20, 40, 50
  marketValue: number;
  assessedValue: number;
  building?: BuildingSubComponent;
  otherStructure?: PermanentStructureComponent;
  machinery?: MachineryComponent;
  status: DocketStatus;
  submittedAt: string;
  transmittedAt?: string;
  examinerName?: string;
  cisSerial?: string;
  cisHash?: string;
  orNo?: string;
  taxClearanceNo?: string;
  paidAt?: string;
  amountPaid?: number;
  deficiencies: DeficiencyNote[];
}

export interface AssessmentRollRow {
  tdNo: string;
  pin: string;
  ownerMasked: string;
  ownerFull: string;
  barangay: string;
  classification: PropertyClassification;
  areaSqm: number;
  unitValue: number;
  marketValue: number;
  assessmentLevel: number; // 0.2, 0.4, 0.5
  assessedValue: number;
  basicRpt: number; // 1%
  sef: number; // 1%
  totalTaxDue: number; // 2%
  paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
  orNo: string;
  source: 'Capitol CIS Approved' | 'Assessor Roll';
  syncTime: string;
}

export interface SyncToast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning';
  timestamp: string;
}

export type CertificationType =
  | 'Certified True Copy of Tax Declaration'
  | 'Certification of With / Without Improvement'
  | 'Certification of Aggregate Landholdings'
  | 'Certification of Current & Existing Tax Declaration'
  | 'Certificate of No Property';

export interface CertificationRequest {
  id: string;
  type: CertificationType;
  tdNo: string;
  pin: string;
  requestorName: string;
  purpose: string;
  proofOfOwnershipVerified: boolean;
  spaVerified: boolean;
  treasuryOrNo: string;
  feeAmount: number;
  issuedAt: string;
  status: 'Released' | 'Pending Fee';
}

export interface LienAnnotationRecord {
  id: string;
  action: 'Annotate Mortgage' | 'Cancel Mortgage';
  tdNo: string;
  pin: string;
  ownerName: string;
  mortgageeBank: string;
  noticeRefNo: string;
  annotationOrNo: string;
  recordedAt: string;
  status: 'Annotated' | 'Cancelled' | 'Pending Prov. Co-Sign';
}

export interface OcularInspectionRequest {
  id: string;
  requestorName: string;
  lotDescription: string;
  barangay: string;
  legalDocRef: string;
  scheduledDate: string;
  assignedOfficer: string;
  status: 'Scheduled (1-Day SLA)' | 'Verified & Identified';
}

export interface AssessmentProblemTicket {
  id: string;
  referenceNo: string;
  category: 'Valuation Query' | 'Duplicate PIN / Boundary' | 'Ownership Correction' | 'Other Assessment Concern';
  clientName: string;
  description: string;
  resolutionNotes?: string;
  loggedAt: string;
  status: 'Open' | 'Resolved';
}

export interface LegacyArchiveRecord {
  id: string;
  vintageTd: string;
  revision: string;
  owner: string;
  lot: string;
  area: string;
  location: string;
  transcription: string;
  modernDraftTarget?: string;
}

export interface SmvRateEntry {
  id: string;
  category: PropertyClassification;
  subclass: string;
  description: string;
  zones: string;
  rate: number;
  level: number;
  ordinanceRef: string;
  effectiveDate: string;
}

export interface SmvNoticeRevision {
  id: string;
  noticeRef: string;
  effectiveDate: string;
  action: 'Rate Revised' | 'Sub-Class Added';
  subclass: string;
  previousRate?: number;
  newRate: number;
  newLevel: number;
  remarks: string;
  updatedBy: string;
  updatedAt: string;
}

