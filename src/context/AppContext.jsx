import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  authApi,
  usersApi,
  campaignsApi,
  leadsApi,
  customersApi,
  invoicesApi,
  announcementsApi,
  notificationsApi,
  settingsApi,
  setAccessToken,
  getAccessToken,
  setRefreshToken,
  getRefreshToken,
  clearAuthStorage,
  setOnUnauthorized,
} from '../api';
import { connectSocket, disconnectSocket } from '../api/socket';
import config from '../config';

const STORAGE_PREFIX = config.app?.storagePrefix || 'meta_crm_';
const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  // ---- Auth / session ----
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(`${STORAGE_PREFIX}user`);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState(true);
  const [accessToken, setAccessTokenState] = useState(() => getAccessToken());
  const [isDataLoading, setIsDataLoading] = useState(false);

  // ---- Core data (hydrated from the API) ----
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [leads, setLeads] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [settings, setSettings] = useState({});
  const [notifications, setNotifications] = useState([]);

  // ---- Client-only UI state (kept exactly as before) ----
  const [activeTab, setActiveTab] = useState('dashboard');
  const [leadsSubTab, setLeadsSubTab] = useState('all');
  const [toasts, setToasts] = useState([]);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [theme, setThemeState] = useState(() => localStorage.getItem(`${STORAGE_PREFIX}theme`) || 'dark');

  // Toast helper
  const addToast = useCallback((message, type = 'info', title) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => removeToast(id), 4500);
  }, []);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const handleApiError = (err, fallback = 'Something went wrong') => {
    const message = err?.response?.data?.message || fallback;
    addToast(message, 'error', 'Error');
    throw err;
  };

  // Theme sync
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}theme`, theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  const setTheme = (mode) => setThemeState(mode);

  // ---- Bootstrapping: restore session on load (localStorage + refresh token fallback) ----
  useEffect(() => {
    (async () => {
      const startTime = Date.now();
      const storedToken = getAccessToken();
      const storedRefresh = getRefreshToken();

      try {
        if (storedToken) {
          try {
            const me = await authApi.getMe();
            setCurrentUser(me.data.data);
            localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(me.data.data));
          } catch (meErr) {
            if (storedRefresh) {
              const { data } = await authApi.refresh(storedRefresh);
              setAccessToken(data.data.accessToken);
              setAccessTokenState(data.data.accessToken);
              if (data.data.refreshToken) setRefreshToken(data.data.refreshToken);
              const me = await authApi.getMe();
              setCurrentUser(me.data.data);
              localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(me.data.data));
            } else {
              throw meErr;
            }
          }
        } else if (storedRefresh) {
          const { data } = await authApi.refresh(storedRefresh);
          setAccessToken(data.data.accessToken);
          setAccessTokenState(data.data.accessToken);
          if (data.data.refreshToken) setRefreshToken(data.data.refreshToken);
          const me = await authApi.getMe();
          setCurrentUser(me.data.data);
          localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(me.data.data));
        } else {
          // Fallback to cookie check if available
          const { data } = await authApi.refresh();
          setAccessToken(data.data.accessToken);
          setAccessTokenState(data.data.accessToken);
          if (data.data.refreshToken) setRefreshToken(data.data.refreshToken);
          const me = await authApi.getMe();
          setCurrentUser(me.data.data);
          localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(me.data.data));
        }
      } catch {
        clearAuthStorage();
        setCurrentUser(null);
        setAccessTokenState(null);
      } finally {
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, 300 - elapsed);
        setTimeout(() => {
          setAuthLoading(false);
        }, delay);
      }
    })();

    setOnUnauthorized(() => {
      clearAuthStorage();
      setCurrentUser(null);
      setAccessTokenState(null);
    });
  }, []);

  // Connect the realtime socket once we have a session
  useEffect(() => {
    if (!accessToken || !currentUser) return;
    const socket = connectSocket(accessToken);

    socket.on('lead:new', (newLead) => {
      setLeads((prev) => {
        const id = newLead.id || newLead._id;
        if (prev.some((l) => (l.id || l._id) === id)) return prev;
        return [{ ...newLead, id }, ...prev];
      });
      addToast(
        newLead.isTestingLead
          ? `🧪 Test Lead from Meta Testing Tool: ${newLead.company} (${newLead.fullName})`
          : `New Inbound Lead: ${newLead.company} (${newLead.fullName})`,
        'success',
        newLead.isTestingLead ? 'Meta Testing Tool Ingested' : 'New Lead Captured'
      );
    });
    socket.on('notification:new', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      addToast(notification.message, 'info', notification.title);
    });
    socket.on('announcement:new', (announcement) => {
      setAnnouncements((prev) => [announcement, ...prev]);
      addToast('New team broadcast published', 'info', announcement.title);
    });
    socket.on('whatsapp:inbound', () => {
      addToast('New WhatsApp message received', 'info', 'WhatsApp');
    });
    socket.on('broadcast:completed', (broadcast) => {
      addToast(`Broadcast "${broadcast.name}" completed`, 'success', 'Broadcast Completed');
    });

    return () => disconnectSocket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, currentUser]);

  // ---- Load all core collections once authenticated ----
  const refreshAll = useCallback(async () => {
    setIsDataLoading(true);
    try {
      const [usersRes, campaignsRes, leadsRes, customersRes, invoicesRes, announcementsRes, settingsRes, notificationsRes] =
        await Promise.all([
          usersApi.list(),
          campaignsApi.list({ limit: 200 }),
          leadsApi.list({ limit: 200 }),
          customersApi.list({ limit: 200 }),
          invoicesApi.list({ limit: 200 }),
          announcementsApi.list(),
          settingsApi.get(),
          notificationsApi.list(),
        ]);

      setUsers(usersRes.data.data);
      setCampaigns(campaignsRes.data.data);
      setLeads(leadsRes.data.data);
      setCustomers(customersRes.data.data);
      setInvoices(invoicesRes.data.data);
      setAnnouncements(announcementsRes.data.data);
      setSettings(settingsRes.data.data);
      setNotifications(notificationsRes.data.data.notifications);
    } catch (err) {
      addToast('Could not load data from the server', 'error', 'Load Failed');
    } finally {
      setIsDataLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentUser) refreshAll();
  }, [currentUser, refreshAll]);

  // ---- Auth actions ----
  const login = async (email, password) => {
    const { data } = await authApi.login(email, password);
    const newAccessToken = data.data.accessToken;
    const newRefreshToken = data.data.refreshToken;
    const user = data.data.user;

    setAccessToken(newAccessToken);
    setAccessTokenState(newAccessToken);
    if (newRefreshToken) setRefreshToken(newRefreshToken);
    localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(user));
    setCurrentUser(user);
    addToast(`Welcome back, ${user.name}`, 'success', 'Logged In');
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network error on logout
    } finally {
      clearAuthStorage();
      setAccessToken(null);
      setAccessTokenState(null);
      setCurrentUser(null);
      disconnectSocket();
      addToast('Logged out successfully', 'info', 'Session Ended');
    }
  };

  // Real JWT auth replaces the old client-side persona switcher.
  const switchPersona = () => {
    addToast('Persona switching is disabled — each admin now signs in with their own account.', 'info', 'Real Auth Enabled');
  };

  // ---- Admin CRUD ----
  const createAdmin = async (userData) => {
    try {
      const { data } = await usersApi.create(userData);
      setUsers((prev) => [...prev, data.data]);
      const tempPasswordNote = data.data.tempPassword ? ` Temp password: ${data.data.tempPassword}` : '';
      addToast(`Admin account created for ${data.data.name}.${tempPasswordNote}`, 'success', 'Admin Created');
    } catch (err) {
      handleApiError(err, 'Could not create admin');
    }
  };

  const updateAdmin = async (userId, updates) => {
    try {
      const { data } = await usersApi.update(userId, updates);
      setUsers((prev) => prev.map((u) => (u.id === userId ? data.data : u)));
      addToast('Admin profile updated successfully', 'success', 'Admin Updated');
    } catch (err) {
      handleApiError(err, 'Could not update admin');
    }
  };

  const deleteAdmin = async (userId, reassignToUserId) => {
    try {
      await usersApi.remove(userId, reassignToUserId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      await refreshAll(); // campaigns/leads/invoices/customers were reassigned server-side
      addToast('Removed admin. All owned records were safely reassigned.', 'warning', 'Admin Removed');
    } catch (err) {
      handleApiError(err, 'Could not remove admin');
    }
  };

  // ---- Campaigns ----
  const addCampaign = async (campaignData) => {
    try {
      const { data } = await campaignsApi.create(campaignData);
      setCampaigns((prev) => [data.data, ...prev]);
      addToast(`New Meta Ad Campaign "${data.data.name}" launched and assigned!`, 'success', 'Campaign Published');
    } catch (err) {
      handleApiError(err, 'Could not create campaign');
    }
  };

  const updateCampaign = async (campaignId, updates) => {
    try {
      const { data } = await campaignsApi.update(campaignId, updates);
      setCampaigns((prev) => prev.map((c) => (c.id === campaignId ? data.data : c)));
      addToast('Campaign parameters updated successfully', 'success', 'Campaign Updated');
    } catch (err) {
      handleApiError(err, 'Could not update campaign');
    }
  };

  const toggleCampaignStatus = async (campaignId) => {
    try {
      const { data } = await campaignsApi.toggleStatus(campaignId);
      setCampaigns((prev) => prev.map((c) => (c.id === campaignId ? data.data : c)));
      addToast(`Campaign status changed to ${data.data.status}`, 'info', 'Status Updated');
    } catch (err) {
      handleApiError(err, 'Could not toggle campaign status');
    }
  };

  // ---- Leads ----
  const addLead = async (leadData) => {
    try {
      const { data } = await leadsApi.create(leadData);
      setLeads((prev) => [data.data, ...prev]);
      addToast(`Lead "${data.data.fullName}" created successfully`, 'success', 'Lead Added');
    } catch (err) {
      handleApiError(err, 'Could not create lead');
    }
  };

  const updateLeadStatus = async (leadId, status, note) => {
    try {
      const { data } = await leadsApi.updateStatus(leadId, status, note);
      setLeads((prev) => prev.map((l) => (l.id === leadId ? data.data : l)));
      addToast(`Lead status updated to ${status.toUpperCase()}`, 'success', 'Lead Status Changed');
    } catch (err) {
      handleApiError(err, 'Could not update lead status');
    }
  };

  const assignLead = async (leadId, adminId) => {
    try {
      const { data } = await leadsApi.assign(leadId, adminId);
      setLeads((prev) => prev.map((l) => (l.id === leadId ? data.data : l)));
      const targetAdmin = users.find((u) => u.id === adminId);
      addToast(`Lead assigned to ${targetAdmin?.name || 'Admin'}`, 'info', 'Lead Reassigned');
    } catch (err) {
      handleApiError(err, 'Could not assign lead');
    }
  };

  const exportLeadsCSV = async () => {
    try {
      const res = await leadsApi.exportCSV(
        currentUser.role === 'super_admin' ? {} : { assignedAdminId: currentUser.id }
      );
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `meta_leads_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('Leads exported to CSV', 'success', 'Export Complete');
    } catch (err) {
      handleApiError(err, 'No leads available to export');
    }
  };

  const toggleLeadFollowUp = async (leadId) => {
    try {
      const { data } = await leadsApi.toggleFollowUp(leadId);
      setLeads((prev) => prev.map((l) => (l.id === leadId ? data.data : l)));
      addToast(
        data.data.followUpRequired ? `Follow-up flagged for ${data.data.fullName}` : `Follow-up resolved for ${data.data.fullName}`,
        'info',
        'Pipeline Updated'
      );
    } catch (err) {
      handleApiError(err, 'Could not update follow-up');
    }
  };

  const toggleLeadPipelineCategory = async (leadId) => {
    try {
      const { data } = await leadsApi.togglePipelineCategory(leadId);
      setLeads((prev) => prev.map((l) => (l.id === leadId ? data.data : l)));
      addToast(
        `Moved ${data.data.fullName} to ${data.data.pipelineCategory === 'active' ? 'Active Inbound' : 'Non-Active / Closed'}`,
        'info',
        'Pipeline Category Changed'
      );
    } catch (err) {
      handleApiError(err, 'Could not update pipeline category');
    }
  };

  const updateLeadFollowUpAction = async (leadId, action, date) => {
    try {
      const { data } = await leadsApi.updateFollowUpAction(leadId, action, date);
      setLeads((prev) => prev.map((l) => (l.id === leadId ? data.data : l)));
      addToast('Follow-up task updated', 'success', 'Task Saved');
    } catch (err) {
      handleApiError(err, 'Could not update follow-up task');
    }
  };

  const deleteLead = async (leadId) => {
    try {
      await leadsApi.delete(leadId);
      setLeads((prev) => prev.filter((l) => l.id !== leadId && l._id !== leadId));
      addToast('Lead deleted successfully', 'warning', 'Lead Removed');
    } catch (err) {
      handleApiError(err, 'Could not delete lead');
    }
  };

  const bulkDeleteLeads = async (leadIds) => {
    try {
      await leadsApi.bulkDelete(leadIds);
      setLeads((prev) => prev.filter((l) => !leadIds.includes(l.id) && !leadIds.includes(l._id)));
      addToast(`${leadIds.length} lead(s) deleted successfully`, 'warning', 'Leads Removed');
    } catch (err) {
      handleApiError(err, 'Could not delete selected leads');
    }
  };

  // ---- Invoices ----
  const createInvoice = async (invoiceData) => {
    try {
      const { data } = await invoicesApi.create(invoiceData);
      setInvoices((prev) => [data.data, ...prev]);
      addToast(`Invoice ${data.data.invoiceNumber} generated for ${data.data.clientName}`, 'success', 'Invoice Created');
    } catch (err) {
      handleApiError(err, 'Could not create invoice');
    }
  };

  const updateInvoiceStatus = async (invoiceId, status) => {
    try {
      const { data } = await invoicesApi.updateStatus(invoiceId, status);
      setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? data.data : inv)));
      addToast(`Invoice status updated to ${status.toUpperCase()}`, 'success', 'Invoice Updated');
    } catch (err) {
      handleApiError(err, 'Could not update invoice status');
    }
  };

  const deleteInvoice = async (invoiceId) => {
    try {
      await invoicesApi.remove(invoiceId);
      setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
      addToast('Invoice deleted successfully', 'warning', 'Invoice Removed');
    } catch (err) {
      handleApiError(err, 'Could not delete invoice');
    }
  };

  // ---- Announcements / Broadcasts ----
  const createAnnouncement = async (payload) => {
    try {
      const { data } = await announcementsApi.create(payload);
      setAnnouncements((prev) => [data.data, ...prev]);
      addToast('Broadcast announcement published to team', 'success', 'Broadcast Live');
    } catch (err) {
      handleApiError(err, 'Could not publish announcement');
    }
  };

  const acknowledgeAnnouncement = async (announcementId) => {
    try {
      const { data } = await announcementsApi.acknowledge(announcementId);
      setAnnouncements((prev) => prev.map((a) => (a.id === announcementId ? data.data : a)));
      addToast('Announcement marked as acknowledged', 'info', 'Acknowledged');
    } catch (err) {
      handleApiError(err, 'Could not acknowledge announcement');
    }
  };

  const deleteAnnouncement = async (announcementId) => {
    try {
      await announcementsApi.remove(announcementId);
      setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId));
      addToast('Announcement removed', 'warning', 'Broadcast Deleted');
    } catch (err) {
      handleApiError(err, 'Could not remove announcement');
    }
  };

  // ---- Customer 360 ----
  const addCustomerNote = async (customerId, note) => {
    try {
      const { data } = await customersApi.addNote(customerId, note);
      setCustomers((prev) => prev.map((c) => (c.id === customerId ? data.data : c)));
      addToast('Note added to customer profile', 'success', 'Note Saved');
    } catch (err) {
      handleApiError(err, 'Could not add note');
    }
  };

  const toggleCustomerFollowUp = async (customerId) => {
    try {
      const { data } = await customersApi.toggleFollowUp(customerId);
      setCustomers((prev) => prev.map((c) => (c.id === customerId ? data.data : c)));
      addToast(
        data.data.followUpRequired ? `Follow-up scheduled for ${data.data.company}` : `Follow-up cleared for ${data.data.company}`,
        'info',
        'Account Pipeline'
      );
    } catch (err) {
      handleApiError(err, 'Could not update follow-up');
    }
  };

  const toggleCustomerPipelineCategory = async (customerId) => {
    try {
      const { data } = await customersApi.togglePipelineCategory(customerId);
      setCustomers((prev) => prev.map((c) => (c.id === customerId ? data.data : c)));
      addToast(
        `Account moved to ${data.data.pipelineCategory === 'active' ? 'Active Retainer' : 'Non-Active / Archived'}`,
        'info',
        'Account Category Changed'
      );
    } catch (err) {
      handleApiError(err, 'Could not update pipeline category');
    }
  };

  const updateCustomerFollowUpAction = async (customerId, action, date) => {
    try {
      const { data } = await customersApi.updateFollowUpAction(customerId, action, date);
      setCustomers((prev) => prev.map((c) => (c.id === customerId ? data.data : c)));
      addToast('Client follow-up action scheduled', 'success', 'Action Scheduled');
    } catch (err) {
      handleApiError(err, 'Could not schedule follow-up');
    }
  };

  // ---- Notifications ----
  const unreadNotificationsCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const markNotificationAsRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      // Non-critical UI state — fail silently
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      addToast('All notifications marked as read', 'info', 'Notifications Updated');
    } catch (err) {
      handleApiError(err, 'Could not mark notifications as read');
    }
  };

  const clearNotification = async (id) => {
    try {
      await notificationsApi.clear(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      // Non-critical UI state — fail silently
    }
  };

  // ---- Settings ----
  const updateSettings = async (newSettings) => {
    try {
      const { data } = await settingsApi.update(newSettings);
      setSettings(data.data);
      addToast('System settings updated and synced with Meta Graph API', 'success', 'Settings Saved');
    } catch (err) {
      handleApiError(err, 'Could not update settings');
    }
  };

  const resetToDefaultData = () => {
    addToast('Data now lives on the server — use the database or seed script to reset sample data.', 'info', 'Server-Backed Data');
  };

  // Server already scopes list endpoints by role, so these are now simple aliases
  // kept for backwards compatibility with existing components.
  const filteredCampaigns = campaigns;
  const filteredLeads = leads;
  const filteredInvoices = invoices;
  const filteredCustomers = customers;

  const unreadAnnouncementsCount = useMemo(() => {
    if (!currentUser) return 0;
    return announcements.filter((a) => !a.acknowledgedUserIds?.includes(currentUser.id)).length;
  }, [announcements, currentUser]);

  return (
    <AppContext.Provider
      value={{
        // auth
        currentUser,
        authLoading,
        isDataLoading,
        login,
        logout,
        switchPersona,
        // data
        users,
        campaigns,
        leads,
        announcements,
        invoices,
        customers,
        settings,
        activeTab,
        leadsSubTab,
        toasts,
        setActiveTab,
        setLeadsSubTab,
        createAdmin,
        updateAdmin,
        deleteAdmin,
        addCampaign,
        updateCampaign,
        toggleCampaignStatus,
        addLead,
        updateLeadStatus,
        deleteLead,
        bulkDeleteLeads,
        assignLead,
        exportLeadsCSV,
        createInvoice,
        updateInvoiceStatus,
        deleteInvoice,
        createAnnouncement,
        acknowledgeAnnouncement,
        deleteAnnouncement,
        addCustomerNote,
        toggleLeadFollowUp,
        toggleLeadPipelineCategory,
        toggleCustomerFollowUp,
        toggleCustomerPipelineCategory,
        updateLeadFollowUpAction,
        updateCustomerFollowUpAction,
        updateSettings,
        resetToDefaultData,
        theme,
        toggleTheme,
        setTheme,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen,
        filteredCampaigns,
        filteredLeads,
        filteredInvoices,
        filteredCustomers,
        unreadAnnouncementsCount,
        addToast,
        removeToast,
        refreshAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
