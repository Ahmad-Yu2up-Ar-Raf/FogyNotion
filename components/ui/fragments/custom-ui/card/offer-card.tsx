// components/LastReadCard.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/fragments/shadcn-ui/card';
import React from 'react';
import { cn } from '@/lib/utils';
import { View, ViewProps } from 'react-native';
import { Text } from '../../shadcn-ui/text';
import MascontSVG from '../../svg/mascot';
import { Button } from '../../shadcn-ui/button';

export function OfferCard({ className, ...props }: ViewProps) {
  return (
    <Card className={cn('w-ful relative h-fit px-5', className)} {...props}>
      <CardContent className="relative h-full w-full content-start items-start justify-start rounded-3xl p-0">
        {/* LEFT content: flex 1 with right padding reserved for mosque */}
        <View className="h-full flex-col content-start items-start justify-start pr-20">
          <CardHeader className="relative z-40 m-auto flex-1 gap-3 py-0">
            <CardTitle className="font-poppins_bold text-2xl">Free Delivery</CardTitle>
            <CardDescription className="text-base">
              Enjoy exclusive discounts on tasty food today!
            </CardDescription>
          </CardHeader>
          <Button>
            <Text>Order Now</Text>
          </Button>
        </View>
        <View className="absolute -right-8 bottom-0">
          <MascontSVG />
        </View>
      </CardContent>
    </Card>
  );
}
