(function () {
  "use strict";

  function placeCreditBar() {
    var bar = document.getElementById("paintz-credit-bar");
    if (!bar || bar.dataset.placed === "true") return;

    var anchor =
      document.querySelector(".copyright-section") ||
      document.querySelector("footer");

    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(bar, anchor.nextSibling);
    }

    bar.dataset.placed = "true";
  }

  function watch() {
    placeCreditBar();
    if (document.getElementById("paintz-credit-bar")) return;

    var obs = new MutationObserver(function () {
      if (document.getElementById("paintz-credit-bar")) {
        placeCreditBar();
        obs.disconnect();
      }
    });
    obs.observe(document.body, { childList: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watch);
  } else {
    watch();
  }
})();
