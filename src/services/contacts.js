import Contact from '../models/contactModel.js';

export const getAllContacts = async () => {
  try {
    const contacts = await Contact.find({});
    return contacts;
  } catch (err) {
    console.error('Error retrieving contact', err);
  }
};

export const getContactById = async (id) => {
  try {
    const contact = await Contact.findById(id);
    return contact;
  } catch (err) {
    console.error('Error retrieving contact', err);
  }
};



