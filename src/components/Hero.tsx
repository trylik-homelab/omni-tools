import {
  Autocomplete,
  Box,
  darken,
  lighten,
  Stack,
  styled,
  TextField,
  useTheme
} from '@mui/material';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import Grid from '@mui/material/Grid';
import { useState } from 'react';
import { DefinedTool } from '@tools/defineTool';
import { filterTools, tools } from '@tools/index';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { getToolCategoryTitle } from '@utils/string';
import { useTranslation } from 'react-i18next';
import { FullI18nKey, validNamespaces } from '../i18n';
import {
  getBookmarkedToolPaths,
  isBookmarked,
  toggleBookmarked
} from '@utils/bookmark';
import IconButton from '@mui/material/IconButton';
import { useUserTypeFilter } from '../providers/UserTypeFilterProvider';

const GroupHeader = styled('div')(({ theme }) => ({
  position: 'sticky',
  top: '-8px',
  padding: '4px 10px',
  color: theme.palette.primary.main,
  backgroundColor: lighten(theme.palette.primary.light, 0.85),
  ...theme.applyStyles('dark', {
    backgroundColor: darken(theme.palette.primary.main, 0.8)
  })
}));

const GroupItems = styled('ul')({
  padding: 0
});

type ToolInfo = {
  label: FullI18nKey;
  url: string;
};

