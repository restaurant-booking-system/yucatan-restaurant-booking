import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    reservationsCount: number;
    favoriteRestaurants: string[];
    createdAt: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database
const mockUsers: (User & { password: string })[] = [
    {
        id: 'user-1',
        name: 'Juan García',
        email: 'juan@email.com',
        phone: '+52 999 123 4567',
        avatar: '',
        reservationsCount: 12,
        favoriteRestaurants: ['1', '3'],
        createdAt: '2024-01-15',
        password: '123456'
    },
    {
        id: 'user-2',
        name: 'María López',
        email: 'maria@email.com',
        phone: '+52 999 234 5678',
        avatar: '',
        reservationsCount: 5,
        favoriteRestaurants: ['2'],
        createdAt: '2024-02-01',
        password: '123456'
    }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('mesafeliz_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem('mesafeliz_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const foundUser = mockUsers.find(u => u.email === email && u.password === password);

        if (foundUser) {
            const { password: _, ...userWithoutPassword } = foundUser;
            setUser(userWithoutPassword);
            localStorage.setItem('mesafeliz_user', JSON.stringify(userWithoutPassword));
            return true;
        }
        return false;
    };

    const register = async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if email already exists
        if (mockUsers.find(u => u.email === email)) {
            return false;
        }

        const newUser: User = {
            id: `user-${Date.now()}`,
            name,
            email,
            phone,
            avatar: '',
            reservationsCount: 0,
            favoriteRestaurants: [],
            createdAt: new Date().toISOString().split('T')[0]
        };

        // In a real app, this would save to backend
        mockUsers.push({ ...newUser, password });
        setUser(newUser);
        localStorage.setItem('mesafeliz_user', JSON.stringify(newUser));
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('mesafeliz_user');
    };

    const updateUser = (updates: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...updates };
            setUser(updatedUser);
            localStorage.setItem('mesafeliz_user', JSON.stringify(updatedUser));
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            logout,
            updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
