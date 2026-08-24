const messagePicker = {
  grab(auxiliary) {
    return new Promise(resolve => {
      let settled = false;

      const timeout = setTimeout(() => finish(null), 30000);

      function cleanup() {
        clearTimeout(timeout);
        document.removeEventListener('click', clickHandler, true);
        document.removeEventListener('keydown', keyHandler, true);
      }

      function finish(value) {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(value);
      }

      function keyHandler(e) {
        if (e.key === 'Escape') {
          finish(null);
        }
      }

      function clickHandler(e) {
        const message = e.target.closest('[id^="message-content-"], [id^="chat-messages-"]');
        if (message) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          try {
            const match = message.id.match(/message-content-(\d+)/) || message.id.match(/chat-messages-\d+-(\d+)/);
            finish(match?.[1] || null);
          } catch {
            finish(null);
          }
        }
      }
      document.addEventListener('click', clickHandler, true);
      document.addEventListener('keydown', keyHandler, true);
    });
  }
};

export default messagePicker;
