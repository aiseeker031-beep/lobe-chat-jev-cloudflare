'use client';

import { memo } from 'react';
import { Center } from 'react-layout-kit';

const Logo = memo<{ mobile?: boolean }>(({ mobile }) => {
  const size = mobile ? 190 : 260;

  return (
    <Center
      style={{
        height: mobile ? 230 : 'min(360px, 34vw)',
        marginBottom: mobile ? 0 : '-4%',
        marginTop: mobile ? 0 : '-8%',
        position: 'relative',
        width: mobile ? 230 : 'min(720px, 70vw)',
      }}
    >
      <div
        aria-label={'Eris AI'}
        style={{
          alignItems: 'center',
          background:
            'radial-gradient(circle at 32% 28%, #ffffff 0%, #d8ccff 10%, #8d6cff 34%, #3d1a78 62%, #090712 82%)',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: '50%',
          boxShadow:
            '0 0 80px rgba(128,88,255,0.38), inset -24px -30px 55px rgba(0,0,0,0.5)',
          display: 'flex',
          height: size,
          justifyContent: 'center',
          width: size,
        }}
      >
        <div
          style={{
            color: '#fff',
            fontSize: mobile ? 34 : 44,
            fontWeight: 750,
            letterSpacing: '-0.06em',
            textShadow: '0 4px 22px rgba(0,0,0,0.5)',
          }}
        >
          ERIS
        </div>
      </div>
    </Center>
  );
});

Logo.displayName = 'ErisLogo';

export default Logo;
