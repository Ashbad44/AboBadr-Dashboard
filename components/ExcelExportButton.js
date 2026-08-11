'use client';

import { useLabels } from '../lib/LabelsContext';

export default function ExcelExportButton({ onClick }) {
  const { t } = useLabels();
  return (
    <button className="excel-btn" onClick={onClick}>
      📊 {t('excel_export_btn')}
    </button>
  );
}
