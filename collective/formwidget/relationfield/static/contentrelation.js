// This is based on jQueryFileTree by   Cory S.N. LaViska
jq(function() {
    //jq('li.draggable').draggable({containment: ".contenttreeDroppable", snap: true, revert: true});
    jq('.contenttreeWidget .navTree, #content-droppable').sortable({revert: true});
    jq('#content-droppable').droppable({
        //accept: "div.draggable",
        accept: ".navTree li.draggable",
        activeClass: "ui-state-hover",
        hoverClass: "ui-state-active",
        drop: function(event, ui) {
            //jq(this).addClass("ui-state-highlight");
            var $dragged = ui.draggable;
            copyToDroppable( $dragged );
        }
    });
    function copyToDroppable( $item ) {
        var $droppable = jq('#content-droppable');
        var link = $item.find("a").attr("href")
        var txt = "";
        txt += $item.find("a span").text();
        jq($item).addClass('navTreeCurrentItem');
        jq($item).removeClass("draggable");
        var $newli = jq("<li class='draggable ui-widget-content' />");
        var $newh3 = jq("<h3 class='ui-widget-header' />");
        var $newa = jq("<a class='ui-widget-content' />");
        var $del = jq("<a class='ui-icon ui-icon-trash' href='' />");
        $newa.attr('href', $item.find('a').attr('href'));
        $newh3.text($item.find('h3').text());
        $newh3.appendTo($newli);
        $newa.text(txt);
        $newa.appendTo($newli);
        $del.appendTo($newli);
        $newli.appendTo($droppable);
    }
    function removeFromDroppable( $item ) {
        var $dropping = jq('#content-droppable');
        var $listing = jq('.contenttreeWidget .navTree');
        var $item_href = $item.find('a.ui-widget-content').attr('href');
        var $listing_item = $('.contenttreeWidget a@[href='+$item_href+']').parent();
        $listing_item.removeClass('navTreeCurrentItem');
        $listing_item.addClass("draggable");
        $item.remove();
    }
    var $listing = jq('#sortable-container');
    jq('.contenttreeWidget .navTree li').draggable({
        //containment: "#sortable-container",
        //connectToSortable: "#content-droppable",
        helper: "clone",
        revert: "invalid"
    });
    jq('ul#content-droppable').unbind('click').click(function(event) {
        var $item = jq(this);
        var $target = jq(event.target);
        var $parent = jq($target).parent();

        if ( $target.is("a.ui-icon-trash") ) {
            removeFromDroppable($parent);
            return false
            }
        if ( $target.is("a.ui-widget-content") ) {
            return false
            }
    });
});

if(jQuery) (function($){
    
    $.extend($.fn, {
        showDialog: function() {
            $(document.body).append($(document.createElement("div")).addClass("contenttreeWindowBlocker"))
            this[0].oldparent = $(this).parent()[0]; // store old parent element
            $(".contenttreeWindowBlocker").before(this);
            $(this).show();
            $(this).width($(window).width() * 0.75);
            $(this).height($(window).height() * 0.75);
            $(this).css({
                'left': $(window).width() * 0.125,
                'top': $(window).height() * 0.125
            })
        },
        contentTreeAdd: function() {
            var contenttree_window = (this).parents(".contenttreeWindow");
            var input_box = $('#'+ contenttree_window[0].id.replace(/-contenttree-window$/,"-widgets-query"));
            contenttree_window.find('.navTreeCurrentItem > a').each(function () {
                formwidget_autocomplete_new_value(input_box,$(this).attr('href'),$.trim($(this).text()));
            });

            $(this).contentTreeCancel();
        },
        contentTreeCancel: function() {
            $(".contenttreeWindowBlocker").remove();
            var popup = $(this).parents(".contenttreeWindow");
            popup.hide();
            $(popup[0].oldparent).append(popup);
            popup[0].oldparent = null;
        },
        contentTree: function(o, h) {

            // Defaults
            if(!o) var o = {};
            if(o.script == undefined) o.script = 'fetch';
               
            if(o.folderEvent == undefined) o.folderEvent = 'click';
            if(o.selectEvent == undefined) o.selectEvent = 'click';
               
            if(o.expandSpeed == undefined) o.expandSpeed = -1;
            if(o.collapseSpeed == undefined) o.collapseSpeed = -1;
               
            if(o.multiFolder == undefined) o.multiFolder = true;
            if(o.multiSelect == undefined) o.multiSelect = false;

            function loadTree(c, t, r) {
                $(c).addClass('wait');
                $.post(o.script, { href: t, rel: r}, function(data) {
                    $(c).removeClass('wait').append(data);
                    $(c).find('ul:hidden').slideDown({ duration: o.expandSpeed });
                    bindTree(c);
                });
            }
            
            function handleFolderEvent() {
                var li = $(this).parent();
                if(li.hasClass('collapsed')) {
                    if(!o.multiFolder) {
                        li.parent().find('ul:visible').slideUp({ duration: o.collapseSpeed });
                        li.parent().find('li.navTreeFolderish').removeClass('expanded').addClass('collapsed');
                    }
                    
                    if(li.find('ul').length == 0)
                        loadTree(li, escape($(this).attr('href')), escape($(this).attr('rel')));
                    else
                        li.find('ul:hidden').slideDown({ duration: o.expandSpeed });
                    
                    li.removeClass('collapsed').addClass('expanded');
                } else {
                    li.find('ul').slideUp({ duration: o.collapseSpeed });
                    li.removeClass('expanded').addClass('collapsed');
                }
                return false;
            }
            
            function handleSelectEvent(event) {
                var li = $(this).parent();
                var selected = true;
                var root = $(this).parents('ul.navTree');
                if(!li.hasClass('navTreeCurrentItem')) {
                    var multi_key = ((event.ctrlKey) || (navigator.userAgent.toLowerCase().indexOf('macintosh') != -1 && event.metaKey));

                    if(!o.multiSelect || !multi_key) {
                        root.find('li.navTreeCurrentItem').removeClass('navTreeCurrentItem');
                    }

                    li.addClass('navTreeCurrentItem');
                    selected = true;
                } else {
                    li.removeClass('navTreeCurrentItem');
                    selected = false;
                }

                h(event, true, $(this).attr('href'), $.trim($(this).text()));
            }

            function bindTree(t) {
                $(t).find('li.navTreeFolderish a').unbind(o.folderEvent);
                $(t).find('li.selectable a').unbind(o.selectEvent);
                $(t).find('li a').bind('click', function() { return false; });
            }

            $(this).each(function() {
                bindTree($(this));
            });
        }
    });
    
})(jQuery);
