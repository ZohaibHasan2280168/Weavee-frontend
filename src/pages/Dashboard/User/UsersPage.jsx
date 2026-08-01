import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAlert } from '../../../components/ui/AlertProvider';
import api from "../../../services/reqInterceptor";
import BackButton from "../../../components/ui/BackButton";

// Icons
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18"></path>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const SearchIcon = ({ className, ...props }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  
  // Custom Filter Dropdown State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [tempSelectedRoles, setTempSelectedRoles] = useState([]);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const roleClasses = {
    MODERATOR: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    ADMIN: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    DEPARTMENT_HEAD: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    QC_MEMBER: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    CLIENT: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  };

  const filterableRoles = ["ADMIN", "MODERATOR", "DEPARTMENT_HEAD", "QC_MEMBER", "CLIENT"];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedRoles]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/users");
      setUsers(res.data.users || []);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Failed to fetch users";
      setError(message);
      showAlert({ title: 'Error', message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply multiple role filter
    if (selectedRoles.length > 0) {
      filtered = filtered.filter(user => selectedRoles.includes(user.role));
    }

    setFilteredUsers(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await api.delete(`/users/${id}`);
      showAlert({ 
        title: 'Success', 
        message: 'User deleted successfully', 
        type: 'success' 
      });
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      showAlert({ 
        title: 'Error', 
        message: err.response?.data?.message || "Failed to delete user", 
        type: 'error' 
      });
    }
  };

  const getRoleStats = () => {
    const stats = {};
    users.forEach(user => {
      stats[user.role] = (stats[user.role] || 0) + 1;
    });
    return stats;
  };

  const roleStats = getRoleStats();

  const handleDropdownOpen = () => {
    setTempSelectedRoles(selectedRoles);
    setIsFilterOpen(!isFilterOpen);
  };

  const toggleRoleSelection = (role) => {
    if (tempSelectedRoles.includes(role)) {
      setTempSelectedRoles(tempSelectedRoles.filter(r => r !== role));
    } else {
      setTempSelectedRoles([...tempSelectedRoles, role]);
    }
  };

  const applyRoleFilter = () => {
    setSelectedRoles(tempSelectedRoles);
    setIsFilterOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">User Management</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your team members and their roles</p>
            </div>
          </div>
          <Link 
            to="/add-user" 
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-primary to-blue-600 text-white font-semibold rounded-xl shadow-md shadow-brand-primary/25 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Add User
          </Link>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-auto-fit min-[200px] gap-4 mb-8">
          <div className="bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-500">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">Total Users</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{users.length}</span>
            </div>
          </div>

          {Object.entries(roleStats).map(([role, count]) => (
            <div className="bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all" key={role}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold ${roleClasses[role] || 'bg-slate-500/10 text-slate-500'}`}>
                {count}
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">{role.replace('_', ' ')}</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{count}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
          <div className="relative flex items-center flex-1 w-full max-w-md">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
            <input
              type="text"
              style={{ paddingLeft: '2.75rem' }}
              className="!pl-11 w-full pr-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full sm:w-auto relative" ref={dropdownRef}>
            <button 
              className="w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-2.5 bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary/50" 
              onClick={handleDropdownOpen}
            >
              <span>Role {selectedRoles.length > 0 && `(${selectedRoles.length})`}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6"></path>
              </svg>
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 flex flex-col overflow-hidden">
                <div className="p-2 border-b border-slate-200 dark:border-slate-800">
                  <input 
                    type="text"
                    placeholder="Search roles..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    value={roleSearch}
                    onChange={(e) => setRoleSearch(e.target.value)}
                  />
                </div>
                <div className="max-h-60 overflow-y-auto p-1">
                  {filterableRoles
                    .filter(r => r.toLowerCase().includes(roleSearch.toLowerCase()))
                    .map(role => (
                      <label key={role} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${tempSelectedRoles.includes(role) ? 'bg-brand-primary border-brand-primary' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 group-hover:border-brand-primary'}`}>
                          {tempSelectedRoles.includes(role) && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">{role.replace('_', ' ')}</span>
                      </label>
                    ))}
                  {filterableRoles.filter(r => r.toLowerCase().includes(roleSearch.toLowerCase())).length === 0 && (
                    <div className="p-4 text-center text-slate-500 text-sm">No roles found</div>
                  )}
                </div>
                <div className="p-2 border-t border-slate-200 dark:border-slate-800">
                  <button 
                    className="w-full py-2 bg-brand-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors" 
                    onClick={applyRoleFilter}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-md">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-700 border-t-brand-primary rounded-full animate-spin"></div>
              <p className="text-slate-500 dark:text-slate-400">Loading users...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <span className="text-4xl">⚠️</span>
              <p className="text-red-500 font-medium">{error}</p>
              <button 
                className="mt-2 px-6 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors font-medium border border-slate-200 dark:border-slate-700" 
                onClick={fetchUsers}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0a1329]">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Users ({filteredUsers.length})</h3>
                  <span className="text-sm text-slate-500 dark:text-slate-400 block mt-1">Showing {filteredUsers.length} of {users.length} users</span>
                </div>
                <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm">
                  Export CSV
                </button>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-[#081024] border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
                      <th className="p-5">User Information</th>
                      <th className="p-5">Role</th>
                      <th className="p-5">Status</th>
                      <th className="p-5 text-right pr-8">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user, index) => (
                        <tr key={user._id || index} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="p-5">
                            <div className="flex items-center gap-4">
                              {(() => {
                                const rawImg = user?.avatar?.url || (typeof user?.avatar === 'string' ? user.avatar : null) || user?.profilePicture || user?.profilePic || user?.image || user?.photo;
                                const imgStr = typeof rawImg === 'string' ? rawImg : null;
                                const initial = typeof user?.name === 'string' && user.name.length > 0 ? user.name.charAt(0).toUpperCase() : 'U';
                                
                                if (!imgStr) {
                                  return (
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-primary to-purple-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                                      {initial}
                                    </div>
                                  );
                                }

                                const base = api.defaults?.baseURL || 'http://localhost:5000/';
                                const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
                                const cleanPath = imgStr.startsWith('/') ? imgStr : `/${imgStr}`;
                                const imageUrl = imgStr.startsWith('http') ? imgStr : `${cleanBase}${cleanPath}`;

                                return (
                                  <>
                                    <img
                                      src={imageUrl}
                                      alt={user?.name || 'User'}
                                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        if (e.target.nextElementSibling) {
                                          e.target.nextElementSibling.style.display = 'flex';
                                        }
                                      }}
                                    />
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-primary to-purple-500 text-white items-center justify-center font-bold text-lg shrink-0 shadow-sm hidden">
                                      {initial}
                                    </div>
                                  </>
                                );
                              })()}
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-900 dark:text-white">{user.name || 'No Name'}</span>
                                <span className="text-sm text-slate-500 dark:text-slate-400">{user.email}</span>
                                {user.department && (
                                  <span className="mt-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md inline-flex w-fit font-medium border border-blue-100 dark:border-blue-500/20">
                                    {user.department.name || user.department}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-5">
                            <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${roleClasses[user.role] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'}`}>
                              {user.role?.replace('_', ' ') || 'N/A'}
                            </span>
                          </td>
                          <td className="p-5">
                            <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${
                              user.isActive !== false 
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' 
                                : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30'
                            }`}>
                              {user.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="p-5 text-right whitespace-nowrap pr-8">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors text-sm font-medium"
                                onClick={() => navigate(`/update-user/${user._id}`)}
                                title="Edit User"
                              >
                                <EditIcon />
                                <span>Edit</span>
                              </button>
                              <button
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors text-sm font-medium"
                                onClick={() => handleDelete(user._id)}
                                title="Delete User"
                              >
                                <DeleteIcon />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-12 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2 border border-slate-200 dark:border-slate-700">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="8.5" cy="7" r="4"></circle>
                                <line x1="18" y1="8" x2="23" y2="13"></line>
                                <line x1="23" y1="8" x2="18" y2="13"></line>
                              </svg>
                            </div>
                            <h4 className="text-slate-900 dark:text-white text-lg font-semibold m-0">No users found</h4>
                            <p className="text-sm m-0 max-w-sm">Try adjusting your search or filter to find what you're looking for.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredUsers.length > 10 && (
                <div className="flex justify-center items-center gap-4 p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0a1329]">
                  <button className="px-5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors" disabled>
                    Previous
                  </button>
                  <span className="text-slate-500 dark:text-slate-400 text-sm">Page 1 of 1</span>
                  <button className="px-5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
