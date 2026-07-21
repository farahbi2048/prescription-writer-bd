import React, { useState } from 'react';
import { AlertTriangle, AudioLines, CheckCircle2, FileAudio, LoaderCircle, ShieldAlert } from 'lucide-react';
import { Patient } from '../types';

type SoapDraft = {
  chief_complaint: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  medications_mentioned: string[];
  urgency_patient: string;
};

type DrugSafety = {
  drug_name: string;
  status: string;
  detail: string;
};

type AnalysisResult = {
  soap_note: SoapDraft;
  drug_safety: DrugSafety[];
  disclaimer: string;
};

interface AiScribeProps {
  patient: Patient;
  onApplyReviewedDraft: (updated: Partial<Patient>) => void;
}

const API_BASE_URL = import.meta.env.VITE_MEDSCRIBE_API_URL || 'http://localhost:8000';

export default function AiScribe({ patient, onApplyReviewedDraft }: AiScribeProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [draft, setDraft] = useState<SoapDraft | null>(null);
  const [drugSafety, setDrugSafety] = useState<DrugSafety[]>([]);
  const [disclaimer, setDisclaimer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState(false);

  const updateDraft = (field: keyof SoapDraft, value: string) => {
    setDraft((current) => current ? { ...current, [field]: value } : current);
  };

  const analyseAudio = async () => {
    if (!audioFile) {
      setError('Select an MP3 or WAV visit recording first.');
      return;
    }

    setError('');
    setApplied(false);
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      const response = await fetch(`${API_BASE_URL}/api/visit-audio`, {
        method: 'POST',
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.detail || 'The AI Scribe request failed.');
      }

      const result = payload as AnalysisResult;
      setDraft(result.soap_note);
      setDrugSafety(result.drug_safety);
      setDisclaimer(result.disclaimer);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not contact the AI Scribe API.');
    } finally {
      setIsProcessing(false);
    }
  };

  const applyReviewedDraft = () => {
    if (!draft) return;
    const notes = [
      patient.notes.trim(),
      draft.objective.trim() && `AI Scribe draft — Objective:\n${draft.objective.trim()}`,
      draft.plan.trim() && `AI Scribe draft — Plan:\n${draft.plan.trim()}`,
    ].filter(Boolean).join('\n\n');

    onApplyReviewedDraft({
      cc: draft.chief_complaint,
      presentHistory: draft.subjective,
      dx: draft.assessment,
      notes,
    });
    setApplied(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5" id="workspace-ai-scribe">
      <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-6 rounded-xl shadow-sm border border-indigo-800">
        <div className="flex gap-3 items-start">
          <div className="p-2 rounded-lg bg-indigo-500/25"><AudioLines className="w-6 h-6 text-indigo-200" /></div>
          <div>
            <h2 className="text-xl font-bold">AI Scribe — Clinician Review Workspace</h2>
            <p className="text-sm text-indigo-100/80 mt-1">Upload a demo visit recording to create an editable SOAP documentation draft and informational OpenFDA lookup results.</p>
          </div>
        </div>
        <div className="mt-4 bg-amber-300/15 border border-amber-200/30 text-amber-100 p-3 rounded text-xs flex gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Not for diagnosis, prescribing, dose selection, or emergency triage. Review every field before applying it; never upload real patient recordings to this prototype.</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
        <h3 className="font-bold text-slate-800 text-sm">1. Upload visit audio</h3>
        <p className="text-xs text-slate-500 mt-1">Current patient: <strong>{patient.name}</strong> (Reg. #{patient.regNo})</p>
        <div className="mt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <label className="cursor-pointer w-full sm:w-auto inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-4 py-2 rounded text-sm font-semibold text-slate-700">
            <FileAudio className="w-4 h-4" />
            Select MP3 or WAV
            <input type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,.mp3,.wav" className="hidden" onChange={(event) => setAudioFile(event.target.files?.[0] || null)} />
          </label>
          <span className="text-xs text-slate-500 truncate max-w-full">{audioFile ? audioFile.name : 'No file selected'}</span>
          <button onClick={analyseAudio} disabled={isProcessing || !audioFile} className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-sm font-bold px-4 py-2 rounded shadow-sm">
            {isProcessing ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <AudioLines className="w-4 h-4" />}
            {isProcessing ? 'Processing recording…' : 'Create draft'}
          </button>
        </div>
        <p className="text-[11px] text-slate-400 mt-3">API: {API_BASE_URL} · The Python AI backend must be running before processing.</p>
        {error && <p className="mt-3 p-3 rounded bg-rose-50 text-rose-700 border border-rose-200 text-sm">{error}</p>}
      </div>

      {draft && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
            <div className="flex flex-wrap justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">2. Review and edit extracted draft</h3>
                <p className="text-xs text-slate-500 mt-1">Nothing is added to the prescription until you select “Apply reviewed draft”.</p>
              </div>
              <span className="self-start bg-amber-100 text-amber-800 border border-amber-200 px-2 py-1 rounded text-xs font-bold">Recorded urgency: {draft.urgency_patient}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {([
                ['chief_complaint', 'Chief complaint → C/C'],
                ['subjective', 'Subjective → Present history'],
                ['objective', 'Objective → Notes'],
                ['assessment', 'Assessment → Dx'],
                ['plan', 'Plan → Notes'],
              ] as const).map(([field, label]) => (
                <label key={field} className="block text-xs font-bold text-slate-600">
                  {label}
                  <textarea value={draft[field]} onChange={(event) => updateDraft(field, event.target.value)} rows={field === 'subjective' || field === 'plan' ? 5 : 3} className="mt-1 w-full text-sm font-normal text-slate-800 border border-slate-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </label>
              ))}
            </div>
            <button onClick={applyReviewedDraft} className="mt-5 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2 rounded shadow-sm">
              <CheckCircle2 className="w-4 h-4" /> Apply reviewed draft to current patient
            </button>
            {applied && <p className="mt-3 text-sm font-semibold text-emerald-700">Draft applied. Review the Prescription tab and save the visit when ready.</p>}
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-amber-600" /> 3. Informational drug-label lookup</h3>
            <p className="text-xs text-slate-500 mt-1">Mentioned medicine names are not automatically added to the prescription.</p>
            {drugSafety.length === 0 ? <p className="mt-3 text-sm text-slate-500">No medicine names were extracted from the recording.</p> : (
              <div className="mt-3 space-y-3">
                {drugSafety.map((result) => (
                  <div key={result.drug_name} className={`p-3 rounded border text-sm ${result.status === 'boxed_warning' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <strong>{result.drug_name}</strong> <span className="uppercase text-[10px] font-bold ml-1">{result.status.replaceAll('_', ' ')}</span>
                    <p className="mt-1 text-xs leading-relaxed">{result.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 border-l-4 border-amber-400 bg-amber-50 p-3">{disclaimer}</p>
        </div>
      )}
    </div>
  );
}
