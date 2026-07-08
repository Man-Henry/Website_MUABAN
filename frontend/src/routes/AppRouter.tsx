import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import MainLayout from '../layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import AuthRoute from './AuthRoute';
import PageLoader from '../components/common/PageLoader';

// ===== Lazy-loaded Pages =====
const Home = lazy(() => import('../pages/Home'));
const Auth = lazy(() => import('../pages/Auth'));
const Shop = lazy(() => import('../pages/Shop'));
const ListingDetail = lazy(() => import('../pages/ListingDetail'));
const SearchResults = lazy(() => import('../pages/SearchResults'));
const PostListing = lazy(() => import('../pages/PostListing'));
const EditListing = lazy(() => import('../pages/EditListing'));
const Messages = lazy(() => import('../pages/Messages'));
const Bookmarks = lazy(() => import('../pages/Bookmarks'));
const Profile = lazy(() => import('../pages/Profile'));
const MyListings = lazy(() => import('../pages/MyListings'));
const About = lazy(() => import('../pages/About'));
const Terms = lazy(() => import('../pages/Terms'));
const Privacy = lazy(() => import('../pages/Privacy'));
const Contact = lazy(() => import('../pages/Contact'));
const NotFound = lazy(() => import('../pages/NotFound'));

const AppRouter: React.FC = () => {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Main layout wrapper */}
            <Route element={<MainLayout />}>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/cua-hang" element={<Shop />} />
              <Route path="/san-pham/:id" element={<ListingDetail />} />
              <Route path="/tim-kiem" element={<SearchResults />} />

              {/* Static pages */}
              <Route path="/ve-chung-toi" element={<About />} />
              <Route path="/dieu-khoan" element={<Terms />} />
              <Route path="/chinh-sach-bao-mat" element={<Privacy />} />
              <Route path="/lien-he" element={<Contact />} />

              {/* Auth routes — redirect if already logged in */}
              <Route element={<AuthRoute />}>
                <Route path="/dang-nhap" element={<Auth initialTab="login" />} />
                <Route path="/dang-ky" element={<Auth initialTab="register" />} />
              </Route>

              {/* Protected routes — require authentication */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dang-tin" element={<PostListing />} />
                <Route path="/chinh-sua/:id" element={<EditListing />} />
                <Route path="/tin-nhan" element={<Messages />} />
                <Route path="/da-luu" element={<Bookmarks />} />
                <Route path="/tai-khoan" element={<Profile />} />
                <Route path="/tin-dang" element={<MyListings />} />
              </Route>

              {/* 404 catch-all */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  );
};

export default AppRouter;
