import { randHash } from '../utils/'
const shareOwner = randHash()
const shareRecipient = randHash()

describe('Open test.md in viewer', function() {

	before(function () {
		cy.login('admin', 'admin')
		cy.nextcloudEnableApp('testing')
		// Init user
		cy.nextcloudCreateUser(shareOwner, 'password')
		cy.login(shareOwner, 'password')

		// FIXME: files app is thowing the following error for some reason
		// Uncaught TypeError: Cannot read property 'protocol' of undefined
		// Same for appswebroots setting in tests
		cy.on('uncaught:exception', (err, runnable) => {
			return false
		})
		cy.uploadFile('document.odt', 'application/vnd.oasis.opendocument.text')
		cy.uploadFile('spreadsheet.ods', 'application/vnd.oasis.opendocument.spreadsheet')
		cy.uploadFile('presentation.odp', 'application/vnd.oasis.opendocument.presentation')
		cy.uploadFile('drawing.odg', 'application/vnd.oasis.opendocument.drawing')
	})
	beforeEach(function() {
		cy.login(shareOwner, 'password')
	})

	const fileTests = ['document.odt', 'presentation.odp', 'spreadsheet.ods', 'drawing.odg']
	fileTests.forEach((filename) => {

		it('Classic UI: Open ' + filename + ' the viewer on file click', function() {
			cy.nextcloudTestingAppConfigSet('richdocuments', 'uiDefaults-UIMode', 'classic');
			cy.login(shareOwner, 'password')

			cy.visit('/apps/files', {
				onBeforeLoad(win) {
					cy.spy(win, 'postMessage').as('postMessage')
				},
			})
			cy.openFile(filename)

			cy.get('#viewer', { timeout: 15000 })
				.should('be.visible')
				.and('have.class', 'modal-mask')
				.and('not.have.class', 'icon-loading')

			cy.get('#collaboraframe').iframe().should('exist').as('collaboraframe')
			cy.get('@collaboraframe').within(() => {
				cy.get('#loleafletframe').iframe().should('exist').as('loleafletframe')
			})

			cy.get('@loleafletframe').find('#main-document-content').should('exist')

			// FIXME: wait for collabora to load (sidebar to be hidden)
			// FIXME: handle welcome popup / survey

			cy.screenshot('open-file_' + filename)

			// Share action
			cy.get('@loleafletframe').within(() => {
				cy.get('#main-menu #menu-file > a').click()
				cy.get('#main-menu #menu-shareas > a').click()
			})

			cy.get('#app-sidebar-vue')
				.should('be.visible')
			cy.get('.app-sidebar-header__maintitle')
				.should('be.visible')
				.should('contain.text', filename)
			// FIXME: wait for sidebar tab content
			// FIXME: validate sharing tab
			cy.screenshot('share-sidebar_' + filename)

			// Validate closing
			cy.get('@loleafletframe').within(() => {
				cy.get('#closebutton').click()
			})
			cy.get('#viewer', { timeout: 5000 }).should('not.exist')
		})

		it('Notebookbar UI: Open ' + filename + ' the viewer on file click', function() {
			cy.nextcloudTestingAppConfigSet('richdocuments', 'uiDefaults-UIMode', 'notebookbar');
			cy.login(shareOwner, 'password')

			cy.visit('/apps/files', {
				onBeforeLoad(win) {
					cy.spy(win, 'postMessage').as('postMessage')
				},
			})
			cy.openFile(filename)

			cy.get('#viewer', { timeout: 15000 })
				.should('be.visible')
				.and('have.class', 'modal-mask')
				.and('not.have.class', 'icon-loading')

			cy.get('#collaboraframe').iframe().should('exist').as('collaboraframe')
			cy.get('@collaboraframe').within(() => {
				cy.get('#loleafletframe').iframe().should('exist').as('loleafletframe')
			})

			cy.get('@loleafletframe').find('#main-document-content').should('exist')

			// FIXME: wait for collabora to load (sidebar to be hidden)
			// FIXME: handle welcome popup / survey

			cy.screenshot('open-file_' + filename)

			// Share action
			cy.get('@loleafletframe').within(() => {
				cy.get('button.icon-nextcloud-sidebar').click()
			})

			cy.get('#app-sidebar-vue')
				.should('be.visible')
			cy.get('.app-sidebar-header__maintitle')
				.should('be.visible')
				.should('contain.text', filename)
			// FIXME: wait for sidebar tab content
			// FIXME: validate sharing tab
			cy.screenshot('share-sidebar_' + filename)

			// Validate closing
			cy.get('@loleafletframe').within(() => {
				cy.get('#closebutton').click()
			})
			cy.get('#viewer', { timeout: 5000 }).should('not.exist')
		})

	})
})
