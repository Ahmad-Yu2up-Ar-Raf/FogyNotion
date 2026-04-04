// components/ui/core/layout/menu-sheet.tsx
//
// ✅ Self-contained drawer trigger.
// Tidak perlu props apapun dari header.
// DrawerActions.openDrawer() bubble up ke Drawer navigator
// terdekat di atas tree — works dari (tabs), doa, maupun article.

import { Button } from '@/components/ui/fragments/shadcn-ui/button';

import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import MenuSheetIcon from '../../fragments/svg/icons/menu-icon';

export function MenuSheet() {
  const navigation = useNavigation();

  return (
    <Button
      size="icon"
      className="size-12 rounded-full bg-card"
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
      <MenuSheetIcon className="size-5" />
    </Button>
  );
}
