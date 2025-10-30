import { Router } from 'express';
import { LayoutRepository } from '../repositories/LayoutRepository';

import { LayoutController } from '../adapter/input/controllers/LayoutController';
import { LayoutService } from '../../application/services/LayoutService';

const router = Router();

const layoutRepository = new LayoutRepository();
const layoutService = new LayoutService(layoutRepository);
const layoutController = new LayoutController(layoutService);

router.get('/dashboard/:dashboardId/layout', (req, res) => { layoutController.getLayout(req, res); });
router.put('/dashboard/:dashboardId/layout', (req, res) => layoutController.updateLayout(req, res));

export default router;
