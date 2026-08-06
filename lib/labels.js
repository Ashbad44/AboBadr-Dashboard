// Fallback text if the "labels" table row is missing for a key (shouldn't
// normally happen since schema.sql seeds all of these, but keeps the UI
// safe if a key is ever added to the code before the database).
export const DEFAULT_LABELS = {
  app_title: 'تقرير الأرباح الشهري',
  app_subtitle: 'نظرة عامة وملخص مالي',
  saving_note: '· جارٍ الحفظ…',
  nav_dashboard: 'لوحة التحكم',
  nav_settings: 'الإعدادات',
  sign_out: 'تسجيل الخروج',

  card_total_income: 'إجمالي الدخل',
  card_total_income_note: 'من جميع الفروع',
  card_total_expenses: 'إجمالي المصروفات',
  card_total_expenses_note: 'جميع المصروفات',
  card_income_before_deductions: 'الدخل قبل الاستقطاعات',
  card_income_before_deductions_note: 'الدخل - المصروفات',
  card_total_deductions: 'إجمالي الاستقطاعات',
  card_total_deductions_note: 'استقطاعات أخرى',
  card_final_total_income: 'صافي الدخل النهائي',
  card_final_total_income_note: 'بعد جميع الاستقطاعات',

  branches_panel_title: 'ملخص الدخل حسب الفرع',
  branches_col_branch: 'الفرع',
  branches_col_income: 'إجمالي الدخل',
  branches_col_expenses: 'إجمالي المصروفات',
  branches_col_net: 'صافي الدخل',
  branches_total_row: 'الإجمالي',
  branches_add_btn: '+ إضافة فرع',

  sources_panel_title: 'مصادر الدخل',
  sources_col_source: 'المصدر',
  sources_col_amount: 'المبلغ',
  sources_total_row: 'إجمالي جميع مصادر الدخل',
  sources_add_btn: '+ إضافة مصدر',

  deductions_panel_title: 'نظرة عامة على الدخل والاستقطاعات',
  deductions_income_before: 'إجمالي الدخل قبل الاستقطاعات الأخرى',
  deductions_other: 'استقطاع آخر',
  deductions_final_income: 'صافي الدخل النهائي',

  review_panel_title: 'المراجعة الشهرية النهائية',
  review_from_upper_table: 'من الجدول أعلاه',
  review_electricity_water: 'فاتورة الكهرباء والماء',
  review_salaries: 'الرواتب',
  review_other_payment: 'مدفوعات أخرى',
  review_final_banner: 'صافي الدخل النهائي بعد الكهرباء والماء والرواتب والمدفوعات الأخرى',
  other_deductions_add_btn: '+ إضافة مدفوعات',

  login_title: 'تسجيل الدخول',
  login_subtitle: 'تقرير الأرباح الشهري',
  login_email: 'البريد الإلكتروني',
  login_password: 'كلمة المرور',
  login_submit: 'تسجيل الدخول',
  login_submit_loading: 'جارٍ تسجيل الدخول…',
  login_otp_title: 'أدخل الرمز',
  login_otp_subtitle: 'افتح تطبيق المصادقة وأدخل الرمز المكون من 6 أرقام',
  login_otp_label: 'رمز المصادقة',
  login_otp_submit: 'تحقق',
  login_otp_submit_loading: 'جارٍ التحقق…',

  settings_title: 'الإعدادات',
  settings_subtitle: 'إعدادات الأمان والحساب',
  settings_2fa_title: 'تطبيق المصادقة (التحقق بخطوتين)',
  settings_2fa_enabled: 'تطبيق المصادقة مفعّل حالياً.',
  settings_2fa_disable_btn: 'إيقاف التحقق بخطوتين',
  settings_2fa_scan_hint: 'امسح هذا الرمز باستخدام Google Authenticator أو Microsoft Authenticator أو Authy:',
  settings_2fa_manual_hint: 'لا يمكنك المسح؟ أدخل هذا المفتاح يدوياً:',
  settings_2fa_confirm_label: 'أدخل الرمز المكون من 6 أرقام للتأكيد',
  settings_2fa_confirm_btn: 'تأكيد وتفعيل',
  settings_2fa_enable_btn: 'تفعيل تطبيق المصادقة',
  settings_password_title: 'تغيير كلمة المرور',
  settings_password_label: 'كلمة المرور الجديدة',
  settings_password_btn: 'تحديث كلمة المرور',
  settings_labels_title: 'تحرير نصوص الموقع',
  settings_labels_subtitle: 'عدّل أي عنوان أو تسمية تظهر في الموقع',
  settings_labels_save_btn: 'حفظ النصوص',

  sms_panel_title: 'ملخص التحويلات (SMS)',
  sms_col_bank: 'البنك',
  sms_col_count: 'عدد العمليات',
  sms_col_total: 'الإجمالي',
  sms_refresh_btn: 'تحديث',
  sms_loading: 'جارٍ التحميل…',
  sms_error: 'تعذر التحميل',

  cash_panel_title: 'توزيع الكاش على الفروع',
  cash_col_name: 'الفرع',
  cash_col_total: 'الإجمالي',
  cash_total_row: 'الإجمالي الكلي',
  cash_refresh_btn: 'تحديث',
  cash_loading: 'جارٍ التحميل…',
  cash_error: 'تعذر التحميل',
};

