// src/infrastructure/controllers/userRoutes.ts
import express from 'express';
import { UserService } from '../../application/services/UserService';
import { UserController } from '../adapter/input/controllers/UserController';
import { UserRepository } from '../repositories/UserRepository';

const router = express.Router();
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.post('/users', (req, res) => userController.createUser(req, res));
router.get('/users/:id', (req, res) => userController.getUserById(req, res));
router.get('/users', (req, res) => userController.getAllUsers(req, res));

export default router;
