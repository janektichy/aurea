function loadScript(url) {
    var script = document.createElement('script');
    script.src = url;
    script.async = true; // Makes the script load asynchronously
    document.body.appendChild(script);
}
const marker = document.getElementById('page-import-marker');
switch (marker.getAttribute('data-page-key')) {
    case 'FAQ_Page':
        loadScript('https://www.aurea.cz/user/documents/ViewScripts/FAQ/view_setup_14.js');
        loadScript('https://www.aurea.cz/user/documents/ViewScripts/FAQ/load_metatags_6.js');
        break;
    case 'Auction_Page':
        loadScript('https://www.aurea.cz/user/documents/ViewScripts/Aukce/view_navigation_7.js');
        break;
    default:
        break;
}