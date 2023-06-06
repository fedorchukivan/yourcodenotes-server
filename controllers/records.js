import { recordsRepository } from "../repositories/repositories.js";
import { authorize } from "./helpers/authorization.js";

export async function CreateRecord(req, res) {
  try {
    const tokenPayload = authorize(req);
    if (tokenPayload) {
      const record = await recordsRepository.createRecord(req.body);
      res.status(200).send(record);
    }
    else {
      res.status(401).send('Unauthorized!');
    }
  }
  catch (error) {
    res.status(500).send('Server error');
  }
}

export async function UpdateRecord(req, res) {
  try {
    const tokenPayload = authorize(req);
    if (tokenPayload) {
      const record = await recordsRepository.updateRecord(req.body);
      res.status(200).send(record);
    }
    else {
      res.status(401).send('Unauthorized!');
    }
  }
  catch (error) {
    res.status(500).send('Server error');
  }
}

export async function UnpublishRecord(req, res) {
  try {
    const tokenPayload = authorize(req);
    if (tokenPayload && tokenPayload.role === 'admin') {
      const record = await recordsRepository.unpublishRecord(req.params.recordId);
      res.status(200).send(record);
    }
    else {
      res.status(401).send('Unauthorized!');
    }
  }
  catch (error) {
    res.status(500).send('Server error');
  }
}

export async function RemoveRecord(req, res) {
  try {
    const tokenPayload = authorize(req);
    if (tokenPayload) {
      const record = await recordsRepository.removeRecord(req.params.recordId);
      res.status(200).send(record);
    }
    else {
      res.status(401).send('Unauthorized!');
    }
  }
  catch (error) {
    res.status(500).send('Server error');
  }
}

export async function GetUserRecords(req, res) {
  try {
    const tokenPayload = authorize(req);
    if (tokenPayload) {
      const records = await recordsRepository.getUserRecords(tokenPayload.user_id);
      res.status(200).send(records);
    }
    else {
      res.status(401).send('Unauthorized!');
    }
  }
  catch (error) {
    res.status(500).send('Server error');
  }
}

export async function GetOpenRecords(req, res) {
  try {
    const records = await recordsRepository.getPublicRecords();
    res.status(200).send(records);
  }
  catch (error) {
    res.status(500).send('Server error');
  }
}

export async function GetSectionRecords(req, res) {
  try {
    const tokenPayload = authorize(req);
    if (tokenPayload) {
      const records = await recordsRepository.getSectionRecords(req.params.sectionId);
      res.status(200).send(records);
    }
    else {
      res.status(401).send('Unauthorized!');
    }
  }
  catch (error) {
    res.status(500).send('Server error');
  }
}