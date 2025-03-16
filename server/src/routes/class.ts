import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Class from '../models/Class';
import Attendance from '../models/Attendance';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// Create a class (Teachers only)
router.post('/',
  authenticateToken,
  authorizeRoles(['teacher', 'admin']),
  [
    body('name').trim().notEmpty().withMessage('Class name is required'),
    body('description').optional().trim()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const newClass = new Class({
        ...req.body,
        teacher: req.user.userId
      });

      await newClass.save();
      res.status(201).json(newClass);
    } catch (error) {
      console.error('Class creation error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get all classes (filtered by teacher if teacher role, or by student assignments if student role)
router.get('/',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      let query = {};
      
      if (req.user.role === 'teacher') {
        // Teachers only see classes they teach
        query = { teacher: req.user.userId };
      } else if (req.user.role === 'student') {
        // Students only see classes they are assigned to
        query = { students: req.user.userId };
      }
      // Admins see all classes (empty query)
      
      const classes = await Class.find(query)
        .populate('teacher', 'name email')
        .populate('students', 'name email')
        .sort({ createdAt: -1 });
      res.json(classes);
    } catch (error) {
      console.error('Classes fetch error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Add students to class (Teachers only)
router.post('/:classId/students',
  authenticateToken,
  authorizeRoles(['teacher', 'admin']),
  [
    body('studentIds').isArray().withMessage('Student IDs must be an array')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { classId } = req.params;
      const { studentIds } = req.body;

      const classDoc = await Class.findById(classId);
      if (!classDoc) {
        return res.status(404).json({ message: 'Class not found' });
      }

      // Verify teacher owns the class
      if (classDoc.teacher.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Not authorized to modify this class' });
      }

      // Filter out students who are already in the class
      const existingStudentIds = classDoc.students.map(id => id.toString());
      const newStudentIds = studentIds.filter((id: string) => !existingStudentIds.includes(id.toString()));
      
      if (newStudentIds.length === 0) {
        return res.status(400).json({ message: 'All selected students are already assigned to this class' });
      }

      // Add only new students to class
      classDoc.students = [...classDoc.students, ...newStudentIds];
      await classDoc.save();

      const updatedClass = await Class.findById(classId)
        .populate('teacher', 'name email')
        .populate('students', 'name email');

      res.json(updatedClass);
    } catch (error) {
      console.error('Adding students error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Remove students from class (Teachers only)
router.delete('/:classId/students/:studentId',
  authenticateToken,
  authorizeRoles(['teacher', 'admin']),
  async (req: Request, res: Response) => {
    try {
      const { classId, studentId } = req.params;

      const classDoc = await Class.findById(classId);
      if (!classDoc) {
        return res.status(404).json({ message: 'Class not found' });
      }

      // Verify teacher owns the class
      if (classDoc.teacher.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Not authorized to modify this class' });
      }

      classDoc.students = classDoc.students.filter(id => id.toString() !== studentId);
      await classDoc.save();

      const updatedClass = await Class.findById(classId)
        .populate('teacher', 'name email')
        .populate('students', 'name email');

      res.json(updatedClass);
    } catch (error) {
      console.error('Removing student error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete class (Teachers only)
router.delete('/:classId',
  authenticateToken,
  authorizeRoles(['teacher', 'admin']),
  async (req: Request, res: Response) => {
    try {
      const { classId } = req.params;

      const classDoc = await Class.findById(classId);
      if (!classDoc) {
        return res.status(404).json({ message: 'Class not found' });
      }

      // Verify teacher owns the class
      if (classDoc.teacher.toString() !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete this class' });
      }

      // Delete associated attendance records
      await Attendance.deleteMany({ class: classId });

      // Delete the class
      await Class.findByIdAndDelete(classId);

      res.json({ message: 'Class deleted successfully' });
    } catch (error) {
      console.error('Class deletion error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router; 