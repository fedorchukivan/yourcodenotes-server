export default class ProjectsRepository {
  constructor(db) {
    this.db = db;
  }
  
  getUser = async (data) => {
    return await this.db.select('user_id', 'email', 'username', 'role')
                            .from('users')
                            .innerJoin('roles', 'users.role_id', 'roles.role_id')
                            .where(data)
                            .first();
  }

  createProject = async (data) => {
    return await this.db.insert(data, ['*']).into('projects').then(
      async (projects) => {
        const project = projects[0];
        return await this.db.insert({
          project_id: project.project_id,
          title: 'Records without section',
          is_default: true
        }, ['*']).into('sections')
        .then(sections => ({ ...project, sections}))
        .then(async p => ({ ...p, creator: await this.getUser({ user_id: p.creator_id })}));
      }
    );
  }
  
  createSection = async (data) => {
    return (await this.db.insert(data, ['*']).into('sections'))[0];
  }
  
  fetchProjectsAdditionalInfo = async (projects) => {
    for (let i = 0; i < projects.length;) {
      projects[i].sections = await this.db('sections')
                                  .where('project_id', projects[i].project_id)
                                  .then(sections => { i++; return sections});
    }
    for (let i = 0; i < projects.length;) {
      projects[i].users = await this.db.select('users.user_id', 'username', 'email').from('users')
                                  .innerJoin('project_participant', 'users.user_id', 'project_participant.user_id')
                                  .where({
                                    project_id: projects[i].project_id
                                  })
                                  .then(users => { i++; return users});
    }
    for (let i = 0; i < projects.length;) {
      projects[i].creator = await this.getUser({
        user_id: projects[i].creator_id
      }).then(creator => { i++; return creator});
    }
    return projects;
  }
  
  getUserProjects = async (user_id) => {
    return await this.db('projects').where('creator_id', user_id)
                  .then(this.fetchProjectsAdditionalInfo);
  }
  
  getUserSharedProjects = async (user_id) => {
    return await this.db.select('title', 'creator_id', 'projects.project_id')
                  .innerJoin('project_participant', 'project_participant.project_id', 'projects.project_id')
                  .from('projects')
                  .where('project_participant.user_id', user_id)
                  .then(this.fetchProjectsAdditionalInfo);
  }
  
  addParticipant = async (data) => {
    return await this.getUser({ email: data.email })
              .then(async user => {
                if (!user || user.role === 'admin') return null;
                const entity = {
                  project_id: data.project_id,
                  user_id: user.user_id
                };
                return await this.db.select('*').from('project_participant')
                                .where(entity)
                                .first()
                                .then(async link => {
                                  if (link) return null;
                                  return await this.db.insert(entity).into('project_participant')
                                                    .then(() => ({ user:user, project_id: data.project_id}));
                                });
              });
  }
  
  removeParticipant = async (data) => {
    return await this.db.select('*').from('project_participant')
                    .where(data)
                    .first()
                    .then(async link => {
                      if (!link) return null;
                      return (await this.db('project_participant')
                                        .where(data)
                                        .del(['user_id']))[0];
    });
  }
}