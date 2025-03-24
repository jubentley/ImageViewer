# ImageViewer
JavaScript (+CSS) self contained Image Viewer

Load it:
```html
<link rel="stylesheet" href="/css/imageviewer.css" />
<script src="/js/imageviewer.js"></script>
```

Call it:
```javascript
image_viewer(img_url);
```

Call it (passing in an array):
image_viewer_local(adr_gkschem[0],0,adr_gkschem)


```javascript
let adr_gkschem = [
    "https://fs.jbn.ai/fs/host/gkschem/gatekeeper1.png",
    "https://fs.jbn.ai/fs/host/gkschem/gatekeeperv2r1c.png",
    "https://fs.jbn.ai/fs/host/gkschem/gkuml2.png"
];
/**
 * img_url,
 * img_id,
 * img_list_arr
 * @param {img_url} img_url - The URL of the image to display.
 * @param {img_id} img_url - The URL of the image to display.
 * @param {img_list_arr} img_url - The URL of the image to display.
 */
/// image_viewer_local(array, initial array index, initial src)
image_viewer_local(adr_gkschem[0],0,adr_gkschem)
```


End it:
```javascript
//inbuilt
let exit_btn = document.createElement("button");
exit_btn.onclick = function () { terminate(); };
document.body.appendChild(exit_btn);
```


Been building this since 2022.
