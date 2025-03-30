import { fail, redirect } from '@sveltejs/kit';
import type { ClientResponseError } from 'pocketbase';
import type { PageServerLoad } from './$types';

export const actions = {
	login: async ({ locals, request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');

		if (!email || !password) {
			return fail(400, { emailRequired: email === null, passwordRequired: password === null });
		}

		try {
			await locals.pb.collection('users').authWithPassword(email.toString(), password.toString());
		} catch (e) {
			const error = e as ClientResponseError;
			console.log(error);
			return fail(500, { fail: true, message: error.message });
		}

		console.log(locals.pb.authStore);
		console.log(locals.pb.authStore.exportToCookie());

		cookies.set('pb_auth', locals.pb.authStore.exportToCookie(), {
			path: '/',
			httpOnly: false,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production'
		});

		throw redirect(303, '/');
	}
};

export const load = (async ({ locals }) => {
	if (locals.pb.authStore.isValid) {
		return redirect(303, '/');
	}

	return {};
}) satisfies PageServerLoad;
