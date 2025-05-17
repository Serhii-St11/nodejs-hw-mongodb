import express from 'express';
import {
  handleGetAllContacts,
  handleGetContactById,
  handleCreateContact,
  handleUpdateContact,
  handleDeleteContact,
} from '../controllers/contacts.js';
import ctrlWrapper from '../utils/ctrlWrapper.js';

const router = express.Router();

router.get('/', ctrlWrapper(handleGetAllContacts));
router.get('/:contactId', ctrlWrapper(handleGetContactById));
router.post('/', ctrlWrapper(handleCreateContact));
router.patch('/:contactId', ctrlWrapper(handleUpdateContact));
router.delete('/:contactId', ctrlWrapper(handleDeleteContact));

export default router;
