import { useNavigate, Link } from "react-router-dom";
import { useCart, useUpdateCartItem, useRemoveCartItem, useCheckout, useAddresses } from "../api/hooks";
import { useAuthStore } from "../store/useAuthStore";
import { FaTrash, FaMinus, FaPlus, FaShoppingBag } from "react-icons/fa";
import LoadingSpinner from "../components/LoadingSpinner";
import { useState } from "react";

export default function Cart() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: cartItems, isLoading } = useCart();
  const { data: addresses } = useAddresses();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const checkoutMutation = useCheckout();
  
  const [selectedAddress, setSelectedAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [showCheckout, setShowCheckout] = useState(false);

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handleQuantityChange = (id, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    updateCartItem.mutate({ id, quantity: newQty });
  };

  const handleCheckout = () => {
    if (!selectedAddress) {
      return;
    }
    
    checkoutMutation.mutate(
      {
        address_id: parseInt(selectedAddress),
        payment_method: paymentMethod,
      },
      {
        onSuccess: () => {
          navigate("/orders");
        },
      }
    );
  };

  const subtotal = cartItems?.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0) || 0;
  const tax = subtotal * 0.1; // 10% tax
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + tax + shipping;

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Start adding items to your cart!</p>
        <Link to="/" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart ({cartItems.length} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="card p-4">
              <div className="flex gap-4">
                <Link to={`/products/${item.product_id}`}>
                  <img
                    src={item.image_url || 'https://via.placeholder.com/150'}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </Link>

                <div className="flex-1">
                  <Link to={`/products/${item.product_id}`}>
                    <h3 className="font-semibold text-lg hover:text-primary-600">
                      {item.name}
                    </h3>
                  </Link>
                  
                  {item.variant_name && (
                    <p className="text-sm text-gray-600">{item.variant_name}</p>
                  )}

                  <p className="text-xl font-bold text-primary-600 mt-2">
                    ${parseFloat(item.price).toFixed(2)}
                  </p>

                  {item.stock <= 10 && item.stock > 0 && (
                    <p className="text-sm text-orange-500 mt-1">
                      Only {item.stock} left in stock
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeCartItem.mutate(item.id)}
                    className="text-red-500 hover:text-red-700"
                    disabled={removeCartItem.isLoading}
                  >
                    <FaTrash />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                      className="btn btn-secondary p-2"
                      disabled={item.quantity <= 1 || updateCartItem.isLoading}
                    >
                      <FaMinus size={12} />
                    </button>
                    <span className="w-12 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                      className="btn btn-secondary p-2"
                      disabled={item.quantity >= item.stock || updateCartItem.isLoading}
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>

                  <p className="font-bold">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4 pb-4 border-b">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%)</span>
                <span className="font-semibold">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">
                  {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {subtotal < 50 && shipping > 0 && (
                <p className="text-sm text-gray-500">
                  Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                </p>
              )}
            </div>

            <div className="flex justify-between text-xl font-bold mb-6">
              <span>Total</span>
              <span className="text-primary-600">${total.toFixed(2)}</span>
            </div>

            {!showCheckout ? (
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full btn btn-primary flex items-center justify-center gap-2"
              >
                <FaShoppingBag />
                Proceed to Checkout
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Shipping Address
                  </label>
                  {addresses && addresses.length > 0 ? (
                    <select
                      value={selectedAddress}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                      className="input"
                      required
                    >
                      <option value="">Select address</option>
                      {addresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.full_name} - {addr.city}, {addr.state}
                          {addr.is_default && " (Default)"}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600 mb-2">No addresses saved</p>
                      <Link to="/profile" className="text-primary-600 hover:underline">
                        Add an address in Profile
                      </Link>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="input"
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="stripe">Stripe</option>
                  </select>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={!selectedAddress || checkoutMutation.isLoading}
                  className="w-full btn btn-primary flex items-center justify-center gap-2"
                >
                  {checkoutMutation.isLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaShoppingBag />
                      Place Order
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowCheckout(false)}
                  className="w-full btn btn-secondary"
                >
                  Back
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
