// Wait for HTML page to load, so the page marker is locatable
document.addEventListener('DOMContentLoaded', function() {
    // Locate hidden page marker
    var marker = document.getElementById('page-meta-marker');
    if (marker) {
        let pageKey = marker.getAttribute('data-page-key');
        // Get the page-specific key from the data attribute

        // If page is FAQ, load meta tag config from XML
        if (pageKey === 'FAQ_Page_Id') { // Fixed comparison operator
            const urlParams = new URLSearchParams(window.location.search);
            let topicId = getTopicIdFromUrl(),
                questionId = getQuestionIdFromUrl();
            loadFAQMetaTags(topicId, questionId);
        }
    } // <- This closing bracket was missing

    function loadFAQMetaTags(topicId, questionId) {
        $.ajax({
            type: "GET",
            url: "/user/documents/upload/res/MAPA.xml",
            dataType: "xml",
            success: function (xml) {
                let found = false;
                const metaKeys = ["title", "description"]; // Define keys to add into meta tags

                // Loop Questions
                $(xml).find("record").each(function () {
                    const $record = $(this);
                    if ($record.find("Topic_ID").text() === topicId && $record.find("Question_ID").text() === questionId) {
                        found = true;

                        metaKeys.forEach((key) => {
                            const value = $record.find(key).text();
                            if (value) {
                                let $metaTag = document.querySelector(`meta[property="og:${key}"]`);
                                if ($metaTag) {
                                    $metaTag.content = value; // Update existing meta tag
                                } else {
                                    $("head").append(`<meta name="og:${key}" content="${value}">`); // Create new one if missing
                                }
                            }
                        });
                        return false; // Exit loop when Question found
                    }
                });
                if (found = false){
                    console.error("Id retrieved from url was not found in the xml document.")
                }
            },
            error: function () {
                console.error("Failed to load XML configuration for FAQ meta tags.");
            }
        });
    }

    function getTopicIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('TopicId')){
            return urlParams.get('TopicId');
        }
        else{
            // Change the param name to fix wrong page indexing
            return urlParams.get('amp;TopicId');
        }
    }
    
    function getQuestionIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('QuestionId')){
            return urlParams.get('QuestionId');
        }
        else{
            // Change the param name to fix wrong page indexing
            return urlParams.get('amp;QuestionId');
        }
    }
});