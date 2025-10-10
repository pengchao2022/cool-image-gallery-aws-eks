// User model for PostgreSQL
// This is a placeholder - in a real app, you'd use an ORM like Sequelize or direct SQL

export class User {
    constructor(id, username, email, password, role = 'user') {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    toJSON() {
        const { password, ...userWithoutPassword } = this;
        return userWithoutPassword;
    }
}

// Mock user data for development
export const mockUsers = [
    new User(1, 'admin', 'admin@example.com', 'hashed_password', 'admin'),
    new User(2, 'user1', 'user1@example.com', 'hashed_password', 'user')
];
