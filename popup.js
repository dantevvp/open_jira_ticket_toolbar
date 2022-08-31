const form = document.getElementById("ticket-form");
const inputTicket = document.getElementById("ticket");
const statusMessage = document.getElementById("status");
const ERROR_INVALID = "INVALID";

form.addEventListener("submit", handleFormSubmit);

async function handleFormSubmit(event) {
  event.preventDefault();

  clearStatusMessage();

  openNewTicket(inputTicket.value, "toolbar");

  // let url = stringToUrl(input.value);
  // if (!url) {
  //   setMessage("Invalid URL");
  //   return;
  // }

  // let message = await deleteDomainCookies(url.hostname);
  // setMessage(message);
}

function isDefaultProject(string) {
  // If there are only numbers at the beginning, we can assume this is a default project
  // There is a chance someone could type in 123BAD, but it will default to STACK-123
  // I think this is okay, since 123BAD is considered invalid.
  // We can add more error handling if needed
  var regex = new RegExp("(^\\d+)", "i");
  var isDefault = string.match(regex);

  if (isDefault) {
    return true;
  } else {
    return false;
  }
}

function sanitizeTicket(userInput) {
  /* JIRA tickets only takes [a-z], -, _, d+
   We currently only - configurations
   JIRA can support a few different prefix styles such as R2D2 and R2_D2_D3 prefixes.
   TODO: Add support for variants outside of standard a-z ticket prefixes
   Potential solution - [a-z]([a-z0-9_]{0,})-\d+ , but this will break core23-23 or semiTicket only
    detection.
    Supporting documentation - https://confluence.atlassian.com/adminjiraserver071/changing-the-project-key-format-802592378.html
   */

  // User input should be trimmed before it gets to this stage. We trim it again anyways.
  var cleanUserInput = userInput.trim();

  var fullTicketRegex = new RegExp("([a-z]{1,}-\\d+)", "i");
  var semiTicketRegex = new RegExp("([a-z]{1,}\\d+)", "i");

  var spaceTicketRegex = new RegExp("([a-z]{1,}(\\s+)\\d+)", "i");

  var numbersOnlyRegex = new RegExp("(\\d+)", "i");

  var fullTicketText = cleanUserInput.match(fullTicketRegex);

  if (fullTicketText) {
    return fullTicketText[0];
  } else if (cleanUserInput.match(semiTicketRegex)) {
    var semiTicket = cleanUserInput.match(semiTicketRegex)[0];
    var jprojectRegex = new RegExp("([a-z]{1,})", "i");
    var jprojectText = semiTicket.match(jprojectRegex);
    var jprojectNumber = semiTicket.match(numbersOnlyRegex);
    //Form ticket
    var ticketID = jprojectText[0].concat("-", jprojectNumber[0]);
    return ticketID;
  } else if (cleanUserInput.match(spaceTicketRegex)) {
    return cleanUserInput.replace(/\s+/g, "-");
  } else if (cleanUserInput.match(numbersOnlyRegex)) {
    var defaultTicket = cleanUserInput.match(numbersOnlyRegex);
    return defaultTicket[0];
  } else {
    return "invalid ticket";
  }
}

function displayError(error_type) {
  if (error_type === ERROR_INVALID)
  {
    showStatusMessage("Invalid ticket entered.");
  } else {
    showStatusMessage("Unhelpful error.");
  }

  // Prevent from searching invalid tickets
  throw "invalid";
}

function openNewTicket(ticket, sourceType) {
  var ticket_uppercase = ticket.toUpperCase();

  var sanitizedTicket = sanitizeTicket(ticket_uppercase);
  // Error display should only show up at the toolbar level
  if (sanitizedTicket === "invalid ticket" && sourceType === "toolbar") {
    displayError(ERROR_INVALID);
  }

  chrome.storage.sync.get(function (items) {
    var url = items.useURL;
    var defaultProject = items.useDefaultProject;
    var sanitizedTicket = sanitizeTicket(ticket_uppercase);

    if (isDefaultProject(ticket_uppercase)) {
      var formURL = url + "/browse/" + defaultProject + "-" + sanitizedTicket;
      var formHref =
        "<a href='" +
        formURL +
        "'>" +
        defaultProject +
        "-" +
        sanitizedTicket +
        "</a>";
      console.log(formURL);

      saveHistory(sanitizedTicket);
      chrome.tabs.create({ url: formURL });

    } else {
      var ticketURL = url + "/browse/" + sanitizedTicket;

      saveHistory(sanitizedTicket);
      chrome.tabs.create({ url: ticketURL });


    }
  }); //end get sync

} //end openNewTicket

function removeElement(element_id) {
  document.getElementById(element_id).remove();
} //end hideElement

