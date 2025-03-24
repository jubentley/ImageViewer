/*#####################################################################
##  ImageViewer.js                                                   ##
##                                                                   ##
##  Full Screen Image Viewer                           ###### ###### ##
##  Justin Bentley 2022 - 2024                          ##    ##     ##
##                                                     ##      ##    ##
##                                              ##  ####   ######    ##
######################################################################*/


const iv_version = '2.7';


// check it out running @ https://react.justinbentley.net/image


// ~ Console API Calls (testing) ~
/*
  
//~ Get number of images for image slot 0 ~

fetch('https://arcaneww.com/api/ShowcaseRange/0').then((res) => {
    return res.text();
}).then((text) => {
    console.log(text)
})

//~ Get url (passed to img/src) for image slot 0, id 0 ( 0 - range(above) )

let image_id = 0; // 0 - /ShowcaseRange/x

fetch('https://arcaneww.com/api/ShowcasePicURL/0/' + id).then((res) => {
    return res.text();
}).then((text) => {
    console.log(text)
})
*/

/*  ~ TODO ~    

    ~ make buttons transparent (DONE) ~

    ~ slider needs :hover shadow (DONEish) ~

    ~ consider opacity and hover on HUD ~

    ~ conditional for image not in center of screen ~

    ~ attatch mousemove listener specifically to forefront window (DONE) ~

    ~ hold shift to fast move, ctrl to slow move (slider | DONE)~

    ~ diagonal key movement or diagonal slider & lr buttons ~

    ~ (LR for left right buttons, perhaps up/down for slider) ~

    ~ Full Screen Change Listeners OR fs.js (thinking fs.js)

    ~ Load Screen (opacity anim?)

    ~ button size and placment -> relative (DONE)

    ~ set_touch() inspect

    ~ listeners document.body. >> document.

    ~ JB button check links (DONE) ~

    ~ US button check links (FAIL, US wants a JSON fetch, btn disabled) ~

    ~ LR Buttons deny repress, change z-index

    ~ scrolling to 0 causes ios menu to appear (ios wont respect overflow) ~
    
    ~ I know that scrolling to y0 is bad for iOS but in reality the fix is even worse, 
    i cant even begin to tell you what a pain ios is, it doesnt respect overflow:hidden; 
    at all. ~
*/


// ~~ script var's ~~

//      ~       pre load toggles      ~       //
let iv_extra_buttons = false;               //Show Demo buttons, JB, US, BE
let iv_invert_zoom = true;                  //Invert Zoom

//      ~       left, right button api vars      ~       //
let iv_buttons_lr = false;                  //Show left & right buttons for API
let iv_buttons_lr_force = false;            //Show left & right buttons for demo (unsplash)
let iv_lr_buttons_api_url = "";             //API: IMG address retrieval URL
let iv_lr_buttons_api_range = "";           //API: range retrieval URL
let iv_lr_buttons_id = 0;                   //API: image id         img[X,0]
let iv_lr_buttons_index = 0;                //API: image index      img[0,X]
let iv_lr_buttons_range = 1;                //API: index max        img[0,num]

//      ~       left, right button api vars (local mode)      ~       //
let iv_local_mode = false;
let iv_lc_src_arr = [];

//      ~       inner working vars      ~       //
const iv_default_mouse_spd = 6;             //default initial img move speed
let iv_mouse_spd = iv_default_mouse_spd;    //img move speed
let iv_slide_value = 1;                     //slide value | move speed multiplier
let iv_mouse_depressed = false;             //mouse depressed toggle
let iv_mouse_x = 0;                         //x co-ord of mouse
let iv_mouse_y = 0;                         //y
let iv_img_x = 0;                           //x screen co-ord of top-left of img 
let iv_img_y = 0;                           //y
let iv_mid_x;                               //img x co-ord of half-width
let iv_mid_y;                               //y
let iv_fullscreen = false;                  //fullscreen mode active
let iv_prev_height = window.innerHeight;    //height of window, used for sticky FS event
let iv_touch_device = false;                //bool is touch device?
let iv_touch_distance = null; //or 0.0      //prev dist for two finger (though TODO) zoom event
let iv_url_blob = null;                     //some images use blob (namely unsplash api)
let iv_CTRL_state = false;                  //state of CONTROL key
let iv_SHIFT_state = false;                 //state of SHIFT key

//      ~       save for terminate      ~       //
let iv_overflow_x;                          //webpage previous overflow x setting
let iv_overflow_y;                          //y
let iv_overflow;                            //overflow regular
let iv_prev_page_y;                         //pre iv y (scrolled) pos




