// components/ui/core/block/home-block.tsx

import React from 'react';
import { Wrapper } from '../layout/wrapper';
import { useQuery } from '@tanstack/react-query';
import { Text } from '../../fragments/shadcn-ui/text';
import { ProductsListQueryOptions } from '@/lib/server/products/products-server-queris';
import LoadingIndicator from '../loading-indicator';
import { RefreshControl, View } from 'react-native';
import { LegendList } from '@legendapp/list';
import { ProductCard } from '../../fragments/custom-ui/card/product-card';
export default function HomeBlock() {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery(
    ProductsListQueryOptions({})
  );
  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (isError) {
    return (
      <View className="flex-1 content-center justify-center">
        <Text className="mb-4 text-center text-muted-foreground">Gagal memuat data Products</Text>
        <Text className="font-poppins_semibold text-primary" onPress={() => refetch()}>
          Coba lagi
        </Text>
      </View>
    );
  }
  return (
    <LegendList
      data={data ?? []}
      renderItem={({ item, index }) => <ProductCard product={item} />}
      keyExtractor={(item, index) => `product-${item.id}-${index}`}
      numColumns={2}
      onEndReachedThreshold={1.5}
      contentContainerStyle={{ paddingTop: 30, gap: 20, paddingBottom: 100 }}
      className="px-5"
      ListHeaderComponent={HeaderComponent}
      // ✅ Pull to refresh
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      maintainVisibleContentPosition
      recycleItems
      showsVerticalScrollIndicator={false}
    />
  );
}

function HeaderComponent() {
  return (
    <>
      <View className=" px-6">
        <Text variant={'h2'}>Products List</Text>
      </View>
    </>
  );
}
