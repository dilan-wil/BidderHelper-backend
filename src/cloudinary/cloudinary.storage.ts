import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.config';

export const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: 'resumes',
    resource_type: 'raw',
  }),
});
