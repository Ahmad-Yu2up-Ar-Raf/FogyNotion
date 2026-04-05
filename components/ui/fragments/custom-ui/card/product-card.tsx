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

import { ShoppingCartIcon, Star, Check } from 'lucide-react-native';
import { Image } from '../../shadcn-ui/image';
import { useCart } from '@/components/provider/CartProvider';

type componentProps = ViewProps & {
  className?: string;
  product: Product;
};

export function ProductCard({ className, product, ...props }: componentProps) {
  const { addItem } = useCart();

  const SCREEN_WIDTH = Dimensions.get('window').width;
  const Title = batasiKata(product.title, 2);
  const CARD_WIDTH = SCREEN_WIDTH / 3;
  const IMAGE_HEIGHT = CARD_WIDTH * (4 / 4);

  /**
   * ✅ SIMPLE FIRE & FORGET
   * - Just add to cart
   * - No state tracking
   * - No visual changes
   * - Super simple! ⚡
   */
  const handleAddToCart = () => {
    addItem(product, 1);
  };

  return (
    <Card
      className={cn(
        'h-full w-full flex-1 flex-row items-center gap-0 rounded-2xl border-0 p-5 transition-all duration-200',
        className
      )}
      {...props}>
      <CardContent className="h-full w-full gap-1 rounded-none p-0">
        <CardHeader className="relative w-full content-center items-center justify-center rounded-xl bg-transparent px-0">
          <View className="w-full flex-1 flex-row items-center justify-end gap-2">
            <Icon as={Star} className="size-3.5 fill-yellow-500 text-yellow-500" />
            <Text
              variant={'small'}
              className="font-source_serif_semibold text-base tracking-tighter text-muted-foreground/60">
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
        <CardTitle className="mb-2.5 mt-1 line-clamp-1 w-fit flex-1 font-source_serif_semibold text-[1.35rem] tracking-tighter text-foreground/85">
          {Title}
        </CardTitle>

        <CardFooter className="flex w-full justify-between p-0">
          <View className="flex-1 flex-row items-center gap-1">
            <Text variant={'large'} className="pb-0.5 font-source_serif_bold text-xl">
              $
            </Text>
            <CardDescription
              variant={'large'}
              className="line-clamp-1 w-full font-source_serif_bold text-2xl leading-relaxed tracking-tighter text-foreground">
              {product.price.toFixed(2)}
            </CardDescription>
          </View>
          <Button
            size={'icon'}
            className="relative size-9 rounded-full p-0 transition-all duration-200 active:scale-95"
            onPress={handleAddToCart}>
            <Icon
              as={ShoppingCartIcon}
              className="size-full text-background/85 transition-colors duration-200"
            />
          </Button>
        </CardFooter>
      </CardContent>
    </Card>
  );
}
