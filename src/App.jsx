import React, { Suspense, lazy } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/context/AuthContext";
import { ThemeProvider, useTheme } from "./components/context/ThemeContext";
import AlertProvider from "./components/ui/AlertProvider";

// --- Components ---

// --- Lazy Page Imports ---
const RoleUserList = lazy(() => import("./pages/Dashboard/User/RoleUserList"));
const RoleSelection = lazy(() => import("./pages/Dashboard/Home/RoleSelection"));
const ModeratorLogin = lazy(() => import("./pages/Auth/Moderator/ModeratorLogin"));
const VerifyEmailPage = lazy(() => import("./pages/Dashboard/Profile/VerifyEmailPage"));
const AdminLoginPage = lazy(() => import("./pages/Auth/Admin/LoginPage"));
const AdminSignUpPage = lazy(() => import("./pages/Auth/Admin/SignUpPage"));
const TermsPage = lazy(() => import("./pages/Auth/Legal/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/Auth/Legal/PrivacyPage"));
const ForgotPassword = lazy(() => import("./pages/Dashboard/Profile/ForgotPasswordPage"));
const ResetPassword = lazy(() => import("./pages/Dashboard/Profile/ResetPasswordPage"));

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Departments = lazy(() => import("./pages/Dashboard/Departments/DepartmentsPage"));
const DepartmentDetail = lazy(() => import("./pages/Dashboard/Departments/DepartmentDetailPage"));
const AddDepartment = lazy(() => import("./pages/Dashboard/Departments/AddDepartmentPage"));
const UpdateDepartments = lazy(() => import("./pages/Dashboard/Departments/UpdateDepartmentsPage"));

const OrdersList = lazy(() => import("./pages/Dashboard/Order/OrdersPage"));
const Order = lazy(() => import("./pages/Dashboard/Order/OrderDetailPage"));

const OrderRequestsPage = lazy(() => import("./pages/Dashboard/OrderRequest/OrderRequestsPage"));
const OrderRequestDetailPage = lazy(() => import("./pages/Dashboard/OrderRequest/OrderRequestDetailPage"));

const CarouselManagement = lazy(() => import("./pages/Dashboard/Carousel/CarouselManagement"));

const OperationAdd = lazy(() => import("./pages/Dashboard/Departments/Operations/OperationAddPage"));
const OperationEdit = lazy(() => import("./pages/Dashboard/Departments/Operations/OperationEditPage"));
const CheckpointAdd = lazy(() => import("./pages/Dashboard/Departments/Checkpoints/CheckpointAddPage"));
const CheckpointEdit = lazy(() => import("./pages/Dashboard/Departments/Checkpoints/CheckpointEditPage"));

const Users = lazy(() => import("./pages/Dashboard/User/UsersPage"));
const AddUser = lazy(() => import("./pages/Dashboard/User/AddUserPage"));
const UpdateUser = lazy(() => import("./pages/Dashboard/User/UpdateUserPage"));
const Role = lazy(() => import("./pages/Dashboard/User/Role"));
const Settings = lazy(() => import("./pages/Dashboard/Profile/SettingsPage"));
const ProfilePage = lazy(() => import("./pages/Dashboard/Profile/ProfilePage"));
import MustChangePasswordModal from "./components/modals/MustChangePasswordModal";
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));

import ProtectedRoute from "./components/auth/ProtectedRoute";
const AuditLogPage = lazy(() => import("./pages/Dashboard/Audit/AuditLogPage"));

import { NotificationProvider } from "./components/context/NotificationContext";
import MainLayout from "./components/layout/MainLayout";
import LandingPage from "./pages/Landing/LandingPage";
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ThemeProvider>
            <AlertProvider>


              <MustChangePasswordModal />
              <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff', backgroundColor: '#000' }}>Loading...</div>}>
                <Routes>
                  {/* ==========================================
                    PUBLIC ROUTES (No Login)
                ========================================== */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/role-selection" element={<RoleSelection />} />
                  <Route path="/moderator-login" element={<ModeratorLogin />} />
                  <Route path="/admin-login" element={<AdminLoginPage />} />
                  <Route path="/admin-signup" element={<AdminSignUpPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route
                    path="/verify-email/:token"
                    element={<VerifyEmailPage />}
                  />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route
                    path="/reset-password/:token"
                    element={<ResetPassword />}
                  />

                  {/* ==========================================
                    PROTECTED ROUTES (Wrap in MainLayout)
                ========================================== */}
                  <Route element={<MainLayout />}>
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/users"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                          <Users />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/audit-logs"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                          <AuditLogPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/carousel"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                          <CarouselManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/users/role/:roleName"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                          <RoleUserList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/add-user"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                          <AddUser />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/update-user/:id"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                          <UpdateUser />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                          <Settings />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/departments"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
                          <Departments />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/add-department"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
                          <AddDepartment />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/update-department/:id"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
                          <UpdateDepartments />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/department-detail/:id"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
                          <DepartmentDetail />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/orderlist"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
                          <OrdersList />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/orders/:orderId"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
                          <Order />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/departments/:deptId/add-operation"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
                          <OperationAdd />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/edit-operation/:opId"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
                          <OperationEdit />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/departments/:deptId/operations/:opId/add-checkpoint"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
                          <CheckpointAdd />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/departments/:deptId/operations/:opId/edit-checkpoint/:chkId"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
                          <CheckpointEdit />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/role/:role"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
                          <Role />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/notifications"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR", "DEPT_HEAD", "QC", "CLIENT"]}>
                          <NotificationsPage />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/chat"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR", "DEPT_HEAD", "QC", "CLIENT"]}>
                          <ChatPage />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/moderator-dashboard"
                      element={
                        <ProtectedRoute allowedRoles={["MODERATOR"]}>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/order-requests"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR", "CLIENT"]}>
                          <OrderRequestsPage />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/order-requests/:id"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR", "CLIENT"]}>
                          <OrderRequestDetailPage />
                        </ProtectedRoute>
                      }
                    />
                  </Route>

                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Suspense>

            </AlertProvider>
          </ThemeProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
