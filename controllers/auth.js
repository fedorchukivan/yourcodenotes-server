import { authRepository } from "../repositories/repositories.js"
import { authorize } from "./helpers/authorization.js";
import { jwtSign } from "./helpers/jwt.js";

export async function SignIn(req, res) {
  try {
    const payload = req.body;
    const user = await authRepository.getUser(payload);
    if (user) {
      const token = jwtSign({
        user_id: user.user_id,
        email: user.email,
        role: user.role
      });
      res.status(200).send({ user, token });
    }
    else {
      const userExist = await authRepository.getUser({email : payload.email});
      if (userExist) {
        res.status(400).send('Wrong password');
      }
      else {
        res.status(400).send('Wrong email');
      }
    }
  }
  catch (error) {
    res.status(500).send('Server error');
  }
}

export async function SignUp(req, res) {
  try {
    const user = await authRepository.getUser({email: req.body.email});
    if (user) {
      res.status(400).send('User already exists');
    }
    else {
      const user = await authRepository.createUser(req.body)
                        .then(async user_id => await authRepository.getUser(user_id));
      console.log(user);
      const token = jwtSign({
        user_id: user.user_id,
        email: user.email,
        role: user.role
      });
      res.status(200).send({ user, token });
    }
  }
  catch (error) {
    res.status(500).send('Server error');
  }
}

export async function GetUser(req, res) {
  try {
    const tokenPayload = authorize(req);
    console.log(tokenPayload);
    if (tokenPayload) {
      const user = await authRepository.getUser({ user_id: tokenPayload.user_id});
      res.status(200).send(user);
    }
    else {
      res.status(401).send('Unauthorized!');
    }
  }
  catch (error) {
    res.status(500).send('Server error');
  }
}