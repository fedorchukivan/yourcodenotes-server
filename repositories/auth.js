export default class AuthRepository {
  constructor(db) {
    this.db = db
  }

  getUser = async (data) => {
    return await this.db.select('user_id', 'email', 'username', 'role')
                            .from('users')
                            .innerJoin('roles', 'users.role_id', 'roles.role_id')
                            .where(data)
                            .first();
  }

  createUser = async (data) => {
    return (await this.db.insert(data, ['user_id']).into('users'))[0];
  }
}