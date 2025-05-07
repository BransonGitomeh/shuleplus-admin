import React from "react";

class Footer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      deferredPrompt: null,
      showInstallButton: false,
    };
    this.installButtonRef = React.createRef(); // Ref for the button
  }

  componentDidMount() {
    window.addEventListener("beforeinstallprompt", this.handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", this.handleAppInstalled);

    // Check if already running as a PWA
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      this.setState({ showInstallButton: false }); // Already installed, hide button
    }
  }

  componentWillUnmount() {
    window.removeEventListener("beforeinstallprompt", this.handleBeforeInstallPrompt);
    window.removeEventListener("appinstalled", this.handleAppInstalled);
  }

  handleBeforeInstallPrompt = (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    this.setState({ deferredPrompt: e, showInstallButton: true });
    console.log("'beforeinstallprompt' event fired.");
  };

  handleAppInstalled = () => {
    console.log('ShulePlus Management Console was installed.');
    this.setState({ showInstallButton: false, deferredPrompt: null }); // Hide button after install
  }

  handleInstallClick = async () => {
    const { deferredPrompt } = this.state;
    if (!deferredPrompt) {
      console.log("Deferred prompt not available.");
      return;
    }

    // Show the prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    try {
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("User accepted the A2HS prompt");
      } else {
        console.log("User dismissed the A2HS prompt");
      }
    } catch (error) {
      console.error("Error with userChoice:", error);
    }

    // We've used the prompt, and can't use it again, discard it.
    // The `appinstalled` event will handle hiding the button if accepted.
    // If dismissed, we might want to keep the prompt available for a later attempt,
    // but for simplicity, we'll clear it here. Browsers usually have heuristics
    // about when to fire `beforeinstallprompt` again.
    if ((await deferredPrompt.userChoice).outcome !== "accepted") {
        this.setState({ deferredPrompt: null, showInstallButton: false }); // Clear prompt if dismissed
    }
  };

  render() {
    const { showInstallButton } = this.state;

    return (
      <div className="kt-footer kt-grid__item" id="kt_footer">
        <div className="kt-container ">
          <div className="kt-footer__copyright">
            {new Date().getFullYear()}  © 
            <a
              href="https://shuleplus.com" // Assuming shuleplus.com is the main site
              target="_blank"
              rel="noopener noreferrer" // Good practice for target="_blank"
              className="kt-link"
            >
              ShulePlus
            </a>
          </div>
          <div className="kt-footer__menu">
            {/* Existing menu items can go here if you uncomment them */}
            {showInstallButton && (
              <button
                ref={this.installButtonRef}
                onClick={this.handleInstallClick}
                className="kt-link" // Use existing styling or create a new one
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 10px', color: 'inherit' }} // Basic styling
              >
                Install App
              </button>
            )}
            {/* Example menu items:
            <a
              href="#"
              target="_blank"
              className="kt-link"
            >
              About
            </a>
            */}
          </div>
        </div>
      </div>
    );
  }
}

export default Footer;