import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useCartStore } from "../store/useCartStore";
import { FaShoppingCart, FaHeart, FaUser } from "react-icons/fa";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const cartCount = useCartStore((state) => state.cartCount);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-primary-600 hover:text-primary-700">
            PERN Store
          </Link>
          
          <div className="flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors">
              Shop
            </Link>
            
            {isAuthenticated && (
              <Link to="/wishlist" className="text-gray-700 hover:text-primary-600 transition-colors flex items-center gap-2">
                <FaHeart />
                <span className="hidden md:inline">Wishlist</span>
              </Link>
            )}
            
            <Link to="/cart" className="text-gray-700 hover:text-primary-600 transition-colors relative flex items-center gap-2">
              <FaShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
              <span className="hidden md:inline">Cart</span>
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/orders" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Orders
                </Link>
                <Link to="/profile" className="text-gray-700 hover:text-primary-600 transition-colors flex items-center gap-2">
                  <FaUser />
                  <span className="hidden md:inline">{user?.name}</span>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="btn btn-secondary text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary text-sm">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