function displayDefaultTicket() {
  chrome.storage.sync.get(function (items) {
    var display = document.getElementById("displayDefaultTicket");
    if (display === null) {
      console.log("ERROR: Unable to find display ticket.");
    } else {
      // Remove unused elements and display error message
      if (
        items.useDefaultProject === undefined ||
        items.useDefaultProject === null
      ) {
        // Localize error message - Default will be English (unlikely to be used outside of en).
        display.setAttribute("data-localize", "toolbar_req_project_msg");
        display.style.color = "red";
        display.style.fontSize = "18px";
        document.getElementById("ticket").setAttribute("disabled", true);
        removeElement("default_project_text");
        removeElement("colon");
        removeElement("history_title");
        // loadLocalization();
      } else {
        display.innerText = items.useDefaultProject;
        display.placeholder = items.useDefaultProject;
      }
    }
  }); //end sync
} //end displayDefaultTicket

async function retrieveHistory() {
  // Set default useHistory if undefined
  chrome.storage.sync.get(
    { userHistory: [], useURL: "default", favoritesList: [] },
    function (items) {
      let historyStorage = items.userHistory;
      let url = items.useURL;
      // var favoritesList = items.favoritesList;
      console.log(historyStorage);

      let historyList = document.getElementById("historyList");

      // var tmpFavorites = [];

      // // Push the favorites to the top - do this at the end, we can sort by ascending in the favorites
      // for (var i = 0; i < favoritesList.length; i++) {
      //   ticket = historyStorage.indexOf(favoritesList[i]);
      //   if (ticket >= 0) {
      //     // Add items to a temporary favorites list
      //     tmpFavorites.push(favoritesList[i]);
      //     // Remove item from primary list
      //     historyStorage.splice(ticket, 1);
      //   }
      // }

      // // Reorder the favorites to be in ascending order, then add them into the primary list
      // if (tmpFavorites) {
      //   tmpFavorites.sort(compareTicketValues);
      //   tmpFavorites.reverse();
      //   for (var k = 0; k < tmpFavorites.length; k++) {
      //     historyStorage.unshift(tmpFavorites[k]);
      //   }
      // }

      // historyStorage.push("test-3131");
      // historyStorage.push("test-22");

      // console.log(historyStorage);

      // Update the list after reordering favorites. This prevents regular items from ending up in random spots.
      // chrome.storage.sync.set({ userHistory: historyStorage }, function () {});

      // let langs = ['TypeScript','HTML','CSS'];

      // let nodes = langs.map(lang => {
      //   let li = document.createElement('li');
      //   let a = document.createElement('a');
      //   a.setAttribute('href', 'https://www.google.com/');
      //   a.target = "_blank";
      //   a.textContent = lang;
      //   li.appendChild(a)
      //   return li;
      // });

      // console.log(formURL("test-123"));

          // var formURL = items.useURL + "/browse/" + item;

          // a.textContent = item;
          // a.setAttribute("href", formURL);
          // a.setAttribute("class", "valid");

      // historyList.append(...nodes);
      let rows = historyStorage.map((ticketID) => {
        let ticketURL = formURL(url, ticketID)
        let li = document.createElement("li");
        let a = document.createElement("a");
        a.setAttribute("href", ticketURL);
        a.target = "_blank";
        a.textContent = ticketID;
        li.appendChild(a);
        return li;
      });
      console.log(historyStorage);
      console.log(historyList);

      historyList.append(...rows);

      // async () => {
      //   await JHistoryService.savePage("yoJira", "url");

      //   let b = await JHistoryService.getPages();
      //   console.log("test jira service");
      //   console.log(b);
      // };

      // Build history list
      // historyStorage.forEach(function (item) {
      //   var li = document.createElement("li");
      //   var a = document.createElement("a");

      //   if (item.includes("Invalid ticket:")) {
      //     // Limit the length for invalid tickets
      //     if (item.length > 25) {
      //       a.textContent = item.substr(0, 25) + "...'";
      //       a.setAttribute("title", item);
      //       a.setAttribute("class", "invalid");
      //       li.appendChild(a);
      //     } else {
      //       li.setAttribute("class", "invalid");
      //       li.textContent = item;
      //     }
      //   } else {
      //     // Only add href to valid tickets
      //     var formURL = items.useURL + "/browse/" + item;

      //     a.textContent = item;
      //     a.setAttribute("href", formURL);
      //     a.setAttribute("class", "valid");

      //     li.setAttribute("id", item);

      //     if (favoritesList.indexOf(item) > -1) {
      //       li.setAttribute("class", "fav");
      //     } else {
      //       li.setAttribute("class", "unmarked");
      //     }

      //     a.target = "_blank";
      //     li.appendChild(a);
      //   }

      //   if (historyList === null) {
      //     console.log("Missing history list. Unable to append history.");
      //   } else {
      //     historyList.appendChild(li);
      //   }
      // }); //end foreach
    }
  ); //end get sync
} //end retrieveHistory

