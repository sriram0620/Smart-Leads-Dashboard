import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  _id: mongoose.Types.ObjectId;
  leadId: mongoose.Types.ObjectId;
  type: 'created' | 'email_sent' | 'call_made' | 'note_added' | 'status_changed';
  description: string;
  performedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ActivitySchema: Schema = new Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: [true, 'Lead ID is required'],
    index: true,
  },
  type: {
    type: String,
    enum: ['created', 'email_sent', 'call_made', 'note_added', 'status_changed'],
    required: [true, 'Activity type is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ActivitySchema.index({ leadId: 1, createdAt: -1 });

export default mongoose.model<IActivity>('Activity', ActivitySchema);
