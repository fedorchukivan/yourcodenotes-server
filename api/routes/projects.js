import { Router } from "express";
import { AddParticipant, CreateProject, CreateSection, GetSharedProjects, GetUserProjects, RemoveParticipant, RemoveSection } from "../../controllers/projects.js";

const router = Router();

router.post("/create", CreateProject);
router.post("/create-section", CreateSection);
router.delete("/delete-section/:sectionId", RemoveSection);
router.post("/add-participant", AddParticipant);
router.post("/remove-participant", RemoveParticipant);
router.get("/", GetUserProjects);
router.get("/shared", GetSharedProjects);

export { router as projectsRouter };