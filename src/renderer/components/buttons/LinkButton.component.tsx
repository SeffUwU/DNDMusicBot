import React, { MouseEventHandler } from 'react';
import { useNavigate } from 'react-router-dom';
import './LinkButton.css';

export default function LinkButton({
  children,
  path = '/',
  additionalStyle,
  onClick,
}: {
  children?: React.ReactNode | React.ReactNode[];
  path?: string;
  additionalStyle?: React.CSSProperties;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  const navigate = useNavigate();
  const handleOnClick = () => {
    navigate(path);
  };
  return (
    <a
      className="link-button"
      style={additionalStyle}
      onClick={onClick ?? handleOnClick}
    >
      {children}
    </a>
  );
}
