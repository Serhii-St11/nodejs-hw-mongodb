import Contact from '../models/contactModel.js';

export const getAllContacts = async () => Contact.find();

export const getContactById = async (id) => Contact.findById(id);

export const createContact = async (data) => Contact.create(data);

export const updateContactById = async (id, data) =>
  Contact.findByIdAndUpdate(id, data, { new: true });

export const deleteContactById = async (id) => Contact.findByIdAndDelete(id);
