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
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AppBar from '@mui/material/AppBar';
import useMediaQuery from '@mui/material/useMediaQuery';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import Profile from './Profile';
import SearchIcon from '@mui/icons-material/Search';



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

export default function SideBar() {
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
          <div className=' flex items-center rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500'>
            <input type="text" placeholder="Search....." className="px-3 py-1  text-neutral-900 border-none min-w-[350px] focus:outline-none  bg-transparent " />
            <SearchIcon className='w-6 h-6 text-neutral-900' />
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
        {isMobile && (
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </DrawerHeader>
        )}
        <Divider />
        {/* Header */}
        <List>
          {/* Library name and notification icon */}
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemText primary="Library Management" />
              <NotificationsNoneOutlinedIcon />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
        <List>
          {['Student Admission', 'Student Detail', 'Announcment', 'Setting'].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: isMobile ? 0 : `${open ? drawerWidth : 0}px`,
        }}
      >
        <DrawerHeader />
        <Typography paragraph>Content goes here.</Typography>
      </Box>
    </Box>
  );
}
