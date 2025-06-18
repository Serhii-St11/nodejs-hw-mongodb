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
import upload from '../middlewares/upload.js';

const contactsRouter = express.Router();

contactsRouter.use(authenticate);

contactsRouter.get('/', handleGetAllContacts);

contactsRouter.get('/:contactId', validateId, handleGetContactById);

contactsRouter.post(
  '/',
  upload.single('photo'),
  validateBody(createContactSchema),
  handleCreateContact,
);

contactsRouter.patch(
  '/:contactId',
  upload.single('photo'),
  validateId,
  validateBody(updateContactSchema),
  handleUpdateContact,
);

contactsRouter.delete('/:contactId', validateId, handleDeleteContact);

export default contactsRouter;








