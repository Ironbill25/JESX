// JESX
// (c) 2025 IronBill25
// Licensed under the MIT license. See LICENSE.txt for details.

/**
 * JESX: A lightweight JavaScript framework for simple, dependency-free web apps.
 *
 * Main features:
 * - Component-based architecture using plain JavaScript classes
 * - Simple configuration for styles, themes, and global components
 * - Routing via URL hash
 * - Supports global headers/footers, per-page components, and reactivity helpers
 * - Minimal and direct DOM manipulation, zero dependencies
 */
class JESX {
    /**
     * Creates a new JESX instance.
     * Initializes default configuration and sets up style tracking.
     */
    constructor() {
        /**
         * Framework configuration.
         * @type {Object}
         */
        this.config = {
            title: "Site",
            ui: {
                theme: 'light'
            },
            style: null,
            styles: [],
            global: {
                headers: [],
                footers: [],
                pages: ['*'] // header and footer are on all pages
            },
            pages: {}
        };

        /**
         * Tracks loaded stylesheet URLs to prevent duplicates.
         * @type {Set<string>}
         */
        this.loadedStyles = new Set();
    }

    /**
     * Adds the default styles to the page. Used internally.
     */
    addDefaultStyles() {
        if (!this.loadedStyles.has('defaultstyles.css')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'defaultstyles.css';
            document.head.appendChild(link);
            this.loadedStyles.add('defaultstyles.css');
        }
    }

    /**
     * Adds a single stylesheet to the page.
     * Not recommended for use outside of the framework;
     * Instead, add a style to your website config.
     * 
     * @param {string} url - The URL of the stylesheet
     */
    addStyle(url) {
        if (!this.loadedStyles.has(url)) { // No duplicate stylesheets
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            document.head.appendChild(link);
            this.loadedStyles.add(url);
        }
    }

    /**
     * Adds an inline CSS stylesheet to the page.
     * Not recommended for use outside of the framework;
     * Instead, add an inline style to your website config.
     * 
     * @param {string} css - The CSS code to add
     */
    addInlineStyle(css) {
        // Prevents duplicate inline styles
        if (![...document.head.querySelectorAll('style')].some(style => style.textContent === css)) {
            const style = document.createElement('style');
            style.textContent = css;
            document.head.appendChild(style);
        }
    }

    /**
     * Adds multiple stylesheets to the page.
     * Not recommended for use outside of the framework;
     * Instead, add the styles to your website config.
     * 
     * @param {string[]} urls - Array of stylesheet URLs
     */
    addStyles(urls) {
        urls.forEach(url => this.addStyle(url));
    }

    /**
     * Sets your website's configuration.
     * 
     * @param {Object} config - The configuration object
     * @param {string} config.title - The application/page title
     * @param {Object} config.ui - UI configuration
     * @param {string} config.ui.theme - The theme (light or dark)
     * @param {string} config.style - Single stylesheet URL
     * @param {string[]} config.styles - Array of stylesheet URLs
     * @param {string} config.inlineStyle - Inline CSS code (not recommended)
     * @param {Object} config.global - Global components configuration
     * @param {Function[]} config.global.headers - Array of header component classes
     * @param {Function[]} config.global.footers - Array of footer component classes
     * @param {string[]} config.global.pages - Array of pages to apply global components to. Use '*' to have them on all pages.
     * @param {Object} config.pages - Page routing configuration.
     * @returns {JESX} The JESX instance for chaining
     */
    cfg(config) {
        Object.assign(this.config, config);

        // Apply theme
        if (this.config.ui && this.config.ui.theme) {
            document.body.setAttribute('data-theme', this.config.ui.theme);
        }

        // Add style if provided
        if (this.config.style) {
            this.addStyle(this.config.style);
        }

        // Add styles if provided
        if (this.config.styles && Array.isArray(this.config.styles)) {
            this.addStyles(this.config.styles);
        }

        // Add inline style if provided
        if (this.config.inlineStyle) {
            this.addInlineStyle(this.config.inlineStyle);
        }

        return this;
    }

