import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import config from '../../config';
import { Badge } from '../common/Badge';
import { LeadActionDrawer } from './LeadActionDrawer';
import { AddLeadModal } from './AddLeadModal';
import {
  FiTarget,
  FiSearch,
  FiDownload,
  FiPlus,
  FiChevronRight,
  FiUsers,
  FiCalendar,
  FiClock,
  FiPhone,
  FiLayers,
  FiCheckCircle,
  FiMail,
  FiTrash2,
  FiAlertTriangle
} from 'react-icons/fi';
import { FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';

export const LeadsView = () => {
  const {
    filteredLeads,
    leadsSubTab,
    setLeadsSubTab,
    users,
    exportLeadsCSV,
    deleteLead,
    bulkDeleteLeads
  } = useApp();

  const [selectedLead, setSelectedLead] = useState(null);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');

  // SubTab counts
  const allCount = filteredLeads.length;
  const newCount = filteredLeads.filter(l => l.status === 'new').length;
  const demoCount = filteredLeads.filter(l => l.demoStatus === 'scheduled' || l.status === 'qualified').length;
  const enterpriseCount = filteredLeads.filter(l =>
    (l.employeeCount || '').includes('50-200') ||
    (l.employeeCount || '').includes('200-500') ||
    (l.employeeCount || '').includes('500+')
  ).length;

  // Filtered Leads
  const processedLeads = useMemo(() => {
    return filteredLeads.filter(lead => {
      // 1. SubTab filter
      if (leadsSubTab === 'new' && lead.status !== 'new') return false;
      if (leadsSubTab === 'demos' && lead.demoStatus !== 'scheduled' && lead.status !== 'qualified') return false;
      if (leadsSubTab === 'old' && lead.status === 'new') return false;

      // 2. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          (lead.fullName || '').toLowerCase().includes(q) ||
          (lead.company || '').toLowerCase().includes(q) ||
          (lead.email || '').toLowerCase().includes(q) ||
          (lead.phone || '').includes(q) ||
          (lead.campaignName || '').toLowerCase().includes(q) ||
          (lead.jobTitle || '').toLowerCase().includes(q);
        if (!matches) return false;
      }

      // 3. Source filter
      if (sourceFilter !== 'all' && lead.source !== sourceFilter) return false;

      // 4. Status filter
      if (statusFilter !== 'all' && lead.status !== statusFilter) return false;

      // 5. Size filter
      if (sizeFilter !== 'all' && !(lead.employeeCount || '').includes(sizeFilter)) return false;

      // 6. Module filter
      if (moduleFilter !== 'all' && !(lead.hrmsModules || []).some(m => m.toLowerCase().includes(moduleFilter.toLowerCase()))) return false;

      return true;
    });
  }, [filteredLeads, leadsSubTab, searchQuery, sourceFilter, statusFilter, sizeFilter, moduleFilter]);

  const statusVariantMap = {
    new: 'emerald',
    contacted: 'blue',
    qualified: 'purple',
    proposal: 'amber',
    won: 'emerald',
    closed: 'emerald',
    lost: 'rose',
  };

  const totalPipelineValuation = useMemo(() => {
    return filteredLeads.reduce((acc, curr) => acc + (curr.estimatedValue || 150000), 0);
  }, [filteredLeads]);

  const isAllSelected =
    processedLeads.length > 0 &&
    processedLeads.every((l) => selectedLeadIds.includes(l.id || l._id));

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeadIds(processedLeads.map((l) => l.id || l._id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleToggleSelectLead = (id, e) => {
    e.stopPropagation();
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirmSingleDelete = async () => {
    if (!leadToDelete) return;
    const targetId = leadToDelete.id || leadToDelete._id;
    try {
      setIsDeleting(true);
      await deleteLead(targetId);
      setSelectedLeadIds((prev) => prev.filter((id) => id !== targetId));
      if (selectedLead && (selectedLead.id === targetId || selectedLead._id === targetId)) {
        setSelectedLead(null);
      }
      setLeadToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (!selectedLeadIds.length) return;
    try {
      setIsDeleting(true);
      await bulkDeleteLeads(selectedLeadIds);
      if (selectedLead && (selectedLeadIds.includes(selectedLead.id) || selectedLeadIds.includes(selectedLead._id))) {
        setSelectedLead(null);
      }
      setSelectedLeadIds([]);
      setIsBulkDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* HRMS Inbound Intelligence KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Total Leads */}
        <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-750 shadow-panel">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Total Inbound Meta Leads</span>
            <FiTarget className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-100">{allCount}</span>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              ₹{(totalPipelineValuation / 100000).toFixed(1)}L Pipeline
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Direct Facebook & Instagram Ad conversions</p>
        </div>

        {/* Metric 2: New Active Leads */}
        <div className="p-3.5 rounded-xl bg-navy-900 border border-emerald-500/30 shadow-panel bg-gradient-to-br from-emerald-950/20 to-navy-900">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-xs font-semibold">New Leads (SLA Alert)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-300">{newCount}</span>
            <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              Needs Immediate Call
            </span>
          </div>
          <p className="text-[10px] text-emerald-400/80 mt-1">Requires contact within 15-minute SLA</p>
        </div>

        {/* Metric 3: Enterprise Prospects */}
        <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-750 shadow-panel">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Enterprise & Mid-Market</span>
            <FiUsers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-300">{enterpriseCount}</span>
            <span className="text-xs text-slate-400">50+ to 500+ Headcount</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">High annual license value opportunities</p>
        </div>

        {/* Metric 4: Demos Scheduled */}
        <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-750 shadow-panel">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Live Demos Booked</span>
            <FiCalendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-300">{demoCount}</span>
            <span className="text-xs text-slate-400">Product Walkthroughs</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Payroll & Biometric walkthrough slots confirmed</p>
        </div>
      </div>

      {/* Top Header & Segmented Queue Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-navy-900 border border-navy-750 p-3.5 rounded-xl shadow-panel">
        {/* Segmented Control Header: [ All Leads | New Inbound | Demos Booked | Contacted ] */}
        <div className="flex items-center p-1 bg-navy-950 rounded-lg border border-navy-800 self-start sm:self-auto flex-wrap gap-1">
          <button
            onClick={() => setLeadsSubTab('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors ${leadsSubTab === 'all'
                ? 'bg-navy-800 text-white font-semibold shadow-subtle border border-navy-700'
                : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <span>All HRMS Inquiries</span>
            <span className="text-[10px] px-1.5 rounded font-mono bg-navy-900 text-slate-300">
              {allCount}
            </span>
          </button>

          <button
            onClick={() => setLeadsSubTab('new')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors ${leadsSubTab === 'new'
                ? 'bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800/60'
                : 'text-emerald-400/90 hover:text-emerald-300'
              }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>New Leads (Active SLA)</span>
            <span className="text-[10px] px-1.5 rounded font-mono bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
              {newCount}
            </span>
          </button>

          <button
            onClick={() => setLeadsSubTab('demos')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors ${leadsSubTab === 'demos'
                ? 'bg-purple-950 text-purple-300 font-semibold border border-purple-800/60'
                : 'text-purple-400/90 hover:text-purple-300'
              }`}
          >
            <FiCalendar className="w-3 h-3" />
            <span>Demos Booked</span>
            <span className="text-[10px] px-1.5 rounded font-mono bg-purple-900/60 text-purple-300 border border-purple-700/50">
              {demoCount}
            </span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportLeadsCSV(processedLeads)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-200 text-xs font-semibold border border-navy-700 transition-colors"
            title="Export filtered leads to CSV"
          >
            <FiDownload className="w-3.5 h-3.5 text-sky-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddLeadOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-subtle transition-colors cursor-pointer"
          >
            <FiPlus className="w-3.5 h-3.5" />
            <span>Capture HRMS Lead</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 bg-navy-900 border border-navy-750 p-3 rounded-xl shadow-panel text-xs">
        {/* Search */}
        <div className="lg:col-span-4 relative">
          <FiSearch className="absolute left-3 top-2.5 text-slate-400 w-3.5 h-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by company, HR manager, email, phone..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-navy-800 border border-navy-700 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Company Size Filter */}
        <div className="lg:col-span-2">
          <select
            value={sizeFilter}
            onChange={e => setSizeFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-navy-800 border border-navy-700 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Workforce Sizes</option>
            <option value="1-20">1-20 Emps (Startup)</option>
            <option value="20-50">20-50 Emps</option>
            <option value="50-200">50-200 Emps (Mid-Market)</option>
            <option value="200-500">200-500 Emps (Enterprise)</option>
            <option value="500+">500+ Emps (Large Enterprise)</option>
          </select>
        </div>

        {/* Module Filter */}
        <div className="lg:col-span-3">
          <select
            value={moduleFilter}
            onChange={e => setModuleFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-navy-800 border border-navy-700 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="all">All HRMS Modules</option>
            <option value="Payroll">Payroll & Tax Compliance</option>
            <option value="Attendance">Biometric & GPS Attendance</option>
            <option value="Mobile App">Employee Mobile App (ESS)</option>
            <option value="Performance">Performance (PMS / OKRs)</option>
            <option value="Recruitment">Recruitment & ATS</option>
          </select>
        </div>

        {/* Source Filter */}
        <div className="lg:col-span-3">
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-navy-800 border border-navy-700 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Meta Ad Sources</option>
            <option value="Facebook Instant Form">Facebook Instant Form</option>
            <option value="Instagram Lead Ad">Instagram Lead Ad</option>
            <option value="WhatsApp Click-to-Chat">WhatsApp Click-to-Chat</option>
          </select>
        </div>
      </div>

      {/* Bulk Delete / Selection Action Bar */}
      {selectedLeadIds.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 shadow-lg text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 text-rose-200">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-bold text-sm text-white">{selectedLeadIds.length}</span>
            <span className="text-rose-200/90 font-medium">
              lead{selectedLeadIds.length > 1 ? 's' : ''} selected {leadsSubTab === 'new' ? 'in New Leads queue' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedLeadIds([])}
              className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-300 font-medium transition-colors border border-navy-700"
            >
              Deselect All
            </button>
            <button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-md transition-colors cursor-pointer"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedLeadIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* HRMS Inbound Leads Receiving Table */}
      <div className="bg-navy-900 border border-navy-750 rounded-xl overflow-hidden shadow-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 uppercase font-mono text-[10px] border-b border-navy-750">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="rounded border-navy-700 bg-navy-800 text-rose-500 focus:ring-0 focus:ring-offset-0 cursor-pointer w-3.5 h-3.5"
                    title="Select all visible leads"
                  />
                </th>
                <th className="py-3 px-4">Organization & Headcount</th>
                <th className="py-3 px-4">Applicant / Contact Info</th>
                <th className="py-3 px-4">Modules & Requirements</th>
                <th className="py-3 px-4">Meta Attribution</th>
                <th className="py-3 px-4">Demo / Pipeline Stage</th>
                <th className="py-3 px-4">Annual License Value</th>
                <th className="py-3 px-4 text-right">Instant Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {processedLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FiTarget className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-300">No HRMS leads found matching your filter</p>
                    <p className="text-[11px] text-slate-500 mt-1">Try resetting the workforce size or module filters</p>
                  </td>
                </tr>
              ) : (
                processedLeads.map(lead => {
                  const isInstagram = (lead.source || '').includes('Instagram');
                  const isFacebook = (lead.source || '').includes('Facebook');
                  const isTestLead = Boolean(
                    lead.isTestingLead ||
                    (lead.tags || []).includes('Meta Testing Tool') ||
                    (lead.source || '').toLowerCase().includes('testing tool') ||
                    (lead.metaLeadId && String(lead.metaLeadId).startsWith('test:')) ||
                    lead.testingToolRemark
                  );
                  const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
                  const whatsappMsg = encodeURIComponent(
                    `Hello ${lead.fullName}, thank you for inquiring about our HRMS Software for ${lead.company}!\n\nWe saw you are looking for ${(lead.hrmsModules || ['Payroll & Attendance']).slice(0, 2).join(' & ')} for your ${lead.employeeCount || 'team'}.\n\nWhen would be a good time for a 15-minute live product walkthrough?`
                  );

                  return (
                    <tr
                      key={lead.id || lead._id}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-navy-800/50 transition-colors cursor-pointer group"
                    >
                      {/* Selection Checkbox */}
                      <td className="py-3 px-3 text-center" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedLeadIds.includes(lead.id || lead._id)}
                          onChange={e => handleToggleSelectLead(lead.id || lead._id, e)}
                          className="rounded border-navy-700 bg-navy-800 text-rose-500 focus:ring-0 focus:ring-offset-0 cursor-pointer w-3.5 h-3.5"
                        />
                      </td>
                      {/* Organization & Headcount */}
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-navy-800 border border-navy-700 flex items-center justify-center font-bold text-sky-400 text-xs shrink-0 mt-0.5">
                            {lead.company ? lead.company.substring(0, 2).toUpperCase() : 'CO'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-100 group-hover:text-sky-300 transition-colors flex items-center gap-1.5">
                              <span>{lead.company}</span>
                              {lead.status === 'new' && (
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              )}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold flex items-center gap-1">
                                <FiUsers className="w-2.5 h-2.5" />
                                <span>{lead.employeeCount || '20-50 emps'}</span>
                              </span>
                              <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                                {lead.currentSystem || 'Excel'}
                              </span>
                            </div>
                            {isTestLead && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold block mt-1 w-fit">
                                🧪 TEST TOOL LEAD
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* HR Decision Maker / Applicant Info */}
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-bold text-slate-100">{lead.fullName}</p>
                          <p className="text-[11px] text-slate-400 font-medium">{lead.jobTitle || 'HR Manager'}</p>
                          <div className="flex items-center gap-1.5 text-[11px] text-sky-400 font-mono mt-1">
                            <FiPhone className="w-3 h-3 text-sky-400 shrink-0" />
                            <a href={`tel:${lead.phone}`} onClick={e => e.stopPropagation()} className="hover:underline">
                              {lead.phone || 'No phone'}
                            </a>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono mt-0.5">
                            <FiMail className="w-3 h-3 text-emerald-400 shrink-0" />
                            <a href={`mailto:${lead.email}`} onClick={e => e.stopPropagation()} className="hover:underline truncate max-w-[170px]" title={lead.email}>
                              {lead.email || 'No email'}
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* HRMS Modules & Requirements */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {(lead.hrmsModules || ['Payroll & Compliance', 'Attendance & Leave']).map((mod, idx) => {
                            const shortLabel = mod
                              .replace('Automated ', '')
                              .replace('Statutory ', '')
                              .replace('Management ', '');
                            return (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-navy-800 border border-navy-700 text-slate-300"
                              >
                                {shortLabel}
                              </span>
                            );
                          })}
                        </div>
                        {(lead.requirements || lead.rawFieldData?.primary_interest) && (
                          <div className="mt-1.5 text-[10px] text-amber-200/90 bg-amber-500/10 border border-amber-500/25 rounded px-2 py-1 line-clamp-2 max-w-[220px]" title={lead.requirements || lead.rawFieldData?.primary_interest}>
                            <span className="font-semibold text-amber-300">Requires: </span>
                            {lead.requirements || lead.rawFieldData?.primary_interest}
                          </div>
                        )}
                      </td>

                      {/* Meta Attribution */}
                      <td className="py-3 px-4">
                        {isTestLead ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs shrink-0">🧪</span>
                            <div className="min-w-0">
                              <span className="font-bold text-amber-300 block text-[11px] truncate">Meta Testing Tool</span>
                              <span className="text-[10px] text-slate-400 truncate block max-w-[150px]">Test Webhook Verified</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {isInstagram ? (
                              <FaInstagram className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                            ) : (
                              <FaFacebook className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <span className="font-medium text-slate-200 block text-[11px] truncate">
                                {lead.source}
                              </span>
                              <span className="text-[10px] text-slate-400 truncate block max-w-[160px]">
                                {lead.campaignName}
                              </span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Demo / Pipeline Stage */}
                      <td className="py-3 px-4">
                        <Badge variant={statusVariantMap[lead.status] || 'slate'} size="sm" dot={lead.status === 'new'}>
                          {lead.status.toUpperCase()}
                        </Badge>
                        {lead.demoStatus === 'scheduled' && (
                          <span className="text-[10px] font-mono text-purple-400 block mt-0.5">
                            Demo: {lead.demoPreferredDate || 'Confirmed'}
                          </span>
                        )}
                      </td>

                      {/* Annual License Valuation */}
                      <td className="py-3 px-4 font-mono">
                        <span className="font-bold text-emerald-400 block">
                          ₹{(lead.estimatedValue || 150000).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-sans">
                          Score: {lead.score || 85}/100
                        </span>
                      </td>

                      {/* Quick Action */}
                      <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1-Click WhatsApp Pitch */}
                          <a
                            href={`${config.integrations.whatsappBaseUrl}/${cleanPhone}?text=${whatsappMsg}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-colors"
                            title="Instant WhatsApp Pitch"
                          >
                            <FaWhatsapp className="w-3.5 h-3.5" />
                          </a>

                          {/* Open Dossier */}
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 border border-navy-700 transition-colors"
                            title="View Full HRMS Lead Dossier"
                          >
                            <FiChevronRight className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Lead Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setLeadToDelete(lead);
                            }}
                            className="p-1.5 rounded-lg bg-navy-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-navy-700 hover:border-rose-500/30 transition-colors cursor-pointer"
                            title="Delete Lead"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out HRMS Lead Intelligence Drawer */}
      <LeadActionDrawer
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        lead={selectedLead}
      />

      {/* Manual HRMS Lead Ingestion Modal */}
      <AddLeadModal
        isOpen={isAddLeadOpen}
        onClose={() => setIsAddLeadOpen(false)}
      />

      {/* Single Lead Delete Confirmation Modal */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-navy-900 border border-navy-750 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                <FiAlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Delete Lead Record</h3>
                <p className="text-xs text-slate-400 mt-0.5">This action is permanent and cannot be undone.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-navy-950/80 border border-navy-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Lead Name:</span>
                <span className="font-semibold text-slate-200">{leadToDelete.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Organization:</span>
                <span className="font-semibold text-slate-200">{leadToDelete.company || 'N/A'}</span>
              </div>
              {leadToDelete.email && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-mono text-slate-300">{leadToDelete.email}</span>
                </div>
              )}
              {leadToDelete.phone && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-mono text-slate-300">{leadToDelete.phone}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setLeadToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 text-xs font-semibold border border-navy-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Lead'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-navy-900 border border-navy-750 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                <FiAlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Delete Selected Leads</h3>
                <p className="text-xs text-slate-400 mt-0.5">Bulk permanent removal</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-rose-300 font-bold">{selectedLeadIds.length}</strong> selected lead(s)? All interaction history, form responses, and notes will be permanently removed.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 text-xs font-semibold border border-navy-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : `Delete All (${selectedLeadIds.length})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsView;
