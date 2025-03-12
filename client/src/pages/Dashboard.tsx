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
      if (response.data.length > 0) {
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
      await axios.post(getApiUrl('/api/attendance'), {
        student: studentId,
        class: selectedClass,
        status,
        date: selectedDate?.toISOString(),
      });
      fetchAttendanceRecords();
    } catch (error) {
      console.error('Error marking attendance:', error);
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
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 } }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 1, sm: 2 }, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h1" variant="h4" gutterBottom>
              Attendance Dashboard
            </Typography>
            <Box sx={{ 
              mb: 3, 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              gap: 2,
              '& > *': { width: { xs: '100%', sm: 'auto' } }
            }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Select Date"
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  sx={{ minWidth: { sm: 200 } }}
                />
              </LocalizationProvider>
              <TextField
                select
                label="Select Class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                sx={{ minWidth: { sm: 200 } }}
              >
                {classes.map((classItem) => (
                  <MenuItem key={classItem._id} value={classItem._id}>
                    {classItem.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            {assignedStudents.length === 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                No students are assigned to this class yet. Please assign students in the Class Management page.
              </Alert>
            )}
            <TableContainer sx={{ 
              overflowX: 'auto',
              '& .MuiTable-root': {
                minWidth: { xs: 'auto', sm: 650 }
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
                        <TableCell>{attendance?.status || 'Not marked'}</TableCell>
                        {user?.role === 'teacher' && (
                          <TableCell>
                            <Box sx={{ 
                              display: 'flex', 
                              gap: 1,
                              flexDirection: { xs: 'column', sm: 'row' },
                              '& .MuiButton-root': {
                                padding: { xs: '4px 8px', sm: '6px 16px' },
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                              }
                            }}>
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => handleMarkAttendance(student._id, 'present')}
                              >
                                Present
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                color="error"
                                onClick={() => handleMarkAttendance(student._id, 'absent')}
                              >
                                Absent
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
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
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 