//          ~~ pre entry setters ~~         //

//show unsplash, beach & jb, default -> false
function iv_set_extra_buttons(set) {

    iv_extra_buttons = set;
}

//show LR buttons but no api support, default -> unsplash
function iv_set_lr_force(set) {

    iv_buttons_lr = set;
    iv_buttons_lr_force = set;
}

//set base url for Range & Src API & show LR buttons 
function iv_set_lr_api(img_url, range_url) {

    iv_lr_buttons_api_url = img_url;
    iv_lr_buttons_api_range = range_url;
}

//set invert zoom
function iv_set_invert_zoom(set) {

    iv_invert_zoom = set;
}


//           ~~~ entry ~~~              //


//~ start IV w/o API support (unless inherited) ~
function image_viewer(img_url) {

    set_touch();            //check for touch
    setup();                //setup overlay
    setup_image(img_url);   //setup and load image
    add_listeners();        //setup key, mouse & (bool)touch inputs

    iv_prev_page_y = Math.round(window.scrollY);   //set var for current page Y
    window.scrollTo(0, 0);                      //set Y to 0
}



//~ start IV without API but local array LR image support (public) ~
function image_viewer_local(
    img_url,
    img_id,
    img_list_arr
) {

    iv_buttons_lr = true;                           // show LR buttons
    iv_local_mode = true;                           // set local mode (no true API)
    iv_lc_src_arr = img_list_arr;                   // populate local img src arr (this is a pointer)
    iv_lr_buttons_index = img_id;                   // set image slot -> img[0,X]
    iv_lr_buttons_range = iv_lc_src_arr.length -1;  // set range -> img[0,num] (would be API call)

    image_viewer(img_url);    // (above function) start IV as usual
}



//~ start IV with API support ~
//~ iv_set_lr_api(img_url, range_url) needs to be called before ~
//~ * this sets the api base address' only, such as;
//~ ~/API/ShowcaseRange, ~/API/ShowcasePicURL
//~ IV will call ~/API/ShowcaseRange/1 ~/API/ShowcasePicURL/1/2 ~

//* lrapi(img to start with, image api index/id)
async function image_viewer_lrapi(img_url, img_id) {

    iv_buttons_lr = true;           //show LR buttons
    iv_lr_buttons_id = img_id;         //set image API slot
    await image_viewer(img_url);    //(above function) start IV as usual

    //get range of images for image slot (img_id), for later calls
    await fetch(iv_lr_buttons_api_range + '/' + img_id).then((res) => {
        return res.text();
    }).then((text) => {
        iv_lr_buttons_range = text;
    })
}





//           ~~~ internal functions ~~~              //


//~ zoom's ~
function regular_zoom(e) {

    //  unused but may be called when img is not in direct center of screen

    e.preventDefault();
    e.stopPropagation();
    if (e.deltaY) {

        if (iv_invert_zoom) {
            e.deltaY *= -1; //invert scroll   
        }

        let url_image = document.getElementById("url_image");

        let width = url_image.width;
        let height = url_image.height;

        iv_mid_x = url_image.offsetLeft + (url_image.width / 2);
        iv_mid_y = url_image.offsetTop + (url_image.height / 2);

        if (e.deltaY > 0) {
            width2 = width * 1.2;
            height2 = height * 1.2;
        }
        else if ((e.deltaY < 0)) {
            width2 = width / 1.2;
            height2 = height / 1.2;
        }

        iv_img_x = iv_mid_x - ((width2 / 2));
        iv_img_y = iv_mid_y - ((height2 / 2));

        url_image.style.width = "" + width2 + "px";
        //url_image.style.height = "" + height2 + "px";
        url_image.style.top = "" + iv_img_y + "px";
        url_image.style.left = "" + iv_img_x + "px";

        set_mouse_speed();

    }
}

