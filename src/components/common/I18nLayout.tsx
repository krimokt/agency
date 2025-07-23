"use client";

import { useRouter } from 'next/router';
import { useEffect } from 'react';

interface I18nLayoutProps {
  children: React.ReactNode;
}

const I18nLayout = ({ children }: I18nLayoutProps) => {
  const router = useRouter();
  
  useEffect(() => {
    if (router.locale === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = router.locale || 'en';
    }
  }, [router.locale]);

  return <div className="i18n-layout">{children}</div>;
};

export default I18nLayout; 