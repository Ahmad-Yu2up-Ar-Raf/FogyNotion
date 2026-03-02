import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';
const MasjidIcon = (props: SvgProps) => (
  <Svg

    data-name="Flat Color"
    viewBox="0 0 24 24"
    {...props}>
    <Path
      d="M14.21 4.78a1 1 0 0 0-1.42 0 .76.76 0 1 1-1.07-1.07 1 1 0 0 0 0-1.42 1 1 0 0 0-1.41 0 2.75 2.75 0 0 0 0 3.9 2.55 2.55 0 0 0 .69.49V9a1 1 0 0 0 2 0V6.88a2.69 2.69 0 0 0 1.21-.69 1 1 0 0 0 0-1.41Z"
      fill={props.fill}
    />
    <Path
      d="M17.23 11.94a16.83 16.83 0 0 1-4.46-3.57 1 1 0 0 0-1.54 0 16.83 16.83 0 0 1-4.46 3.57C4.14 13.36 3 15 3 17.33a9.82 9.82 0 0 0 1.08 4.06A1 1 0 0 0 5 22h14a1 1 0 0 0 .92-.61A9.82 9.82 0 0 0 21 17.33c0-2.33-1.14-3.97-3.77-5.39Z"
      fill={props.fill}
    />
  </Svg>
);
export default MasjidIcon;
