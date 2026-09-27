import { memo } from 'react';

import UserAvatar from '@/features/User/UserAvatar';

const Avatar = memo(() => <UserAvatar />);

Avatar.displayName = 'Avatar';

export default Avatar;
