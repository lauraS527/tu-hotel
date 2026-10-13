import Icon from './Icon';

export default function StarRating({ value, size = 14 }) {
  return (
    <span className="stars" role="img" aria-label={`${value} estrellas`}>
      {Array.from({ length: value }, (_, i) => (
        <Icon key={i} name="star" size={size} filled />
      ))}
    </span>
  );
}
