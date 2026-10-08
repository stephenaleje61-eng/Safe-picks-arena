import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { storage } from '../storage.js';
import { User, Session } from '../types.js';

export const authRouter = Router();

// Middleware to extract auth user
export function getAuthenticatedUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7).trim();
  const session = storage.findSession(token);
  if (!session) return null;
  return storage.findUserById(session.userId) || null;
}

// 1. REGISTER
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check existing email
    const existingEmail = storage.findUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Check existing username
    const existingUsername = storage.findUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ error: 'This username is already taken. Please pick another.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // If email matches site owner or admin domain, auto-grant admin
    const isAdmin = email.toLowerCase() === 'phscspractical@gmail.com' || email.toLowerCase().endsWith('@safepicksarena.com');

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: email.trim().toLowerCase(),
      username: username.trim(),
      passwordHash,
      role: isAdmin ? 'admin' : 'user',
      isVerified: false,
      verificationToken,
      bio: 'Sports enthusiast & tactical predictor',
      createdAt: new Date().toISOString(),
    };

    storage.createUser(newUser);

    // Create session token so user can begin immediately, with notice to verify
    const token = crypto.randomBytes(32).toString('hex');
    storage.createSession({
      token,
      userId: newUser.id,
      createdAt: Date.now(),
    });

    // Create welcome notification
    storage.addNotification({
      id: `notif_${Date.now()}`,
      userId: newUser.id,
      type: 'system',
      title: 'Welcome to SAFE PICKS ARENA!',
      content: `Verification token generated: ${verificationToken}. Click Verify Email in your profile to complete account verification.`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({
      message: 'Account created successfully. Please verify your email.',
      token,
      verificationToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        isVerified: newUser.isVerified,
        bio: newUser.bio,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// 2. LOGIN
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = storage.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    storage.createSession({
      token,
      userId: user.id,
      createdAt: Date.now(),
    });

    return res.json({
      message: 'Signed in successfully.',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isVerified: user.isVerified,
        bio: user.bio,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// 3. VERIFY EMAIL
authRouter.post('/verify-email', (req: Request, res: Response) => {
  const { token, email } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Verification code is required.' });
  }

  let user: User | undefined;
  if (email) {
    user = storage.findUserByEmail(email);
  } else {
    const authUser = getAuthenticatedUser(req);
    if (authUser) user = authUser;
  }

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (user.isVerified) {
    return res.json({ message: 'Account is already verified.' });
  }

  if (user.verificationToken !== token) {
    return res.status(400).json({ error: 'Invalid verification token.' });
  }

  storage.updateUser(user.id, {
    isVerified: true,
    verificationToken: undefined,
  });

  return res.json({ message: 'Email verified successfully! Your account is now fully active.' });
});

// 4. FORGOT PASSWORD
authRouter.post('/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const user = storage.findUserByEmail(email);
  if (!user) {
    // For security, do not leak whether email exists
    return res.json({ message: 'If this email exists in our records, a password recovery code has been generated.' });
  }

  const resetToken = crypto.randomBytes(16).toString('hex');
  const expires = Date.now() + 1000 * 60 * 60; // 1 hour

  storage.updateUser(user.id, {
    resetPasswordToken: resetToken,
    resetPasswordExpires: expires,
  });

  return res.json({
    message: 'Password reset code has been sent.',
    recoveryToken: resetToken, // returned for verification flow
    expiresInMinutes: 60,
  });
});

// 5. RESET PASSWORD
authRouter.post('/reset-password', (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Reset token and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  const users = storage.getUsers();
  const user = users.find(
    u => u.resetPasswordToken === token && (u.resetPasswordExpires || 0) > Date.now()
  );

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired reset token.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(newPassword, salt);

  storage.updateUser(user.id, {
    passwordHash,
    resetPasswordToken: undefined,
    resetPasswordExpires: undefined,
  });

  return res.json({ message: 'Password has been reset successfully. You can now log in.' });
});

// 6. ME
authRouter.get('/me', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const friends = storage.getFriendships(user.id).filter(f => f.status === 'accepted');
  const unreadNotes = storage.getNotifications(user.id).filter(n => !n.isRead);

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isVerified: user.isVerified,
      bio: user.bio,
      verificationToken: user.isVerified ? undefined : user.verificationToken,
      friendsCount: friends.length,
      unreadNotificationsCount: unreadNotes.length,
    },
  });
});

// 7. TOGGLE / ELEVATE ADMIN ROLE (Admin control & development authorization)
authRouter.post('/toggle-admin', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const newRole = user.role === 'admin' ? 'user' : 'admin';
  storage.updateUser(user.id, { role: newRole });

  return res.json({
    message: `Role updated to ${newRole}`,
    role: newRole,
  });
});

// 8. LOGOUT
authRouter.post('/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    storage.removeSession(token);
  }
  return res.json({ message: 'Logged out successfully.' });
});
