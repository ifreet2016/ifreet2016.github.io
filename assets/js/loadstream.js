/**
 * Display search results
 * @param {string} panelId - The Search container's element id
 * @param {Object} data - Stream search results from Twitch api
 */
function displayResult(panelId, data) {
    if (document.getElementById('item-container')) {
        // remove extra items and update all items.
        updateSearchList(data);
        updatePagination(data);
    } else {
        createSearchList(panelId, data);
    }
}

/**
 * Init DOM for the first loading stream data
 * @param {string} panelId - The Search container's element id
 * @param {Object} data - Stream search results from Twitch api
 */
function createSearchList(panelId, data) {
    var topBarDiv = document.createElement('div'),
        panelDiv = document.getElementById('result-panel'),
        resultNumDiv = document.createElement('div'),
        paginationDiv = document.createElement('div'),
        leftArrow = document.createElement('div'),
        rightArrow = document.createElement('div'),
        pageNumber = document.createElement('span'),
        itemContainerDiv = document.createElement('div'),
        itemLength = data.streams.length,
        totalPageNumber = Math.ceil(data._total/10),
        currentPage = 1;

    topBarDiv.id = "top-bar";
    resultNumDiv.className = "result-number";
    pageNumber.id = "page-number";
    paginationDiv.className = "top-paging";
    leftArrow.className = "left-arrow";
    rightArrow.className = "right-arrow";
    itemContainerDiv.id = "item-container";

    leftArrow.addEventListener('click', function(event) {
        event.preventDefault();
        if (typeof data._links.prev !== 'undefined') {
            JSONP.get(data._links.prev + '&callback=updateResults', function(updatedData) {
                if (currentPage > 1) {
                    data = updatedData;
                    updateSearchList(updatedData);
                    currentPage--;
                    pageNumber.innerHTML = currentPage + '/' + totalPageNumber;
                }
            });
        }
    }, false);

    rightArrow.addEventListener('click', function(event) {
        event.preventDefault();
        if (typeof data._links.next !== 'undefined') {
            JSONP.get(data._links.next + '&callback=updateResults', function(updatedData) {
                if (updatedData._links.hasOwnProperty('next') && currentPage < totalPageNumber) { //prev exists
                    data = updatedData;
                    updateSearchList(updatedData);
                    currentPage++;
                    pageNumber.innerHTML = currentPage + '/' + totalPageNumber;
                }
            });
        }
    }, false);

    resultNumDiv.appendChild(document.createTextNode('Total results: ' + data._total));
    if (totalPageNumber) {
        paginationDiv.appendChild(leftArrow);
        pageNumber.appendChild(document.createTextNode('1/' + totalPageNumber));
        paginationDiv.appendChild(pageNumber);
        paginationDiv.appendChild(rightArrow);
    }

    topBarDiv.appendChild(resultNumDiv);
    topBarDiv.appendChild(paginationDiv);

    panelDiv.appendChild(topBarDiv);
    panelDiv.appendChild(itemContainerDiv);

    for (var i = 0; i < itemLength; i++) {
        var item = document.createElement('div');
        item.setAttribute('class', 'result-item');

        addEleToItem(item, data.streams);
        itemContainerDiv.appendChild(item);
    }
    updateItemContent(itemContainerDiv, data.streams);

}

/**
 * Attach elements to each stream (preview, game, viewers and description)
 * @param {Object} item - DOM object of each stream
 */
function addEleToItem(item) {
    var leftCol = document.createElement('div'),
        rightCol = document.createElement('div'),
        preview = document.createElement('img'),
        itemTitle = document.createElement('h3'),
        itemBody = document.createElement('div'),
        itemInfo = document.createElement('div'),
        gameName = document.createElement('div'),
        viewers = document.createElement('div'),
        desc = document.createElement('div');

    rightCol.className = 'item-right-col';
    itemTitle.className = 'item-title';
    itemBody.className = 'item-body';
    itemInfo.className = 'item-info';
    gameName.className = 'game-name';
    viewers.className = 'viewers';
    desc.className = 'item-description';

    itemInfo.appendChild(gameName);
    itemInfo.appendChild(viewers);

    itemBody.appendChild(itemInfo);
    itemBody.appendChild(desc);

    leftCol.appendChild(preview);
    rightCol.appendChild(itemTitle);
    rightCol.appendChild(itemBody);

    item.appendChild(leftCol);
    item.appendChild(rightCol);

}

