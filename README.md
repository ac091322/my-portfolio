### PostCSS and PostCSS CLI
```bash
npm install postcss-cli cssnano --save-dev
```

## Minify `bootstrap.css` and generate source map (in css folder)
```bash
npx postcss bootstrap.css --map --output bootstrap.min.css
```

## Minify the `bootstrap.bundle.js` file (in js folder)
```bash
npx terser bootstrap.bundle.js -o bootstrap.bundle.min.js
```
