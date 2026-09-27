'use client';

import { memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

const BrandWatermark = memo<Omit<FlexboxProps, 'children'>>(({ style, ...rest }) => (
  <Flexbox
    align={'center'}
    flex={'none'}
    horizontal
    style={{
      fontSize: 12,
      fontWeight: 650,
      letterSpacing: '0.04em',
      opacity: 0.55,
      ...style,
    }}
    {...rest}
  >
    Eris AI
  </Flexbox>
));

BrandWatermark.displayName = 'BrandWatermark';

export default BrandWatermark;