// Groups shown on the Settings > "Edit Site Text" screen, so the ~60 labels
// are organized instead of one giant flat list. The group titles themselves
// are plain (unlocalized) section headers for that editor screen only.
export const LABEL_GROUPS = [
  {
    title: 'العنوان والتنقل / Header & navigation',
    keys: ['app_title', 'app_subtitle', 'saving_note', 'nav_dashboard', 'nav_settings', 'sign_out'],
  },
  {
    title: 'البطاقات العلوية / Summary cards',
    keys: [
      'card_total_income', 'card_total_income_note',
      'card_total_expenses', 'card_total_expenses_note',
      'card_income_before_deductions', 'card_income_before_deductions_note',
      'card_total_deductions', 'card_total_deductions_note',
      'card_final_total_income', 'card_final_total_income_note',
    ],
  },
  {
    title: 'جدول الفروع / Branches table',
    keys: [
      'branches_panel_title', 'branches_col_branch', 'branches_col_income',
      'branches_col_expenses', 'branches_col_net', 'branches_total_row', 'branches_add_btn',
    ],
  },
  {
    title: 'مصادر الدخل / Earning sources table',
    keys: ['sources_panel_title', 'sources_col_source', 'sources_col_amount', 'sources_total_row', 'sources_add_btn'],
  },
  {
    title: 'الاستقطاعات / Deductions panel',
    keys: ['deductions_panel_title', 'deductions_income_before', 'deductions_other', 'deductions_final_income'],
  },
  {
    title: 'المراجعة الشهرية / Final monthly review',
    keys: [
      'review_panel_title', 'review_from_upper_table', 'review_electricity_water',
      'review_salaries', 'review_other_payment', 'review_final_banner', 'other_deductions_add_btn',
    ],
  },
  {
    title: 'صفحة الدخول / Login page',
    keys: [
      'login_title', 'login_subtitle', 'login_email', 'login_password',
      'login_submit', 'login_submit_loading', 'login_otp_title', 'login_otp_subtitle',
      'login_otp_label', 'login_otp_submit', 'login_otp_submit_loading',
    ],
  },
  {
    title: 'الإعدادات / Settings page',
    keys: [
      'settings_title', 'settings_subtitle', 'settings_2fa_title', 'settings_2fa_enabled',
      'settings_2fa_disable_btn', 'settings_2fa_scan_hint', 'settings_2fa_manual_hint',
      'settings_2fa_confirm_label', 'settings_2fa_confirm_btn', 'settings_2fa_enable_btn',
      'settings_password_title', 'settings_password_label', 'settings_password_btn',
      'settings_labels_title', 'settings_labels_subtitle', 'settings_labels_save_btn',
    ],
  },
  {
    title: 'ملخص التحويلات SMS / SMS ledger summary',
    keys: [
      'sms_panel_title', 'sms_col_bank', 'sms_col_count', 'sms_col_total',
      'sms_refresh_btn', 'sms_loading', 'sms_error',
    ],
  },
  {
    title: 'توزيع الكاش / Cash by branch',
    keys: [
      'cash_panel_title', 'cash_col_name', 'cash_col_total',
      'cash_total_row', 'cash_refresh_btn', 'cash_loading', 'cash_error',
    ],
  },
];
