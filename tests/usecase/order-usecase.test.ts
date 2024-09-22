import { DoctorRepository } from '../../src/external/data-sources/mongodb/doctor-respository-mongo';
import { PasswordHasher } from '../../src/operation/controllers/password-hasher-controller';
import { DoctorUseCase } from '../../src/core/usercases/doctor-use-case';
import { ValidationError } from '../../src/common/errors/validation-error';


const mockDoctorRepository: Partial<DoctorRepository> = {
  save: jest.fn(),
};

const mockPasswordHasher: Partial<PasswordHasher> = {
  hash: jest.fn(() => Promise.resolve('hashed_password')),
};

const mockTokenService: Partial<TokenService> = {
    generateToken: jest.fn(() => 'token'),
  };

describe('CreateDoctorUseCase', () => {
  let createDoctorUseCase: DoctorUseCase;

  beforeEach(() => {
    createDoctorUseCase = new DoctorUseCase(
      mockDoctorRepository as DoctorRepository,
      mockPasswordHasher as PasswordHasher
    );
  });

  it('should create a doctor successfully', async () => {
    const doctorData = {
      id: '1',
      name: 'Dr. João',
      cpf: '12345678910',
      crm: 'CRM12345',
      email: 'doctor@example.com',
      password: 'password123',
    };

    await createDoctorUseCase.createDoctor(doctorData);

    expect(mockPasswordHasher.hash).toHaveBeenCalledWith('password123');
    expect(mockDoctorRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Dr. João',
        crm: 'CRM12345',
        email: 'doctor@example.com',
        password: 'hashed_password',
      })
    );
  });

  it('should throw validation error when required fields are missing', async () => {
    await expect(createDoctorUseCase.createDoctor({ email: 'doctor@example.com' })).rejects.toThrow(ValidationError);
  });
});

describe('LoginDoctorUseCase', () => {
    let loginDoctorUseCase: DoctorUseCase;
  
    beforeEach(() => {
      loginDoctorUseCase = new DoctorUseCase(
        mockDoctorRepository as DoctorRepository,
        mockPasswordHasher as PasswordHasher,
        mockTokenService as TokenService
      );
    });
  
    it('should login doctor successfully with correct credentials', async () => {
      mockDoctorRepository.findByEmail = jest.fn(() =>
        Promise.resolve({
            id: '001',
            cpf: '001',
            name: 'Dr. João',
            crm: 'CRM12345',
            email: 'doctor@example.com',
            password: 'hashed_password',
        })
      );
  
      const token = await loginDoctorUseCase.autenticateDoctor('doctor@example.com', 'password123');
  
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(mockTokenService.generateToken).toHaveBeenCalledWith({ doctorId: '1' });
      expect(token).toBe('token');
    });
  
    it('should throw authentication error for invalid credentials', async () => {
      mockPasswordHasher.compare = jest.fn(() => Promise.resolve(false));
  
      await expect(loginDoctorUseCase.autenticateDoctor('doctor@example.com', 'wrong_password')).rejects.toThrow(AuthenticationError);
    });
  });
