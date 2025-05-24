import Contact from '../models/contactModel.js';

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortBy = 'name',
  sortOrder = 'asc',
  type,
  isFavourite,
}) => {
  const filter = {};
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


export const getContactById = async (id) => Contact.findById(id);

export const createContact = async (data) => Contact.create(data);

export const updateContactById = async (id, data) =>
  Contact.findByIdAndUpdate(id, data, { new: true });

export const deleteContactById = async (id) => Contact.findByIdAndDelete(id);
