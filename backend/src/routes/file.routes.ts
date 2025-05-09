// /backend/src/routes/file.routes.ts
import { Router } from 'express';
import FileController from '../controllers/file.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All file routes require authentication
router.use(authenticate);

// Generate and download templates
router.get(
  '/template/:id', 
  FileController.generateTemplateValidation, 
  FileController.generateTemplate
);

router.post(
  '/template/:id/save', 
  FileController.generateTemplateValidation, 
  FileController.saveTemplate
);

router.get(
  '/download/:filepath(*)', 
  FileController.downloadTemplate
);

export default router;
