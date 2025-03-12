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

      const attendance = new Attendance({
        ...req.body,
        markedBy: req.user.userId
      });

      await attendance.save();
      res.status(201).json(attendance);
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