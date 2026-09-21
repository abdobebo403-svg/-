import React, { useMemo } from 'react';
import { parseTajweed, TajweedSegment, TAJWEED_RULES } from '../utils/tajweed';

interface TajweedTextProps {
  text: string;
  tajweedText?: string;
  enabled?: boolean;
  className?: string;
}

/**
 * Recursive renderer for parsed Tajweed nodes
 */
function renderSegment(segment: TajweedSegment, index: number): React.ReactNode {
  if (typeof segment === 'string') {
    return <React.Fragment key={index}>{segment}</React.Fragment>;
  }

  const meta = segment.meta || TAJWEED_RULES[segment.rule];
  const colorClasses = meta
    ? `${meta.colorClass} ${meta.darkColorClass}`
    : 'text-stone-900 dark:text-stone-100';

  const tooltip = meta
    ? `${meta.name} ${meta.harakat ? `(${meta.harakat})` : ''} - ${meta.description}`
    : undefined;

  return (
    <span
      key={index}
      className={`inline ${colorClasses} transition-colors duration-150`}
      title={tooltip}
    >
      {segment.children.map((child, cIdx) => renderSegment(child, cIdx))}
    </span>
  );
}

export const TajweedText: React.FC<TajweedTextProps> = React.memo(({
  text,
  tajweedText,
  enabled = true,
  className = '',
}) => {
  // If Tajweed color coding is disabled or no markup is available, render plain text
  if (!enabled || !tajweedText) {
    return <span className={className}>{text}</span>;
  }

  const segments = useMemo(() => {
    return parseTajweed(tajweedText);
  }, [tajweedText]);

  if (!segments || segments.length === 0) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {segments.map((segment, idx) => renderSegment(segment, idx))}
    </span>
  );
});

TajweedText.displayName = 'TajweedText';
