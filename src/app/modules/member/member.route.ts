// src/modules/members/member.route.ts
import express from 'express';
import { MemberControllers } from './member.controller';

const router = express.Router();

router.post('/', MemberControllers.createMember);
router.get('/', MemberControllers.getAllMembers);
router.get('/:id', MemberControllers.getSingleMember);
router.patch('/:id', MemberControllers.updateMember);
router.delete('/:id', MemberControllers.deleteMember);

export const MemberRoutes = router;
