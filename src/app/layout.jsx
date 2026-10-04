import './globals.css';
import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import AnalyticsTracker from '@/components/AnalyticsTracker';

export const metadata = {
  title: 'Eletas Jewels | Timeless Beauty Inspired by the Treasures of the Sea',
  description: 'Ocean-inspired fine jewelry, luminous pearls, sapphire gemstones, and handcrafted treasures made to be cherished.',
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
