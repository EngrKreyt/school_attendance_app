import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  TextField,
  MenuItem,
  Grid,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';

interface Student {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Class {
  _id: string;
  name: string;
  teacher: {
    _id: string;
    name: string;
    email: string;
  };
  students: {
    _id: string;
    name: string;
    email: string;
  }[];
}

interface AttendanceRecord {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
  class: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [noClassesMessage, setNoClassesMessage] = useState<string>('');

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchAttendanceRecords();
    }
  }, [selectedDate, selectedClass]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/auth/students'));
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/classes'));
      setClasses(response.data);
      
      if (response.data.length === 0) {
        if (user?.role === 'student') {
          setNoClassesMessage('You are not assigned to any classes yet. Please contact your teacher.');
        } else if (user?.role === 'teacher') {
          setNoClassesMessage('You have not created any classes yet. Please create a class to get started.');
        } else {
          setNoClassesMessage('No classes available.');
        }
      } else {
        setSelectedClass(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const params = {
        ...(selectedDate && {
          startDate: new Date(selectedDate.setHours(0, 0, 0, 0)).toISOString(),
          endDate: new Date(selectedDate.setHours(23, 59, 59, 999)).toISOString(),
        }),
        ...(selectedClass && { class: selectedClass }),
      };

      const response = await axios.get(getApiUrl('/api/attendance'), { params });
      setAttendanceRecords(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (studentId: string, status: 'present' | 'absent' | 'late') => {
    try {
      setLoading(true);
      const response = await axios.post(getApiUrl('/api/attendance'), {
        student: studentId,
        class: selectedClass,
        status,
        date: selectedDate?.toISOString(),
      });

      // Update the attendance records state immediately
      setAttendanceRecords(prevRecords => {
        const newRecords = [...prevRecords];
        const existingIndex = newRecords.findIndex(
          record => record.student._id === studentId
        );
        
        if (existingIndex !== -1) {
          // Update existing record
          newRecords[existingIndex] = response.data;
        } else {
          // Add new record
          newRecords.push(response.data);
        }
        
        return newRecords;
      });
    } catch (error) {
      console.error('Error marking attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStudentAttendance = (studentId: string) => {
    return attendanceRecords.find(
      record => record.student._id === studentId
    );
  };

  const getClassName = (classId: string) => {
    const foundClass = classes.find(c => c._id === classId);
    return foundClass ? foundClass.name : '';
  };

  const getAssignedStudents = () => {
    const selectedClassData = classes.find(c => c._id === selectedClass);
    if (!selectedClassData) return [];
    return selectedClassData.students;
  };

  const assignedStudents = getAssignedStudents();

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        mt: { xs: 1, sm: 2, md: 4 }, 
        mb: { xs: 1, sm: 2, md: 4 },
        px: { xs: 1, sm: 2, md: 3 } // Add padding for smaller screens
      }}
    >
      <Grid container spacing={{ xs: 1, sm: 2 }}>
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: { xs: 1, sm: 2, md: 3 }, 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: { xs: 1, sm: 2 },
              boxShadow: { xs: 1, sm: 2 }
            }}
          >
            <Typography 
              component="h1" 
              variant="h4" 
              gutterBottom
              sx={{
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                mb: { xs: 1, sm: 2 }
              }}
            >
              Attendance Dashboard
            </Typography>
            
            {classes.length === 0 ? (
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 2,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                {noClassesMessage}
              </Alert>
            ) : (
              <>
                <Box sx={{ 
                  mb: { xs: 2, sm: 3 }, 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' }, 
                  gap: { xs: 1, sm: 2 },
                  '& > *': { 
                    width: { xs: '100%', sm: '50%', md: 'auto' },
                    minWidth: { sm: 200 }
                  }
                }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Select Date"
                      value={selectedDate}
                      onChange={(newValue) => setSelectedDate(newValue)}
                      slotProps={{
                        textField: {
                          size: "small",
                          fullWidth: true
                        }
                      }}
                    />
                  </LocalizationProvider>
                  <TextField
                    select
                    label="Select Class"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    size="small"
                    fullWidth
                  >
                    {classes.map((classItem) => (
                      <MenuItem key={classItem._id} value={classItem._id}>
                        {classItem.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
                {assignedStudents.length === 0 && (
                  <Alert 
                    severity="info" 
                    sx={{ 
                      mb: 2,
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    No students are assigned to this class yet. Please assign students in the Class Management page.
                  </Alert>
                )}
                <TableContainer sx={{ 
                  overflowX: 'auto',
                  '& .MuiTable-root': {
                    minWidth: { xs: 'auto', sm: 650 }
                  },
                  '& .MuiTableCell-root': {
                    px: { xs: 1, sm: 2 },
                    py: { xs: 1, sm: 1.5 },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }
                }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Student Name</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Email</TableCell>
                        <TableCell>Class</TableCell>
                        <TableCell>Status</TableCell>
                        {user?.role === 'teacher' && <TableCell>Actions</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {assignedStudents.map((student) => {
                        const attendance = getStudentAttendance(student._id);
                        return (
                          <TableRow key={student._id}>
                            <TableCell>{student.name}</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{student.email}</TableCell>
                            <TableCell>{getClassName(selectedClass)}</TableCell>
                            <TableCell>
                              <Box sx={{
                                display: 'inline-block',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                bgcolor: attendance?.status === 'present' ? 'success.light' :
                                        attendance?.status === 'absent' ? 'error.light' :
                                        attendance?.status === 'late' ? 'warning.light' : 'grey.100',
                                color: attendance?.status === 'present' ? 'success.dark' :
                                      attendance?.status === 'absent' ? 'error.dark' :
                                      attendance?.status === 'late' ? 'warning.dark' : 'text.secondary'
                              }}>
                                {attendance?.status || 'Not marked'}
                              </Box>
                            </TableCell>
                            {user?.role === 'teacher' && (
                              <TableCell>
                                <Box sx={{ 
                                  display: 'flex', 
                                  gap: { xs: 0.5, sm: 1 },
                                  flexDirection: { xs: 'column', sm: 'row' },
                                  '& .MuiButton-root': {
                                    minWidth: { xs: '72px', sm: 'auto' },
                                    px: { xs: 1, sm: 2 },
                                    py: { xs: 0.5, sm: 1 },
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                  }
                                }}>
                                  <Button
                                    size="small"
                                    variant={attendance?.status === 'present' ? "contained" : "outlined"}
                                    color="primary"
                                    onClick={() => handleMarkAttendance(student._id, 'present')}
                                  >
                                    Present
                                  </Button>
                                  <Button
                                    size="small"
                                    variant={attendance?.status === 'absent' ? "contained" : "outlined"}
                                    color="error"
                                    onClick={() => handleMarkAttendance(student._id, 'absent')}
                                  >
                                    Absent
                                  </Button>
                                  <Button
                                    size="small"
                                    variant={attendance?.status === 'late' ? "contained" : "outlined"}
                                    color="warning"
                                    onClick={() => handleMarkAttendance(student._id, 'late')}
                                  >
                                    Late
                                  </Button>
                                </Box>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 