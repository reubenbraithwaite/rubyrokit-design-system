// src/services/auth.service.ts
import User, { IUser } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config';

export interface AuthPayload {
  id: string;
  email: string;
  role: string;
  institutionId?: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    institutionId?: string;
  }): Promise<Partial<IUser>> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Create user with hashed password
    const user = new User({
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'individual',
      institutionId: userData.institutionId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Save user
    await user.save();

    // Return user without password
    const userObject = user.toObject();
    const { password, ...userWithoutPassword } = userObject;
    return userWithoutPassword;
;
  }

  /**
   * Login a user
   */
async login(email: string, password: string): Promise<{ user: Partial<IUser>, token: string }> {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const payload: AuthPayload = {
      id: String(user._id),
      email: user.email,
      role: user.role
    };

    if (user.institution) {
      payload.institutionId = user.institution.toString();
    }


    const token = jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    // Return user and token
    const userObject = user.toObject();
    const { password: _, ...userWithoutPassword } = userObject;
    return { user: userWithoutPassword as Partial<IUser>, token };
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): AuthPayload {
    try {
      return jwt.verify(token, config.jwtSecret) as AuthPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<IUser | null> {
    const user = await User.findById(id).select('-password');
    return user;
  }
  
  /**
   * Update user profile
   */
  async updateProfile(userId: string, profileData: Partial<IUser>): Promise<IUser | null> {
    // Don't allow updating sensitive fields
    delete profileData.password;
    delete profileData.role;
    
    // Update and return user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { ...profileData, updatedAt: new Date() },
      { new: true }
    ).select('-password');
    
    return updatedUser;
  }
  
  /**
   * Change password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    user.password = hashedPassword;
    user.updatedAt = new Date();
    await user.save();
    
    return true;
  }
}

export default new AuthService();