function compareTicketValues(a, b) {
  tmpA = Number(a.match(/\d+/g)[0]);
  tmpB = Number(b.match(/\d+/g)[0]);

  if (tmpA < tmpB) {
    return -1;
  } else if (tmpA > tmpB) {
    return 1;
  } else {
    return 0;
  }
} //end compareTicketValues

function saveHistory(userStringInput) {
  chrome.storage.sync.get(
    { userHistory: [], useDefaultProject: "PL" },
    function (result) {
      let userHistory = result.userHistory;
      let defaultProject = result.useDefaultProject
      let historyText;

      historyText = getFullJiraID(defaultProject, userStringInput);

      if (historyText === false) {
        return "Invalid ticket: '" + userStringInput + "'";
      }

      let checkTicketIndex = userHistory.indexOf(historyText);
      // Check if string is in index, if so. Remove it first, then add it back in later.
      if (checkTicketIndex > -1) {
        // Remove only 1 instance in the array
        userHistory.splice(checkTicketIndex, 1);
      }

      //Add ticket to the top of the list. We intend for these items to be after favorites.
      userHistory.unshift(historyText);

      // Pop the last item in the list
      while (userHistory.length > 10) {
        userHistory.pop();
      }

      chrome.storage.sync.set({ userHistory: userHistory }, function () {});
    }
  ); //end get sync
} //end saveHistory

function getFullJiraID(defaultProject, ticket) {
  let sanitizedTicket = sanitizeTicket(ticket);

  if (ticket === "invalid ticket") {
    return false;
  } else {
    // Add default project to history
    if (isDefaultProject(sanitizedTicket)) {
      let fullProjectText = defaultProject + "-" + sanitizedTicket;
      return fullProjectText;
    } else {
      return sanitizedTicket;
    }
  }
}

function favoritesListener() {
  // register click event listener
  document
    .querySelector("#historyList")
    .addEventListener("click", function (e) {
      chrome.storage.sync.get({ favoritesList: [] }, function (items) {
        // get list id, if its not in the list add it on click
        var id = e.target.id;
        var item = e.target;
        var index = items.favoritesList.indexOf(id);

        // return if target doesn't have an id - this prevents invalid ids from being saved
        if (!id) return;

        // favorite item if not in stored list, but only accept a maximum of 5
        if (index === -1) {
          if (items.favoritesList.length < 5) {
            items.favoritesList.push(id);
            item.className = "fav";
          } else {
            displayError("max_favorite_error");
          }
          // unmark favorited item
        } else {
          items.favoritesList.splice(index, 1);
          item.className = "unmarked";
        }

        // prevent overpopulating list - this can occur during initial load
        var savedFavoritesList = items.favoritesList.slice(0, 5);

        //store the latest list
        chrome.storage.sync.set(
          { favoritesList: savedFavoritesList },
          function () {}
        );
      }); //chrome sync get end
    }); //addListender end
} //end favoritesListener

// document.addEventListener("keydown", function (key) {
//   // Keycode 13 is Enter - Reference: https://css-tricks.com/snippets/javascript/javascript-keycodes/
//   if (key.keyCode === 13) {
//     var userInput = document.getElementById("ticket").value;
//     openNewTicket(userInput.trim(), "toolbar");
//   }
// });

chrome.runtime.onConnect.addListener(() => {
  try {
    displayDefaultTicket();
    retrieveHistory();
    // favoritesListener();
    // loadLocalization();
  } catch (e) {
    console.log("qunit - ignore global exception");
  }
});

window.addEventListener("load", function () {
  try {
    displayDefaultTicket();
    retrieveHistory();
    // favoritesListener();
    // loadLocalization();
  } catch (e) {
    console.log("qunit - ignore global exception");
  }
}); //load eventlistener end

function reddenPage() {
  document.body.style.backgroundColor = "white";
}

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: reddenPage,
  });
});

try {
  chrome.omnibox.onInputEntered.addListener(function (userInput) {
    openNewTicket(userInput.trim(), "omnibox");
  }); //end listener
} catch (e) {
  console.log("qunit - ignore global exception");
}

function showStatusMessage(str) {
  setStatusMessage(str);
  setTimeout(function () {
    clearStatusMessage();
  }, 5000);
}

function setStatusMessage(str) {
  statusMessage.textContent = str;
  statusMessage.hidden = false;
}

function clearStatusMessage() {
  statusMessage.hidden = true;
  statusMessage.textContent = "";
}

function formURL(url, ticket) {
  //TODO - verify ticket is valid
  return url + "/browse/" + ticket;
}