/**
 * Update result list after click next, prev or search button
 * @param {Object} data - Updated stream search results from Twitch api
 */
function updateSearchList(data) {
    var containerDiv = document.getElementById('item-container'),
        items = containerDiv.childNodes,
        itemLength = items.length,
        streamNumber = data.streams.length;

    if (data.streams.length === 0) {
        document.querySelector('.result-number').innerHTML = 'Total results: ' + data._total; //edit
    } else {
        munipulateItems(containerDiv, streamNumber - itemLength);
        // Update item Content
        updateItemContent(containerDiv, data.streams);

        // Update Total results
        document.querySelector('.result-number').innerHTML = 'Total results: ' + data._total;
    }
}

/**
 * Update pagination, update event callback to get updated _links
 * @param {Object} data - Updated stream search results from Twitch api
 */
function updatePagination(data) {
    var paginationDiv = document.querySelector('.top-paging'),
        leftArrow = document.createElement('div'),
        rightArrow = document.createElement('div'),
        pageNumber = document.createElement('span'),
        totalPageNumber = Math.ceil(data._total/10),
        currentPage = 1;

    while (paginationDiv.firstChild) {
        paginationDiv.removeChild(paginationDiv.firstChild);
    }

    leftArrow.className = "left-arrow";
    rightArrow.className = "right-arrow";

    paginationDiv.appendChild(leftArrow);
    pageNumber.appendChild(document.createTextNode(currentPage + '/' + totalPageNumber));
    paginationDiv.appendChild(pageNumber);
    paginationDiv.appendChild(rightArrow);

    leftArrow.addEventListener('click', function(event) {
        event.preventDefault();
        if (typeof data._links.prev !== 'undefined') {
            JSONP.get(data._links.prev + '&callback=updateResults', function(updatedData) {
                if (currentPage > 1) {
                    data = updatedData;
                    updateSearchList(updatedData);
                    currentPage--;
                    pageNumber.innerHTML = currentPage + '/' + totalPageNumber;
                }
            });
        }
    }, false);

    rightArrow.addEventListener('click', function(event) {
        event.preventDefault();
        if (typeof data._links.next !== 'undefined') {
            JSONP.get(data._links.next + '&callback=updateResults', function(updatedData) {
                if (updatedData._links.hasOwnProperty('next') && currentPage < totalPageNumber) { //prev exists
                    data = updatedData;
                    updateSearchList(updatedData);
                    currentPage++;
                    pageNumber.innerHTML = currentPage + '/' + totalPageNumber;
                }
            });
        }
    }, false);



}

/**
 * Add/remove DOM elements when updating stream search results,
 * keep most useful DOM elements in order to improve performance.
 * @param {Object} container - The DOM object of search list container.
 * @param {Number} diff - The number shows next/prev page result difference
 *                        comparing to current page.
 *                        Negative number - less results,
 *                        Positive number - more results.
 */
function munipulateItems(container, diff) {
    var i = 0,
        flag = (diff >= 0) ? 1 : 0,
        diff = Math.abs(diff);

    while (i < diff) {
        if (flag) {
            var item = document.createElement('div');

            item.setAttribute('class', 'result-item');

            // add item content
            addEleToItem(item);

            container.appendChild(item);
        } else {
            var existingItems = container.childNodes;
            container.removeChild(existingItems[existingItems.length-1])
        }
        i++;
    }
}

/**
 * Update content for items in search result list.
 * @param {Object} itemContainer - The DOM object of search list container.
 * @param {Object} streams - Stream array from updated JSON object returned by
 *                           Twitch.tv
 */
function updateItemContent(itemContainer, streams) {
    var items = itemContainer.childNodes,
        len = items.length;

    for (var i = 0; i < len; i++) {
        var item = items[i],
            stream = streams[i],
            gamePreview = item.querySelector('img'),
            gameTitle = item.querySelector('h3'),
            gameName = item.querySelector('.game-name'),
            viewers = item.querySelector('.viewers'),
            desc = item.querySelector('.item-description');

        gamePreview.src = stream.preview.medium;
        gameTitle.innerHTML = stream.channel.status;
        gameName.innerHTML = stream.game;
        viewers.innerHTML = stream.viewers + ' viewers';
        desc.innerHTML = stream.channel.display_name + ' playing ' + stream.game;
    }
}































//end
