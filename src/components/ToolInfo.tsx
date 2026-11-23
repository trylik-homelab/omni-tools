import { Box, Stack, Typography } from '@mui/material';

interface ExampleProps {
  title: string;
  description: string;
}

export default function ToolInfo({ title, description }: ExampleProps) {
  return (
    <Stack
      direction={'row'}
      spacing={2}
      sx={{
        alignItems: 'center',
        mt: 4
      }}
    >
      <Box>
        <Typography
          color={'primary'}
          sx={{
            mb: 2,
            fontSize: 30
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontSize: 20
          }}
        >
          {description}
        </Typography>
      </Box>
    </Stack>
  );
}
