import {
  getAllContacts,
  getContactById,
  createContact,
  updateContactById,
  deleteContactById,
} from '../services/contacts.js';
import createError from 'http-errors';

export const handleGetAllContacts = async (req, res) => {
  const contacts = await getAllContacts();
  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const handleGetContactById = async (req, res) => {
  const { contactId } = req.params;
  const contact = await getContactById(contactId);
  if (!contact) throw createError(404, 'Contact not found');
  res.json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const handleCreateContact = async (req, res) => {
  const contact = await createContact(req.body);
  res
    .status(201)
    .json({
      status: 201,
      message: 'Successfully created a contact!',
      data: contact,
    });
};

export const handleUpdateContact = async (req, res) => {
  const { contactId } = req.params;
  const contact = await updateContactById(contactId, req.body);
  if (!contact) throw createError(404, 'Contact not found');
  res.json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: contact,
  });
};

export const handleDeleteContact = async (req, res) => {
  const { contactId } = req.params;
  const contact = await deleteContactById(contactId);
  if (!contact) throw createError(404, 'Contact not found');
  res.status(204).send();
};
