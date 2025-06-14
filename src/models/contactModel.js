import { Schema, model } from 'mongoose';

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    isFavourite: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },

    photo: {
      type: String,
      default: null,
    },
  },
  { versionKey: false, timestamps: true },
);

const Contact = model('contact', contactSchema);
export default Contact;
