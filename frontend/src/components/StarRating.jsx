import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export default function StarRating({ rating, onChange, readonly = true, size = 'md' }) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(
          <FaStar
            key={i}
            className={`${sizes[size]} text-yellow-400 ${!readonly && 'cursor-pointer hover:scale-110 transition-transform'}`}
            onClick={() => !readonly && onChange?.(i)}
          />
        );
      } else if (rating >= i - 0.5) {
        stars.push(
          <FaStarHalfAlt
            key={i}
            className={`${sizes[size]} text-yellow-400 ${!readonly && 'cursor-pointer hover:scale-110 transition-transform'}`}
            onClick={() => !readonly && onChange?.(i)}
          />
        );
      } else {
        stars.push(
          <FaRegStar
            key={i}
            className={`${sizes[size]} text-gray-300 ${!readonly && 'cursor-pointer hover:scale-110 transition-transform hover:text-yellow-400'}`}
            onClick={() => !readonly && onChange?.(i)}
          />
        );
      }
    }
    return stars;
  };

  return <div className="flex items-center gap-0.5">{renderStars()}</div>;
}
