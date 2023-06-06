import { Router } from "express";
import { GetUser, SignIn, SignUp } from "../../controllers/auth.js";

const router = Router();

router.post("/sign-in", SignIn);
router.post("/sign-up", SignUp);
router.get("/", GetUser);

export { router as authRouter };