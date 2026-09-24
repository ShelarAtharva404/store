import { useState } from "react";
import { useProducts, useCategories, useBrands } from "../api/hooks";
import ProductCard from "../components/ProductCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { FaFilter } from "react-icons/fa";

export default function Shop() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const { data: productsData, isLoading, error } = useProducts({
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    sort,
  });

  const { data: categories } = useCategories();
  const { data: brands } = useBrands();

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
    setBrand("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-xl p-8 mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to PERN Store</h1>
        <p className="text-lg opacity-90">Discover amazing products at great prices</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input flex-1"
          />
          
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input md:w-48">
            <option value="newest">Newest</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="name">Name</option>
            <option value="popular">Most Popular</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline flex items-center gap-2"
          >
            <FaFilter /> Filters
          </button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
            >
              <option value="">All Categories</option>
              {categories?.map((cat) => (
                <option key={cat.category} value={cat.category}>
                  {cat.category} ({cat.count})
                </option>
              ))}
            </select>

            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="input"
            >
              <option value="">All Brands</option>
              {brands?.map((br) => (
                <option key={br.brand} value={br.brand}>
                  {br.brand} ({br.count})
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="input"
            />

            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="input"
            />

            <button onClick={handleClearFilters} className="btn btn-secondary md:col-span-4">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          Could not load products. Please make sure the backend is running on port 5000.
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && productsData && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {productsData.pagination.total} Products
            </h2>
            {productsData.pagination.totalPages > 1 && (
              <div className="text-sm text-gray-600">
                Page {productsData.pagination.page} of {productsData.pagination.totalPages}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productsData.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {productsData.data.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600">No products found</p>
              <p className="text-gray-500 mt-2">Try adjusting your filters</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
