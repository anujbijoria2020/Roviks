import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import DashboardLayout from './layouts/DashboardLayout'
import AdminAnnouncements from './pages/admin/AdminAnnouncements'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminDropshippers from './pages/admin/AdminDropshippers'
import AdminOrders from './pages/admin/AdminOrders'
import AdminProducts from './pages/admin/AdminProducts'
import LoginPage from './pages/auth/LoginPage'
import PendingApprovalPage from './pages/auth/PendingApprovalPage'
import RegisterPage from './pages/auth/RegisterPage'
import ContactPage from './pages/ContactPage'
import CatalogPage from './pages/dropshipper/CatalogPage'
import DashboardHome from './pages/dropshipper/DashboardHome'
import MyOrdersPage from './pages/dropshipper/MyOrdersPage'
import NotificationsPage from './pages/dropshipper/NotificationsPage'
import ProductDetailPage from './pages/dropshipper/ProductDetailPage'
import ProfilePage from './pages/dropshipper/ProfilePage'
import LandingPage from './pages/LandingPage'
import NotFoundPage from './pages/NotFoundPage'
import StartSellingPage from './pages/StartSellingPage'

const DashboardCatalogRedirect = () => {
  const { id } = useParams()

  return <Navigate to={id ? `/catalog/${id}` : '/catalog'} replace />
}

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/catalog/:id" element={<ProductDetailPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/start-selling" element={<StartSellingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/pending" element={<PendingApprovalPage />} />

      <Route element={<ProtectedRoute allowedRoles={['dropshipper']} />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="catalog" element={<DashboardCatalogRedirect />} />
          <Route path="catalog/:id" element={<DashboardCatalogRedirect />} />
          <Route path="orders" element={<MyOrdersPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="dropshippers" element={<AdminDropshippers />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
