import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { FiTarget, FiUsers, FiCalendar, FiDollarSign, FiCheck } from 'react-icons/fi';

const HRMS_MODULE_OPTIONS = [
  'Automated Payroll & Statutory Compliance',
  'Biometric & GPS Attendance / Leave',
  'Employee Mobile App (ESS)',
  'Performance Management & OKRs (PMS)',
  'Recruitment & Applicant Tracking (ATS)',
  'Timesheets & Shift Rostering',
];

const COMPANY_SIZE_OPTIONS = [
  '1-20 employees (Startup / Micro)',
  '20-50 employees (Growing Business)',
  '50-200 employees (Mid-Market)',
  '200-500 employees (Upper Mid-Market)',
  '500+ employees (Enterprise)',
];

export const AddLeadModal = ({ isOpen, onClose }) => {
  const { addLead, campaigns, currentUser } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [employeeCount, setEmployeeCount] = useState('20-50 employees (Growing Business)');
  const [jobTitle, setJobTitle] = useState('HR Manager');
  const [selectedModules, setSelectedModules] = useState([
    'Automated Payroll & Statutory Compliance',
    'Biometric & GPS Attendance / Leave',
  ]);
  const [currentSystem, setCurrentSystem] = useState('Manual Excel Spreadsheets');
  const [implementationTimeline, setImplementationTimeline] = useState('Immediate (within 15 days)');
  const [demoPreferredDate, setDemoPreferredDate] = useState('Tomorrow, 3:00 PM');
  const [source, setSource] = useState('Facebook Instant Form');
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id || '');
  const [estimatedValue, setEstimatedValue] = useState(180000);
  const [notes, setNotes] = useState('');

  const toggleModule = (mod) => {
    setSelectedModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim() || !company.trim()) return;

    const selectedCampaign = campaigns.find((c) => c.id === campaignId);

    addLead({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || '+91 98000 00000',
      company: company.trim(),
      employeeCount,
      jobTitle,
      hrmsModules: selectedModules.length > 0 ? selectedModules : ['Automated Payroll & Statutory Compliance'],
      currentSystem,
      implementationTimeline,
      demoStatus: 'requested',
      demoPreferredDate,
      source,
      campaignId: campaignId || 'cmp_hrms_01',
      campaignName: selectedCampaign?.name || 'Meta Ads: Inbound HRMS Ingestion',
      assignedAdminId: currentUser?.id,
      status: 'new',
      priority: employeeCount.includes('200') || employeeCount.includes('500') ? 'urgent' : 'high',
      estimatedValue: Number(estimatedValue),
      score: employeeCount.includes('200') ? 95 : 88,
      pipelineCategory: 'active',
      followUpRequired: true,
      nextFollowUpAction: 'Conduct Inbound HR Discovery Call & Needs Assessment',
      nextFollowUpDate: 'Today',
      notes: notes || `Inbound HRMS Lead captured. Looking for ${selectedModules.join(', ')} for ${employeeCount}.`,
    });

    onClose();
    // Reset form
    setFullName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setNotes('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Capture Inbound HRMS Lead"
      subtitle="Register a new prospect inquiry from Meta Ads for HRMS software."
      maxWidth="lg"
      icon={FiTarget}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Company & Organization Info */}
        <div className="p-3 bg-navy-900 border border-navy-800 rounded-xl space-y-3">
          <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <FiUsers className="text-sky-400" />
            <span>Organization & Workforce</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Company / Organization *</label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Apex Logistics Pvt Ltd"
                className="w-full px-3 py-2 rounded-lg bg-navy-800 border border-navy-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Workforce Headcount *</label>
              <select
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-navy-800 border border-navy-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
              >
                {COMPANY_SIZE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* HR Decision Maker Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Decision Maker Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="w-full px-3 py-2 rounded-lg bg-navy-800 border border-navy-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Job Title / Designation *</label>
            <select
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-navy-800 border border-navy-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
            >
              <option value="Head of Human Resources">Head of Human Resources</option>
              <option value="HR Manager">HR Manager</option>
              <option value="VP - People & Culture">VP - People & Culture</option>
              <option value="Founder / Managing Director">Founder / Managing Director</option>
              <option value="Payroll & Compliance Officer">Payroll & Compliance Officer</option>
              <option value="Operations Manager">Operations Manager</option>
            </select>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Official Work Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="priya@company.com"
              className="w-full px-3 py-2 rounded-lg bg-navy-800 border border-navy-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Phone / WhatsApp Number *</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98201 00000"
              className="w-full px-3 py-2 rounded-lg bg-navy-800 border border-navy-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* HRMS Modules Required (Checkboxes) */}
        <div>
          <label className="block font-semibold text-slate-300 mb-1.5">
            Core HRMS Modules Inquired ({selectedModules.length} selected)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {HRMS_MODULE_OPTIONS.map((mod) => {
              const isSelected = selectedModules.includes(mod);
              return (
                <button
                  type="button"
                  key={mod}
                  onClick={() => toggleModule(mod)}
                  className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all border ${isSelected
                      ? 'bg-purple-950/60 border-purple-500/50 text-purple-200'
                      : 'bg-navy-850 border-navy-750 text-slate-400 hover:text-slate-200'
                    }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${isSelected ? 'bg-purple-600 border-purple-400 text-white' : 'border-slate-600'
                      }`}
                  >
                    {isSelected && <FiCheck className="w-3 h-3" />}
                  </div>
                  <span className="text-[11px] font-medium leading-tight">{mod}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current HR System & Deal Valuation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Current HR System</label>
            <select
              value={currentSystem}
              onChange={(e) => setCurrentSystem(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-navy-800 border border-navy-700 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
            >
              <option value="Manual Excel Spreadsheets">Manual Excel Spreadsheets</option>
              <option value="Standalone Fingerprint Device">Standalone Fingerprint Device</option>
              <option value="Outdated Legacy Desktop Software">Outdated Legacy Software</option>
              <option value="Outsourced CA / Payroll Agency">Outsourced CA Agency</option>
              <option value="New Company / None">New Company / None</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Implementation Timeline</label>
            <select
              value={implementationTimeline}
              onChange={(e) => setImplementationTimeline(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-navy-800 border border-navy-700 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
            >
              <option value="Immediate (within 15 days)">Immediate (within 15 days)</option>
              <option value="This Month">This Month</option>
              <option value="Next Quarter">Next Quarter</option>
              <option value="Exploring Options">Exploring Options</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Est. Annual Value (₹)</label>
            <input
              type="number"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-navy-800 border border-navy-700 text-emerald-400 font-mono text-xs focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Demo Preference & Meta Source */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Preferred Demo Slot</label>
            <input
              type="text"
              value={demoPreferredDate}
              onChange={(e) => setDemoPreferredDate(e.target.value)}
              placeholder="e.g. Tomorrow, 3:00 PM"
              className="w-full px-3 py-2 rounded-lg bg-navy-800 border border-navy-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Meta Ad Ingestion Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-navy-800 border border-navy-700 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
            >
              <option value="Facebook Instant Form">Facebook Instant Form</option>
              <option value="Instagram Lead Ad">Instagram Lead Ad</option>
              <option value="WhatsApp Click-to-Chat">WhatsApp Click-to-Chat</option>
              <option value="Direct Website Demo Form">Direct Website Demo Form</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block font-semibold text-slate-300 mb-1">Initial Requirement Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special requirements (e.g. 3 branch attendance integration, shift rotations, custom payslip design)..."
            className="w-full px-3 py-2 rounded-lg bg-navy-800 border border-navy-700 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-navy-750">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-navy-800 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-subtle flex items-center gap-1.5 transition-colors"
          >
            <FiTarget className="w-3.5 h-3.5" />
            <span>Ingest HRMS Lead</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddLeadModal;
