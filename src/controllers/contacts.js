import fs from 'fs';
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContactById,
  deleteContactById,
} from '../services/contacts.js';
import createError from 'http-errors';

import { v2 as cloudinary } from 'cloudinary';
import { uploadToCloudinary } from '../helpers/cloudinary.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const handleGetAllContacts = async (req, res) => {
  const paginationData = await getAllContacts(req.user._id, req.query);
  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: paginationData,
  });
};

export const handleGetContactById = async (req, res) => {
  const { contactId } = req.params;
  const contact = await getContactById(contactId, req.user._id);
  if (!contact) throw createError(404, 'Contact not found');
  res.json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const handleCreateContact = async (req, res, next) => {
  try {
    let photoUrl = null;

    if (req.file) {
      const filePath = req.file.path;
      photoUrl = await uploadToCloudinary(filePath);
      await fs.promises.unlink(filePath);
    }

    const contact = await createContact(
      { ...req.body, photo: photoUrl },
      req.user._id,
    );

    res.status(201).json({
      status: 201,
      message: 'Successfully created a contact!',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const handleUpdateContact = async (req, res) => {
  const { contactId } = req.params;
  const contact = await updateContactById(contactId, req.body, req.user._id);
  if (!contact) throw createError(404, 'Contact not found');
  res.json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: contact,
  });
};

export const handleDeleteContact = async (req, res) => {
  const { contactId } = req.params;
  const contact = await deleteContactById(contactId, req.user._id);
  if (!contact) throw createError(404, 'Contact not found');
  res.status(204).json({ message: 'Contact successfully deleted' });
};
