import { BasketIcon } from '@phosphor-icons/react/dist/csr/Basket';
import { ChatTeardropTextIcon } from '@phosphor-icons/react/dist/csr/ChatTeardropText';

export const NavItems = {
  main: [
    {
      title: 'Chat',
      url: '/chat',
      icon: ChatTeardropTextIcon,
    },
    {
      title: 'Profile',
      url: '/profile',
      icon: BasketIcon,
    },
  ],
};
