import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProduct, useProductReviews, useAddToCart, useAddReview, useAddToWishlist, useRemoveFromWishlist, useIsInWishlist } from "../api/hooks";
import { useAuthStore } from "../store/useAuthStore";
import LoadingSpinner from "../components/LoadingSpinner";
import StarRating from "../components/StarRating";
import { FaHeart, FaRegHeart, FaShoppingCart, FaArrowLeft, FaCheck } from "react-icons/fa";

export default function ProductDetail() {
  const { id } = useParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: product, isLoading } = useProduct(id);
  const { data: reviewsData } = useProductReviews(id);
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { data: isInWishlist } = useIsInWishlist(id);
  const addReview = useAddReview();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-2">Product not found</h2>
        <Link to="/" className="text-primary-600 hover:underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart.mutate({ product_id: product.id, quantity });
  };

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      removeFromWishlist.mutate(product.id);
    } else {
      addToWishlist.mutate(product.id);
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    addReview.mutate(
      {
        product_id: product.id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      },
      {
        onSuccess: () => {
          setShowReviewForm(false);
          setReviewRating(5);
          setReviewTitle("");
          setReviewComment("");
        },
      }
    );
  };

  const images = product.images || (product.image_url ? [{ url: product.image_url }] : []);
  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto">
      <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6">
        <FaArrowLeft /> Back to products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="card p-0 mb-4">
            <img
              src={images[selectedImage]?.url || images[selectedImage]?.image_url || 'https://via.placeholder.com/600'}
              alt={product.name}
              className="w-full h-96 object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`card p-0 ${selectedImage === idx ? 'ring-2 ring-primary-600' : ''}`}
                >
                  <img
                    src={img.url || img.image_url}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {product.brand && (
            <p className="text-sm text-gray-600 uppercase tracking-wide mb-2">{product.brand}</p>
          )}
          
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          {/* Rating */}
          {product.avg_rating && (
            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={parseFloat(product.avg_rating)} />
              <span className="text-gray-600">
                {parseFloat(product.avg_rating).toFixed(1)} ({product.review_count} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-bold text-primary-600">
              ${parseFloat(product.price).toFixed(2)}
            </span>
            {product.compare_price && (
              <>
                <span className="text-2xl text-gray-500 line-through">
                  ${parseFloat(product.compare_price).toFixed(2)}
                </span>
                <span className="badge badge-error">-{discount}%</span>
              </>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{product.description}</p>
            </div>
          )}

          {/* Details */}
          <div className="mb-6 space-y-2">
            {product.category && (
              <p className="text-sm">
                <span className="text-gray-600">Category:</span>{" "}
                <span className="font-medium">{product.category}</span>
              </p>
            )}
            {product.sku && (
              <p className="text-sm">
                <span className="text-gray-600">SKU:</span>{" "}
                <span className="font-medium">{product.sku}</span>
              </p>
            )}
            <p className="text-sm">
              <span className="text-gray-600">Availability:</span>{" "}
              <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </p>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, idx) => (
                  <span key={idx} className="badge bg-gray-200 text-gray-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Quantity:</label>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                className="input w-20 text-center"
                disabled={product.stock === 0}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addToCart.isLoading}
              className="flex-1 btn btn-primary flex items-center justify-center gap-2"
            >
              <FaShoppingCart />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            {isAuthenticated && (
              <button
                onClick={handleWishlistToggle}
                className="btn btn-outline flex items-center gap-2"
                disabled={addToWishlist.isLoading || removeFromWishlist.isLoading}
              >
                {isInWishlist ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
              </button>
            )}
          </div>

          {product.stock > 0 && product.stock <= 10 && (
            <p className="text-orange-500 text-sm mt-3 flex items-center gap-2">
              <FaCheck /> Only {product.stock} left - order soon!
            </p>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          {isAuthenticated && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="btn btn-primary"
            >
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Your Rating</label>
              <StarRating rating={reviewRating} onChange={setReviewRating} readonly={false} size="lg" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="input"
                placeholder="Summarize your experience"
                maxLength={255}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Review</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="input min-h-32"
                placeholder="Share your thoughts about this product"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={addReview.isLoading}
            >
              {addReview.isLoading ? 'Posting...' : 'Post Review'}
            </button>
          </form>
        )}

        {/* Reviews Summary */}
        {reviewsData?.summary && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary-600 mb-2">
                  {parseFloat(reviewsData.summary.average_rating).toFixed(1)}
                </div>
                <StarRating rating={parseFloat(reviewsData.summary.average_rating)} size="lg" />
                <p className="text-gray-600 mt-2">
                  Based on {reviewsData.summary.total_reviews} reviews
                </p>
              </div>

              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviewsData.summary[`${['', '', 'one', 'two', 'three', 'four', 'five'][stars]}_star`] || 0;
                  const percentage = reviewsData.summary.total_reviews > 0
                    ? (count / reviewsData.summary.total_reviews) * 100
                    : 0;
                  
                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-sm w-12">{stars} stars</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {reviewsData?.reviews?.data && reviewsData.reviews.data.length > 0 ? (
          <div className="space-y-4">
            {reviewsData.reviews.data.map((review) => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{review.user_name}</span>
                      {review.is_verified_purchase && (
                        <span className="badge badge-success text-xs">Verified Purchase</span>
                      )}
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>

                {review.title && (
                  <h4 className="font-semibold mb-1">{review.title}</h4>
                )}
                {review.comment && (
                  <p className="text-gray-700">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 py-8">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
}