//zoom v2, anchors point-in-image to middle of screen
//may modify centre screen issue
function centrepoint_zoom(e, multiplier) {

    //e.preventDefault();
    //e.stopPropagation();
    if (e.deltaY) {

        let scroll_wheel = e.deltaY;

        if (iv_invert_zoom) {
            scroll_wheel *= -1; //invert scroll   
        }

        let url_image = document.getElementById("url_image");

        let width = url_image.width;
        let height = url_image.height;
        let width2, height2;

        iv_mid_x = url_image.offsetLeft + (url_image.width / 2);
        iv_mid_y = url_image.offsetTop + (url_image.height / 2);

        if (scroll_wheel > 0) {
            width2 = Math.pow(1.2, multiplier) * width;
            height2 = Math.pow(1.2, multiplier) * height;
        }
        else if ((scroll_wheel < 0)) {
            width2 = width / Math.pow(1.2, multiplier);
            height2 = height / Math.pow(1.2, multiplier);
        }
        //pow? syncs wheel to (multiplied) number of clicks of +- btn's

        //get ratio of image left/top of screen midpoint
        //apply scale * ratio to X & Y
        //ergo, anchor point in image in center of screen to center of screen
        //otherwise, img grows, top & left stay the same
        screen_mid_point_x = window.innerWidth / 2;
        image_width = url_image.width;
        left_ratio = screen_mid_point_x - iv_img_x;
        left_ratio /= image_width;
        iv_img_x -= (width2 - width) * left_ratio;

        screen_mid_point_y = window.innerHeight / 2;
        image_height = url_image.height;
        left_ratio = screen_mid_point_y - iv_img_y;
        left_ratio /= image_height;
        iv_img_y -= (height2 - height) * left_ratio;

        url_image.style.width = "" + width2 + "px";

        url_image.style.top = "" + (iv_img_y) + "px";
        url_image.style.left = "" + iv_img_x + "px";

        //set_mouse_speed();    //set mousespd relative to inverted size of image

    }
}

//      ~              mouse, keyboard listeners                 ~      //

function wheel_listener(e) {
    centrepoint_zoom(e, 1);
}
function keydown_listener(e) {

    if (iv_buttons_lr) {
        if (e.key === "ArrowRight") {
            e.preventDefault();
            e.stopPropagation();
            if (iv_buttons_lr_force) {
                //perhaps move reload into right button
                reload_unsplash();
            } else {
                iv_right_button();
            }
        }
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            e.stopPropagation();
            if (iv_buttons_lr_force) {
                reload_unsplash();
            } else {
                iv_left_button();
            }
        }
    }

    if (e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        fullscreen_toggle();
    }
    if (e.key === "Escape") {
        //will not register if browser exiting FS
        //ie, in FS, press esc, the browser inbuilt esc will be called, not this
        //cannot preventDefault as browser prevents FS lock
        terminate();
    }
}
function mousemove_listener(e) {
    if (iv_mouse_depressed === true) {
        if (Math.abs(iv_mouse_y - e.clientY) > 0.1) {
            if (iv_mouse_y < e.clientY) {
                let url_image = document.getElementById("url_image");
                url_image.style.top = "" + (iv_img_y + (iv_mouse_spd * iv_slide_value)) + "px";
                iv_mouse_y = e.clientY;
                iv_img_y = iv_img_y + (iv_mouse_spd * iv_slide_value);
            }
            else {
                let url_image = document.getElementById("url_image");
                url_image.style.top = "" + (iv_img_y - (iv_mouse_spd * iv_slide_value)) + "px";
                iv_mouse_y = e.clientY;
                iv_img_y = iv_img_y - (iv_mouse_spd * iv_slide_value);
            }
        }
        if (Math.abs(iv_mouse_x - e.clientX) > 0.1) {
            if (iv_mouse_x < e.clientX) {
                let url_image = document.getElementById("url_image");
                url_image.style.left = "" + (iv_img_x + (iv_mouse_spd * iv_slide_value)) + "px";
                iv_mouse_x = e.clientX;
                iv_img_x = iv_img_x + (iv_mouse_spd * iv_slide_value);
            }
            else {
                let url_image = document.getElementById("url_image");
                url_image.style.left = "" + (iv_img_x - (iv_mouse_spd * iv_slide_value)) + "px";
                iv_mouse_x = e.clientX;
                iv_img_x = iv_img_x - (iv_mouse_spd * iv_slide_value);
            }
        }
    }
}
function mousedown_listener(e) {
    iv_mouse_x = e.clientX;
    iv_mouse_y = e.clientY;
    iv_mouse_depressed = true;
}
function mouseup_listener(e) {
    iv_mouse_depressed = false;
}
function set_mouse_speed() {
    iv_mouse_spd = document.getElementById("url_image").width / 170;
}


//      ~~              touch listeners                 ~~      //

function xy_dist(e) {
    alert("xyz_dist called")
    return (
        Math.abs(e.touches[0].clientX - e.touches[1].clientX) +
        Math.abs(e.touches[0].clientY - e.touches[1].clientY)
    );
}

