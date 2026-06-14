import { computed, effect, Injectable, signal } from '@angular/core';

export type Language = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  currentLang = signal<Language>('en');
  direction = computed<Direction>(() => (this.currentLang() === 'ar' ? 'rtl' : 'ltr'));

  private dictionary: Record<Language, Record<string, string>> = {
    en: {
      appName: 'Masroufy',
      appSubtitle: 'Your ultimate local pocket money companion',
      dashboard: 'Dashboard',
      about: 'About',
      budgets: 'Budgets',
      createBudget: 'Create New Budget',
      exportData: 'Export Data',
      exportDataFilePrefix: 'masroufy-backup',
      collapseSidebar: 'Collapse sidebar',
      expandSidebar: 'Expand sidebar',
      deleteBudgetConfirmHeader: 'Delete Budget Confirmation',
      deleteBudgetConfirmText: 'Are you sure you want to delete the budget "{name}"? This will permanently delete the budget, all its categories (tags), and all logged expenses!',
      deleteTagConfirmHeader: 'Delete Confirmation',
      deleteTagConfirmText: 'Are you sure you want to delete the tag "{name}"? WARNING: All associated expenses will also be permanently deleted!',
      deleteExpenseConfirmHeader: 'Delete Confirmation',
      deleteExpenseConfirmText: 'Are you sure you want to delete this expense of {amount} MAD for "{desc}"?',
      budgetNameLabel: 'Budget Name',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      noActiveBudget: 'No Active Budget',
      noActiveBudgetDesc: 'Please select an existing budget from the sidebar or create a new budget to start tracking your pocket money.',
      budgetSubtitle: 'Manage categories, log expenses, and analyze spending statistics.',
      categoryTags: 'Category Tags',
      newCategoryPlaceholder: 'New category (e.g. Food, Transport)',
      addTag: 'Add Tag',
      noTagsYet: 'No tags created yet. Add one to categorize expenses!',
      logNewExpense: 'Log New Expense',
      editExpense: 'Edit Expense',
      amount: 'Amount',
      description: 'Description',
      whatDidYouBuy: 'What did you buy?',
      tagCategory: 'Tag Category',
      selectCategory: 'Select a category',
      date: 'Date',
      addExpense: 'Add Expense',
      updateExpense: 'Update Expense',
      history: 'History',
      noExpensesYet: 'No expenses tracked yet. Log one above!',
      statistics: 'Statistics',
      startDate: 'Start Date',
      endDate: 'End Date',
      generateStats: 'Generate Stats',
      totalExpenditures: 'Total Expenditures',
      categorizedBreakdown: 'Categorized Breakdown',
      noExpensesInPeriod: 'No expenses found within this date range.',
      whatIsMasroufyHeader: 'What is Masroufy?',
      whatIsMasroufyText1: 'Masroufy (Arabic for "My Expense" or "My Pocket Money") is a modern, lightweight pocket money management application. It helps you take control of your daily spending by organizing budgets, setting tags, and tracking expenses over time.',
      whatIsMasroufyText2: 'Whether you want to manage weekly allowance, track specific event expenses, or categorize where your pocket money goes, Masroufy provides a fast, modern, and clean dashboard to achieve your goals.',
      localPrivateHeader: '100% Local & Private',
      localPrivateText1: 'Your data belongs to you. Masroufy operates entirely inside your browser. All CRUD operations and storage are handled locally via IndexedDB.',
      localPrivateText2: 'Absolutely no data is sent to a server. No trackers, no databases in the cloud, and 100% offline-ready privacy.',
      coreFeatures: 'Core Features',
      multiBudgetSupport: 'Multi-Budget Support',
      multiBudgetSupportDesc: 'Create different budgets for weeks, months, or special events, and switch between them seamlessly.',
      scopedTagging: 'Scoped Tagging',
      scopedTaggingDesc: 'Category tags are scoped to individual budgets. Keep your "Holiday" tags separate from your "Monthly Allowance" tags.',
      detailedTracking: 'Detailed Expense Tracking',
      detailedTrackingDesc: 'Record amounts (with Moroccan Dirham formatting), descriptions, category tags, and calendar dates.',
      interactiveStats: 'Interactive Statistics',
      interactiveStatsDesc: 'Generate specific date-range summaries showing total spent, tag totals, and percent breakdowns with progress bars.',
      darkMode: 'Adaptive Dark Mode',
      darkModeDesc: 'Seamless toggle with customized Material branding, perfect for night tracking.',
      backToDashboard: 'Back to Dashboard',
    },
    ar: {
      appName: 'مصروفي',
      appSubtitle: 'رفيقك المثالي لتتبع مصروف الجيب محلياً',
      dashboard: 'الرئيسية',
      about: 'حول التطبيق',
      budgets: 'الميزانيات',
      createBudget: 'إنشاء ميزانية جديدة',
      exportData: 'تصدير البيانات',
      exportDataFilePrefix: 'masroufy-backup',
      collapseSidebar: 'طي القائمة الجانبية',
      expandSidebar: 'توسيع القائمة الجانبية',
      deleteBudgetConfirmHeader: 'تأكيد حذف الميزانية',
      deleteBudgetConfirmText: 'هل أنت متأكد من حذف الميزانية "{name}"؟ سيؤدي ذلك إلى حذف الميزانية نهائياً، بالإضافة إلى جميع الفئات والمصاريف المسجلة بها!',
      deleteTagConfirmHeader: 'تأكيد الحذف',
      deleteTagConfirmText: 'هل أنت متأكد من حذف الفئة "{name}"؟ تحذير: سيتم حذف جميع المصاريف المرتبطة بهذه الفئة نهائياً!',
      deleteExpenseConfirmHeader: 'تأكيد الحذف',
      deleteExpenseConfirmText: 'هل أنت متأكد من حذف هذه المصاريف البالغة {amount} درهم لـ "{desc}"؟',
      budgetNameLabel: 'اسم الميزانية',
      cancel: 'إلغاء',
      save: 'حفظ',
      delete: 'حذف',
      noActiveBudget: 'لا توجد ميزانية نشطة',
      noActiveBudgetDesc: 'يرجى اختيار ميزانية من القائمة الجانبية أو إنشاء واحدة جديدة لبدء تتبع مصروفك.',
      budgetSubtitle: 'إدارة الفئات، وتسجيل المصاريف، وتحليل إحصائيات الإنفاق.',
      categoryTags: 'فئات المصاريف',
      newCategoryPlaceholder: 'فئة جديدة (مثال: طعام، مواصلات)',
      addTag: 'إضافة فئة',
      noTagsYet: 'لم يتم إنشاء أي فئة بعد. أضف فئة لتصنيف مصاريفك!',
      logNewExpense: 'تسجيل مصاريف جديدة',
      editExpense: 'تعديل المصاريف',
      amount: 'المبلغ',
      description: 'الوصف',
      whatDidYouBuy: 'ماذا اشتريت؟',
      tagCategory: 'الفئة',
      selectCategory: 'اختر الفئة',
      date: 'التاريخ',
      addExpense: 'إضافة',
      updateExpense: 'تحديث',
      history: 'السجل',
      noExpensesYet: 'لا توجد مصاريف مسجلة بعد. سجل أولى مصاريفك أعلاه!',
      statistics: 'الإحصائيات',
      startDate: 'تاريخ البدء',
      endDate: 'تاريخ الانتهاء',
      generateStats: 'توليد الإحصائيات',
      totalExpenditures: 'مجموع المصاريف',
      categorizedBreakdown: 'تفاصيل الفئات',
      noExpensesInPeriod: 'لم يتم العثور على أي مصاريف في هذه الفترة الزمنية.',
      whatIsMasroufyHeader: 'ما هو تطبيق مصروفي؟',
      whatIsMasroufyText1: 'مصروفي هو تطبيق حديث وخفيف لإدارة مصروف الجيب. يساعدك على التحكم في إنفاقك اليومي من خلال تنظيم الميزانيات، وتحديد الفئات وتتبع المصاريف مع مرور الوقت.',
      whatIsMasroufyText2: 'سواء كنت تريد إدارة مصروفك الأسبوعي، أو تتبع مصاريف رحلة معينة، أو معرفة أين يذهب مصروفك، فإن مصروفي يوفر لك لوحة تحكم سريعة وعصرية لتحقيق ذلك.',
      localPrivateHeader: '100% محلي وخاص',
      localPrivateText1: 'بياناتك ملكك بالكامل. يعمل مصروفي بالكامل داخل متصفحك. وتتم إدارة جميع العمليات والتخزين محلياً عبر IndexedDB.',
      localPrivateText2: 'لا يتم إرسال أي بيانات إلى أي خادم على الإطلاق. لا أدوات تتبع، ولا قواعد بيانات في السحاب، وخصوصية تامة دون الحاجة للاتصال بالإنترنت.',
      coreFeatures: 'الميزات الأساسية',
      multiBudgetSupport: 'دعم ميزانيات متعددة',
      multiBudgetSupportDesc: 'أنشئ ميزانيات مختلفة للأسابيع، الأشهر أو الرحلات الخاصة، وتنقل بينها بسلاسة.',
      scopedTagging: 'تصنيف خاص بكل ميزانية',
      scopedTaggingDesc: 'الفئات مخصصة لكل ميزانية على حدة. حافظ على فئات "العطلة" منفصلة عن فئات "المصروف الشهري".',
      detailedTracking: 'تتبع تفصيلي للمصاريف',
      detailedTrackingDesc: 'سجل المبالغ (مع تنسيق الدرهم المغربي)، والأوصاف، والفئات وتواريخ التقويم.',
      interactiveStats: 'إحصائيات تفاعلية',
      interactiveStatsDesc: 'قم بتوليد ملخصات لفترات زمنية محددة توضح إجمالي المصاريف، ومجاميع الفئات، ونسبها المئوية مع أشرطة تقدم.',
      darkMode: 'وضع مظلم متكيف',
      darkModeDesc: 'تبديل سلس مع تصميم ماتيريال المخصص، مثالي للاستخدام ليلاً.',
      backToDashboard: 'العودة إلى الرئيسية',
    },
  };

  constructor() {
    const storedLang = localStorage.getItem('masroufy_lang');
    if (storedLang === 'ar' || storedLang === 'en') {
      this.currentLang.set(storedLang);
    }

    effect(() => {
      document.documentElement.lang = this.currentLang();
      document.documentElement.dir = this.direction();
    });
  }

  setLanguage(lang: Language) {
    this.currentLang.set(lang);
    localStorage.setItem('masroufy_lang', lang);
  }

  toggleLanguage() {
    this.setLanguage(this.currentLang() === 'en' ? 'ar' : 'en');
  }

  translate(key: string, interpolations?: Record<string, string | number>): string {
    const lang = this.currentLang();
    let text = this.dictionary[lang][key] || this.dictionary['en'][key] || key;
    if (interpolations) {
      Object.keys(interpolations).forEach((k) => {
        text = text.replace(`{${k}}`, String(interpolations[k]));
      });
    }
    return text;
  }
}
