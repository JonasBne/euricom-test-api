const request = require('supertest');
const app = require('../src/express');
const db = require('../src/dbConnection');

const { seedUsers, getUser } = require('../src/repository/users');

describe('User Routes', () => {
  beforeEach(async () => {
    await db.connectToDb();
    await db.dropDb();
  });
  afterAll(() => db.closeConnection());

  it('fetches users', async () => {
    await seedUsers(3);
    const response = await request(app.app)
      .get('/api/users')
      .expect(200);

    expect(response.body).toHaveProperty('total');
    expect(response.body).toHaveProperty('users');
    expect(response.body.users.length).toBe(3);
  });

  it('fetches a user', async () => {
    await seedUsers(1);
    const user = await getUser(1000);

    const response = await request(app.app)
      .get(`/api/users/${user._id}`)
      .expect(200);

    expect(response.body.id).toEqual(user._id);
  });

  it('throws a 404 on wrong user ID', async () => {
    await seedUsers(1);

    const response = await request(app.app)
      .get('/api/users/2')
      .expect(404);

    expect(response.body.code).toEqual('Not Found');
    expect(response.body.message).toEqual('User not found');
  });

  it('creates a user', async () => {
    const user = {
      firstName: 'peter',
      lastName: 'cosemans',
      age: 52,
      email: 'peter.cosemans@gmail.com',
      role: 'admin',
    };

    const response = await request(app.app)
      .post('/api/users')
      .send(user)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.firstName).toEqual(user.firstName);
    expect(response.body.lastName).toEqual(user.lastName);
  });

  it('updates a user', async () => {
    await seedUsers(1);
    const oldUser = await getUser(1000);
    const newUser = {
      firstName: 'Jonas',
      lastName: 'Van Eeckhout',
      age: oldUser.age,
      email: oldUser.email,
      role: oldUser.role,
    };

    const response = await request(app.app)
      .put(`/api/users/${oldUser._id}`)
      .send(newUser)
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body.firstName).toEqual(newUser.firstName);
    expect(response.body.lastName).toEqual(newUser.lastName);
  });

  it('throws a 404 on wrong user ID', async () => {
    await seedUsers(1);
    const oldUser = await getUser(1000);
    const newUser = {
      firstName: 'Jonas',
      lastName: 'Van Eeckhout',
      age: oldUser.age,
      email: oldUser.email,
      role: oldUser.role,
    };

    const response = await request(app.app)
      .put('/api/users/2')
      .send(newUser)
      .expect(404);

    expect(response.body.code).toEqual('Not Found');
    expect(response.body.message).toEqual('User not found');
  });

  it('deletes a user', async () => {
    await seedUsers(1);
    const user = await getUser(1000);

    const response = await request(app.app)
      .delete(`/api/users/${user._id}`)
      .expect(200);

    const newUser = await getUser(1000);

    expect(response.body.id).toEqual(user._id);
    expect(newUser).toBe(null);
  });

  it('throws a 404 on wrong user ID', async () => {
    await seedUsers(1);

    await request(app.app)
      .delete('/api/users/2')
      .expect(204);
  });
});
