import Typography from '@mui/material/Typography';
import React, { ReactNode } from 'react';
import Grid from '@mui/material/Grid';

export interface ToolOptionGroup {
  title: string;
  component: ReactNode;
}

export default function ToolOptionGroups({
  groups,
  vertical
}: {
  groups: ToolOptionGroup[];
  vertical?: boolean;
}) {
  return (
    <Grid container spacing={2}>
      {groups.map((group) => (
        <Grid
          key={group.title}
          size={{
            xs: 12,
            md: vertical ? 12 : 4
          }}
        >
          <Typography
            sx={{
              mb: 1,
              fontSize: 22
            }}
          >
            {group.title}
          </Typography>
          {group.component}
        </Grid>
      ))}
    </Grid>
  );
}
