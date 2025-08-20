import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Tasks (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST -> GET -> PUT -> DELETE task flow', async () => {
    // Create
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/tasks')
      .send({
        title: 'Test Task',
        description: 'desc',
        assigneeId: '6f0b9a10-7e26-4e1e-825d-397f3397d827',
        projectId: '6f0b9a10-7e26-4e1e-825d-397f3397d828',
      })
      .expect(201);

    const created = createRes.body as unknown as { id: string; title: string };
    expect(created.id).toBeDefined();

    // Get by id
    const getRes = await request(app.getHttpServer())
      .get(`/api/v1/tasks/${created.id}`)
      .expect(200);
    expect((getRes.body as { title: string }).title).toBe('Test Task');

    // List
    const listRes = await request(app.getHttpServer())
      .get('/api/v1/tasks?limit=10&page=1')
      .expect(200);
    expect(Array.isArray((listRes.body as { data: unknown[] }).data)).toBe(
      true,
    );

    // Update
    const updateRes = await request(app.getHttpServer())
      .put(`/api/v1/tasks/${created.id}`)
      .send({ title: 'Updated Task' })
      .expect(200);
    expect((updateRes.body as { title: string }).title).toBe('Updated Task');

    // Delete
    await request(app.getHttpServer())
      .delete(`/api/v1/tasks/${created.id}`)
      .expect(200);
  });
});
