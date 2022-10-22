import {
  createUser,
  getUsers,
  searchUsers,
  updatePassword,
  updatePasswordLogin,
  updateUser,
  getTerapeuta,
} from '../services/user.service';
import {
  messageSuccess,
  messageSuccessList,
  messageUpdate,
} from '../utils/message.response';

export class userController {
  static create = async (req: any, res: any, next: any) => {
    try {
      const body = req.body;
      body.ativo = true;
      const data = await createUser(req.body);
      res.status(200).json(messageSuccess(data));
    } catch (error: any) {
      res.status(401).json(error);
      next();
    }
  };
  static getTerapeuta = async (req: any, res: any, next: any) => {
    try {
      const response = await getTerapeuta();
      res.status(200).json(messageSuccessList(response));
    } catch (error: any) {
      res.status(401).json(error);
      next();
    }
  };
  static update = async (req: any, res: any, next: any) => {
    try {
      const data = await updateUser(req.body);
      res.status(200).json(messageUpdate(data));
    } catch (error: any) {
      res.status(401).json(error);
      next();
    }
  };
  static updatePassword = async (req: any, res: any, next: any) => {
    try {
      const data = await updatePassword(req.params.id);
      res.status(200).json(messageUpdate(data));
    } catch (error: any) {
      res.status(401).json(error);
      next();
    }
  };
  static updatePasswordLogin = async (req: any, res: any, next: any) => {
    try {
      const data = await updatePasswordLogin(req.params.login, req.body);
      res.status(200).json(messageUpdate(data));
    } catch (error: any) {
      res.status(401).json(error);
      next();
    }
  };
  static get = async (req: any, res: any, next: any) => {
    try {
      const data = await getUsers();
      res.status(200).json(data);
    } catch (error: any) {
      res.status(401).json(error);
      next();
    }
  };
  static search = async (req: any, res: any, next: any) => {
    try {
      const data = await searchUsers(req.params.search);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(401).json(error);
      next();
    }
  };
}
