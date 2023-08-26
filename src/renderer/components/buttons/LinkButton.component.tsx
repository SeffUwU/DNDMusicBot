import React from 'react';
import './LinkButton.css';
import { useNavigate } from 'react-router-dom';

export default function LinkButton({
  children,
  path = '/',
}: {
  children?: React.ReactNode | React.ReactNode[];
  path?: string;
}) {
  const navigate = useNavigate();
  const handleOnClick = () => {
    navigate(path);
  };

  return (
    <a className="link-button" onClick={handleOnClick}>
      {children}
    </a>
  );
}
