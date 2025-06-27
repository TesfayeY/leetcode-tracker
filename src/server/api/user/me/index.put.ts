import { defineEventHandler, readBody } from 'h3';
import { consola } from "consola"
import { changePassword, changeEmail, changeDisplayName } from '../../userService';

export default defineEventHandler(async (event) => {
    
        if (event.req.method !== 'PUT') {
            event.res.statusCode = 405;
            consola.error(event.res.statusCode + ':' + 'Method not allowed');
            throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
        }

        const body = await readBody(event);

        // Check if the request body contains the required fields
        if ('currentPassword' in body && 'newPassword' in body && 'confirmedNewPassword' in body) {

            return changePassword(event);

        } else if ('currentEmail' in body && 'newEmail' in body && 'confirmedNewEmail' in body) {

            return changeEmail(event);

        } else if ('newName' in body) {

            return changeDisplayName(event);
            
        } else {
            throw createError({ statusCode: 400, statusMessage: 'Invalid request' });
        }

    

});


