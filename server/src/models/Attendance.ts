import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  student: mongoose.Types.ObjectId;
  class: string;
  date: Date;
  status: 'present' | 'absent' | 'late';
  markedBy: mongoose.Types.ObjectId;
  notes?: string;
}

const attendanceSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  class: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    required: true
  },
  markedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
attendanceSchema.index({ student: 1, date: 1 });

export default mongoose.model<IAttendance>('Attendance', attendanceSchema); 