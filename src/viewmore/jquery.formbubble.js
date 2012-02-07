/*
 * FormBubble v0.1.4.5
 * Requires jQuery v1.32+
 * Created by Scott Greenfield
 *
 * Copyright 2010, Lyconic, Inc.
 * http://www.lyconic.com/
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Most functions can be called programatically enabling you to bind them to your own events.
 * These functions must be called *after* the the bubble has been initialized.
 *
 * Visit http://www.lyconic.com/resources/tools/formbubble for support and the most up to date version.
 *
 */
(function($) {
    $.fn.formBubble = function(params) {
        var self = arguments.callee;
        
        self.p = $.extend({
            alignment: {
                bubble: 'right',
                pointer: 'top-left'
            },
            animation: {
                slide: false,
                speed: 80
            },
            bindings: {
                fadeOnBlur: true,
                fadeOnBlurExceptions: ['.fc-event', '.form-bubble', '.ui-datepicker-calendar', '.ui-datepicker-header', '#jstree-contextmenu'],  //selectors that will not cause the widget to close
                realignOnWindowResize: true
            },
            cache: false,
            callbacks : {
                onOpen: function(){},
                onClose: function(){}
            },
            content: '',
            dataType: 'none',
            graphics: {
              close: true,
              pointer: true
            },
            offset: {
                x: 13,
                y: 3
            },
            unique: true,
            url: 'none'
        }, params);

        return this.each(function(){
            self.init(this);
            if (self.p.url != 'none' && self.p.dataType != 'image') self.ajax();
            self.align(self.bubbleObject, this, self.p.alignment);
            self.open(this);
        });
    };
    
    $.extend($.fn.formBubble, {
        align: function(bubbleObject, bubbleTarget, alignment){
            var p = this.p;
            
            bubbleObject = $(bubbleObject);
            bubbleTarget = $(bubbleTarget);
            
            if (!$.fn.formBubble.bubbleObject.parents('body').length) return false; //no bubble exists in page yet
            
            var position = bubbleTarget.offset(),
                top = position.top,
                left = position.left,
                right,
                positionCSS,
                offset = bubbleObject.data('offset') || p.offset,
                hOffset = offset.x,
                vOffset = offset.y;
            
            if (!alignment) alignment = bubbleObject.data('alignment');
            
            if (alignment.bubble == 'top'){
                hOffset = hOffset + bubbleObject.outerWidth()/-4;
                vOffset = vOffset + bubbleObject.outerHeight();
            }else if (alignment.bubble === 'right'){
                hOffset = hOffset + bubbleTarget.outerWidth();
                bubbleObject[0].style.right = '';
                 bubbleObject.find('.form-bubble-pointer')
                    .removeClass('form-bubble-pointer-top-right')
                    .addClass('form-bubble-pointer-top-left');
            }else if (alignment.bubble == 'left'){
                right = $(window).width() - left - hOffset;
                bubbleObject[0].style.left = '';
                bubbleObject.find('.form-bubble-pointer')
                    .removeClass('form-bubble-pointer-top-left')
                    .addClass('form-bubble-pointer-top-right');
            }
            
            top = top - vOffset;
            left = left + hOffset;            

            if ($.browser.msie && parseInt($.browser.version) <= 7) $.fn.formBubble.browser = 'lte ie7';
            else if (bubbleObject.css("display") != "none") bubbleObject.stop().fadeTo(0, 1);

            positionCSS = (right) ? {'right' : right, 'top' : top} : {'left' : left, 'top' : top};
            
            if (p.animation.slide && bubbleObject.css("display") != "none") bubbleObject.stop().animate(positionCSS, p.animation.speed);
            else bubbleObject.css(positionCSS);

            bubbleObject.data({ //set bubble data again with updated information
                target: bubbleTarget,
                alignment: alignment,
                offset: offset
            });
        },
        alignAuto: function(bubbleObject, bubbleTarget){  //find a way for this to prevent from being fired until the user stops scrolling
            var align = 'right',
                rightSpace = $(window).width() - ($(bubbleTarget).offset().left + $(bubbleTarget).width()),
                leftSpace = $(bubbleTarget).offset().left;
    
            if (leftSpace > rightSpace) align = 'left';
    
            $.fn.formBubble.align($.fn.formBubble.bubbleObject, bubbleTarget, {
                bubble: align
            });
        },
        ajax: function(){
            var p = this.p;
            
            $.ajax({
                beforeSend: function() { $.fn.formBubble.beforeSend(); },
                cache: p.cache,
                type: 'GET',
                url: p.url,
                dataType: p.dataType,
                success: function(data) { $.fn.formBubble.success(data); },
                complete: function(data) { $.fn.formBubble.complete(); }
            });
        },
        beforeSend: function(){
            $($.fn.formBubble.bubbleObject).find('.form-bubble-content')
                .empty()
                .append('<div id="bubble-loading"><img src="/images/loading.gif" alt="Loading..." title="Loading..." /></div>');
        },
        bindings: function(bubbleObject){
            var p = this.p;
            
            bubbleObject //close button click and hover state
                .find('.form-bubble-close')
                .hover(function(){
                    $(this).fadeTo(0,.75);
                },
                function(){
                    $(this).fadeTo(0,1);
                })
                .click(function(){
                    $.fn.formBubble.close(bubbleObject);
                });
            
            if (!$.fn.formBubble.isBound){ //ensures document-wide events are only bound once
                if (p.bindings.realignOnWindowResize){
                    $(window).resize(function(){
                       $('.form-bubble').each(function(){
                            var bubble = $(this),
                                target = bubble.data('target');
                            
                            $.fn.formBubble.align(bubble, target);
                            if (p.alignment.bubble === 'auto') $.fn.formBubble.alignAuto(bubble, target);
                       });
                    });
                }
                
                $(document).click(function(event){
                    if (event.button === 0 && p.bindings.fadeOnBlur){
                        var len=p.bindings.fadeOnBlurExceptions.length,
                            doClose = false;
                            
                        for (var i=0; i<len; ++i){ //loop through close exceptions, determine if click causes bubble to close
                            if ($(event.target).parents(p.bindings.fadeOnBlurExceptions[i]).length || $(event.target).is(p.bindings.fadeOnBlurExceptions[i])){
                                doClose = false;
                                break;
                            }else{
                                doClose = true; //set it to true... for now
                            }
                        }
                        
                        if (doClose) $.fn.formBubble.close();
                    }
                });
            }
            
            $.fn.formBubble.isBound = true;
        },
        browser: '',
        close: function(bubbleObject){
            var p = this.p;
            
            if (!bubbleObject) bubbleObject = '.form-bubble';
            bubbleObject = $(bubbleObject);

            function remove(){
                bubbleObject.remove();
                p.callbacks.onClose();                
            }

            if (bubbleObject.is(':visible') && $.fn.formBubble.browser === 'lte ie7') remove();
            else if (bubbleObject.is(':visible')) bubbleObject.stop().fadeOut(p.animation.speed, function(){ remove(); });
        },
        complete: function(){
            $($.fn.formBubble.bubbleObject).find('#bubble-loading').remove();
        },
        destroy: function(){ //destroys all formbubbles
            $('.form-bubble').remove();
        },
        init: function(bubbleTarget){
            var p = this.p;
            
            bubbleTarget = $(bubbleTarget);

            var bubbleObject = $('<div class="form-bubble"><div class="form-bubble-content"></div></div>')
                .appendTo('body')
                .data({
                    target: bubbleTarget,
                    alignment: p.alignment,
                    offset: p.offset
                });
            
            $.fn.formBubble.bubbleObject = bubbleObject;
            
            if (p.unique){
                $('.form-bubble.unique').remove(); //close ALL other uniques
                bubbleObject.addClass('unique'); //add class unique to current object
            }
            
            if (p.graphics.close) bubbleObject.prepend('<div class="form-bubble-close"></div>');
            if (p.graphics.pointer) bubbleObject.append('<div class="form-bubble-pointer form-bubble-pointer-' + p.alignment.pointer + '"></div>');
            
            $.fn.formBubble.bindings(bubbleObject);
        },
        open: function(bubbleTarget){
            var p = this.p,
                bubbleObject = $($.fn.formBubble.bubbleObject);

            if (typeof p.content === 'function') p.content = p.content();
            
            if (p.dataType == 'image'){
                if (bubbleObject.find('.form-bubble-content img').length === 0){
                    bubbleObject.find('.form-bubble-content').append('<div class="image"><img src="' + p.url + '" /></div>');
                }
                
                $.fn.formBubble.beforeSend();
                bubbleObject.find('.form-bubble-content').append('<div class="image"><img src="' + p.url + '" /></div>');
                $.fn.formBubble.complete();
            }else if (p.content.length){
                $.fn.formBubble.content(p.content, bubbleTarget);
            }
            
            //with auto align, contents must be loaded FIRST so we can measure width to calculate whether or not it will fit
            if (bubbleObject.data('alignment').bubble == 'auto') $.fn.formBubble.alignAuto(bubbleObject, bubbleTarget);
            
            if (bubbleObject.css("display") === "none"){
                bubbleObject.stop().fadeIn(p.animation.speed, function(){
                    p.callbacks.onOpen();
                });
            }
        },
        success: function(data) {
            var p = this.p;
            
            var dataValue;
            
            if (p.dataType == 'json') dataValue = data.html;
            if (p.dataType == 'html') dataValue = data;
            
            $($.fn.formBubble.bubbleObject).find('.form-bubble-content').append(dataValue);
        },
        content: function(data, bubbleTarget){
            var bubbleObject = $($.fn.formBubble.bubbleObject);

            if (data == 'targetText') data = $(bubbleTarget).text();
            
            bubbleObject.find('.form-bubble-content').remove();
            bubbleObject.append('<div class="form-bubble-content">' + data + '</div>');
        }
    });
})(jQuery);