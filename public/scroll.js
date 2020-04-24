$(() => {
    $(".scroll").niceScroll({
        cursorcolor: "#565656", // change cursor color in hex
        cursoropacitymin: 0, // change opacity when cursor is inactive (scrollabar "hidden" state), range from 1 to 0
        cursoropacitymax: 1, // change opacity when cursor is active (scrollabar "visible" state), range from 1 to 0
        cursorwidth: "10px", // cursor width in pixel (you can also write "5px")
        cursorborder: "", // css definition for cursor border
        cursorborderradius: "0", // border radius in pixel for cursor
        scrollspeed: 60, // scrolling speed
        mousescrollstep: 40, // scrolling speed with mouse wheel (pixel)
        emulatetouch: false, // enable cursor-drag scrolling like touch devices in desktop computer
        hwacceleration: true, // use hardware accelerated scroll when supported
        background: "#78787822", // change css for rail background
        cursorminheight: 32, // set the minimum cursor height (pixel)
        preservenativescrolling: true, // you can scroll native scrollable areas with mouse, bubbling mouse wheel event
        railoffset: false, // you can add offset top/left for rail position
        autohidemode: false,
        bouncescroll: false, // (only hw accell) enable scroll bouncing at the end of content as mobile-like 
        spacebarenabled: true, // enable page down scrolling when space bar has pressed
        disableoutline: true, // for chrome browser, disable outline (orange highlight) when selecting a div with nicescroll
        horizrailenabled: false, // nicescroll can manage horizontal scroll
        railalign: "right", // alignment of vertical rail
        railvalign: "bottom", // alignment of horizontal rail
        railpadding: { top: 0, right: 0, left: 0, bottom: 0 }, 
        enabletranslate3d: true, // nicescroll can use css translate to scroll content
        enablemousewheel: true, // nicescroll can manage mouse wheel events
        enablekeyboard: true, // nicescroll can manage keyboard events
        smoothscroll: true, // scroll with ease movement
        sensitiverail: true, // click on rail make a scroll
        enablemouselockapi: true, // can use mouse caption lock API (same issue on object dragging)
        cursorfixedheight: false, // set fixed height for cursor in pixel
        hidecursordelay: 400, // set the delay in microseconds to fading out scrollbars
        directionlockdeadzone: 6, // dead zone in pixels for direction lock activation
        nativeparentscrolling: true, // detect bottom of content and let parent to scroll, as native scroll does
        enablescrollonselection: true, // enable auto-scrolling of content when selection text
        cursordragspeed: 0.3, // speed of selection when dragged with cursor
        cursordragontouch: false, // drag cursor in touch / touchbehavior mode also
        preventmultitouchscrolling: true, // prevent scrolling on multitouch events
        disablemutationobserver: false, // force MutationObserver disabled,
        enableobserver: true, // enable DOM changing observer, it tries to resize/hide/show when parent or content div had changed
    });
});