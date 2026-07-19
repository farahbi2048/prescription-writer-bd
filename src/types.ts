export interface Patient {
  id: string;
  name: string;
  age: string;
  sex: string;
  address: string;
  mobile: string;
  regNo: string;
  appointmentId?: string;
  date: string;
  dx: string; // Disease/Condition/Dx
  cc: string; // Chief Complaints
  
  // O/E (On Examination)
  bp: string;
  pulse: string;
  temp: string;
  heart: string;
  lungs: string;
  abd: string;
  anaemia: string;
  jaundice: string;
  cyanosis: string;
  oedema: string;

  // Investigations & History
  ix: string;
  drugHistory: string;
  
  // Past, Present, Notes
  pastHistory: string;
  presentHistory: string;
  notes: string;

  // Calculators
  bmiWeight: string;
  bmiHeightFeet: string;
  bmiHeightInch: string;
  bmiValue: string;
  bmiClass: string;
  bmiIdealWeight: string;

  insulinWeight: string;
  insulinUnitPerKg: string;
  insulinTime: 'BD' | 'OD' | 'TDS' | 'HS';
  insulinTotalUnit: string;
  insulinDose: string;

  zDob: string;
  zGender: 'M' | 'F';
  zWeight: string;
  zResult: string;
  zDays: string;

  bmrWeight: string;
  bmrHeightFeet: string;
  bmrHeightInch: string;
  bmrGender: 'M' | 'F';
  bmrAge: string;
  bmrActivity: string;
  bmrValue: string;

  eddLmp: string;
  eddGestationalAge: string;
  eddCalculatedDate: string;

  // Print checkboxes
  printPastHist: boolean;
  printPresentHist: boolean;
  printNotesSettings: boolean;
  printEddSettings: boolean;
}

export interface RxDrug {
  id: string;
  brandName: string;
  dose: string;
  duration: string;
  durationUnit: 'Days' | 'Months' | 'Weeks' | 'L/S' | 'Cont.';
  beforeFood: boolean;
  afterFood: boolean;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  age: string;
  sex: string;
  address: string;
  mobile: string;
  regNo: string;
  date: string;
  dx: string;
  cc: string;
  oe: {
    bp: string;
    pulse: string;
    temp: string;
    heart: string;
    lungs: string;
    abd: string;
    anaemia: string;
    jaundice: string;
    cyanosis: string;
    oedema: string;
  };
  ix: string;
  drugHistory: string;
  drugs: RxDrug[];
  revisitDays: string;
  revisitUnit: 'Days' | 'Months';
  revisitText: string;
  paidTk: string;
  visitNo: string;
  lastVisitDaysAgo: string;
  pastHistory: string;
  presentHistory: string;
  notes: string;
}

export interface DrugItem {
  brand: string;
  generic: string;
  indication: string;
  drugClass: string;
  company: string;
}

export interface Appointment {
  id: string;
  date: string;
  status: 'Pending' | 'Completed' | 'Canceled';
  serial: number;
  regNo: string;
  apntNo: string;
  name: string;
  age: string;
  sex: string;
  mobile: string;
  address: string;
  paid: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  regNo: string;
  name: string;
  address: string;
  mobile: string;
  amount: string;
}

export interface HeaderSettings {
  doctorName: string;
  degrees: string;
  specialty: string;
  department: string;
  medicalCollege: string;
  bmdcReg: string;
  clinicName: string;
  clinicAddress: string;
  clinicMobile: string;
  visitTime: string;
  offDay: string;
  backgroundColor: string;
  footerText: string;
  displayBarcode: boolean;
}

export interface Dimension {
  height: number; // in cm
  width: number;  // in cm
}

export interface PageSetupSettings {
  header: Dimension;
  patient: Dimension;
  history: Dimension;
  mainPad: Dimension;
  footer: Dimension;
  totalPage: Dimension;
  printFontSize: number; // pt
  linesPerPage: number;
  visitFees: number;
  reVisitFees: number;
  reVisitValidity: number; // days
  defaultRevisitText: string;
  printBarcode: boolean;
  barcodePosition: 'Left Bottom' | 'Right Top';
  multipagePrint: boolean;
  displayVisitNo: boolean;
  printPatientInfo: boolean;
  displayTextRx: boolean;
  displayFieldCheckboxes: {
    name: boolean;
    age: boolean;
    sex: boolean;
    weight: boolean;
    date: boolean;
    address: boolean;
    regNo: boolean;
    mobile: boolean;
    cc: boolean;
    oe: boolean;
    advice: boolean;
    dx: boolean;
    footer: boolean;
  };
}
