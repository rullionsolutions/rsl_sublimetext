#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sublime
import sublime_plugin
import re
import os

SETTINGS_FILE = 'RslCvs.sublime-settings'

class Rsl_CvsCommand(sublime_plugin.WindowCommand):

	def run(self, paths=[], cvs_args=[]):
		settings = sublime.load_settings(SETTINGS_FILE)
		if os.name == "posix":
			path = "/usr/local/bin:" + os.environ['PATH']
		else:
			path = os.environ['PATH']

		self.window.run_command('exec', {
			'cmd' : ['cvs'] + settings.get('options', cvs_args),
			'path': path,
			'working_dir': paths[0],
			'line_regex' : settings.get('line_regex', '.*'),
			'file_regex' : settings.get('file_regex', '(^[^# ]+.*$)')
		})


