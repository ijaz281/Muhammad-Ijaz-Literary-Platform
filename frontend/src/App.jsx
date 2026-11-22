import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import ContactPage from "./pages/ContactPage";
import SearchPage from "./pages/SearchPage";
import AccountPage from "./pages/AccountPage";
import CartPage from "./pages/CartPage";
import NotFoundPage from "./pages/NotFoundPage";

import BooksPage from "./bookstore/pages/BooksPage";
import BookDetailsPage from "./bookstore/pages/BookDetailsPage";

import LiteraturePage from "./literature/pages/LiteraturePage";
import LiteratureDetailsPage from "./literature/pages/LiteratureDetailsPage";

import AuthorPage from "./profiles/pages/AuthorPage";
import CommunityProfilePage from "./profiles/pages/CommunityProfilePage";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />

        <Route path="/about" element={<AuthorPage mode="about" />} />

        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/:slug" element={<BookDetailsPage />} />

        <Route path="/literature" element={<LiteraturePage />} />
        <Route
          path="/literature/:slug"
          element={<LiteratureDetailsPage />}
        />

        <Route path="/authors" element={<AuthorPage mode="authors" />} />
        <Route path="/community/:username" element={<CommunityProfilePage />} />

        <Route path="/contact" element={<ContactPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/cart" element={<CartPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;