//legacy scaffolding for zoom touch doubletap
//difficulty overiding ios default doubletap (ofcourse)
//alternatively runs through +- buttons on screen
function zoom(e) {
    alert("touchzoom called :(")
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (iv_touch_distance === null) {
        iv_touch_distance = xy_dist(e);
        return;
    }
    else {
        if ((xy_dist(e) + 0.0) > iv_touch_distance) {
            let mod = 1.1;
        }
        else if ((xy_dist(e) + 0.0) < iv_touch_distance) {
            let mod = 0.9;
        }
        else {
            return;
        }
        let url_image = document.getElementById("url_image");
        let width = url_image.width;
        url_image.style.width = "" + (width * mod) + "px";

    }
}
function touchstart_listener(e) {
    //e.preventDefault();   //will prevent buttons from being pressed
    iv_mouse_x = e.touches[0].clientX;
    iv_mouse_y = e.touches[0].clientY;
    iv_mouse_depressed = true;
}
function touchend_listener(e) {
    //e.preventDefault();
    iv_mouse_depressed = false;
    iv_touch_distance = null;
}
function touchmove_listener(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    //doubletap (TODO)
    //if (e.touches.length > 1) { zoom(e); return; }

    if (iv_mouse_depressed === true) {
        if (Math.abs(iv_mouse_y - e.touches[0].clientY) > 0.1) {
            if (iv_mouse_y < e.touches[0].clientY) {
                let url_image = document.getElementById("url_image");
                url_image.style.top = "" + (iv_img_y + (iv_mouse_spd * iv_slide_value)) + "px";
                iv_mouse_y = e.touches[0].clientY;
                iv_img_y = iv_img_y + (iv_mouse_spd * iv_slide_value);
            }
            else {
                let url_image = document.getElementById("url_image");
                url_image.style.top = "" + (iv_img_y - (iv_mouse_spd * iv_slide_value)) + "px";
                iv_mouse_y = e.touches[0].clientY;
                iv_img_y = iv_img_y - (iv_mouse_spd * iv_slide_value);
            }
        }
        if (Math.abs(iv_mouse_x - e.touches[0].clientX) > 0.1) {
            if (iv_mouse_x < e.touches[0].clientX) {
                let url_image = document.getElementById("url_image");
                url_image.style.left = "" + (iv_img_x + (iv_mouse_spd * iv_slide_value)) + "px";
                iv_mouse_x = e.touches[0].clientX;
                iv_img_x = iv_img_x + (iv_mouse_spd * iv_slide_value);
            }
            else {
                let url_image = document.getElementById("url_image");
                url_image.style.left = "" + (iv_img_x - (iv_mouse_spd * iv_slide_value)) + "px";
                iv_mouse_x = e.touches[0].clientX;
                iv_img_x = iv_img_x - (iv_mouse_spd * iv_slide_value);
            }
        }
    }
}

//      ~         fullscreen listeners        ~         //

//~ adjust image relative to fullscreen change ~
function stick_height(prev_height) {

    let height = window.innerHeight;

    let height_ratio = height / prev_height;

    let ele1 = document.getElementById("url_image");

    let prev_width = ele1.width;

    let width = prev_width * height_ratio;

    ele1.style.width = width + 'px';

    iv_img_x += ((prev_width - width) / 2);

    ele1.style.left = iv_img_x + 'px';
}

async function openFullscreen() {

    //(TODO) merge or copy from fs.js

    let elem = document.documentElement;

    //if (document.fullscreenElement) { return; }

    if (elem.requestFullscreen) { /* Current Standard */
        await elem.requestFullscreen();
    }
    else if (elem.webkitRequestFullscreen) { /* Safari */
        await elem.webkitRequestFullscreen();
    }
    else if (elem.mozRequestFullScreen) { /* legacy Mozilla */
        await elem.mozRequestFullScreen();
    }
    else if (elem.msRequestFullscreen) { /* IE11 */
        await elem.msRequestFullscreen();
    }
    //if (elem.requestFullscreen) {
    //    elem.requestFullscreen();
    //} else if (elem.webkitRequestFullscreen) { /* Safari */
    //    elem.webkitRequestFullscreen();
    //} else if (elem.msRequestFullscreen) { /* IE11 */
    //    elem.msRequestFullscreen();
    //}
}
async function closeFullscreen() {

    //if (!document.fullscreenElement) { return; }

    if (document.exitFullscreen) {
        await document.exitFullscreen();
    }
    else if (document.webkitExitFullscreen) { /* Safari */
        await document.webkitExitFullscreen();
    }
    else if (document.mozCancelFullScreen) { /* legacy Mozilla */
        await document.mozCancelFullScreen();
    }
    else if (document.msExitFullscreen) { /* IE11 */
        await document.msExitFullscreen();
    }
}

