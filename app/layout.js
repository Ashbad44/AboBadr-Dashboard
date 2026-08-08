import './globals.css';
import { LabelsProvider } from '../lib/LabelsContext';
import { TextStylesProvider } from '../lib/TextStylesContext';

export const metadata = {
  title: 'تقرير الأرباح الشهري',
  description: 'لوحة تحكم محاسبية خاصة',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <LabelsProvider>
          <TextStylesProvider>{children}</TextStylesProvider>
        </LabelsProvider>
      </body>
    </html>
  );
}