export default function Hero() {
  const { t } = useTranslation(validNamespaces);
  const [inputValue, setInputValue] = useState<string>('');
  const theme = useTheme();
  const { selectedUserTypes } = useUserTypeFilter();
  const [filteredTools, setFilteredTools] = useState<DefinedTool[]>(tools);
  const [bookmarkedToolPaths, setBookmarkedToolPaths] = useState<string[]>(
    getBookmarkedToolPaths()
  );
  const navigate = useNavigate();

  const exampleTools: ToolInfo[] = [
    {
      label: 'translation:hero.examples.createTransparentImage',
      url: '/image-generic/create-transparent'
    },
    {
      label: 'translation:hero.examples.prettifyJson',
      url: '/json/prettify'
    },
    {
      label: 'translation:hero.examples.changeGifSpeed',
      url: '/gif/change-speed'
    },
    {
      label: 'translation:hero.examples.sortList',
      url: '/list/sort'
    },
    {
      label: 'translation:hero.examples.compressPng',
      url: '/png/compress-png'
    },
    {
      label: 'translation:hero.examples.splitText',
      url: '/string/split'
    },
    {
      label: 'translation:hero.examples.splitPdf',
      url: '/pdf/split-pdf'
    },
    {
      label: 'translation:hero.examples.trimVideo',
      url: '/video/trim'
    },
    {
      label: 'translation:hero.examples.calculateNumberSum',
      url: '/number/sum'
    }
  ];

  const handleInputChange = (
    _event: React.ChangeEvent<{}>,
    newInputValue: string
  ) => {
    setInputValue(newInputValue);
    setFilteredTools(filterTools(tools, newInputValue, selectedUserTypes, t));
  };

  const toolsMap = new Map<string, ToolInfo>();
  for (const tool of filteredTools) {
    toolsMap.set(tool.path, {
      label: tool.name,
      url: '/' + tool.path
    });
  }

  const displayedTools =
    bookmarkedToolPaths.length > 0
      ? bookmarkedToolPaths.flatMap((path) => {
          const tool = toolsMap.get(path);
          if (tool === undefined) {
            return [];
          }
          return [tool];
        })
      : exampleTools;

  return (
    <Box
      sx={{
        width: { xs: '90%', md: '80%', lg: '60%' }
      }}
    >
      <Stack
        direction={'row'}
        spacing={1}
        sx={{
          mb: 1,
          justifyContent: 'center'
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: 25, md: 30 },
            textAlign: 'center'
          }}
        >
          {t('translation:hero.title')}{' '}
          <Typography
            color={'primary'}
            sx={{
              fontSize: { xs: 25, md: 30 },
              display: 'inline'
            }}
          >
            {t('translation:hero.brand')}
          </Typography>
        </Typography>
      </Stack>
      <Typography
        sx={{
          fontSize: { xs: 15, md: 20 },
          mb: 2,
          textAlign: 'center'
        }}
      >
        {t('translation:hero.description')}
      </Typography>

      <Autocomplete
        sx={{ mb: 2 }}
        autoHighlight
        options={filteredTools}
        noOptionsText={t('translation:hero.search.noResult')}
        // Disable default MUI filtering since we already apply custom filterTools
        filterOptions={(options) => options}
        groupBy={(option) => option.type}
        renderGroup={(params) => {
          return (
            <li key={params.key}>
              <GroupHeader>{getToolCategoryTitle(params.group, t)}</GroupHeader>
              <GroupItems>{params.children}</GroupItems>
            </li>
          );
        }}
        inputValue={inputValue}
        getOptionLabel={(option) => t(option.name)}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            placeholder={t('translation:hero.search.placeholder')}
            onChange={(event) => handleInputChange(event, event.target.value)}
            slotProps={{
              ...params.slotProps,

              input: {
                ...params.slotProps.input,
                endAdornment: <SearchIcon />,
                sx: {
                  borderRadius: 4,
                  backgroundColor: 'background.paper'
                }
              }
            }}
          />
        )}
        renderOption={({ key, ...props }, option) => (
          <Box
            component="li"
            key={key}
            {...props}
            onClick={() => navigate('/' + option.path)}
          >
            <Stack
              direction={'row'}
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%'
              }}
            >
              <Stack
                direction={'row'}
                spacing={2}
                sx={{
                  alignItems: 'center'
                }}
              >
                <Icon fontSize={20} icon={option.icon} />
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 'bold'
                    }}
                  >
                    {t(option.name)}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 12
                    }}
                  >
                    {t(option.shortDescription)}
                  </Typography>
                </Box>
              </Stack>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmarked(option.path);
                  setBookmarkedToolPaths(getBookmarkedToolPaths());
                }}
              >
                <Icon
                  fontSize={20}
                  color={
                    isBookmarked(option.path)
                      ? theme.palette.primary.main
                      : theme.palette.grey[500]
                  }
                  icon={
                    isBookmarked(option.path)
                      ? 'mdi:bookmark'
                      : 'mdi:bookmark-plus-outline'
                  }
                />
              </IconButton>
            </Stack>
          </Box>
        )}
        onChange={(event, newValue) => {
          if (newValue) {
            navigate('/' + newValue.path);
          }
        }}
      />
      <Grid
        container
        spacing={2}
        sx={{
          width: '100%',
          mt: 2
        }}
      >
        {displayedTools.map((tool) => (
          <Grid
            onClick={() =>
              navigate(tool.url.startsWith('/') ? tool.url : `/${tool.url}`)
            }
            key={tool.label}
            size={{
              xs: 12,
              md: 6,
              lg: 4
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                padding: 1,
                borderRadius: 3,
                borderColor: theme.palette.mode === 'dark' ? '#363b41' : 'grey',
                borderStyle: 'solid',
                backgroundColor: 'background.paper',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'background.hover'
                },
                height: '100%'
              }}
            >
              <Stack
                direction={'row'}
                spacing={1}
                sx={{
                  alignItems: 'center'
                }}
              >
                <Typography
                  sx={{
                    textAlign: 'center'
                  }}
                >
                  {t(tool.label)}
                </Typography>
                {bookmarkedToolPaths.length > 0 && (
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      const path = tool.url.substring(1);
                      toggleBookmarked(path);
                      setBookmarkedToolPaths(getBookmarkedToolPaths());
                    }}
                    size={'small'}
                  >
                    <Icon
                      icon={'mdi:close'}
                      color={theme.palette.grey[500]}
                      fontSize={15}
                    />
                  </IconButton>
                )}
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
