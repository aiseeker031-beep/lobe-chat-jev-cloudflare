import { GridShowcase } from '@lobehub/ui';
import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

const COPYRIGHT = `© ${new Date().getFullYear()} Eris AI`;

const DesktopLayout = ({ children }: PropsWithChildren) => (
  <Flexbox
    align={'center'}
    height={'100%'}
    justify={'space-between'}
    padding={16}
    style={{ overflow: 'hidden', position: 'relative' }}
    width={'100%'}
  >
    <div
      style={{
        alignSelf: 'flex-start',
        fontSize: 20,
        fontWeight: 700,
        letterSpacing: '-0.04em',
      }}
    >
      Eris AI
    </div>
    <GridShowcase
      innerProps={{ gap: 24 }}
      style={{ maxHeight: 'calc(100% - 104px)', maxWidth: 1024 }}
      width={'100%'}
    >
      {children}
    </GridShowcase>
    <span style={{ opacity: 0.5 }}>{COPYRIGHT}</span>
  </Flexbox>
);

export default DesktopLayout;
