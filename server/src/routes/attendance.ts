import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Attendance from '../models/Attendance';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// Mark attendance (Teachers only)
router.post('/',
  authenticateToken,
  authorizeRoles(['teacher', 'admin']),
  [
    body('student').notEmpty().withMessage('Student ID is required'),
    body('class').notEmpty().withMessage('Class is required'),
    body('status').isIn(['present', 'absent', 'late']).withMessage('Invalid status'),
    body('date').optional().isISO8601().toDate()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { student, class: className, status, date } = req.body;
      
      // Check for existing attendance record for the same student, class and date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const existingAttendance = await Attendance.findOne({
        student,
        class: className,
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      });

      let attendance;
      if (existingAttendance) {
        // Update existing record
        const updatedAttendance = await Attendance.findByIdAndUpdate(
          existingAttendance._id,
          { 
            status,
            markedBy: req.user.userId,
            updatedAt: new Date()
          },
          { new: true }
        );
        if (!updatedAttendance) {
          return res.status(404).json({ message: 'Failed to update attendance record' });
        }
        attendance = updatedAttendance;
      } else {
        // Create new record
        const newAttendance = new Attendance({
          student,
          class: className,
          status,
          date,
          markedBy: req.user.userId
        });
        attendance = await newAttendance.save();
      }

      // Populate the response
      const populatedAttendance = await Attendance.findById(attendance._id)
        .populate('student', 'name email')
        .populate('markedBy', 'name');

      if (!populatedAttendance) {
        return res.status(404).json({ message: 'Failed to retrieve attendance record' });
      }

      res.status(201).json(populatedAttendance);
    } catch (error) {
      console.error('Attendance marking error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get attendance records (filtered by date range, class, or student)
router.get('/',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, class: className, student } = req.query;
      const query: any = {};

      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        };
      }

      if (className) {
        query.class = className;
      }

      if (student) {
        query.student = student;
      }

      // If student is requesting, only show their records
      if (req.user.role === 'student') {
        query.student = req.user.userId;
      }

      const attendance = await Attendance.find(query)
        .populate('student', 'name email')
        .populate('markedBy', 'name')
        .sort({ date: -1 });

      res.json(attendance);
    } catch (error) {
      console.error('Attendance fetch error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update attendance record (Teachers only)
router.put('/:id',
  authenticateToken,
  authorizeRoles(['teacher', 'admin']),
  [
    body('status').isIn(['present', 'absent', 'late']).withMessage('Invalid status'),
    body('notes').optional().trim()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const attendance = await Attendance.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );

      if (!attendance) {
        return res.status(404).json({ message: 'Attendance record not found' });
      }

      res.json(attendance);
    } catch (error) {
      console.error('Attendance update error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router; 