import './globals.css';
import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import AnalyticsTracker from '@/components/AnalyticsTracker';

export const metadata = {
  title: 'Ealetas | Fine Handcrafted Jewelry',
  description: 'Exquisite handcrafted jewelry, ethical diamonds, and rare gemstones for timeless elegance.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <CartProvider>
          <AnalyticsTracker />
          {children}
          <CartDrawer />
          <CheckoutModal />
        </CartProvider>
      </body>
    </html>
  );
}
