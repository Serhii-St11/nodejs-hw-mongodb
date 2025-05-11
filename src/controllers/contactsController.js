import { getAllContacts, getContactById } from '../services/contacts.js';

export const handleGetAllContacts = async (req, res) => {
  try {
    const contacts = await getAllContacts();
    res.json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
  } catch {
    res.status(500).json({ status: 500, message: 'Error fetching contacts' });
  }
};

export const handleGetContactById = async (req, res) => {
  const { contactId } = req.params;
  try {
    const contact = await getContactById(contactId);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  } catch {
    res.status(404).json({ message: 'Contact not found' });
  }
};
