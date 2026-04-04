import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const MapPinIcon = ({ title, titleId, ...props }: SvgProps & SVGRProps) => (
  <Svg
    width={20}
    height={20}
    fill="none"
    stroke={props.fill}
    viewBox="-1.6 -1.6 19.2 19.2"
    aria-labelledby={titleId}
    {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <Path
      fill={props.fill}
      fillRule="evenodd"
      d="M3.379 10.224 8 16l4.621-5.776A6.292 6.292 0 0 0 14 6.293V6A6 6 0 0 0 2 6v.293c0 1.429.486 2.815 1.379 3.93ZM8 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default MapPinIcon;
