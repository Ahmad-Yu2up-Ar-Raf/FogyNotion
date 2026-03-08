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
import { Linking, Pressable, View, ViewProps } from 'react-native';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/fragments/shadcn-ui/avatar';

import { Item } from '@/type/article-type';
import { Image } from '../../shadcn-ui/image';
import { Text } from '@/components/ui/fragments/shadcn-ui/text';
import { Badge } from '@/components/ui/fragments/shadcn-ui/badge';
import { batasiKata } from '@/hooks/useWord';
import { useInitials } from '@/hooks/useInitial';
type componentProps = ViewProps & {
  className?: string;
  article: Item;
};
import { formatDistanceToNow } from 'date-fns';

export function ArticleCard({ className, article, ...props }: componentProps) {
  const title = batasiKata(article.title, 7);
  const category = batasiKata(article.categories[0], 1);
  const author = batasiKata(article.author, 1);
  const authorCallback = useInitials();
  const distance = formatDistanceToNow(article.pubDate);

  return (
    <Card
      className={cn(
        'mb-10 h-full w-full overflow-hidden bg-background p-0 transition-all duration-200',
        className
      )}
      {...props}>
      <Pressable className="active:opacity-50" onPress={() => Linking.openURL(article.link)}>
        <CardContent className="h-full w-full flex-row items-center justify-between gap-14 p-0">
          {/* LEFT content: flex 1 with right padding reserved for mosque */}
          <CardHeader className="relative z-40 w-fit flex-1 items-start gap-3 p-0 py-0">
            <Badge className="h-fit px-3 py-0">
              <Text
                className={'m-0 pt-0.5 font-poppins_semibold text-[10px] text-primary-foreground'}>
                {category}
              </Text>
            </Badge>
            <CardTitle className="line-clamp-2 font-poppins_semibold text-base leading-relaxed tracking-tighter">
              {title}
            </CardTitle>
            <View className={'flex-row items-center gap-3'}>
              <Avatar className="size-5" alt="Zach Nugent's size-5 Avatar">
                <AvatarFallback>
                  <Text className="text-[10px]">{authorCallback(article.author)}</Text>
                </AvatarFallback>
              </Avatar>
              <View className={'flex-row items-center gap-1.5'}>
                <Text
                  variant={'muted'}
                  className="font-poppins-semibold text-xs tracking-tighter text-muted-foreground">
                  {author}
                </Text>
                <Text
                  variant={'muted'}
                  className="font-poppins-semibold text-xs tracking-tighter text-muted-foreground">
                  •
                </Text>
                <Text
                  variant={'muted'}
                  className="font-poppins-semibold text-xs tracking-tighter text-muted-foreground">
                  {distance}
                </Text>
              </View>
            </View>
          </CardHeader>

          <View className="size-50 overflow-hidden rounded-2xl">
            <Image
              className={'size-full overflow-hidden rounded-xl'}
              source={{ uri: article.enclosure.link }}
              width={95}
              height={100}
            />
          </View>
        </CardContent>
      </Pressable>
    </Card>
  );
}
