import { Router } from "express";
import { CreateRecord, GetOpenRecords, GetSectionRecords, GetUserRecords, RemoveRecord, UnpublishRecord, UpdateRecord } from "../../controllers/records.js";

const router = Router();

router.post("/", GetUserRecords);
router.post("/open-db", GetOpenRecords);
router.post("/of-section/:sectionId", GetSectionRecords);
router.post("/create", CreateRecord);
router.put("/update", UpdateRecord);
router.put("/unpublish/:recordId", UnpublishRecord);
router.delete("/delete/:recordId", RemoveRecord);

export { router as recordsRouter };