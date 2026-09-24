import { useWishlist, useRemoveFromWishlist, useAddToCart } from '../api/hooks';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { FaTrash, FaShoppingCart } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';

export default function Wishlist() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: wishlist, isLoading } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const addToCart = useAddToCart();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">💝</div>
        <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
        <p className="text-gray-600 mb-6">Start adding items you love!</p>
        <Link to="/" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Wishlist ({wishlist.length})</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((item) => (
          <div key={item.id} className="card">
            <Link to={`/products/${item.product_id}`}>
              <img
                src={item.image_url || 'https://via.placeholder.com/400x300'}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
            </Link>
            
            <div className="p-4">
              <Link to={`/products/${item.product_id}`}>
                <h3 className="font-semibold text-lg mb-2 hover:text-primary-600">
                  {item.name}
                </h3>
              </Link>
              
              <div className="flex items-center gap-2 mb-2">
                {item.avg_rating && (
                  <>
                    <StarRating rating={parseFloat(item.avg_rating)} size="sm" />
                    <span className="text-sm text-gray-600">
                      ({item.review_count})
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-bold text-primary-600">
                  ${item.price}
                </span>
                {item.compare_price && (
                  <span className="text-gray-500 line-through">
                    ${item.compare_price}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    addToCart.mutate({ product_id: item.product_id });
                    removeFromWishlist.mutate(item.product_id);
                  }}
                  className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                  disabled={item.stock === 0}
                >
                  <FaShoppingCart />
                  {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                
                <button
                  onClick={() => removeFromWishlist.mutate(item.product_id)}
                  className="btn btn-secondary"
                  disabled={removeFromWishlist.isLoading}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
