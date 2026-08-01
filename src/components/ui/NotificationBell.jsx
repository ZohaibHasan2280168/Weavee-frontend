import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import {
    FiBell, FiPlusCircle, FiEdit2, FiTrash2, FiPackage,
    FiCheckCircle, FiXCircle, FiFileText, FiUserPlus,
    FiPlayCircle, FiInfo, FiCheck
} from 'react-icons/fi';

const NotificationBell = () => {
    const {
        notifications,
        unreadCount,
        loading,
        handleMarkAsRead,
        handleMarkAllAsRead,
        fetchNotifications
    } = useNotifications();

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Screen ke kahin bhi click karne se dropdown close karne ka logic
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Modern professional icons instead of emojis
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
            default: return <FiInfo />;
        }
    };

    // Soft theme-aware colors for icons
    const getNotificationStyle = (type) => {
        if (type.includes('REJECT') || type.includes('DELETE')) return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
        if (type.includes('APPROVE') || type.includes('SUBMIT')) return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
        if (type.includes('CREATE')) return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
        if (type.includes('UPDATE')) return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
        return { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' };
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification._id);
        }
        setIsOpen(false); // Click hone par dropdown close kar do

        // Navigation ke liye useNavigate hook use kiya hai (page reload bachane ke liye)
        if (notification.data?.screen) {
            navigate(notification.data.screen);
        }
    };

    return (
        <div className="notification-wrapper" ref={dropdownRef}>
            {/* Bell Trigger Button */}
            <button
                className={`bell-trigger ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <FiBell className="bell-icon" />
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown Panel */}
            {isOpen && (
                <div className="notification-dropdown">
                    {/* Header */}
                    <div className="dropdown-header">
                        <div className="header-title">
                            <h3>Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="unread-pill">{unreadCount} New</span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
                                <FiCheck size={14} /> Mark all read
                            </button>
                        )}
                    </div>

                    {/* Body / List */}
                    <div className="dropdown-body">
                        {loading && (
                            <div className="empty-state">
                                <div className="loader-spinner"></div>
                                <p>Loading...</p>
                            </div>
                        )}

                        {!loading && notifications.length === 0 && (
                            <div className="empty-state">
                                <FiBell className="empty-icon" />
                                <p>You're all caught up!</p>
                            </div>
                        )}

                        {!loading && notifications.map((notification) => {
                            const iconStyle = getNotificationStyle(notification.type);

                            return (
                                <div
                                    key={notification._id}
                                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    {/* Styled Icon */}
                                    <div
                                        className="notif-icon-wrapper"
                                        style={{ backgroundColor: iconStyle.bg, color: iconStyle.color }}
                                    >
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="notif-content">
                                        <h4 className="notif-title">{notification.title}</h4>
                                        <p className="notif-desc">{notification.body}</p>
                                        <span className="notif-time">
                                            {new Date(notification.createdAt).toLocaleDateString(undefined, {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    </div>

                                    {/* Unread Indicator Dot */}
                                    {!notification.isRead && <div className="unread-dot" />}
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="dropdown-footer">
                            <button
                                className="view-all-btn"
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate('/notifications');
                                }}
                            >
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Global Theme CSS */}
            <style jsx>{`
                .notification-wrapper {
                    position: relative;
                    display: inline-block;
                }

                .bell-trigger {
                    position: relative;
                    background: transparent;
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: var(--text-secondary);
                    transition: all 0.2s ease;
                }

                .bell-trigger:hover, .bell-trigger.active {
                    background: var(--card-hover-bg);
                    color: var(--text-primary);
                }

                .bell-icon {
                    width: 20px;
                    height: 20px;
                }

                .notification-badge {
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    background-color: #ef4444;
                    color: white;
                    font-size: 10px;
                    font-weight: 700;
                    height: 18px;
                    min-width: 18px;
                    padding: 0 5px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid var(--card-bg);
                }

                .notification-dropdown {
                    position: absolute;
                    top: calc(100% + 8px);
                    right: 0;
                    width: 360px;
                    background: var(--card-bg);
                    border: 1px solid var(--border-light);
                    border-radius: 16px;
                    box-shadow: var(--card-shadow-hover, 0 10px 25px -5px rgba(0, 0, 0, 0.1));
                    z-index: 1000;
                    overflow: hidden;
                    animation: slideDown 0.2s ease-out;
                }

                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .dropdown-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--border-light);
                    background: var(--card-bg);
                }

                .header-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .header-title h3 {
                    margin: 0;
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .unread-pill {
                    background: rgba(59, 130, 246, 0.1);
                    color: #3b82f6;
                    font-size: 0.75rem;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-weight: 600;
                }

                .mark-all-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    font-size: 0.8rem;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    transition: color 0.2s;
                }

                .mark-all-btn:hover {
                    color: #3b82f6;
                }

                .dropdown-body {
                    max-height: 400px;
                    overflow-y: auto;
                    overscroll-behavior: contain;
                }

                .dropdown-body::-webkit-scrollbar {
                    width: 6px;
                }
                .dropdown-body::-webkit-scrollbar-track {
                    background: transparent;
                }
                .dropdown-body::-webkit-scrollbar-thumb {
                    background: var(--border-light);
                    border-radius: 10px;
                }

                .empty-state {
                    padding: 40px 20px;
                    text-align: center;
                    color: var(--text-muted);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                }

                .empty-icon {
                    font-size: 2.5rem;
                    opacity: 0.5;
                }

                .notification-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--border-light);
                    cursor: pointer;
                    transition: background-color 0.2s;
                    position: relative;
                }

                .notification-item:last-child {
                    border-bottom: none;
                }

                .notification-item.unread {
                    background: var(--body-bg); /* Unread ke liye slight background change */
                }

                .notification-item:hover {
                    background: var(--card-hover-bg);
                }

                .notif-icon-wrapper {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.1rem;
                    flex-shrink: 0;
                }

                .notif-content {
                    flex: 1;
                    min-width: 0;
                }

                .notif-title {
                    margin: 0 0 4px 0;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .notification-item:not(.unread) .notif-title {
                    font-weight: 500;
                }

                .notif-desc {
                    margin: 0 0 6px 0;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .notif-time {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    font-weight: 500;
                }

                .unread-dot {
                    width: 8px;
                    height: 8px;
                    background-color: #3b82f6;
                    border-radius: 50%;
                    flex-shrink: 0;
                    margin-top: 6px;
                }

                .dropdown-footer {
                    padding: 12px;
                    border-top: 1px solid var(--border-light);
                    background: var(--card-bg);
                    text-align: center;
                }

                .view-all-btn {
                    width: 100%;
                    background: transparent;
                    border: none;
                    color: #3b82f6;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 8px;
                    transition: background 0.2s;
                }

                .view-all-btn:hover {
                    background: rgba(59, 130, 246, 0.05);
                }

                .loader-spinner {
                    width: 24px;
                    height: 24px;
                    border: 3px solid var(--border-light);
                    border-top-color: #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* Mobile Responsiveness */
                @media (max-width: 480px) {
                    .notification-dropdown {
                        position: fixed;
                        top: 70px;
                        left: 10px;
                        right: 10px;
                        width: auto;
                    }
                }
            `}</style>
        </div>
    );
};

export default NotificationBell;
