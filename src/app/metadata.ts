import { Metadata } from 'next';

import { appEnv } from '@/config/app';
import { OFFICIAL_URL } from '@/const/url';
import { translation } from '@/server/translation';

const title = 'Eris AI';

const BASE_PATH = appEnv.NEXT_PUBLIC_BASE_PATH;
const noManifest = !!BASE_PATH;

export const generateMetadata = async (): Promise<Metadata> => {
  const { t } = await translation('metadata');

  return {
    appleWebApp: {
      statusBarStyle: 'black-translucent',
      title,
    },
    description: t('chat.description'),
    icons: {
      apple: '/eris.svg?v=1',
      icon: '/eris.svg?v=1',
      shortcut: '/eris.svg?v=1',
    },
    manifest: noManifest ? undefined : '/manifest.json',
    metadataBase: new URL(OFFICIAL_URL),
    openGraph: {
      description: t('chat.description'),
      locale: 'en-US',
      siteName: title,
      title,
      type: 'website',
      url: OFFICIAL_URL,
    },
    title: {
      default: t('chat.title'),
      template: '%s · Eris AI',
    },
    twitter: {
      card: 'summary',
      description: t('chat.description'),
      title: t('chat.title'),
    },
  };
};
