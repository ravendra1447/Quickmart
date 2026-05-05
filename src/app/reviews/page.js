'use client';
import { useEffect, useState } from 'react';
import { FiStar, FiFilter, FiSearch, FiUser, FiShoppingBag, FiCalendar, FiMessageSquare } from 'react-icons/fi';
import useAuthStore from '@/store/authStore';

export default function ReviewsPage() {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    rating: '',
    status: 'all'
  });

  // Mock data for reviews
  const mockReviews = [
    {
      id: 1,
      customer: { name: 'Rahul Kumar', avatar: 'RK' },
      product: { name: 'Wireless Bluetooth Headphones', image: '/headphones.jpg' },
      rating: 5,
      title: 'Excellent sound quality!',
      comment: 'Amazing product with great battery life. The sound quality is crystal clear and noise cancellation works perfectly.',
      date: '2024-01-15',
      helpful: 12,
      status: 'approved'
    },
    {
      id: 2,
      customer: { name: 'Priya Sharma', avatar: 'PS' },
      product: { name: 'Smart Watch Pro', image: '/watch.jpg' },
      rating: 4,
      title: 'Good value for money',
      comment: 'Nice watch with all the features I needed. Battery could be better though.',
      date: '2024-01-14',
      helpful: 8,
      status: 'approved'
    },
    {
      id: 3,
      customer: { name: 'Amit Verma', avatar: 'AV' },
      product: { name: 'Laptop Stand Adjustable', image: '/stand.jpg' },
      rating: 3,
      title: 'Average quality',
      comment: 'It works fine but the material feels a bit cheap. Does the job though.',
      date: '2024-01-13',
      helpful: 5,
      status: 'pending'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReviews(mockReviews);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         review.customer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         review.title.toLowerCase().includes(filters.search.toLowerCase());
    const matchesRating = !filters.rating || review.rating === parseInt(filters.rating);
    const matchesStatus = filters.status === 'all' || review.status === filters.status;
    
    return matchesSearch && matchesRating && matchesStatus;
  });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
              <p className="text-gray-600 mt-1">Manage and monitor customer feedback</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {filteredReviews.length} of {reviews.length} reviews
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reviews, products, or customers..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <select
                value={filters.rating}
                onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex gap-6">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FiShoppingBag className="text-gray-400" size={24} />
                  </div>
                </div>

                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{review.product.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          review.status === 'approved' ? 'bg-green-100 text-green-800' :
                          review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {review.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                  <p className="text-gray-600 mb-3">{review.comment}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-bold text-sm">
                          {review.customer.avatar}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {review.customer.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <button className="flex items-center gap-1 hover:text-orange-500">
                        <FiMessageSquare size={14} />
                        Reply
                      </button>
                      <span className="flex items-center gap-1">
                        👍 {review.helpful} helpful
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredReviews.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <FiMessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-500">Try adjusting your filters to see more results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
