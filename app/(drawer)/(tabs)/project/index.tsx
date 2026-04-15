import ProjectBlock from '@/components/ui/core/block/Todo-block';
import { SCREEN_OPTIONS } from '@/components/ui/core/layout/nav';

import { Link, Stack } from 'expo-router';

import * as React from 'react';

export default function Screen() {
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS({ title: 'To Do' })} />
      <ProjectBlock />
    </>
  );
}
