import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../components/context/AuthContext";
import { useAlert } from '../../../components/ui/AlertProvider';
import api from "../../../services/reqInterceptor";

const roleClasses = {
    MODERATOR: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    ADMIN: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    DEPARTMENT_HEAD: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    QC_MEMBER: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    CLIENT: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

const formatRoleTitle = (roleSlug) => {
    if (!roleSlug) return "";
    return roleSlug
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function RoleUserList() {
    const { roleName: roleSlug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth(); 
    const { showAlert } = useAlert();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchUsersByRole = async () => {
        setLoading(true);
        setError("");

        if (user?.role !== "ADMIN") {
            setError("Access Denied. You must be an Admin to view user lists.");
            setLoading(false);
            return;
        }

        try {
            const apiRoleKey = roleSlug.toUpperCase().replace(/_/g, '_');           
            const res = await api.get(`/users?role=${apiRoleKey}`);

            if (res.status === 200 && Array.isArray(res.data.users)) {
                setUsers(res.data.users);
            } else {
                setUsers([]); 
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (userId) => {
        navigate(`/update-user/${userId}`);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await api.delete(`/admin/${id}`);

            if (res.status !== 200 && res.status !== 204) throw new Error("Failed to delete user");

            showAlert({ title: 'Success', message: 'User deleted successfully', type: 'success' });
            setUsers(users.filter((u) => u._id !== id));
        } catch (err) {
            showAlert({ title: 'Error', message: err.response?.data?.message || err.message || "Failed to delete user", type: 'error' });
        }
    };

    useEffect(() => {
        if (roleSlug) {
            fetchUsersByRole();
        }
    }, [roleSlug, user]);

    const title = `${formatRoleTitle(roleSlug)} User List`;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">View, edit, or remove users for this role</p>
                    </div>
                    <button
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        onClick={() => navigate("/dashboard")}
                    >
                        &larr; Back to Dashboard
                    </button>
                </div>

                <div className="bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-md relative">
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 relative z-10">
                            <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-700 border-t-brand-primary rounded-full animate-spin"></div>
                            <p className="text-slate-500 dark:text-slate-400">Loading <span className="font-bold">{formatRoleTitle(roleSlug)}</span> users...</p>
                        </div>
                    )}

                    {error && (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center relative z-10">
                            <span className="text-4xl">⚠️</span>
                            <p className="text-red-500 font-medium">{error}</p>
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="overflow-x-auto relative z-10">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 dark:bg-[#081024] border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
                                        <th className="p-5">Name</th>
                                        <th className="p-5">Email</th>
                                        <th className="p-5">Role</th>
                                        <th className="p-5 text-right pr-8">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                                    {users.length > 0 ? (
                                        users.map((user, idx) => (
                                            <tr key={user._id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
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
                                                        <span className="font-medium text-slate-900 dark:text-white">{user.name || 'No Name'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-5 text-slate-500 dark:text-slate-400">{user.email}</td>
                                                <td className="p-5">
                                                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${roleClasses[user.role] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'}`}>
                                                        {formatRoleTitle(user.role)}
                                                    </span>
                                                </td>
                                                <td className="p-5 text-right whitespace-nowrap pr-8">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors text-sm font-medium"
                                                            onClick={() => handleEdit(user._id)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors text-sm font-medium"
                                                            onClick={() => handleDelete(user._id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                                                    <p className="text-sm m-0">No users found for the <span className="font-bold text-slate-900 dark:text-white">{formatRoleTitle(roleSlug)}</span> role.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
