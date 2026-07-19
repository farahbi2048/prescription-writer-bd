import React from 'react';
import { PageSetupSettings } from '../types';

interface PageLayoutSimulatorProps {
  settings: PageSetupSettings;
  onChangeSettings: (updated: Partial<PageSetupSettings>) => void;
  onReset: () => void;
}

export default function PageLayoutSimulator({ settings, onChangeSettings, onReset }: PageLayoutSimulatorProps) {
  
  const handleDimensionChange = (
    section: 'header' | 'patient' | 'history' | 'mainPad' | 'footer' | 'totalPage',
    dimension: 'height' | 'width',
    val: number
  ) => {
    const updatedSection = { ...settings[section], [dimension]: val };
    onChangeSettings({ [section]: updatedSection });
  };

  // Convert cm to proportional visual px values (A4 typically is 21cm x 29.7cm)
  // We can use a scale factor: 1 cm = 8.5 pixels for screen representation
  const scale = 8.5;

  return (
    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200" id="page-layout-setup-panel">
      
      {/* Description Headers */}
      <div className="bg-[#DFECC1] text-emerald-900 border border-emerald-300 p-4 rounded-lg mb-6 text-xs leading-relaxed shadow-xs">
        <strong>আপনার ছাপানো প্যাড থাকলে এখানে সেই প্যাডের সাইজ ইনপুট দিন।</strong> প্রেসক্রিপশন লেখার সময় "Print Without Header" বাটন চেপে এখানকার সাইজ অনুসারে আপনার প্যাডেই প্রেসক্রিপশন প্রিন্ট করতে পারবেন। একটি স্কেল দিয়ে আপনার ছাপানো প্যাড সেন্টিমিটারে মাপুন। নিচে প্রেসক্রিপশনের মোট ৬টি অংশ আছে। আপনার প্রেসক্রিপশনের মাপ মিলিয়ে অংশগুলো পূরণ করুন।
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Dynamic Interactive Preview Blueprint */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <span className="text-xs font-mono font-bold text-slate-500 mb-2 uppercase tracking-wide">
            Live Padding & Boundary Blueprint
          </span>
          
          {/* Visual Container representing A4 physical margins */}
          <div 
            className="border-2 border-red-500 bg-white relative shadow-md rounded overflow-hidden flex flex-col"
            style={{
              height: `${settings.totalPage.height * scale}px`,
              width: `${settings.totalPage.width * scale}px`,
            }}
            id="physical-pad-preview"
          >
            {/* 1. Header Area Block */}
            <div 
              className="bg-slate-150 border-b border-dashed border-red-400 flex items-center justify-center text-[10px] text-slate-500 font-mono transition-all duration-300"
              style={{ height: `${settings.header.height * scale}px` }}
            >
              Header Section ({settings.header.height}cm x {settings.header.width}cm)
            </div>

            {/* 2. Patient Info Block */}
            <div 
              className="bg-blue-50 border-b border-dashed border-red-400 flex items-center justify-center text-[10px] text-blue-800 font-semibold transition-all duration-300"
              style={{ height: `${settings.patient.height * scale}px` }}
            >
              Patient Info Bar ({settings.patient.height}cm)
            </div>

            {/* 3. Middle Columns (History + Main Pad Rx Column) */}
            <div className="flex flex-1 border-b border-dashed border-red-400">
              
              {/* Complaints / History Left Bar */}
              <div 
                className="bg-amber-50/70 border-r border-dashed border-red-400 flex items-center justify-center text-center p-1 text-[9px] text-amber-900 font-mono transition-all duration-300"
                style={{ width: `${settings.history.width * scale}px` }}
              >
                Complaints, O/E, Dx ({settings.history.width}cm)
              </div>
              
              {/* Prescription Rx Main Pad Box */}
              <div 
                className="bg-white flex-1 flex items-center justify-center text-slate-400 font-serif font-bold text-base relative transition-all duration-300"
              >
                <span className="absolute left-2 top-2 text-xs font-serif italic text-slate-400">Rx.</span>
                Main Rx & Medication Pad ({settings.mainPad.width}cm)
              </div>
            </div>

            {/* 4. Footer Section Box */}
            <div 
              className="bg-emerald-50 border-t border-dashed border-red-400 flex items-center justify-center text-[10px] text-emerald-800 font-serif font-semibold transition-all duration-300"
              style={{ height: `${settings.footer.height * scale}px` }}
            >
              Footer: Advice & Directives
            </div>
            
          </div>
          
          <button 
            onClick={onReset}
            className="mt-4 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs py-1.5 px-4 rounded border border-slate-900 shadow-sm"
          >
            Factory Reset Dimensions
          </button>
        </div>

        {/* Input Tuning Grid Controls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-4 text-xs text-slate-700">
            <h3 className="font-semibold text-slate-900 text-sm border-b pb-2">Modify Padding Sizes (cm)</h3>
            
            {/* Grid for Dimension Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Header Dimensions Setup */}
              <div className="bg-slate-50 p-3 rounded border border-slate-150">
                <span className="block font-bold text-slate-800 mb-1.5 font-sans">১. হেডার সাইজ (Header Size):</span>
                <div className="flex gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500">উচ্চতা / height (cm)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={settings.header.height} 
                      onChange={(e) => handleDimensionChange('header', 'height', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded p-1"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">প্রস্থ / width (cm)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={settings.header.width} 
                      onChange={(e) => handleDimensionChange('header', 'width', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded p-1"
                    />
                  </div>
                </div>
              </div>

              {/* Patient Block Dimensions Setup */}
              <div className="bg-blue-50/50 p-3 rounded border border-blue-150">
                <span className="block font-bold text-slate-800 mb-1.5 font-sans">২. রোগীর তথ্য (Patient Info Size):</span>
                <div className="flex gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500">উচ্চতা / height (cm)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={settings.patient.height} 
                      onChange={(e) => handleDimensionChange('patient', 'height', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded p-1"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">প্রস্থ / width (cm)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={settings.patient.width} 
                      onChange={(e) => handleDimensionChange('patient', 'width', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded p-1"
                    />
                  </div>
                </div>
              </div>

              {/* Patient History Complaints setup */}
              <div className="bg-amber-50/50 p-3 rounded border border-amber-150">
                <span className="block font-bold text-slate-800 mb-1.5 font-sans">৩. হিস্ট্রি অংশ (History Column Size):</span>
                <div className="flex gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500">উচ্চতা / height (cm)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={settings.history.height} 
                      onChange={(e) => handleDimensionChange('history', 'height', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded p-1"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">প্রস্থ / width (cm)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={settings.history.width} 
                      onChange={(e) => handleDimensionChange('history', 'width', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded p-1"
                    />
                  </div>
                </div>
              </div>

              {/* Rx prescriptions setup */}
              <div className="bg-slate-50 p-3 rounded border border-slate-150">
                <span className="block font-bold text-slate-800 mb-1.5 font-sans">৪. মূল প্যাড প্রেসক্রিপশন অংশ:</span>
                <div className="flex gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500">উচ্চতা / height (cm)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={settings.mainPad.height} 
                      onChange={(e) => handleDimensionChange('mainPad', 'height', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded p-1"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">প্রস্থ / width (cm)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={settings.mainPad.width} 
                      onChange={(e) => handleDimensionChange('mainPad', 'width', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded p-1"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Setup */}
              <div className="bg-emerald-50/50 p-3 rounded border border-emerald-150">
                <span className="block font-bold text-slate-800 mb-1.5 font-sans">৫. ফুটার (Footer Size):</span>
                <div className="flex gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500">উচ্চতা / height (cm)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={settings.footer.height} 
                      onChange={(e) => handleDimensionChange('footer', 'height', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded p-1"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">প্রস্থ / width (cm)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={settings.footer.width} 
                      onChange={(e) => handleDimensionChange('footer', 'width', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded p-1"
                    />
                  </div>
                </div>
              </div>

              {/* Total Page Margins Setup */}
              <div className="bg-red-50/30 p-3 rounded border border-red-150">
                <span className="block font-bold text-red-900 mb-1.5 font-sans">৬. সম্পূর্ণ প্রেসক্রিপশনের সাইজ:</span>
                <div className="flex gap-2">
                  <div>
                    <label className="block text-[10px] text-red-700">উচ্চতা / height (cm)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={settings.totalPage.height} 
                      onChange={(e) => handleDimensionChange('totalPage', 'height', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded p-1"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-red-700">প্রস্থ / width (cm)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={settings.totalPage.width} 
                      onChange={(e) => handleDimensionChange('totalPage', 'width', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded p-1"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
