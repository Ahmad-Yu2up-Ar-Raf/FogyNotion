// components/ui/core/block/home-block.tsx

import React from 'react';
import { Wrapper } from '../layout/wrapper';
import TrendingCarousel from '../../fragments/custom-ui/carousel/categories-carousel';
import { OfferCard } from '../../fragments/custom-ui/card/offer-card';

export default function HomeBlock() {
  return (
    <Wrapper edges={['bottom']}>
      <OfferCard />
      {/* <TrendingCarousel title="Trending" /> */}
    </Wrapper>
  );
}
