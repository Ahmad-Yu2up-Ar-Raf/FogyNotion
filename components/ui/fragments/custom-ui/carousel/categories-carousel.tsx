// components/ui/fragments/custom/carousel/categories-carousel.tsx - Category carousel dengan filter state

import { View, ScrollView, Image, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';

import { cn } from '@/lib/utils';

import { Text } from '../../shadcn-ui/text';

import { Button } from '../../shadcn-ui/button';

const categoryData: category[] = [
  {
    name: 'Burger',
    image:
      'https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    name: 'Pizza',
    image:
      'https://images.unsplash.com/photo-1607532941433-304659e8198a?q=80&w=1078&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    name: 'Sushi',
    image: 'https://source.unsplash.com/random/200x200?sig=3',
  },
  {
    name: 'Beverages',
    image: 'https://source.unsplash.com/random/200x200?sig=4',
  },
];

interface category {
  name: string;
  image: string;
}

type TrendingCarouselProps = {
  title: string;
  TrendingCategory?: category[];
  isLoading?: boolean;
  onCategorySelect?: (category: category) => void;
  className?: string;
  skeletonCount?: number;
};

export default function TrendingCarousel({
  title,
  TrendingCategory = categoryData,
  onCategorySelect,
  className,
}: TrendingCarouselProps) {
  const [loadingImages, setLoadingImages] = useState<{ [key: string]: boolean }>({});

  const handleImageLoad = (categoryName: string) => {
    setLoadingImages((prev) => ({
      ...prev,
      [categoryName]: false,
    }));
  };

  const handleImageLoadStart = (categoryName: string) => {
    setLoadingImages((prev) => ({
      ...prev,
      [categoryName]: true,
    }));
  };

  return (
    <View className={cn('w-full gap-3', className)}>
      {/* Horizontal scrolling category cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 5,
        }}
        decelerationRate="fast"
        snapToInterval={200}
        snapToAlignment="start">
        {TrendingCategory.slice(0, 4).map((category, index) => {
          const isLoading = loadingImages[category.name];

          return (
            <Button
              variant={'secondary'}
              size={'lg'}
              className="h-[3.5rem] flex-row items-center rounded-full px-1.5"
              key={`category-${category.name}-${index}`}>
              {/* Image wrapper - pastikan punya fixed size */}
              <View
                className="size-12 rounded-full"
                style={{
                  overflow: 'hidden',
                  backgroundColor: '#f3f4f6',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                {isLoading && <ActivityIndicator size="small" color="#666" />}
                <Image
                  source={{ uri: category.image }}
                  onLoadStart={() => handleImageLoadStart(category.name)}
                  onLoad={() => handleImageLoad(category.name)}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  resizeMode="cover"
                />
              </View>

              {/* Text */}
              <Text
                variant={'small'}
                className="px-3 font-poppins_medium text-sm tracking-tighter"
                numberOfLines={1}>
                {category.name}
              </Text>
            </Button>
          );
        })}
      </ScrollView>
    </View>
  );
}
