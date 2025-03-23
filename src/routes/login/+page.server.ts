import { fail, redirect } from '@sveltejs/kit';
import type { ClientResponseError } from 'pocketbase';
import type { PageServerLoad } from './$types';

export const actions = {
	register: async ({ locals, request }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');

		if (!email || !password) {
			return fail(400, { emailRequired: email === null, passwordRequired: password === null });
		}

		data.set('passwordConfirm', password?.toString());

		try {
			await locals.pb.collection('users').create(data);
			await locals.pb.collection('users').authWithPassword(email, password.toString());
			await locals.pb.collection('users').requestVerification(email);
		} catch (e) {
			const error = e as ClientResponseError;
			return fail(500, { fail: true, message: error.message });
		}

		throw redirect(303, '/dashboard');
	},

	login: async ({ locals, request }) => {
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
			return fail(500, { fail: true, message: error.message });
		}

		throw redirect(303, '/dashboard');
	},

	reset: async ({ locals, request }) => {
		const data = await request.formData();
		const email = data.get('email');

		if (!email) {
			return fail(400, { emailRequired: email === null });
		}

		try {
			await locals.pb.collection('users').requestPasswordReset(email.toString());
		} catch (e) {
			const error = e as ClientResponseError;
			return fail(500, { fail: true, message: error.message });
		}

		throw redirect(303, '/login');
	}
};

export const load = (async ({ locals }) => {
	if (locals.pb.authStore.model) {
		return redirect(303, '/dashboard');
	}

	return {};
}) satisfies PageServerLoad;
