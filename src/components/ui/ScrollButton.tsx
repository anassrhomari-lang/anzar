import React from 'react';

interface ScrollButtonProps {
  onClick: () => void;
  className?: string;
}

export const ScrollButton: React.FC<ScrollButtonProps> = ({ onClick, className = "" }) => {
  return (
    <div className={`styled-wrapper ${className}`}>
      <button className="button text-blue-500 dark:text-blue-400" onClick={onClick} type="button">
        <div className="button-box">
          <svg className="button-elem" viewBox="0 0 46 40">
            <path d="M46 20.038c0-.7-.3-1.5-.8-2.1l-16-17c-1.1-1-3.2-1.4-4.4-.3-1.2 1.1-1.2 3.3 0 4.4l11.3 11.9H3c-1.7 0-3 1.3-3 3s1.3 3 3 3h33.1l-11.3 11.9c-1.2 1.1-1.2 3.3 0 4.4 1.2 1.1 3.3.8 4.4-.3l16-17c.5-.5.8-1.1.8-1.9z" />
          </svg>
          <svg className="button-elem" viewBox="0 0 46 40">
            <path d="M46 20.038c0-.7-.3-1.5-.8-2.1l-16-17c-1.1-1-3.2-1.4-4.4-.3-1.2 1.1-1.2 3.3 0 4.4l11.3 11.9H3c-1.7 0-3 1.3-3 3s1.3 3 3 3h33.1l-11.3 11.9c-1.2 1.1-1.2 3.3 0 4.4 1.2 1.1 3.3.8 4.4-.3l16-17c.5-.5.8-1.1.8-1.9z" />
          </svg>
        </div>
      </button>
    </div>
  );
};