async function fullscreenchange_listener() {

    //called by either browser escape FS event or IV press button/space key event

    //if in FS and ESC is pressed, keydown ESC event is not triggered and
    //document.exitFullscreen() is called automatically (& forcefully) by the browser

    //ergo a var toggle cannot be used

    if (!document.fullscreenElement) {          
        iv_fullscreen = false;
    } else {
        iv_fullscreen = true;
    }   

    await stick_height(iv_prev_height);

    iv_prev_height = window.innerHeight;
    //and its unknown when this is needed
    //which needs to be called before the screen change event
}

async function fullscreen_toggle() {

    //called only by a IV (not browser) FS change event

    iv_prev_height = window.innerHeight;

    if (iv_fullscreen) {
        await closeFullscreen();
    } else {
        await openFullscreen()
    }
    //function above fullscreenchange_listener() will be called through listener

}

function slide_listener(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    /* 1 - 5 - 20 */
    iv_slide_value = event.target.value / 5;

    //console.log(iv_slide_value);
}


//~ add listeners ~
function add_listeners() {

    document.body.addEventListener('wheel', wheel_listener, false);
    document.body.addEventListener('mousedown', mousedown_listener, false);
    document.body.addEventListener('mouseup', mouseup_listener, false);
    document.getElementById('iv_foredrop').addEventListener('mousemove', mousemove_listener, false);
    //document.body.addEventListener('mousemove', mousemove_listener, false);
    document.body.addEventListener('keydown', keydown_listener, false);
    document.addEventListener("fullscreenchange", fullscreenchange_listener, false);
    //document.addEventListener("mozfullscreenchange", fullscreenchange_listener, false);
    //document.addEventListener("webkitfullscreenchange", fullscreenchange_listener, false);
    //document.addEventListener("msfullscreenchange", fullscreenchange_listener, false);

    if (iv_touch_device) {
        document.body.addEventListener("touchstart", touchstart_listener, false);
        document.body.addEventListener("touchend", touchend_listener, false);
        document.getElementById('iv_foredrop').addEventListener("touchmove", touchmove_listener, false);
        document.body.addEventListener("touchcancel", touchend_listener, false);
    }
}

//~ remove listeners ~
function remove_listeners() {

    document.body.removeEventListener('wheel', wheel_listener, false);
    document.body.removeEventListener('mousedown', mousedown_listener, false);
    document.body.removeEventListener('mouseup', mouseup_listener, false);
    document.getElementById('iv_foredrop').removeEventListener('mousemove', mousemove_listener, false);
    document.body.removeEventListener('keydown', keydown_listener, false);
    document.removeEventListener('fullscreenchange', fullscreenchange_listener, false);

    document.getElementById('iv_slider').removeEventListener("input", (event) => { slide_listener(event.target.value); });

    if (iv_touch_device) {
        document.body.removeEventListener('touchstart', touchstart_listener, false);
        document.body.removeEventListener('touchend', touchend_listener, false);
        document.getElementById('iv_foredrop').removeEventListener('touchmove', touchmove_listener, false);
        document.body.removeEventListener('touchcancel', touchend_listener, false);
    }
}

//~ setup ~
function set_touch() {

    //TODO: RETURNS TRUE ON EVERYTHING

    if ('ontouchstart' in window) {
        iv_touch_device = true;
    }
}

