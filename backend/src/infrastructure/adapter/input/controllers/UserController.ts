import { UserService } from '../../../../application/services/UserService';
import { Request, Response } from 'express';
import logger from '../../../../utils/logger';

export class UserController {
  constructor(private userService: UserService) { }

  async createUser(req: Request, res: Response): Promise<void> {
    const timer = logger.startTimer('Create User');

    try {
      logger.info('User creation request', {
        email: req.body.email,
        bodyKeys: Object.keys(req.body)
      }, 'UserController');

      const user = await this.userService.createUser(req.body);

      logger.success('User created successfully', {
        userId: user.id,
        email: user.email
      }, 'UserController');

      res.status(201).json(user);
      timer();
    } catch (error) {
      logger.error('User creation failed', error as Error, 'UserController');
      res.status(500).json({ message: 'Error creating user', error });
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.getUserById(req.params.id);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user', error });
    }
  }

  async getAllUsers(req: Request, res: Response): Promise<void> {
    const timer = logger.startTimer('Get All Users');

    try {
      logger.info('Get all users request', {
        query: req.query,
        requestor: req.auth?.payload?.sub
      }, 'UserController');

      const users = await this.userService.getAllUsers();

      logger.database('FIND', 'users', undefined, users.length);
      logger.success('Users fetched successfully', { count: users.length }, 'UserController');

      res.status(200).json(users);
      timer();
    } catch (error) {
      logger.error('Get all users failed', error as Error, 'UserController');
      res.status(500).json({ message: 'Error fetching users', error });
    }
  }
}
