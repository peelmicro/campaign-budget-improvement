import { Test, TestingModule } from '@nestjs/testing';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('ClientController', () => {
  let controller: ClientController;
  let service: ClientService;

  const mockClients = [
    { id: 1, name: 'Google', industry: 'Tech', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: 'Apple', industry: 'Retail', createdAt: new Date(), updatedAt: new Date() },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientController],
      providers: [
        {
          provide: ClientService,
          useValue: {
            findAll: vi.fn().mockResolvedValue(mockClients),
            findOne: vi.fn().mockImplementation((id: number) =>
              Promise.resolve(mockClients.find((client) => client.id === id)),
            ),
          },
        },
      ],
    }).compile();

    controller = module.get<ClientController>(ClientController);
    service = module.get<ClientService>(ClientService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of clients', async () => {
      const result = await controller.findAll();
      expect(result).toEqual(mockClients);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a single client by id', async () => {
      const result = await controller.findOne(1);
      expect(result).toEqual(mockClients[0]);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });
});
