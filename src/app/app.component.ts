import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements AfterViewInit {
  private readonly pluginScriptId = 'tpaw-plugin-script';
  private readonly pluginCompatScriptId = 'tpaw-plugin-compat-script';
  private closeFallbackBound = false;

  constructor() {}

  ngAfterViewInit(): void {
    this.bindGlobalPageReadCloseFallback();
    this.loadAccessibilityPluginWhenViewReady();
  }

  private bindGlobalPageReadCloseFallback(): void {
    if (this.closeFallbackBound) {
      return;
    }

    this.closeFallbackBound = true;
    document.addEventListener(
      'click',
      (event: Event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
          return;
        }

        if (!target.closest('.popup-content-close, .tpaw-popup-content-close, #closeAccessibilityPopup')) {
          return;
        }

        this.forceClosePageReadPopups();
      },
      true,
    );
  }

  private forceClosePageReadPopups(): void {
    const wrappers = document.querySelectorAll(
      '.screen-reader-popup-wrapper, .page-structure-popup-wrapper, .dictionary-popup-wrapper',
    );

    wrappers.forEach((wrapper) => {
      wrapper.classList.remove('active');
      (wrapper as HTMLElement).style.display = 'none';
      wrapper.setAttribute('aria-hidden', 'true');
    });
  }

  private loadAccessibilityPluginWhenViewReady(): void {
    const maxAttempts = 25;
    let attempts = 0;

    const tryLoad = () => {
      attempts += 1;

      const hasRenderableContent = !!document.querySelector('ion-router-outlet .ion-page, ion-router-outlet ion-content');
      if (hasRenderableContent) {
        this.injectAccessibilityPluginScript();
        return;
      }

      if (attempts < maxAttempts) {
        window.setTimeout(tryLoad, 200);
      }
    };

    window.setTimeout(tryLoad, 0);
  }

  private injectAccessibilityPluginScript(): void {
    if (document.getElementById(this.pluginScriptId)) {
      this.injectAccessibilityCompatScript();
      return;
    }

    const script = document.createElement('script');
    script.id = this.pluginScriptId;
    script.src = 'assets/js/tpaw-plugin.js';
    script.async = false;
    script.onload = () => this.injectAccessibilityCompatScript();
    document.body.appendChild(script);
  }

  private injectAccessibilityCompatScript(): void {
    if (document.getElementById(this.pluginCompatScriptId)) {
      return;
    }

    const compatScript = document.createElement('script');
    compatScript.id = this.pluginCompatScriptId;
    compatScript.src = 'assets/js/tpaw-plugin-compat.js';
    compatScript.async = false;
    document.body.appendChild(compatScript);
  }
}