    /**
     * Creates a DOM element or component instance.
     * 
     * @param {string|Function} tag - The HTML tag name or component class
     * @param {Object} [props] - Element properties
     * @param {...any} children - Child elements, text, or arrays (variadic)
     * @returns {Element} The created DOM element or component instance
     */
    createElement(tag, props, ...children) {
        // If tag is a component class, create a new instance with props as the first argument
        if (typeof tag === 'function') {
            const instance = new tag(props);
            return instance.render();
        }

        // If props has an id, store the original template for rcmp
        let nodeId = props && props.id;
        if (nodeId && !__jesx_templates_raw[nodeId]) {
            __jesx_templates_raw[nodeId] = { tag, props, children };
        }

        const element = document.createElement(tag);

        // Set attributes
        if (props) {
            Object.entries(props).forEach(([key, value]) => {
                if (key === 'class' && typeof value === 'object') {
                    // Allows passing an object for conditional class names
                    Object.entries(value).forEach(([className, enabled]) => {
                        if (enabled) element.classList.add(className);
                    });
                } else if (key === 'style' && typeof value === 'object') {
                    // Allows passing an object for inline styles
                    Object.entries(value).forEach(([prop, val]) => {
                        element.style[prop] = val;
                    });
                } else {
                    element.setAttribute(key, value);
                }
            });
        }

        // Helper to flatten children and process templates (J{...})
        function evalTemplate(str) {
            return str.replace(/J\{([^}]+)\}/g, (_, expr) => {
                try {
                    // Evaluate in window/global context.
                    return Function('return ' + expr)();
                } catch (e) {
                    return 'undefined';
                }
            });
        }
        function appendChild(child) {
            if (Array.isArray(child)) {
                child.forEach(appendChild);
            } else if (typeof child === 'string' || typeof child === 'number') {
                element.appendChild(document.createTextNode(evalTemplate(String(child))));
            } else if (child instanceof Node) {
                element.appendChild(child);
            } else if (child != null) {
                element.appendChild(document.createTextNode(String(child)));
            }
        }
        children.forEach(appendChild);

