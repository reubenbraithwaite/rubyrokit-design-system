// /backend/src/routes/design.routes.ts
import { Router } from 'express';
import DesignController from '../controllers/design.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All design routes require authentication
router.use(authenticate);

// Design CRUD operations
router.post(
  '/', 
  DesignController.createDesignValidation, 
  DesignController.createDesign
);

router.get(
  '/me', 
  DesignController.getDesignsValidation, 
  DesignController.getUserDesigns
);

router.get(
  '/public', 
  DesignController.getDesignsValidation, 
  DesignController.getPublicDesigns
);

router.get(
  '/:id', 
  DesignController.getDesignById
);

router.put(
  '/:id', 
  DesignController.updateDesignValidation, 
  DesignController.updateDesign
);

router.delete(
  '/:id', 
  DesignController.deleteDesign
);

// Additional operations
router.post(
  '/:id/clone', 
  DesignController.cloneDesign
);

router.patch(
  '/:id/toggle-public', 
  DesignController.togglePublicStatus
);

export default router;
