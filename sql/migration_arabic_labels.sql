-- ============================================================
-- Migration: add the "labels" table (Arabic UI text, all editable)
-- Safe to run even though you already ran schema.sql once before —
-- this only adds the new table, it won't touch your existing data.
-- Run this in Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- 6. Editable UI text (page titles, section headers, column labels, etc.)
create table if not exists labels (
  key text primary key,
  value text not null
);


alter table labels enable row level security;
create policy "authenticated full access" on labels
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');


-- Default Arabic text for every editable label in the interface.
-- Change any of these here, or edit them later from the website's Settings page.
insert into labels (key, value) values
  ('app_title', 'تقرير الأرباح الشهري'),
  ('app_subtitle', 'نظرة عامة وملخص مالي'),
  ('saving_note', '· جارٍ الحفظ…'),
  ('nav_dashboard', 'لوحة التحكم'),
  ('nav_settings', 'الإعدادات'),
  ('sign_out', 'تسجيل الخروج'),

  ('card_total_income', 'إجمالي الدخل'),
  ('card_total_income_note', 'من جميع الفروع'),
  ('card_total_expenses', 'إجمالي المصروفات'),
  ('card_total_expenses_note', 'جميع المصروفات'),
  ('card_income_before_deductions', 'الدخل قبل الاستقطاعات'),
  ('card_income_before_deductions_note', 'الدخل - المصروفات'),
  ('card_total_deductions', 'إجمالي الاستقطاعات'),
  ('card_total_deductions_note', 'استقطاعات أخرى'),
  ('card_final_total_income', 'صافي الدخل النهائي'),
  ('card_final_total_income_note', 'بعد جميع الاستقطاعات'),

  ('branches_panel_title', 'ملخص الدخل حسب الفرع'),
  ('branches_col_branch', 'الفرع'),
  ('branches_col_income', 'إجمالي الدخل'),
  ('branches_col_expenses', 'إجمالي المصروفات'),
  ('branches_col_net', 'صافي الدخل'),
  ('branches_total_row', 'الإجمالي'),
  ('branches_add_btn', '+ إضافة فرع'),

  ('sources_panel_title', 'مصادر الدخل'),
  ('sources_col_source', 'المصدر'),
  ('sources_col_amount', 'المبلغ'),
  ('sources_total_row', 'إجمالي جميع مصادر الدخل'),
  ('sources_add_btn', '+ إضافة مصدر'),

  ('deductions_panel_title', 'نظرة عامة على الدخل والاستقطاعات'),
  ('deductions_income_before', 'إجمالي الدخل قبل الاستقطاعات الأخرى'),
  ('deductions_other', 'استقطاع آخر'),
  ('deductions_final_income', 'صافي الدخل النهائي'),

  ('review_panel_title', 'المراجعة الشهرية النهائية'),
  ('review_from_upper_table', 'من الجدول أعلاه'),
  ('review_electricity_water', 'فاتورة الكهرباء والماء'),
  ('review_salaries', 'الرواتب'),
  ('review_other_payment', 'مدفوعات أخرى'),
  ('review_final_banner', 'صافي الدخل النهائي بعد الكهرباء والماء والرواتب والمدفوعات الأخرى'),

  ('login_title', 'تسجيل الدخول'),
  ('login_subtitle', 'تقرير الأرباح الشهري'),
  ('login_email', 'البريد الإلكتروني'),
  ('login_password', 'كلمة المرور'),
  ('login_submit', 'تسجيل الدخول'),
  ('login_submit_loading', 'جارٍ تسجيل الدخول…'),
  ('login_otp_title', 'أدخل الرمز'),
  ('login_otp_subtitle', 'افتح تطبيق المصادقة وأدخل الرمز المكون من 6 أرقام'),
  ('login_otp_label', 'رمز المصادقة'),
  ('login_otp_submit', 'تحقق'),
  ('login_otp_submit_loading', 'جارٍ التحقق…'),

  ('settings_title', 'الإعدادات'),
  ('settings_subtitle', 'إعدادات الأمان والحساب'),
  ('settings_2fa_title', 'تطبيق المصادقة (التحقق بخطوتين)'),
  ('settings_2fa_enabled', 'تطبيق المصادقة مفعّل حالياً.'),
  ('settings_2fa_disable_btn', 'إيقاف التحقق بخطوتين'),
  ('settings_2fa_scan_hint', 'امسح هذا الرمز باستخدام Google Authenticator أو Microsoft Authenticator أو Authy:'),
  ('settings_2fa_manual_hint', 'لا يمكنك المسح؟ أدخل هذا المفتاح يدوياً:'),
  ('settings_2fa_confirm_label', 'أدخل الرمز المكون من 6 أرقام للتأكيد'),
  ('settings_2fa_confirm_btn', 'تأكيد وتفعيل'),
  ('settings_2fa_enable_btn', 'تفعيل تطبيق المصادقة'),
  ('settings_password_title', 'تغيير كلمة المرور'),
  ('settings_password_label', 'كلمة المرور الجديدة'),
  ('settings_password_btn', 'تحديث كلمة المرور'),
  ('settings_labels_title', 'تحرير نصوص الموقع'),
  ('settings_labels_subtitle', 'عدّل أي عنوان أو تسمية تظهر في الموقع'),
  ('settings_labels_save_btn', 'حفظ النصوص')
on conflict (key) do update set value = excluded.value;
