# -*- coding: utf-8 -*-

from setuptools import setup, find_packages
import os

version = '1.0'

setup(name='collective.formwidget.relationfield',
      version=version,
      description="Provides a widget for adding related items using configurable catalog queries",
      long_description=open("README").read() + "\n" +
                       open(os.path.join("docs", "HISTORY.txt")).read(),
      # Get more strings from
      # http://pypi.python.org/pypi?:action=list_classifiers
      classifiers=[
        "Development Status :: 3 - Alpha",
        "Framework :: Plone :: 4.1",
        "License :: OSI Approved :: GNU General Public License (GPL)",
        "Operating System :: OS Independent",
        "Programming Language :: JavaScript",
        "Programming Language :: Python",
        ],
      keywords='',
      author='Joaquin Rosales',
      author_email='globojorro@gmail.com',
      url='https://github.com/collective/collective.formwidget.relationfield',
      license='GPL',
      packages=find_packages(exclude=['ez_setup']),
      namespace_packages=['collective', 'collective.formwidget'],
      include_package_data=True,
      zip_safe=False,
      install_requires=[
        'setuptools',
        'z3c.formwidget.query',
        'plone.formwidget.autocomplete >= 1.2.0',
        'plone.z3cform >= 0.7.4',
      ],
      extras_require={
        'test': ['plone.app.testing'],
      },
      entry_points="""
      [z3c.autoinclude.plugin]
      target = plone
      """,
      )
