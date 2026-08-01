import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch, FiEdit2, FiTrash2, FiLayers,
  FiArrowLeft, FiPlus,
  FiPackage, FiCheckCircle, FiClock, FiActivity, FiFilter,
  FiChevronRight, FiHash
} from "react-icons/fi";
import api from '../../../services/reqInterceptor';
import EditOrderModal from "../../../components/modals/EditOrderModal";
import CreateOrderModal from "../../../components/modals/CreateOrderModal";
import { useAlert } from "../../../components/ui/AlertProvider";

const OrdersList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const statusRef = useRef(null);
  const typeRef = useRef(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const ordersRes = await api.get(`/order`);
      setOrders(ordersRes.data.orders || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      showAlert({ title: "Error", message: "Failed to load orders", type: "error" });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleOutside = (e) => {
      try {
        const path = e.composedPath ? e.composedPath() : (e.path || []);
        if (statusRef.current) {
          const clickedInsideStatus = path.length ? path.includes(statusRef.current) : statusRef.current.contains(e.target);
          if (!clickedInsideStatus) setIsStatusOpen(false);
        }
        if (typeRef.current) {
          const clickedInsideType = path.length ? path.includes(typeRef.current) : typeRef.current.contains(e.target);
          if (!clickedInsideType) setIsTypeOpen(false);
        }
      } catch (err) {
        if (statusRef.current && !statusRef.current.contains(e.target)) setIsStatusOpen(false);
        if (typeRef.current && !typeRef.current.contains(e.target)) setIsTypeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      try {
        await api.delete(`/order/${id}`);
        fetchData();
        showAlert({
          title: "Success",
          message: "Order deleted successfully",
          type: "success"
        });
      } catch (err) {
        showAlert({
          title: "Error",
          message: err.response?.data?.message || "Failed to delete order",
          type: "error"
        });
      }
    }
  };

  const handleOrderCreated = () => {
    fetchData();
    showAlert({
      title: "Success",
      message: "Order created successfully!",
      type: "success"
    });
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.name?.toLowerCase().includes(searchTerm.toLowerCase()) || o.uniqueId?.includes(searchTerm);
    const matchesStatus = statusFilter === "ALL" || o.overallStatus === statusFilter;
    const matchesType = typeFilter === "ALL" || (o.type && o.type.toUpperCase() === typeFilter.toUpperCase());
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case 'READY_TO_START': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      case 'DOCS_PENDING': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
      case 'IN_PROGRESS': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20';
      case 'COMPLETED': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
      case 'DRAFT': return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';
      default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-theme-body p-8 md:px-10 md:py-8 font-sans text-theme-text">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            className="inline-flex items-center gap-2 px-4 py-3 min-w-[96px] rounded-xl bg-theme-card border border-theme-border-light text-theme-text-secondary justify-center cursor-pointer transition-all hover:bg-theme-card-hover hover:border-theme-border hover:text-theme-text" 
            onClick={() => navigate(-1)}
          >
            <FiArrowLeft size={20} />
            <span className="text-sm ml-1">Back</span>
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold m-0 tracking-tight text-theme-text">Order Workflows</h1>
            <p className="text-sm text-theme-text-muted mt-1">Initialize and manage production cycles</p>
          </div>
        </div>
        <button 
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-brand-primary to-blue-600 border-none rounded-xl text-white font-semibold text-sm cursor-pointer transition-all shadow-md shadow-brand-primary/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-primary/40" 
          onClick={() => setShowAddModal(true)}
        >
          <FiPlus size={18} />
          <span>New Order</span>
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-theme-card border border-theme-border-light rounded-2xl p-5 flex items-center gap-4 transition-all relative overflow-hidden hover:border-theme-border hover:-translate-y-0.5 hover:shadow-xl before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-blue-500 before:to-cyan-400">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-blue-500/15 text-blue-500">
            <FiPackage size={22} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-theme-text-muted uppercase tracking-wider font-medium">Total Orders</span>
            <span className="text-3xl font-bold tracking-tight text-theme-text">{orders.length}</span>
          </div>
        </div>
        <div className="bg-theme-card border border-theme-border-light rounded-2xl p-5 flex items-center gap-4 transition-all relative overflow-hidden hover:border-theme-border hover:-translate-y-0.5 hover:shadow-xl before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-emerald-500 before:to-emerald-400">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/15 text-emerald-500">
            <FiCheckCircle size={22} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-theme-text-muted uppercase tracking-wider font-medium">Ready to Start</span>
            <span className="text-3xl font-bold tracking-tight text-theme-text">{orders.filter(o => o.overallStatus === 'READY_TO_START').length}</span>
          </div>
        </div>
        <div className="bg-theme-card border border-theme-border-light rounded-2xl p-5 flex items-center gap-4 transition-all relative overflow-hidden hover:border-theme-border hover:-translate-y-0.5 hover:shadow-xl before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-amber-500 before:to-amber-400">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-amber-500/15 text-amber-500">
            <FiClock size={22} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-theme-text-muted uppercase tracking-wider font-medium">Docs Pending</span>
            <span className="text-3xl font-bold tracking-tight text-theme-text">{orders.filter(o => o.overallStatus === 'DOCS_PENDING').length}</span>
          </div>
        </div>
        <div className="bg-theme-card border border-theme-border-light rounded-2xl p-5 flex items-center gap-4 transition-all relative overflow-hidden hover:border-theme-border hover:-translate-y-0.5 hover:shadow-xl before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-purple-500 before:to-purple-400">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-purple-500/15 text-purple-500">
            <FiActivity size={22} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-theme-text-muted uppercase tracking-wider font-medium">In Production</span>
            <span className="text-3xl font-bold tracking-tight text-theme-text">{orders.filter(o => o.overallStatus === 'IN_PROGRESS').length}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-theme-card border border-theme-border-light rounded-2xl p-4 md:px-5 flex flex-col md:flex-row justify-between items-center gap-5 mb-6">
        <div className="relative flex-1 w-full max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-text-muted" size={18} />
          <input
            type="text"
            className="w-full py-3 pl-12 pr-3 bg-theme-body border border-theme-border-light rounded-xl text-theme-text placeholder:text-theme-text-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
            style={{ paddingLeft: '3rem' }}
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative" ref={statusRef}>
            <button
              type="button"
              className="flex items-center justify-between px-4 py-2.5 bg-theme-body border border-theme-border-light rounded-xl text-sm font-medium text-theme-text cursor-pointer hover:bg-theme-card-hover transition-colors min-w-[140px]"
              onClick={(e) => { e.stopPropagation(); setIsStatusOpen(s => !s); }}
              aria-haspopup="true"
              aria-expanded={isStatusOpen}
            >
              <span>{statusFilter === 'ALL' ? 'All Status' : statusFilter.replace(/_/g, ' ')}</span>
              <FiFilter size={14} className="ml-2" />
            </button>
            {isStatusOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-theme-dropdown border border-theme-border-light rounded-xl shadow-xl z-50 overflow-hidden backdrop-blur-md">
                <div className="flex flex-col py-1">
                  <div className="px-4 py-2.5 text-sm text-theme-text hover:bg-theme-card-hover cursor-pointer transition-colors" onClick={() => { setStatusFilter('ALL'); setIsStatusOpen(false); }}>All Status</div>
                  <div className="px-4 py-2.5 text-sm text-theme-text hover:bg-theme-card-hover cursor-pointer transition-colors" onClick={() => { setStatusFilter('DRAFT'); setIsStatusOpen(false); }}>Draft</div>
                  <div className="px-4 py-2.5 text-sm text-theme-text hover:bg-theme-card-hover cursor-pointer transition-colors" onClick={() => { setStatusFilter('DOCS_PENDING'); setIsStatusOpen(false); }}>Docs Pending</div>
                  <div className="px-4 py-2.5 text-sm text-theme-text hover:bg-theme-card-hover cursor-pointer transition-colors" onClick={() => { setStatusFilter('READY_TO_START'); setIsStatusOpen(false); }}>Ready to Start</div>
                  <div className="px-4 py-2.5 text-sm text-theme-text hover:bg-theme-card-hover cursor-pointer transition-colors" onClick={() => { setStatusFilter('IN_PROGRESS'); setIsStatusOpen(false); }}>In Progress</div>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={typeRef}>
            <button
              type="button"
              className="flex items-center justify-between px-4 py-2.5 bg-theme-body border border-theme-border-light rounded-xl text-sm font-medium text-theme-text cursor-pointer hover:bg-theme-card-hover transition-colors min-w-[140px]"
              onClick={(e) => { e.stopPropagation(); setIsTypeOpen(s => !s); }}
              aria-haspopup="true"
              aria-expanded={isTypeOpen}
            >
              <span>{typeFilter === 'ALL' ? 'All Types' : typeFilter}</span>
              <FiLayers size={14} className="ml-2" />
            </button>
            {isTypeOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-theme-dropdown border border-theme-border-light rounded-xl shadow-xl z-50 overflow-hidden backdrop-blur-md">
                <div className="flex flex-col py-1">
                  <div className="px-4 py-2.5 text-sm text-theme-text hover:bg-theme-card-hover cursor-pointer transition-colors" onClick={() => { setTypeFilter('ALL'); setIsTypeOpen(false); }}>All Types</div>
                  <div className="px-4 py-2.5 text-sm text-theme-text hover:bg-theme-card-hover cursor-pointer transition-colors" onClick={() => { setTypeFilter('PANT'); setIsTypeOpen(false); }}>Pant</div>
                  <div className="px-4 py-2.5 text-sm text-theme-text hover:bg-theme-card-hover cursor-pointer transition-colors" onClick={() => { setTypeFilter('JACKET'); setIsTypeOpen(false); }}>Jacket</div>
                  <div className="px-4 py-2.5 text-sm text-theme-text hover:bg-theme-card-hover cursor-pointer transition-colors" onClick={() => { setTypeFilter('SHORTS'); setIsTypeOpen(false); }}>Shorts</div>
                  <div className="px-4 py-2.5 text-sm text-theme-text hover:bg-theme-card-hover cursor-pointer transition-colors" onClick={() => { setTypeFilter('OTHER'); setIsTypeOpen(false); }}>Other</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-theme-card border border-theme-border-light rounded-2xl overflow-hidden overflow-x-auto shadow-sm">
        <table className="w-full border-collapse text-left text-sm whitespace-nowrap">
          <thead>
            <tr>
              <th className="bg-theme-body/50 px-6 py-4 font-semibold text-theme-text-muted uppercase tracking-wider border-b border-theme-border-light text-xs">Order Details</th>
              <th className="bg-theme-body/50 px-6 py-4 font-semibold text-theme-text-muted uppercase tracking-wider border-b border-theme-border-light text-xs">Type</th>
              <th className="bg-theme-body/50 px-6 py-4 font-semibold text-theme-text-muted uppercase tracking-wider border-b border-theme-border-light text-xs">Unique ID</th>
              <th className="bg-theme-body/50 px-6 py-4 font-semibold text-theme-text-muted uppercase tracking-wider border-b border-theme-border-light text-xs">Status</th>
              <th className="bg-theme-body/50 px-6 py-4 font-semibold text-theme-text-muted uppercase tracking-wider border-b border-theme-border-light text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="py-12 px-6 border-b border-theme-border-light/50">
                  <div className="flex flex-col items-center justify-center gap-3 text-theme-text-muted">
                    <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    <span>Loading orders...</span>
                  </div>
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 px-6 border-b border-theme-border-light/50">
                  <div className="flex flex-col items-center justify-center gap-3 text-theme-text-muted">
                    <FiPackage size={40} />
                    <span>No orders found</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-theme-card-hover transition-colors group">
                  <td className="px-6 py-4 border-b border-theme-border-light/50 text-theme-text">
                    <div
                      className="flex flex-col gap-1 cursor-pointer"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      <span className="font-semibold text-base text-theme-text group-hover:text-brand-primary transition-colors">{order.name}</span>
                      <span className="text-xs text-theme-text-secondary">{order.clientName || 'No client'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-b border-theme-border-light/50 text-theme-text">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium text-xs">
                      {order.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b border-theme-border-light/50 text-theme-text">
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-theme-text-secondary bg-theme-body px-2 py-1 rounded-md border border-theme-border-light">
                      <FiHash size={12} />
                      {order.uniqueId?.slice(-8).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b border-theme-border-light/50 text-theme-text">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold inline-block ${getStatusClass(order.overallStatus)}`}>
                      {order.overallStatus?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b border-theme-border-light/50 text-theme-text">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        className="p-2 rounded-lg flex items-center justify-center transition-colors bg-theme-body border border-theme-border-light text-theme-text-muted hover:text-brand-primary hover:bg-brand-primary/10 hover:border-brand-primary/30"
                        onClick={() => navigate(`/orders/${order._id}`)}
                        title="View Details"
                      >
                        <FiChevronRight size={18} />
                      </button>
                      <button
                        className="p-2 rounded-lg flex items-center justify-center transition-colors bg-theme-body border border-theme-border-light text-theme-text-muted hover:text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/30"
                        onClick={() => { setOrderToEdit(order); setShowEditModal(true); }}
                        title="Edit Order"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        className="p-2 rounded-lg flex items-center justify-center transition-colors bg-theme-body border border-theme-border-light text-theme-text-muted hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30"
                        onClick={() => handleDelete(order._id)}
                        title="Delete Order"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Order Modal */}
      <CreateOrderModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        departments={departments}
        onOrderCreated={handleOrderCreated}
      />


      <EditOrderModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        orderData={orderToEdit}
        onUpdateSuccess={fetchData}
        departments={departments}
      />
    </div>
  );
};

export default OrdersList;
