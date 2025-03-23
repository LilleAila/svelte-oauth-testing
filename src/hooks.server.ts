import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/private';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { redirect } from '@sveltejs/kit';

export const authentication: Handle = async ({ event, resolve }) => {
	event.locals.pb = new PocketBase(env.PB_URL);

	event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

	try {
		if (event.locals.pb.authStore.isValid) event.locals.pb.collection('users').authRefresh();
	} catch {
		event.locals.pb.authStore.clear();
	}

	const response = await resolve(event);

	response.headers.append('set-cookie', event.locals.pb.authStore.exportToCookie());

	return response;
};

const unprotectedPrefix = ['/login'];
export const authorization: Handle = async ({ event, resolve }) => {
	if (
		!unprotectedPrefix.some((path) => event.url.pathname.startsWith(path)) &&
		event.url.pathname !== '/'
	) {
		const loggedIn = event.locals.pb.authStore?.isValid;
		if (!loggedIn) {
			throw redirect(303, '/login');
		}
	}

	return await resolve(event);
};

export const handle = sequence(authentication, authorization);
