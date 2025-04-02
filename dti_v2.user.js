// ==UserScript==
// @name         Dress to Impress - Jellyneo Price Display
// @namespace    neopets, jellyneo, dress to impress.
// @version      1.6.3
// @description  Enhances Dress to Impress by displaying Jellyneo price data for Neopets items with search links (using Dicerollers Search Helper foundation), clipboards neobot compatible.
// @author       Laurore
// @match        https://impress.openneo.net/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      items.jellyneo.net
// @connect      images.neopets.com
// @connect      itemdb.com.br
// @run-at       document-idle
// @downloadURL  https://github.com/l0aurore/DTI-JN-Search-Helper/raw/refs/heads/main/DTI_Search_Helper.user.js
// @updateURL    https://github.com/l0aurore/DTI-JN-Search-Helper/raw/refs/heads/main/DTI_Search_Helper.user.js
// ==/UserScript==

(function () {
    "use strict";

    // Debug mode - set to true to enable console logging
    const DEBUG = true;

    // Search icons configuration - inspired by NeoSearchHelper script by diceroll123
    const SEARCH_ICONS = {
        sw: {
            url: "https://www.neopets.com/shops/wizard.phtml?string=%s",
            img: "http://images.neopets.com/themes/h5/basic/images/shopwizard-icon.png",
            title: "Shop Wizard",
        },
        tp: {
            url: "https://www.neopets.com/island/tradingpost.phtml?type=browse&criteria=item_exact&search_string=%s",
            img: "http://images.neopets.com/themes/h5/basic/images/tradingpost-icon.png",
            title: "Trading Post",
        },
        au: {
            url: "https://www.neopets.com/genie.phtml?type=process_genie&criteria=exact&auctiongenie=%s",
            img: "http://images.neopets.com/themes/h5/basic/images/auction-icon.png",
            title: "Auction House",
        },
        SBD: {
            url: "https://www.neopets.com/safetydeposit.phtml?obj_name=%s&category=0",
            img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAECklEQVRYhe1WS08jRxD+qj2PHQ8gbLB5SgaBQKDkyokDXPIbOOcX5RJFSi45RcovyCESIocoOawQSHhxQDwMEg/j4CEz4/FO90zlwIzXsMbrELTaw35SH2ZUVd/XVdVdDXzGZ3yKIKKPxwUAlmVNFAqFNcMwviwUChfZbPZ8b2/vLTP/PTg4eCuE8E9OTlgpxQDeAmgBYAB6EkcCiADESUzu4NASO5H8l8nitoCZmZmv19fXf3AcR0xNTcUDAwOy1WqBmZtE9I+U0t/Z2ckwc2wYhgOgngTIJiR+IirqEMAJ6SsANgADgALgE5F/c3PzZ7lc/lYTQmB6enpI3AOGYYhsNmtalgUAJoAcEWF2dhZhGMJ1Xei6DsMwwNy50f4QBAFM04RlWROVS",
            title: "SDB",
        },
        closet: {
            url: "https://www.neopets.com/closet.phtml?obj_name=%s",
            img: "http://images.neopets.com/items/ffu_illusen_armoire.gif",
            title: "Closet",
        },
        idb: {
           url: "https://itemdb.com.br/item/%s",
           img: "https://images.neopets.com/themes/h5/basic/images/v3/quickstock-icon.svg",
           title: "Item DB",
     }
    };

    // Discord share configuration for neobot
    const DISCORD_SHARE = {
        dti: {
            command: "!dti %s",
            img: "https://impress.openneo.net/favicon.ico",
            title: "Share to Neobot (!dti)"
        },
        jn: {
            command: "!jn %s",
            img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAHsUlEQVRYhe1XWWxU1xn+zrnbbJ4Zz+ZZvNvgBUMKIS3QNBhSCCJqo1ZNq1YqihqE1KoP7WPUB9THRnnpQ6pKrRRFqC9EgpS0aoOSICgtlgx4AUMce4z3ZWzPPnfucs49fXAwdsEFqlZ56ZHu0/3P/33/p/8/5zvA/9cXvMh/LdF6JgIhxP+OQCKRkBobG925XE5MT00Zfp83pbhcHdF4oplzR3ZrWnFmcmLCtOy05vUlJQI/HD6xupqdrRrGQ/nkpyUgyzI91Nt7KD2RjolAeJ9R3/FCpaGrab6pQ4WsAuW8g/Stsjo2MIn2Xcky4/7GGvdoYPDKr0b7rp5ljsP+YwUopUgl4i2Jtu1v30v2HHaOndBoazeEoYMuTEIQApJsBgmGwRdmYFw6D",
            title: "Share to Neobot (!jn)"
        }
    };

    // List of zone labels to exclude (these are not actual items)
    const EXCLUDED_ZONES = [
        "Zone",
        "Background",
        "Foreground",
        "Lower Foreground Item",
        "Upper Foreground Item",
        "Biology Effects",
        "Belt",
        "Collar",
        "Hat",
        "Jacket",
        "Shoes",
        "Gloves",
        "Helmet",
        "Cape",
        "Dress",
        "Lower Body",
        "Upper Body",
        "Body",
        "Static",
        "Animated",
        "Higher FG Item",
        "Right-hand Item",
        "BG Item",
        "Shirt/Dress",
        "Left-hand Item",
        "Trousers",
        "Necklace",
        "Earrings",
        "Markings",
        "Glasses",
        "Hind Cover",
        "Backpack",
        "Wings",
        "Bio Effects",
        "Lower FG Item",
        "Sound Effects",
        "Thought Bubble",
        // Prefixed with "Zone: "
        "Zone: Belt",
        "Zone: Biology Effects",
        "Zone: Body",
        "Zone: Collar",
        "Zone: Hat",
        "Zone: Lower Body",
        "Zone: Gloves",
        "Zone: Shoes",
        "Zone: Upper Body",
        "Zone: Cape",
        "Zone: Dress",
        "Zone: Helmet",
        "Zone: Jacket",
        "Zone: Background",
        "Zone: Foreground",
        "Zone: Background Item",
        "Zone: Lower Foreground Item",
        "Zone: Upper Foreground Item",
        "Zone: Right-hand Item",
    ];

    // Log function that only outputs when debug mode is on
    function debugLog(...args) {
        if (DEBUG) {
            console.log("[DTI-JN Price]", ...args);
        }
    }

    // Cache configuration
    const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const CACHE_PREFIX = "jellyneo_price_";

    // Style configuration
    const priceStyle = {
        color: "#4B9E65", // Green color for prices
        fontWeight: "bold",
        fontSize: "0.9em",
        padding: "0 5px",
        borderRadius: "3px",
        background: "rgba(75, 158, 101, 0.1)",
        display: "inline-block",
        margin: "0 5px",
    };

    // Loading indicator style
    const loadingStyle = {
        color: "#999",
        fontStyle: "italic",
        fontSize: "0.9em",
    };

    // Error style
    const errorStyle = {
        color: "#c55",
        fontSize: "0.9em",
        fontStyle: "italic",
    };

    /**
     * Main initialization function that sets up observers and handlers
     */
    function initialize() {
        console.log("Dress to Impress - Jellyneo Price Display: Initializing");

        // Create a mutation observer to detect when new items are added to the DOM
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            processNewElements(node);
                        }
                    }
                }
            });
        });

        // Start observing the document body for changes
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        // Process existing elements
        processNewElements(document.body);
    }

    /**
     * Process new elements to find items and add price information
     * @param {Element} parentNode - The parent node to process
     */
    function processNewElements(parentNode) {
        debugLog("Processing new elements in", parentNode);

        // Find all possible item elements in DTI
        // Looking for item names in the sidebar, wardrobe, and search results

        // Process sidebar items
        const sidebarItems = parentNode.querySelectorAll(".item-container");
        if (sidebarItems.length > 0) {
            debugLog("Found", sidebarItems.length, "sidebar items");
            sidebarItems.forEach(processItemElement);
        }

        // Process wardrobe items
        const wardrobeItems = parentNode.querySelectorAll(".item-card");
        if (wardrobeItems.length > 0) {
            debugLog("Found", wardrobeItems.length, "wardrobe items");
            wardrobeItems.forEach(processItemElement);
        }

        // Process items in search results
        const searchResultItems = parentNode.querySelectorAll(
            ".item-container, [data-item-id]",
        );
        if (searchResultItems.length > 0) {
            debugLog("Found", searchResultItems.length, "search result items");
            searchResultItems.forEach(processItemElement);
        }

        // Additional selectors for the specific layout shown in the screenshot
        const listItems = parentNode.querySelectorAll("li, tr, .item");
        if (listItems.length > 0) {
            listItems.forEach((item) => {
                const nameElement = item.querySelector(
                    '[class*="name"], [class*="label"], span:not(:empty)',
                );
                if (
                    nameElement &&
                    !nameElement.querySelector(".jellyneo-price")
                ) {
                    const itemName = nameElement.textContent.trim();
                    if (itemName && itemName.length > 3) {
                        debugLog("Potential item name found:", itemName);
                        processGenericItemElement(item, nameElement, itemName);
                    }
                }
            });
        }
    }

    /**
     * Process an individual item element to add price information
     * @param {Element} itemElement - The item element to process
     */
    function processItemElement(itemElement) {
        // Check if we've already processed this element
        if (itemElement.querySelector(".jellyneo-price")) {
            return;
        }

        // Find the item name
        let itemNameElement;
        let itemName;
        let isNCItem = false;

        // Check if the item is an NC item (Neocash instead of Neopoints)
        if (
            itemElement.textContent.includes("NC") &&
            !itemElement.textContent.includes("NP")
        ) {
            isNCItem = true;
            debugLog("NC item detected");
        }

        // Try multiple strategies to find the item name

        // Strategy 1: For sidebar items
        if (itemElement.classList.contains("item-container")) {
            itemNameElement = itemElement.querySelector(".item-name");
            if (itemNameElement) {
                itemName = itemNameElement.textContent.trim();
                debugLog("Found sidebar item:", itemName);
            }
        }
        // Strategy 2: For wardrobe items
        else if (itemElement.classList.contains("item-card")) {
            itemNameElement = itemElement.querySelector(
                ".item-name, .item-label",
            );
            if (itemNameElement) {
                itemName = itemNameElement.textContent.trim();
                debugLog("Found wardrobe item:", itemName);
            }
        }
        // Strategy 3: For the layout shown in the screenshot (item list with NP markers)
        if (!itemName) {
            // Find elements with "NP" text nearby
            const npElement = itemElement.querySelector(
                "*:not(.jellyneo-price)",
            );
            if (
                npElement &&
                (npElement.textContent.includes("NP") ||
                    npElement.textContent.includes("NC"))
            ) {
                // Look for a previous sibling or parent that might contain the item name
                const possibleNameElements = [
                    itemElement.querySelector(
                        '[class*="name"], [class*="label"], strong, b, span:not(:empty)',
                    ),
                    itemElement.firstElementChild,
                ];

                for (const el of possibleNameElements) {
                    if (
                        el &&
                        el.textContent.trim() &&
                        !el.textContent.includes("NP") &&
                        !el.textContent.includes("NC")
                    ) {
                        itemNameElement = el;
                        itemName = el.textContent.trim();
                        debugLog("Found item with NP/NC marker:", itemName);
                        break;
                    }
                }

                // If no name element found but the item element itself has text
                if (!itemName && itemElement.textContent.trim()) {
                    // Try to extract item name from the element's text
                    const text = itemElement.textContent.trim();
                    // Split by either NP or NC
                    const parts = text.split(/NP|NC/);
                    if (parts.length > 0 && parts[0].trim()) {
                        itemName = parts[0].trim();
                        debugLog("Extracted item name from text:", itemName);
                    }
                }
            }
        }

        // Strategy 4: For data attribute item IDs
        if (!itemName && itemElement.hasAttribute("data-item-id")) {
            const itemId = itemElement.getAttribute("data-item-id");
            // Find a name element within the container
            const nameEl = itemElement.querySelector(
                '[class*="name"], [class*="label"], strong, b',
            );
            if (nameEl) {
                itemName = nameEl.textContent.trim();
                debugLog("Found item by data-item-id:", itemName);
            }
        }

        // Strategy 5: Final fallback - try to find any text that looks like an item name
        if (!itemName) {
            const possibleTextNodes = Array.from(itemElement.childNodes).filter(
                (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
            );
            
            if (possibleTextNodes.length > 0) {
                const text = possibleTextNodes[0].textContent.trim();
                if (text.length > 3 && !text.includes("NP") && !text.includes("NC")) {
                    itemName = text;
                    debugLog("Found potential item name from text node:", itemName);
                }
            }
        }

        // If we found an item name and the item is not already processed
        if (itemName && !EXCLUDED_ZONES.includes(itemName)) {
            debugLog("Processing item:", itemName);
            if (isNCItem) {
                // Don't fetch prices for NC items
                addNCIndicator(itemElement, itemNameElement || itemElement, itemName);
            } else {
                // Fetch price from Jellyneo for NP items
                addPriceElement(itemElement, itemNameElement || itemElement, itemName);
            }
        }
    }

    /**
     * Process a generic item element (fallback method)
     * @param {Element} itemElement - The container element
     * @param {Element} nameElement - The element containing the item name
     * @param {string} itemName - The item name
     */
    function processGenericItemElement(itemElement, nameElement, itemName) {
        // Skip excluded zone labels
        if (EXCLUDED_ZONES.includes(itemName)) {
            return;
        }

        // Check if we already processed this element
        if (nameElement.querySelector(".jellyneo-price")) {
            return;
        }

        debugLog("Processing generic item:", itemName);

        // Determine if it's an NC item
        const isNCItem =
            itemElement.textContent.includes("NC") &&
            !itemElement.textContent.includes("NP");

        if (isNCItem) {
            addNCIndicator(itemElement, nameElement, itemName);
        } else {
            addPriceElement(itemElement, nameElement, itemName);
        }
    }

    /**
     * Create and add a price element to the DOM
     * @param {Element} itemElement - The container element
     * @param {Element} nameElement - The element to append the price to
     * @param {string} itemName - The item name
     */
    function addPriceElement(itemElement, nameElement, itemName) {
        // Create a price container
        const priceContainer = document.createElement("span");
        priceContainer.className = "jellyneo-price";
        priceContainer.textContent = "Checking...";

        // Apply loading style
        Object.assign(priceContainer.style, loadingStyle);

        // Append the price container to the name element
        nameElement.appendChild(priceContainer);

        // Fetch price information from Jellyneo (or cache)
        fetchJellyneoPrice(itemName)
            .then((price) => {
                if (price) {
                    // Update the price container with the actual price
                    priceContainer.textContent = formatNumber(price) + " NP";
                    
                    // Apply price style
                    Object.assign(priceContainer.style, priceStyle);
                    
                } else {
                    // Item not found or no price available
                    priceContainer.textContent = "No price data";
                    Object.assign(priceContainer.style, errorStyle);
                }
                
                // Always add item search links, even if no price is found
                addItemSearchLinks(itemElement, nameElement, itemName);
            })
            .catch((error) => {
                debugLog("Error fetching price:", error);
                priceContainer.textContent = "Error";
                Object.assign(priceContainer.style, errorStyle);
                
                // Add search links even on error
                addItemSearchLinks(itemElement, nameElement, itemName);
            });
    }

    /**
     * Fetch owl value for NC items from ItemDB
     * @param {string} itemName - The item name
     * @returns {Promise<number|null>} The owl value, or null if not found
     */
    function fetchItemDBOwlValue(itemName) {
        // Create cache key for owl values
        const cacheKey = "owl_value_" + itemName;
        const cachedData = GM_getValue(cacheKey);
        
        if (cachedData) {
            const { timestamp, data } = cachedData;
            const now = Date.now();

            // Check if the cache has expired
            if (now - timestamp < CACHE_EXPIRY) {
                debugLog("Using cached owl value for", itemName);
                return Promise.resolve(data);
            } else {
                debugLog("Owl value cache expired for", itemName);
            }
        }
        
        // Per ItemDB docs, use the official search endpoint
        const searchUrl = "https://itemdb.com.br/api/v1/search?q=" + encodeURIComponent(itemName);
        
        debugLog("Searching for item:", itemName, "using ItemDB API");
        
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: searchUrl,
                headers: {
                    "Accept": "application/json"
                },
                timeout: 15000,
                onload: function(response) {
                    if (response.status === 200) {
                        try {
                            const results = JSON.parse(response.responseText);
                            debugLog("ItemDB search response:", results);
                            
                            if (!results || !results.items || results.items.length === 0) {
                                debugLog("No items found in ItemDB search");
                                resolve(null);
                                return;
                            }
                            
                            // Find an exact match if possible (case insensitive), or use the first result
                            let bestItem = results.items[0];
                            let bestMatchScore = 0;
                            
                            for (const item of results.items) {
                                // Skip non-NC items
                                if (item.type !== "nc") continue;
                                
                                // Perfect match
                                if (item.name.toLowerCase() === itemName.toLowerCase()) {
                                    bestItem = item;
                                    debugLog("Found exact match for NC item:", item.name);
                                    break;
                                }
                                
                                // Calculate a similarity score
                                const nameLower = item.name.toLowerCase();
                                const searchLower = itemName.toLowerCase();
                                
                                // Simple score based on whether the name contains all the words in the search
                                const searchWords = searchLower.split(/\s+/);
                                let wordCount = 0;
                                for (const word of searchWords) {
                                    if (word.length > 2 && nameLower.includes(word)) {
                                        wordCount++;
                                    }
                                }
                                
                                const score = wordCount / searchWords.length;
                                if (score > bestMatchScore) {
                                    bestMatchScore = score;
                                    bestItem = item;
                                }
                            }
                            
                            // If the item isn't NC type, we don't need owl value
                            if (bestItem.type !== "nc") {
                                debugLog("Best match item is not NC type:", bestItem.name, bestItem.type);
                                resolve(null);
                                return;
                            }
                            
                            debugLog("Best match NC item:", bestItem.name, "with ID:", bestItem.id);
                            
                            // Get the item details to find the owl value
                            if (bestItem.id) {
                                const itemUrl = "https://itemdb.com.br/api/v1/items/" + bestItem.id;
                                
                                GM_xmlhttpRequest({
                                    method: "GET",
                                    url: itemUrl,
                                    headers: {
                                        "Accept": "application/json"
                                    },
                                    timeout: 15000,
                                    onload: function(detailResponse) {
                                        if (detailResponse.status === 200) {
                                            try {
                                                const itemDetails = JSON.parse(detailResponse.responseText);
                                                debugLog("Item details response:", itemDetails);
                                                
                                                // Check for owl value in various possible locations
                                                let owlValue = null;
                                                let owlRange = null; // Store range information if present
                                                
                                                // Helper function to extract range from string
                                                const extractRange = (str) => {
                                                    if (typeof str !== 'string') return null;
                                                    
                                                    // Check for range format (e.g., "4-5", "~4-5", "4~5")
                                                    const rangeMatch = str.match(/(\d+(?:\.\d+)?)\s*[-~]\s*(\d+(?:\.\d+)?)/);
                                                    if (rangeMatch) {
                                                        return {
                                                            min: parseFloat(rangeMatch[1]),
                                                            max: parseFloat(rangeMatch[2])
                                                        };
                                                    }
                                                    
                                                    // Check for single value with modifier (e.g., "~4", "≈4")
                                                    const approxMatch = str.match(/[~≈]\s*(\d+(?:\.\d+)?)/);
                                                    if (approxMatch) {
                                                        const value = parseFloat(approxMatch[1]);
                                                        return {
                                                            min: value,
                                                            max: value
                                                        };
                                                    }
                                                    
                                                    // Check for plain number in string
                                                    const numMatch = str.match(/(\d+(?:\.\d+)?)/);
                                                    if (numMatch && !isNaN(parseFloat(numMatch[1]))) {
                                                        const value = parseFloat(numMatch[1]);
                                                        return {
                                                            min: value,
                                                            max: value
                                                        };
                                                    }
                                                    
                                                    return null;
                                                };
                                                
                                                // First check the dedicated value property
                                                if (itemDetails.value) {
                                                    if (typeof itemDetails.value.owls === 'number') {
                                                        owlValue = itemDetails.value.owls;
                                                    } else if (typeof itemDetails.value.owls === 'string') {
                                                        owlRange = extractRange(itemDetails.value.owls);
                                                        if (owlRange) {
                                                            owlValue = owlRange;
                                                        }
                                                    } else if (itemDetails.value.ncValue) {
                                                        if (typeof itemDetails.value.ncValue === 'number') {
                                                            owlValue = itemDetails.value.ncValue;
                                                        } else if (typeof itemDetails.value.ncValue === 'string') {
                                                            owlRange = extractRange(itemDetails.value.ncValue);
                                                            if (owlRange) {
                                                                owlValue = owlRange;
                                                            }
                                                        }
                                                    }
                                                }
                                                
                                                // Check in estimated prices object
                                                if (owlValue === null && itemDetails.estimatedPrices) {
                                                    if (typeof itemDetails.estimatedPrices.owls === 'number') {
                                                        owlValue = itemDetails.estimatedPrices.owls;
                                                    } else if (typeof itemDetails.estimatedPrices.owls === 'string') {
                                                        owlRange = extractRange(itemDetails.estimatedPrices.owls);
                                                        if (owlRange) {
                                                            owlValue = owlRange;
                                                        }
                                                    }
                                                }
                                                
                                                // Check in prices object as a fallback
                                                if (owlValue === null && itemDetails.prices) {
                                                    if (typeof itemDetails.prices.owls === 'number') {
                                                        owlValue = itemDetails.prices.owls;
                                                    } else if (typeof itemDetails.prices.owls === 'string') {
                                                        owlRange = extractRange(itemDetails.prices.owls);
                                                        if (owlRange) {
                                                            owlValue = owlRange;
                                                        }
                                                    } else if (itemDetails.prices.ncValue) {
                                                        if (typeof itemDetails.prices.ncValue === 'number') {
                                                            owlValue = itemDetails.prices.ncValue;
                                                        } else if (typeof itemDetails.prices.ncValue === 'string') {
                                                            owlRange = extractRange(itemDetails.prices.ncValue);
                                                            if (owlRange) {
                                                                owlValue = owlRange;
                                                            }
                                                        }
                                                    }
                                                }

                                                // If all else fails, look for any property with "owl" in the name
                                                if (owlValue === null) {
                                                    // Search through all properties recursively to find any owl value
                                                    const searchForOwls = (obj, path = '') => {
                                                        if (!obj || typeof obj !== 'object') return;
                                                        
                                                        Object.keys(obj).forEach(key => {
                                                            const fullPath = path ? `${path}.${key}` : key;
                                                            
                                                            if (key.toLowerCase().includes('owl') && owlValue === null) {
                                                                if (typeof obj[key] === 'number') {
                                                                    owlValue = obj[key];
                                                                    debugLog("Found owl value in property:", fullPath);
                                                                } else if (typeof obj[key] === 'string') {
                                                                    owlRange = extractRange(obj[key]);
                                                                    if (owlRange) {
                                                                        owlValue = owlRange;
                                                                        debugLog("Found owl range in property:", fullPath);
                                                                    }
                                                                }
                                                            }
                                                            
                                                            if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                                                                searchForOwls(obj[key], fullPath);
                                                            }
                                                        });
                                                    };
                                                    
                                                    searchForOwls(itemDetails);
                                                }
                                                
                                                // Log results for debugging
                                                if (owlValue !== null) {
                                                    if (typeof owlValue === 'object' && owlValue.min !== undefined) {
                                                        debugLog("Found owl range:", owlValue.min, "-", owlValue.max, "for item:", bestItem.name);
                                                    } else {
                                                        debugLog("Found owl value:", owlValue, "for item:", bestItem.name);
                                                    }
                                                } else {
                                                    debugLog("No owl value found for item:", bestItem.name);
                                                    debugLog("Item details:", JSON.stringify(itemDetails, null, 2));
                                                }
                                                
                                                // Cache the result
                                                GM_setValue(cacheKey, {
                                                    timestamp: Date.now(),
                                                    data: owlValue
                                                });
                                                
                                                resolve(owlValue);
                                            } catch (error) {
                                                debugLog("Error parsing item details:", error);
                                                resolve(null);
                                            }
                                        } else {
                                            debugLog("HTTP error from item details:", detailResponse.status);
                                            resolve(null);
                                        }
                                    },
                                    onerror: function(error) {
                                        debugLog("Request error for item details:", error);
                                        resolve(null);
                                    },
                                    ontimeout: function() {
                                        debugLog("Request timeout for item details");
                                        resolve(null);
                                    }
                                });
                            } else {
                                debugLog("No item ID found in best match");
                                resolve(null);
                            }
                        } catch (error) {
                            debugLog("Error parsing search response:", error);
                            resolve(null);
                        }
                    } else {
                        debugLog("HTTP error from search endpoint:", response.status);
                        resolve(null);
                    }
                },
                onerror: function(error) {
                    debugLog("Request error to search endpoint:", error);
                    resolve(null);
                },
                ontimeout: function() {
                    debugLog("Request timeout to search endpoint");
                    resolve(null);
                }
            });
        });
    }

    function addNCIndicator(itemElement, nameElement, itemName) {
        // Create an NC indicator
        const ncIndicator = document.createElement("span");
        ncIndicator.className = "jellyneo-price nc-indicator";
        ncIndicator.textContent = "NC Item";
        ncIndicator.style.color = "#7171D0"; // Purple for NC items
        ncIndicator.style.fontWeight = "bold";
        ncIndicator.style.fontSize = "0.9em";
        ncIndicator.style.padding = "0 5px";
        ncIndicator.style.borderRadius = "3px";
        ncIndicator.style.background = "rgba(113, 113, 208, 0.1)";
        ncIndicator.style.display = "inline-block";
        ncIndicator.style.margin = "0 5px";

        // Append the NC indicator
        nameElement.appendChild(ncIndicator);
        
        // Try to fetch the owl value from ItemDB
        fetchItemDBOwlValue(itemName)
            .then(owlValue => {
                if (owlValue) {
                    // Create an owl value indicator
                    const owlIndicator = document.createElement("span");
                    owlIndicator.className = "jellyneo-price owl-indicator";
                    
                    // Format the owl value text based on whether it's a range or single value
                    if (typeof owlValue === 'object' && owlValue.min !== undefined) {
                        // It's a range
                        if (owlValue.min === owlValue.max) {
                            // Same min and max, display as single value
                            owlIndicator.textContent = owlValue.min + (owlValue.min === 1 ? " owl" : " owls");
                        } else {
                            // Display as range
                            owlIndicator.textContent = owlValue.min + "-" + owlValue.max + " owls";
                        }
                    } else {
                        // It's a single numeric value
                        owlIndicator.textContent = owlValue + (owlValue === 1 ? " owl" : " owls");
                    }
                    
                    owlIndicator.style.color = "#FF9900"; // Orange for owl values
                    owlIndicator.style.fontWeight = "bold";
                    owlIndicator.style.fontSize = "0.9em";
                    owlIndicator.style.padding = "0 5px";
                    owlIndicator.style.borderRadius = "3px";
                    owlIndicator.style.background = "rgba(255, 153, 0, 0.1)";
                    owlIndicator.style.display = "inline-block";
                    owlIndicator.style.margin = "0 5px";
                    
                    // Append the owl indicator after the NC indicator
                    ncIndicator.insertAdjacentElement('afterend', owlIndicator);
                } else {
                    // Update NC indicator text to indicate no owl value
                    ncIndicator.textContent = "NC, no owl value";
                }
            })
            .catch(error => {
                debugLog("Error fetching owl value:", error);
            });

        // Still add search links for NC items
        addItemSearchLinks(itemElement, nameElement, itemName);
    }

    /**
     * Add search links for an item
     * @param {Element} itemElement - The container element
     * @param {Element} nameElement - The element to append the links to
     * @param {string} itemName - The item name
     */
    function addItemSearchLinks(itemElement, nameElement, itemName) {
        // Create a container for the search links
        const linksContainer = document.createElement("span");
        linksContainer.className = "item-search-links";
        linksContainer.style.display = "inline-block";
        linksContainer.style.marginLeft = "5px";

        // Add Jellyneo item DB link
        const jnLink = createSearchLink("https://items.jellyneo.net/search/?name=" + encodeURIComponent(itemName), "https://items.jellyneo.net/favicon.ico", "Jellyneo Item DB");
        linksContainer.appendChild(jnLink);

        // Add other search links
        for (const [key, icon] of Object.entries(SEARCH_ICONS)) {
            const link = createSearchLink(
                icon.url.replace("%s", encodeURIComponent(itemName)),
                icon.img,
                icon.title
            );
            linksContainer.appendChild(link);
        }

        // Add discord share links
        for (const [key, share] of Object.entries(DISCORD_SHARE)) {
            const link = createClipboardLink(
                share.command.replace("%s", itemName),
                share.img,
                share.title
            );
            linksContainer.appendChild(link);
        }

        // Append the links container to the name element
        nameElement.parentNode.appendChild(linksContainer);
    }

    /**
     * Create a search link element
     * @param {string} url - The search URL
     * @param {string} iconUrl - The icon URL
     * @param {string} title - The title/tooltip
     * @returns {Element} The created link element
     */
    function createSearchLink(url, iconUrl, title) {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.title = title;
        link.style.display = "inline-block";
        link.style.margin = "0 2px";
        link.style.textDecoration = "none";

        const icon = document.createElement("img");
        icon.src = iconUrl;
        icon.alt = title;
        icon.style.width = "16px";
        icon.style.height = "16px";
        icon.style.verticalAlign = "middle";
        icon.style.border = "none"; // Prevent border styling by the page
        icon.style.maxWidth = "100%"; // Ensure the image doesn't overflow
        icon.onerror = function() {
            // If icon fails to load, show text fallback
            this.style.display = "none";
            link.textContent = title.charAt(0).toUpperCase();
            link.style.backgroundColor = "#e0e0e0";
            link.style.borderRadius = "50%";
            link.style.width = "16px";
            link.style.height = "16px";
            link.style.textAlign = "center";
            link.style.lineHeight = "16px";
            link.style.fontSize = "10px";
            link.style.fontWeight = "bold";
        };

        link.appendChild(icon);
        return link;
    }

    /**
     * Create a clipboard link that copies text when clicked
     * @param {string} text - The text to copy
     * @param {string} iconUrl - The icon URL
     * @param {string} title - The title/tooltip
     * @returns {Element} The created link element
     */
    function createClipboardLink(text, iconUrl, title) {
        const link = document.createElement("a");
        link.href = "javascript:void(0);";
        link.title = title;
        link.style.display = "inline-block";
        link.style.margin = "0 2px";
        link.style.cursor = "pointer";

        const icon = document.createElement("img");
        icon.src = iconUrl;
        icon.alt = title;
        icon.style.width = "16px";
        icon.style.height = "16px";
        icon.style.verticalAlign = "middle";
        icon.style.border = "none"; // Prevent border styling by the page
        icon.style.maxWidth = "100%"; // Ensure the image doesn't overflow
        icon.onerror = function() {
            // If icon fails to load, show text fallback
            this.style.display = "none";
            link.textContent = title.charAt(0).toUpperCase();
            link.style.backgroundColor = "#e0e0e0";
            link.style.borderRadius = "50%";
            link.style.width = "16px";
            link.style.height = "16px";
            link.style.textAlign = "center";
            link.style.lineHeight = "16px";
            link.style.fontSize = "10px";
            link.style.fontWeight = "bold";
        };

        link.appendChild(icon);

        // Add click event to copy text to clipboard
        link.addEventListener("click", function (e) {
            e.preventDefault();
            
            // Use try/catch to handle browsers where clipboard API is unavailable
            try {
                navigator.clipboard.writeText(text).then(
                    function () {
                        // Success feedback
                        const originalTitle = link.title;
                        link.title = "Copied!";
                        
                        // Flash background color for visual feedback
                        const originalBackgroundColor = icon.style.backgroundColor;
                        icon.style.backgroundColor = "#4B9E65"; // Green for success
                        
                        setTimeout(() => {
                            link.title = originalTitle;
                            icon.style.backgroundColor = originalBackgroundColor;
                        }, 1500);
                    },
                    function (err) {
                        console.error("Could not copy text: ", err);
                        
                        // Error feedback
                        link.title = "Copy failed!";
                        setTimeout(() => {
                            link.title = title;
                        }, 1500);
                    }
                );
            } catch(err) {
                // Fallback for browsers without clipboard API
                console.error("Clipboard API not available", err);
                alert("Copy this text: " + text);
            }
        });

        return link;
    }

    /**
     * Format a number with commas as thousand separators
     * @param {number} number - The number to format
     * @returns {string} The formatted number
     */
    function formatNumber(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    /**
     * Get cached data for an item
     * @param {string} itemName - The item name
     * @returns {Object|null} The cached data, or null if not found or expired
     */
    function getCachedData(itemName) {
        const cacheKey = CACHE_PREFIX + itemName;
        const cachedData = GM_getValue(cacheKey);

        if (cachedData) {
            const { timestamp, data } = cachedData;
            const now = Date.now();

            // Check if the cache has expired
            if (now - timestamp < CACHE_EXPIRY) {
                debugLog("Using cached data for", itemName);
                return data;
            } else {
                debugLog("Cache expired for", itemName);
            }
        }

        return null;
    }

    /**
     * Set cached data for an item
     * @param {string} itemName - The item name
     * @param {*} data - The data to cache
     */
    function setCachedData(itemName, data) {
        const cacheKey = CACHE_PREFIX + itemName;
        GM_setValue(cacheKey, {
            timestamp: Date.now(),
            data: data,
        });
        debugLog("Cached data for", itemName);
    }

    /**
     * Fetch price information from Jellyneo
     * @param {string} itemName - The item name
     * @returns {Promise<number|null>} The price, or null if not found
     */
    function fetchJellyneoPrice(itemName) {
        // Check cache first
        const cachedData = getCachedData(itemName);
        if (cachedData !== null) {
            return Promise.resolve(cachedData);
        }

        // Create search URL for Jellyneo item database with more specific parameters
        // Use the exact name matching to get more accurate results
        const searchUrl = "https://items.jellyneo.net/search/" + 
                         "?name=" + encodeURIComponent(itemName) + 
                         "&name_type=3"; // Type 3 is exact match

        debugLog("Fetching price for", itemName, "from", searchUrl);

        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: searchUrl,
                timeout: 15000, // Increased timeout to 15 seconds
                onload: function (response) {
                    if (response.status === 200) {
                        try {
                            // Check if the response indicates no results
                            if (response.responseText.includes("No items found.")) {
                                debugLog("Jellyneo says: No items found. Trying fuzzy match...");
                                
                                // Try again with a fuzzy match
                                const fuzzySearchUrl = "https://items.jellyneo.net/search/" + 
                                                     "?name=" + encodeURIComponent(itemName);
                                
                                GM_xmlhttpRequest({
                                    method: "GET",
                                    url: fuzzySearchUrl,
                                    timeout: 15000,
                                    onload: function(fuzzyResponse) {
                                        if (fuzzyResponse.status === 200) {
                                            try {
                                                const price = extractPriceFromJellyneoResponse(fuzzyResponse.responseText, itemName);
                                                setCachedData(itemName, price);
                                                resolve(price);
                                            } catch (error) {
                                                debugLog("Error parsing fuzzy Jellyneo response:", error);
                                                reject(error);
                                            }
                                        } else {
                                            debugLog("HTTP error in fuzzy search:", fuzzyResponse.status);
                                            reject(new Error("HTTP error: " + fuzzyResponse.status));
                                        }
                                    },
                                    onerror: function(error) {
                                        debugLog("Request error in fuzzy search:", error);
                                        reject(error);
                                    },
                                    ontimeout: function() {
                                        debugLog("Request timeout in fuzzy search");
                                        reject(new Error("Request timeout in fuzzy search"));
                                    }
                                });
                                return;
                            }
                            
                            const price = extractPriceFromJellyneoResponse(response.responseText, itemName);
                            setCachedData(itemName, price);
                            resolve(price);
                        } catch (error) {
                            debugLog("Error parsing Jellyneo response:", error);
                            debugLog("Error details:", error.message, error.stack);
                            reject(error);
                        }
                    } else {
                        debugLog("HTTP error:", response.status);
                        reject(new Error("HTTP error: " + response.status));
                    }
                },
                onerror: function (error) {
                    debugLog("Request error:", error);
                    reject(error);
                },
                ontimeout: function () {
                    debugLog("Request timeout");
                    reject(new Error("Request timeout"));
                },
            });
        });
    }

    /**
     * Extract price information from Jellyneo response HTML
     * @param {string} responseHtml - The HTML response from Jellyneo
     * @param {string} itemName - The item name
     * @returns {number|null} The extracted price, or null if not found
     */
    function extractPriceFromJellyneoResponse(responseHtml, itemName) {
        debugLog("Extracting price from Jellyneo response for", itemName);
        
        // Create a temporary element to parse the HTML
        const tempElement = document.createElement("div");
        tempElement.innerHTML = responseHtml;
        
        // Log the HTML structure for debugging
        debugLog("HTML response length:", responseHtml.length);
        
        // First approach: Check if we're on an item page with pricing info
        const itemHeader = tempElement.querySelector("h1.itemheader");
        const priceBox = tempElement.querySelector("div.item-pricing-box");
        
        if (itemHeader && priceBox) {
            debugLog("Found direct item page with item header and price box");
            
            // Get price from the price box
            const priceText = priceBox.textContent.trim();
            debugLog("Price text from direct item page:", priceText);
            
            // Extract the numeric value using regex - look for digits with optional commas
            const match = priceText.match(/(\d{1,3}(?:,\d{3})*|\d+)/);
            if (match) {
                // Remove commas and convert to number
                const price = parseInt(match[0].replace(/,/g, ""), 10);
                debugLog("Extracted price from direct item page:", price);
                return price;
            }
        }
        
        // Alternative approach for item page: Look for specific pricing elements
        const pricingSection = tempElement.querySelector(".item-details-pricing");
        if (pricingSection) {
            debugLog("Found item-details-pricing section");
            
            // Try to find the current price (should be the first one)
            const priceText = pricingSection.textContent.trim();
            debugLog("Complete price section text:", priceText);
            
            // Pattern: Look for "Current Price: X NP" or just a number followed by NP
            const currentMatch = priceText.match(/Current Price: (\d{1,3}(?:,\d{3})*|\d+) NP/i) || 
                               priceText.match(/(\d{1,3}(?:,\d{3})*|\d+) NP/i);
            
            if (currentMatch) {
                const price = parseInt(currentMatch[1].replace(/,/g, ""), 10);
                debugLog("Extracted current price:", price);
                return price;
            }
        }
        
        // Second approach: Look for item in search results table
        const searchTables = tempElement.querySelectorAll("table.item-search-results");
        debugLog("Found search tables:", searchTables.length);
        
        if (searchTables.length > 0) {
            for (const table of searchTables) {
                const rows = table.querySelectorAll("tr");
                debugLog("Found rows in search table:", rows.length);
                
                for (const row of rows) {
                    // Check if this row contains our item
                    const nameCell = row.querySelector("td.name a");
                    if (!nameCell) continue;
                    
                    const rowItemName = nameCell.textContent.trim();
                    debugLog("Found item in search results:", rowItemName);
                    
                    // Use a more flexible matching approach
                    // 1. Direct case-insensitive match
                    // 2. Match without apostrophes and other special characters
                    // 3. Match if one is a substring of the other (for cases where names slightly differ)
                    const normalizedRowName = rowItemName.toLowerCase().replace(/['\-\s]/g, '');
                    const normalizedItemName = itemName.toLowerCase().replace(/['\-\s]/g, '');
                    
                    if (rowItemName.toLowerCase() === itemName.toLowerCase() || 
                        normalizedRowName === normalizedItemName ||
                        normalizedRowName.includes(normalizedItemName) ||
                        normalizedItemName.includes(normalizedRowName)) {
                        // Look for the price in this row
                        const priceCell = row.querySelector("td.price");
                        if (priceCell) {
                            const priceText = priceCell.textContent.trim();
                            debugLog("Price text from search result:", priceText);
                            
                            // Extract the numeric value using regex
                            const match = priceText.match(/(\d{1,3}(?:,\d{3})*|\d+)/);
                            if (match) {
                                // Remove commas and convert to number
                                const price = parseInt(match[0].replace(/,/g, ""), 10);
                                debugLog("Extracted price from search row:", price);
                                return price;
                            }
                        }
                    }
                }
            }
        }
        
        // Last resort: Try to find any price-like text in the document
        const bodyText = tempElement.textContent;
        const priceMatches = bodyText.match(/(\d{1,3}(?:,\d{3})*|\d+) NP/g);
        
        if (priceMatches && priceMatches.length > 0) {
            debugLog("Found price-like patterns in document:", priceMatches);
            // Take the first price mentioned
            const firstPrice = priceMatches[0].match(/(\d{1,3}(?:,\d{3})*|\d+)/)[0];
            const price = parseInt(firstPrice.replace(/,/g, ""), 10);
            debugLog("Using first found price:", price);
            return price;
        }
        
        // No price found
        debugLog("No price found for", itemName);
        return null;
    }

    // Start the script when the page is loaded
    window.addEventListener("load", initialize);
})();
