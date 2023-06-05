import { dbConfig } from './config.js';
import knex from 'knex';

const db = knex(dbConfig);

const getUser = async (data) => {
  return await db.select('user_id', 'email', 'username', 'role')
                          .from('users')
                          .innerJoin('roles', 'users.role_id', 'roles.role_id')
                          .where(data)
                          .first();
}

const createUser = async (data) => {
  return (await db.insert(data, ['*']).into('users'))[0];
}

const createProject = async (data) => {
  return await db.insert(data, ['*']).into('projects').then(
    async (projects) => {
      const project = projects[0];
      return await db.insert({
        project_id: project.project_id,
        title: 'Records without section',
        is_default: true
      }, ['*']).into('sections')
      .then(sections => ({ ...project, sections}))
      .then(async p => ({ ...p, creator: await getUser({ user_id: p.creator_id })}));
    }
  );
}

const createSection = async (data) => {
  return (await db.insert(data, ['*']).into('sections'))[0];
}

const fetchProjectsAdditionalInfo = async (projects) => {
  for (let i = 0; i < projects.length;) {
    projects[i].sections = await db('sections')
                                .where('project_id', projects[i].project_id)
                                .then(sections => { i++; return sections});
  }
  for (let i = 0; i < projects.length;) {
    projects[i].users = await db.select('users.user_id', 'username', 'email').from('users')
                                .innerJoin('project_participant', 'users.user_id', 'project_participant.user_id')
                                .where({
                                  project_id: projects[i].project_id
                                })
                                .then(users => { i++; return users});
  }
  for (let i = 0; i < projects.length;) {
    projects[i].creator = await getUser({
      user_id: projects[i].creator_id
    }).then(creator => { i++; return creator});
  }
  return projects;
}

const getUserProjects = async (user_id) => {
  return await db('projects').where('creator_id', user_id)
                .then(fetchProjectsAdditionalInfo);
}

const getUserSharedProjects = async (user_id) => {
  return await db.select('title', 'creator_id', 'projects.project_id')
                .innerJoin('project_participant', 'project_participant.project_id', 'projects.project_id')
                .from('projects')
                .where('project_participant.user_id', user_id)
                .then(fetchProjectsAdditionalInfo);
}

const addParticipant = async (data) => {
  return await getUser({ email: data.email })
            .then(async user => {
              if (!user || user.role === 'admin') return null;
              const entity = {
                project_id: data.project_id,
                user_id: user.user_id
              };
              return await db.select('*').from('project_participant')
                              .where(entity)
                              .first()
                              .then(async link => {
                                if (link) return null;
                                return await db.insert(entity).into('project_participant')
                                                  .then(() => ({ user:user, project_id: data.project_id}));
                              });
            });
}

const removeParticipant = async (data) => {
  return await db.select('*').from('project_participant')
                  .where(data)
                  .first()
                  .then(async link => {
                    if (!link) return null;
                    return (await db('project_participant')
                                      .where(data)
                                      .del(['user_id']))[0];
  });
}

const createRecord = async (data) => {
  return await db.insert({
    title: data.title,
    problem_description: data.problem_description,
    solution_description: data.solution_description,
    image_link: data.image_link,
    section_id: data.section_id,
    creator_id: data.creator_id,
    is_public: data.is_public,
  }, ['*']).into('records')
  .then(async (res) => {
    const record = res[0];
    data.sources = data.sources.map(source => ({...source, record_id: record.record_id }));
    if (data.sources.length) {
      return await db.insert(data.sources, ['*']).into('sources')
                      .then(sources => ({ ...record, sources }));
    }
    return { ...record, sources: [] }
  })
  .then(async record => {
    return await db.select('*').from('tags').whereIn('name', data.tags)
                    .then(async tags => {
                      tags.forEach(async tag => await db.insert({
                        tag_id: tag.tag_id,
                        record_id: record.record_id
                      }).into('record_tag'));
                      return tags;
                    })
                    .then(async tags => {
                      record.tags = tags;
                      const filter = tags.map(tag => tag.name);
                      const tagsToAdd = data.tags.filter(tag => !filter.includes(tag)).map(tag => ({ name: tag }));
                      if (tagsToAdd.length) {
                        return await db.insert(tagsToAdd, ['*']).into('tags');
                      }
                      return [];
                    })
                    .then(async tags => {
                      record.tags = [...record.tags, ...tags];
                      tags.forEach(async tag => await db.insert({
                        tag_id: tag.tag_id,
                        record_id: record.record_id
                      }).into('record_tag'));
                      return record;
                    })
                    .then( async record => {
                      return await getUser({ user_id: record.creator_id })
                                    .then(creator => ({ ...record, creator }))
                    })
  });
}

