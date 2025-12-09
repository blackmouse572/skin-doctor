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
      title: 'Analyze skin',
      url: '/analyze-skin',
      icon: BasketIcon,
    },
    {
      title: 'Profile',
      url: '/profile',
      icon: BasketIcon,
    },
  ],
};
