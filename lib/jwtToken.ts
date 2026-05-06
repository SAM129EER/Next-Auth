import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET!;

export const generateToken = (userId: string) => {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1d" });
  return token;
};
export const verifyToken = (token: string) => {
 try{
  return jwt.verify(token, JWT_SECRET) as {userId : string};
 }catch{
   return null;
 }
};
