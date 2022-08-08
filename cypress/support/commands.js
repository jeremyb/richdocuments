/**
 * @copyright Copyright (c) 2019 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import axios from '@nextcloud/axios'

const url = Cypress.config('baseUrl').replace(/\/index.php\/?$/g, '')
Cypress.env('baseUrl', url)

Cypress.Commands.add('login', (user, password, route = '/apps/files') => {
	cy.session(user, function () {
		cy.visit(route)
		cy.get('input[name=user]').type(user)
		cy.get('input[name=password]').type(password)
		cy.get('[type=submit]').click()
		cy.url().should('include', route)
	})
	// in case the session already existed but we are on a different route...
	cy.visit(route)
})

Cypress.Commands.add('logout', (route = '/') => {
	cy.session('_guest', function () {
	})
})

Cypress.Commands.add('nextcloudCreateUser', (user, password) => {
	cy.clearCookies()
	cy.request({
		method: 'POST',
		url: `${Cypress.env('baseUrl')}/ocs/v1.php/cloud/users?format=json`,
		form: true,
		body: {
			userid: user,
			password: password,
			language: 'en',
		},
		auth: { user: 'admin', pass: 'admin' },
		headers: {
			'OCS-ApiRequest': 'true',
			'Content-Type': 'application/x-www-form-urlencoded',
		}
	}).then(response => {
		cy.log(`Created user ${user}`, response.status)
	})
})

Cypress.Commands.add('nextcloudUpdateUser', (user, password, key, value) => {
	cy.request({
		method: 'PUT',
		url: `${Cypress.env('baseUrl')}/ocs/v2.php/cloud/users/${user}`,
		form: true,
		body: { key, value },
		auth: { user, pass: password },
		headers: {
			'OCS-ApiRequest': 'true',
			'Content-Type': 'application/x-www-form-urlencoded',
		}
	}).then(response => {
		cy.log(`Updated user ${user} ${key} to ${value}`, response.status)
	})
})

Cypress.Commands.add('nextcloudDeleteUser', (user) => {
	cy.clearCookies()
	cy.request({
		method: 'DELETE',
		url: `${Cypress.env('baseUrl')}/ocs/v1.php/cloud/users/${user}`,
		form: true,
		auth: { user: 'admin', pass: 'admin' },
		headers: {
			'OCS-ApiRequest': 'true',
			'Content-Type': 'application/x-www-form-urlencoded',
		}
	}).then(response => {
		cy.log(`Deleted user ${user}`, response.status)
	})
})

Cypress.Commands.add('uploadFile', (fileName, mimeType, target) => {
	cy.fixture(fileName, 'base64')
		.then(Cypress.Blob.base64StringToBlob)
		.then(async blob => {
			const file = new File([blob], fileName, { type: mimeType })
			if (typeof target !== 'undefined') {
				fileName = target
			}
			await cy.window().then(async window => {
				await axios.put(`${Cypress.env('baseUrl')}/remote.php/webdav/${fileName}`, file, {
					headers: {
						requesttoken: window.OC.requestToken,
						'Content-Type': mimeType
					}
				}).then(response => {
					cy.log(`Uploaded ${fileName}`, response.status)
				})
			})
		})
})

Cypress.Commands.add('createFolder', dirName => {
	cy.get('.files-controls .actions > .button.new').click()
	cy.get('.files-controls .actions .newFileMenu a[data-action="folder"]').click()
	cy.get('.files-controls .actions .newFileMenu a[data-action="folder"] input[type="text"]').type(dirName)
	cy.get('.files-controls .actions .newFileMenu a[data-action="folder"] input.icon-confirm').click()
	cy.log('Created folder', dirName)
})

Cypress.Commands.add('openFile', fileName => {
	cy.get(`.files-filestable:visible tr[data-file="${fileName}"] a.name`).click()
	cy.wait(250)
})

Cypress.Commands.add('deleteFile', fileName => {
	cy.get(`.files-filestable:visible tr[data-file="${fileName}"] a.name .action-menu`).click()
	cy.get(`.files-filestable:visible tr[data-file="${fileName}"] a.name + .popovermenu .action-delete`).click()
})

Cypress.Commands.add('iframe', { prevSubject: 'element' }, $iframe => {
	return $iframe.contents().find('body')
})

Cypress.Commands.add('nextcloudEnableApp', (appId) => {
	return;
	cy.getCookie('nc_username').then((previousUser) => {
		if (previousUser?.value) {
			cy.login('admin', 'admin')
		}
		cy.request({
			method: 'POST',
			url: `${Cypress.env('baseUrl')}/ocs/v1.php/cloud/apps/${appId}?format=json`,
			form: true,
			auth: { user: 'admin', pass: 'admin' },
			headers: {
				'OCS-ApiRequest': 'true',
				'Content-Type': 'application/x-www-form-urlencoded',
			}
		}).then(response => {
			cy.log(`Enabled app ${appId}`, response.status)
			if (previousUser?.value) {
				cy.login(previousUser.value, 'password')
			}
		})
	})
})

Cypress.Commands.add('nextcloudTestingAppConfigSet', (appId, configKey, configValue) => {
	return;
	cy.getCookie('nc_username').then((previousUser) => {
		cy.log(nc_username?.value)
		if (previousUser?.value) {
			cy.login('admin', 'admin')
		}
		cy.request({
			method: 'POST',
			url: `${Cypress.env('baseUrl')}/ocs/v1.php/apps/testing/api/v1/app/${appId}/${configKey}?format=json`,
			auth: { user: 'admin', pass: 'admin' },
			headers: {
				'OCS-ApiRequest': 'true',
				'Cookie': '',
			},
			body: {
				value: configValue,
			}
		}).then(response => {
			cy.log(`Set app value app ${appId} ${configKey} ${configValue}`, response.status)
			if (previousUser?.value) {
				cy.login(previousUser.value, 'password')
			}
		})
	})
})

