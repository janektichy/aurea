$(document).ready(function () {
    let xml;
    const $menuButton = $('#menuButton');
    const $sectionsContainer = $('#sections');
    const $questionsContainer = $('#questions');
    let storedData = {};

    var marker = document.getElementById('page-meta-marker');
    if (marker) {
        let pageKey = marker.getAttribute('data-page-key');
        if (pageKey === 'FAQ_Page_Id') {
            $.ajax({
                type: "GET",
                url: "/user/documents/DataStructures/FAQ/MAPA.xml",
                dataType: "xml",
                success: function (data) {
                    xml = data;
                    storeData(xml);
                    initializeSections(xml);
                },
                error: function () {
                    console.error("Failed to load XML data.");
                }
            });
        }
    }

    function storeData(xml) {
        $(xml).find('record').each(function () {
            const topicId = $(this).find('Topic_ID').text();
            const questionId = $(this).find('Question_ID').text();
            const answer = $(this).find('Answer').text();
            storedData[`${topicId}-${questionId}`] = answer;
        });
    }

    function initializeSections(xml) {
        const groupedSections = {};
        $(xml).find('record').each(function () {
            const topicId = $(this).find('Topic_ID').text();
            const topic = $(this).find('Topic').text();
            if (!groupedSections[topicId]) {
                groupedSections[topicId] = {
                    title: topic,
                    topicId: topicId
                };
            }
        });

        Object.values(groupedSections).forEach(({ title, topicId }) => {
            const $sectionButton = $(`<button class="section" data-topic="${topicId}">${title}</button>`);
            $sectionsContainer.append($sectionButton);
        });

        const topicId = getTopicIdFromUrl();
        if (topicId) {
            const $sectionButton = $(`.section[data-topic="${topicId}"]`);
            $sectionButton.trigger('click');

            const questionId = getQuestionIdFromUrl();
            if (questionId) {
                const $question = $(`#questions .question[data-id="${questionId}"]`);
                if ($question.length) {
                    $question.trigger('click');
                }
            }
        } else {
            const $defaultSection = $('.section').first();
            if ($defaultSection.length) {
                $defaultSection.trigger('click');
            }
        }
    }

    function getTopicIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('TopicId') || urlParams.get('amp;TopicId');
    }

    function getQuestionIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('QuestionId') || urlParams.get('amp;QuestionId');
    }

    function toggleSections() {
        $sectionsContainer.slideToggle();
    }

    function updateMenuButton(sectionTitle) {
        if (sectionTitle) {
            $menuButton.addClass('selected').text(sectionTitle).append('<span class="menuIcon">&#9776;</span>');
        } else {
            $menuButton.removeClass('selected').text('Výběr sekce').append('<span class="menuIcon">&#9776;</span>');
        }
    }

    $menuButton.on('click', function () {
        toggleSections();
    });

    $(document).on('click', '.section', function () {
        const $button = $(this);
        const topicId = $button.data('topic');

        if ($button.hasClass('selected')) {
            return;
        }

        const $currentSelected = $('.section.selected');
        if ($currentSelected.length) {
            $currentSelected.removeClass('selected');
            $questionsContainer.stop(true, true).slideUp(400, function () {
                $questionsContainer.empty();
                $button.addClass('selected');
                updateMenuButton($button.text());
                loadNewSection(topicId);
                $questionsContainer.slideDown(400);
            });
        } else {
            $button.addClass('selected');
            updateMenuButton($button.text());
            loadNewSection(topicId);
            $questionsContainer.slideDown(400);
        }

        if (window.innerWidth <= 740) {
            $sectionsContainer.slideUp();
        }
    });

    function loadNewSection(topicId) {
        const sectionTitle = $(`.section[data-topic="${topicId}"]`).text();
        $('.questionSectionHeader').text(sectionTitle);

        // Filter records by matching Topic_ID with non-strict equality (==)
        const questions = $(xml).find('record').filter(function() {
            return $.trim($(this).find('Topic_ID').text()) == topicId;
        });
        questions.each(function () {
            const questionText = $(this).find('Question').text();
            const questionId = $(this).find('Question_ID').text();
            const locUrl = $(this).find('loc').text();
            $questionsContainer.append(createQuestionDiv(topicId, questionId, questionText, locUrl));
        });
    }

    function createQuestionDiv(topicId, questionId, questionText, locUrl) {
        const $questionDiv = $('<div></div>', {
            class: 'question',
            'data-id': questionId
        });

        // Hidden SEO link (never visible but present in raw HTML)
        const $hiddenLink = $('<a></a>', {
            class: 'hidden-link',
            href: locUrl,
            text: questionText
        }).css({ position: 'absolute', left: '-9999px' });

        const $headerDiv = $('<div></div>', { class: 'questionHeader' });
        const $textDiv = $('<div></div>', { class: 'questionText', text: questionText });
        const $iconDiv = $('<div></div>', { class: 'questionIcon', text: '+' });
        const $answerDiv = $('<div></div>', { class: 'answer', style: 'display: none;' });

        $headerDiv.append($textDiv, $iconDiv);
        $questionDiv.append($hiddenLink, $headerDiv, $answerDiv);

        $questionDiv.on('click', function () {
            const isVisible = $answerDiv.is(':visible');

            if (!isVisible) {
                const answer = storedData[`${topicId}-${questionId}`] || 'Chyba načítání odpovědi';
                $answerDiv.html(answer);
                $questionDiv.addClass('expanded'); // Add active class for styling
            } else {
                $questionDiv.removeClass('expanded'); // Remove active class
            }

            $iconDiv.text(isVisible ? '+' : '-');
            $answerDiv.slideToggle(300);
        });

        return $questionDiv;
    }

    $(window).on('resize', function () {
        const $headerButtonBox = $('.headerButtonBox');
        if (window.innerWidth <= 740) {
            $headerButtonBox.css({
                'flex-direction': 'column',
                'align-items': 'center',
                'gap': '10px'
            });
        } else {
            $headerButtonBox.css({
                'flex-direction': 'row',
                'justify-content': 'center',
                'gap': '10px'
            });
        }
    }).trigger('resize');
});
