import { View } from 'react-native';
import React from 'react';
import { Href, router } from 'expo-router';
import { Text } from '../../shadcn-ui/text';
import { Button, buttonTextVariants, buttonVariants } from '../../shadcn-ui/button';
import { Icon } from '../../shadcn-ui/icon';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react-native';

type HeaderActionProps = {
  title: string;

  className?: string;
  onPress?: () => void;
};
type HeaderProps = {
  title: string;

  className?: string;
};

export function Header({ title, className }: HeaderProps) {
  return (
    <Text
      variant={'h2'}
      className={cn(
        'font-Termina_Bold w-fit border-0 border-none text-lg tracking-tighter',
        className
      )}>
      {title}
    </Text>
  );
}

export function HeaderAction({ title, className, onPress }: HeaderActionProps) {
  return (
    <Button
      onPress={onPress}
      variant={'link'}
      className={cn(
        'h-fit w-full justify-start gap-2 bg-background p-0 active:bg-background',
        className
      )}>
      <Text
        variant={'h2'}
        className="font-Termina_Bold w-fit border-0 border-none text-lg tracking-tighter group-active:text-muted-foreground">
        {title}
      </Text>

      <View
        className={cn(
          buttonTextVariants({ variant: 'secondary', size: 'icon' }),
          buttonVariants({ variant: 'secondary', size: 'icon' }),
          'mb-2 h-fit w-fit rounded-full p-0.5 group-active:opacity-45'
        )}>
        <Icon
          as={ChevronRight}
          className={cn(
            // buttonVariants({ variant: 'secondary', size: 'icon' }),
            'font-Termina_Bold rounded-full'
          )}
          size={15}
        />
      </View>
    </Button>
  );
}
