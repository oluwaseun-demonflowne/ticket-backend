import { db } from "$/db/connect";
import { userSchema, type UserSchema } from "$/db/schema/user";
import ErrorHandler from "$/utils/errorHandler";
import { setTokens } from "$/utils/token";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { type NextFunction, type Request, type Response } from "express";

type LoginData = UserSchema & { mode: "signIn" };

export async function loginUser(
    request: Request<object, object, LoginData, object>,
    response: Response,
    next: NextFunction
): Promise<void> {
    const { email, password } = request.body;
    const user = await db
        .select()
        .from(userSchema)
        .where(eq(userSchema.email, email))
        .then((users) => users[0]);

    if (!user) {
        return next(new ErrorHandler("Invalid Email/Password", 400));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        console.log("Invalid password.");
        return next(new ErrorHandler("Invalid Email/Password", 400));
    }

    setTokens(user, response);

    response.status(200).json({ message: "Login successgul!" });
}