        return element;
    }

    /**
     * Renders a component instance.
     * 
     * @param {Function} component - The component class to render
     * @returns {Element|Array<Element>} The rendered component
     */
    renderComponent(component) {
        const instance = new component();
        return instance.render();
    }

    /**
     * Gets the current route from the URL hash.
     * 
     * @returns {string} The current route path
     */
    getCurrentRoute() {
        // Handles empty hash for home
        const hash = window.location.hash.slice(1);
        return hash ? "/" + hash : "/";
    }

    /**
     * Checks if a page should have global components.
     * 
     * @param {string} page - The page path to check
     * @returns {boolean} Whether the page should have global components
     */
    shouldHaveGlobal(page) {
        const globalPages = this.config.global.pages;
        return globalPages.includes('*') || globalPages.includes(page);
    }

    /**
     * Gets the global headers for a page.
     * 
     * @param {string} page - The page path to get headers for
     * @returns {Function[]} Array of header component classes
     */
    getGlobalHeaders(page) {
        if (!this.shouldHaveGlobal(page)) return [];
        return this.config.global.headers;
    }

    /**
     * Gets the global footers for a page.
     * 
     * @param {string} page - The page path to get footers for
     * @returns {Function[]} Array of footer component classes
     */
    getGlobalFooters(page) {
        if (!this.shouldHaveGlobal(page)) return [];
        return this.config.global.footers;
    }

    /**
     * Renders the entire application.
     */
    renderApp() {
        const route = this.getCurrentRoute();
        const component = this.config.pages.hasOwnProperty(route) ? this.config.pages[route] : this.config.pages['/'];
        if (typeof component !== 'function') {
            console.error(`Invalid component for route: ${route}`);
            return; // Exit rendering if the component is invalid
        }

        let root = document.getElementById('app');

        // Create app container if it doesn't exist
        if (!root) {
            root = j("div", { id: "app" });
            document.body.appendChild(root);
        }

        if (component) {
            const content = this.renderComponent(component);

            // Add styles if they haven't been added yet
            if (!this.loadedStyles.has('defaultstyles.css')) {
                this.addDefaultStyles();
            }
            if (this.config.style && !this.loadedStyles.has(this.config.style)) {
                this.addStyle(this.config.style);
            }
            if (this.config.styles) {
                this.config.styles.forEach(url => {
                    if (!this.loadedStyles.has(url)) {
                        this.addStyle(url);
                    }
                });
            }

            // Clear existing content
            root.innerHTML = '';

            // Create main container
            const main = j("div", { class: "main-content" });

            // Add headers if configured
            const headers = this.getGlobalHeaders(route);
            headers.forEach(HeaderClass => {
                const header = this.renderComponent(HeaderClass);
                root.appendChild(header);
            });

            // Add main content
            if (Array.isArray(content)) {
                content.forEach(element => main.appendChild(element));
            } else {
                main.appendChild(content);
            }
            root.appendChild(main);

            // Add footers if configured
            const footers = this.getGlobalFooters(route);
            footers.forEach(FooterClass => {
                const footer = this.renderComponent(FooterClass);
                root.appendChild(footer);
            });
        }
    }

    /**
     * Re-render a component by ID using its original template.
     * @param {string} id - The DOM id of the node to re-render
     */
    rcmp(id) {
        const node = document.getElementById(id);
        if (!node) return;
        const parent = node.parentNode;
        if (!parent) return;
        const tpl = __jesx_templates_raw[id];
        if (!tpl) return;
        const newNode = j(tpl.tag, tpl.props, ...tpl.children);
        parent.replaceChild(newNode, node);
    }
}

// Template registry for rcmp
const __jesx_templates_raw = {}; // id: { tag, props, children }

// Create the singleton instance
let instance = new JESX();

/** 
 * The main j() function.
 * 
 * Usage:
 *   j("div", {id: "foo"}, "Hello");
 *   j("cfg", configObj); // configure
 *   j("render"); // render all
 *   j("rcmp", id); // rerender component by id
 */
function j(...args) {
    switch (args[0]) {
        case 'cfg': // Config function
            return instance.cfg(args[1]);
        case 'render': // Render all
            return instance.renderApp();
        case 'rcmp': // Re-render component, useful for updating a specific component with templates ( J{...} )
            return instance.rcmp(args[1]);
        default:
            // Fix: pass all children, not just the third argument
            return instance.createElement(args[0], args[1], ...args.slice(2));
    }
}

/**
 * Utility class, exposed as j.u
 */
j.u = class jesxUtils {
    /**
     * Exposes a variable to the global scope, useful in onclick handlers
     * 
     * @param {string} name - The name of the variable, will be accessible as window[name]
     * @param {any} val - The value of the variable
     */
    static expose(name, val) {
        window[name] = val;
    }
}

// Keybinds for accessibility, ctrl+< (ctrl+shift+,) and ctrl+> (ctrl+shift+.) navigate back and forward
document.addEventListener('keydown', (e) => {
    if (e.key === '<' && e.ctrlKey) { // No need for "&& e.shiftKey" because "<" is shift+,
        history.back();
    }
    if (e.key === '>' && e.ctrlKey) { // Same with this
        history.forward();
    }
});

export { j, JESX };

/**
 * Initialize the app after DOM load,
 * and re-render on hash change for routing.
 */
document.addEventListener('DOMContentLoaded', () => {
    instance.renderApp();

    // Handle hash changes
    window.addEventListener('hashchange', () => {
        instance.renderApp();
    });
});