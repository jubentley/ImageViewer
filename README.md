# ImageViewer
JavaScript (+CSS) self contained Image Viewer

Load it:
```html
<link rel="stylesheet" href="/css/imageviewer.css" />
<script src="/js/imageviewer.js"></script>
```

Call it (single image):
```javascript
image_viewer(img_url);
```

Call it (passing in an array):
```javascript
let adr_gkschem = [
    "https://fs.jbn.ai/fs/host/gkschem/gatekeeper1.png",
    "https://fs.jbn.ai/fs/host/gkschem/gatekeeperv2r1c.png",
    "https://fs.jbn.ai/fs/host/gkschem/gkuml2.png"
];
/**
 * Left and Right buttons will appear
 * @param {string} img_url - The URL of the initial image to display.
 * @param {number} img_id - The inital index of the array. 
 * @param {string[]} img_list_arr - The array of URL's.
 */
image_viewer_local(adr_gkschem[0],0,adr_gkschem);
```

Call it (passing in an API):
```javascript

let base_url = window.location.origin; // localhost or live
let base_url = 'external_api';
/**
 * initialize
 * @param {string} img_url - The base URL of image src addresses.
 * @param {string} range_url - The base URL of image[id] length. 
 */
iv_set_lr_api(
    base_url + "/api/url_of_id_index",
    base_url + "/api/array_length_of_id"
);

/**
 * Left and Right buttons will appear
 * @param {string} img_url - The URL of the initial image to display.
 * @param {string} img_id - The inital index of the array. 
 */
image_viewer_lrapi('/images/default_image.jpg', 0);
```

Initialize Options:
```javascript
/**
 * Three buttons down the bottom can appear to Unsplash and other random images
 * Deactivated as Unsplash continually changes its API
 * @param {boolean} set - true/false.
 */
iv_set_extra_buttons(true);

/**
 * Show LR buttons but only random image (only single image)
 * @param {boolean} set - true/false.
 */
iv_set_lr_force(true);

/**
 * Invert scroll wheel zoom.
 * @param {boolean} set - true/false.
 */
iv_set_invert_zoom(false);
```

End it:
```javascript
//inbuilt
let exit_btn = document.createElement("button");
exit_btn.onclick = function () { terminate(); };
document.body.appendChild(exit_btn);
```

See it running here: [justinbentley.net/image](https://justinbentley.net/image)

