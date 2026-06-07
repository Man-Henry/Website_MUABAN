import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import Home from '../pages/Home';
import Auth from '../pages/Auth';
import Shop from '../pages/Shop';
import ListingDetail from '../pages/ListingDetail';
import SearchResults from '../pages/SearchResults';
import PostListing from '../pages/PostListing';
import Messages from '../pages/Messages';
import Bookmarks from '../pages/Bookmarks';
import Profile from '../pages/Profile';
import MyListings from '../pages/MyListings';
import About from '../pages/About';
import Terms from '../pages/Terms';
import Privacy from '../pages/Privacy';
import Contact from '../pages/Contact';
import NotFound from '../pages/NotFound';
import ProtectedRoute from './ProtectedRoute';
import AuthRoute from './AuthRoute';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
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
            <Route path="/tin-nhan" element={<Messages />} />
            <Route path="/da-luu" element={<Bookmarks />} />
            <Route path="/tai-khoan" element={<Profile />} />
            <Route path="/tin-dang" element={<MyListings />} />
          </Route>

          {/* 404 catch-all */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
