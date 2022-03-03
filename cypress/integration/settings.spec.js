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

import { randHash } from '../utils/'
const randUser = randHash()

const usesHttps = Cypress.env('baseUrl').substr(0, 5) === 'https'
const collaboraUrl= Cypress.env('collaboraUrl')

describe('Files default view', function() {
	before(function() {
	})
	beforeEach(function () {
		cy.login('admin', 'admin', '/settings/admin/richdocuments')
		cy.intercept({
		  method: 'POST',
		  url: '/index.php/apps/richdocuments/ajax/admin.php',
		}).as('updateSettings');
	})

	it('Opens settings', function() {
		cy.scrollTo('topLeft')

		cy.get('#app-content')
			.scrollIntoView()
			.should('be.visible')
		cy.screenshot()
		cy.get('#wopi_url')
			.clear()
			.type(collaboraUrl + '{enter}')
		cy.wait('@updateSettings').its('response.statusCode').should('equal', 200)
		cy.get('#security-warning-state-ok .message')
			.should('be.visible')
			.should('contain.text', 'Collabora Online server is reachable.')
		cy.screenshot()

		cy.get('#advanced-settings')
			.scrollIntoView()
			.should('be.visible')
		cy.get('#secure-view-settings')
			.scrollIntoView()
			.should('be.visible')

		// FIXME: Template settings only get visible after reload
		cy.reload()
		cy.get('#richdocuments-templates')
			.scrollIntoView()
			.should('be.visible')

	})

	it('Error for invalid url', function() {
		cy.get('#app-content')
			.scrollIntoView()
			.should('be.visible')
		cy.screenshot()
		cy.get('#wopi_url')
			.clear()
			.type((usesHttps ? 'https' : 'http') + '://invalid.example.com{enter}')
		cy.wait('@updateSettings').its('response.statusCode').should('equal', 500)
		cy.get('#security-warning-state-failure .message')
			.should('be.visible')
			.should('contain.text', 'Could not establish connection to the Collabora Online server.')
		cy.screenshot()
	})
})
