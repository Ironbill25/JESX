# JESX
### JavaScript Efficient webSite eXperience

>*The Web doesn't need a thousand dependencies, it needs sanity.*

JESX is a lightweight JavaScript framework designed to make web development easier. <br>
It simplifies the website-making experience by letting you code **all of it** in *one* language – JavaScript.

---

## Features

- **Component-Based**: Build your UI as reusable JS components.
- **No Build Step**: Works with vanilla JavaScript – no bundler or transpiler needed.
- **Reactive State**: Simple state management without complex APIs.
- **Lightweight**: Zero dependencies, minimal footprint.
- **Direct DOM Manipulation**: Fast updates with predictable behavior.

---

## Getting Started

### How to Install

You can use JESX by including it in your website. <br>
No NPM or no build tools required.

#### Download

Download the latest release from [Releases](https://github.com/Ironbill25/JESX/releases). <br>
**IMPORTANT: Don't use JESX with a <script> tag. Instead, import the JESX class and the j() function in your script.**

---

## Core API

- **JESX.component(name, factoryFn)**  
  Register a new component.  
  - `name` (string): Component name  
  - `factoryFn` (function): Returns HTML template

- **JESX.render(name, mountPoint, props?)**  
  Renders a component to a DOM node.  
  - `name` (string): Registered component name  
  - `mountPoint` (Element): Target DOM node  
  - `props` (optional): Initial properties

- **JESX.html**  
  Tagged template for building DOM nodes.

- **this.update()**  
  (Inside a component) Re-render the component.

---

## Documentation

- [Getting Started Guide](docs/GETTING_STARTED.md)
- [Component System](docs/COMPONENTS.md)
- [API Reference](docs/API.md)
- [Examples](examples/)

---

## Contributing

Contributions are welcome!  
Feel free to open issues or submit pull requests with improvements or bug fixes.

---

## License

This project is licensed under the [MIT License](LICENSE.txt).

---

## Acknowledgements

- Inspired by simplicity and minimalism in web development.
- Thanks to everyone who values sanity over bloat!
