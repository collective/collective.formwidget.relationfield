# -*- coding: utf-8 -*-

from zope.component import getMultiAdapter
from zope.app.pagetemplate.viewpagetemplatefile import ViewPageTemplateFile
from zope.interface import implementer
from zope.i18n import translate

from plone.app.layout.navigation.interfaces import INavtreeStrategy
from plone.app.layout.navigation.navtree import buildFolderTree
from plone.formwidget.contenttree.widget import MultiContentTreeWidget
import z3c.form.interfaces
import z3c.form.widget
from z3c.form import field

from collective.formwidget.relationfield import _


class ContentRelationWidget(MultiContentTreeWidget):
    display_template = ViewPageTemplateFile('related_display.pt')
    input_template = ViewPageTemplateFile('related_input.pt')
    recurse_template = ViewPageTemplateFile('related_recurse.pt')

    def render_tree(self, relPath=None, query=None, limit=10):
        content = self.context
        portal_state = getMultiAdapter((self.context, self.request),
                                          name=u'plone_portal_state')
        portal = portal_state.portal()
        source = self.bound_source
        if query is not None:
            source.navigation_tree_query = query
        strategy = getMultiAdapter((portal, self), INavtreeStrategy)
        if relPath is not None:
            root_path = portal_state.navigation_root_path()
            rel_path = root_path + '/' + relPath
            strategy.rootPath = rel_path
        data = buildFolderTree(portal,
                               obj=portal,
                               query=source.navigation_tree_query,
                               strategy=strategy)

        return self.recurse_template(
                                    children=data.get('children', [])[:limit],
                                    level=1)

    def js_extra(self):
        form_url = self.request.getURL()
        url = "%s/++widget++%s/@@contenttree-fetch" % (form_url, self.name)

        return """\

                $('#%(id)s-widgets-query').each(function() {
                    if($(this).siblings('input.searchButton').length > 0) { return; }
                    $(document.createElement('input'))
                        .attr({
                            'type': 'button',
                            'value': '%(button_val)s'
                        })
                        .addClass('searchButton')
                        .click( function () {
                            var parent = $(this).parents("*[id$='-autocomplete']")
                            var window = parent.siblings("*[id$='-contenttree-window']")
                            window.showDialog();
                        }).insertAfter($(this));
                });
                $('#%(id)s-contenttree-window').find('.contentTreeAdd').unbind('click').click(function () {
                    $(this).contentTreeAdd();
                });
                $('#%(id)s-contenttree-window').find('.contentTreeCancel').unbind('click').click(function () {
                    $(this).contentTreeCancel();
                });
                $('#%(id)s-widgets-query').after(" ");
                $('#%(id)s-contenttree').contentTree(
                    {
                        script: '%(url)s',
                        folderEvent: '%(folderEvent)s',
                        selectEvent: '%(selectEvent)s',
                        expandSpeed: %(expandSpeed)d,
                        collapseSpeed: %(collapseSpeed)s,
                        multiFolder: %(multiFolder)s,
                        multiSelect: %(multiSelect)s,
                    },
                    function(event, selected, data, title) {
                        // alert(event + ', ' + selected + ', ' + data + ', ' + title);
                    }
                );
        """ % dict(url=url,
                   id=self.name.replace('.', '-'),
                   folderEvent=self.folderEvent,
                   selectEvent=self.selectEvent,
                   expandSpeed=self.expandSpeed,
                   collapseSpeed=self.collapseSpeed,
                   multiFolder=str(self.multiFolder).lower(),
                   multiSelect=str(self.multi_select).lower(),
                   name=self.name,
                   klass=self.klass,
                   title=self.title,
                   button_val=translate(
                       u'heading_contenttree_browse',
                       default=u'Browse for items',
                       domain='collective.formwidget.relationfield',
                       context=self.request))
#                   button_val=_(u'browse...'))


@implementer(z3c.form.interfaces.IFieldWidget)
def ContentRelationFieldWidget(field, request):
    return z3c.form.widget.FieldWidget(field,
                                      ContentRelationWidget(request))
