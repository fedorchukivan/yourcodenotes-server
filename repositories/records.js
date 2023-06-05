export default class RecordsRepository {
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

  fetchCreator = async (record) => {
    return await this.getUser({ user_id: record.creator_id })
                        .then(creator => ({ ...record, creator }));
  }

  createSources = async (sources, record_id) => {
    sources = sources.map(source => ({...source, record_id }));
    if (sources.length) {
      return await this.db.insert(sources, ['*']).into('sources')
    }
    return sources;
  }

  addTags = async (record, tags) => {
    return await this.db.select('*').from('tags').whereIn('name', tags)
                      .then(async existingTags => {
                        existingTags.forEach(async tag => await this.db.insert({
                          tag_id: tag.tag_id,
                          record_id: record.record_id
                        }).into('record_tag'));
                        return existingTags;
                      })
                      .then(async existingTags => {
                        record.tags = existingTags;
                        const filter = existingTags.map(tag => tag.name);
                        const tagsToAdd = tags.filter(tag => !filter.includes(tag)).map(tag => ({ name: tag }));
                        if (tagsToAdd.length) {
                          return await this.db.insert(tagsToAdd, ['*']).into('tags');
                        }
                        return [];
                      })
                      .then(async createdTags => {
                        record.tags = [...record.tags, ...createdTags];
                        createdTags.forEach(async tag => await this.db.insert({
                          tag_id: tag.tag_id,
                          record_id: record.record_id
                        }).into('record_tag'));
                        return record;
                      });
  }

  createRecord = async (data) => {
    return await this.db.insert({
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
      return await this.createSources(data.sources, record.record_id)
        .then(sources => ({ ...record, sources }));
    })
    .then(async record => {
      return await this.addTags(record, data.tags)
                      .then(this.fetchCreator)
    });
  }
  
  updateRecord = async (data) => {
    return this.db('records').where('record_id', data.record_id).update({
      title: data.title,
      problem_description: data.problem_description,
      solution_description: data.solution_description,
      section_id: data.section_id,
      image_link: data.image_link,
      is_public: data.is_public,
    }, ['*'])
    .then(async (res) => {
      const record = res[0];
      await this.db('sources').where({ record_id: record.record_id }).del();
      return await this.createSources(data.sources, record.record_id)
        .then(sources => ({ ...record, sources }));
    })
    .then(async record => {
      await this.db('record_tag').where({ record_id: record.record_id }).del();
      return await this.addTags(record, data.tags)
                      .then(this.fetchCreator)
      })
  }

  unpublishRecord = async record_id => {
    return (await this.db('records').where({ record_id })
                  .update({ is_public: false }, ['record_id']))[0];
  }
  
  removeRecord = async (record_id) => {
    await this.db('sources').where({ record_id }).del();
    await this.db('record_tag').where({ record_id }).del();
    return (await this.db('records')
                      .where({ record_id })
                      .del(['record_id']))[0];
  }

  fetchRecordsAdditionalInfo = async records => {
    for (let i = 0; i < records.length;) {
      records[i].sources = await this.db('sources')
                                  .where('record_id', records[i].record_id)
                                  .then(sources => { i++; return sources});
    }
    for (let i = 0; i < records.length;) {
      records[i].tags = await this.db.select('tags.tag_id', 'name').from('tags')
                                  .innerJoin('record_tag', 'tags.tag_id', 'record_tag.tag_id')
                                  .where({
                                    record_id: records[i].record_id
                                  })
                                  .then(tags => { i++; return tags});
    }
    for (let i = 0; i < records.length;) {
      records[i].creator = await this.getUser({
        user_id: records[i].creator_id
      }).then(creator => { i++; return creator});
    }
    return records;
  }

  
  getPublicRecords = async () => {
    return await this.db.select('*').from('records')
                      .where('is_public', true)
                      .then(this.fetchRecordsAdditionalInfo);
  }

  getSectionRecords = async (id) => {
    return await this.db.select('*').from('records')
                      .where('section_id', id)
                      .then(this.fetchRecordsAdditionalInfo);
  }

  getUserRecords = async (user_id) => {
    return await this.db.select('*').from('records')
                      .where('creator_id', user_id)
                      .then(this.fetchRecordsAdditionalInfo);
  }
}