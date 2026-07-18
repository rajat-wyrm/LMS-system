const request = require('supertest');
const express = require('express');

const authController = require('../src/controllers/auth.controller');
const { prisma } = require('../src/config/db');
const { addEmailJob } = require('../src/queues/email.queue');

jest.mock('../src/config/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('../src/queues/email.queue', () => ({
  addEmailJob: jest.fn(),
}));

const app = express();
app.use(express.json());

app.post('/api/auth/forgot-password', authController.forgotPassword);

describe('Forgot Password API', () => {

  beforeEach(() => {
    jest.clearAllMocks();

    process.env.JWT_SECRET = 'test-secret';
    process.env.CLIENT_URL = 'http://localhost:8081';
  });


  test('should not expose resetLink in production environment', async () => {

    process.env.NODE_ENV = 'production';
    process.env.DEBUG_RESET_LINK = 'false';

    prisma.user.findUnique.mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      password: 'hashed-password',
    });

    addEmailJob.mockResolvedValue(true);


    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({
        email: 'test@example.com',
      });


    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.resetLink).toBeUndefined();

    expect(addEmailJob).toHaveBeenCalledTimes(1);
  });



  test('should expose resetLink only in development with debug flag enabled', async () => {

    process.env.NODE_ENV = 'development';
    process.env.DEBUG_RESET_LINK = 'true';


    prisma.user.findUnique.mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      password: 'hashed-password',
    });


    addEmailJob.mockResolvedValue(true);


    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({
        email: 'test@example.com',
      });


    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.resetLink).toBeDefined();

    expect(response.body.resetLink)
      .toContain('/reset-password/user-123/');

  });



  test('should return success without revealing user existence', async () => {

    process.env.NODE_ENV = 'production';
    process.env.DEBUG_RESET_LINK = 'false';


    prisma.user.findUnique.mockResolvedValue(null);


    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({
        email: 'unknown@example.com',
      });


    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: 'If that email is registered, a reset link has been sent.',
    });

  });



  test('should return error when email is missing', async () => {

    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({});


    expect(response.statusCode).toBe(400);

    expect(response.body.success).toBe(false);

    expect(response.body.error)
      .toBe('Please provide an email');

  });

});