function setup_image(url) {

    //set img
    let url_image = document.createElement("img");

    // setup image onloads
    if (iv_buttons_lr) {
        url_image.onload = function () {
            url_image.style.opacity = 1;
            document.getElementById('iv_left').style.opacity = 0.5;
            document.getElementById('iv_right').style.opacity = 0.5;
            document.getElementById('url_image').style.opacity = 1;
            reset_dim();
        }
    } else {
        url_image.onload = function () {
            url_image.style.opacity = 1;
            document.getElementById('url_image').style.opacity = 1;
            reset_dim();
        }
    }

    url_image.id = "url_image";
    url_image.src = url;
    url_image.classList.add('iv_image', 'iv_theme');

    document.body.appendChild(url_image);

}
function setup() {

    //get overflow from <html> for return
    let computed_style = getComputedStyle(document.documentElement);
    iv_overflow_x = computed_style.overflowX;
    iv_overflow_y = computed_style.overflowY;
    iv_overflow = computed_style.overflow;

    //set overflow
    document.documentElement.style.overflow = "hidden";
 
    //setup iv_backdrop
    let iv_backdrop = document.createElement("div");
    iv_backdrop.id = "iv_backdrop";
    iv_backdrop.classList.add('iv_screen', 'iv_backdrop');
    document.body.appendChild(iv_backdrop);

    //sign
    let iv_signature = document.createElement("div");
    iv_signature.id = "iv_signature"
    iv_signature.classList.add('iv_line1', 'iv_text', 'iv_sign');
    iv_signature.innerHTML = `<b>ImageViewer ${iv_version} (JS), J. Bentley '24</b>`
    iv_backdrop.append(iv_signature);

    //setTimeout(() => { document.getElementById("iv_backdrop").style.top = `${window.scrollY}px` }, 0);

    //setup iv_foredrop
    let iv_foredrop = document.createElement("div");
    iv_foredrop.id = "iv_foredrop";
    iv_foredrop.classList.add('iv_screen', 'iv_foredrop');
    document.body.appendChild(iv_foredrop);

    //iv_slider
    let iv_slider = document.createElement("input");
    iv_slider.type = "range";
    iv_slider.id = "iv_slider";
    iv_slider.title = `Modify image move speed`;
    //iv_slider.setAttribute('title', 'This is the range slider');
    iv_slider.classList.add('iv_slider', 'iv_col0', 'iv_theme');
    iv_slider.min = "1";
    iv_slider.max = "30";
    let slide_val;
    if (iv_slide_value === 1.0) { slide_val = '5'; } else { slide_val = iv_slide_value * 5; }
    iv_slider.value = `${slide_val}`; //return prev val for next session
    //iv_slider.value = iv_slide_value === 1 ? "5" : `${iv_slider.value * 5}`;
    if (window.innerWidth < 450) { iv_slider.style.zIndex = -1; } // hide on phone portrait
    //console.log(iv_slider.value);
    iv_slider.addEventListener("input", (event) => { slide_listener(event); });
    document.body.appendChild(iv_slider);
    setTimeout(() => {
        document.getElementById(`iv_slider`).classList.add(`iv_hide`);
    }, 100);

    //setup terminate button
    let exit_btn = document.createElement("button");
    exit_btn.id = "exit_btn";
    exit_btn.title = "exit screen viewer\nalternatively you can press ESC";
    exit_btn.onclick = function () { terminate(); };
    exit_btn.classList.add('iv_btn', 'iv_line0', 'iv_col0', 'iv_theme', 'iv_symbol', 'iv_terminate');
    document.body.appendChild(exit_btn);

    //setup fullscreen button
    let fullscreen_btn = document.createElement("button");
    fullscreen_btn.id = "fullscreen_btn";
    fullscreen_btn.title = "fullscreen button\nalternatively you can press SPACE";
    fullscreen_btn.onclick = function () { fullscreen_toggle(); };
    fullscreen_btn.classList.add('iv_btn', 'iv_line3', 'iv_col0', 'iv_theme', 'iv_symbol', 'iv_fullscreen');
    //if (!iv_extra_buttons) { fullscreen_btn.style.left = "60px"; }
    document.body.appendChild(fullscreen_btn);

    if (iv_extra_buttons) {

        //let bp = 500;

        //setup reload (upslash) button
        let reload_btn = document.createElement("button");
        reload_btn.id = "reload_btn";
        reload_btn.title = "lucky unsplash image";
        reload_btn.onclick = function () { reload_unsplash(); };
        //wont change on resize
        //if (window.innerWidth < bp) { reload_btn.classList.add('iv_line0'); }
        reload_btn.classList.add('iv_btn', 'iv_line9', 'iv_theme', 'iv_text', 'iv_unsplash');
        document.body.appendChild(reload_btn);

        //setup reload (upslash beach) button
        let reload_beach_btn = document.createElement("button");
        reload_beach_btn.id = "reload_beach_btn";
        reload_beach_btn.title = "lucky unsplash (beach) image";
        reload_beach_btn.onclick = function () { reload_unsplash_beach(); };
        reload_beach_btn.classList.add('iv_btn', 'iv_line9', 'iv_theme', 'iv_text', 'iv_beach');
        //if (window.innerWidth < bp) { reload_beach_btn.classList.add('iv_line0'); }
        document.body.appendChild(reload_beach_btn);

        //setup random jbn button
        let jbn_btn = document.createElement("button");
        jbn_btn.id = "jbn_btn";
        jbn_btn.title = "random justinbentley.net image";
        jbn_btn.onclick = function () { reload_jbn(); };
        jbn_btn.classList.add('iv_btn', 'iv_line9', 'iv_theme', 'iv_text', 'iv_rnd_jbn');
        //if (window.innerWidth < bp) { jbn_btn.classList.add('iv_line0'); }
        document.body.appendChild(jbn_btn);
    }

    if (iv_buttons_lr) {

        //setup left api button
        let iv_left = document.createElement("button");
        iv_left.id = "iv_left";
        iv_left.title = "previous image\nalternatively you can press the left arrow key";
        if (iv_buttons_lr_force) {
            iv_left.onclick = function () { reload_unsplash(); };
        } else {
            iv_left.onclick = function () { iv_left_button(); };
        }
        iv_left.classList.add('iv_btn', 'iv_btn_lr', 'iv_line4', 'iv_col0', 'iv_theme', 'iv_symbol', 'iv_left');
        document.body.appendChild(iv_left);

        //setup right api button
        let iv_right = document.createElement("button");
        iv_right.id = "iv_right";
        iv_right.title = "next image\nalternatively you can press the right arrow key";
        if (iv_buttons_lr_force) {
            iv_right.onclick = function () { reload_unsplash(); };
        } else {
            iv_right.onclick = function () { iv_right_button(); };
        }
        iv_right.classList.add('iv_btn', 'iv_btn_lr', 'iv_line4', 'iv_col1', 'iv_theme', 'iv_symbol', 'iv_right');
        document.body.appendChild(iv_right);
    }

    //setup zoom_plus button
    let zoom_plus_btn = document.createElement("button");
    zoom_plus_btn.id = "zoom_plus_btn";
    zoom_plus_btn.title = "zoom in\nanalogue to the mouse scroll wheel";
    zoom_plus_btn.onclick = function () {
        if (iv_invert_zoom) {
            spoof_e.deltaY = -100;
        } else { spoof_e.deltaY = 100; }    
        centrepoint_zoom(spoof_e, spoof_e.advance);
    };
    zoom_plus_btn.classList.add('iv_btn', 'iv_line2', 'iv_col0', 'iv_theme', 'iv_symbol', 'iv_zoom_plus');
    document.body.appendChild(zoom_plus_btn);

    //setup zoom_minus button
    let zoom_minus_btn = document.createElement("button");
    zoom_minus_btn.id = "zoom_minus_btn";
    zoom_minus_btn.title = "zoom out\nanalogue to the mouse scroll wheel";
    zoom_minus_btn.onclick = function () {
        if (iv_invert_zoom) { spoof_e.deltaY = 100;
        } else { spoof_e.deltaY = -100; }       
        centrepoint_zoom(spoof_e, spoof_e.advance);
    };
    zoom_minus_btn.classList.add('iv_btn', 'iv_line1', 'iv_col0', 'iv_theme', 'iv_symbol', 'iv_zoom_minus');
    document.body.appendChild(zoom_minus_btn);
}
//~ happy halloween ;) ~
let spoof_e = {

    deltaY: 0,
    preventDefault: function () { ; },
    stopPropagation: function () { ; },
    stopImmediatePropagation: function () { ; },

    advance: 3
};
//its a mouse scrollwheel event (x3)


