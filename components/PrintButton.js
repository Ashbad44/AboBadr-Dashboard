'use client';

import { useLabels } from '../lib/LabelsContext';

export default function PrintButton() {
  const { t } = useLabels();
  return (
    <button className="print-btn" onClick={() => window.print()}>
      🖨️ {t('print_btn')}
    </button>
  );
}
