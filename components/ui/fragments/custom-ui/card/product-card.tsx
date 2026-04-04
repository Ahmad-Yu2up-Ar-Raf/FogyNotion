// components/LastReadCard.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/fragments/shadcn-ui/card';
import React from 'react';
import { cn } from '@/lib/utils';
import { Dimensions, View, ViewProps } from 'react-native';

import { batasiKata } from '@/hooks/useWord';
import { Product } from '@/type/product-type';
import { Text } from '../../shadcn-ui/text';
import { Button } from '../../shadcn-ui/button';
import { Icon } from '../../shadcn-ui/icon';

import { ShoppingCartIcon, Star } from 'lucide-react-native';
import { Image } from '../../shadcn-ui/image';
type componentProps = ViewProps & {
  className?: string;
  product: Product;
};

export function ProductCard({ className, product, ...props }: componentProps) {
  const SCREEN_WIDTH = Dimensions.get('window').width;
  const Title = batasiKata(product.title, 2);
  const CARD_WIDTH = SCREEN_WIDTH / 3; // 4 kartu per baris dengan margin
  const IMAGE_HEIGHT = CARD_WIDTH * (4 / 4);
  return (
    <Card
      className={cn(
        'mb-3 h-full w-full flex-1 flex-row items-center gap-0 rounded-2xl border-0 p-5 transition-all duration-200',
        className
      )}
      {...props}>
      <CardContent className="h-full w-full gap-1 rounded-none p-0">
        <CardHeader className="relative w-full content-center items-center justify-center rounded-xl bg-transparent px-0">
          <View className="w-full flex-1 flex-row items-center justify-end gap-2">
            <Icon as={Star} className="size-4 fill-yellow-500 text-yellow-500" />
            <Text
              variant={'small'}
              className="font-source_serif_semibold text-lg tracking-tighter text-muted-foreground/60">
              {product.rating.toFixed(1)}
            </Text>
          </View>
          <View className="m-auto" style={{ width: CARD_WIDTH, height: IMAGE_HEIGHT }}>
            <Image
              source={{ uri: product.thumbnail }}
              contentFit="cover"
              className="h-full w-full bg-transparent"
            />
          </View>
        </CardHeader>
        <CardTitle className="font-source_serif_semibold mb-3 mt-1 line-clamp-1 w-fit flex-1 text-[1.35rem] tracking-tighter text-foreground/85">
          {Title}
        </CardTitle>

        <CardFooter className="flex w-full justify-between p-0">
          <View className="flex-1 flex-row items-center gap-1">
            <Text variant={'large'} className="font-source_serif_bold pb-0.5 text-xl">
              $
            </Text>
            <CardDescription
              variant={'large'}
              className="font-source_serif_bold line-clamp-1 w-full text-2xl leading-relaxed tracking-tighter text-foreground">
              {product.price.toFixed(2)}
            </CardDescription>
          </View>
          <Button size={'icon'} className="relative size-9 rounded-full p-2">
            <Icon as={ShoppingCartIcon} className="size-full text-background/85" />
          </Button>
        </CardFooter>

        {/* MOSQUE (absolute, right background) */}
        {/* 
        <Text
          variant={'default'}
          className="text -foreground line-clamp-2 w-full font-poppins_medium text-xs leading-relaxed">
          {product.latin}
        </Text>
        <Text
          variant={'muted'}
          className="tracing-tigther line-clamp-1 w-full font-poppins_medium text-[9px] leading-relaxed text-muted-foreground/80">
          {Arti}
        </Text> */}
      </CardContent>
    </Card>
  );
}