//~ post image setups ~

//~ on-click functions & slave utils ~

//~ left button API ~
async function iv_left_button() {

    if (iv_lr_buttons_index <= 0) {
        iv_lr_buttons_index = iv_lr_buttons_range;
    } else {
        iv_lr_buttons_index--;
    }
    await iv_lr_button();
}

//~ right button API ~
async function iv_right_button() {

    if (iv_lr_buttons_index >= iv_lr_buttons_range) {
        iv_lr_buttons_index = 0;
    } else {
        iv_lr_buttons_index++;
    }
    await iv_lr_button();
}
async function iv_lr_button() {

    document.getElementById('url_image').style.opacity = 0;
    document.getElementById('iv_left').style.opacity = 0;
    document.getElementById('iv_right').style.opacity = 0;
    //document.getElementById('url_image').style.opacity = 0;

    if (iv_local_mode) {

        switch_jbn_image(iv_lc_src_arr[iv_lr_buttons_index]);

    } else {

        // call API to get url of next image
        fetch(iv_lr_buttons_api_url + '/' + iv_lr_buttons_id + '/' + iv_lr_buttons_index).then((res) => {
            return res.text();
        }).then((text) => {
            switch_jbn_image(text);
        })
    }
}


//~ JB button ~
function reload_jbn() {

    document.getElementById('url_image').style.opacity = 0;
    let rnd_jbn_url = [
        "Uni/ICE/ice_comparator_hand.jpg",
        "Uni/ICE/ICE_COMPARATOR_SIM.jpg",
        "Uni/ICE/ICE_TRAFFICLIGHT_NEW.PNG",

        "Uni/GPT/OKTAGONTHII.jpg",
        "Uni/GPT/USS199_2.jpg",
        "Uni/GPT/USS199_1.jpg",

        "Uni/Uni/MasoudHi.jpg",
        "People/JustinII.jpg",
        "Skillset/PC/PCHI.jpg",

        "Services/Image/Corona_discharge_1.jpg",
        "Services/Image/Parrot.jpg",
        /*"Services/Image/MazdaDS.jpg",*/
        "Services/Image/CentrepointZoom.jpg"
    ];

    //switch_image_blob("https://justinbentley.net/api/getimage");

    //switch_image_blob("https://justinbentley.net/Images/" + rnd_jbn_url[
    //    Math.floor(Math.random() * rnd_jbn_url.length)
    //]);

    switch_jbn_image("https://justinbentley.net/Images/" + rnd_jbn_url[
        Math.floor(Math.random() * rnd_jbn_url.length)
    ]);
}

