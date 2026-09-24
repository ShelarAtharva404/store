import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart, FaShoppingCart } from "react-icons/fa";
import { useAuthStore } from "../store/useAuthStore";
import { useAddToCart, useAddToWishlist, useRemoveFromWishlist, useIsInWishlist } from "../api/hooks";
import StarRating from "./StarRating";

export default function ProductCard({ product }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { data: isInWishlist } = useIsInWishlist(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart.mutate({ product_id: product.id, quantity: 1 });
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    if (isInWishlist) {
      removeFromWishlist.mutate(product.id);
    } else {
      addToWishlist.mutate(product.id);
    }
  };

  const discount = product.compare_price 
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  return (
    <div className="card group relative">
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative overflow-hidden">
          <img 
            src={product.image_url || 'https://via.placeholder.com/400x300'} 
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_featured && (
              <span className="badge badge-warning">Featured</span>
            )}
            {discount > 0 && (
              <span className="badge badge-error">-{discount}%</span>
            )}
            {product.stock === 0 && (
              <span className="badge bg-gray-600 text-white">Out of Stock</span>
            )}
          </div>

          {/* Wishlist Button */}
          {isAuthenticated && (
            <button
              onClick={handleWishlistToggle}
              className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform"
              disabled={addToWishlist.isLoading || removeFromWishlist.isLoading}
            >
              {isInWishlist ? (
                <FaHeart className="text-red-500" size={18} />
              ) : (
                <FaRegHeart className="text-gray-600" size={18} />
              )}
            </button>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>

          {product.brand && (
            <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
          )}

          {/* Rating */}
          {product.avg_rating && (
            <div className="flex items-center gap-2 mb-2">
              <StarRating rating={parseFloat(product.avg_rating)} size="sm" />
              <span className="text-sm text-gray-600">
                ({product.review_count || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold text-primary-600">
              ${parseFloat(product.price).toFixed(2)}
            </span>
            {product.compare_price && (
              <span className="text-gray-500 line-through text-sm">
                ${parseFloat(product.compare_price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock Info */}
          {product.stock > 0 && product.stock <= 10 && (
            <p className="text-sm text-orange-500 mb-2">
              Only {product.stock} left in stock
            </p>
          )}
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="p-4 pt-0">
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || addToCart.isLoading}
          className="w-full btn btn-primary flex items-center justify-center gap-2"
        >
          <FaShoppingCart />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
