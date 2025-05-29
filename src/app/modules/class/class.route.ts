import express from 'express';
import { ClassControllers } from './class.controller';

const router = express.Router();
router.post('/create-class', ClassControllers.createClass);
router.get('/', ClassControllers.getAllClasses);
router.get('/:id', ClassControllers.getSingleClass);
router.patch('/:id', ClassControllers.updateClass);
router.patch('/:id/delete', ClassControllers.deleteClass);

export const ClassRoutes = router;
