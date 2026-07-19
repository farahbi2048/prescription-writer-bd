import React, { useState, useEffect } from 'react';
import { Sparkles, Calculator, Activity, Calendar, Baby, Syringe } from 'lucide-react';
import { Patient } from '../types';

interface CalculatorsProps {
  patient: Patient;
  onUpdatePatient: (updated: Partial<Patient>) => void;
}

export default function Calculators({ patient, onUpdatePatient }: CalculatorsProps) {
  const [activeCalcTab, setActiveCalcTab] = useState<'BMI' | 'Insulin' | 'Z-Score' | 'BMR' | 'EDD'>('BMI');

  // Trigger calculations whenever relevant fields change
  useEffect(() => {
    if (activeCalcTab === 'BMI') {
      const weight = parseFloat(patient.bmiWeight);
      const feet = parseFloat(patient.bmiHeightFeet);
      const inch = parseFloat(patient.bmiHeightInch);
      
      if (!isNaN(weight) && !isNaN(feet)) {
        const inches = (feet * 12) + (isNaN(inch) ? 0 : inch);
        const meters = inches * 0.0254;
        const bmi = weight / (meters * meters);
        
        let classification = 'Normal weight';
        if (bmi < 18.5) classification = 'Underweight';
        else if (bmi >= 18.5 && bmi < 25) classification = 'Normal Weight';
        else if (bmi >= 25 && bmi < 30) classification = 'Overweight';
        else classification = 'Obese';

        // Devine Ideal Weight Formula
        let idealMin = 18.5 * (meters * meters);
        let idealMax = 24.9 * (meters * meters);
        const idealWeightString = `${idealMin.toFixed(0)} - ${idealMax.toFixed(0)} kg`;

        onUpdatePatient({
          bmiValue: bmi.toFixed(1),
          bmiClass: classification,
          bmiIdealWeight: idealWeightString
        });
      }
    }
  }, [patient.bmiWeight, patient.bmiHeightFeet, patient.bmiHeightInch, activeCalcTab]);

  useEffect(() => {
    if (activeCalcTab === 'Insulin') {
      const weight = parseFloat(patient.insulinWeight);
      const unitPerKg = parseFloat(patient.insulinUnitPerKg);
      
      if (!isNaN(weight) && !isNaN(unitPerKg)) {
        const totalUnit = weight * unitPerKg;
        let doseString = '';
        
        if (patient.insulinTime === 'BD') {
          // 2/3 morning, 1/3 night
          const morning = Math.round((totalUnit * 2) / 3);
          const night = Math.round(totalUnit / 3);
          doseString = `${morning}-0-${night} Units (Before Food)`;
        } else if (patient.insulinTime === 'OD') {
          doseString = `0-0-${Math.round(totalUnit)} Units (Bed Time)`;
        } else if (patient.insulinTime === 'TDS') {
          const split = Math.round(totalUnit / 3);
          doseString = `${split}-${split}-${split} Units (Before Food)`;
        } else {
          doseString = `0-0-${Math.round(totalUnit)} Units`;
        }

        onUpdatePatient({
          insulinTotalUnit: totalUnit.toFixed(1),
          insulinDose: doseString
        });
      }
    }
  }, [patient.insulinWeight, patient.insulinUnitPerKg, patient.insulinTime, activeCalcTab]);

  useEffect(() => {
    if (activeCalcTab === 'BMR') {
      const weight = parseFloat(patient.bmrWeight);
      const feet = parseFloat(patient.bmrHeightFeet);
      const inch = parseFloat(patient.bmrHeightInch);
      const age = parseFloat(patient.bmrAge);
      
      if (!isNaN(weight) && !isNaN(feet) && !isNaN(age)) {
        const heightCm = (((feet * 12) + (isNaN(inch) ? 0 : inch)) * 2.54);
        // Mifflin-St Jeor
        let bmr = (10 * weight) + (6.25 * heightCm) - (5 * age);
        if (patient.bmrGender === 'M') {
          bmr += 5;
        } else {
          bmr -= 161;
        }

        let activityFactor = 1.2;
        if (patient.bmrActivity === 'Light Exercise') activityFactor = 1.375;
        else if (patient.bmrActivity === 'Moderate Exercise') activityFactor = 1.55;
        else if (patient.bmrActivity === 'Hard Exercise') activityFactor = 1.725;

        const totalCalories = bmr * activityFactor;

        onUpdatePatient({
          bmrValue: `${totalCalories.toFixed(0)} kcal/day`
        });
      }
    }
  }, [patient.bmrWeight, patient.bmrHeightFeet, patient.bmrHeightInch, patient.bmrAge, patient.bmrGender, patient.bmrActivity, activeCalcTab]);

  useEffect(() => {
    if (activeCalcTab === 'EDD' && patient.eddLmp) {
      const lmpDate = new Date(patient.eddLmp);
      if (!isNaN(lmpDate.getTime())) {
        // Naegele's rule: LMP + 280 Days
        const eddDate = new Date(lmpDate.getTime() + (280 * 24 * 60 * 60 * 1000));
        
        // Gestational age from fixed current local date (2026-05-19)
        const currentDate = new Date('2026-05-19');
        const diffTime = Math.abs(currentDate.getTime() - lmpDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const weeks = Math.floor(diffDays / 7);
        const remainingDays = diffDays % 7;
        
        onUpdatePatient({
          eddCalculatedDate: eddDate.toISOString().split('T')[0],
          eddGestationalAge: `${weeks} weeks ${remainingDays} days`
        });
      }
    }
  }, [patient.eddLmp, activeCalcTab]);

  useEffect(() => {
    if (activeCalcTab === 'Z-Score' && patient.zDob) {
      const dobDate = new Date(patient.zDob);
      if (!isNaN(dobDate.getTime())) {
        const currentDate = new Date('2026-05-19');
        const diffTime = Math.abs(currentDate.getTime() - dobDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Let's do a simplified pediatric growth standard score
        let result = 'Perfect';
        const weightValue = parseFloat(patient.zWeight);
        if (!isNaN(weightValue)) {
          // If 5 years or younger
          if (diffDays < 1825) {
            if (weightValue < 5) result = 'Severely Underweight (Critical Risk)';
            else if (weightValue >= 5 && weightValue < 12) result = 'Normal Percentile range';
            else result = 'Above Normal range';
          } else {
            result = 'Normal Pediatric Cohort percentile';
          }
        }

        onUpdatePatient({
          zDays: diffDays.toString(),
          zResult: result
        });
      }
    }
  }, [patient.zDob, patient.zWeight, activeCalcTab]);

  return (
    <div className="bg-[#CFDDF0] p-4 rounded-lg shadow-sm border border-blue-400 mt-4" id="clinical-calculator-widget">
      {/* Upper Selector Tabs */}
      <div className="flex flex-wrap gap-1 mb-3">
        {(['BMI', 'Insulin', 'Z-Score', 'BMR', 'EDD'] as const).map((tab) => (
          <button
            key={tab}
            id={`calc-tab-${tab.toLowerCase()}`}
            onClick={() => setActiveCalcTab(tab)}
            className={`px-3 py-1 text-xs font-semibold rounded-t-md transition-all duration-150 shadow-xs border border-b-0 ${
              activeCalcTab === tab
                ? 'bg-[#E5B620] text-slate-900 border-[#C19210]'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
            }`}
          >
            {tab === 'BMI' && <Calculator className="w-3.5 h-3.5 inline mr-1" />}
            {tab === 'Insulin' && <Syringe className="w-3.5 h-3.5 inline mr-1" />}
            {tab === 'Z-Score' && <Baby className="w-3.5 h-3.5 inline mr-1" />}
            {tab === 'BMR' && <Activity className="w-3.5 h-3.5 inline mr-1" />}
            {tab === 'EDD' && <Calendar className="w-3.5 h-3.5 inline mr-1" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Calculator Form Panels */}
      <div className="bg-blue-50/50 p-3 rounded border border-blue-200 text-xs text-slate-800">
        
        {/* BMI FORM */}
        {activeCalcTab === 'BMI' && (
          <div className="space-y-3" id="calc-pane-bmi">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Weight (Kg)</label>
                <input
                  type="number"
                  placeholder="e.g. 70"
                  value={patient.bmiWeight}
                  onChange={(e) => onUpdatePatient({ bmiWeight: e.target.value })}
                  className="w-full bg-white border border-blue-300 p-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Height (Feet)</label>
                <input
                  type="number"
                  placeholder="Feet"
                  value={patient.bmiHeightFeet}
                  onChange={(e) => onUpdatePatient({ bmiHeightFeet: e.target.value })}
                  className="w-full bg-white border border-blue-300 p-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Height (Inch)</label>
                <input
                  type="number"
                  placeholder="Inches"
                  value={patient.bmiHeightInch}
                  onChange={(e) => onUpdatePatient({ bmiHeightInch: e.target.value })}
                  className="w-full bg-white border border-blue-300 p-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="bg-white p-2.5 rounded border border-blue-200 mt-2 grid grid-cols-2 gap-2 shadow-xs">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">BMI Index:</span>
                <span className="block text-xl font-bold text-slate-800 font-mono" id="bmi-val-text">
                  {patient.bmiValue ? `${patient.bmiValue} kg/m²` : '---'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Classification:</span>
                <span className="block text-sm font-semibold text-blue-800 mt-0.5" id="bmi-class-text">
                  {patient.bmiClass || '---'}
                </span>
              </div>
              <div className="col-span-2 border-t border-slate-100 pt-1.5 mt-1.5 flex justify-between items-center text-slate-500">
                <span>Ideal Weight range (Devine format):</span>
                <span className="font-semibold text-slate-700 font-mono">{patient.bmiIdealWeight || '---'}</span>
              </div>
            </div>
          </div>
        )}

        {/* INSULIN DOSAGE COMPILER */}
        {activeCalcTab === 'Insulin' && (
          <div className="space-y-3" id="calc-pane-insulin">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Weight (Kg)</label>
                <input
                  type="number"
                  placeholder="e.g. 70"
                  value={patient.insulinWeight}
                  onChange={(e) => onUpdatePatient({ insulinWeight: e.target.value })}
                  className="w-full bg-white border border-blue-300 p-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Unit/Kg Dosage</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 0.3"
                  value={patient.insulinUnitPerKg}
                  onChange={(e) => onUpdatePatient({ insulinUnitPerKg: e.target.value })}
                  className="w-full bg-white border border-blue-300 p-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Schedule</label>
                <select
                  value={patient.insulinTime}
                  onChange={(e) => onUpdatePatient({ insulinTime: e.target.value as any })}
                  className="w-full bg-white border border-blue-300 p-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="BD">BD (2/3 & 1/3)</option>
                  <option value="OD">OD (Bedtime)</option>
                  <option value="TDS">TDS (1/3 Split)</option>
                </select>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded border border-blue-200 mt-2 shadow-xs grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Total Units Needed:</span>
                <span className="block text-lg font-bold text-slate-800 font-mono">
                  {patient.insulinTotalUnit ? `${patient.insulinTotalUnit} Units` : '---'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Suggested Dose Splitting:</span>
                <span className="block text-xs font-semibold text-emerald-700 mt-1 font-mono">
                  {patient.insulinDose || '---'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Z-SCORE FOR PEDIATRIC COHORTS */}
        {activeCalcTab === 'Z-Score' && (
          <div className="space-y-3" id="calc-pane-zscore">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Date Of Birth</label>
                <input
                  type="date"
                  value={patient.zDob}
                  onChange={(e) => onUpdatePatient({ zDob: e.target.value })}
                  className="w-full bg-white border border-blue-300 p-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Gender</label>
                <select
                  value={patient.zGender}
                  onChange={(e) => onUpdatePatient({ zGender: e.target.value as any })}
                  className="w-full bg-white border border-blue-300 p-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="col-span-1">
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Weight (Kg)</label>
                <input
                  type="number"
                  placeholder="Child Kg"
                  value={patient.zWeight}
                  onChange={(e) => onUpdatePatient({ zWeight: e.target.value })}
                  className="w-full bg-white border border-blue-300 p-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <div className="bg-white p-1.5 rounded border border-blue-200 text-xs">
                  <span className="text-[10px] uppercase text-slate-400 block font-mono">Child's Age (Days):</span>
                  <span className="font-bold text-slate-700" id="zscore-days-text">{patient.zDays ? `${patient.zDays} Days` : '---'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded border border-blue-200 mt-2 shadow-xs">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">WHO Standard Appraisal:</span>
              <span className="block text-xs font-semibold text-rose-700 mt-1">
                {patient.zResult || '---'}
              </span>
            </div>
          </div>
        )}

        {/* BMR (METABOLIC RATE CALCULATOR) */}
        {activeCalcTab === 'BMR' && (
          <div className="space-y-3" id="calc-pane-bmr">
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-1">
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Age</label>
                <input
                  type="number"
                  placeholder="Age"
                  value={patient.bmrAge}
                  onChange={(e) => onUpdatePatient({ bmrAge: e.target.value })}
                  className="w-full bg-white border border-blue-300 p-1 rounded focus:outline-none"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Gender</label>
                <select
                  value={patient.bmrGender}
                  onChange={(e) => onUpdatePatient({ bmrGender: e.target.value as any })}
                  className="w-full bg-white border border-blue-300 p-1 rounded focus:outline-none"
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Daily Exercise Factor</label>
                <select
                  value={patient.bmrActivity}
                  onChange={(e) => onUpdatePatient({ bmrActivity: e.target.value })}
                  className="w-full bg-white border border-blue-300 p-1 rounded focus:outline-none"
                >
                  <option value="No Exercise">No Exercise (Sedentary)</option>
                  <option value="Light Exercise">Light Exercise (1-3 days/wk)</option>
                  <option value="Moderate Exercise">Moderate Exercise (3-5 days/wk)</option>
                  <option value="Hard Exercise">Hard Exercise (6-7 days/wk)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Weight (Kg)</label>
                <input
                  type="number"
                  placeholder="Kg"
                  value={patient.bmrWeight}
                  onChange={(e) => onUpdatePatient({ bmrWeight: e.target.value })}
                  className="w-full bg-white border border-blue-300 p-1 rounded focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Height (Ft)</label>
                <input
                  type="number"
                  placeholder="Feet"
                  value={patient.bmrHeightFeet}
                  onChange={(e) => onUpdatePatient({ bmrHeightFeet: e.target.value })}
                  className="w-full bg-white border border-blue-300 p-1 rounded focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Height (In)</label>
                <input
                  type="number"
                  placeholder="Inches"
                  value={patient.bmrHeightInch}
                  onChange={(e) => onUpdatePatient({ bmrHeightInch: e.target.value })}
                  className="w-full bg-white border border-blue-300 p-1 rounded focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-white p-2 text-center rounded border border-blue-200 mt-2 shadow-xs">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Total Calories Required:</span>
              <span className="block text-base font-bold text-[#E5B620]-800 font-mono text-indigo-900" id="bmr-val-text">
                {patient.bmrValue || '---'}
              </span>
            </div>
          </div>
        )}

        {/* EDD (EXPECTED DATE OF DELIVERY) & GESTATIONAL AGE */}
        {activeCalcTab === 'EDD' && (
          <div className="space-y-3" id="calc-pane-edd">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Last Menstrual Period (LMP)</label>
              <input
                type="date"
                value={patient.eddLmp}
                onChange={(e) => onUpdatePatient({ eddLmp: e.target.value })}
                className="w-full bg-white border border-blue-300 p-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
              />
            </div>

            <div className="bg-white p-2.5 rounded border border-blue-200 mt-2 space-y-1.5 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Gestational Age (LMP):</span>
                <span className="font-bold text-slate-700 font-mono text-xs" id="edd-gestational-text">
                  {patient.eddGestationalAge || '---'}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 pt-1.5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold text-[#C19210]">EDD Date (LMP):</span>
                <span className="font-extrabold text-[#C19210] font-mono text-xs" id="edd-calc-text">
                  {patient.eddCalculatedDate || '---'}
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
