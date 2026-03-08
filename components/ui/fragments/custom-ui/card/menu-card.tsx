import { View } from 'react-native';
import React from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/fragments/shadcn-ui/button';
import { Text } from '@/components/ui/fragments/shadcn-ui/text';
import { Icon } from '@/components/ui/fragments/shadcn-ui/icon';
import { ChevronRight } from 'lucide-react-native';
import { Card, CardContent } from '@/components/ui/fragments/shadcn-ui/card';
import { MenuDetail } from '@/type';
import { Separator } from '../../shadcn-ui/separator';

type componentProps = {
  MenuList: MenuDetail[];
  className?: string;
  buttonClassName?: string;
  hideLastSeparator?: boolean;
};

export default function MenuCard({
  MenuList,
  className,
  buttonClassName,
  hideLastSeparator = false,
}: componentProps) {
  return (
    <Card
      className={cn(
        'm-auto h-fit w-full content-start items-start justify-start overflow-hidden rounded-xl border-0 p-0 shadow-none',
        className
      )}>
      <CardContent className="w-full overflow-hidden p-0">
        {MenuList.map((detail, i) => {
          // ✅ FIX: Shorthand fragment `<>` tidak mendukung prop `key`.
          // Gunakan `React.Fragment` secara eksplisit agar key bisa dipasang
          // di elemen paling luar dari setiap iterasi map.
          const isLastItem = i === MenuList.length - 1;
          const showSeparator = hideLastSeparator ? true : !isLastItem;

          return (
            <React.Fragment key={`menu-item-${i}`}>
              <Button
                id="menu-button"
                variant="outline"
                onPress={detail.onPress}
                className={cn(
                  'h-fit w-full justify-between rounded-none border-0 bg-background p-4 active:bg-accent dark:bg-background dark:active:bg-input/50',
                  buttonClassName
                )}>
                <View className="flex-row items-center gap-4">
                  {detail.icon && (
                    <Icon as={detail.icon} size={21} className="text-muted-foreground/80" />
                  )}
                  <Text variant="h3" className="text-base font-semibold">
                    {detail.Label}
                  </Text>
                </View>

                {detail.rigthComponent ? (
                  detail.rigthComponent
                ) : (
                  <View className="flex-row items-center gap-1">
                    <Text variant="p" className="m-0 p-0">
                      {detail.Value}
                    </Text>
                    <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
                  </View>
                )}
              </Button>

              {/* ✅ Kondisi separator disederhanakan dan dipindah ke variabel */}
              {showSeparator && <Separator className="w-full" />}
            </React.Fragment>
          );
        })}
      </CardContent>
    </Card>
  );
}
