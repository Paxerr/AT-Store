import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';
import { CartDrawer } from '@/components/storefront/CartDrawer';
import { CartToastAlert } from '@/components/storefront/CartToastAlert';

export const metadata: Metadata = {
  title: 'Anh Thư Sneaker — Cửa hàng Sneaker & Thời trang thể thao cao cấp',
  description:
    'Cửa hàng sneaker chính hãng Anh Thư Sneaker. Tuyển tập các mẫu giày thể thao đường phố hot nhất, thanh toán chuyển khoản VietQR tiện lợi, giao hàng 3-5 ngày toàn quốc và đổi trả 7 ngày.',
  keywords: [
    'Anh Thư Sneaker',
    'sneaker chính hãng',
    'giày sneaker đẹp',
    'mua sneaker online',
    'Nike Air Force 1',
    'Adidas Samba',
    'New Balance 550',
    'giày thể thao nam nữ',
  ],
  authors: [{ name: 'Anh Thư Sneaker' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Anh Thư Sneaker — Cửa hàng Sneaker & Thời trang thể thao cao cấp',
    description:
      'Tuyển tập các mẫu sneaker thể thao đường phố hot nhất, chuẩn form, êm chân, đổi size trong 7 ngày, ship toàn quốc.',
    url: 'https://anhthusneaker.vn',
    siteName: 'Anh Thư Sneaker',
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('ats_theme');
                  if (t === 'light' || t === 'dark') {
                    document.documentElement.setAttribute('data-theme', t);
                  } else {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Store',
              name: 'Anh Thư Sneaker',
              description: 'Cửa hàng Sneaker và Thời trang thể thao chính hãng',
              telephone: '0901234567',
              address: {
                '@type': 'PostalAddress',
                streetAddress: '128 Đường Nguyễn Huệ, Phường Bến Nghé',
                addressLocality: 'Quận 1',
                addressRegion: 'TP. Hồ Chí Minh',
                addressCountry: 'VN',
              },
              currenciesAccepted: 'VND',
              paymentAccepted: 'Bank Transfer, Cash on Delivery',
              priceRange: '65.000đ - 3.200.000đ',
            }),
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <CartProvider>
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              <Navbar />
              <main style={{ flex: 1 }}>{children}</main>
              <Footer />
              <CartDrawer />
              <CartToastAlert />
            </div>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
