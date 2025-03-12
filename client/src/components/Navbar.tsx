import React from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Button,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  School as SchoolIcon,
  Logout as LogoutIcon,
  Class as ClassIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ minHeight: { xs: '56px', sm: '64px' } }}>
        <SchoolIcon 
          sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            mr: 1,
            color: theme => theme.palette.secondary.main 
          }} 
        />
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            mr: 2,
            display: { xs: 'none', md: 'flex' },
            fontFamily: 'Roboto',
            fontWeight: 700,
            letterSpacing: '.1rem',
            color: 'white',
            textDecoration: 'none',
          }}
        >
          LCC BIÑAN
        </Typography>

        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          <Button
            startIcon={<DashboardIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            Dashboard
          </Button>
          {user.role === 'teacher' && (
            <Button
              startIcon={<ClassIcon />}
              onClick={() => navigate('/classes')}
              sx={{ 
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              Classes
            </Button>
          )}
        </Box>

        {/* Mobile Menu */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, flexGrow: 1 }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenu}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            sx={{
              '& .MuiPaper-root': {
                backgroundColor: 'white',
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
              }
            }}
          >
            <MenuItem onClick={() => { navigate('/dashboard'); handleClose(); }}>
              <DashboardIcon sx={{ mr: 1 }} /> Dashboard
            </MenuItem>
            {user.role === 'teacher' && (
              <MenuItem onClick={() => { navigate('/classes'); handleClose(); }}>
                <ClassIcon sx={{ mr: 1 }} /> Classes
              </MenuItem>
            )}
          </Menu>
        </Box>

        {/* Mobile Title */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            display: { xs: 'flex', md: 'none' },
            justifyContent: 'center',
            fontWeight: 700,
            color: 'white',
          }}
        >
          LCC BIÑAN
        </Typography>

        <Box sx={{ flexGrow: 0 }}>
          <IconButton onClick={handleMenu} sx={{ p: 0 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'secondary.main',
                color: 'primary.main',
                fontWeight: 'bold'
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            sx={{ 
              mt: '45px',
              '& .MuiPaper-root': {
                backgroundColor: 'white',
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
              }
            }}
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem>
              <Typography textAlign="center" sx={{ color: 'text.primary', fontWeight: 500 }}>
                {user.name}
              </Typography>
            </MenuItem>
            <MenuItem>
              <Typography textAlign="center" sx={{ color: 'text.secondary' }}>
                {user.email}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography sx={{ color: 'primary.main' }}>Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 