(function () {
  if (window.__tpawCompatLoaded) {
    return;
  }
  window.__tpawCompatLoaded = true;

  function isElement(node) {
    return !!node && node.nodeType === 1;
  }

  function closePageReadPopup() {
    var wrappers = document.querySelectorAll('.screen-reader-popup-wrapper, .page-structure-popup-wrapper, .dictionary-popup-wrapper');
    wrappers.forEach(function (wrapper) {
      wrapper.classList.remove('active');
      wrapper.style.display = 'none';
      wrapper.setAttribute('aria-hidden', 'true');
    });
  }

  function bindCloseDelegation() {
    if (!document.body || document.body.dataset.tpawCompatCloseBound === '1') {
      return;
    }

    document.body.dataset.tpawCompatCloseBound = '1';
    document.body.addEventListener('click', function (event) {
      var target = event.target;
      if (!isElement(target)) {
        return;
      }

      if (
        target.closest('.popup-content-close') ||
        target.closest('.tpaw-popup-content-close') ||
        target.closest('#closeAccessibilityPopup')
      ) {
        closePageReadPopup();
      }
    });
  }

  function safeVoices() {
    if (!window.speechSynthesis || typeof window.speechSynthesis.getVoices !== 'function') {
      return [];
    }
    return (window.speechSynthesis.getVoices() || []).filter(function (voice) {
      return !!voice && !!voice.name;
    });
  }

  function populateVoiceOptions() {
    var select = document.getElementById('voiceOptions');
    if (!select) {
      return;
    }

    var voices = safeVoices();
    if (!voices.length) {
      return;
    }

    // If plugin already populated the dropdown, do not override it.
    if (select.options && select.options.length > 0) {
      return;
    }

    var preferred = select.value;
    select.innerHTML = '';

    voices.forEach(function (voice) {
      var option = document.createElement('option');
      option.value = voice.voiceURI || voice.name;
      option.textContent = voice.name + ' (' + voice.lang + ')';
      select.appendChild(option);
    });

    if (preferred) {
      select.value = preferred;
    }
    if (!select.value && select.options.length > 0) {
      select.selectedIndex = 0;
    }

    select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function bindPageReadRefresh() {
    if (!document.body || document.body.dataset.tpawCompatPageReadBound === '1') {
      return;
    }

    document.body.dataset.tpawCompatPageReadBound = '1';
    document.body.addEventListener('click', function (event) {
      var target = event.target;
      if (!isElement(target)) {
        return;
      }

      if (target.closest('.pageReadFeature')) {
        window.setTimeout(populateVoiceOptions, 80);
      }
    });
  }

  function init() {
    try {
      bindCloseDelegation();
      bindPageReadRefresh();
      populateVoiceOptions();
    } catch (_err) {
      // Never allow compat fallbacks to break plugin runtime.
    }
  }

  var observer = new MutationObserver(function () {
    init();
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (window.speechSynthesis) {
    var previousOnVoicesChanged = window.speechSynthesis.onvoiceschanged;
    window.speechSynthesis.onvoiceschanged = function (event) {
      if (typeof previousOnVoicesChanged === 'function') {
        previousOnVoicesChanged.call(window.speechSynthesis, event);
      }
      populateVoiceOptions();
    };
  }

  var retries = 0;
  var timer = window.setInterval(function () {
    retries += 1;
    populateVoiceOptions();
    if (retries > 30) {
      window.clearInterval(timer);
    }
  }, 250);

  init();
})();
