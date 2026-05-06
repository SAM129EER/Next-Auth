import {z} from 'zod';

export const signupSchema = z.object(
    {
        first: z.string().min(1, "First name is required"),
        last: z.string().min(1, "Last name is required"),
        email: z.string().email("Invalid email address"),   
        password: z.string().min(6, "Password must be at least 6 characters"),  
        confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
    }
).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export const loginSchema = z.object(
    {
        email: z.string().email("Invalid email address"),   
        password: z.string().min(6, "Password must be at least 6 characters"),  
    }
)