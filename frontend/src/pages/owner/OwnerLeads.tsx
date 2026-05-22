import { useState, useEffect } from 'react';
import { Phone, Mail, Calendar, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { ownerApi } from '../../services/endpoints';
import { Enquiry } from '../../types';
import { TableContainer, Card, StatusBadge, EmptyState, Select, SearchInput } from '../../components/ui/Table';
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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage property enquiries and convert leads to tenants</p>
      </div>

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
                    <div className="flex flex-col text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.phone}</span>
                      {lead.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {lead.email}</span>}
                    </div>
                  </td>
                  <td className="text-sm text-gray-600">{lead.property_name}</td>
                  <td>{lead.room_type}</td>
                  <td className="text-sm text-gray-500">{new Date(lead.created_at).toLocaleDateString()}</td>
                  <td><StatusBadge status={lead.status} /></td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      {lead.status === 'new' && (
                        <>
                          <button onClick={() => handleStatusUpdate(lead.id, 'contacted')}
                            className="px-2 py-1 text-xs rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                            Contact
                          </button>
                          <button onClick={() => handleStatusUpdate(lead.id, 'approved')}
                            className="px-2 py-1 text-xs rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                            Approve
                          </button>
                          <button onClick={() => handleStatusUpdate(lead.id, 'rejected')}
                            className="px-2 py-1 text-xs rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                            Reject
                          </button>
                        </>
                      )}
                      {lead.status === 'approved' && (
                        <button onClick={() => handleStatusUpdate(lead.id, 'converted')}
                          className="px-2 py-1 text-xs rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400">
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
      {pagination.totalPages > 1 && <Pagination {...pagination} onPageChange={setPage} />}

      {/* Lead Detail Modal */}
      <Modal isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} title="Lead Details" size="lg">
        {selectedLead && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <p className="text-xs text-gray-500 mb-1">Name</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedLead.name}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <p className="text-xs text-gray-500 mb-1">Phone</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedLead.phone}</p>
              </div>
              {selectedLead.email && (
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedLead.email}</p>
                </div>
              )}
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <p className="text-xs text-gray-500 mb-1">Property</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedLead.property_name}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <p className="text-xs text-gray-500 mb-1">Room Type</p>
                <p className="font-medium">{selectedLead.room_type}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <StatusBadge status={selectedLead.status} />
              </div>
              {selectedLead.preferred_move_in && (
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  <p className="text-xs text-gray-500 mb-1">Preferred Move-in</p>
                  <p className="font-medium">{new Date(selectedLead.preferred_move_in).toLocaleDateString()}</p>
                </div>
              )}
            </div>
            {selectedLead.message && (
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <p className="text-xs text-gray-500 mb-1">Message</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedLead.message}</p>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              {selectedLead.status === 'new' && (
                <>
                  <button onClick={() => { handleStatusUpdate(selectedLead.id, 'contacted'); }} className="btn-secondary text-sm">Mark Contacted</button>
                  <button onClick={() => { handleStatusUpdate(selectedLead.id, 'approved'); }} className="btn-primary text-sm">Approve & Convert</button>
                </>
              )}
              {selectedLead.status === 'approved' && (
                <button onClick={() => { handleStatusUpdate(selectedLead.id, 'converted'); }} className="btn-primary text-sm">Convert to Tenant</button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
