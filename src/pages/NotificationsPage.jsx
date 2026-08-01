import React, { useState, useEffect } from 'react';
import { useNotifications } from '../components/context/NotificationContext';
import { 
    FiBell, FiPlusCircle, FiEdit2, FiTrash2, FiPackage, 
    FiCheckCircle, FiXCircle, FiFileText, FiUserPlus, 
    FiPlayCircle, FiInfo, FiCheck, FiArrowLeft, FiArrowRight
} from 'react-icons/fi';

const NotificationsPage = () => {
    const { 
        notifications, 
        currentPage, 
        totalPages, 
        handleMarkAsRead, 
        handleMarkAllAsRead, 
        fetchNotifications, 
        loading 
    } = useNotifications();
    
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        fetchNotifications(currentPage);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Modern professional icons instead of basic emojis
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'OP_CREATE': return <FiPlusCircle />;
            case 'OP_UPDATE': return <FiEdit2 />;
            case 'OP_DELETE': return <FiTrash2 />;
            case 'ORDER_CREATE': return <FiPackage />;
            case 'ORDER_UPDATE': return <FiEdit2 />;
            case 'ORDER_DELETE': return <FiTrash2 />;
            case 'CHK_SUBMIT':
            case 'CHK_APPROVE': return <FiCheckCircle />;
            case 'CHK_REJECT': return <FiXCircle />;
            case 'PREREQ_UPLOAD': return <FiFileText />;
            case 'USER_CREATE': return <FiUserPlus />;
            case 'WORKFLOW_START': return <FiPlayCircle />;
            default: return <FiBell />;
        }
    };

    // Soft theme-aware colors for icons
    const getNotificationStyle = (type) => {
        if (!type) return { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' };
        if (type.includes('REJECT') || type.includes('DELETE')) return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
        if (type.includes('APPROVE') || type.includes('SUBMIT')) return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
        if (type.includes('CREATE')) return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
        if (type.includes('UPDATE')) return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
        return { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' };
    };

    const filteredNotifications = filterType === 'all'
        ? notifications
        : notifications.filter(n => n.type && n.type.toLowerCase().includes(filterType.toLowerCase()));

    const notificationTypes = [
        { value: 'all', label: 'All Notifications' },
        { value: 'op', label: 'Operations' },
        { value: 'order', label: 'Orders' },
        { value: 'chk', label: 'Checkpoints' },
        { value: 'prereq', label: 'Prerequisites' }
    ];

    return (
        <div className="notif-page-wrapper">
            <div className="notif-page-container">
                {/* Header */}
                <div className="notif-page-header">
                    <div className="header-title-block">
                        <div className="header-icon-box">
                            <FiBell size={24} />
                        </div>
                        <div>
                            <h1 className="page-title">Notifications</h1>
                            <p className="page-subtitle">Stay updated with your production workflow</p>
                        </div>
                    </div>
                    {notifications.some(n => !n.isRead) && (
                        <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
                            <FiCheck size={16} /> Mark all as read
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="notif-tabs">
                    {notificationTypes.map(type => (
                        <button
                            key={type.value}
                            onClick={() => setFilterType(type.value)}
                            className={`tab-btn ${filterType === type.value ? 'active' : ''}`}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>

                {/* Notifications List */}
                <div className="notif-list">
                    {loading && (
                        <div className="empty-state">
                            <div className="loader-spinner"></div>
                            <p>Loading notifications...</p>
                        </div>
                    )}

                    {!loading && filteredNotifications.length === 0 && (
                        <div className="empty-state">
                            <FiBell className="empty-icon" />
                            <h3>No notifications found</h3>
                            <p>
                                {filterType === 'all'
                                    ? 'You are all caught up!'
                                    : `No ${filterType} notifications yet.`}
                            </p>
                        </div>
                    )}

                    {!loading && filteredNotifications.map((notification) => {
                        const style = getNotificationStyle(notification.type);
                        
                        return (
                            <div
                                key={notification._id}
                                onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                                className={`notif-card ${!notification.isRead ? 'unread' : ''}`}
                            >
                                {/* Icon */}
                                <div 
                                    className="notif-icon-box"
                                    style={{ backgroundColor: style.bg, color: style.color }}
                                >
                                    {getNotificationIcon(notification.type)}
                                </div>

                                {/* Content */}
                                <div className="notif-details">
                                    <div className="notif-title-row">
                                        <h4 className="notif-title">{notification.title}</h4>
                                        {notification.type && (
                                            <span className="notif-type-badge">{notification.type.replace(/_/g, ' ')}</span>
                                        )}
                                    </div>
                                    <p className="notif-body">{notification.body}</p>
                                    <div className="notif-meta">
                                        {new Date(notification.createdAt).toLocaleString(undefined, {
                                            weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </div>
                                </div>

                                {/* Unread Indicator Dot */}
                                {!notification.isRead && <div className="unread-indicator" />}
                            </div>
                        );
                    })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination-container">
                        <button
                            className="page-btn nav-btn"
                            onClick={() => fetchNotifications(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <FiArrowLeft /> Previous
                        </button>

                        <div className="page-numbers">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => fetchNotifications(page)}
                                    className={`page-btn ${currentPage === page ? 'active' : ''}`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            className="page-btn nav-btn"
                            onClick={() => fetchNotifications(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next <FiArrowRight />
                        </button>
                    </div>
                )}
            </div>

            {/* Global Theme Styles */}
            <style jsx>{`
                .notif-page-wrapper {
                    min-height: 100vh;
                    background: var(--main-bg);
                    padding: 2rem;
                    color: var(--text-primary);
                    font-family: 'Inter', system-ui, sans-serif;
                    transition: background 0.3s ease;
                }

                .notif-page-container {
                    max-width: 900px;
                    margin: 0 auto;
                }

                .notif-page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .header-title-block {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .header-icon-box {
                    width: 56px;
                    height: 56px;
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
                    color: #3b82f6;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .page-title {
                    font-size: 1.875rem;
                    font-weight: 700;
                    margin: 0 0 0.25rem 0;
                    color: var(--text-primary);
                }

                .page-subtitle {
                    font-size: 0.95rem;
                    color: var(--text-secondary);
                    margin: 0;
                }

                .mark-all-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.6rem 1.2rem;
                    background: var(--card-bg);
                    border: 1px solid var(--border-light);
                    color: var(--text-primary);
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }

                .mark-all-btn:hover {
                    background: #3b82f6;
                    border-color: #3b82f6;
                    color: white;
                    transform: translateY(-1px);
                }

                .notif-tabs {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                    border-bottom: 1px solid var(--border-light);
                    padding-bottom: 1rem;
                    overflow-x: auto;
                    scrollbar-width: none; 
                }

                .notif-tabs::-webkit-scrollbar {
                    display: none; 
                }

                .tab-btn {
                    padding: 0.5rem 1rem;
                    background: transparent;
                    color: var(--text-secondary);
                    border: none;
                    border-radius: 99px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .tab-btn:hover {
                    background: var(--card-hover-bg);
                    color: var(--text-primary);
                }

                .tab-btn.active {
                    background: var(--text-primary);
                    color: var(--card-bg);
                }

                .notif-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .notif-card {
                    background: var(--card-bg);
                    border: 1px solid var(--border-light);
                    border-radius: 16px;
                    padding: 1.5rem;
                    display: flex;
                    gap: 1.25rem;
                    align-items: flex-start;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                    box-shadow: var(--card-shadow, 0 2px 4px rgba(0,0,0,0.02));
                }

                .notif-card.unread {
                    background: var(--card-hover-bg);
                    border-color: rgba(59, 130, 246, 0.3);
                }

                .notif-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--card-shadow-hover, 0 8px 16px rgba(0,0,0,0.06));
                    border-color: var(--text-muted);
                }

                .notif-icon-box {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    flex-shrink: 0;
                }

                .notif-details {
                    flex: 1;
                    min-width: 0;
                }

                .notif-title-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 1rem;
                    margin-bottom: 0.5rem;
                }

                .notif-title {
                    font-size: 1.05rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0;
                    line-height: 1.4;
                }

                .notif-card:not(.unread) .notif-title {
                    font-weight: 500;
                }

                .notif-type-badge {
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding: 0.25rem 0.6rem;
                    background: var(--body-bg);
                    border: 1px solid var(--border-light);
                    border-radius: 6px;
                    color: var(--text-muted);
                    white-space: nowrap;
                }

                .notif-body {
                    font-size: 0.95rem;
                    color: var(--text-secondary);
                    margin: 0 0 0.75rem 0;
                    line-height: 1.5;
                }

                .notif-meta {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    font-weight: 500;
                }

                .unread-indicator {
                    position: absolute;
                    top: 1.5rem;
                    right: 1.5rem;
                    width: 10px;
                    height: 10px;
                    background-color: #3b82f6;
                    border-radius: 50%;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }

                .empty-state {
                    padding: 4rem 2rem;
                    text-align: center;
                    background: var(--card-bg);
                    border-radius: 16px;
                    border: 1px dashed var(--border-light);
                }

                .empty-icon {
                    font-size: 3rem;
                    color: var(--text-muted);
                    opacity: 0.5;
                    margin-bottom: 1rem;
                }

                .empty-state h3 {
                    margin: 0 0 0.5rem 0;
                    color: var(--text-primary);
                    font-size: 1.25rem;
                }

                .empty-state p {
                    margin: 0;
                    color: var(--text-secondary);
                }

                .loader-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid var(--border-light);
                    border-top-color: #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .pagination-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 1rem;
                    margin-top: 3rem;
                }

                .page-numbers {
                    display: flex;
                    gap: 0.5rem;
                }

                .page-btn {
                    padding: 0.5rem 1rem;
                    background: var(--card-bg);
                    border: 1px solid var(--border-light);
                    color: var(--text-secondary);
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .page-btn.nav-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .page-btn:hover:not(:disabled) {
                    background: var(--card-hover-bg);
                    color: var(--text-primary);
                    border-color: var(--text-muted);
                }

                .page-btn.active {
                    background: #3b82f6;
                    color: white;
                    border-color: #3b82f6;
                }

                .page-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                @media (max-width: 640px) {
                    .notif-page-wrapper { padding: 1rem; }
                    .notif-card { padding: 1rem; flex-direction: column; gap: 1rem; }
                    .notif-title-row { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
                    .unread-indicator { top: 1rem; right: 1rem; }
                    .pagination-container { flex-direction: column; }
                }
            `}</style>
        </div>
    );
};

export default NotificationsPage;
