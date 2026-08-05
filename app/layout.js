import './globals.css';

export const metadata = {
  title: 'Monthly Earning Report',
  description: 'Private business accounting dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
