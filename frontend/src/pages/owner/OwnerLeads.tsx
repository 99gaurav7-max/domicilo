import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { ownerApi } from '../../services/endpoints';
import { Enquiry } from '../../types';
import { TableContainer, StatusBadge, EmptyState, Select } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';

export default function OwnerLeads() {
  const [leads, setLeads] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [selectedLead, setSelectedLead] = useState<Enquiry | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; status: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLeads = () => {
    setLoading(true);
    ownerApi.getLeads({ page, limit: 10, search, status }).then((res) => {
      if (res.data.success) {
        setLeads(res.data.data!);
        setPagination(res.data.pagination!);
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeads(); }, [page, search, status]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setActionLoading(true);
    try {
      await ownerApi.updateLeadStatus(id, newStatus);
      toast.success(`Lead ${newStatus} successfully`);
      setSelectedLead(null);
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update lead');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Leads</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage property enquiries and convert leads to tenants</p>
      </div>

      <div className="rounded-2xl bg-white/60 dark:bg-black/30 backdrop-blur-2xl border border-white/30 dark:border-white/5 shadow-xl overflow-hidden">
        <TableContainer
          searchable searchPlaceholder="Search leads..."
          onSearch={(q) => { setSearch(q); setPage(1); }}
          filters={
            <Select value={status} onChange={(v) => { setStatus(v); setPage(1); }}
              options={[
                { value: 'new', label: 'New' },
                { value: 'contacted', label: 'Contacted' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'converted', label: 'Converted' },
              ]}
              placeholder="All Status" />
          }
        >
          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : leads.length === 0 ? (
            <EmptyState icon={<MessageSquare className="w-8 h-8" />} title="No leads yet"
              description="When people enquire about your properties, they'll appear here." />
          ) : (
            <>
              <thead>
                <tr className="sticky-table-header">
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Property</th>
                  <th>Room Type</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="cursor-pointer" onClick={() => setSelectedLead(lead)}>
                    <td className="font-medium text-gray-900 dark:text-white">{lead.name}</td>
                    <td>
                      <div className="flex flex-col text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.phone}</span>
                        {lead.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {lead.email}</span>}
                      </div>
                    </td>
                    <td className="text-sm text-gray-500 dark:text-gray-400">{lead.property_name}</td>
                    <td className="text-gray-700 dark:text-gray-300">{lead.room_type}</td>
                    <td className="text-sm text-gray-500 dark:text-gray-400">{new Date(lead.created_at).toLocaleDateString()}</td>
                    <td><StatusBadge status={lead.status} /></td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {lead.status === 'new' && (
                          <>
                            <button onClick={() => handleStatusUpdate(lead.id, 'contacted')}
                              className="px-2 py-1 text-xs rounded-2xl bg-royal-50 dark:bg-royal-900/20 text-royal-700 dark:text-royal-400">
                              Contact
                            </button>
                            <button onClick={() => setConfirmAction({ id: lead.id, status: 'approved' })}
                              className="px-2 py-1 text-xs rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                              Approve
                            </button>
                            <button onClick={() => setConfirmAction({ id: lead.id, status: 'rejected' })}
                              className="px-2 py-1 text-xs rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                              Reject
                            </button>
                          </>
                        )}
                        {lead.status === 'approved' && (
                          <button onClick={() => setConfirmAction({ id: lead.id, status: 'converted' })}
                            className="px-2 py-1 text-xs rounded-2xl bg-royal-50 dark:bg-royal-900/20 text-royal-700 dark:text-royal-400">
                            Convert to Tenant
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </>
          )}
        </TableContainer>
      </div>
      {pagination.totalPages > 1 && <Pagination {...pagination} onPageChange={setPage} />}

      {/* Lead Detail Modal */}
      <Modal isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} title="Lead Details" size="lg">
        {selectedLead && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Name</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedLead.name}</p>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedLead.phone}</p>
              </div>
              {selectedLead.email && (
                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedLead.email}</p>
                </div>
              )}
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Property</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedLead.property_name}</p>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Room Type</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedLead.room_type}</p>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                <StatusBadge status={selectedLead.status} />
              </div>
              {selectedLead.preferred_move_in && (
                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Preferred Move-in</p>
                  <p className="font-medium text-gray-900 dark:text-white">{new Date(selectedLead.preferred_move_in).toLocaleDateString()}</p>
                </div>
              )}
            </div>
            {selectedLead.message && (
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Message</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedLead.message}</p>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              {selectedLead.status === 'new' && (
                <>
                  <button onClick={() => { handleStatusUpdate(selectedLead.id, 'contacted'); }} className="rounded-2xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 px-4 py-2 text-sm">Mark Contacted</button>
                  <button onClick={() => setConfirmAction({ id: selectedLead.id, status: 'approved' })} className="rounded-2xl bg-gradient-to-r from-royal-600 to-royal-800 text-white hover:shadow-xl hover:shadow-royal-500/20 px-4 py-2 text-sm">Approve & Convert</button>
                </>
              )}
              {selectedLead.status === 'approved' && (
                <button onClick={() => setConfirmAction({ id: selectedLead.id, status: 'converted' })} className="rounded-2xl bg-gradient-to-r from-royal-600 to-royal-800 text-white hover:shadow-xl hover:shadow-royal-500/20 px-4 py-2 text-sm">Convert to Tenant</button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          if (confirmAction) handleStatusUpdate(confirmAction.id, confirmAction.status);
          setConfirmAction(null);
        }}
        title={confirmAction?.status === 'approved' ? 'Approve Lead' : confirmAction?.status === 'rejected' ? 'Reject Lead' : 'Convert to Tenant'}
        message={confirmAction?.status === 'approved'
          ? 'This will approve the enquiry. The lead will be marked as approved and can be converted to a tenant later.'
          : confirmAction?.status === 'rejected'
          ? 'This will reject the enquiry. The lead will be marked as rejected and the applicant will be notified.'
          : 'This will convert this lead into a full tenant. They will be onboarded into the property system.'}
        confirmText={confirmAction?.status === 'approved' ? 'Approve' : confirmAction?.status === 'rejected' ? 'Reject' : 'Convert'}
        variant={confirmAction?.status === 'rejected' ? 'danger' : 'info'}
      />
    </motion.div>
  );
}
