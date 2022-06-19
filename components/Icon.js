import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// custom icon with props for styling
export const Icon = ({ name, size, color, style }) => {
  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={color}
      style={style}
    />
  );
};
