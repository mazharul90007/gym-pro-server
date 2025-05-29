import express from 'express';
import { MemberControllers } from './member.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from './member.interface';

const router = express.Router();

// Only Admin can create a new member (trainer/trainee)
router.post('/', auth(USER_ROLE.ADMIN), MemberControllers.createMember);

// Admin can get all members
router.get('/', auth(USER_ROLE.ADMIN), MemberControllers.getAllMembers);

// Admin can get a single member
router.get('/:id', auth(USER_ROLE.ADMIN), MemberControllers.getSingleMember);

// Admin can update a member
router.patch('/:id', auth(USER_ROLE.ADMIN), MemberControllers.updateMember);

// Admin can soft delete a member
router.delete('/:id', auth(USER_ROLE.ADMIN), MemberControllers.deleteMember);

export const MemberRoutes = router;
