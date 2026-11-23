import { Box, Radio, Stack } from '@mui/material';
import { Field, useFormikContext } from 'formik';
import Typography from '@mui/material/Typography';
import React from 'react';
import { globalDescriptionFontSize } from '../../config/uiConfig';

interface SimpleRadioProps {
  title: string;
  description?: string;
  checked: boolean;
  onClick: () => void;
}

const SimpleRadio: React.FC<SimpleRadioProps> = ({
  onClick,
  title,
  description,
  checked
}) => {
  return (
    <Box>
      <Stack
        direction={'row'}
        onClick={onClick}
        sx={{
          alignItems: 'center',
          mt: 2,
          mb: 1,
          cursor: 'pointer'
        }}
      >
        <Radio checked={checked} onClick={onClick} />
        <Typography>{title}</Typography>
      </Stack>
      {description && (
        <Typography
          sx={{
            ml: 2,
            fontSize: globalDescriptionFontSize
          }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
};

export default SimpleRadio;
