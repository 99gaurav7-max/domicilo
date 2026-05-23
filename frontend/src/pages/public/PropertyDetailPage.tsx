import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Home, Users, Wifi, Car, Dumbbell, Shield, Zap, Waves, TreePine, ChevronLeft, Phone, Mail, Calendar, MessageSquare, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { propertyApi } from '../../services/endpoints';
import { Property } from '../../types';
import { Skeleton } from '../../components/ui/Skeleton';

const amenityIcons: Record<string, any> = {
  WiFi: Wifi, Parking: Car, Gym: Dumbbell, Security: Shield, 'Power Backup': Zap, Lift: Home, 'Swimming Pool': Waves, Garden: TreePine,
};

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [enquiryForm, setEnquiryForm] = useState({ name: '', phone: '', email: '', preferredMoveIn: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      propertyApi.getById(id).then((res) => {
        if (res.data.success) setProperty(res.data.data!);
      }).catch(() => {
        toast.error('Failed to load property details');
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) { toast.error('Please select a room type'); return; }
    if (!enquiryForm.name || !enquiryForm.phone) { toast.error('Please fill in name and phone'); return; }
    setSubmitting(true);
    try {
      await propertyApi.createEnquiry({
        propertyId: id!,
        roomType: selectedRoom,
        ...enquiryForm,
      });
      toast.success('Enquiry submitted! The owner will contact you.');
      setShowEnquiry(false);
      setEnquiryForm({ name: '', phone: '', email: '', preferredMoveIn: '', message: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-96 rounded-2xl mb-8" />
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-96 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Property not found</h2>
          <Link to="/properties" className="text-primary-600 mt-2 inline-block">Back to properties</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-2 text-blue-200 text-sm mb-4">
            <Link to="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link to="/properties" className="hover:text-white">Properties</Link>
            <span>/</span>
            <span className="text-white">{property.name}</span>
          </div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-blue-200 hover:text-white text-sm transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl overflow-hidden">
              <div className="relative h-72 md:h-96">
                <img src={property.images?.[selectedImage] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200'}
                  alt={property.name} className="w-full h-full object-cover" />
              </div>
              {property.images?.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {property.images.map((img, i) => (
                    <button key={i} onClick={() => setSelectedImage(i)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === selectedImage ? 'border-primary-500' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Property Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6 space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{property.name}</h1>
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <MapPin className="w-4 h-4" /> {property.location}, {property.city}, {property.state}
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300">{property.description}</p>

              {/* Amenities */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities?.map((a) => {
                    const Icon = amenityIcons[a] || Home;
                    return (
                      <span key={a} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm">
                        <Icon className="w-3.5 h-3.5" /> {a}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Rooms */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Available Rooms</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {property.rooms?.filter(r => r.status === 'vacant').map((room) => (
                    <div key={room.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">{room.room_type} - {room.room_number}</span>
                        <span className="text-lg font-bold gradient-text">₹{room.rent.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {room.square_feet && `${room.square_feet} sq.ft`}
                        {room.floor_number && ` | Floor ${room.floor_number}`}
                      </p>
                      <p className="text-xs text-gray-400">Deposit: ₹{(room.security_deposit || 0).toLocaleString()}</p>
                    </div>
                  ))}
                  {(!property.rooms || property.rooms.filter(r => r.status === 'vacant').length === 0) && (
                    <p className="text-sm text-gray-500 col-span-2">No vacant rooms currently available.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Card */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Property Owner</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold">
                  {property.owner_name?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{property.owner_name}</p>
                  <a href={`tel:${property.owner_phone}`} className="text-xs text-primary-600 hover:underline">{property.owner_phone}</a>
                </div>
              </div>
              {property.owner_phone && (
                <a href={`tel:${property.owner_phone}`} className="btn-primary w-full text-sm flex items-center justify-center gap-2 mb-2">
                  <Phone className="w-4 h-4" /> Call Owner
                </a>
              )}
            </motion.div>

            {/* Enquiry Form */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Interested? Enquire Now</h3>
              {!showEnquiry ? (
                <button onClick={() => setShowEnquiry(true)} className="btn-primary w-full text-sm">
                  Send Enquiry
                </button>
              ) : (
                <form onSubmit={handleEnquiry} className="space-y-3">
                  <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} required
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                    <option value="">Select Room Type</option>
                    {[...new Set(property.rooms?.filter(r => r.status === 'vacant').map(r => r.room_type) || [])].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <input type="text" value={enquiryForm.name} onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })} placeholder="Your Name *" required
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
                  <input type="tel" value={enquiryForm.phone} onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })} placeholder="Phone Number *" required
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
                  <input type="email" value={enquiryForm.email} onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })} placeholder="Email (optional)"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
                  <input type="date" value={enquiryForm.preferredMoveIn} onChange={(e) => setEnquiryForm({ ...enquiryForm, preferredMoveIn: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
                  <textarea value={enquiryForm.message} onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })} placeholder="Message (optional)" rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm resize-none" />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowEnquiry(false)} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">Cancel</button>
                    <button type="submit" disabled={submitting} className="flex-1 btn-primary text-sm flex items-center justify-center gap-1">
                      {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
                      {submitting ? 'Sending...' : 'Submit'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
