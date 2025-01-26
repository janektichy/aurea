$(document).ready(function () {
    let xml;
    const $menuButton = $('#menuButton');
    const $sectionsContainer = $('#sections');
    const $questionsContainer = $('#questions');
    let activeHeaderSection = null;

    function getTopicCodeFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('topicCode');
    }

    function getQuestionIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('questionId');
    }

    function toggleSections() {
        $sectionsContainer.slideToggle();
    }

    function updateMenuButton(sectionTitle) {
        if (sectionTitle) {
            $menuButton.addClass('selected').text(sectionTitle).append('<span class="menuIcon">&#9776;</span>');
        } else {
            $menuButton.removeClass('selected').text('V\u00FDb\u011Br sekce').append('<span class="menuIcon">&#9776;</span>');
        }
    }

    $menuButton.on('click', function () {
        toggleSections();
    });

    $(document).on('click', '.section', function () {
        const $button = $(this);
        const topicCode = $button.data('topic');

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
                loadNewSection(topicCode);
                $questionsContainer.slideDown(400);
            });
        } else {
            $button.addClass('selected');
            updateMenuButton($button.text());
            loadNewSection(topicCode);
            $questionsContainer.slideDown(400);
        }

        if (window.innerWidth <= 740) {
            $sectionsContainer.slideUp();
        }
    });

    function loadNewSection(topicCode) {
        const sectionTitle = $(`.section[data-topic="${topicCode}"]`).text();
        $('.questionSectionHeader').text(sectionTitle);

        $(xml).find(`SECTION[topicCode="${topicCode}"] QUESTION`).each(function () {
            const questionText = $(this).find('text').text();
            const answerText = $(this).find('answer').text();
            const questionId = $(this).attr('id');
            const questionIndex = $(this).attr('index');
            $questionsContainer.append(createQuestionDiv(questionId, questionIndex, questionText, answerText));
        });
    }

    function createQuestionDiv(questionId, questionIndex, questionText, answerText) {
        const $questionDiv = $('<div></div>', {
            class: 'question',
            'data-id': questionId,
            'data-index': questionIndex
        });

        const $headerDiv = $('<div></div>', { class: 'questionHeader' });
        const $textDiv = $('<div></div>', { class: 'questionText', text: questionText });
        const $iconDiv = $('<div></div>', { class: 'questionIcon', text: '+' });

        const isHtml = answerText.trim().startsWith('<');
        const $answerDiv = isHtml
            ? $('<div></div>', { class: 'answer' }).html(answerText)
            : $('<div></div>', { class: 'answer', text: answerText });

        $headerDiv.append($textDiv, $iconDiv);
        $questionDiv.append($headerDiv, $answerDiv);

        $questionDiv.on('click', function () {
            const isVisible = $answerDiv.is(':visible');
            $iconDiv.text(isVisible ? '+' : '-');
            $answerDiv.slideToggle(300);
            if (isVisible) {
                $questionDiv.removeClass('expanded');
            } else {
                $questionDiv.addClass('expanded');
            }
        });

        return $questionDiv;
    }

    // Logic for navBack button
    document.querySelector('.headerButton').addEventListener('click', function () {
        const referrer = document.referrer;
        const portalUrl = 'https://www.aurea.cz/';

        if (referrer && referrer.startsWith(portalUrl)) {
            window.history.back();
        } else {
            console.log('No valid portal referrer found.');
        }
    });

    $(window).on('resize', function () {
        if (window.innerWidth > 740) {
            $sectionsContainer.show();
            $menuButton.hide();
        } else {
            $sectionsContainer.hide();
            $menuButton.show();

            const $selectedSection = $('.section.selected');
            if ($selectedSection.length) {
                updateMenuButton($selectedSection.text());
            } else {
                updateMenuButton();
            }
        }
    }).trigger('resize');

    $.ajax({
        type: "GET",
        url: "../xml/faq-data.xml",
        dataType: "xml",
        success: function (data) {
            xml = data;
            $(xml).find('SECTION').each(function () {
                const title = $(this).find('title').text();
                const topicCode = $(this).attr('topicCode');
                $('#sections').append(`<button class="section" data-topic="${topicCode}">${title}</button>`);
            });

            const topicCode = getTopicCodeFromUrl();
            if (topicCode) {
                const $sectionButton = $(`.section[data-topic="${topicCode}"]`);
                $sectionButton.trigger('click');

                const questionId = getQuestionIdFromUrl();
                if (questionId) {
                    const $question = $(`#questions .question[data-id="${questionId}"]`);
                    if ($question.length) {
                        $question.trigger('click');
                    }
                }
            } else {
                const $defaultSection = $('.section[data-topic="GENERAL2"]');
                if ($defaultSection.length) {
                    $defaultSection.trigger('click');
                }
            }
        },
        error: function () {
            console.error("Failed to load XML data.");
        }
    });
});
