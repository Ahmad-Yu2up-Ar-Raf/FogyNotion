import React from 'react';
import { Wrapper } from '../layout/wrapper';

import { useAuth, useUser } from '@clerk/clerk-expo';
import { UserAvatar } from '../feauture/auth/user-menu';
import { Stack } from 'expo-router';
import { SCREEN_OPTIONS } from '../layout/nav';
import { batasiKata } from '@/hooks/useWord';

export default function ProfileBlock() {
  const { user } = useUser();

  const { signOut } = useAuth();

  async function onSignOut() {
    await signOut();
  }
  const title = batasiKata(user?.fullName!, 2);
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS({ title: title })} />
      <Wrapper
        className="flex-1 content-center items-center justify-center"
        edges={['bottom', 'left', 'right']}>
        <UserAvatar className="size-20 rounded-full" />
      </Wrapper>
    </>
  );
}
