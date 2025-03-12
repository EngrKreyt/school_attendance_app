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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

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

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleCreateClass = async () => {
    try {
      await axios.post('http://localhost:5000/api/classes', {
        name: newClassName,
        description: newClassDescription,
      });
      setNewClassName('');
      setNewClassDescription('');
      fetchClasses();
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };

  const handleAddStudent = async (classId: string, studentId: string) => {
    try {
      await axios.post(`http://localhost:5000/api/classes/${classId}/students`, {
        studentIds: [studentId],
      });
      fetchClasses();
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  const handleRemoveStudent = async (classId: string, studentId: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/classes/${classId}/students/${studentId}`);
      fetchClasses();
    } catch (error) {
      console.error('Error removing student:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>
              Class Management
            </Typography>
            {user?.role === 'teacher' && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Create New Class
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <TextField
                    label="Class Name"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    sx={{ minWidth: 200 }}
                  />
                  <TextField
                    label="Description"
                    value={newClassDescription}
                    onChange={(e) => setNewClassDescription(e.target.value)}
                    multiline
                    rows={2}
                    sx={{ minWidth: 300 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleCreateClass}
                    disabled={!newClassName}
                  >
                    Create Class
                  </Button>
                </Box>
              </Box>
            )}

            <Typography variant="h6" gutterBottom>
              Your Classes
            </Typography>
            <List>
              {classes.map((cls) => (
                <Paper key={cls._id} sx={{ mb: 2, p: 2 }}>
                  <Typography variant="h6">{cls.name}</Typography>
                  {cls.description && (
                    <Typography color="textSecondary" sx={{ mb: 2 }}>
                      {cls.description}
                    </Typography>
                  )}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Students:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {cls.students.map((student) => (
                        <Chip
                          key={student._id}
                          label={student.name}
                          onDelete={
                            user?.role === 'teacher'
                              ? () => handleRemoveStudent(cls._id, student._id)
                              : undefined
                          }
                        />
                      ))}
                      {user?.role === 'teacher' && (
                        <IconButton
                          onClick={() => {
                            setSelectedClass(cls);
                            setOpenDialog(true);
                          }}
                          size="small"
                        >
                          <PersonAddIcon />
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

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add Students to {selectedClass?.name}</DialogTitle>
        <DialogContent>
          <List>
            {students
              .filter(
                (student) =>
                  !selectedClass?.students.find((s) => s._id === student._id)
              )
              .map((student) => (
                <ListItem key={student._id}>
                  <ListItemText
                    primary={student.name}
                    secondary={student.email}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => {
                        if (selectedClass) {
                          handleAddStudent(selectedClass._id, student._id);
                          setOpenDialog(false);
                        }
                      }}
                    >
                      <PersonAddIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClassManagement; 