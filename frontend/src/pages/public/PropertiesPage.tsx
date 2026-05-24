import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Home, Filter, SlidersHorizontal, Grid3X3, List, Loader2, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { propertyApi } from '../../services/endpoints';
import { Property } from '../../types';
import { Skeleton } from '../../components/ui/Skeleton';
import { Pagination } from '../../components/ui/Pagination';

const roomTypes = ['1RK', '1BHK', '2BHK', '3BHK', '4BHK', '5BHK', '6BHK', '7BHK', '8BHK', '9BHK', '10BHK'];
const amenities = ['WiFi', 'Parking', 'Gym', 'Security', 'Power Backup', 'Lift', 'Swimming Pool', 'Garden'];

import { indianStatesCities } from '../../data/indianStatesCities';

export default function PropertiesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    state: searchParams.get('state') || '',
    city: searchParams.get('city') || '',
    roomType: searchParams.get('roomType') || '',
    minRent: searchParams.get('minRent') || '',
    maxRent: searchParams.get('maxRent') || '',
    amenities: searchParams.get('amenities') || '',
  });

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    searchParams.get('amenities') ? searchParams.get('amenities')!.split(',') : []
  );

  const sortedStates = Object.keys(indianStatesCities).sort((a, b) => a.localeCompare(b));
  const availableCities = filters.state ? [...(indianStatesCities[filters.state] || [])].sort((a, b) => a.localeCompare(b)) : [];

  const fetchProperties = useCallback(async (p?: number) => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page: p || page, limit: 12 };
      if (filters.search) params.search = filters.search;
      if (filters.city) params.city = filters.city;
      if (filters.roomType) params.roomType = filters.roomType;
      if (filters.minRent) params.minRent = filters.minRent;
      if (filters.maxRent) params.maxRent = filters.maxRent;
      if (selectedAmenities.length) params.amenities = selectedAmenities.join(',');

      const res = await propertyApi.getAll(params);
      if (res.data.success) {
        setProperties(res.data.data || []);
        setPagination(res.data.pagination || { page: 1, limit: 12, total: 0, totalPages: 0 });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  }, [filters, selectedAmenities]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const resetAndFetch = (p?: number) => {
    setPage(p || 1);
    fetchProperties(p);
  };

  const handleSearch = () => {
    setPage(1);
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.state) params.set('state', filters.state);
    if (filters.city) params.set('city', filters.city);
    if (filters.roomType) params.set('roomType', filters.roomType);
    if (filters.minRent) params.set('minRent', filters.minRent);
    if (filters.maxRent) params.set('maxRent', filters.maxRent);
    if (selectedAmenities.length) params.set('amenities', selectedAmenities.join(','));
    setSearchParams(params);
    fetchProperties();
  };

  const resetFilters = () => {
    setFilters({ search: '', state: '', city: '', roomType: '', minRent: '', maxRent: '', amenities: '' });
    setSelectedAmenities([]);
    setPage(1);
    setSearchParams(new URLSearchParams());
    toast.success('Filters reset');
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
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
        <div className="glass-card rounded-2xl p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by location or property name..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={filters.roomType} onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}
                className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                <option value="" className="text-gray-900 dark:text-gray-100">All Types</option>
                {roomTypes.map((t) => <option key={t} value={t} className="text-gray-900 dark:text-gray-100">{t}</option>)}
              </select>
              <select value={filters.state} onChange={(e) => { setFilters({ ...filters, state: e.target.value, city: '' }); }}
                className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                <option value="" className="text-gray-900 dark:text-gray-100">All States</option>
                {sortedStates.map((s) => <option key={s} value={s} className="text-gray-900 dark:text-gray-100">{s}</option>)}
              </select>
              <select value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 disabled:opacity-50"
                disabled={!filters.state}>
                <option value="" className="text-gray-900 dark:text-gray-100">{filters.state ? 'All Cities' : 'Select state first'}</option>
                {availableCities.map((c) => <option key={c} value={c} className="text-gray-900 dark:text-gray-100">{c}</option>)}
              </select>
              <button onClick={() => setShowFilters(!showFilters)} className={`px-3 py-2.5 rounded-xl border text-sm transition-all ${showFilters ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-300 text-primary-700 dark:text-primary-300' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              <button onClick={handleSearch} className="btn-primary px-6 text-sm">Search</button>
            </div>
          </div>

          {showFilters && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }} className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Min Rent</label>
                  <input type="number" value={filters.minRent} onChange={(e) => setFilters({ ...filters, minRent: e.target.value })} placeholder="₹0"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Max Rent</label>
                  <input type="number" value={filters.maxRent} onChange={(e) => setFilters({ ...filters, maxRent: e.target.value })} placeholder="₹1,00,000"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Amenities</label>
                  <div className="flex flex-wrap gap-1.5">
                    {amenities.map((a) => (
                      <button key={a} onClick={() => toggleAmenity(a)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${selectedAmenities.includes(a) ? 'bg-primary-50 dark:bg-primary-900/40 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-end">
                  <button onClick={resetFilters} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {loading ? 'Searching...' : `${properties.length} properties found`}
          </p>
          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}>
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

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
            <button onClick={resetFilters} className="mt-4 btn-secondary text-sm">Reset Filters</button>
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

        {pagination.totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={(p) => resetAndFetch(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