//~ BE button ~
function reload_unsplash_beach() {

    //document.getElementById('url_image').style.opacity = 0;
    //switch_image_blob("https://source.unsplash.com/1920x1080/?beach");
}

//~ US button ~
function reload_unsplash() {

    //document.getElementById('url_image').style.opacity = 0;
    //switch_image_blob("https://source.unsplash.com/1920x1080/?All");
}

//~ reset for next use ~
//~ callback, every time <img loading=lazy> src loaded
function reset_dim() {

    iv_img_x = 0;

    let ele1 = document.getElementById("url_image");
    ele1.style.left = "0px";
    //ele1.style.top = "0px";


    //~ zoom img height to window height & centre ~
    //~ without setting css height: ~

    //if (ele1.height > (window.innerHeight - 10)) {

    if (window.innerHeight < window.innerWidth) {

        let width = ele1.width * ((window.innerHeight / ele1.height) * 0.98);

        ele1.style.width = width + 'px';

        iv_img_x = (window.innerWidth - width) / 2;

        ele1.style.left = iv_img_x + "px";

    } else {
        ele1.style.width = '100%';
        //ele1.style.width = '98%';
        //iv_img_x set 0 by default
    }
  

    //~ set image in center heightwise ~
    if (ele1.height === 0) {
        ele1.style.top = "0px";
        iv_img_y = 0;
    } else {     
        
        let top = (window.innerHeight - ele1.height) / 2;
        ele1.style.top = top + "px";
        iv_img_y = top;
    }

    document.getElementById("url_image").style.opacity = 1;

    //iv_mouse_spd = iv_default_mouse_spd;

    //set_mouse_speed()
}
function switch_jbn_image(img) {

    let ele = document.getElementById("url_image");

    //ele.style.opacity = 0;

    ele.src = img;


}
function switch_image_blob(img) {

    //TODO: try change from blob (if u can)

    fetch(img)
        .then(response => response.blob())
        .then(blob => {
            if (iv_url_blob !== null) { URL.revokeObjectURL(iv_url_blob); }
            iv_url_blob = URL.createObjectURL(blob);
            document.getElementById("url_image").src = iv_url_blob;
        });

}

// destroy & return page to normal
async function terminate() {

    //reset let's for next use
    await reset_dim();

    //terminate blob
    if (iv_url_blob !== null) { URL.revokeObjectURL(iv_url_blob); }

    //terminate fullscrren
    if (iv_fullscreen) { await fullscreen_toggle(); iv_fullscreen = false; }

    //terminate listeners
    remove_listeners();

    //terminate html elements
    document.getElementById("iv_signature").remove();
    document.getElementById("iv_backdrop").remove();
    document.getElementById("iv_foredrop").remove();
    document.getElementById("url_image").remove();

    //terminate buttons
    document.getElementById("exit_btn").remove();
    if (iv_extra_buttons) {
        document.getElementById("reload_btn").remove();
        document.getElementById("reload_beach_btn").remove();
        document.getElementById("jbn_btn").remove();
    }
    if (iv_buttons_lr) {
        document.getElementById("iv_left").remove();
        document.getElementById("iv_right").remove();
    }
    document.getElementById("fullscreen_btn").remove();
    document.getElementById("zoom_plus_btn").remove();
    document.getElementById("zoom_minus_btn").remove();
    document.getElementById("iv_slider").remove();

    //return lets
    iv_buttons_lr = false;
    iv_lr_buttons_index = 0;
    iv_local_mode = false;

    //revert overflow settings
    let html_style = document.documentElement.style;
    html_style.overflowX = iv_overflow_x || "unset";
    html_style.overflowY = iv_overflow_y || "unset";
    html_style.overflow = iv_overflow || "unset";           //TODO?: can be "hidden clip"


    //return scroll position
    window.scrollTo(0, iv_prev_page_y);
}



