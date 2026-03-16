import { Test, TestingModule } from '@nestjs/testing';
import { ClientService } from './client.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Client } from './client.entity';
import { Repository } from 'typeorm';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';

describe('ClientService', () => {
  let service: ClientService;
  let repository: Repository<Client>;

  const mockClients = [
    { id: 1, name: 'Google', industry: 'Tech', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: 'Apple', industry: 'Retail', createdAt: new Date(), updatedAt: new Date() },
  ];

  const mockClientRepository = {
    find: vi.fn().mockResolvedValue(mockClients),
    findOneBy: vi.fn().mockImplementation((query) => {
      const result = mockClients.find((client) => client.id === query.id);
      return Promise.resolve(result || null);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        {
          provide: getRepositoryToken(Client),
          useValue: mockClientRepository,
        },
      ],
    }).compile();

    service = module.get<ClientService>(ClientService);
    repository = module.get<Repository<Client>>(getRepositoryToken(Client));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should retrieve all clients from the repository', async () => {
      const result = await service.findAll();
      expect(result).toEqual(mockClients);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should retrieve a specific client by id', async () => {
      const result = await service.findOne(1);
      expect(result).toEqual(mockClients[0]);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException if client is not found', async () => {
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 99 });
    });
  });
});
