import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './schemas/user.schema';
import { ProfileService } from '../profile/profile.service';
import { Types } from 'mongoose';


describe('AuthService - other methods', () => {
  let authService: AuthService;

  const mockUserModel = {
    save: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const mockUserDoc = {
    _id: new Types.ObjectId(),
    email: 'admin@example.com',
    name: 'Admin User',
    role: UserRole.ADMIN,
    password: 'hashedpass',
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockProfileService = {
    createProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ProfileService, useValue: mockProfileService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create user by admin and create profile', async () => {
    const dto = {
      name: 'New User',
      email: 'new@example.com',
      password: 'newpass',
      role: UserRole.USER,
    };

    const hashed = await bcrypt.hash(dto.password, 10);

    const savedUser = {
      ...dto,
      _id: new Types.ObjectId(),
      password: hashed,
    };

    mockUserModel.save = jest.fn().mockResolvedValue(savedUser);
    mockUserModel.constructor = jest.fn(() => ({ save: () => savedUser }));
    const userModelMock = jest.fn(() => ({ save: jest.fn().mockResolvedValue(savedUser) }));

    const result = await new AuthService(
      userModelMock as any,
      mockJwtService as any,
      mockProfileService as any,
    ).createUserByAdmin(dto);

    expect(result).toEqual(savedUser);
    expect(mockProfileService.createProfile).toHaveBeenCalledWith({
      userId: savedUser._id.toString(),
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
    });
  });

  it('should find user by email', async () => {
    const email = 'find@example.com';
    mockUserModel.findOne = jest.fn().mockResolvedValue(mockUserDoc);
    const result = await authService.findByEmail(email);
    expect(result).toEqual(mockUserDoc);
    expect(mockUserModel.findOne).toHaveBeenCalledWith({ email });
  });

  it('should find user by id', async () => {
    const userId = '123';
    mockUserModel.findById = jest.fn().mockResolvedValue(mockUserDoc);
    const result = await authService.findById(userId);
    expect(result).toEqual(mockUserDoc);
    expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
  });

  it('should update user profile', async () => {
    const userId = '123';
    const updateData = {
      linkedinBio: 'Updated bio',
      name: 'Updated Name',
    };
    await authService.updateUserProfile(userId, updateData);
    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, expect.objectContaining(updateData));
  });
});
