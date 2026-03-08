import { View } from 'react-native';
import React from 'react';
import { Text } from '../../shadcn-ui/text';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/fragments/shadcn-ui/tabs';
import { LastReadCard } from '../card/last-read-card';

export default function QuranHeader() {
  const [value, setValue] = React.useState('surah');
  return (
    <View className="gap-12">
      <LastReadCard />
      <View className="mb-2 w-full flex-row items-center justify-between px-1">
        <Text variant={'h3'} className="font-poppins_semibold tracking-tighter">
          Al Quran
        </Text>
        <Tabs value={value} onValueChange={setValue} className="">
          <TabsList className="rounded-2xl">
            <TabsTrigger value="surah" className="rounded-2xl">
              <Text>Surah</Text>
            </TabsTrigger>
            <TabsTrigger value="juz" className="rounded-2xl">
              <Text>Juz</Text>
            </TabsTrigger>
            <TabsTrigger value="page" className="rounded-2xl">
              <Text>Page</Text>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </View>
    </View>
  );
}
