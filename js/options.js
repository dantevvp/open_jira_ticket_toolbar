function showErrorText(string) {
  removeError();

  var displayStatus = document.getElementById("status");

  newContent = document.createElement("div");
  var newDiv = displayStatus.appendChild(newContent);
  newDiv.setAttribute("id", "error");

  if (string === "need_url") {
    newDiv.textContent = "Please enter a URL!";
  } else if (string === "need_http") {
    newDiv.textContent = "Please enter http:// or https:// in your URL!";
  } else if (string === "need_project") {
    newDiv.textContent = "Please enter a valid default project!";
  }

  displayStatus.style.color = "red";
  setPreviewError();
  setTimeout(function () {
    newDiv.remove();
  }, 3000);
  throw "invalid";
}

function showSuccessText() {
  removeSuccess();
  // Need to generate a new div within status for the localization to work
  var displayStatus = document.getElementById("status");
  newContent = document.createElement("div");
  var newDiv = displayStatus.appendChild(newContent);
  newDiv.style.color = "#33cc33";
  newDiv.textContent = "Success!";
  setTimeout(function () {
    newDiv.remove();
  }, 3000);
}

function removeError() {
  if (document.getElementById("error")) {
    document.getElementById("error").remove();
  }
}

function removeSuccess() {
  if (document.getElementById("success")) {
    document.getElementById("success").remove();
  }
}

function setPreviewError() {
  var badOptionsText = document.getElementById("badOptions");
  badOptionsText.style.color = "red";
  badOptionsText.style.visibility = "visible";
  setTicketPreview("N/A", "red");
}

function setTicketPreview(string, color) {
  var ticketPreview = document.getElementById("ticketPreview");
  ticketPreview.style.color = color;
  ticketPreview.innerText = string;
}

function sanitizeURL() {
  // We are only removing the trailing slash for now.
  var input_url = document.getElementById("inputURL").value;

  if (isBlank(input_url)) {
    showErrorText("need_url");
  } else if (!checkHttp(input_url)) {
    showErrorText("need_http");
  }

  var trailing_regex = new RegExp("/+$", "ig");
  var sanitized_url = input_url.replace(trailing_regex, "");
  return sanitized_url;
}

function checkHttp(string) {
  var http_regex = new RegExp("^https?://.*$", "i");
  if (string.match(http_regex)) {
    return true;
  } else {
    return false;
  }
}

function sanitizeProject() {
  var input_default_project = document.getElementById(
    "inputDefaultProject"
  ).value;
  if (isBlank(input_default_project)) {
    showErrorText("need_project");
  }
  var only_text_regex = new RegExp("[a-z]+", "i");
  var sanitized_project = input_default_project.match(only_text_regex);
  return sanitized_project[0].toUpperCase();
}

function isBlank(string) {
  var trimString = string.trim();
  return !trimString || 0 === trimString.length;
}

// Saves options to chrome.storage.sync.
function save_options() {
  var input_url = sanitizeURL();
  var input_default_project = sanitizeProject();
  var input_language = document.getElementById("inputLanguageOptions").value;
  chrome.storage.sync.set(
    {
      useURL: input_url,
      useDefaultProject: input_default_project,
      useLanguage: input_language,
    },
    function () {
      // Update status to let user know options were saved.
      showSuccessText();
      restore_options();
    }
  );
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
// Defined values are defaults.
function restore_options() {
  var badOptionsText = document.getElementById("badOptions");
  badOptionsText.style.visibility = "hidden";
  chrome.storage.sync.get(
    {
      useURL: "http://jiraland.issues.com",
      useDefaultProject: "STACK",
      useLanguage: "en",
    },
    function (items) {
      document.getElementById("inputURL").value = items.useURL;
      document.getElementById("inputDefaultProject").value =
        items.useDefaultProject;
      document.getElementById("inputLanguageOptions").value = items.useLanguage;
      setTicketPreview(
        items.useURL + "/browse/" + items.useDefaultProject,
        "green"
      );
    }
  );
}

document.addEventListener("DOMContentLoaded", restore_options);
window.onload = function () {
  document.getElementById("save").addEventListener("click", save_options);
};
