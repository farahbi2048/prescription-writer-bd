import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  FileText, 
  Printer, 
  Trash2, 
  Save, 
  Settings2, 
  Check, 
  BookOpen, 
  Coins, 
  MessageSquare, 
  Sliders, 
  CalendarRange, 
  Activity, 
  ChevronRight, 
  AlertCircle,
  Stethoscope,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';

// Import local submodules and data
import { Patient, RxDrug, Appointment, PaymentRecord, HeaderSettings, PageSetupSettings } from './types';
import { 
  INITIAL_DRUGS, 
  INITIAL_PATIENTS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_PAYMENTS, 
  INITIAL_HEADER_SETTINGS, 
  INITIAL_PAGE_SETUP 
} from './data';
import Calculators from './components/Calculators';
import PageLayoutSimulator from './components/PageLayoutSimulator';

export default function App() {
  // ---- Persisted or Live States ----
  const [patients, setPatients] = useState<Patient[]>(() => {
    const local = localStorage.getItem('bd_prescription_patients');
    return local ? JSON.parse(local) : INITIAL_PATIENTS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const local = localStorage.getItem('bd_prescription_appointments');
    return local ? JSON.parse(local) : INITIAL_APPOINTMENTS;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const local = localStorage.getItem('bd_prescription_payments');
    return local ? JSON.parse(local) : INITIAL_PAYMENTS;
  });

  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>(() => {
    const local = localStorage.getItem('bd_prescription_header');
    return local ? JSON.parse(local) : INITIAL_HEADER_SETTINGS;
  });

  const [pageSetup, setPageSetup] = useState<PageSetupSettings>(() => {
    try {
      const local = localStorage.getItem('bd_prescription_page_setup');
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed && typeof parsed === 'object' && parsed.totalPage) {
          return { ...INITIAL_PAGE_SETUP, ...parsed };
        }
      }
    } catch (e) {
      console.error("Failed to load page setup from localStorage", e);
    }
    return INITIAL_PAGE_SETUP;
  });

  // ---- Active Workspace Selection States ----
  const [activeTab, setActiveTab] = useState<
    'PrescriptionPad' | 'AllSaved' | 'Directory' | 'Appointments' | 'Payments' | 'SMS' | 'HeaderEdit' | 'PageSetup'
  >('PrescriptionPad');

  // ---- Active Prescription Editor States ----
  const [currentPatient, setCurrentPatient] = useState<Patient>({ ...patients[0] });
  const [rxDrugs, setRxDrugs] = useState<RxDrug[]>([
    { id: 'rx-1', brandName: 'Napa Extend 665mg', dose: '1+0+1', duration: '5', durationUnit: 'Days', beforeFood: false, afterFood: true },
    { id: 'rx-2', brandName: 'Sergel 20mg', dose: '1+0+1', duration: '14', durationUnit: 'Days', beforeFood: true, afterFood: false },
    { id: 'rx-3', brandName: 'Rosuva 10mg', dose: '0+0+1', duration: '30', durationUnit: 'Days', beforeFood: false, afterFood: true }
  ]);

  // ---- Drug Form Inputs ----
  const [drugSearchQuery, setDrugSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState({ brand: '', generic: '', company: '' });
  const [drugDose, setDrugDose] = useState('1+0+1');
  const [drugDuration, setDrugDuration] = useState('7');
  const [drugDurationUnit, setDrugDurationUnit] = useState<'Days' | 'Months' | 'Weeks' | 'L/S' | 'Cont.'>('Days');
  const [beforeFood, setBeforeFood] = useState(false);
  const [afterFood, setAfterFood] = useState(true);

  // ---- Custom UI Visual Themes & Print Density Sizing ----
  const [padColorTheme, setPadColorTheme] = useState<'blue' | 'emerald' | 'teal' | 'amber' | 'rose' | 'indigo'>('blue');
  const [padFontSizeTheme, setPadFontSizeTheme] = useState<'small' | 'medium' | 'large'>('medium');

  // ---- General Searching/Filtering Queries ----
  const [globalSearch, setGlobalSearch] = useState('');
  const [directorySearch, setDirectorySearch] = useState('');
  const [appointmentSearch, setAppointmentSearch] = useState('');

  // ---- Print Modal States ----
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printWithHeaderMode, setPrintWithHeaderMode] = useState(true);

  // ---- SMS Router simulation states ----
  const [smsBalance, setSmsBalance] = useState(1480); // Remaining credits SMS
  const [smsMobile, setSmsMobile] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [smsOutcome, setSmsOutcome] = useState('');

  // ---- Sync States to LocalStorage ----
  useEffect(() => {
    localStorage.setItem('bd_prescription_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('bd_prescription_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('bd_prescription_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('bd_prescription_header', JSON.stringify(headerSettings));
  }, [headerSettings]);

  useEffect(() => {
    localStorage.setItem('bd_prescription_page_setup', JSON.stringify(pageSetup));
  }, [pageSetup]);

  // ---- Patient List Selection and Loading ----
  const handleSelectPatient = (p: Patient) => {
    setCurrentPatient({ ...p });
    // Also simulate loading empty medication or populate default
    setRxDrugs([
      { id: 'rx-tmp-1', brandName: 'Napa Extend 665mg', dose: '1+0+1', duration: '5', durationUnit: 'Days', beforeFood: false, afterFood: true },
      { id: 'rx-tmp-2', brandName: 'Nexum 40mg', dose: '1+0+1', duration: '14', durationUnit: 'Days', beforeFood: true, afterFood: false }
    ]);
    setActiveTab('PrescriptionPad');
  };

  // ---- Update Patient Details Live ----
  const handleUpdatePatient = (updated: Partial<Patient>) => {
    setCurrentPatient(prev => ({ ...prev, ...updated }));
  };

  // ---- Add New Patient Initializing Empty State ----
  const handleCreateEmptyPatient = () => {
    const newReg = Math.floor(100000 + Math.random() * 900000).toString();
    const fresh: Patient = {
      id: `pat-${Date.now()}`,
      name: 'New Registered Patient',
      age: '30',
      sex: 'M',
      address: 'Dhaka',
      mobile: '01700000000',
      regNo: newReg,
      date: new Date().toISOString().split('T')[0],
      dx: '',
      cc: '',
      bp: '120/80 mmHg',
      pulse: '76',
      temp: '98.4°F',
      heart: 'NAD',
      lungs: 'NAD',
      abd: 'Soft',
      anaemia: 'Nil',
      jaundice: 'Nil',
      cyanosis: 'Nil',
      oedema: 'Nil',
      ix: '',
      drugHistory: '',
      pastHistory: '',
      presentHistory: '',
      notes: '',
      
      bmiWeight: '70',
      bmiHeightFeet: '5',
      bmiHeightInch: '6',
      bmiValue: '24.6',
      bmiClass: 'Normal Weight',
      bmiIdealWeight: '55-68 kg',

      insulinWeight: '70',
      insulinUnitPerKg: '0.3',
      insulinTime: 'BD',
      insulinTotalUnit: '21.0',
      insulinDose: '14-0-7 Units',

      zDob: '1996-01-01',
      zGender: 'M',
      zWeight: '70',
      zResult: 'Normal Percentile',
      zDays: '11000',

      bmrWeight: '70',
      bmrHeightFeet: '5',
      bmrHeightInch: '6',
      bmrGender: 'M',
      bmrAge: '30',
      bmrActivity: 'No Exercise',
      bmrValue: '1600 kcal/day',

      eddLmp: '',
      eddGestationalAge: '',
      eddCalculatedDate: '',

      printPastHist: false,
      printPresentHist: true,
      printNotesSettings: true,
      printEddSettings: false
    };

    setPatients([fresh, ...patients]);
    setCurrentPatient(fresh);
    setRxDrugs([]);
    setActiveTab('PrescriptionPad');
  };

  // ---- Save active Prescription to history and trigger billing record ----
  const handleSavePrescription = () => {
    // 1. Update/Inject patient data
    const existingIndex = patients.findIndex(p => p.id === currentPatient.id);
    let updatedList = [...patients];
    if (existingIndex > -1) {
      updatedList[existingIndex] = { ...currentPatient };
    } else {
      updatedList = [currentPatient, ...updatedList];
    }
    setPatients(updatedList);

    // 2. Generate billing payment record automatically based on fees
    const isReturning = patients.some(p => p.regNo === currentPatient.regNo);
    const feeCollected = isReturning ? pageSetup.reVisitFees : pageSetup.visitFees;

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      date: currentPatient.date,
      regNo: currentPatient.regNo,
      name: currentPatient.name,
      address: currentPatient.address,
      mobile: currentPatient.mobile,
      amount: feeCollected.toString()
    };
    setPayments([newPayment, ...payments]);

    // 3. Complete associated appointment if exists
    setAppointments(prev => prev.map(ap => {
      if (ap.regNo === currentPatient.regNo) {
        return { ...ap, status: 'Completed' };
      }
      return ap;
    }));

    alert(`Prescription successfully compiled & saved locally!\nPatient ID: ${currentPatient.regNo}\nVisited Fee accounted: ৳${feeCollected}`);
  };

  // ---- Drug Management Handlers ----
  const handleAddDrug = () => {
    if (!selectedBrand.brand) {
      alert("Please select or search a brand name first!");
      return;
    }
    const newDrug: RxDrug = {
      id: `rx-${Date.now()}`,
      brandName: selectedBrand.brand,
      dose: drugDose,
      duration: drugDuration,
      durationUnit: drugDurationUnit,
      beforeFood: beforeFood,
      afterFood: afterFood
    };
    setRxDrugs([...rxDrugs, newDrug]);
    // Reset inputs
    setDrugSearchQuery('');
    setSelectedBrand({ brand: '', generic: '', company: '' });
  };

  const handleDeleteDrug = (id: string) => {
    setRxDrugs(rxDrugs.filter(d => d.id !== id));
  };

  // ---- Filter Drug brand suggestions based on local database query ----
  const filteredSuggestions = drugSearchQuery.trim()
    ? INITIAL_DRUGS.filter(d => 
        d.brand.toLowerCase().includes(drugSearchQuery.toLowerCase()) || 
        d.generic.toLowerCase().includes(drugSearchQuery.toLowerCase())
      )
    : [];

  // ---- Direct PDF simulated printing trigger ----
  const handleTriggerPrint = (withHeader: boolean) => {
    setPrintWithHeaderMode(withHeader);
    setShowPrintModal(true);
  };

  // ---- Appointment Register state handler ----
  const handleCreateAppointment = (name: string, mobile: string, age: string, sex: string) => {
    if (!name || !mobile) {
      alert("Please specify patient Name and Contact Mobile number!");
      return;
    }
    const reg = Math.floor(100000 + Math.random() * 900000).toString();
    const newAp: Appointment = {
      id: `ap-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      serial: appointments.length + 1,
      regNo: reg,
      apntNo: `APN-${Math.floor(800 + Math.random() * 199)}`,
      name,
      age,
      sex,
      mobile,
      address: 'Dhaka',
      paid: pageSetup.visitFees.toString()
    };
    setAppointments([newAp, ...appointments]);
    alert(`Appointment registration successful!\nSerial Assigned: #${newAp.serial}\nRegistration ID: ${reg}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col antialiased">
      
      {/* 1. TOP SYSTEM BAR (Replicates professional medical OS dashboard) */}
      <header className="bg-white border-b border-slate-200 shrink-0 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap justify-between items-center gap-4">
          
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-inner">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#0066cc] font-bold uppercase block">
                Zilsoft Pro Simulator [BD v2.8]
              </span>
              <h1 className="text-base font-extrabold text-slate-900 leading-none font-sans">
                Prescription Writer BD
              </h1>
            </div>
          </div>

          {/* Core Navigation Workspace Tabs */}
          <nav className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setActiveTab('PrescriptionPad')}
              className={`px-2.5 py-1.5 rounded text-xs font-bold tracking-wide transition-all ${
                activeTab === 'PrescriptionPad'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              id="nav-tab-prescription"
            >
              <FileText className="w-3.5 h-3.5 inline mr-1" />
              Write Prescription
            </button>
            <button
              onClick={() => setActiveTab('AllSaved')}
              className={`px-2.5 py-1.5 rounded text-xs font-bold tracking-wide transition-all ${
                activeTab === 'AllSaved'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              id="nav-tab-saved"
            >
              <Users className="w-3.5 h-3.5 inline mr-1" />
              Saved Patients & History
            </button>
            <button
              onClick={() => setActiveTab('Directory')}
              className={`px-2.5 py-1.5 rounded text-xs font-bold tracking-wide transition-all ${
                activeTab === 'Directory'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              id="nav-tab-directory"
            >
              <Search className="w-3.5 h-3.5 inline mr-1" />
              BD Brand Index
            </button>
            <button
              onClick={() => setActiveTab('Appointments')}
              className={`px-2.5 py-1.5 rounded text-xs font-bold tracking-wide transition-all ${
                activeTab === 'Appointments'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              id="nav-tab-appointments"
            >
              <CalendarRange className="w-3.5 h-3.5 inline mr-1" />
              Chamber Appointments
            </button>
            <button
              onClick={() => setActiveTab('Payments')}
              className={`px-2.5 py-1.5 rounded text-xs font-bold tracking-wide transition-all ${
                activeTab === 'Payments'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              id="nav-tab-payments"
            >
              <Coins className="w-3.5 h-3.5 inline mr-1" />
              Chamber Earnings
            </button>
            <button
              onClick={() => setActiveTab('SMS')}
              className={`px-2.5 py-1.5 rounded text-xs font-bold tracking-wide transition-all ${
                activeTab === 'SMS'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              id="nav-tab-sms"
            >
              <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
              SMS Router
            </button>
            <button
              onClick={() => setActiveTab('HeaderEdit')}
              className={`px-2.5 py-1.5 rounded text-xs font-bold tracking-wide transition-all ${
                activeTab === 'HeaderEdit'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              id="nav-tab-header"
            >
              <Settings2 className="w-3.5 h-3.5 inline mr-1" />
              Modify Header Title
            </button>
            <button
              onClick={() => setActiveTab('PageSetup')}
              className={`px-2.5 py-1.5 rounded text-xs font-bold tracking-wide transition-all ${
                activeTab === 'PageSetup'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              id="nav-tab-setup"
            >
              <Sliders className="w-3.5 h-3.5 inline mr-1" />
              Dimensions Pad CM
            </button>

          </nav>
 
        </div>
      </header>

      {/* 2. MAIN HUB WORKSPACE AREA */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
        
        {/* TAB 1: INTERACTIVE PRESCRIPTION EDITOR */}
        {activeTab === 'PrescriptionPad' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="workspace-prescription-editor">
            
            {/* LEFT BAR - PATIENT DETAILS AND CLINICAL EXAMINATIONS (Cols 4) */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Patient Basic Demographics Block */}
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-mono font-bold tracking-wider text-slate-700 uppercase flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                    Patient Profile Bar (রুগী তথ্য)
                  </h3>
                  <button 
                    onClick={handleCreateEmptyPatient}
                    className="bg-emerald-600 text-white font-semibold text-[10px] py-1 px-2 rounded-md hover:bg-emerald-700 transition"
                  >
                    + New Patient
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-slate-500 font-bold text-[10px] uppercase">Full Name (নাম)</label>
                    <input 
                      type="text" 
                      value={currentPatient.name} 
                      onChange={(e) => handleUpdatePatient({ name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-500 font-bold text-[10px] uppercase">Age (বয়স)</label>
                      <input 
                        type="text" 
                        value={currentPatient.age} 
                        onChange={(e) => handleUpdatePatient({ age: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded text-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold text-[10px] uppercase">Gender (লিঙ্গ)</label>
                      <select 
                        value={currentPatient.sex} 
                        onChange={(e) => handleUpdatePatient({ sex: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded text-slate-900 focus:bg-white focus:outline-none"
                      >
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#d00] font-bold text-[10px] uppercase">Reg No</label>
                      <input 
                        type="text" 
                        value={currentPatient.regNo} 
                        onChange={(e) => handleUpdatePatient({ regNo: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded text-slate-900 font-mono font-bold focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-500 font-bold text-[10px] uppercase">Mobile Number</label>
                      <input 
                        type="text" 
                        value={currentPatient.mobile} 
                        onChange={(e) => handleUpdatePatient({ mobile: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded text-slate-900 font-mono focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold text-[10px] uppercase">Address (ঠিকানা)</label>
                      <input 
                        type="text" 
                        value={currentPatient.address} 
                        onChange={(e) => handleUpdatePatient({ address: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded text-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* On Examination (O/E) & Complaints Panel */}
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-3 text-slate-900">
                <h3 className="text-xs font-mono font-bold tracking-wider text-slate-700 uppercase">
                  O/E Symptoms & History Findings (O/E এবং লক্ষণসমূহ)
                </h3>

                <div className="text-xs space-y-2.5">
                  <div>
                    <label className="block text-slate-500 text-[10px] uppercase font-bold">Chief Complaints (প্রধান উপসর্গগুলো)</label>
                    <textarea 
                      rows={3}
                      placeholder="e.g. 1. Burning chest sensations.&#10;2. Abdominal pain."
                      value={currentPatient.cc} 
                      onChange={(e) => handleUpdatePatient({ cc: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded text-slate-900 text-[11px] focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* On Examination Vitals Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-500 font-bold text-[10px]">Blood Pressure (BP)</label>
                      <input 
                        type="text" 
                        placeholder="120/80 mmHg"
                        value={currentPatient.bp} 
                        onChange={(e) => handleUpdatePatient({ bp: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 p-1 text-xs rounded text-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold text-[10px]">Pulse (/min)</label>
                      <input 
                        type="text" 
                        placeholder="72"
                        value={currentPatient.pulse} 
                        onChange={(e) => handleUpdatePatient({ pulse: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 p-1 text-xs rounded text-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold text-[10px]">Temperature (°F)</label>
                      <input 
                        type="text" 
                        placeholder="98.4"
                        value={currentPatient.temp} 
                        onChange={(e) => handleUpdatePatient({ temp: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 p-1 text-xs rounded text-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold text-[10px]">Anaemia</label>
                      <input 
                        type="text" 
                        placeholder="Nil/Mild"
                        value={currentPatient.anaemia} 
                        onChange={(e) => handleUpdatePatient({ anaemia: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 p-1 text-xs rounded text-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-[11px] pt-1">
                    <div>
                      <label className="block text-slate-500 font-bold text-[9px]">Jaundice</label>
                      <input 
                        type="text" 
                        value={currentPatient.jaundice} 
                        onChange={(e) => handleUpdatePatient({ jaundice: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 p-0.5 text-xs rounded text-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold text-[9px]">Cyanosis</label>
                      <input 
                        type="text" 
                        value={currentPatient.cyanosis} 
                        onChange={(e) => handleUpdatePatient({ cyanosis: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 p-0.5 text-xs rounded text-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold text-[9px]">Oedema</label>
                      <input 
                        type="text" 
                        value={currentPatient.oedema} 
                        onChange={(e) => handleUpdatePatient({ oedema: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 p-0.5 text-xs rounded text-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 text-[10px] uppercase font-bold">Investigations Needed (পরীক্ষা)</label>
                    <textarea 
                      rows={2}
                      placeholder="e.g. 1. CBC, urine RE, HbA1c"
                      value={currentPatient.ix} 
                      onChange={(e) => handleUpdatePatient({ ix: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded text-slate-900 text-[11px] focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 text-[10px] uppercase font-bold">Disease diagnosis/Dx (রোগ নির্নয়)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Acute Gastritis / Hypertension"
                      value={currentPatient.dx} 
                      onChange={(e) => handleUpdatePatient({ dx: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded text-[11px] text-slate-900 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* RENDER EMBEDDED DYNAMIC MATHEMATICAL CALCULATORS */}
              <Calculators patient={currentPatient} onUpdatePatient={handleUpdatePatient} />

            </div>

            {/* MIDDLE/RIGHT WORKSPACE - CORE RX MEDICATION COMPILER & PAPER PAD SIMULATOR (Cols 8) */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Rx Drug Input form compilation bar */}
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs text-slate-900">
                <span className="text-xs font-mono font-extrabold text-blue-700 block mb-2 uppercase">
                  💊 Rapid Medication Prescription Writer (নতুন ঔষধ যোগ করুন)
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                  
                  {/* Brand Search bar with dynamic suggestions filter */}
                  <div className="md:col-span-4 relative text-slate-900">
                    <label className="block text-slate-500 font-bold text-[10px] mb-0.5">Search Drug Brand Name (ঔষধ)</label>
                    <div className="relative">
                      <input 
                        type="text"
                        placeholder="e.g. Napa, Seclo, Nexum"
                        value={drugSearchQuery}
                        onChange={(e) => setDrugSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 p-1.5 pl-7 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
                      />
                      <Search className="w-3.5 h-3.5 absolute left-2 top-2.5 text-slate-400" />
                    </div>

                    {/* Autocomplete suggestion container drop down */}
                    {filteredSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded shadow-lg max-h-48 overflow-y-auto z-50 divide-y divide-slate-100">
                        {filteredSuggestions.map((ds) => (
                          <button
                            key={ds.brand}
                            onClick={() => {
                              setSelectedBrand(ds);
                              setDrugSearchQuery(ds.brand);
                              // Automate dosages based on standard clinical algorithms
                              if (ds.drugClass === "Proton Pump Inhibitors") {
                                setDrugDose("1+0+1");
                                setDrugDuration("14");
                                setBeforeFood(true);
                                setAfterFood(false);
                              } else if (ds.drugClass === "Analgesics") {
                                setDrugDose("1+1+1");
                                setDrugDuration("5");
                                setBeforeFood(false);
                                setAfterFood(true);
                              } else if (ds.drugClass === "Antihistamines") {
                                setDrugDose("0+0+1");
                                setDrugDuration("7");
                                setBeforeFood(false);
                                setAfterFood(true);
                              } else if (ds.drugClass === "Statins") {
                                setDrugDose("0+0+1");
                                setDrugDuration("30");
                                setBeforeFood(false);
                                setAfterFood(true);
                              } else if (ds.drugClass === "Vitamins & Minerals") {
                                setDrugDose("1+0+0");
                                setDrugDuration("30");
                                setBeforeFood(false);
                                setAfterFood(true);
                              } else if (ds.drugClass && ds.drugClass.includes("Cough")) {
                                setDrugDose("1 চামচ করে ৩ বার");
                                setDrugDuration("7");
                                setBeforeFood(false);
                                setAfterFood(true);
                              } else {
                                setDrugDose("1+0+1");
                                setDrugDuration("7");
                                setBeforeFood(false);
                                setAfterFood(true);
                              }
                            }}
                            className="w-full text-left p-2 hover:bg-slate-50 transition-all block text-xs cursor-pointer"
                          >
                            <span className="font-bold text-slate-900 block">{ds.brand}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{ds.generic} • {ds.company}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Item Generic readout */}
                  <div className="md:col-span-3">
                    <label className="block text-slate-500 font-bold text-[10px] mb-0.5">Generic / Drug Class</label>
                    <div className="bg-slate-50 border border-slate-200 p-1.5 rounded text-slate-700 font-mono text-[10px] truncate h-[29px] flex items-center">
                      {selectedBrand.generic || 'Auto filled Generic'}
                    </div>
                  </div>

                  {/* Dosage settings (e.g. 1+0+1 or custom dropdowns) */}
                  <div className="md:col-span-2">
                    <label className="block text-slate-500 font-bold text-[10px] mb-0.5">Dose (মাত্রা)</label>
                    <select 
                      value={drugDose} 
                      onChange={(e) => setDrugDose(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded focus:bg-white focus:outline-none text-slate-900"
                    >
                      <option value="1+0+1">1+0+1 (সকাল-রাত)</option>
                      <option value="1+1+1">1+1+1 (সকাল-দুপুর-রাত)</option>
                      <option value="1+0+0">1+0+0 (সকালে)</option>
                      <option value="0+0+1">0+0+1 (রাতে)</option>
                      <option value="1+1+1+1">1+1+1+1 (৪ বার)</option>
                      <option value="1 চামচ করে ৩ বার">1 চামচ করে ৩ বার</option>
                      <option value="As needed (প্রয়োজন হলে)">প্রয়োজন হলে (PRN)</option>
                    </select>
                  </div>

                  {/* Duration count and units selectors */}
                  <div className="md:col-span-3 flex gap-1">
                    <div className="w-1/2">
                      <label className="block text-slate-500 font-bold text-[10px] mb-0.5">Duration</label>
                      <input 
                        type="text" 
                        value={drugDuration} 
                        onChange={(e) => setDrugDuration(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 p-1 rounded focus:bg-white focus:outline-none text-center text-slate-900"
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-slate-500 font-bold text-[10px] mb-0.5">Unit</label>
                      <select 
                        value={drugDurationUnit} 
                        onChange={(e) => setDrugDurationUnit(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 p-1 rounded focus:bg-white focus:outline-none text-slate-900"
                      >
                        <option value="Days">Days</option>
                        <option value="Weeks">Weeks</option>
                        <option value="Months">Months</option>
                        <option value="Cont.">Cont.</option>
                      </select>
                    </div>
                  </div>

                </div>

                {/* Second row checkboxes - Before/After food */}
                <div className="flex flex-wrap gap-4 items-center mt-3 text-xs text-slate-700">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={beforeFood} 
                      onChange={(e) => {
                        setBeforeFood(e.target.checked);
                        if (e.target.checked) setAfterFood(false);
                      }}
                      className="rounded text-blue-600 focus:ring-0" 
                    />
                    <span className="font-semibold">খাওয়ার পূর্বে (Before Food)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={afterFood} 
                      onChange={(e) => {
                        setAfterFood(e.target.checked);
                        if (e.target.checked) setBeforeFood(false);
                      }}
                      className="rounded text-blue-600 focus:ring-0" 
                    />
                    <span className="font-semibold">খাওয়ার পরে (After Food)</span>
                  </label>

                  <div className="ml-auto flex gap-2">
                    <button 
                      onClick={handleAddDrug}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-4 rounded shadow-xs transition text-xs cursor-pointer"
                      id="btn-add-rx-drug"
                    >
                      + Add Drug to Rx
                    </button>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON PANEL */}
              <div className="flex flex-wrap gap-2 justify-end bg-white border border-slate-200 p-3 rounded-xl shadow-xs text-slate-900">
                <button 
                  onClick={handleSavePrescription}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-4 rounded flex items-center gap-1.5 shadow-xs transition-all ml-2 cursor-pointer"
                  id="btn-save-prescription"
                >
                  <Save className="w-4 h-4" />
                  Save Prescription Data (সংরক্ষণ)
                </button>
                <button 
                  onClick={() => handleTriggerPrint(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-4 rounded flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-emerald-600" />
                  Print Pad With Header (হ্যাডার সহ প্রিন্ট)
                </button>
                <button 
                  onClick={() => handleTriggerPrint(false)}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold py-2 px-4 rounded flex items-center gap-1.5 shadow-xs transition-all font-sans cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-700" />
                  Print Pad Without Header (শুধু ঔষদ প্রিন্ট)
                </button>
              </div>

              {/* VIRTUAL PRESCRIPTION SHEET VISUALIZER - Designed to accurately replicate Zilsoft's real sheet pad */}
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-3">
                  <div>
                    <span className="text-xs font-mono font-extrabold text-blue-700 block uppercase">
                      🎨 Sheet Designer & Pad Theme customizer
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Choose colorful layout palettes and text densities for printing output.
                    </p>
                  </div>
                  
                  {/* Visual selectors for color palettes */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Theme:</span>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setPadColorTheme('blue')}
                        className={`w-5 h-5 rounded-full bg-blue-600 border ${padColorTheme === 'blue' ? 'ring-2 ring-blue-500 ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'} cursor-pointer`}
                        title="Corporate Blue"
                      />
                      <button 
                        onClick={() => setPadColorTheme('emerald')}
                        className={`w-5 h-5 rounded-full bg-emerald-600 border ${padColorTheme === 'emerald' ? 'ring-2 ring-emerald-500 ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'} cursor-pointer`}
                        title="Healing Emerald"
                      />
                      <button 
                        onClick={() => setPadColorTheme('teal')}
                        className={`w-5 h-5 rounded-full bg-teal-600 border ${padColorTheme === 'teal' ? 'ring-2 ring-teal-500 ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'} cursor-pointer`}
                        title="Modern Teal"
                      />
                      <button 
                        onClick={() => setPadColorTheme('amber')}
                        className={`w-5 h-5 rounded-full bg-amber-600 border ${padColorTheme === 'amber' ? 'ring-2 ring-amber-500 ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'} cursor-pointer`}
                        title="Warm Amber"
                      />
                      <button 
                        onClick={() => setPadColorTheme('rose')}
                        className={`w-5 h-5 rounded-full bg-rose-600 border ${padColorTheme === 'rose' ? 'ring-2 ring-rose-500 ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'} cursor-pointer`}
                        title="Ruby Rose"
                      />
                      <button 
                        onClick={() => setPadColorTheme('indigo')}
                        className={`w-5 h-5 rounded-full bg-indigo-600 border ${padColorTheme === 'indigo' ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'} cursor-pointer`}
                        title="Medicinal Indigo"
                      />
                    </div>

                    <span className="text-[10px] uppercase font-bold text-slate-500 ml-4">Text:</span>
                    <select 
                      value={padFontSizeTheme}
                      onChange={(e: any) => setPadFontSizeTheme(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-[11px] p-1 rounded font-bold text-slate-700"
                    >
                      <option value="small">Compact (চিকন)</option>
                      <option value="medium">Default (স্বাভাবিক)</option>
                      <option value="large">Spacious (খুলতি)</option>
                    </select>
                  </div>
                </div>

                {/* Visual rendering represent A4 Sheet, custom white styles optimized for clear medical reading */}
                <div 
                  className={`bg-white text-slate-900 rounded-lg p-6 shadow-2xl space-y-4 font-sans max-w-lg mx-auto border-4 border-double transition-all duration-300 ${
                    padColorTheme === 'blue' ? 'border-blue-200' :
                    padColorTheme === 'emerald' ? 'border-emerald-200' :
                    padColorTheme === 'teal' ? 'border-teal-200' :
                    padColorTheme === 'amber' ? 'border-amber-200' :
                    padColorTheme === 'rose' ? 'border-rose-200' : 'border-indigo-200'
                  }`}
                  id="live-virtual-sheet"
                >
                  
                  {/* Clinic Header Block with dynamic theme borders */}
                  <div 
                    className={`border-b-2 pb-3 flex justify-between items-start text-xs transition-colors duration-300 ${
                      padColorTheme === 'blue' ? 'border-blue-600' :
                      padColorTheme === 'emerald' ? 'border-emerald-600' :
                      padColorTheme === 'teal' ? 'border-teal-600' :
                      padColorTheme === 'amber' ? 'border-amber-600' :
                      padColorTheme === 'rose' ? 'border-rose-600' : 'border-indigo-600'
                    }`}
                  >
                    <div>
                      <h4 className={`font-extrabold text-base leading-tight font-sans transition-colors ${
                        padColorTheme === 'blue' ? 'text-blue-900' :
                        padColorTheme === 'emerald' ? 'text-emerald-900' :
                        padColorTheme === 'teal' ? 'text-teal-900' :
                        padColorTheme === 'amber' ? 'text-amber-900' :
                        padColorTheme === 'rose' ? 'text-rose-900' : 'text-indigo-900'
                      }`}>{headerSettings.doctorName}</h4>
                      <p className="text-[11px] text-slate-700 font-medium font-sans">{headerSettings.degrees}</p>
                      <p className="text-[10px] text-slate-500 font-bold font-sans">{headerSettings.specialty} • {headerSettings.department}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border block mt-1 w-fit font-bold font-mono ${
                        padColorTheme === 'blue' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                        padColorTheme === 'emerald' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        padColorTheme === 'teal' ? 'bg-teal-50 text-teal-800 border-teal-200' :
                        padColorTheme === 'amber' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        padColorTheme === 'rose' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      }`}>{headerSettings.bmdcReg}</span>
                    </div>
                    <div className="text-right text-[10px] text-slate-700">
                      <h5 className="font-bold text-slate-950 font-sans">{headerSettings.clinicName}</h5>
                      <p className="font-sans text-slate-600">{headerSettings.clinicAddress}</p>
                      <p className="font-sans text-slate-600">Cell: <span className="font-bold text-slate-800">{headerSettings.clinicMobile}</span></p>
                      <p className={`font-bold font-sans ${
                        padColorTheme === 'blue' ? 'text-blue-600' :
                        padColorTheme === 'emerald' ? 'text-emerald-600' :
                        padColorTheme === 'teal' ? 'text-teal-600' :
                        padColorTheme === 'amber' ? 'text-amber-700' :
                        padColorTheme === 'rose' ? 'text-rose-600' : 'text-indigo-600'
                      }`}>{headerSettings.offDay}</p>
                    </div>
                  </div>

                  {/* Patient Info Banner Grid */}
                  <div 
                    className={`p-2.5 rounded border grid grid-cols-4 gap-2 text-[10px] font-medium transition-colors duration-300 ${
                      padColorTheme === 'blue' ? 'bg-blue-50/70 border-blue-200 text-blue-900' :
                      padColorTheme === 'emerald' ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' :
                      padColorTheme === 'teal' ? 'bg-teal-50/70 border-teal-200 text-teal-900' :
                      padColorTheme === 'amber' ? 'bg-amber-50/70 border-amber-200 text-amber-900' :
                      padColorTheme === 'rose' ? 'bg-rose-50/70 border-rose-200 text-rose-900' : 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
                    }`}
                  >
                    <div>
                      <span className="text-slate-500 block uppercase text-[8px] font-bold">Patient Name (নাম)</span>
                      <strong className="text-slate-900 text-[11px] leading-tight font-sans">{currentPatient.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[8px] font-bold">Age / Sex</span>
                      <strong className="text-slate-900 text-[11px] font-sans">{currentPatient.age} Yrs / {currentPatient.sex}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[8px] font-bold">Date (তারিখ)</span>
                      <strong className="text-slate-900 text-[11px] font-sans">{currentPatient.date}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[8px] font-bold">Reg / Mobile</span>
                      <strong className="text-slate-700 font-mono text-[11px]">#{currentPatient.regNo}</strong>
                    </div>
                  </div>

                  {/* Primary Two-Column Layout (History column left vs Rx drugs right) */}
                  <div className="grid grid-cols-12 gap-4 pt-2">
                    
                    {/* Complaints left column (History Column) (Cols 4) */}
                    <div className="col-span-4 border-r border-slate-200 pr-3 text-[10px] text-slate-700 space-y-4 font-mono">
                      
                      {currentPatient.cc && (
                        <div>
                          <span className={`font-bold font-sans block text-[11px] underline ${
                            padColorTheme === 'blue' ? 'text-blue-800' :
                            padColorTheme === 'emerald' ? 'text-emerald-850' :
                            padColorTheme === 'teal' ? 'text-teal-850' :
                            padColorTheme === 'amber' ? 'text-amber-850' :
                            padColorTheme === 'rose' ? 'text-rose-850' : 'text-indigo-850'
                          }`}>C/C (উপসর্গ):</span>
                          <p className="whitespace-pre-line text-slate-600 leading-relaxed font-sans mt-0.5">{currentPatient.cc}</p>
                        </div>
                      )}

                      <div>
                        <span className={`font-bold font-sans block text-[11px] underline ${
                          padColorTheme === 'blue' ? 'text-blue-800' :
                          padColorTheme === 'emerald' ? 'text-emerald-850' :
                          padColorTheme === 'teal' ? 'text-teal-850' :
                          padColorTheme === 'amber' ? 'text-amber-850' :
                          padColorTheme === 'rose' ? 'text-rose-850' : 'text-indigo-850'
                        }`}>O/E (পরীক্ষা):</span>
                        <ul className="space-y-1 mt-1 text-slate-600 font-sans">
                          {currentPatient.bp && <li>• BP: <strong className="text-slate-800">{currentPatient.bp}</strong></li>}
                          {currentPatient.pulse && <li>• Pulse: <strong className="text-slate-800">{currentPatient.pulse}/Min</strong></li>}
                          {currentPatient.temp && <li>• Temp: <strong className="text-slate-800">{currentPatient.temp}°F</strong></li>}
                          {currentPatient.anaemia && <li>• Anaemia: {currentPatient.anaemia}</li>}
                        </ul>
                      </div>

                      {currentPatient.ix && (
                        <div>
                          <span className={`font-bold font-sans block text-[11px] underline ${
                            padColorTheme === 'blue' ? 'text-blue-800' :
                            padColorTheme === 'emerald' ? 'text-emerald-850' :
                            padColorTheme === 'teal' ? 'text-teal-850' :
                            padColorTheme === 'amber' ? 'text-amber-850' :
                            padColorTheme === 'rose' ? 'text-rose-850' : 'text-indigo-850'
                          }`}>Ix (পরীক্ষা):</span>
                          <p className="whitespace-pre-line text-slate-600 leading-relaxed font-sans mt-0.5">{currentPatient.ix}</p>
                        </div>
                      )}

                      {currentPatient.dx && (
                        <div className={`p-1.5 rounded border ${
                          padColorTheme === 'blue' ? 'bg-blue-50/50 border-blue-150' :
                          padColorTheme === 'emerald' ? 'bg-emerald-50/50 border-emerald-150' :
                          padColorTheme === 'teal' ? 'bg-teal-50/50 border-teal-150' :
                          padColorTheme === 'amber' ? 'bg-amber-50/50 border-amber-150' :
                          padColorTheme === 'rose' ? 'bg-rose-50/50 border-rose-150' : 'bg-indigo-50/50 border-indigo-150'
                        }`}>
                          <span className="font-bold font-sans text-slate-500 block text-[9px] uppercase">Dx (রোগ নির্নয়):</span>
                          <p className="text-slate-900 font-sans font-bold text-[11px] leading-tight">{currentPatient.dx}</p>
                        </div>
                      )}
                    </div>

                    {/* Prescription Rx column right (Cols 8) */}
                    <div className="col-span-8 pl-1 space-y-4">
                      
                      {/* Rx Initial Text */}
                      <span className={`font-serif font-extrabold text-3xl block transition-colors ${
                        padColorTheme === 'blue' ? 'text-blue-600' :
                        padColorTheme === 'emerald' ? 'text-emerald-600' :
                        padColorTheme === 'teal' ? 'text-teal-600' :
                        padColorTheme === 'amber' ? 'text-amber-600' :
                        padColorTheme === 'rose' ? 'text-rose-600' : 'text-indigo-600'
                      }`}>Rx.</span>
                      
                      {/* Prescribed Drug items mapping */}
                      {rxDrugs.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 border border-dashed rounded text-xs select-none">
                          No medications added to Rx. Use the compiler block above to prescribe.
                        </div>
                      ) : (
                        <ol 
                          className={`divide-y divide-slate-100 ${
                            padFontSizeTheme === 'small' ? 'text-[11px]' :
                            padFontSizeTheme === 'large' ? 'text-[13px]' : 'text-xs'
                          }`} 
                          id="prescribed-drugs-ordered-list"
                        >
                          {rxDrugs.map((rd, i) => (
                            <li key={rd.id} className="py-2.5 flex justify-between items-start group transition-all">
                              <div className="space-y-0.5">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="font-extrabold text-slate-900">{i + 1}. {rd.brandName}</span>
                                  {rd.beforeFood && (
                                    <span className="text-[9px] bg-red-100 text-red-800 px-1.5 py-0.2 rounded font-sans font-medium">খাওয়ার পূর্বে</span>
                                  )}
                                  {rd.afterFood && (
                                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-sans font-medium">খাওয়ার পরে</span>
                                  )}
                                </div>
                                <div className="text-slate-600 font-medium">
                                  Dose (মাত্রা): <strong className="text-slate-900 font-bold">{rd.dose}</strong> — {rd.duration} {rd.durationUnit}
                                </div>
                              </div>
                              <button 
                                onClick={() => handleDeleteDrug(rd.id)}
                                className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition duration-150 p-1 cursor-pointer"
                                title="Remove drug"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </li>
                          ))}
                        </ol>
                      )}

                      {/* Revisit directive bar */}
                      <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-600">
                        <span>Re-visit Chamber instructions: </span>
                        <strong className="text-slate-950 font-sans">After 15 Days</strong> or as necessary. Re-appointment necessary.
                      </div>
                    </div>

                  </div>

                  {/* Aesthetic Footer Block with dynamic Barcode */}
                  <div 
                    className={`border-t pt-2.5 mt-4 flex justify-between items-center text-[9px] text-slate-500 font-sans transition-colors duration-300 ${
                      padColorTheme === 'blue' ? 'border-blue-400' :
                      padColorTheme === 'emerald' ? 'border-emerald-400' :
                      padColorTheme === 'teal' ? 'border-teal-400' :
                      padColorTheme === 'amber' ? 'border-amber-400' :
                      padColorTheme === 'rose' ? 'border-rose-400' : 'border-indigo-400'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-slate-700">{headerSettings.footerText}</p>
                      <p className="font-sans text-[8px] mt-0.5 text-slate-400">Software generated prescription. Powered by Prescription Writer BD client.</p>
                    </div>
                    {headerSettings.displayBarcode && (
                      <div className="flex flex-col items-center">
                        <div className="bg-slate-950 block h-6 w-20 relative p-0.5">
                          {/* Simulated Barcode Vectors */}
                          <div className="absolute inset-x-0 inset-y-0.5 flex justify-around">
                            <span className="w-0.5 bg-white h-full"></span>
                            <span className="w-[1px] bg-white h-full"></span>
                            <span className="w-[3px] bg-white h-full"></span>
                            <span className="w-0.5 bg-white h-full"></span>
                            <span className="w-[2px] bg-white h-full"></span>
                            <span className="w-[1px] bg-white h-full"></span>
                          </div>
                        </div>
                        <span className="text-[7px] text-slate-400 font-mono tracking-widest mt-0.5">#{currentPatient.regNo}</span>
                      </div>
                    )}
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: SAVED PATIENTS HISTORY */}
        {activeTab === 'AllSaved' && (
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl space-y-4" id="view-patients-history-tab">
            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xl font-bold">Chamber Patient Registry Database</h2>
                <p className="text-xs text-slate-400">Total registered profiles loaded locally: {patients.length}</p>
              </div>

              {/* Patient Search */}
              <div className="relative w-64">
                <input 
                  type="text"
                  placeholder="Query name or registration ID..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="w-full bg-slate-950 text-xs border border-slate-800 pl-8 pr-3 py-1.5 rounded focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Reg ID</th>
                    <th className="px-4 py-3">Patient Name</th>
                    <th className="px-4 py-3">Age/Gender</th>
                    <th className="px-4 py-3">Mobile No</th>
                    <th className="px-4 py-3">Clinical Diagnosis (Dx)</th>
                    <th className="px-4 py-3 text-right font-sans">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {patients
                    .filter(p => p.name.toLowerCase().includes(globalSearch.toLowerCase()) || p.regNo.includes(globalSearch))
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-slate-850 transition-colors">
                        <td className="px-4 py-3 font-mono text-emerald-400">#{p.regNo}</td>
                        <td className="px-4 py-3 font-semibold text-white">{p.name}</td>
                        <td className="px-4 py-3">{p.age} Yrs / {p.sex}</td>
                        <td className="px-4 py-3 font-mono">{p.mobile}</td>
                        <td className="px-4 py-3 italic truncate max-w-xs">{p.dx || '---'}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleSelectPatient(p)}
                            className="bg-blue-600 text-white font-semibold text-[10px] py-1 px-3 rounded hover:bg-blue-700 transition"
                          >
                            Load to Rx Pad
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: BD BRAND pharma DIRECTORY */}
        {activeTab === 'Directory' && (
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl space-y-4" id="view-brand-directory-tab">
            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xl font-bold">Bangladeshi Pharma Brand Index</h2>
                <p className="text-xs text-slate-400">DGDA Registered Drugs loaded locally for immediate offline search</p>
              </div>

              {/* Directory Filter Input */}
              <div className="relative w-80">
                <input 
                  type="text"
                  placeholder="Search brand, generic or classification..."
                  value={directorySearch}
                  onChange={(e) => setDirectorySearch(e.target.value)}
                  className="w-full bg-slate-950 text-xs border border-slate-800 pl-8 pr-3 py-2 rounded focus:outline-none"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INITIAL_DRUGS
                .filter(d => 
                  d.brand.toLowerCase().includes(directorySearch.toLowerCase()) || 
                  d.generic.toLowerCase().includes(directorySearch.toLowerCase()) ||
                  d.drugClass.toLowerCase().includes(directorySearch.toLowerCase())
                )
                .map((d) => (
                  <div key={d.brand} className="bg-slate-950 p-4 rounded-lg border border-slate-850 hover:border-blue-900 transition-all shadow-xs">
                    <span className="text-[10px] font-mono text-emerald-400 block font-semibold">{d.company}</span>
                    <h4 className="font-bold text-white text-sm mt-0.5">{d.brand}</h4>
                    
                    <div className="mt-2.5 space-y-1 text-xs text-slate-400">
                      <p><strong className="text-slate-300">Generic:</strong> {d.generic}</p>
                      <p><strong className="text-slate-300">Category:</strong> {d.drugClass}</p>
                      <p className="line-clamp-2 italic"><strong className="text-slate-300">Indication:</strong> {d.indication}</p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedBrand({ brand: d.brand, generic: d.generic, company: d.company });
                        setDrugSearchQuery(d.brand);
                        setActiveTab('PrescriptionPad');
                      }}
                      className="mt-3 w-full bg-slate-900 hover:bg-slate-800 text-blue-400 text-[10px] font-semibold py-1 border border-slate-800 rounded transition"
                    >
                      Use as Active Rx Medication
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 4: APPOINTMENTS Hub */}
        {activeTab === 'Appointments' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="view-appointments-hub">
            
            {/* Left Column Serial Booking Input */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-850 p-5 rounded-xl space-y-4">
              <h3 className="text-sm font-bold border-b border-slate-800 pb-2">Schedule Patient Serial Booking</h3>
              
              {/* Form elements for appointments booking */}
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const name = (form.elements.namedItem('apName') as HTMLInputElement).value;
                const mobile = (form.elements.namedItem('apMobile') as HTMLInputElement).value;
                const age = (form.elements.namedItem('apAge') as HTMLInputElement).value;
                const sex = (form.elements.namedItem('apSex') as HTMLSelectElement).value;
                handleCreateAppointment(name, mobile, age, sex);
                form.reset();
              }} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Full Name (রোগীর নাম)</label>
                  <input type="text" name="apName" required className="w-full bg-slate-950 border border-slate-800 p-2 rounded" placeholder="e.g. Anisur Rahman" />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Contact Mobile (মোবাইল নম্বর)</label>
                  <input type="text" name="apMobile" required className="w-full bg-slate-950 border border-slate-800 p-2 rounded" placeholder="017xxxxxxxx" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Age</label>
                    <input type="text" name="apAge" className="w-full bg-slate-950 border border-slate-800 p-2 rounded" placeholder="e.g. 28" />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Sex</label>
                    <select name="apSex" className="w-full bg-slate-950 border border-slate-800 p-2 rounded">
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-850">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Standard Visit Fee Accountable:</span>
                    <strong className="text-white text-sm font-mono">৳{pageSetup.visitFees}</strong>
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded shadow-md transition">
                  Book Slot Chamber serial
                </button>
              </form>
            </div>

            {/* Right Column List of Appointments */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-850 p-5 rounded-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold">Chamber Serial Records List</h3>
                <span className="text-xs font-mono px-2 py-0.5 bg-slate-950 rounded text-slate-400">Total Booked: {appointments.length} Slots</span>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="min-w-full text-slate-300">
                  <thead className="bg-slate-950 text-[10px] font-mono border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="px-4 py-2.5">Sl</th>
                      <th className="px-4 py-2.5">Patient Details</th>
                      <th className="px-4 py-2.5">Mobile</th>
                      <th className="px-4 py-2.5">Apnt Code</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {appointments.map((ap) => (
                      <tr key={ap.id} className="hover:bg-slate-850">
                        <td className="px-4 py-3 font-bold font-mono text-emerald-400">#{ap.serial}</td>
                        <td className="px-4 py-3">
                          <strong className="text-white block">{ap.name}</strong>
                          <span className="text-[10px] text-slate-400">{ap.age} Yrs • {ap.sex}</span>
                        </td>
                        <td className="px-4 py-3 font-mono">{ap.mobile}</td>
                        <td className="px-4 py-3 font-mono text-blue-400">{ap.apntNo}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ap.status === 'Completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-slate-950 text-slate-400'
                          }`}>
                            {ap.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setCurrentPatient({
                                id: `pat-${Date.now()}`,
                                name: ap.name,
                                age: ap.age,
                                sex: ap.sex,
                                address: ap.address,
                                mobile: ap.mobile,
                                regNo: ap.regNo,
                                date: ap.date,
                                dx: '',
                                cc: '',
                                bp: '120/80 mmHg',
                                pulse: '72',
                                temp: '98.4°F',
                                heart: 'NAD',
                                lungs: 'NAD',
                                abd: 'Soft',
                                anaemia: 'Nil',
                                jaundice: 'Nil',
                                cyanosis: 'Nil',
                                oedema: 'Nil',
                                ix: '',
                                drugHistory: '',
                                pastHistory: '',
                                presentHistory: '',
                                notes: '',
                                bmiWeight: '70',
                                bmiHeightFeet: '5',
                                bmiHeightInch: '6',
                                bmiValue: '24.6',
                                bmiClass: 'Normal Weight',
                                bmiIdealWeight: '55-68 kg',
                                insulinWeight: '70',
                                insulinUnitPerKg: '0.3',
                                insulinTime: 'BD',
                                insulinTotalUnit: '21.0',
                                insulinDose: '14-0-7 Units',
                                zDob: '1996-01-01',
                                zGender: 'M',
                                zWeight: '70',
                                zResult: 'Normal Percentile',
                                zDays: '11000',
                                bmrWeight: '70',
                                bmrHeightFeet: '5',
                                bmrHeightInch: '6',
                                bmrGender: 'M',
                                bmrAge: '30',
                                bmrActivity: 'No Exercise',
                                bmrValue: '1600 kcal/day',
                                eddLmp: '',
                                eddGestationalAge: '',
                                eddCalculatedDate: '',
                                printPastHist: false,
                                printPresentHist: true,
                                printNotesSettings: true,
                                printEddSettings: false
                              });
                              setActiveTab('PrescriptionPad');
                            }}
                            className="bg-emerald-600 text-white font-semibold text-[10px] py-1 px-3 rounded hover:bg-emerald-700 transition"
                          >
                            Diagnose Patient
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: PAYMENTS ledger tracking */}
        {activeTab === 'Payments' && (
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl space-y-4" id="view-payments-ledger-tab">
            <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xl font-bold">Chamber Revenue Ledgers (আজকের কালেকশন)</h2>
                <p className="text-xs text-slate-400">Total transactions posted locally: {payments.length}</p>
              </div>
              <div className="bg-slate-950 p-4 rounded border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Total Net Revenue Summary</span>
                <strong className="text-2xl font-extrabold text-[#E5B620] font-mono leading-none">
                  ৳{payments.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0)}
                </strong>
              </div>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="min-w-full text-slate-300">
                <thead className="bg-slate-950 text-[10px] font-mono text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Tx Date</th>
                    <th className="px-4 py-3">Reg ID</th>
                    <th className="px-4 py-3">Patient Name</th>
                    <th className="px-4 py-3">Mobile</th>
                    <th className="px-4 py-3 text-right">Fee Settled (টাকা)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {payments.map((py) => (
                    <tr key={py.id} className="hover:bg-slate-850">
                      <td className="px-4 py-3 font-mono">{py.date}</td>
                      <td className="px-4 py-3 font-mono text-emerald-400">#{py.regNo}</td>
                      <td className="px-4 py-3 font-bold text-white">{py.name}</td>
                      <td className="px-4 py-3 font-mono">{py.mobile}</td>
                      <td className="px-4 py-3 text-right text-emerald-400 font-mono font-bold">৳{py.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: SMS ALERT MODEM INTERACTION */}
        {activeTab === 'SMS' && (
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl space-y-5" id="view-sms-router-tab">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">GP / Robi Integration Alert Router</h2>
                <p className="text-xs text-slate-400">Transmit medication schedules and dosage reminders to patient handsets</p>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800 text-right">
                <span className="text-[10px] text-slate-400 block font-mono">Core SMS Credits Left:</span>
                <strong className="text-lg font-bold font-mono text-blue-400">{smsBalance} Messages</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs">
              <div className="space-y-4">
                <h3 className="font-bold text-slate-300">Send New Alert Broadcast</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Mobile Carrier Prefix</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 01700000000" 
                      value={smsMobile}
                      onChange={(e) => setSmsMobile(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded tracking-wider font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Alert Reminders Content</label>
                    <textarea 
                      rows={4}
                      placeholder="e.g. Dr. Musafir chamber alert: Dear Mr. Muhammad, please consume Napa Extend dose at breakfast as scheduled. Fasting blood test advised tomorrow."
                      value={smsMessage}
                      onChange={(e) => setSmsMessage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-[11px]"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!smsMobile || !smsMessage) {
                        alert("Mobile and message fields cannot be empty!");
                        return;
                      }
                      setSmsBalance(prev => prev - 1);
                      setSmsOutcome('success');
                      setTimeout(() => setSmsOutcome(''), 3000);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded transition shadow-md"
                  >
                    Broadcast Alert Reminders Packet
                  </button>

                  {smsOutcome === 'success' && (
                    <div className="bg-emerald-950 text-emerald-400 border border-emerald-900 p-3 rounded flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>Remote SMS Modem transmitted packet Successfully! Carrier payload delivered.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* bKash Recharging simulator inside the sidebar menu */}
              <div className="bg-slate-950 p-5 rounded-lg border border-slate-850 space-y-4">
                <h4 className="font-bold text-white text-sm border-b border-slate-850 pb-2 flex items-center">
                  <Coins className="w-4 h-4 mr-1.5 text-pink-500" />
                  bKash / Nagad Instant Credit Recharge
                </h4>
                <div className="text-slate-400 leading-relaxed text-[11px] space-y-2">
                  <p>
                    Recharge SMS pools to automate reminders for pregnant EDD mothers and high glycemic index insulin targets.
                  </p>
                  <div className="grid grid-cols-3 gap-2 py-2">
                    <button onClick={() => { setSmsBalance(b => b + 1000); alert("Recharged 1,000 credits via bKash gateway!"); }} className="bg-pink-700 hover:bg-pink-800 text-white font-bold py-2 rounded">
                      ৳৩০০ / 1,000 SMS
                    </button>
                    <button onClick={() => { setSmsBalance(b => b + 5000); alert("Recharged 5,000 credits via bKash gateway!"); }} className="bg-pink-700 hover:bg-pink-800 text-white font-bold py-2 rounded">
                      ৳১,২৫০ / 5,000 SMS
                    </button>
                    <button onClick={() => { setSmsBalance(b => b + 15000); alert("Recharged 15,000 credits via bKash gateway!"); }} className="bg-pink-700 hover:bg-pink-800 text-white font-bold py-2 rounded">
                      ৳৩,০০০ / 15,000 SMS
                    </button>
                  </div>
                  <p className="font-mono text-[9px] text-[#E5B620]">
                    * Instant API keys binding under Zilsoft SMS Router integration standard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: CHAMBER HEADER TITLE EDIT */}
        {activeTab === 'HeaderEdit' && (
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl space-y-4" id="view-header-edit-tab">
            <div>
              <h2 className="text-xl font-bold">Chamber Prescription Header Configurator</h2>
              <p className="text-xs text-slate-400">Alter BMD degrees, specialties, chambers timings, and footers visible on printed PDF blocks</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-400 mb-1">Doctor full name (ডাক্তার নাম)</label>
                  <input 
                    type="text" 
                    value={headerSettings.doctorName}
                    onChange={(e) => setHeaderSettings({ ...headerSettings, doctorName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Degrees & Medical Institutes</label>
                  <input 
                    type="text" 
                    value={headerSettings.degrees}
                    onChange={(e) => setHeaderSettings({ ...headerSettings, degrees: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Primary Specialties & Departments</label>
                  <input 
                    type="text" 
                    value={headerSettings.specialty}
                    onChange={(e) => setHeaderSettings({ ...headerSettings, specialty: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">BMDC Registration Code</label>
                  <input 
                    type="text" 
                    value={headerSettings.bmdcReg}
                    onChange={(e) => setHeaderSettings({ ...headerSettings, bmdcReg: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded font-mono"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-400 mb-1">Clinic Center / Hospital Name</label>
                  <input 
                    type="text" 
                    value={headerSettings.clinicName}
                    onChange={(e) => setHeaderSettings({ ...headerSettings, clinicName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Chamber Hotline</label>
                    <input 
                      type="text" 
                      value={headerSettings.clinicMobile}
                      onChange={(e) => setHeaderSettings({ ...headerSettings, clinicMobile: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Off Days</label>
                    <input 
                      type="text" 
                      value={headerSettings.offDay}
                      onChange={(e) => setHeaderSettings({ ...headerSettings, offDay: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-red-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Print Footer Advice Text (বাংলায় সূচিপত্র)</label>
                  <input 
                    type="text" 
                    value={headerSettings.footerText}
                    onChange={(e) => setHeaderSettings({ ...headerSettings, footerText: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-slate-200"
                  />
                </div>
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input 
                      type="checkbox" 
                      checked={headerSettings.displayBarcode}
                      onChange={(e) => setHeaderSettings({ ...headerSettings, displayBarcode: e.target.checked })}
                      className="rounded border-slate-800 text-blue-600"
                    />
                    <span>Automatically generate patients register Barcode in Footer row</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: CENTIMETER PAGE setup CALL */}
        {activeTab === 'PageSetup' && (
          <PageLayoutSimulator 
            settings={pageSetup} 
            onChangeSettings={(updated) => setPageSetup(prev => ({ ...prev, ...updated }))} 
            onReset={() => setPageSetup(INITIAL_PAGE_SETUP)} 
          />
        )}



      </main>

      {/* 3. SIMULATED PRINT LAYOUT MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 no-print-overlay">
          <div className="bg-white text-slate-900 rounded-xl max-w-2xl w-full p-6 space-y-5 flex flex-col max-h-[90vh] no-print-box">
            
            <div className="flex justify-between items-center border-b pb-3 no-print-header">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-sans">Physical Print Output Emulation</h3>
                <p className="text-xs text-slate-500 font-sans">
                  Simulated paper size: {pageSetup.totalPage.height}cm x {pageSetup.totalPage.width}cm (Theme: <span className="capitalize font-bold text-blue-600">{padColorTheme}</span>)
                </p>
              </div>
              <button 
                onClick={() => setShowPrintModal(false)}
                className="text-slate-500 hover:text-slate-800 font-bold text-xl p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Miniature printed layout */}
            <div className="flex-1 overflow-y-auto bg-slate-100 p-4 rounded-lg flex justify-center no-print-body">
              
              <div 
                className={`bg-white text-slate-900 p-8 font-sans transition-all w-[21cm] shadow-xl border-4 border-double printable-pad-content ${
                  padColorTheme === 'blue' ? 'border-blue-200' :
                  padColorTheme === 'emerald' ? 'border-emerald-200' :
                  padColorTheme === 'teal' ? 'border-teal-200' :
                  padColorTheme === 'amber' ? 'border-amber-200' :
                  padColorTheme === 'rose' ? 'border-rose-200' : 'border-indigo-200'
                }`}
                style={{
                  minHeight: `${pageSetup.totalPage.height * 10}px`,
                  fontSize: `${pageSetup.printFontSize}pt`
                }}
              >
                {/* Condition: With or without Header */}
                {printWithHeaderMode ? (
                  <div 
                    className={`border-b-2 pb-3 mb-6 flex justify-between items-start text-xs transition-colors duration-300 ${
                      padColorTheme === 'blue' ? 'border-blue-600' :
                      padColorTheme === 'emerald' ? 'border-emerald-600' :
                      padColorTheme === 'teal' ? 'border-teal-600' :
                      padColorTheme === 'amber' ? 'border-amber-600' :
                      padColorTheme === 'rose' ? 'border-rose-600' : 'border-indigo-600'
                    }`}
                  >
                    <div>
                      <h4 className={`font-extrabold text-base leading-tight font-sans transition-colors ${
                        padColorTheme === 'blue' ? 'text-blue-900' :
                        padColorTheme === 'emerald' ? 'text-emerald-900' :
                        padColorTheme === 'teal' ? 'text-teal-900' :
                        padColorTheme === 'amber' ? 'text-amber-900' :
                        padColorTheme === 'rose' ? 'text-rose-900' : 'text-indigo-900'
                      }`}>{headerSettings.doctorName}</h4>
                      <p className="text-[11px] text-slate-700 font-medium font-sans">{headerSettings.degrees}</p>
                      <p className="text-[10px] text-slate-500 font-bold font-sans">{headerSettings.specialty} • {headerSettings.department}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border block mt-1 w-fit font-bold font-mono ${
                        padColorTheme === 'blue' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                        padColorTheme === 'emerald' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        padColorTheme === 'teal' ? 'bg-teal-50 text-teal-800 border-teal-200' :
                        padColorTheme === 'amber' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        padColorTheme === 'rose' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      }`}>{headerSettings.bmdcReg}</span>
                    </div>
                    <div className="text-right text-[10px] text-slate-700 font-sans">
                      <h5 className="font-bold text-slate-950 font-sans">{headerSettings.clinicName}</h5>
                      <p className="text-slate-600">{headerSettings.clinicAddress}</p>
                      <p>Cell: <span className="font-bold text-slate-800">{headerSettings.clinicMobile}</span></p>
                      <p className={`font-bold ${
                        padColorTheme === 'blue' ? 'text-blue-600' :
                        padColorTheme === 'emerald' ? 'text-emerald-600' :
                        padColorTheme === 'teal' ? 'text-teal-600' :
                        padColorTheme === 'amber' ? 'text-amber-700' :
                        padColorTheme === 'rose' ? 'text-rose-600' : 'text-indigo-600'
                      }`}>{headerSettings.offDay}</p>
                    </div>
                  </div>
                ) : (
                  // Blank Space Header mirroring predefined pad height
                  <div 
                    className="border-b border-dashed border-slate-200 mb-6 flex items-center justify-center text-[10px] text-slate-400 font-mono"
                    style={{ height: `${pageSetup.header.height * 10}px` }}
                  >
                    [Pre-printed Pad Header Area: {pageSetup.header.height}cm Blocked]
                  </div>
                )}

                {/* Patient Bar */}
                <div 
                  className={`p-2.5 rounded border grid grid-cols-4 gap-2 text-[10px] font-medium transition-colors duration-300 mb-6 ${
                    padColorTheme === 'blue' ? 'bg-blue-50/70 border-blue-200 text-blue-900' :
                    padColorTheme === 'emerald' ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' :
                    padColorTheme === 'teal' ? 'bg-teal-50/70 border-teal-200 text-teal-900' :
                    padColorTheme === 'amber' ? 'bg-amber-50/70 border-amber-200 text-amber-900' :
                    padColorTheme === 'rose' ? 'bg-rose-50/70 border-rose-200 text-rose-900' : 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
                  }`}
                >
                  <div>
                    <span className="text-slate-500 block uppercase text-[8px] font-bold">Patient Name (নাম)</span>
                    <strong className="text-slate-950 text-[11px] leading-tight font-sans">{currentPatient.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[8px] font-bold">Age / Sex</span>
                    <strong className="text-slate-950 text-[11px] font-sans">{currentPatient.age} Yrs / {currentPatient.sex}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[8px] font-bold">Date (তারিখ)</span>
                    <strong className="text-slate-950 text-[11px] font-sans">{currentPatient.date}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[8px] font-bold">Reg / Mobile</span>
                    <strong className="text-slate-800 font-mono text-[11px]">#{currentPatient.regNo}</strong>
                  </div>
                </div>

                {/* Body Core Columns representation */}
                <div className="grid grid-cols-12 gap-6 min-h-[400px]">
                  
                  {/* History Left */}
                  <div className="col-span-4 border-r pr-4 text-[11px] space-y-4 font-sans">
                    {currentPatient.cc && (
                      <div>
                        <span className={`font-bold font-sans block text-[11px] underline ${
                          padColorTheme === 'blue' ? 'text-blue-800' :
                          padColorTheme === 'emerald' ? 'text-emerald-850' :
                          padColorTheme === 'teal' ? 'text-teal-850' :
                          padColorTheme === 'amber' ? 'text-amber-850' :
                          padColorTheme === 'rose' ? 'text-rose-850' : 'text-indigo-850'
                        }`}>C/C (উপসর্গ):</span>
                        <p className="whitespace-pre-line text-slate-600 leading-relaxed font-sans mt-0.5">{currentPatient.cc}</p>
                      </div>
                    )}
                    <div>
                      <span className={`font-bold font-sans block text-[11px] underline ${
                        padColorTheme === 'blue' ? 'text-blue-800' :
                        padColorTheme === 'emerald' ? 'text-emerald-850' :
                        padColorTheme === 'teal' ? 'text-teal-850' :
                        padColorTheme === 'amber' ? 'text-amber-850' :
                        padColorTheme === 'rose' ? 'text-rose-850' : 'text-indigo-850'
                      }`}>O/E (শারীরিক পরীক্ষা):</span>
                      <ul className="space-y-1 mt-1 text-slate-600 font-sans">
                        {currentPatient.bp && <li>• BP: <strong className="text-slate-800">{currentPatient.bp}</strong></li>}
                        {currentPatient.pulse && <li>• Pulse: <strong className="text-slate-800">{currentPatient.pulse}/Min</strong></li>}
                        {currentPatient.temp && <li>• Temp: <strong className="text-slate-800">{currentPatient.temp}°F</strong></li>}
                      </ul>
                    </div>
                    {currentPatient.ix && (
                      <div>
                        <span className={`font-bold font-sans block text-[11px] underline ${
                          padColorTheme === 'blue' ? 'text-blue-800' :
                          padColorTheme === 'emerald' ? 'text-emerald-850' :
                          padColorTheme === 'teal' ? 'text-teal-850' :
                          padColorTheme === 'amber' ? 'text-amber-850' :
                          padColorTheme === 'rose' ? 'text-rose-850' : 'text-indigo-850'
                        }`}>Ix (পরীক্ষা সমূহ):</span>
                        <p className="whitespace-pre-line text-slate-600 leading-relaxed font-sans mt-0.5">{currentPatient.ix}</p>
                      </div>
                    )}
                    {currentPatient.dx && (
                      <div className={`p-1.5 rounded border ${
                        padColorTheme === 'blue' ? 'bg-blue-50/50 border-blue-150' :
                        padColorTheme === 'emerald' ? 'bg-emerald-50/50 border-emerald-150' :
                        padColorTheme === 'teal' ? 'bg-teal-50/50 border-teal-150' :
                        padColorTheme === 'amber' ? 'bg-amber-50/50 border-amber-150' :
                        padColorTheme === 'rose' ? 'bg-rose-50/50 border-rose-150' : 'bg-indigo-50/50 border-indigo-150'
                      }`}>
                        <span className="font-bold font-sans text-slate-500 block text-[9px] uppercase">Dx (রোগ নির্নয়):</span>
                        <p className="text-slate-900 font-sans font-bold text-[11px] leading-tight">{currentPatient.dx}</p>
                      </div>
                    )}
                  </div>

                  {/* Rx Right Column */}
                  <div className="col-span-8 pl-1 space-y-4">
                    <span className={`font-serif font-extrabold text-3xl block transition-colors ${
                      padColorTheme === 'blue' ? 'text-blue-600' :
                      padColorTheme === 'emerald' ? 'text-emerald-600' :
                      padColorTheme === 'teal' ? 'text-teal-600' :
                      padColorTheme === 'amber' ? 'text-amber-600' :
                      padColorTheme === 'rose' ? 'text-rose-605' : 'text-indigo-600'
                    }`}>Rx.</span>
                    
                    <ol 
                      className={`divide-y divide-slate-100 ${
                        padFontSizeTheme === 'small' ? 'text-[11px]' :
                        padFontSizeTheme === 'large' ? 'text-[13px]' : 'text-xs'
                      }`}
                    >
                      {rxDrugs.map((rd, i) => (
                        <li key={rd.id} className="py-2.5 flex justify-between items-start">
                          <div className="space-y-0.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-extrabold text-slate-900">{i + 1}. {rd.brandName}</span>
                              {rd.beforeFood && (
                                <span className="text-[9px] bg-red-105 text-red-800 px-1.5 py-0.2 rounded font-sans font-medium">খাওয়ার পূর্বে</span>
                              )}
                              {rd.afterFood && (
                                <span className="text-[9px] bg-emerald-105 text-emerald-800 px-1.5 py-0.2 rounded font-sans font-medium">খাওয়ার পরে</span>
                              )}
                            </div>
                            <div className="text-slate-600 font-medium">
                              Dose (মাত্রা): <strong className="text-slate-900 font-bold">{rd.dose}</strong> — {rd.duration} {rd.durationUnit}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>

                    <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-600">
                      <span>Re-visit Chamber instructions: </span>
                      <strong className="text-slate-950 font-sans">After 15 Days</strong> or as necessary. Re-appointment necessary.
                    </div>
                  </div>

                </div>

                {/* Footer advice */}
                <div 
                  className={`border-t pt-2.5 mt-8 flex justify-between items-center text-[9px] text-slate-550 font-sans transition-colors duration-300 ${
                    padColorTheme === 'blue' ? 'border-blue-400' :
                    padColorTheme === 'emerald' ? 'border-emerald-400' :
                    padColorTheme === 'teal' ? 'border-teal-400' :
                    padColorTheme === 'amber' ? 'border-amber-400' :
                    padColorTheme === 'rose' ? 'border-rose-450' : 'border-indigo-400'
                  }`}
                >
                  <div>
                    <p className="font-medium text-slate-705">{headerSettings.footerText}</p>
                    <p className="font-sans text-[8px] mt-0.5 text-slate-400">Software generated prescription. Powered by Prescription Writer BD client.</p>
                  </div>
                  {headerSettings.displayBarcode && (
                    <div className="flex flex-col items-center">
                      <div className="bg-slate-950 block h-6 w-20 relative p-0.5">
                        <div className="absolute inset-x-0 inset-y-0.5 flex justify-around">
                          <span className="w-0.5 bg-white h-full"></span>
                          <span className="w-[1px] bg-white h-full"></span>
                          <span className="w-[3px] bg-white h-full"></span>
                          <span className="w-0.5 bg-white h-full"></span>
                          <span className="w-[2px] bg-white h-full"></span>
                          <span className="w-[1px] bg-white h-full"></span>
                        </div>
                      </div>
                      <span className="text-[7px] text-slate-400 font-mono tracking-widest mt-0.5">#{currentPatient.regNo}</span>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Print trigger actions */}
            <div className="flex justify-end gap-2 border-t pt-3 no-print-footer">
              <button 
                onClick={() => {
                  window.print();
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-5 rounded shadow-sm cursor-pointer"
              >
                Send to Connected Laser Printer (ESC/POS)
              </button>
              <button 
                onClick={() => setShowPrintModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-2 px-4 rounded border cursor-pointer"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4. FOOTER CREDITS */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p>© 2026 Prescription Writer BD. All Rights Reserved. Fully localized for the healthcare professionals of Bangladesh.</p>
          <p className="font-mono text-[10px] text-slate-600">
            Offline Enabled Workspace • Database Synchronizer Ready • bKash SMS Gateway v1.0.1
          </p>
        </div>
      </footer>

    </div>
  );
}
