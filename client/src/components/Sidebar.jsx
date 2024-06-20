import { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AppBar from '@mui/material/AppBar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Mail, BookUser } from 'lucide-react';
import Profile from './Profile';
import SearchIcon from '@mui/icons-material/Search';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Link } from 'react-router-dom';

const drawerWidth = 240;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const AppBarContainer = styled(AppBar)(({ theme, isMobile, open }) => ({
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  width: isMobile ? '100%' : `calc(100% - ${open ? drawerWidth : 0}px)`,
  marginLeft: isMobile ? 0 : `${open ? drawerWidth : 0}px`,
}));

export default function SideBar({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBarContainer position="fixed" isMobile={isMobile} open={open}>
          <Toolbar>

            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerOpen}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            {/* Search input */}
            <div className="flex items-center rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500">
              <input
                type="text"
                placeholder="Search....."
                className="px-3 py-1 text-neutral-900 border-none min-w-[350px] focus:outline-none bg-transparent"
              />
              <SearchIcon className="w-6 h-6 text-neutral-900" />
            </div>
            <Profile />
          </Toolbar>
        </AppBarContainer>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          variant={isMobile ? 'temporary' : 'permanent'}
          anchor="left"
          open={open}
          onClose={handleDrawerClose}
        >

          <DrawerHeader className='w-full px-2'>

            <p> Library Management</p>

            <IconButton onClick={handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            <Link to="/">
              <ListItem disablePadding className='hover:border-l-2 hover:border-yellow-600'>
                <ListItemButton>
                  <ListItemIcon>
                    <DashboardIcon />
                  </ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </ListItemButton>
              </ListItem>
            </Link>
            <Link to="/admission">
              <ListItem disablePadding className='hover:border-l-2 hover:border-red-600'>
                <ListItemButton>
                  <ListItemIcon>
                    <LibraryBooksIcon />
                  </ListItemIcon>
                  <ListItemText primary="Student Admission" />
                </ListItemButton>
              </ListItem></Link>
            <Link to="/student-detail">
              <ListItem disablePadding className='hover:border-l-2 hover:border-blue-600'>
                <ListItemButton>
                  <ListItemIcon>
                    < BookUser />
                  </ListItemIcon>
                  <ListItemText primary="Student Detail" />
                </ListItemButton>
              </ListItem>
            </Link>
            <Link to="/email">
              <ListItem disablePadding className='hover:border-l-2 hover:border-green-600'>
                <ListItemButton>
                  <ListItemIcon>
                    <Mail />
                  </ListItemIcon>
                  <ListItemText primary="Email" />
                </ListItemButton>
              </ListItem>
            </Link>

          </List>


        </Drawer>
        <Box
          className='bg-gray-50'
          component="main"
          sx={{
            flexGrow: 1,
            // bgcolor: 'background.default',
            p: 3,
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),

          }}
        >
          <DrawerHeader />
          <div>{children}</div>
        </Box>
      </Box >
    </>
  );
}
