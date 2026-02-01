import React, { useState, useEffect } from 'react';
import { ThumbsUp, Trash2, Edit2, Loader2, Star, Clock, User, Calendar } from 'lucide-react';
import { useUser, useAuth, useClerk } from '@clerk/clerk-react';
import { getReviews, deleteReview, toggleVote, getMyVotes } from '../api/reviews';

export default function ReviewsList({ courseCode, onEditReview, refreshTrigger }) {
    const { isSignedIn, user } = useUser();
    const { getToken } = useAuth();
    const { openSignIn } = useClerk();

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState('recent');
    const [myVotes, setMyVotes] = useState([]);
    const [votingId, setVotingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // Fetch reviews
    useEffect(() => {
        async function fetchReviews() {
            setLoading(true);
            try {
                const data = await getReviews(courseCode, sort);
                setReviews(data);
            } catch (err) {
                console.error('Error fetching reviews:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchReviews();
    }, [courseCode, sort, refreshTrigger]);

    // Fetch user's votes
    useEffect(() => {
        async function fetchVotes() {
            if (!isSignedIn) return;
            try {
                const token = await getToken();
                const votes = await getMyVotes(token);
                setMyVotes(votes);
            } catch (err) {
                console.error('Error fetching votes:', err);
            }
        }
        fetchVotes();
    }, [isSignedIn, getToken, refreshTrigger]);

    const handleVote = async (reviewId) => {
        if (!isSignedIn) {
            openSignIn({
                afterSignInUrl: window.location.href,
                afterSignUpUrl: window.location.href
            });
            return;
        }

        setVotingId(reviewId);
        try {
            const token = await getToken();
            const result = await toggleVote(reviewId, token);

            // Update local state
            if (result.voted) {
                setMyVotes(prev => [...prev, reviewId]);
                setReviews(prev => prev.map(r =>
                    r.id === reviewId ? { ...r, helpful_count: (r.helpful_count || 0) + 1 } : r
                ));
            } else {
                setMyVotes(prev => prev.filter(id => id !== reviewId));
                setReviews(prev => prev.map(r =>
                    r.id === reviewId ? { ...r, helpful_count: Math.max((r.helpful_count || 0) - 1, 0) } : r
                ));
            }
        } catch (err) {
            console.error('Error voting:', err);
        } finally {
            setVotingId(null);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete your review?')) return;

        setDeletingId(reviewId);
        try {
            const token = await getToken();
            await deleteReview(reviewId, token);
            setReviews(prev => prev.filter(r => r.id !== reviewId));
        } catch (err) {
            console.error('Error deleting review:', err);
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const renderStars = (rating) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
                <Star
                    key={star}
                    size={14}
                    fill={rating >= star ? '#fbbf24' : 'none'}
                    color={rating >= star ? '#fbbf24' : '#d1d5db'}
                />
            ))}
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8 text-gray-500">
                <Loader2 size={24} className="animate-spin mr-2" />
                Loading reviews...
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header with sort */}
            <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                    Student Reviews ({reviews.length})
                </h4>
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-[#a6192e] focus:border-transparent"
                >
                    <option value="recent">Most Recent</option>
                    <option value="helpful">Most Helpful</option>
                </select>
            </div>

            {/* Reviews list */}
            {reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>No reviews yet. Be the first to review this course!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map(review => {
                        const isOwner = user?.id === review.user_id;
                        const hasVoted = myVotes.includes(review.id);

                        return (
                            <div
                                key={review.id}
                                className={`p-4 rounded-xl border transition-all ${isOwner ? 'border-[#a6192e]/30 bg-red-50/30' : 'border-gray-200 bg-white'
                                    }`}
                            >
                                {/* Top row */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        {renderStars(review.overall_rating)}
                                        <span className="text-sm font-semibold text-gray-900">
                                            {review.overall_rating}/5
                                        </span>
                                    </div>
                                    {isOwner && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onEditReview?.(review)}
                                                className="p-1.5 text-gray-400 hover:text-[#a6192e] hover:bg-red-50 rounded-lg transition-colors"
                                                title="Edit review"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(review.id)}
                                                disabled={deletingId === review.id}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Delete review"
                                            >
                                                {deletingId === review.id ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={14} />
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Meta info */}
                                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        {review.term}
                                    </span>
                                    {review.instructor && (
                                        <span className="flex items-center gap-1">
                                            <User size={12} />
                                            {review.instructor}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        {review.workload_hours}h/week
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${review.difficulty <= 2 ? 'bg-green-100 text-green-700' :
                                            review.difficulty <= 3 ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                        }`}>
                                        Difficulty: {review.difficulty}/5
                                    </span>
                                    {review.would_take_again !== null && (
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${review.would_take_again ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {review.would_take_again ? '👍 Would take again' : '👎 Would not take again'}
                                        </span>
                                    )}
                                </div>

                                {/* Review text */}
                                {review.review_text && (
                                    <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                                        "{review.review_text}"
                                    </p>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => handleVote(review.id)}
                                        disabled={votingId === review.id}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${hasVoted
                                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                            }`}
                                    >
                                        {votingId === review.id ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <ThumbsUp size={14} fill={hasVoted ? 'currentColor' : 'none'} />
                                        )}
                                        Helpful ({review.helpful_count || 0})
                                    </button>
                                    <span className="text-xs text-gray-400">
                                        {formatDate(review.created_at)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
