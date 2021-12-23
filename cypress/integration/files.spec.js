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

describe('Files default view', function() {
	before(function () {
		// Init user
		cy.nextcloudCreateUser(randUser, 'password')

		// FIXME: files app is thowing the following error for some reason
		// Uncaught TypeError: Cannot read property 'protocol' of undefined
		// Same for appswebroots setting in tests
		cy.on('uncaught:exception', (err, runnable) => {
			return false
		})
	})
	beforeEach(function() {
		cy.login(randUser, 'password')
	})

	it('See the default files list', function() {
		cy.get('#fileList tr[data-file="welcome.txt"]', {timeout: 10000})
			.should('contain', 'welcome.txt')
	})

	it('Take screenshot', function() {
		cy.screenshot()
	})
})