const updateRecord = async (data) => {
  return db('records').where('record_id', data.record_id).update({
    title: data.title,
    problem_description: data.problem_description,
    solution_description: data.solution_description,
    image_link: data.image_link,
    is_public: data.is_public,
  }, ['*'])
  .then(async (res) => {
    const record = res[0];
    await db('sources').where({ record_id: record.record_id }).del();
    data.sources = data.sources.map(source => ({...source, record_id: record.record_id }));
    if (data.sources.length) {
      return await db.insert(data.sources, ['*']).into('sources')
                      .then(sources => ({ ...record, sources }));
    }
    return { ...record, sources: [] }
  })
  .then(async record => {
    await db('record_tag').where({ record_id: record.record_id }).del();
    return await db.select('*').from('tags').whereIn('name', data.tags)
                    .then(async tags => {
                      tags.forEach(async tag => await db.insert({
                        tag_id: tag.tag_id,
                        record_id: record.record_id
                      }).into('record_tag'));
                      return tags;
                    })
                    .then(async tags => {
                      record.tags = tags;
                      const filter = tags.map(tag => tag.name);
                      const tagsToAdd = data.tags.filter(tag => !filter.includes(tag)).map(tag => ({ name: tag }));
                      if (tagsToAdd.length) {
                        return await db.insert(tagsToAdd, ['*']).into('tags');
                      }
                      return [];
                    })
                    .then(async tags => {
                      record.tags = [...record.tags, ...tags];
                      tags.forEach(async tag => await db.insert({
                        tag_id: tag.tag_id,
                        record_id: record.record_id
                      }).into('record_tag'));
                      return record;
                    })
                    .then( async record => {
                      return await getUser({ user_id: record.creator_id })
                                    .then(creator => ({ ...record, creator }))
                    })
    })
}

const unpublishRecord = async record_id => {
  return (await db('records').where({ record_id })
                .update({ is_public: false }, ['record_id']))[0];
}

const removeRecord = async (record_id) => {
  await db('sources').where({ record_id }).del();
  await db('record_tag').where({ record_id }).del();
  return (await db('records')
                    .where({ record_id })
                    .del(['record_id']))[0];
}

const fetchRecordsAdditionalInfo = async records => {
  for (let i = 0; i < records.length;) {
    records[i].sources = await db('sources')
                                .where('record_id', records[i].record_id)
                                .then(sources => { i++; return sources});
  }
  for (let i = 0; i < records.length;) {
    records[i].tags = await db.select('tags.tag_id', 'name').from('tags')
                                .innerJoin('record_tag', 'tags.tag_id', 'record_tag.tag_id')
                                .where({
                                  record_id: records[i].record_id
                                })
                                .then(tags => { i++; return tags});
  }
  for (let i = 0; i < records.length;) {
    records[i].creator = await getUser({
      user_id: records[i].creator_id
    }).then(creator => { i++; return creator});
  }
  return records;
}

const getPublicRecords = async () => {
  return await db.select('*').from('records')
                    .where('is_public', true)
                    .then(fetchRecordsAdditionalInfo);
}

const getSectionRecords = async (id) => {
  return await db.select('*').from('records')
                    .where('section_id', id)
                    .then(fetchRecordsAdditionalInfo);
}

const getUserRecords = async (user_id) => {
  return await db.select('*').from('records')
                    .where('creator_id', user_id)
                    .then(fetchRecordsAdditionalInfo);
}
                  
export {
  getUser,
  createUser,
  createProject,
  createSection,
  createRecord,
  updateRecord,
  unpublishRecord,
  removeRecord,
  addParticipant,
  removeParticipant,
  getPublicRecords,
  getSectionRecords,
  getUserRecords,
  getUserProjects,
  getUserSharedProjects,
};