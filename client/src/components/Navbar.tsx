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
  Tooltip,
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
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [profileMenuAnchor, setProfileMenuAnchor] = React.useState<null | HTMLElement>(null);

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
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

        {/* Desktop Menu */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          {user.role === 'student' ? (
            <Tooltip title="You will only see classes you are assigned to">
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
                My Classes
              </Button>
            </Tooltip>
          ) : (
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
          )}
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
              Class Management
            </Button>
          )}
        </Box>

        {/* Mobile Menu */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMobileMenuOpen}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={handleMobileMenuClose}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiPaper-root': {
                backgroundColor: 'white',
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
              }
            }}
          >
            <MenuItem onClick={() => { navigate('/dashboard'); handleMobileMenuClose(); }}>
              <DashboardIcon sx={{ mr: 1 }} /> 
              {user.role === 'student' ? 'My Classes' : 'Dashboard'}
              {user.role === 'student' && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 2 }}>
                  (Only shows classes you're assigned to)
                </Typography>
              )}
            </MenuItem>
            {user.role === 'teacher' && (
              <MenuItem onClick={() => { navigate('/classes'); handleMobileMenuClose(); }}>
                <ClassIcon sx={{ mr: 1 }} /> Class Management
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

        {/* Profile Menu */}
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          ml: 'auto'
        }}>
          <IconButton 
            onClick={handleProfileMenuOpen} 
            sx={{ 
              p: 0.5,
              ml: { xs: 1, md: 2 },
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.2)',
              }
            }}
          >
            <Avatar 
              sx={{ 
                width: 32,
                height: 32,
                bgcolor: 'secondary.main',
                color: 'primary.main',
                fontWeight: 'bold',
                fontSize: '0.9rem'
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
                minWidth: '200px'
              }
            }}
            id="profile-menu"
            anchorEl={profileMenuAnchor}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(profileMenuAnchor)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem sx={{ pointerEvents: 'none' }}>
              <Typography textAlign="center" sx={{ color: 'text.primary', fontWeight: 500 }}>
                {user.name}
              </Typography>
            </MenuItem>
            <MenuItem sx={{ pointerEvents: 'none' }}>
              <Typography textAlign="center" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
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