import { MouseEventHandler } from 'react';
import Burger from './../../assets/burger-icon.svg';
import './BurgerButton.css';

export const BurgerButton = ({
  onClick,
}: {
  onClick: MouseEventHandler<HTMLDivElement>;
}) => {
  return (
    <div className="burger-button" onClick={onClick}>
      <img src={Burger} />
    </div>
  );
};
