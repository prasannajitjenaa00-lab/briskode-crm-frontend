import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import config from '../../config';
import { Drawer } from '../common/Drawer';
import { Badge } from '../common/Badge';
import {
  FiTarget,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiUsers,
  FiClock,
  FiFileText,
  FiExternalLink,
  FiLayers
} from 'react-icons/fi';
import { FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';

export const LeadActionDrawer = ({ isOpen, onClose, lead }) => {
  const {
    updateLeadStatus,
    assignLead,
    toggleLeadFollowUp,
    toggleLeadPipelineCategory,
    users,
    addToast
  } = useApp();

  const [activeDrawerTab, setActiveDrawerTab] = useState('overview'); // 'overview' | 'meta_payload' | 'demo'
  const [newNote, setNewNote] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [demoDate, setDemoDate] = useState(lead?.demoPreferredDate || 'Tomorrow, 3:00 PM');
  const [demoStatus, setDemoStatus] = useState(lead?.demoStatus || 'requested');

  if (!lead) return null;

  const statusVariantMap = {
    new: 'emerald',
    contacted: 'blue',
    qualified: 'purple',
    proposal: 'amber',
    won: 'emerald',
    closed: 'emerald',
    lost: 'rose',
  };

  const handleStatusChange = (status) => {
    updateLeadStatus(lead.id, status);
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    updateLeadStatus(lead.id, lead.status, newNote);
    setNewNote('');
  };

  const handleSimulateCall = () => {
    setIsCalling(true);
    setTimeout(() => {
      setIsCalling(false);
      updateLeadStatus(
        lead.id,
        'contacted',
        `HR Discovery call conducted with ${lead.fullName} (${lead.phone}). Confirmed ${lead.employeeCount || 'team'} size. Scheduled HRMS product walkthrough.`
      );
      addToast(`Call logged with ${lead.fullName}`, 'success', 'Call Completed');
    }, 1400);
  };

  const handleSaveDemo = (e) => {
    e.preventDefault();
    updateLeadStatus(
      lead.id,
      demoStatus === 'scheduled' ? 'qualified' : lead.status,
      `Live Demo updated: Status set to "${demoStatus.toUpperCase()}" for slot "${demoDate}".`
    );
    addToast('Demo schedule updated successfully', 'success', 'Demo Updated');
  };

  // Generate WhatsApp pitch URL
  const whatsappMessage = encodeURIComponent(
    `Hello ${lead.fullName}, thank you for inquiring about our HRMS Software for ${lead.company} via Meta Ads!\n\nWe noted your interest in ${(lead.hrmsModules || ['Payroll & Attendance']).join(', ')} for your ${lead.employeeCount || 'organization'}.\n\nWould you be open for a quick 15-minute live demo today or tomorrow to see how we automate payroll & attendance?`
  );
  const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
  const whatsappUrl = `${config.integrations.whatsappBaseUrl}/${cleanPhone}?text=${whatsappMessage}`;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={lead.fullName}
      subtitle={`${lead.company} • ${lead.jobTitle || 'HR Manager'} • Ingested ${new Date(lead.dateCaptured).toLocaleString()}`}
      width="xl"
      icon={FiTarget}
    >
      <div className="space-y-4 text-xs">
        {/* Top Status & Lead Value Bar */}
        <div className="p-3.5 rounded-xl bg-navy-850 border border-navy-750 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Badge variant={statusVariantMap[lead.status] || 'slate'} size="md" dot={lead.status === 'new'}>
                STATUS: {lead.status.toUpperCase()}
              </Badge>
              {lead.employeeCount && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 font-semibold flex items-center gap-1">
                  <FiUsers className="w-3 h-3" />
                  <span>{lead.employeeCount}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 font-mono">
              <span className="text-slate-400">Est. Contract:</span>
              <span className="font-bold text-emerald-400 text-sm">
                ₹{(lead.estimatedValue || 150000).toLocaleString('en-IN')}/yr
              </span>
            </div>
          </div>

          {/* Quick Action Trigger Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-navy-750">
            {/* WhatsApp Quick Pitch */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold transition-colors"
            >
              <FaWhatsapp className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp Pitch</span>
            </a>

            {/* Quick Call */}
            <button
              onClick={handleSimulateCall}
              disabled={isCalling}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 font-semibold transition-colors disabled:opacity-50"
            >
              <FiPhone className="w-3.5 h-3.5 text-sky-400" />
              <span>{isCalling ? 'Dialing...' : 'Call Contact'}</span>
            </button>

            {/* Schedule Demo */}
            <button
              onClick={() => setActiveDrawerTab('demo')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold transition-colors"
            >
              <FiCalendar className="w-3.5 h-3.5 text-purple-400" />
              <span>Book Demo</span>
            </button>

            {/* Meta Form Data */}
            <button
              onClick={() => setActiveDrawerTab('meta_payload')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold transition-colors"
            >
              <FiFileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Meta Payload</span>
            </button>
          </div>
        </div>

        {/* Drawer Tabs */}
        <div className="flex items-center gap-2 border-b border-navy-750 pb-2">
          <button
            onClick={() => setActiveDrawerTab('overview')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${activeDrawerTab === 'overview'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800'
              }`}
          >
            HRMS Profile & Requirements
          </button>
          <button
            onClick={() => setActiveDrawerTab('demo')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${activeDrawerTab === 'demo'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800'
              }`}
          >
            Demo Scheduling
          </button>
          <button
            onClick={() => setActiveDrawerTab('meta_payload')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${activeDrawerTab === 'meta_payload'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800'
              }`}
          >
            Meta Ad Form Answers
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeDrawerTab === 'overview' && (
          <div className="space-y-4">
            {/* HR Requirements Profile */}
            <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-750 space-y-3">
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FiLayers className="text-purple-400" />
                <span>Requested HRMS Modules</span>
              </p>

              <div className="flex flex-wrap gap-1.5">
                {(lead.hrmsModules || ['Automated Payroll & Statutory Compliance', 'Biometric Attendance']).map(
                  (mod, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-purple-950/70 text-purple-200 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <FiCheck className="text-purple-400" />
                      <span>{mod}</span>
                    </span>
                  )
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-navy-800">
                <div>
                  <span className="text-slate-400 text-[11px] block">Current HR System</span>
                  <span className="text-slate-200 font-medium">{lead.currentSystem || 'Manual Excel Spreadsheets'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Implementation Timeline</span>
                  <span className="text-slate-200 font-medium">{lead.implementationTimeline || 'Within 15 Days'}</span>
                </div>
              </div>
            </div>

            {/* Decision Maker Contact Card */}
            <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-750 space-y-2.5">
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                HR Contact Information
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <FiMail className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`mailto:${lead.email}`} className="hover:text-brand-400 truncate">
                    {lead.email || 'No email provided'}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <FiPhone className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`tel:${lead.phone}`} className="hover:text-brand-400 truncate">
                    {lead.phone || 'No phone provided'}
                  </a>
                </div>
              </div>
            </div>

            {/* Pipeline Stage Transitions */}
            <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-750 space-y-2">
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Move Pipeline Stage
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${lead.status === st
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-navy-800 text-slate-400 hover:text-slate-200 hover:bg-navy-750'
                      }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DEMO SCHEDULING */}
        {activeDrawerTab === 'demo' && (
          <form onSubmit={handleSaveDemo} className="p-3.5 rounded-xl bg-navy-900 border border-navy-750 space-y-3">
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FiCalendar className="text-purple-400" />
              <span>Live HRMS Product Walkthrough Booking</span>
            </p>

            <div>
              <label className="block text-slate-400 mb-1">Demo Stage Status</label>
              <select
                value={demoStatus}
                onChange={(e) => setDemoStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-navy-800 border border-navy-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="requested">Demo Requested by Client</option>
                <option value="scheduled">Demo Scheduled & Confirmed</option>
                <option value="completed">Demo Completed</option>
                <option value="proposal_sent">Proposal / Commercials Sent</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Preferred Demo Date & Time</label>
              <input
                type="text"
                value={demoDate}
                onChange={(e) => setDemoDate(e.target.value)}
                placeholder="e.g. Wednesday, 11:30 AM"
                className="w-full px-3 py-2 rounded-lg bg-navy-800 border border-navy-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors"
            >
              Update Demo Schedule
            </button>
          </form>
        )}

        {/* TAB 3: META AD FORM PAYLOAD */}
        {activeDrawerTab === 'meta_payload' && (
          <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-750 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                {lead.source.includes('Instagram') ? (
                  <FaInstagram className="text-pink-400" />
                ) : (
                  <FaFacebook className="text-blue-400" />
                )}
                <span>Meta Instant Form Ingestion Data</span>
              </p>
              <span className="text-[10px] font-mono text-slate-400">{lead.source}</span>
            </div>

            <div className="space-y-2 bg-navy-950 p-3 rounded-lg border border-navy-800 font-mono text-xs">
              <div>
                <span className="text-slate-500">Meta Lead ID: </span>
                <span className="text-sky-300">{lead.metaLeadId || 'leadgen_meta_manual'}</span>
              </div>
              <div>
                <span className="text-slate-500">Meta Form ID: </span>
                <span className="text-slate-300">{lead.metaFormId || 'form_hrms_default'}</span>
              </div>
              <div>
                <span className="text-slate-500">Ad Campaign: </span>
                <span className="text-emerald-300">{lead.campaignName}</span>
              </div>
            </div>

            {lead.rawFieldData && typeof lead.rawFieldData === 'object' ? (
              <div className="space-y-2 pt-2 border-t border-navy-800">
                <p className="text-[11px] font-semibold text-slate-300">Custom Form Questions Answered:</p>
                <div className="space-y-2">
                  {Object.entries(lead.rawFieldData).map(([key, val]) => (
                    <div key={key} className="bg-navy-850 p-2.5 rounded-lg border border-navy-750">
                      <p className="text-[10px] uppercase font-mono text-slate-400">{key.replace(/_/g, ' ')}</p>
                      <p className="text-slate-100 font-medium mt-0.5">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-xs italic">No raw Meta field answers recorded for this entry.</p>
            )}
          </div>
        )}

        {/* Activity & Interactions History */}
        <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-750 space-y-3">
          <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            Interactions & Outreach History ({lead.interactions?.length || 0})
          </p>

          <form onSubmit={handleAddNote} className="flex gap-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add discovery note, pricing objection, or call update..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-navy-800 border border-navy-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors"
            >
              Log
            </button>
          </form>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {(lead.interactions || []).map((item, index) => (
              <div key={item._id || index} className="p-2.5 rounded-lg bg-navy-850 border border-navy-800">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="font-semibold text-slate-300 uppercase font-mono">{item.type}</span>
                  <span>{new Date(item.date).toLocaleString()}</span>
                </div>
                <p className="text-slate-200">{item.note}</p>
                <p className="text-[10px] text-slate-500 mt-1">Logged by: {item.performedBy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default LeadActionDrawer;
