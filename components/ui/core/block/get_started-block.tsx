import { Onboarding, useOnboarding } from '@/components/ui/fragments/shadcn-ui/onboarding';

import { Redirect } from 'expo-router';

import { View } from 'react-native';
import { Input } from '../../fragments/shadcn-ui/input';
import { GroupedInput, GroupedInputItem } from '../../fragments/custom-ui/form/input-form';

export const OnboardingPresets = {
  welcome: [
    {
      id: 'welcome',
      title: 'Sebelum Kita Mulai, Boleh Kenalan Dulu?',
      //   description: 'Kelola uangmu, bayar, dan terima dengan mudah.',
      content: (
        <GroupedInput>
          <GroupedInputItem
            label="Name"
            placeholder="Your name"
            keyboardType="default"
            autoComplete="name"
            autoCapitalize="words"
            returnKeyType="next"
          />
        </GroupedInput>
      ),
    },
    {
      id: 'features',
      title: 'Apa nama bisnis atau perusahaan kamu?',

      content: (
        <GroupedInput>
          <GroupedInputItem
            label="Business Name"
            placeholder="Your business name"
            keyboardType="default"
            autoComplete="name"
            autoCapitalize="words"
            returnKeyType="next"
          />
          <GroupedInputItem
            type="textarea"
            label="Deskripsi Singkat Bisnis Kamu"
            placeholder="Your business description"
            keyboardType="default"
            autoComplete="name"
            autoCapitalize="words"
            returnKeyType="next"
          />
        </GroupedInput>
      ),
    },
    {
      id: 'personalize',
      title: 'Atur Sesuai Kamu',
      description: 'Personalisasi fitur dan notifikasi sesuai kebutuhan.',
      content: (
        <View className="flex h-fit scale-[.50] content-center items-center justify-start overflow-hidden"></View>
      ),
    },
    {
      id: 'ready',
      title: 'Siap Digunakan',
      description: 'Mulai pakai DANA — aman, cepat, dan terpercaya.',
      content: (
        <View className="flex h-fit scale-[.55] content-center items-center justify-start overflow-hidden"></View>
      ),
    },
  ],
};

export default function GetStartedOnboarding() {
  const { hasCompletedOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();

  if (hasCompletedOnboarding) {
    return <Redirect href={'/'} />;
  }

  return (
    <>
      <Onboarding
        steps={OnboardingPresets.welcome}
        onComplete={completeOnboarding}
        onSkip={skipOnboarding}
        showSkip={true}
        edges={['bottom', 'left', 'right', 'top']}
        showProgress={true}
        swipeEnabled={true}
        primaryButtonText="Get Started"
        skipButtonText="Skip"
        withBackButton={true}
        nextButtonText="Next"
        backButtonText="Back"
      />
      {/* <View className="absolute z-10 h-full w-full bg-card" /> */}
    </>
  );
}
