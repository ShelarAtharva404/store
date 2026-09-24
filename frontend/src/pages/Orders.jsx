import { useNavigate, Link } from "react-router-dom";
import { useOrders } from "../api/hooks";
import { useAuthStore } from "../store/useAuthStore";
import LoadingSpinner from "../components/LoadingSpinner";
import { FaBox, FaCheckCircle, FaClock, FaTruck } from "react-icons/fa";

export default function Orders() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: orders, isLoading } = useOrders();

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <FaCheckCircle className="text-green-500" />;
      case 'shipped':
        return <FaTruck className="text-blue-500" />;
      case 'processing':
        return <FaClock className="text-yellow-500" />;
      default:
        return <FaBox className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge badge-warning',
      paid: 'badge badge-info',
      processing: 'badge badge-info',
      shipped: 'badge badge-info',
      delivered: 'badge badge-success',
      cancelled: 'badge badge-error'
    };
    return badges[status] || 'badge';
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📦</div>
        <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
        <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
        <Link to="/" className="btn btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Orders ({orders.length})</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="card p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(order.status)}
                  <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                  <span className={getStatusBadge(order.status)}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-primary-600">
                  ${parseFloat(order.total).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  {order.item_count || 0} item{order.item_count !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Order Details */}
            <div className="border-t pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Payment Status</p>
                <p className="font-semibold capitalize">{order.payment_status || 'Pending'}</p>
              </div>
              
              <div>
                <p className="text-gray-600">Payment Method</p>
                <p className="font-semibold capitalize">
                  {order.payment_method?.replace('_', ' ') || 'N/A'}
                </p>
              </div>
              
              {order.tracking_number && (
                <div>
                  <p className="text-gray-600">Tracking</p>
                  <p className="font-semibold">{order.tracking_number}</p>
                </div>
              )}

              {order.subtotal && (
                <div>
                  <p className="text-gray-600">Subtotal</p>
                  <p className="font-semibold">${parseFloat(order.subtotal).toFixed(2)}</p>
                </div>
              )}
            </div>

            {/* Order Items Preview */}
            {order.items && order.items.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                <div className="space-y-2">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.product_name} x {item.quantity}
                      </span>
                      <span className="font-semibold">
                        ${parseFloat(item.subtotal || item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-sm text-gray-500">
                      + {order.items.length - 3} more item(s)
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 pt-4 border-t flex gap-2">
              <Link
                to={`/orders/${order.id}`}
                className="btn btn-outline flex-1"
              >
                View Details
              </Link>
              {order.status === 'delivered' && (
                <button className="btn btn-primary">
                  Write Review
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
