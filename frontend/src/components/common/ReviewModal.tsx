import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';
import { Star, X, CheckCircle2 } from 'lucide-react';

interface ReviewModalProps {
  orderId: string;
  targetType: 'DRIVER' | 'STORE';
  targetId: string;
  targetName: string;
  onClose: () => void;
  onReviewed?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  orderId,
  targetType,
  targetId,
  targetName,
  onClose,
  onReviewed,
}) => {
  const { language } = useLanguage();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createReview({
        orderId,
        targetType,
        targetId,
        rating,
        comment,
      });
      setIsDone(true);
      if (onReviewed) onReviewed();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
        >
          <X className="w-4 h-4" />
        </button>

        {isDone ? (
          <div className="py-8">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-3 animate-bounce" />
            <h3 className="text-xl font-bold text-gray-900">
              {language === 'ar' ? 'شكراً لتقييمك!' : 'Thank you for your rating!'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {language === 'ar' ? 'رأيك يساعدنا على تحسين تجربة هاتلي دائماً' : 'Your feedback helps improve Hatly for everyone'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 mx-auto flex items-center justify-center mb-3">
              <Star className="w-8 h-8 fill-current" />
            </div>

            <h3 className="text-lg font-bold text-gray-900">
              {language === 'ar' ? `كيف كانت تجربتك مع ${targetName}؟` : `How was your experience with ${targetName}?`}
            </h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              {language === 'ar' ? 'اختر عدد النجوم واكتب تعليقك' : 'Choose stars and leave a comment'}
            </p>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-5">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        active
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-300 stroke-[1.5]'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'اكتب رأيك باختصار (اختياري)...'
                  : 'Write a brief review (optional)...'
              }
              rows={3}
              className="w-full p-3 rounded-2xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E70209] mb-4 resize-none"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#E70209] hover:bg-[#CC0006] text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-red-600/20"
            >
              {isSubmitting
                ? (language === 'ar' ? 'جاري الإرسال...' : 'Submitting...')
                : (language === 'ar' ? 'إرسال التقييم' : 'Submit Review')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
