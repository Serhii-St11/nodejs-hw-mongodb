import Contact from '../models/contactModel.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';

export const getAllContacts = async (
  userId,
  {
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    type,
    isFavourite,
  },
) => {
  const filter = { userId };
  if (type) filter.contactType = type;
  if (typeof isFavourite !== 'undefined') filter.isFavourite = isFavourite;

  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
  const skip = (page - 1) * perPage;

  const [data, totalItems] = await Promise.all([
    Contact.find(filter).sort(sort).skip(skip).limit(perPage),
    Contact.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalItems / perPage);

  return {
    data,
    page: Number(page),
    perPage: Number(perPage),
    totalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
};

export const getContactById = async (id, userId) => {
  return Contact.findOne({ _id: id, userId });
};

export const createContact = async (data, userId, file) => {
  let photoURL = null;

  if (file) {
    const uploadResult = await cloudinary.uploader.upload(file.path);
    photoURL = uploadResult.secure_url;
    await fs.unlink(file.path);
  }

  return Contact.create({ ...data, photoURL, userId });
};

export const updateContactById = async (id, data, userId, file) => {
  let photoURL = data.photoURL;

  if (file) {
    const uploadResult = await cloudinary.uploader.upload(file.path);
    photoURL = uploadResult.secure_url;
    await fs.unlink(file.path);
  }

  return Contact.findOneAndUpdate(
    { _id: id, userId },
    { ...data, photoURL },
    { new: true },
  );
};

export const deleteContactById = async (id, userId) => {
  return Contact.findOneAndDelete({ _id: id, userId });
};
