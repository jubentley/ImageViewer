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
 * Left and Right buttons will apear
 * @param {img_url} - The URL of the initial image to display.
 * @param {img_id} - The inital index of the array. 
 * @param {img_list_arr} img_url - The array of URL's.
 */
image_viewer_local(adr_gkschem[0],0,adr_gkschem);
```

Call it (passing in an API):
```javascript

let base_url = window.location.origin; // localhost or live
let base_url = 'external_api';
/**
 * initialization
 * @param {img_url} - The base URL of image src addresses.
 * @param {range_url} - The base URL of image[id] length. 
 */
iv_set_lr_api(
    base_url + "/api/url_of_id_index",
    base_url + "/api/array_length_of_id"
);

/**
 * Left and Right buttons will apear
 * @param {img_url} - The URL of the initial image to display.
 * @param {img_id} - The inital index of the array. 
 */
image_viewer_lrapi('/images/default_image.jpg', 0);
```

End it:
```javascript
//inbuilt
let exit_btn = document.createElement("button");
exit_btn.onclick = function () { terminate(); };
document.body.appendChild(exit_btn);
```


Been building this since 2022.
