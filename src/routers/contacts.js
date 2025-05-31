import express from 'express';
import {
  handleGetAllContacts,
  handleGetContactById,
  handleCreateContact,
  handleUpdateContact,
  handleDeleteContact,
} from '../controllers/contacts.js';
import { validateBody, validateId } from '../middlewares/validation.js';
import {
  createContactSchema,
  updateContactSchema,
} from '../schemas/contactSchemas.js';
import { authenticate } from '../middlewares/authenticate.js';

const contactsRouter = express.Router();

contactsRouter.use(authenticate);

contactsRouter.get('/', handleGetAllContacts);

contactsRouter.get('/:contactId', validateId, handleGetContactById);

contactsRouter.post('/', validateBody(createContactSchema), handleCreateContact);

contactsRouter.patch(
  '/:contactId',
  validateId,
  validateBody(updateContactSchema),
  handleUpdateContact,
);

contactsRouter.delete('/:contactId', validateId, handleDeleteContact);

export default contactsRouter;
