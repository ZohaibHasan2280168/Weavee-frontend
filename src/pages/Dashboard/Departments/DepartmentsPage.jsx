import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../services/reqInterceptor";
import BackButton from "../../../components/ui/BackButton";

// Icons
const AddIcon = ({ className }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M12 5v14"></path>
    <path d="M5 12h14"></path>
  </svg>
);

const SearchIcon = ({ className }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

// FilterIcon removed — dropdown uses outer container without a separate icon

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const DepartmentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="3" y1="9" x2="21" y2="9"></line>
    <line x1="3" y1="15" x2="21" y2="15"></line>
    <line x1="9" y1="21" x2="9" y2="9"></line>
  </svg>
);

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const navigate = useNavigate();

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/departments`);
      setDepartments(res.data || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch departments";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filteredDepartments = useMemo(() => {
    let filtered = [...departments];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(dept =>
        dept.name?.toLowerCase().includes(q) ||
        dept.description?.toLowerCase().includes(q) ||
        (dept.departmentHead?.name?.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter(dept => 
        (dept.status || "INACTIVE").toUpperCase() === statusFilter
      );
    }

    return filtered;
  }, [departments, searchTerm, statusFilter]);

  // Status dropdown state/ref for custom dropdown
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      try {
        const el = statusRef.current;
        if (!el) return;
        const path = e.composedPath ? e.composedPath() : (e.path || []);
        const clickedInside = path.length ? path.includes(el) : el.contains(e.target);
        if (!clickedInside) setIsStatusOpen(false);
      } catch (err) {
        // fallback to simple contains check
        if (statusRef.current && !statusRef.current.contains(e.target)) setIsStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const statusLabel = statusFilter === 'ALL' ? 'All Status' : statusFilter === 'ACTIVE' ? 'Active' : 'Inactive';

  const handleDetailView = (deptId) => {
    navigate(`/department-detail/${deptId}`);
  };

  const stats = useMemo(() => {
    const active = departments.filter(d => (d.status || "INACTIVE").toUpperCase() === "ACTIVE").length;
    const inactive = departments.filter(d => (d.status || "INACTIVE").toUpperCase() === "INACTIVE").length;
    const withHeads = departments.filter(d => d.departmentHead).length;
    
    return {
      total: departments.length,
      active,
      inactive,
      withHeads
    };
  }, [departments]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Departments</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage production departments and their teams</p>
            </div>
          </div>
          <Link 
            to="/add-department" 
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-primary to-blue-600 text-white font-semibold rounded-xl shadow-md shadow-brand-primary/25 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <AddIcon />
            Add Department
          </Link>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 min-[200px] gap-4 mb-8">
          <div className="bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-500">
              <DepartmentIcon />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">Total Departments</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">Active</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.active}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-purple-500/10 text-purple-500">
              <UsersIcon />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">With Heads</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.withHeads}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-rose-500/10 text-rose-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">Inactive</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.inactive}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
          <div className="relative flex items-center flex-1 w-full max-w-md">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
            <input
              type="text"
              style={{ paddingLeft: '2.75rem' }}
              className="!pl-11 w-full pr-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full sm:w-auto relative" ref={statusRef}>
            <button
              type="button"
              className="w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-2.5 bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
              onClick={(e) => { e.stopPropagation(); setIsStatusOpen(s => !s); }}
              aria-haspopup="true"
              aria-expanded={isStatusOpen}
            >
              <span>{statusLabel}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform duration-200 ${isStatusOpen ? 'rotate-180' : ''}`}>
                <path d="M6 9l6 6 6-6"></path>
              </svg>
            </button>

            {isStatusOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 flex flex-col overflow-hidden p-1">
                <button type="button" className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${statusFilter === 'ALL' ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'}`} onClick={() => { setStatusFilter('ALL'); setIsStatusOpen(false); }}>All Status</button>
                <button type="button" className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${statusFilter === 'ACTIVE' ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'}`} onClick={() => { setStatusFilter('ACTIVE'); setIsStatusOpen(false); }}>Active</button>
                <button type="button" className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${statusFilter === 'INACTIVE' ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'}`} onClick={() => { setStatusFilter('INACTIVE'); setIsStatusOpen(false); }}>Inactive</button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mb-4"></div>
              <p>Loading departments...</p>
            </div>
          ) : error ? (
            <div className="p-12 flex flex-col items-center justify-center text-red-500 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-100 dark:border-red-500/20 m-4">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-lg font-medium text-center mb-4">{error}</p>
              <button 
                className="px-6 py-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold rounded-lg hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors"
                onClick={fetchDepartments}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Departments ({filteredDepartments.length})</h3>
                  <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">Showing {filteredDepartments.length} of {departments.length} departments</span>
                </div>
              </div>

              {/* Departments Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-[#081024] border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
                      <th className="p-5 font-semibold">Department Information</th>
                      <th className="p-5 font-semibold">Department Head</th>
                      <th className="p-5 font-semibold">Status</th>
                      <th className="p-5 font-semibold">Team Size</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                    {filteredDepartments.length > 0 ? (
                      filteredDepartments.map((dept, index) => (
                        <tr 
                          key={dept._id || index} 
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                          onClick={() => handleDetailView(dept._id)}
                        >
                          <td className="p-5">
                            <div className="flex items-center gap-4">
                              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-primary to-blue-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                                {dept.name ? dept.name.charAt(0).toUpperCase() : 'D'}
                              </div>
                              <div>
                                <span className="block font-semibold text-slate-900 dark:text-white text-sm group-hover:text-brand-primary transition-colors">{dept.name}</span>
                                <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs truncate">
                                  {dept.description || 'No description'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-5">
                            {dept.departmentHead ? (
                              <div>
                                <span className="block text-sm font-medium text-slate-900 dark:text-slate-300">
                                  {typeof dept.departmentHead === 'object' 
                                    ? dept.departmentHead.name 
                                    : dept.departmentHead}
                                </span>
                                {typeof dept.departmentHead === 'object' && dept.departmentHead.email && (
                                  <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{dept.departmentHead.email}</span>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                Not Assigned
                              </span>
                            )}
                          </td>
                          <td className="p-5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              (dept.status || 'INACTIVE').toUpperCase() === 'ACTIVE'
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                                : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${(dept.status || 'INACTIVE').toUpperCase() === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                              {(dept.status || 'INACTIVE').toUpperCase()}
                            </span>
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                              <UsersIcon className="text-slate-400 w-4 h-4" />
                              <span>{dept.teamMembers?.length || 0} members</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-12">
                          <div className="flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
                              <DepartmentIcon />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No departments found</h4>
                            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-6">Try adjusting your search or create a new department.</p>
                            <Link 
                              to="/add-department" 
                              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-brand-primary/20 hover:shadow-lg"
                            >
                              <AddIcon />
                              Add Department
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Departments;
