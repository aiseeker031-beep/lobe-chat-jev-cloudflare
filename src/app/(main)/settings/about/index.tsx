'use client';

import { Form } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import Version from './features/Version';

const Page = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { t } = useTranslation('common');

  return (
    <Form.Group style={{ width: '100%' }} title={`${t('about')} Eris AI`} variant={'pure'}>
      <Flexbox gap={10} paddingBlock={20} width={'100%'}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.04em' }}>Eris AI</div>
        <div style={{ opacity: 0.65 }}>
          A focused AI workspace for conversations, agents, models and tools.
        </div>
        <div style={{ marginTop: 16, opacity: 0.6 }}>{t('version')}</div>
        <Version mobile={mobile} />
      </Flexbox>
    </Form.Group>
  );
});

Page.displayName = 'AboutSetting';

export default Page;
