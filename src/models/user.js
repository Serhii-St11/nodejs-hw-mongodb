import { Schema, model} from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/],
    },
    password: {
      type: String,
      required: true,
    },
    subscription: { type: String, default: 'free' },
  },
  {
    timestamps: true,
  },
);

const User = model('User', userSchema);
export default User;
