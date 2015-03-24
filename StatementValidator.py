#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sublime
import sublime_plugin
import re
import os

EXEC_STATV = 'statv_exec'
SETTINGS_FILE = 'StatementValidator.sublime-settings'

class StatvExecCommand(sublime_plugin.WindowCommand):

	def run(self, files=[], paths=[]):
		settings = sublime.load_settings(SETTINGS_FILE)
		if os.name == "posix":
			path = "/usr/local/bin:" + os.environ['PATH']
		else:
			path = os.environ['PATH']

		if paths:
			files = paths
#		self.window.new_file()
#		self.window.run_command('show_panel', { 'panel': "output.stevie" })
#		self.window.run_command('append', { 'characters': "Stevie's Statement Validator!" })
#		self.window.run_command('append', { 'characters': paths[0] })
		self.window.run_command('exec', {
			'cmd':
				list(map(os.path.expanduser, settings.get('statv', ['node', sublime.packages_path() + '/RSL/statement_validator.js']))) +
				settings.get('options', []) +
				files,
			'path': path,
			'line_regex': settings.get('line_regex', '.*'),
			'file_regex': settings.get('file_regex', '(^[^# ]+.*$)')
		})


class StatvOnSave(sublime_plugin.EventListener):

	def on_post_save(self, view):
		settings = sublime.load_settings(SETTINGS_FILE)
		if settings.get('run_on_save', False) == False:
			return
		if re.search(settings.get('filename_filter'), view.file_name()):
			view.window().run_command(EXEC_LINT, {
				'files': [view.file_name()]
			})


# Support calls to the old API of the JSLint package.

class StatvCommand(sublime_plugin.WindowCommand):

	def run(self):
		self.window.run_command(EXEC_STATV, {
			'files': [self.window.active_view().file_name()]
		})
