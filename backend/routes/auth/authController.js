import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function registerUser(req, res) {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
            },
        });
        res.status(201).json({ message: 'User Registered', user });
    } catch (error) {
        res.status(400).json({ error: 'Registration Failed', message: error.message });
    }
}

async function loginUser(req, res) {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
        where: { username },
    });

    if (!user) {
        return res.status(401).json({ message: 'Invalid User' });
    }
    
    const passwordCorrect = await bcrypt.compare(password, user.password);
    if (!passwordCorrect) {
        return res.status(401).json({ message: 'Incorrect Password' });
    }

    const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.status(201).json({ message: 'Login Success', token });
}

export { registerUser, loginUser };
