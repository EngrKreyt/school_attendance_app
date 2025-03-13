import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { getApiUrl } from '../config/api';

interface Student {
  _id: string;
  name: string;
  email: string;
}

interface Class {
  _id: string;
  name: string;
  description?: string;
  teacher: {
    _id: string;
    name: string;
    email: string;
  };
  students: Student[];
}

const ClassManagement: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDescription, setNewClassDescription] = useState('');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/classes'));
      setClasses(response.data);
    } catch (error: any) {
      console.error('Error fetching classes:', error);
      alert(error.response?.data?.message || 'Failed to fetch classes. Please try again.');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/auth/students'));
      setStudents(response.data);
      setAvailableStudents(response.data);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      alert(error.response?.data?.message || 'Failed to fetch students. Please try again.');
    }
  };

  const handleCreateClass = async () => {
    try {
      if (!newClassName.trim()) {
        alert('Please enter a class name');
        return;
      }

      setOpenCreateDialog(false); // Close dialog before API call to prevent double submission
      
      const response = await axios.post(getApiUrl('/api/classes'), {
        name: newClassName.trim(),
        description: newClassDescription.trim(),
      });

      if (response.data) {
        setClasses(prevClasses => [...prevClasses, response.data]);
        setNewClassName('');
        setNewClassDescription('');
      }
    } catch (error: any) {
      console.error('Error creating class:', error);
      alert(error.response?.data?.message || 'Failed to create class. Please try again.');
      setOpenCreateDialog(true); // Reopen dialog if there's an error
    }
  };

  const handleAddStudent = async (classId: string, studentId: string) => {
    try {
      await axios.post(getApiUrl(`/api/classes/${classId}/students`), {
        studentIds: [studentId],
      });
      fetchClasses();
    } catch (error: any) {
      console.error('Error adding student:', error);
      alert(error.response?.data?.message || 'Failed to add student. Please try again.');
    }
  };

  const handleRemoveStudent = async (classId: string, studentId: string) => {
    try {
      await axios.delete(getApiUrl(`/api/classes/${classId}/students/${studentId}`));
      fetchClasses();
    } catch (error: any) {
      console.error('Error removing student:', error);
      alert(error.response?.data?.message || 'Failed to remove student. Please try again.');
    }
  };

  const handleEditClass = (classToEdit: Class) => {
    setEditingClass(classToEdit);
    setNewClassName(classToEdit.name);
    setNewClassDescription(classToEdit.description || '');
    setOpenCreateDialog(true);
  };

  const handleUpdateClass = async () => {
    try {
      if (!newClassName.trim()) {
        alert('Please enter a class name');
        return;
      }

      setOpenCreateDialog(false); // Close dialog before API call

      await axios.put(getApiUrl(`/api/classes/${editingClass?._id}`), {
        name: newClassName.trim(),
        description: newClassDescription.trim(),
      });
      
      setNewClassName('');
      setNewClassDescription('');
      setEditingClass(null);
      fetchClasses();
    } catch (error: any) {
      console.error('Error updating class:', error);
      alert(error.response?.data?.message || 'Failed to update class. Please try again.');
      setOpenCreateDialog(true); // Reopen dialog if there's an error
    }
  };

  const handleStudentSelection = (event: SelectChangeEvent<string[]>) => {
    const selectedIds = event.target.value as string[];
    setSelectedStudents(selectedIds);
  };

  const handleAddStudents = async () => {
    try {
      await axios.post(getApiUrl(`/api/classes/${selectedClass?._id}/students`), {
        studentIds: selectedStudents,
      });
      setSelectedStudents([]);
      setOpenDialog(false);
      fetchClasses();
    } catch (error: any) {
      console.error('Error adding students:', error);
      alert(error.response?.data?.message || 'Failed to add students. Please try again.');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudents([]);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setNewClassName('');
    setNewClassDescription('');
    setEditingClass(null);
  };

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        mt: { xs: 1, sm: 2, md: 4 }, 
        mb: { xs: 1, sm: 2, md: 4 },
        px: { xs: 1, sm: 2, md: 3 }
      }}
    >
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: { xs: 1.5, sm: 2, md: 3 },
              borderRadius: { xs: 1, sm: 2 },
              boxShadow: { xs: 1, sm: 2 }
            }}
          >
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                mb: { xs: 2, sm: 3 }
              }}
            >
              Class Management
            </Typography>

            {user?.role === 'teacher' && (
              <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                <Button
                  variant="contained"
                  onClick={() => setOpenCreateDialog(true)}
                  startIcon={<PersonAddIcon />}
                  sx={{
                    mb: { xs: 1, sm: 2 },
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  Create New Class
                </Button>
              </Box>
            )}

            <List sx={{ 
              width: '100%',
              '& .MuiPaper-root': {
                p: { xs: 1.5, sm: 2 },
                borderRadius: { xs: 1, sm: 2 }
              }
            }}>
              {classes.map((cls) => (
                <Paper key={cls._id} sx={{ mb: 2 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { sm: 'center' },
                    justifyContent: 'space-between',
                    mb: 2
                  }}>
                    <Typography 
                      variant="h6"
                      sx={{
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        mb: { xs: 1, sm: 0 }
                      }}
                    >
                      {cls.name}
                    </Typography>
                    {user?.role === 'teacher' && (
                      <Button
                        startIcon={<EditIcon />}
                        size="small"
                        onClick={() => handleEditClass(cls)}
                        sx={{
                          alignSelf: { xs: 'flex-start', sm: 'center' }
                        }}
                      >
                        Edit Class
                      </Button>
                    )}
                  </Box>
                  
                  {cls.description && (
                    <Typography 
                      color="textSecondary" 
                      sx={{ 
                        mb: 2,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }}
                    >
                      {cls.description}
                    </Typography>
                  )}

                  <Box sx={{ mb: 2 }}>
                    <Typography 
                      variant="subtitle2" 
                      gutterBottom
                      sx={{
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        mb: 1
                      }}
                    >
                      Students:
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: { xs: 0.5, sm: 1 },
                      '& .MuiChip-root': {
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }
                    }}>
                      {cls.students.map((student) => (
                        <Chip
                          key={student._id}
                          label={student.name}
                          onDelete={
                            user?.role === 'teacher'
                              ? () => handleRemoveStudent(cls._id, student._id)
                              : undefined
                          }
                          size="small"
                        />
                      ))}
                      {user?.role === 'teacher' && (
                        <IconButton
                          onClick={() => {
                            setSelectedClass(cls);
                            setOpenDialog(true);
                          }}
                          size="small"
                          sx={{
                            width: { xs: 28, sm: 32 },
                            height: { xs: 28, sm: 32 }
                          }}
                        >
                          <PersonAddIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </Paper>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            m: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: 'auto' },
            borderRadius: { xs: 1, sm: 2 }
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
          pt: { xs: 2, sm: 3 }
        }}>
          Add Students
        </DialogTitle>
        <DialogContent sx={{ 
          pt: { xs: 1, sm: 2 },
          px: { xs: 2, sm: 3 }
        }}>
          <TextField
            select
            label="Select Students"
            value={selectedStudents}
            onChange={(event: SelectChangeEvent<string[]>) => handleStudentSelection(event)}
            fullWidth
            SelectProps={{
              multiple: true,
              renderValue: (selected: any) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((studentId: string) => {
                    const student = availableStudents.find(s => s._id === studentId);
                    return student ? (
                      <Chip 
                        key={student._id} 
                        label={student.name} 
                        size="small"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      />
                    ) : null;
                  })}
                </Box>
              )
            }}
            size="small"
            sx={{ mt: 1 }}
          >
            {availableStudents.map((student) => (
              <MenuItem 
                key={student._id} 
                value={student._id}
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                {student.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ 
          px: { xs: 2, sm: 3 }, 
          py: { xs: 2, sm: 2.5 }
        }}>
          <Button onClick={handleCloseDialog} size="small">Cancel</Button>
          <Button onClick={handleAddStudents} variant="contained" size="small">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Class Dialog */}
      <Dialog 
        open={openCreateDialog} 
        onClose={handleCloseCreateDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            m: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: 'auto' },
            borderRadius: { xs: 1, sm: 2 }
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
          pt: { xs: 2, sm: 3 }
        }}>
          {editingClass ? 'Edit Class' : 'Create New Class'}
        </DialogTitle>
        <DialogContent sx={{ 
          pt: { xs: 1, sm: 2 },
          px: { xs: 2, sm: 3 }
        }}>
          <TextField
            label="Class Name"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            fullWidth
            size="small"
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label="Description (Optional)"
            value={newClassDescription}
            onChange={(e) => setNewClassDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ 
          px: { xs: 2, sm: 3 }, 
          py: { xs: 2, sm: 2.5 }
        }}>
          <Button onClick={handleCloseCreateDialog} size="small">Cancel</Button>
          <Button 
            onClick={editingClass ? handleUpdateClass : handleCreateClass} 
            variant="contained" 
            size="small"
          >
            {editingClass ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClassManagement; 