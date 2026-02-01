import React, { useState, useEffect } from 'react';
import { X, Star, Loader2, AlertCircle } from 'lucide-react';
import { useUser, useAuth, useClerk } from '@clerk/clerk-react';
import { submitReview, getMyReview } from '../api/reviews';

const TERMS = ['Spring 2026', 'Summer 2026', 'Fall 2026', 'Spring 2025', 'Summer 2025', 'Fall 2025'];

export default function ReviewForm({ course, onClose, onSuccess }) {
    const { isSignedIn } = useUser();
    const { getToken } = useAuth();
    const { openSignIn } = useClerk();

    // Form state
    const [term, setTerm] = useState('Spring 2026');
    const [overallRating, setOverallRating] = useState(0);
    const [difficulty, setDifficulty] = useState(0);
    const [workloadHours, setWorkloadHours] = useState(10);
    const [wouldTakeAgain, setWouldTakeAgain] = useState(null);
    const [reviewText, setReviewText] = useState('');
    const [instructor, setInstructor] = useState('');

    // UI state
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState(null);
    const [existingReview, setExistingReview] = useState(null);
    const [hoverRating, setHoverRating] = useState(0);
    const [hoverDifficulty, setHoverDifficulty] = useState(0);

    // Check for existing review when term changes
    useEffect(() => {
        async function checkExisting() {
            if (!isSignedIn || !course?.code) return;

            setChecking(true);
            try {
                const token = await getToken();
                const reviews = await getMyReview(course.code, term, token);
                if (reviews && reviews.length > 0) {
                    const existing = reviews[0];
                    setExistingReview(existing);
                    setOverallRating(existing.overall_rating);
                    setDifficulty(existing.difficulty);
                    setWorkloadHours(existing.workload_hours);
                    setWouldTakeAgain(existing.would_take_again);
                    setReviewText(existing.review_text || '');
                    setInstructor(existing.instructor || '');
                } else {
                    setExistingReview(null);
                }
            } catch (err) {
                console.error('Error checking existing review:', err);
            } finally {
                setChecking(false);
            }
        }
        checkExisting();
    }, [term, isSignedIn, course?.code, getToken]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Auth check
        if (!isSignedIn) {
            openSignIn({
                afterSignInUrl: window.location.href,
                afterSignUpUrl: window.location.href
            });
            return;
        }

        // Validation
        if (overallRating === 0) {
            setError('Please select an overall rating');
            return;
        }
        if (difficulty === 0) {
            setError('Please select a difficulty level');
            return;
        }
        if (reviewText && reviewText.length > 0 && reviewText.length < 30) {
            setError('Review must be at least 30 characters (or leave empty)');
            return;
        }

        setLoading(true);
        try {
            const token = await getToken();
            await submitReview(course.code, {
                term,
                overall_rating: overallRating,
                difficulty,
                workload_hours: workloadHours,
                would_take_again: wouldTakeAgain,
                review_text: reviewText || null,
                instructor: instructor || null
            }, token);

            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (value, setValue, hoverValue, setHoverValue, label) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label} *</label>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setValue(star)}
                        onMouseEnter={() => setHoverValue(star)}
                        onMouseLeave={() => setHoverValue(0)}
                        className="p-1 transition-transform hover:scale-110"
                    >
                        <Star
                            size={28}
                            fill={(hoverValue || value) >= star ? '#fbbf24' : 'none'}
                            color={(hoverValue || value) >= star ? '#fbbf24' : '#d1d5db'}
                        />
                    </button>
                ))}
                <span className="ml-2 text-sm text-gray-500 self-center">
                    {(hoverValue || value) > 0 ? `${hoverValue || value}/5` : 'Select'}
                </span>
            </div>
        </div>
    );

    console.log('ReviewForm RENDERING - course:', course?.code);

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
            style={{ zIndex: 9999, border: '5px solid red' }}
            onClick={onClose}
        >
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" style={{ border: '3px solid blue' }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {existingReview ? 'Edit Your Review' : 'Rate This Course'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">{course?.code}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {/* Term */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Term *</label>
                        <select
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#a6192e] focus:border-transparent"
                        >
                            {TERMS.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        {checking && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <Loader2 size={12} className="animate-spin" />
                                Checking for existing review...
                            </p>
                        )}
                        {existingReview && !checking && (
                            <p className="text-xs text-amber-600 mt-1">
                                ✏️ You already reviewed this course for {term}. Submitting will update your review.
                            </p>
                        )}
                    </div>

                    {/* Overall Rating */}
                    {renderStars(overallRating, setOverallRating, hoverRating, setHoverRating, 'Overall Rating')}

                    {/* Difficulty */}
                    {renderStars(difficulty, setDifficulty, hoverDifficulty, setHoverDifficulty, 'Difficulty')}

                    {/* Workload Slider */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Workload: <span className="text-[#a6192e] font-bold">{workloadHours} hours/week</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="30"
                            value={workloadHours}
                            onChange={(e) => setWorkloadHours(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#a6192e]"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>0h</span>
                            <span>15h</span>
                            <span>30h</span>
                        </div>
                    </div>

                    {/* Would Take Again */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Would you take this course again?</label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setWouldTakeAgain(true)}
                                className={`flex-1 py-3 rounded-lg font-medium transition-all ${wouldTakeAgain === true
                                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                                    : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                👍 Yes
                            </button>
                            <button
                                type="button"
                                onClick={() => setWouldTakeAgain(false)}
                                className={`flex-1 py-3 rounded-lg font-medium transition-all ${wouldTakeAgain === false
                                    ? 'bg-red-100 text-red-700 border-2 border-red-500'
                                    : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                👎 No
                            </button>
                        </div>
                    </div>

                    {/* Instructor */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Instructor (optional)</label>
                        <input
                            type="text"
                            value={instructor}
                            onChange={(e) => setInstructor(e.target.value)}
                            placeholder="e.g., Dr. Smith"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#a6192e] focus:border-transparent"
                        />
                    </div>

                    {/* Review Text */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Review (optional)
                            {reviewText.length > 0 && (
                                <span className={`ml-2 ${reviewText.length < 30 ? 'text-red-500' : 'text-green-600'}`}>
                                    {reviewText.length}/30 min
                                </span>
                            )}
                        </label>
                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Share your experience with this course... (min 30 characters if provided)"
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#a6192e] focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[#a6192e] text-white rounded-xl font-bold text-lg hover:bg-[#8a1526] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Submitting...
                            </>
                        ) : existingReview ? (
                            'Update Review'
                        ) : (
                            'Submit Review'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
