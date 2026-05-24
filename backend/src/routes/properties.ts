import { Router } from 'express';
import { getProperties, getPropertyById, createEnquiry } from '../controllers/properties';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getProperties);
router.get('/:id', getPropertyById);
router.post('/enquiry', authenticate, createEnquiry);

export default router;
