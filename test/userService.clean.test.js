const { UserService } = require('../src/userService');

describe('UserService', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  describe('createUser', () => {
    test('should create a user with valid data', () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      };

      // Act
      const createdUser = userService.createUser(
        userData.name,
        userData.email,
        userData.age
      );

      // Assert
      expect(createdUser).toEqual(expect.objectContaining({
        id: expect.any(String),
        nome: userData.name,
        email: userData.email,
        idade: userData.age,
        status: 'ativo'
      }));
    });

    test('should throw error when creating user under 18', () => {
      // Arrange
      const underageData = {
        name: 'Young User',
        email: 'young@example.com',
        age: 17
      };

      // Act & Assert
      expect(() => 
        userService.createUser(
          underageData.name,
          underageData.email,
          underageData.age
        )
      ).toThrow('O usuário deve ser maior de idade.');
    });
  });

  describe('getUserById', () => {
    test('should retrieve user by id', () => {
      // Arrange
      const user = userService.createUser('Jane Doe', 'jane@example.com', 30);

      // Act
      const retrievedUser = userService.getUserById(user.id);

      // Assert
      expect(retrievedUser).toEqual(user);
    });
  });

  describe('deactivateUser', () => {
    test('should deactivate non-admin user', () => {
      // Arrange
      const regularUser = userService.createUser('Regular', 'regular@example.com', 30);

      // Act
      const result = userService.deactivateUser(regularUser.id);

      // Assert
      expect(result).toBe(true);
      expect(userService.getUserById(regularUser.id).status).toBe('inativo');
    });

    test('should not deactivate admin user', () => {
      // Arrange
      const adminUser = userService.createUser('Admin', 'admin@example.com', 40, true);

      // Act
      const result = userService.deactivateUser(adminUser.id);

      // Assert
      expect(result).toBe(false);
      expect(userService.getUserById(adminUser.id).status).toBe('ativo');
    });
  });

  describe('generateUserReport', () => {
    test('should generate report with user information', () => {
      // Arrange
      const user = userService.createUser('Alice', 'alice@example.com', 28);

      // Act
      const report = userService.generateUserReport();

      // Assert
      expect(report).toMatch(/^--- Relatório de Usuários ---/);
      expect(report).toMatch(new RegExp(`ID: ${user.id}.*Nome: Alice.*Status: ativo`));
    });

    test('should return empty report when no users exist', () => {
      // Act
      const report = userService.generateUserReport();

      // Assert
      expect(report).toBe('--- Relatório de Usuários ---\nNenhum usuário cadastrado.');
    });
  });
});