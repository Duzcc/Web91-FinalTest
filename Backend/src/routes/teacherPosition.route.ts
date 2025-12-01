import express from 'express';
import { getTeacherPositions, createTeacherPosition } from '../controllers/teacherPosition.controller';

const router = express.Router();

router.get('/', getTeacherPositions);

router.post('/', createTeacherPosition);

export default router;