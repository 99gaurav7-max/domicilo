import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Home, Filter, SlidersHorizontal, Grid3X3, List, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { propertyApi } from '../../services/endpoints';
import { Property } from '../../types';
import { Skeleton } from '../../components/ui/Skeleton';

const roomTypes = ['1RK', '1BHK', '2BHK', '3BHK', '4BHK'];
const amenities = ['WiFi', 'Parking', 'Gym', 'Security', 'Power Backup', 'Lift', 'Swimming Pool', 'Garden'];

export default function PropertiesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    roomType: searchParams.get('roomType') || '',
    minRent: searchParams.get('minRent') || '',
    maxRent: searchParams.get('maxRent') || '',
    amenities: searchParams.get('amenities') || '',
  });

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page: 1, limit: 12 };
      if (filters.search) params.search = filters.search;
      if (filters.city) params.city = filters.city;
      if (filters.roomType) params.roomType = filters.roomType;
      if (filters.minRent) params.minRent = filters.minRent;
      if (filters.maxRent) params.maxRent = filters.maxRent;
      if (filters.amenities) params.amenities = filters.amenities;

      const res = await propertyApi.getAll(params);
      if (res.data.success) {
        setProperties(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    setSearchParams(params);
    fetchProperties();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 text-blue-200 text-sm mb-4">
            <Link to="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white">Properties</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Find Your Perfect Rental</h1>
          <p className="text-blue-100/80">Browse through our curated selection of premium properties.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        {/* Search & Filter Bar */}
        <div className="glass-card rounded-2xl p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by location or property name..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex gap-2">
              <select value={filters.roomType} onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}
                className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                <option value="">All Types</option>
                {roomTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                <option value="">All Cities</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Pune">Pune</option>
                <option value="Delhi">Delhi</option>
              </select>
              <button onClick={() => setShowFilters(!showFilters)} className={`px-3 py-2.5 rounded-xl border text-sm transition-all ${showFilters ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-300 text-primary-700' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              <button onClick={handleSearch} className="btn-primary px-6 text-sm">Search</button>
            </div>
          </div>

          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Min Rent</label>
                  <input type="number" value={filters.minRent} onChange={(e) => setFilters({ ...filters, minRent: e.target.value })} placeholder="₹0"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Max Rent</label>
                  <input type="number" value={filters.maxRent} onChange={(e) => setFilters({ ...filters, maxRent: e.target.value })} placeholder="₹1,00,000"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Amenities</label>
                  <select value={filters.amenities} onChange={(e) => setFilters({ ...filters, amenities: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                    <option value="">All Amenities</option>
                    {amenities.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {loading ? 'Searching...' : `${properties.length} properties found`}
          </p>
          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600' : 'text-gray-400'}`}>
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600' : 'text-gray-400'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Property Grid / List */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-72 rounded-xl" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <Home className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No properties found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search filters.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property, i) => (
              <motion.div key={property.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
                onClick={() => navigate(`/properties/${property.id}`)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={property.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600'} alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-primary-700">
                      {property.vacant_rooms || 0} Vacant
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">{property.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    {property.city}, {property.location}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold gradient-text">₹{property.rooms?.[0]?.rent?.toLocaleString() || 'N/A'}<span className="text-xs text-gray-400 font-normal">/mo</span></p>
                    <button className="btn-secondary text-xs px-3 py-1.5">View Details</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => (
              <div key={property.id} className="glass-card rounded-xl p-4 flex gap-4 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => navigate(`/properties/${property.id}`)}
              >
                <img src={property.images?.[0] || ''} alt={property.name} className="w-32 h-24 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{property.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {property.city}, {property.location}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-lg font-bold gradient-text">₹{property.rooms?.[0]?.rent?.toLocaleString()}/mo</span>
                    <span className="text-xs text-gray-400">{property.vacant_rooms || 0} rooms vacant</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
