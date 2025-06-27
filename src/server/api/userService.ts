import { readBody, parseCookies, H3Event } from 'h3';
import bcrypt from 'bcrypt';
import prisma from '../../database/db';
import { createJwtToken, extractUserIdFromToken } from '../../jwt';

export async function changeDisplayName(event: H3Event) {
    const body = await readBody(event);
    const { newName } = body;

    if (!newName) {
        throw createError({statusCode: 400, statusMessage:'Missing fields'});
    }

    const cookies = parseCookies(event);
    const extractedUserId = await extractUserIdFromToken(cookies.token);
    const userId = extractedUserId !== null ? extractedUserId : undefined;

    if (userId === undefined) {
        throw createError({statusCode: 401, statusMessage:'Invalid user'});
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        throw createError({statusCode: 401, statusMessage:'Invalid user'});
    }

    if (newName === user.name) {
        throw createError({statusCode: 400, statusMessage:'Name is already in use'});
    }

    await prisma.user.update({ where: { id: userId }, data: { name: newName } });

    const newToken = await createJwtToken(user.id);
    setCookie(event, 'token', newToken);
    setCookie(event, 'name', newName);

    return { message: 'Name changed successfully', newName };
}


export async function changeEmail(event: H3Event) {

    const body = await readBody(event);

    const { currentEmail, newEmail, confirmedNewEmail } = body;

    // Validate presence of all required fields
    if (!currentEmail || !newEmail || !confirmedNewEmail) {
        throw createError({statusCode: 400, statusMessage:'Missing fields'});
    }

    // Check if newEmail and confirmedNewEmail match
    if (newEmail !== confirmedNewEmail) {
        throw createError({statusCode: 400, statusMessage:'Emails do not match'});
    }
    
    // Parse the cookies from the request headers
    const cookies = parseCookies(event);
    const extractedUserId = await extractUserIdFromToken(cookies.token);
    const userId = extractedUserId !== null ? extractedUserId : undefined;

    if (userId === undefined) {
        throw createError({statusCode: 401, statusMessage:'Invalid user'});
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    console.log(userId);

    // Check if user exists
    if (!user) {
        throw createError({statusCode: 401, statusMessage:'Invalid user'});
    }

    // Compare currentEmail with the email stored in the database
    const isEmailValid = currentEmail === user.email;        

    if (!isEmailValid) {
        throw createError({statusCode: 400, statusMessage:'Invalid email'});
    }

    // Check if the new email is already being used by another user
    const emailInUse = await prisma.user.findUnique({
        where: { email: newEmail },
    });

    if (emailInUse) {
        throw createError({statusCode: 400, statusMessage:'Email is already in use'});
    }

    // Update user's email in the database
    await prisma.user.update({
        where: { id: userId },
        data: { email: confirmedNewEmail },
    });

    setCookie(event, "token", "", { maxAge: -1 }); // Correctly remove the token cookie
    setCookie(event, "user", "", { maxAge: -1 }); // Correctly remove the user cookie

    return { message: 'Email changed successfully',
            success: false
    }
    
};

export async function changePassword(event: H3Event) { 

    const body = await readBody(event);

    const { currentPassword, newPassword, confirmedNewPassword } = body;

    // Validate presence of all required fields
    if (!currentPassword || !newPassword || !confirmedNewPassword) {
        throw createError({statusCode: 400, statusMessage:'Missing fields'});
    }

    // Check if newPassword and confirmedNewPassword match
    if (newPassword !== confirmedNewPassword) {
        throw createError({statusCode: 400, statusMessage:'Passwords do not match'});
    }

    //Parse the cookies from the request headers
    const cookies = parseCookies(event);
    const extractedUserId = await extractUserIdFromToken(cookies.token);
    const userId = extractedUserId !== null ? extractedUserId : undefined;

    if (userId === undefined) {
        throw createError({statusCode: 401, statusMessage:'Invalid user'});
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    // Check if user exists
    if (!user) {
        throw createError({statusCode: 401, statusMessage:'Invalid user'});
    }

    // Verify current password with the hashed password stored in the database
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
        throw createError({statusCode: 400, statusMessage:'Invalid password'});
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password in the database
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
    });

    setCookie(event, "token", "", { maxAge: -1 }); // Correctly remove the token cookie
    setCookie(event, "user", "", { maxAge: -1 }); // Correctly remove the user cookie

    return { message: 'Password changed successfully' };
    
};

export async function deleteAccount(event: H3Event) {

    const body = await readBody(event);

    const { email, password, confirmedPassword } = body;

    // Validate presence of all required fields
    if (!email || !password || !confirmedPassword) {
        throw createError({statusCode: 400, statusMessage:'Missing fields'});
    }

    // Check if currentPassword and confirmedCurrentPassword match
    if (password !== confirmedPassword) {
        throw createError({statusCode: 400, statusMessage:'Passwords do not match'});
    }

    // Parse the cookies from the request headers
    const cookies = parseCookies(event);
    const extractedUserId = await extractUserIdFromToken(cookies.token);
    const userId = extractedUserId !== null ? extractedUserId : undefined;

    if (userId === undefined) {
        throw createError({statusCode: 401, statusMessage:'Invalid user'});
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    // Check if user exists
    if (!user) {
        throw createError({statusCode: 401, statusMessage:'Invalid user'});
    }

    if (user.email !== email ) {
        throw createError({statusCode: 400, statusMessage:'Invalid email'});
    }

    // Compare email with the email stored in the database
    const isEmailValid = email === user.email;

    if (!isEmailValid) {
        throw createError({statusCode: 401, statusMessage:'Invalid email'});
    }

    // Verify current password with the hashed password stored in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw createError({statusCode: 401, statusMessage:'Invalid password'});
    }

    // Delete user from the database
    await prisma.user.delete({
        where: { id: userId },
    });

    setCookie(event, "token", "", { maxAge: -1 }); // Correctly remove the token cookie
    setCookie(event, "user", "", { maxAge: -1 }); // Correctly remove the user cookie

    return { message: 'Account deleted successfully' };
};
