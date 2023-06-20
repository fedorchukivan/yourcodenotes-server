import { projectsRepository } from "../repositories/repositories.js";
import { authorize } from "./helpers/authorization.js";

export async function CreateProject(req, res) {
  try {
    const tokenPayload = authorize(req);
    if (tokenPayload) {
      req.body.creator_id = tokenPayload.user_id;
      const project = await projectsRepository.createProject(req.body);
      res.status(200).send(project);
    }
    else {
      res.status(401).send('Unauthorized!');
    }
  }
  catch (error) {
    res.status(500).send('Server error');
  }
}

export async function CreateSection(req, res) {
  try {
    const tokenPayload = authorize(req);
    if (tokenPayload) {
      const project = await projectsRepository.getProject({ project_id: req.body.project_id });
      if (project && project.creator_id == tokenPayload.user_id)
      {
        const section = await projectsRepository.createSection(req.body);
        res.status(200).send(section);
      }
      else {
        res.status(401).send('Wrong project');
      }
    }
    else {
      res.status(401).send('Unauthorized!');
    }
  }
  catch (error) {
    res.status(500).send('Server error');
  }
}

export async function RemoveSection(req, res) {
  try {
    const tokenPayload = authorize(req);
    if (tokenPayload) {
      const section_id = await projectsRepository.removeSection(req.params.sectionId);
      res.status(200).send(section_id);
    }
    else {
      res.status(401).send('Unauthorized!');
    }
  }
  catch (error) {
    res.status(500).send('Server error');
  }
}

export async function AddParticipant(req, res) {
  try {
    const tokenPayload = authorize(req);
    if (tokenPayload) {
      const project = await projectsRepository.getProject({ project_id: req.body.project_id });
      if (project && project.creator_id == tokenPayload.user_id)
      {
        if (tokenPayload.email != req.body.email) {
          const result = await projectsRepository.addParticipant(req.body);
          res.status(200).send(result);
        }
        else {
          res.status(400).send('Can not add creator as participant');
        }
      }
      else {
        res.status(401).send('Wrong project');
      }
    }
    else {
      res.status(401).send('Unauthorized!');
    }
  }
  catch (error) {
    res.status(500).send('Server error');
  }
}

export async function RemoveParticipant(req, res) {
  try {
    const tokenPayload = authorize(req);
    if (tokenPayload) {
      const project = await projectsRepository.getProject({ project_id: req.body.project_id });
      if (project && project.creator_id == tokenPayload.user_id)
      {
        const result = await projectsRepository.removeParticipant(req.body);
        res.status(200).send(result);
      }
      else {
        res.status(401).send('Wrong project');
      }
    }
    else {
      res.status(401).send('Unauthorized!');
    }
  }
  catch (error) {
    res.status(500).send('Server error');
  }
}

export async function GetUserProjects(req, res) {
  try {
    const tokenPayload = authorize(req);
    if (tokenPayload) {
      const projects = await projectsRepository.getUserProjects(tokenPayload.user_id);
      res.status(200).send(projects);
    }
    else {
      res.status(401).send('Unauthorized!');
    }
  }
  catch (error) {
    res.status(500).send('Server error');
  }
}

export async function GetSharedProjects(req, res) {
  try {
    const tokenPayload = authorize(req);
    if (tokenPayload) {
      const projects = await projectsRepository.getUserSharedProjects(tokenPayload.user_id);
      res.status(200).send(projects);
    }
    else {
      res.status(401).send('Unauthorized!');
    }
  }
  catch (error) {
    res.status(500).send('Server error');
  }
}