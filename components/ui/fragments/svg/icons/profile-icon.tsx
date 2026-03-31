import * as React from 'react';
import Svg, { SvgProps, Circle, Path } from 'react-native-svg';
const ProfileIcon = (props: SvgProps) => (
  <Svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <Circle cx={12} cy={6} r={4} fill={props.fill} />
    <Path
      fill={props.fill}
      d="M20 17.5c0 2.485 0 4.5-8 4.5s-8-2.015-8-4.5S7.582 13 12 13s8 2.015 8 4.5Z"
    />
  </Svg>
);
export default ProfileIcon;
