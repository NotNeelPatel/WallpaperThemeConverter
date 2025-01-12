# Contributing to Wallpaper Theme Converter

Thank you for considering contributing to Wallpaper Theme Converter!

## How to Contribute

1. **Fork the repository**: Click the "Fork" button at the top right of the repository page.
2. **Clone your fork**:
    ```sh
    git clone https://github.com/your-username/WallpaperThemeConverter.git
    ```
3. **Create a branch**:
    ```sh
    git checkout -b your-branch-name
    ```
4. **Make your changes**: Implement your feature or bug fix.
5. **Commit your changes**:
    ```sh
    git commit -m "Description of your changes"
    ```
6. **Push to your fork**:
    ```sh
    git push origin your-branch-name
    ```
7. **Create a Pull Request**: Go to the original repository and click "New Pull Request".

## Reporting Issues

If you find a bug or have a feature request, please open an issue on GitHub. Provide as much detail as possible to help us understand and address the issue.

## Adding a Theme

To add a theme, you need to modify three files:

-   [index.html](index.html)
-   [themes.json](./assets/themes.json)
-   [README.md](README.md)

### Changes in index.html

Follow the `<!-- For Developers:` comments.

### Changes in themes.json

[themes.json](./assets/themes.json) contains a JS object that has the following structure:

```js
{
    "Theme": [
        r,g,b,
        r,g,b,
        r,g,b,
        ...
        r,g,b
        ],
    ...
    "Theme": [
        r,g,b,
        r,g,b,
        ...
        r,g,b
        ]
}
```

Each r,g, and b value is stored one after another in an array of integers, where r,g,b represents one colour of the theme.

Please ensure that the order remains the same as listed in index.html. Add your palette in r,g,b values.

### Changes in README.md

Please add the theme name in the README with a link to the GitHub repository of the theme.

## Contributing Elsewhere

Feel free to modify whatever you'd like in addition to adding themes. Styling, changing the layout, optimizing JS, etc. is welcome. Please ensure that you explain these kinds of changes in detail when opening a PR.
