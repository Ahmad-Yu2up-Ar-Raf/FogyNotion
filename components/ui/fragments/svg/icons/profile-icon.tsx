import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';
const SvgComponent = (props: SvgProps) => (
  <Svg
    className="icon flat-color"
    data-name="Flat Color"
    viewBox="0 0 24 24"
    strokeWidth={2}
    width={27}
    height={27}
    {...props}>
    <Path
      d="M21 20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 6 6 0 0 1 6-6h6a6 6 0 0 1 6 6Zm-9-8a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z"
      fill={props.fill}
    />
  </Svg>
);
export default SvgComponent;
