// ==UserScript==
// @name         Dress to Impress - Jellyneo Price Display
// @namespace    neopets, jellyneo, dress to impress. 
// @version      1.5.1
// @description  Enhances Dress to Impress by displaying Jellyneo price data for Neopets items with search links (using Dicerollers Search Helper foundation), clipboards neobot compatible. 
// @author       Laurore
// @match        https://impress.openneo.net/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      items.jellyneo.net
// @connect      images.neopets.com
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
            img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAECklEQVRYhe1WS08jRxD+qj2PHQ8gbLB5SgaBQKDkyokDXPIbOOcX5RJFSi45RcovyCESIocoOawQSHhxQDwMEg/j4CEz4/FO90zlwIzXsMbrELTaw35SH2ZUVd/XVdVdDXzGZ3yKIKKPxwUAlmVNFAqFNcMwviwUChfZbPZ8b2/vLTP/PTg4eCuE8E9OTlgpxQDeAmgBYAB6EkcCiADESUzu4NASO5H8l8nitoCZmZmv19fXf3AcR0xNTcUDAwOy1WqBmZtE9I+U0t/Z2ckwc2wYhgOgngTIJiR+IirqEMAJ6SsANgADgALgE5F/c3PzZ7lc/lYTQmB6enpI3AOGYYhsNmtalgUAJoAcEWF2dhZhGMJ1Xei6DsMwwNy50f4QBAFM04RlWROVSuVHjYig67qdGjBze6WI4xhSSjSbTRQKBTSbTRSLRdi23ZWkG+I4xvX1NUzThFIKvu8PEVFWS0j1pxyFEDg6OsLW1haICBsbG1heXka5XEYURdD1J10fwPM85PN5LCwsYHt7G47jCACkJTsNezm7rotarYZMJgOlFEZHR5HP53F4eAjbtj9YCqUUTNPEysoKhBCpvQYgozEzWq2WSo9eFEXvBZBSPiBhZmQyGQwPD2NwcPCDAlJ/ImqXN5vNGpOTk5rGzFBKRUTUNngKhmHAMIwHQh73Szc8tmFmWJYlJicnNQ0AiOjJQjIz5ufnsbq6CiJCsVh8Vvd3gWDmjJZ85HsJyOVyKJVKcF0XQoiXIG8LSKMN9bLsTHUcx/+bOSl1JggCU+D+5tL6cSKirk36TBhRFL1KM9Azr8lJQRAEL0UOABkARkr85PgTQqBarWJzcxPlcrndgGlG/svqIkBPU99z/jqOg0ajAeDdPSGlhOd5iOO4r4tICIEoiqBp7WoLAFpfAjoDKaXQaDQwMTGBpaWlvt8OjUYDR0dHKJVKqQ8BoFRAz9bWNA1DQ0PI5XJoNBoYGRnB3Nxc33MAAEqlEqrVKvb39+G6bjsTGgAKw9BMd/L4mDEzSqUS1tbWwMw4PT2FlBKVSqVv8hREhHq9DsdxMD4+HgNQqQArbZRuAgYGBmBZFoiIdV2PPc9rF11KSVEUpd9xstLXkcL9oAuT7wwR2SMjI7bnebdhGNbTEnTtIiJCEAS4u7ur6rr+i+/7f4Rh6CYEDAC7u7u4uLgAEXHyX3WsEO9eSwr3T7McgGFmdqWU+10vICKCUgp3d3e1s7Ozn46Pj78/PT39y/O893qln2HUC10FuK7bvLy8/LVSqXxzfHz8++3trXw2Qz8CmJnDMIRSimu12ptarfbd69evfz4/P6+/xN3fCwSAbNv+amxs7IvFxcXg4ODgt6urqze+77/IzO0byYv4o3J+EvgX4yIhYBP/dWUAAAAASUVORK5CYII=",
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
            img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAHsUlEQVRYhe1XWWxU1xn+zrnbbJ4Zz+ZZvNvgBUMKIS3QNBhSCCJqo1ZNq1YqihqE1KoP7WPUB9THRnnpQ6pKrRRFqC9EgpS0aoOSICgtlgx4AUMce4z3ZWzPPnfucs49fXAwdsEFqlZ56ZHu0/3P/33/p/8/5zvA/9cXvMh/LdF6JgIhxP+OQCKRkBobG925XE5MT00Zfp83pbhcHdF4oplzR3ZrWnFmcmLCtOy05vUlJQI/HD6xupqdrRrGQ/nkpyUgyzI91Nt7KD2RjolAeJ9R3/FCpaGrab6pQ4WsAuW8g/Stsjo2MIn2Xcky4/7GGvdoYPDKr0b7rp5ljsP+YwUopUgl4i2Jtu1v30v2HHaOndBoazeEoYMuTEIQApJsBgmGwRdmYFw6D0dSIIWi8M2NZvl7b/84s7R4dmNO6Wkq37Gj54jVufe3S0dff4G8+B1Z3t4NsryAZ6+eRdvQDdQM9KN6qw9m0zbIDc2QYg3Q//QumCcA0brT7Z4bq7DluQuM8wdFPQk4IUSpDYdPruw58q7+k7f2ygdeIkTzQNiA99qH2OkIzGgeOC4/2isO6MfnIRgg1aXg7n4W9sw4zPwqfLv2dUqyXLtJ1ceBU0oVn9//U6v31bfYiTfiUjwFcAdgFsBsiPkF3L67iBV/GJYsQZYV0MwCHMsAKEA8NVD7LzK+MIUlf129y+uLPjEBTVWRamj8gfzKydPaqV/WUH8I4ABxuQHVBUgyqrE4DFNHbHoSMYmjPumCHokDigonl0V1bAptdclxX6QuW4GSUAOh5zc23pY9QClFz86eY8ZXjv/aee0XUSkQAu6PNyEQeglEdcGpq8dyegje1QyoQjBaG0Zm38tQBYP+wTmYsxwBY7ZUqWR9ernkDihUJauLF0zTtIAtxpAQglAgsCMTa3/T/u7PUlIgBDgbAhwHTiEH5FYgt3XD+OHPMTw6DM45aCwFT9VA+YMPYOVUEMWPQj4bNhc+c6GxG3Y41OnyeOKFYrG0JYGAv8Yfbmk/nTn+o51aogF40LQQtgWhlwEC8Lk0iNsDV30zlOAhOELAGbuNyrn34DAvqFMC9QkkW5L39FXJNd3Q3iEvT/Zn8/nZ+/keIqCqKtra2l4d69j/Tddzhx+AE0AYVVjXL0HZ8WXIrR2ggVqYfR9DUxRIdSlIDiBaOyCdeA3CrIKoMhwqgZ45PVQXCr7vZCeP5G9d+03VMKpbEqhPJuNFf/wU+cZJjWramvQEcAo5CL0E5ZkDoL4ghGVDWUjDvn4Z+WtX4P3eSagdz4C4XJDbt6/1iwTwT4eRHujP6fPT5yHEBS4cvhFv0xQQQuCrqTme6f7qHq29Zx1c2BbsgcsAIaCBIIRVhX/gLziq3sGLxw5g+7a9OLjah5qLvwcfuwVndQXCZoANkMUZ0RSpHeecgzkO/9d7apMCHrfbU3D5v+3sOy5TiQAOIGwTolSA8qWvgQZCEKYN48P3sdeziOdeeh75ohufTd2CGknhYJOOP5/5HYptXfD2vgwbBOzSOWNpdvr2VvfjJgXqotGmasuu3WpL53r19nAfeGYOtDYMUAL77gCKV26if8jB0B2Gs3/ow3BfGhcuTIPJ9ejoboM3EoOIplAqFuHLL01CYGwL/M0KVAxzl922K6q63YAAhGVCSrWChuvWCUmJRqhxHwJuC1Sx8K3v70ckNQ1BJBzeH8cIiyA9TbBSKoJPjSJiFgYWhVjaisC6Aol43OuL1u02a8IKAQBuw755BbQmCKKoa0ECQG0UrPfr8Mcd1Pt0dG7z42BvClPTRbxz5g7mVxlyUGHoOuTsomhNxFa7urq2PPDWFUgkEkqwvcuz0LBtrfGYDVIbA3F7H5yAACghUJq24yaz4bp6B96/zeHm9RmszJVht0WhdHpgRloBxhBkleVcZumd/hs3zMcSGBm5ne8OxwWzbThcAKU8lPYegGy+LgilqAkG4TR34h8ZPzA5BlGfAkIV2Ek/Rtw+sJowwBnM2XvlgYGBjPEIJ/QQAYCA2laRLc/DWF2CNDoIbd/RR26SZAX+UBgVWQKLxj/fDWS4A2bba0HMgqdaKBY5s7ZE30jAtCwsTYzdVTNTrFzZKfuauiCotGY2HzFDsqLAH4pAOM4augDK+RyYba05VENHVCELzO3Rq+bWHDZNgUzEoHd8aMGItTSUfX5YLh80txuqpoFKMgjZ7OAIISASBecc1VIJ1XL5/g+gsAK5lE1zISpPpAAAVKrV9F6pdPGjT86+zl85BUOvwKyUQSUZsqpAVlTIigLyeV84DodtmrBNA4wxYP2YI/Bm500nu3Q5Xyj8O/zNfoAxxluSiZEEtYLLNum0o/UyNA+EEOA2g20aMKs6DL2yRk7XwSwLjhAACEApQCWgXEBD/x//nhu89mZF1/UnJsA5RzqdzmkUnzSV5qddK7NRq6qHRDmviGoZ4HytSocDnK19tgXkV0AKy1AyU0JND7Lojb8OxCZuvpEeH7/7uEfKlrZcVVVEw6FIMBLbo1v27ulssT7c3O6NNjTFbc61+3GKJFkaM7Kjw4O5uM81FfK673w6MjJcrVZnNrrfpyawHkAIIAQEALfLRd2a5nYcTu/vpZRySVbMbD7POOcg5OmeZl/4+id9pH+peqqglAAAAABJRU5ErkJggg==",
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
                        itemNameElement = itemElement; // Use the container as the name element
                        debugLog("Extracted item name from text:", itemName);
                    }
                }
            }
        }

        // Strategy 4: For any element with descriptive data attributes
        if (!itemName && itemElement.dataset) {
            for (const key in itemElement.dataset) {
                if (
                    key.includes("name") ||
                    key.includes("title") ||
                    key.includes("label")
                ) {
                    itemName = itemElement.dataset[key];
                    itemNameElement = itemElement;
                    debugLog("Found item from data attribute:", itemName);
                    break;
                }
            }
        }

        // Strategy 5: For generic list items in a list of items
        if (
            !itemName &&
            (itemElement.tagName === "LI" ||
                itemElement.tagName === "TR" ||
                itemElement.classList.contains("item"))
        ) {
            // Find any text-like element that's not just a category or status
            const nameElements =
                itemElement.querySelectorAll("span, div, td, a");
            for (const el of nameElements) {
                const text = el.textContent.trim();
                if (
                    text &&
                    text.length > 3 &&
                    !text.includes("NP") &&
                    !text.includes("NC") &&
                    !/^(Background|Static|Dress|Upper|Lower|Category|Type)$/i.test(
                        text,
                    )
                ) {
                    itemNameElement = el;
                    itemName = text;
                    debugLog("Found list item name:", itemName);
                    break;
                }
            }

            // If still no name found, but there's text content in the element
            if (!itemName && itemElement.textContent.trim()) {
                itemName = itemElement.textContent.trim();
                itemNameElement = itemElement;
                debugLog("Using list item text as name:", itemName);
            }
        }

        // If we still don't have an item name, we can't process this element
        if (!itemName) {
            debugLog("Could not find item name for element:", itemElement);
            return;
        }

        // Clean up the item name (remove any extra info)
        itemName = itemName
            .replace(/\s+/g, " ") // Normalize whitespace
            .replace(/^(.*?)(?:\s+\(\d+\))?$/, "$1") // Remove counts like "(2)" at the end
            .trim();

        // Skip zone labels (these are not actual items)
        if (EXCLUDED_ZONES.includes(itemName)) {
            debugLog("Skipping zone label:", itemName);
            return;
        }

        // Make sure we don't already have a jellyneo price element for this item in the same parent
        const existingPriceElements =
            itemElement.parentNode?.querySelectorAll(".jellyneo-price");
        if (existingPriceElements && existingPriceElements.length > 0) {
            for (const existing of existingPriceElements) {
                if (existing.dataset.itemName === itemName) {
                    debugLog(
                        "Already have a price element for this item:",
                        itemName,
                    );
                    return;
                }
            }
        }

        // Create a placeholder for the price info
        const priceElement = document.createElement("span");
        priceElement.className = "jellyneo-price";
        priceElement.dataset.itemName = itemName; // Store the item name to prevent duplicates

        // Apply loading styles
        Object.assign(priceElement.style, loadingStyle);
        priceElement.textContent = "Loading...";

        // Insert the price element
        try {
            // Remove any existing price element from this specific spot
            const existingPrice =
                itemNameElement.nextSibling &&
                itemNameElement.nextSibling.classList &&
                itemNameElement.nextSibling.classList.contains(
                    "jellyneo-price",
                );

            if (existingPrice) {
                itemNameElement.parentNode.removeChild(
                    itemNameElement.nextSibling,
                );
            }

            // Insert the new price element
            if (itemNameElement.nextSibling) {
                itemNameElement.parentNode.insertBefore(
                    priceElement,
                    itemNameElement.nextSibling,
                );
            } else {
                itemNameElement.parentNode.appendChild(priceElement);
            }
        } catch (e) {
            console.error("Error inserting price element:", e);
            debugLog("Failed to insert price element for:", itemName);
            return;
        }

        // For NC items, just link to Jellyneo search page
        if (isNCItem) {
            const encodedItemName = encodeURIComponent(itemName);
            linkToJellyneo(priceElement, itemName, encodedItemName, true);
        } else {
            // Fetch price data for NP items
            fetchItemPrice(itemName, priceElement);
        }
    }

    /**
     * Get cached price data for an item
     * @param {string} itemName - The name of the item
     * @returns {Object|null} - The cached price data or null if not found/expired
     */
    function getCachedPrice(itemName) {
        const cacheKey = CACHE_PREFIX + itemName;
        const cachedData = GM_getValue(cacheKey, null);

        if (cachedData) {
            const { timestamp, price, itemId } = cachedData;

            // Check if cache has expired
            if (Date.now() - timestamp < CACHE_EXPIRY) {
                return { price, itemId };
            }
        }

        return null;
    }

    /**
     * Cache price data for an item
     * @param {string} itemName - The name of the item
     * @param {number} price - The price of the item
     * @param {number} itemId - The Jellyneo item ID
     */
    function cachePrice(itemName, price, itemId) {
        const cacheKey = CACHE_PREFIX + itemName;
        GM_setValue(cacheKey, {
            timestamp: Date.now(),
            price: price,
            itemId: itemId,
        });
    }

    /**
     * Process a generic item element for items that don't match standard patterns
     * @param {Element} itemElement - The container element
     * @param {Element} nameElement - The element containing the item name
     * @param {string} itemName - The name of the item
     */
    function processGenericItemElement(itemElement, nameElement, itemName) {
        debugLog("Processing generic item element for:", itemName);

        // Skip zone labels (these are not actual items)
        if (EXCLUDED_ZONES.includes(itemName)) {
            debugLog("Skipping zone label:", itemName);
            return;
        }

        // Check if we've already processed this element
        if (
            nameElement.querySelector(".jellyneo-price") ||
            itemElement.querySelector(".jellyneo-price")
        ) {
            return;
        }

        // Create a placeholder for the price info
        const priceElement = document.createElement("span");
        priceElement.className = "jellyneo-price";
        priceElement.dataset.itemName = itemName; // Store the item name to prevent duplicates

        // Apply loading styles
        Object.assign(priceElement.style, loadingStyle);
        priceElement.textContent = "Loading...";

        // Insert the price element
        if (nameElement.nextSibling) {
            nameElement.parentNode.insertBefore(
                priceElement,
                nameElement.nextSibling,
            );
        } else {
            nameElement.parentNode.appendChild(priceElement);
        }

        // Fetch price data
        fetchItemPrice(itemName, priceElement);
    }

    /**
     * Fetch price data for an item from Jellyneo
     * @param {string} itemName - The name of the item
     * @param {Element} priceElement - The element to update with price info
     */
    function fetchItemPrice(itemName, priceElement) {
        debugLog("Fetching price for:", itemName);

        // Check cache first
        const cachedData = getCachedPrice(itemName);
        if (cachedData) {
            debugLog("Using cached data for:", itemName, cachedData);
            updatePriceElement(
                priceElement,
                cachedData.price,
                cachedData.itemId,
            );
            return;
        }

        // Encode the item name for the URL
        const encodedItemName = encodeURIComponent(itemName);

        // First, search for the item on Jellyneo to get the item ID
        debugLog("Searching Jellyneo for:", itemName);
        GM_xmlhttpRequest({
            method: "GET",
            url: `https://items.jellyneo.net/search/?name=${encodedItemName}`,
            onload: function (response) {
                if (response.status !== 200) {
                    debugLog(
                        "Search request failed with status:",
                        response.status,
                    );
                    handleFetchError(priceElement, "Failed to search for item");
                    return;
                }

                try {
                    // Parse the HTML response to extract the item ID
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(
                        response.responseText,
                        "text/html",
                    );

                    // Try different selectors to find search results
                    let searchResult = doc.querySelector(
                        ".item-search-result a.d-inline-block",
                    );

                    if (!searchResult) {
                        searchResult = doc.querySelector('a[href*="/item/"]');
                    }

                    if (!searchResult) {
                        // Try to find any link that might contain an item ID
                        const allLinks = doc.querySelectorAll("a");
                        for (const link of allLinks) {
                            const href = link.getAttribute("href") || "";
                            if (href.includes("/item/")) {
                                searchResult = link;
                                break;
                            }
                        }
                    }

                    if (!searchResult) {
                        debugLog("No search results found for:", itemName);
                        handleFetchError(priceElement, "Item not found");
                        return;
                    }

                    const itemUrl = searchResult.getAttribute("href");
                    debugLog("Found item URL:", itemUrl);

                    const itemIdMatch = itemUrl.match(/\/item\/(\d+)\//);

                    if (!itemIdMatch) {
                        debugLog(
                            "Could not extract item ID from URL:",
                            itemUrl,
                        );
                        handleFetchError(priceElement, "Item ID not found");
                        return;
                    }

                    const itemId = itemIdMatch[1];
                    debugLog("Extracted item ID:", itemId);

                    // Now fetch the item details page to get the price
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: `https://items.jellyneo.net/item/${itemId}/`,
                        onload: function (detailsResponse) {
                            if (detailsResponse.status !== 200) {
                                debugLog(
                                    "Details request failed with status:",
                                    detailsResponse.status,
                                );
                                handleFetchError(
                                    priceElement,
                                    "Failed to get item details",
                                );
                                return;
                            }

                            try {
                                // Parse the HTML to extract the price
                                const detailsDoc = parser.parseFromString(
                                    detailsResponse.responseText,
                                    "text/html",
                                );
                                debugLog(
                                    "Successfully parsed item details page",
                                );

                                // Find the price information using multiple selectors
                                let priceInfo = detailsDoc.querySelector(
                                    ".item-details-right",
                                );

                                if (!priceInfo) {
                                    priceInfo = detailsDoc.querySelector(
                                        ".item-details, .item-info",
                                    );
                                }

                                if (!priceInfo) {
                                    // Fallback to the whole document
                                    priceInfo = detailsDoc.body;
                                }

                                if (!priceInfo) {
                                    debugLog(
                                        "Could not find price information section",
                                    );
                                    handleFetchError(
                                        priceElement,
                                        "Price info not found",
                                    );
                                    return;
                                }

                                // Look for any text containing "NP" (first approach)
                                let priceText = "";
                                const priceTexts = [];

                                // Find all elements with text containing "NP"
                                const allElements =
                                    priceInfo.querySelectorAll("*");
                                for (const element of allElements) {
                                    if (
                                        element.childNodes.length === 1 &&
                                        element.childNodes[0].nodeType === 3
                                    ) {
                                        const text = element.textContent.trim();
                                        if (
                                            text.includes("NP") &&
                                            /\d/.test(text)
                                        ) {
                                            priceTexts.push(text);
                                        }
                                    }
                                }

                                // Also check the immediate text nodes of the price info element
                                for (const node of priceInfo.childNodes) {
                                    if (node.nodeType === 3) {
                                        // Text node
                                        const text = node.textContent.trim();
                                        if (
                                            text.includes("NP") &&
                                            /\d/.test(text)
                                        ) {
                                            priceTexts.push(text);
                                        }
                                    }
                                }

                                debugLog("Found price texts:", priceTexts);

                                // Choose the price text with the most likely format (number followed by NP)
                                for (const text of priceTexts) {
                                    const match = text.match(
                                        /(\d{1,3}(?:,\d{3})*) NP/,
                                    );
                                    if (match) {
                                        priceText = text;
                                        break;
                                    }
                                }

                                if (!priceText && priceTexts.length > 0) {
                                    // Just use the first one if no ideal format found
                                    priceText = priceTexts[0];
                                }

                                if (priceText) {
                                    debugLog("Found price text:", priceText);
                                    // Extract the numeric price value
                                    const priceMatch = priceText.match(
                                        /(\d{1,3}(?:,\d{3})*) NP/,
                                    );
                                    if (priceMatch) {
                                        const price = priceMatch[1].replace(
                                            /,/g,
                                            "",
                                        );
                                        debugLog("Extracted price:", price);
                                        updatePriceElement(
                                            priceElement,
                                            price,
                                            itemId,
                                        );
                                        cachePrice(itemName, price, itemId);
                                    } else {
                                        // Try a more general approach
                                        const generalMatch =
                                            priceText.match(/(\d[\d,]*)/);
                                        if (generalMatch) {
                                            const price =
                                                generalMatch[1].replace(
                                                    /,/g,
                                                    "",
                                                );
                                            debugLog(
                                                "Extracted price (general):",
                                                price,
                                            );
                                            updatePriceElement(
                                                priceElement,
                                                price,
                                                itemId,
                                            );
                                            cachePrice(itemName, price, itemId);
                                        } else {
                                            debugLog(
                                                "Could not parse price format from:",
                                                priceText,
                                            );
                                            handleFetchError(
                                                priceElement,
                                                "Price format not recognized",
                                            );
                                        }
                                    }
                                } else {
                                    debugLog(
                                        'No price text found containing "NP"',
                                    );
                                    handleFetchError(
                                        priceElement,
                                        "Price not found",
                                    );
                                }
                            } catch (error) {
                                console.error(
                                    "Error parsing item details:",
                                    error,
                                );
                                debugLog(
                                    "Error parsing details:",
                                    error.message,
                                );
                                handleFetchError(
                                    priceElement,
                                    "Error parsing data",
                                );
                            }
                        },
                        onerror: function (error) {
                            debugLog(
                                "Network error when fetching item details:",
                                error,
                            );
                            handleFetchError(priceElement, "Network error");
                        },
                    });
                } catch (error) {
                    console.error("Error parsing search results:", error);
                    debugLog("Error parsing search results:", error.message);
                    handleFetchError(priceElement, "Error parsing data");
                }
            },
            onerror: function (error) {
                debugLog("Network error when searching for item:", error);
                handleFetchError(priceElement, "Network error");
            },
        });
    }

    /**
     * Create search icon links for an item
     * @param {string} itemName - The name of the item
     * @param {string} encodedItemName - The URL-encoded item name
     * @returns {DocumentFragment} - A document fragment containing the search icons
     */
    function createSearchIcons(itemName, encodedItemName) {
        const fragment = document.createDocumentFragment();

        // Create search icons container
        const container = document.createElement("span");
        container.className = "jellyneo-search-icons";
        container.style.marginLeft = "5px";
        container.style.display = "inline-block";
        container.style.verticalAlign = "middle";

        // Add each search icon
        for (const [key, icon] of Object.entries(SEARCH_ICONS)) {
            const link = document.createElement("a");
            link.href = icon.url.replace("%s", encodedItemName);
            link.target = "_blank";
            link.title = `${icon.title}: ${itemName}`;
            link.style.marginRight = "4px";
            link.style.display = "inline-block";
            link.style.transition = "transform 0.2s";

            // When hovering over the icon, make it slightly larger
            link.addEventListener("mouseover", function () {
                link.style.transform = "scale(1.2)";
            });

            link.addEventListener("mouseout", function () {
                link.style.transform = "scale(1)";
            });

            // Prevent the parent element's click event from being triggered
            link.addEventListener("click", function (e) {
                e.stopPropagation();
            });

            const img = document.createElement("img");
            img.src = icon.img;
            img.alt = icon.title;
            img.width = 16;
            img.height = 16;
            img.style.verticalAlign = "middle";
            img.style.border = "1px solid transparent";
            img.style.borderRadius = "3px";

            link.appendChild(img);
            container.appendChild(link);
        }

        // Add a small separator
        const separator = document.createElement("span");
        separator.style.display = "inline-block";
        separator.style.width = "8px";
        container.appendChild(separator);

        // Add Discord share icons
        for (const [key, share] of Object.entries(DISCORD_SHARE)) {
            const shareBtn = document.createElement("a");
            shareBtn.href = "#";
            shareBtn.title = `${share.title}: ${itemName}`;
            shareBtn.style.marginRight = "4px";
            shareBtn.style.display = "inline-block";
            shareBtn.style.transition = "transform 0.2s";
            shareBtn.style.cursor = "pointer";

            // When hovering over the icon, make it slightly larger
            shareBtn.addEventListener("mouseover", function () {
                shareBtn.style.transform = "scale(1.2)";
            });

            shareBtn.addEventListener("mouseout", function () {
                shareBtn.style.transform = "scale(1)";
            });

            // On click, copy the Discord command to clipboard
            shareBtn.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();

                const command = share.command.replace("%s", itemName);

                // Use navigator.clipboard API if available (modern browsers)
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(command)
                        .then(() => {
                            // Show a temporary tooltip that the command was copied
                            const tooltip = document.createElement("div");
                            tooltip.textContent = `Copied: ${command}`;
                            tooltip.style.position = "absolute";
                            tooltip.style.zIndex = "10000";
                            tooltip.style.backgroundColor = "#333";
                            tooltip.style.color = "white";
                            tooltip.style.padding = "5px 10px";
                            tooltip.style.borderRadius = "4px";
                            tooltip.style.fontSize = "12px";
                            tooltip.style.left = `${e.pageX}px`;
                            tooltip.style.top = `${e.pageY - 30}px`;

                            document.body.appendChild(tooltip);

                            // Remove the tooltip after 2 seconds
                            setTimeout(() => {
                                document.body.removeChild(tooltip);
                            }, 2000);
                        })
                        .catch(err => {
                            console.error("Failed to copy: ", err);
                            alert(`Please copy this manually: ${command}`);
                        });
                } else {
                    // Fallback for older browsers
                    const textarea = document.createElement("textarea");
                    textarea.value = command;
                    textarea.style.position = "fixed";
                    textarea.style.opacity = "0";
                    document.body.appendChild(textarea);
                    textarea.select();

                    try {
                        document.execCommand("copy");

                        // Show a temporary tooltip that the command was copied
                        const tooltip = document.createElement("div");
                        tooltip.textContent = `Copied: ${command}`;
                        tooltip.style.position = "absolute";
                        tooltip.style.zIndex = "10000";
                        tooltip.style.backgroundColor = "#333";
                        tooltip.style.color = "white";
                        tooltip.style.padding = "5px 10px";
                        tooltip.style.borderRadius = "4px";
                        tooltip.style.fontSize = "12px";
                        tooltip.style.left = `${e.pageX}px`;
                        tooltip.style.top = `${e.pageY - 30}px`;

                        document.body.appendChild(tooltip);

                        // Remove the tooltip after 2 seconds
                        setTimeout(() => {
                            document.body.removeChild(tooltip);
                        }, 2000);
                    } catch (err) {
                        console.error("Failed to copy: ", err);
                        alert(`Please copy this manually: ${command}`);
                    }

                    document.body.removeChild(textarea);
                }
            });

            const img = document.createElement("img");
            img.src = share.img;
            img.alt = share.title;
            img.width = 16;
            img.height = 16;
            img.style.verticalAlign = "middle";
            img.style.border = "1px solid transparent";
            img.style.borderRadius = "3px";

            shareBtn.appendChild(img);
            container.appendChild(shareBtn);
        }

        fragment.appendChild(container);
        return fragment;
    }

    /**
     * Create a direct link to Jellyneo for items without prices or NC items
     * @param {Element} priceElement - The element to update
     * @param {string} itemName - The name of the item
     * @param {string} encodedItemName - The URL-encoded item name
     * @param {boolean} isNC - Whether this is an NC item
     */
    function linkToJellyneo(
        priceElement,
        itemName,
        encodedItemName,
        isNC = false,
    ) {
        // Clear any existing content and styles
        priceElement.textContent = "";

        // Apply styles but with different color for NC items
        const style = { ...priceStyle, color: isNC ? "#6C72CB" : "#888" }; // Purple for NC, gray for unfound items
        Object.assign(priceElement.style, style);

        // Create link text
        const linkText = document.createTextNode(
            isNC ? "NC Item (Jellyneo)" : "View on Jellyneo",
        );
        priceElement.appendChild(linkText);

        // Add search icons
        const searchIcons = createSearchIcons(itemName, encodedItemName);
        priceElement.appendChild(searchIcons);

        // Make it clickable to go to Jellyneo's search page
        priceElement.style.cursor = "pointer";
        priceElement.title = `Search for "${itemName}" on Jellyneo`;
        priceElement.onclick = function (e) {
            e.stopPropagation(); // Prevent triggering parent element clicks
            window.open(
                `https://items.jellyneo.net/search/?name=${encodedItemName}`,
                "_blank",
            );
        };
    }

    /**
     * Update the price element with the fetched price
     * @param {Element} priceElement - The element to update
     * @param {string} price - The price value
     * @param {string} itemId - The Jellyneo item ID
     */
    function updatePriceElement(priceElement, price, itemId) {
        // Remove any duplicate price elements (only keep the current one)
        if (priceElement.parentNode) {
            const siblings =
                priceElement.parentNode.querySelectorAll(".jellyneo-price");
            if (siblings.length > 1) {
                for (const sibling of siblings) {
                    if (
                        sibling !== priceElement &&
                        sibling.dataset.itemName ===
                            priceElement.dataset.itemName
                    ) {
                        sibling.parentNode.removeChild(sibling);
                    }
                }
            }
        }

        // Format the price with commas
        const formattedPrice = Number(price).toLocaleString();

        // Clear any existing content and styles
        priceElement.textContent = "";

        // Apply price styles
        Object.assign(priceElement.style, priceStyle);

        // Create price text
        const priceText = document.createTextNode(`${formattedPrice} NP`);
        priceElement.appendChild(priceText);

        // Add search icons
        const itemName = priceElement.dataset.itemName;
        const encodedItemName = encodeURIComponent(itemName);
        const searchIcons = createSearchIcons(itemName, encodedItemName);
        priceElement.appendChild(searchIcons);

        // Make the price clickable to go to Jellyneo's item page
        priceElement.style.cursor = "pointer";
        priceElement.title = `View on Jellyneo (Item ID: ${itemId})`;
        priceElement.onclick = function (e) {
            e.stopPropagation(); // Prevent triggering parent element clicks
            window.open(`https://items.jellyneo.net/item/${itemId}/`, "_blank");
        };
    }

    /**
     * Handle errors when fetching price data
     * @param {Element} priceElement - The element to update with the error
     * @param {string} errorMessage - The error message to display
     */
    function handleFetchError(priceElement, errorMessage) {
        debugLog("Error fetching price:", errorMessage);

        // Get item name from dataset
        const itemName = priceElement.dataset.itemName;

        // If we have an item name, link to Jellyneo search
        if (itemName) {
            const encodedItemName = encodeURIComponent(itemName);
            linkToJellyneo(priceElement, itemName, encodedItemName);
            return;
        }

        // Otherwise show error with retry option
        Object.assign(priceElement.style, errorStyle);
        priceElement.textContent = errorMessage;
        priceElement.title = "Could not retrieve price information";

        // Retry button
        const retryButton = document.createElement("a");
        retryButton.href = "#";
        retryButton.textContent = " (retry)";
        retryButton.style.marginLeft = "3px";
        retryButton.style.color = "#77c";
        retryButton.style.textDecoration = "underline";

        retryButton.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();

            // Reset the price element
            priceElement.textContent = "Loading price...";
            Object.assign(priceElement.style, loadingStyle);

            try {
                // Try multiple strategies to find the item name
                let itemName = "";

                // Try to get from dataset first
                if (priceElement.dataset.itemName) {
                    itemName = priceElement.dataset.itemName;
                } else {
                    // Strategy 1: Look for closest container with item info
                    const itemContainer = priceElement.closest(
                        ".item-container, .item-card, li, tr, [data-item-id]",
                    );
                    if (itemContainer) {
                        // Try to find name element in container
                        const nameElement = itemContainer.querySelector(
                            '.item-name, .item-label, [class*="name"], [class*="label"], span:not(:empty)',
                        );
                        if (nameElement) {
                            itemName = nameElement.textContent.trim();
                        }

                        // If no name found but we have a title attribute
                        if (!itemName && itemContainer.title) {
                            itemName = itemContainer.title.trim();
                        }

                        // If still no name, check for any text content
                        if (!itemName) {
                            // Get text directly from the item container, excluding sub-elements that aren't relevant
                            for (const node of itemContainer.childNodes) {
                                if (
                                    node.nodeType === 3 &&
                                    node.textContent.trim()
                                ) {
                                    // Text node
                                    itemName = node.textContent.trim();
                                    break;
                                }
                            }
                        }
                    }

                    // Strategy 2: Check siblings of price element
                    if (!itemName) {
                        let sibling = priceElement.previousElementSibling;
                        while (sibling && !itemName) {
                            if (sibling.textContent.trim()) {
                                itemName = sibling.textContent.trim();
                            }
                            sibling = sibling.previousElementSibling;
                        }
                    }

                    // Strategy 3: Look at parent's content
                    if (!itemName && priceElement.parentNode) {
                        const parentText = priceElement.parentNode.textContent
                            .replace(priceElement.textContent, "")
                            .trim();
                        if (parentText) {
                            itemName = parentText;
                        }
                    }
                }

                if (itemName) {
                    debugLog("Found item name for retry:", itemName);
                    // Store it for future use
                    priceElement.dataset.itemName = itemName;
                    // Try fetching again
                    fetchItemPrice(itemName, priceElement);
                } else {
                    debugLog("Could not find item name for retry");
                    priceElement.textContent = "Could not identify item";
                    Object.assign(priceElement.style, errorStyle);
                }
            } catch (e) {
                console.error("Error during retry:", e);
                debugLog("Error during retry:", e.message);
                priceElement.textContent = "Retry failed";
                Object.assign(priceElement.style, errorStyle);
            }
        };

        priceElement.appendChild(retryButton);
    }

    // Add custom findContains selector for jQuery-like functionality
    Element.prototype.matches =
        Element.prototype.matches || Element.prototype.msMatchesSelector;
    Element.prototype.closest =
        Element.prototype.closest ||
        function (selector) {
            let el = this;
            while (el) {
                if (el.matches(selector)) {
                    return el;
                }
                el = el.parentElement;
            }
            return null;
        };

    // Add jQuery-like :contains selector functionality
    document.querySelectorAll =
        document.querySelectorAll ||
        function (selector) {
            return Array.from(document.getElementsByTagName("*")).filter(
                function (el) {
                    return el.matches(selector);
                },
            );
        };

    // Add :contains selector support
    if (!HTMLElement.prototype.querySelectorAll) {
        HTMLElement.prototype.querySelectorAll = function (selector) {
            return document.querySelectorAll(selector);
        };
    }

    // Custom :contains selector implementation
    HTMLElement.prototype.querySelectorAllPatched = function (selector) {
        if (selector.includes(":contains")) {
            const parts = selector.split(":contains");
            const baseSelector = parts[0];
            const textToMatch = parts[1].match(/\((['"])(.*?)\1\)/)[2];

            const elements = Array.from(
                this.querySelectorAll(baseSelector || "*"),
            );
            return elements.filter((el) =>
                el.textContent.includes(textToMatch),
            );
        }
        return this.querySelectorAll(selector);
    };

    // Run initialization on page load and also when navigating between pages
    function setupInitialization() {
        debugLog("Setting up initialization");

        // Initial setup
        if (
            document.readyState === "complete" ||
            document.readyState === "interactive"
        ) {
            setTimeout(initialize, 1000);
        } else {
            window.addEventListener("DOMContentLoaded", function () {
                setTimeout(initialize, 1000);
            });
        }

        // Handle SPA navigation or dynamic content loading
        // Create a mutation observer to watch for large DOM changes that might indicate page navigation
        const bodyObserver = new MutationObserver(function (mutations) {
            let significantChanges = false;

            for (const mutation of mutations) {
                // If nodes were added or removed and they are element nodes
                if (
                    mutation.addedNodes.length > 3 ||
                    mutation.removedNodes.length > 3
                ) {
                    // Check if they're substantial elements (not just text nodes or comments)
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        if (
                            node.nodeType === Node.ELEMENT_NODE &&
                            (node.tagName === "DIV" ||
                                node.tagName === "SECTION" ||
                                node.querySelector("div, section"))
                        ) {
                            significantChanges = true;
                            break;
                        }
                    }
                }

                if (significantChanges) break;
            }

            if (significantChanges) {
                debugLog("Detected significant DOM changes, re-initializing");
                setTimeout(initialize, 500);
            }
        });

        // Observe changes to the body that might indicate page navigation
        bodyObserver.observe(document.body, {
            childList: true,
            subtree: false, // We only care about top-level changes to detect page navigation
        });

        // Also re-initialize on URL changes for SPAs
        let lastUrl = location.href;
        const urlObserver = new MutationObserver(function () {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                debugLog("URL changed, re-initializing");
                setTimeout(initialize, 500);
            }
        });

        // Observe changes to the URL
        urlObserver.observe(document, { subtree: true, childList: true });
    }

    // Start the initialization setup
    setupInitialization();
})();
