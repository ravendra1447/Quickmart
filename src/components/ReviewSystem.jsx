'use client';
import { useState } from 'react';
import { FiStar, FiSend, FiThumbsUp, FiMessageSquare } from 'react-icons/fi';
import useAuthStore from '@/store/authStore';

export default function ReviewSystem({ productId, existingReviews = [] }) {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState(existingReviews);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to write a review');
      return;
    }

    setSubmitting(true);
    try {
      // Mock API call - replace with actual API
      const reviewData = {
        ...newReview,
        productId,
        customer: {
          name: user.name,
          avatar: user.name?.[0]?.toUpperCase() || 'U'
        },
        date: new Date().toISOString().split('T')[0],
        helpful: 0,
        status: 'pending'
      };

      setReviews([reviewData, ...reviews]);
      setNewReview({ rating: 5, title: '', comment: '' });
      setShowReviewForm(false);
      alert('Review submitted successfully! It will be visible after approval.');
    } catch (error) {
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = (reviewId) => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, helpful: review.helpful + 1 }
        : review
    ));
  };

  const renderStars = (rating, interactive = false, onRatingChange) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRatingChange(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            <FiStar
              className={`w-5 h-5 ${
                star <= rating 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
        
        {reviews.length > 0 ? (
          <div className="flex items-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length}
              </div>
              {renderStars(Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length))}
              <div className="text-sm text-gray-500 mt-1">
                {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
              </div>
            </div>
            
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter(r => r.rating === rating).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-600 w-3">{rating}</span>
                    {renderStars(rating)}
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FiStar className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
          </div>
        )}

        {/* Write Review Button */}
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="w-full md:w-auto px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          {user ? 'Write a Review' : 'Login to Write Review'}
        </button>
      </div>

      {/* Review Form */}
      {showReviewForm && user && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold mb-4">Write Your Review</h4>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              {renderStars(newReview.rating, true, (rating) => 
                setNewReview({ ...newReview, rating })
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title *
              </label>
              <input
                type="text"
                required
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Summarize your experience"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review *
              </label>
              <textarea
                required
                rows={4}
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Tell us about your experience with this product"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm">
                    {review.customer?.avatar || 'U'}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {review.customer?.name || 'Anonymous'}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-500">{review.date}</span>
                    {review.status === 'pending' && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        Pending Approval
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
            <p className="text-gray-600 mb-3">{review.comment}</p>

            <div className="flex items-center gap-4 text-sm">
              <button
                onClick={() => handleHelpful(review.id)}
                className="flex items-center gap-1 text-gray-500 hover:text-orange-500 transition-colors"
              >
                <FiThumbsUp size={14} />
                Helpful ({review.helpful})
              </button>
              <button className="flex items-center gap-1 text-gray-500 hover:text-orange-500 transition-colors">
                <FiMessageSquare size={14} />
                Reply
              </button>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FiStar className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>
    </div>
  );
}
