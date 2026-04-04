import * as React from 'react';
import Svg, { SvgProps, G, Path } from 'react-native-svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const MenuSheetIcon = ({ title, titleId, ...props }: SvgProps & SVGRProps) => (
  <Svg
    fill="none"
    viewBox="-0.5 0 25 25"
    width={24}
        height={24}
        
    aria-labelledby={titleId}
    {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <G stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}>
      <Path d="M19 3.32h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2ZM8 3.32H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2ZM19 14.32h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2ZM8 14.32H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2Z" />
    </G>
  </Svg>
);
export default MenuSheetIcon;
